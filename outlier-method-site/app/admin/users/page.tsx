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

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []));
  }, []);

  return (
    <div className="min-h-screen bg-bone">
      <AdminNav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-serif text-2xl font-semibold text-navy-900">Beta testers</h1>
        <p className="mt-2 text-sm text-slate">
          Everyone who has signed up. A copy of every signup also goes to your notification email.
        </p>

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
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate">
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
