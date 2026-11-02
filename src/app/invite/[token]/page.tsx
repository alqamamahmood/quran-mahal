"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<{ email: string; role: string } | null>(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/invites/accept?token=${token}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) setError(d.error || "Invite load nahi hua");
        else setInvite(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Network error");
        setLoading(false);
      });
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Apna naam likhein");
    if (password.length < 8) return setError("Password kam-az-kam 8 harf ka ho");
    if (password !== confirm) return setError("Dono password ek jaise nahi");
    setSubmitting(true);
    try {
      const r = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name: name.trim(), password }),
      });
      const d = await r.json();
      if (!r.ok) setError(d.error || "Account nahi ban saka");
      else setDone(true);
    } catch {
      setError("Network error");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50 dark:bg-brand-950">
        <p className="text-brand-800 dark:text-brand-200">Invite check ho raha hai...</p>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50 dark:bg-brand-950 p-6">
        <div className="bg-white dark:bg-brand-900 rounded-2xl shadow p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Invite Masla</h1>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50 dark:bg-brand-950 p-6">
        <div className="bg-white dark:bg-brand-900 rounded-2xl shadow p-8 max-w-md text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-brand-900 dark:text-white mb-2">
            Mubarak ho!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Aapka admin account ban gaya hai. Ab login karke kaam shuru karein.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-brand-700 text-white px-8 py-3 rounded-full font-bold hover:bg-brand-800"
          >
            Login Karein
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 dark:bg-brand-950 p-6">
      <div className="bg-white dark:bg-brand-900 rounded-2xl shadow p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🕌</div>
          <h1 className="text-2xl font-bold text-brand-900 dark:text-white">
            Quran Mahal
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Aapko <strong>{invite?.role}</strong> ke tor par invite kiya gaya hai
          </p>
          <p className="text-sm text-gray-500 mt-1" dir="ltr">{invite?.email}</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Aapka Naam *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 dark:bg-brand-800 dark:border-brand-700"
              placeholder="Masalan: Muhammad Ahmed"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Password * <span className="font-normal text-gray-500">(kam-az-kam 8 harf)</span></label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 dark:bg-brand-800 dark:border-brand-700"
              placeholder="Apna password chunein"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Password Dobara *</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border rounded-lg px-4 py-2.5 dark:bg-brand-800 dark:border-brand-700"
              placeholder="Password dobara likhein"
              dir="ltr"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-700 text-white py-3 rounded-full font-bold hover:bg-brand-800 disabled:opacity-50"
          >
            {submitting ? "Account ban raha hai..." : "Account Banao"}
          </button>
        </form>
      </div>
    </div>
  );
}
