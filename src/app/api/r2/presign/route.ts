import { NextResponse } from "next/server";
import { getUser, getUserRoles } from "@/lib/supabase/server";

const STAFF_ROLES = ["editor", "content_manager", "administrator", "super_administrator"];
const MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2GB per file cap

// --- SigV4 helpers (Web Crypto, no dependencies) ---

async function sha256Hex(data: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacRaw(key: ArrayBuffer | string, data: string): Promise<ArrayBuffer> {
  const keyBuf = typeof key === "string" ? new TextEncoder().encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuf,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}

async function hmacHex(key: ArrayBuffer, data: string): Promise<string> {
  const sig = await hmacRaw(key, data);
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Build an S3-compatible presigned PUT URL (works with Cloudflare R2). */
async function presignedPutUrl(opts: {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  key: string;
  expiresIn: number;
}): Promise<string> {
  const { accountId, accessKeyId, secretAccessKey, bucket, key, expiresIn } = opts;
  const region = "auto";
  const service = "s3";
  const host = `${accountId}.r2.cloudflarestorage.com`;

  const now = new Date();
  const amzDate =
    now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const signedHeaders = "host";

  const canonicalUri = `/${bucket}/${key.split("/").map(encodeURIComponent).join("/")}`;
  const canonicalQuerystring = [
    "X-Amz-Algorithm=AWS4-HMAC-SHA256",
    `X-Amz-Credential=${encodeURIComponent(`${accessKeyId}/${credentialScope}`)}`,
    `X-Amz-Date=${amzDate}`,
    `X-Amz-Expires=${expiresIn}`,
    `X-Amz-SignedHeaders=${signedHeaders}`,
  ].join("&");
  const canonicalHeaders = `host:${host}\n`;
  const payloadHash = "UNSIGNED-PAYLOAD";

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQuerystring,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = await hmacRaw(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = await hmacRaw(kDate, region);
  const kService = await hmacRaw(kRegion, service);
  const kSigning = await hmacRaw(kService, "aws4_request");
  const signature = await hmacHex(kSigning, stringToSign);

  return `https://${host}${canonicalUri}?${canonicalQuerystring}&X-Amz-Signature=${signature}`;
}

/**
 * POST /api/r2/presign
 * Returns a presigned PUT URL for direct browser upload to Cloudflare R2.
 * Staff-only. Used for large video files that exceed Supabase's free-tier limits.
 *
 * Body: { filename: string, contentType: string, size: number, prefix?: string }
 * Returns: { uploadUrl, publicUrl }  (or 501 when R2 is not configured)
 */
export async function POST(req: Request) {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    return NextResponse.json({ error: "R2 not configured" }, { status: 501 });
  }

  // Staff-only
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const roles = await getUserRoles();
  if (!roles.some((r) => STAFF_ROLES.includes(r))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { filename?: string; contentType?: string; size?: number; prefix?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { filename, size } = body;
  const prefix = (body.prefix || "videos/").replace(/[^a-zA-Z0-9/_-]/g, "");
  if (!filename || typeof size !== "number" || size <= 0 || size > MAX_BYTES) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${prefix}${Date.now()}-${safe}`;

  const uploadUrl = await presignedPutUrl({
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    key,
    expiresIn: 900, // 15 min
  });

  return NextResponse.json({
    uploadUrl,
    publicUrl: `${publicUrl.replace(/\/$/, "")}/${key}`,
  });
}
