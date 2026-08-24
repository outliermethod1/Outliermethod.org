"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

interface Deadline {
  id: string;
  state_code: string;
  title: string;
  description: string | null;
  month: number;
  day: number;
  category: string | null;
}

export default function AdminDeadlinesPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [stateCode, setStateCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [category, setCategory] = useState("");

  function load() {
    fetch("/api/admin/deadlines")
      .then((r) => r.json())
      .then((d) => setDeadlines(d.deadlines ?? []));
  }

  useEffect(load, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/deadlines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state_code: stateCode, title, description, month, day, category }),
    });
    setTitle("");
    setDescription("");
    setMonth("");
    setDay("");
    setCategory("");
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/deadlines/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="min-h-screen bg-bone">
      <AdminNav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-serif text-2xl font-semibold text-navy-900">State deadlines</h1>
        <p className="mt-2 text-sm text-slate">
          Recurring annual bylaw deadlines shown on every user&rsquo;s /calendar for that state. Manually
          curated — verify each against the actual current handbook before adding.
        </p>

        <form onSubmit={add} className="mt-6 grid grid-cols-2 gap-3 border border-rule bg-white p-4 sm:grid-cols-6">
          <input
            value={stateCode}
            onChange={(e) => setStateCode(e.target.value)}
            placeholder="state code (co)"
            required
            className="col-span-1 border border-rule px-2 py-1.5 text-[13px]"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            className="col-span-2 border border-rule px-2 py-1.5 text-[13px]"
          />
          <input
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="Month"
            required
            className="col-span-1 border border-rule px-2 py-1.5 text-[13px]"
          />
          <input
            type="number"
            min={1}
            max={31}
            value={day}
            onChange={(e) => setDay(e.target.value)}
            placeholder="Day"
            required
            className="col-span-1 border border-rule px-2 py-1.5 text-[13px]"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="col-span-1 border border-rule px-2 py-1.5 text-[13px]"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="col-span-5 border border-rule px-2 py-1.5 text-[13px]"
          />
          <button type="submit" className="col-span-1 border border-navy-900 bg-navy-900 px-2 py-1.5 text-[13px] text-white">
            Add
          </button>
        </form>

        <div className="mt-6 overflow-x-auto border border-rule bg-white">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-rule text-slate">
                <th className="px-3 py-2">State</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {deadlines.map((d) => (
                <tr key={d.id} className="border-b border-rule">
                  <td className="px-3 py-2">{d.state_code.toUpperCase()}</td>
                  <td className="px-3 py-2">{d.month}/{d.day}</td>
                  <td className="px-3 py-2">{d.title}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => remove(d.id)} className="text-red hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {deadlines.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-slate">
                    No deadlines yet.
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
