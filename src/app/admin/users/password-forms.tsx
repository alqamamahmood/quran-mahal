"use client";

import { useState } from "react";

export function ChangeMyPassword() {
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (pw1.length < 8) return setMsg("Password kam-az-kam 8 harf ka ho");
    if (pw1 !== pw2) return setMsg("Dono password ek jaise nahi");
    setBusy(true);
    try {
      const r = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: pw1 }),
      });
      const d = await r.json();
      if (!r.ok) setMsg(d.error || "Change nahi hua");
      else {
        setMsg("✅ Password change ho gaya!");
        setPw1("");
        setPw2("");
      }
    } catch {
      setMsg("Network error");
    }
    setBusy(false);
  }

  return (
    <div className="mt-6 rounded-2xl border border-brand-200 dark:border-white/10 p-5">
      <h2 className="text-lg font-bold text-brand-950 dark:text-white">🔑 Apna Password Change Karein</h2>
      <form onSubmit={submit} className="mt-3 flex gap-2 flex-wrap items-end">
        <div>
          <label className="block text-xs font-bold mb-1">Naya Password *</label>
          <input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} dir="ltr"
            placeholder="Kam-az-kam 8 harf"
            className="h-10 rounded-xl border border-brand-200 dark:border-white/15 bg-white dark:bg-neutral-900 px-3 text-sm w-56" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Dobara *</label>
          <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} dir="ltr"
            placeholder="Dobara likhein"
            className="h-10 rounded-xl border border-brand-200 dark:border-white/15 bg-white dark:bg-neutral-900 px-3 text-sm w-56" />
        </div>
        <button disabled={busy} className="h-10 rounded-xl bg-brand-700 px-5 text-sm font-bold text-white disabled:opacity-50">
          {busy ? "..." : "Change Karein"}
        </button>
      </form>
      {msg && <p className="text-sm mt-2">{msg}</p>}
    </div>
  );
}

export function ResetUserPassword({ userId, email }: { userId: string; email: string }) {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (pw.length < 8) return setMsg("8+ harf zaroori");
    if (!confirm(`Kya ${email} ka password reset karna hai?`)) return;
    setBusy(true);
    try {
      const r = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword: pw }),
      });
      const d = await r.json();
      if (!r.ok) setMsg(d.error || "Reset nahi hua");
      else {
        setMsg("✅ Reset ho gaya!");
        setPw("");
        setOpen(false);
      }
    } catch {
      setMsg("Network error");
    }
    setBusy(false);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="rounded-lg border px-2.5 py-1.5 text-xs font-bold text-orange-600 border-orange-200">
        Reset Password
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-1 items-center">
      <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} dir="ltr"
        placeholder="Naya password" className="h-8 rounded-lg border text-xs px-2 w-32" />
      <button disabled={busy} className="rounded-lg bg-orange-600 text-white px-2.5 py-1.5 text-xs font-bold disabled:opacity-50">
        {busy ? "..." : "Set"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-neutral-500">✕</button>
      {msg && <span className="text-xs">{msg}</span>}
    </form>
  );
}
