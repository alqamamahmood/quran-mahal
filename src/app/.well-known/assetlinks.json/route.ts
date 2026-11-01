import { NextResponse } from "next/server";

/**
 * GET /.well-known/assetlinks.json
 * Digital Asset Links — proves to Android that this site owns the TWA app
 * on Google Play. The SHA-256 fingerprints come from the env var
 * TWA_SHA256_FINGERPRINTS (comma-separated, from PWABuilder signing key).
 * The package_name must match the Android package ID used in PWABuilder.
 */
export async function GET() {
  const packageName = process.env.TWA_PACKAGE_NAME || "app.quranmahal.twa";
  const fingerprints = (process.env.TWA_SHA256_FINGERPRINTS || "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const data = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: packageName,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ];

  return NextResponse.json(data, {
    headers: { "Content-Type": "application/json" },
  });
}
