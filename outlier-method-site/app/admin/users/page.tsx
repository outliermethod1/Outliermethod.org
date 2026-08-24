"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

interface UserRow {
  id: string;
  email: string;
  email_verified: boolean;
  name: string | null;
  school: string | null;
  state_code: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [linkFor, setLinkFor] = useState<{ email: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function load() {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []));
  }

  useEffect(load, []);

  async function verifyNow(id: string) {
    setBusyId(id);
    await fetch(`/api/admin/users/${id}/verify`, { method: "POST" });
    setBusyId(null);
    load();
  }

  async function getResetLink(id: string, email: string) {
    setBusyId(id);
    const res = await fetch(`/api/admin/users/${id}/reset-link`, { method: "POST" });
    const data = await res.json();
    setBusyId(null);
    if (res.ok) {
      setLinkFor({ email, url: data.resetUrl });
      setCopied(false);
    }
  }

  async function copyLink() {
    if (!linkFor) return;
    await navigator.clipboard.writeText(linkFor.url);
    setCopied(true);
  }

  return (
    <div className="min-h-screen bg-bone">
      <AdminNav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-serif text-2xl font-semibold text-navy-900">Beta testers</h1>
        <p className="mt-2 text-sm text-slate">
          Everyone who has signed up. A copy of every signup also goes to your notification email.
          {" "}If <code className="text-[12px]">RESEND_API_KEY</code> isn&rsquo;t configured, verification and
          reset emails never send — use the actions below to unblock a tester manually.
        </p>

        {linkFor && (
          <div className="mt-6 border border-navy-900 bg-white p-4">
            <p className="text-[13px] text-navy-900">
              Password reset link for <strong>{linkFor.email}</strong> — expires in 1 hour. Send it to them
              however works (text, Slack, in person):
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="break-all border border-rule bg-bone px-2 py-1 text-[12px]">{linkFor.url}</code>
              <button
                onClick={copyLink}
                className="border border-navy-900 px-3 py-1 text-[12px] font-medium text-navy-900 hover:bg-navy-900 hover:text-white"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button onClick={() => setLinkFor(null)} className="text-[12px] text-slate hover:text-red">
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 overflow-x-auto border border-rule bg-white">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-rule text-slate">
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">School</th>
                <th className="px-4 py-2 font-medium">State</th>
                <th className="px-4 py-2 font-medium">Verified</th>
                <th className="px-4 py-2 font-medium">Signed up</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-rule last:border-b-0">
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.name ?? "—"}</td>
                  <td className="px-4 py-2">{u.school ?? "—"}</td>
                  <td className="px-4 py-2">{u.state_code?.toUpperCase() ?? "—"}</td>
                  <td className="px-4 py-2">{u.email_verified ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      {!u.email_verified && (
                        <button
                          onClick={() => verifyNow(u.id)}
                          disabled={busyId === u.id}
                          className="text-[12px] font-medium text-navy-900 underline hover:text-red disabled:opacity-50"
                        >
                          {busyId === u.id ? "Verifying…" : "Verify now"}
                        </button>
                      )}
                      <button
                        onClick={() => getResetLink(u.id, u.email)}
                        disabled={busyId === u.id}
                        className="text-[12px] font-medium text-navy-900 underline hover:text-red disabled:opacity-50"
                      >
                        {busyId === u.id ? "Working…" : "Get reset link"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate">
                    No signups yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
