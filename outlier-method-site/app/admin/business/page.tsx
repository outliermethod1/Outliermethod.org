"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

interface InvoiceRequest {
  id: string;
  school_or_district: string;
  contact_name: string;
  contact_email: string;
  tier: string;
  school_count: number | null;
  note: string | null;
  status: string;
  created_at: string;
}

interface FoundingCode {
  code: string;
  max_uses: number;
  used_count: number;
  note: string | null;
  created_at: string;
}

interface WaitlistDemand {
  state_code: string | null;
  kind: string;
  count: string;
}

export default function AdminBusinessPage() {
  const [requests, setRequests] = useState<InvoiceRequest[]>([]);
  const [codes, setCodes] = useState<FoundingCode[]>([]);
  const [demand, setDemand] = useState<WaitlistDemand[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newMaxUses, setNewMaxUses] = useState("1");
  const [newNote, setNewNote] = useState("");

  function load() {
    fetch("/api/admin/invoice-requests").then((r) => r.json()).then((d) => setRequests(d.requests ?? []));
    fetch("/api/admin/founding-codes").then((r) => r.json()).then((d) => setCodes(d.codes ?? []));
    fetch("/api/admin/waitlist").then((r) => r.json()).then((d) => setDemand(d.demand ?? []));
  }

  useEffect(load, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/invoice-requests/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function createCode(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/founding-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: newCode, maxUses: Number(newMaxUses) || 1, note: newNote || undefined }),
    });
    setNewCode("");
    setNewNote("");
    load();
  }

  return (
    <div className="min-h-screen bg-bone">
      <AdminNav />
      <main className="mx-auto max-w-5xl space-y-12 px-6 py-10">
        <section>
          <h1 className="font-serif text-2xl font-semibold text-navy-900">Invoice / PO requests</h1>
          <div className="mt-4 overflow-x-auto border border-rule bg-white">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-rule text-slate">
                  <th className="px-4 py-2 font-medium">School / District</th>
                  <th className="px-4 py-2 font-medium">Contact</th>
                  <th className="px-4 py-2 font-medium">Tier</th>
                  <th className="px-4 py-2 font-medium">Schools</th>
                  <th className="px-4 py-2 font-medium">Note</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-rule last:border-b-0 align-top">
                    <td className="px-4 py-2">{r.school_or_district}</td>
                    <td className="px-4 py-2">
                      {r.contact_name}
                      <br />
                      <span className="text-slate">{r.contact_email}</span>
                    </td>
                    <td className="px-4 py-2">{r.tier}</td>
                    <td className="px-4 py-2">{r.school_count ?? "—"}</td>
                    <td className="max-w-xs px-4 py-2 text-slate">{r.note ?? "—"}</td>
                    <td className="px-4 py-2">
                      <select
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        className="border border-rule bg-white px-2 py-1 text-[12px]"
                      >
                        <option value="open">Open</option>
                        <option value="invoiced">Invoiced</option>
                        <option value="paid">Paid</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-slate">
                      No invoice requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-navy-900">Founding-cohort codes</h2>
          <form onSubmit={createCode} className="mt-4 flex flex-wrap items-end gap-3 border border-rule bg-white p-4">
            <label className="text-[13px] text-slate">
              Code
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                required
                className="mt-1 block border border-rule px-2 py-1.5 text-[13px]"
              />
            </label>
            <label className="text-[13px] text-slate">
              Max uses
              <input
                type="number"
                min={1}
                value={newMaxUses}
                onChange={(e) => setNewMaxUses(e.target.value)}
                className="mt-1 block w-20 border border-rule px-2 py-1.5 text-[13px]"
              />
            </label>
            <label className="text-[13px] text-slate">
              Note
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="e.g. Founding 20"
                className="mt-1 block border border-rule px-2 py-1.5 text-[13px]"
              />
            </label>
            <button
              type="submit"
              className="border border-navy-900 bg-navy-900 px-4 py-1.5 text-[13px] font-medium text-bone hover:bg-navy-700"
            >
              Create code
            </button>
          </form>
          <div className="mt-4 overflow-x-auto border border-rule bg-white">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-rule text-slate">
                  <th className="px-4 py-2 font-medium">Code</th>
                  <th className="px-4 py-2 font-medium">Used</th>
                  <th className="px-4 py-2 font-medium">Note</th>
                  <th className="px-4 py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c.code} className="border-b border-rule last:border-b-0">
                    <td className="px-4 py-2 font-mono">{c.code}</td>
                    <td className="px-4 py-2">
                      {c.used_count} / {c.max_uses}
                    </td>
                    <td className="px-4 py-2 text-slate">{c.note ?? "—"}</td>
                    <td className="px-4 py-2">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {codes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate">
                      No codes yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-semibold text-navy-900">Waitlist demand</h2>
          <p className="mt-1 text-[13px] text-slate">Doubles as the roadmap — build what people actually ask for.</p>
          <div className="mt-4 overflow-x-auto border border-rule bg-white">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-rule text-slate">
                  <th className="px-4 py-2 font-medium">State</th>
                  <th className="px-4 py-2 font-medium">Kind</th>
                  <th className="px-4 py-2 font-medium">Signups</th>
                </tr>
              </thead>
              <tbody>
                {demand.map((d, i) => (
                  <tr key={i} className="border-b border-rule last:border-b-0">
                    <td className="px-4 py-2">{d.state_code?.toUpperCase() ?? "—"}</td>
                    <td className="px-4 py-2">{d.kind}</td>
                    <td className="px-4 py-2">{d.count}</td>
                  </tr>
                ))}
                {demand.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate">
                      No waitlist signups yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
