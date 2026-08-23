"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

interface HealthRow {
  state_code: string;
  chunk_count: number;
  current_chunk_count: number;
  most_recent_effective_date: string | null;
}

interface WatchedUrlRow {
  id: string;
  state_code: string;
  label: string;
  url: string;
  last_status: string | null;
  last_checked_at: string | null;
}

interface AlertRow {
  id: string;
  state_code: string;
  kind: string;
  message: string;
  created_at: string;
}

export default function AdminHealthPage() {
  const [health, setHealth] = useState<HealthRow[]>([]);
  const [watchedUrls, setWatchedUrls] = useState<WatchedUrlRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);

  useEffect(() => {
    fetch("/api/admin/health")
      .then((r) => r.json())
      .then((d) => {
        setHealth(d.health ?? []);
        setWatchedUrls(d.watchedUrls ?? []);
        setAlerts(d.alerts ?? []);
      });
  }, []);

  return (
    <div className="min-h-screen bg-bone">
      <AdminNav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-serif text-2xl font-semibold text-navy-900">Index health</h1>

        {alerts.length > 0 && (
          <section className="mt-6 border border-red bg-red-tint p-4">
            <p className="eyebrow text-red">Unacknowledged alerts</p>
            <ul className="mt-2 space-y-1 text-[13px] text-ink">
              {alerts.map((a) => (
                <li key={a.id}>
                  [{a.state_code.toUpperCase()}] {a.message}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-8">
          <h2 className="font-serif text-lg font-semibold text-navy-900">Chunk counts</h2>
          <table className="mt-3 w-full border border-rule bg-white text-[14px]">
            <thead>
              <tr className="border-b border-rule text-left text-[12px] text-slate">
                <th className="px-4 py-2">State</th>
                <th className="px-4 py-2">Current chunks</th>
                <th className="px-4 py-2">All versions</th>
                <th className="px-4 py-2">Most recent effective date</th>
              </tr>
            </thead>
            <tbody>
              {health.map((h) => (
                <tr key={h.state_code} className="border-b border-rule">
                  <td className="px-4 py-2 font-medium text-navy-900">{h.state_code.toUpperCase()}</td>
                  <td className="px-4 py-2">{h.current_chunk_count}</td>
                  <td className="px-4 py-2">{h.chunk_count}</td>
                  <td className="px-4 py-2">{h.most_recent_effective_date ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-lg font-semibold text-navy-900">Crawler status</h2>
          <table className="mt-3 w-full border border-rule bg-white text-[14px]">
            <thead>
              <tr className="border-b border-rule text-left text-[12px] text-slate">
                <th className="px-4 py-2">Watched URL</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Last checked</th>
              </tr>
            </thead>
            <tbody>
              {watchedUrls.map((u) => (
                <tr key={u.id} className="border-b border-rule">
                  <td className="px-4 py-2">
                    {u.label} <span className="text-slate">({u.state_code.toUpperCase()})</span>
                  </td>
                  <td className="px-4 py-2">{u.last_status ?? "never checked"}</td>
                  <td className="px-4 py-2">
                    {u.last_checked_at ? new Date(u.last_checked_at).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
