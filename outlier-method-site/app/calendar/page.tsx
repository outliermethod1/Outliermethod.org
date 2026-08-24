"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { authFetch, getUserToken } from "@/lib/auth-client";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface StateDeadline {
  id: string;
  title: string;
  description: string | null;
  month: number;
  day: number;
  category: string | null;
}

interface UserDeadline {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  source_message_id: string | null;
}

const STATE_STORAGE_KEY = "ad-chief-of-staff:state-code";

export default function CalendarPage() {
  const router = useRouter();
  const [stateCode, setStateCode] = useState<string | null>(null);
  const [stateDeadlines, setStateDeadlines] = useState<StateDeadline[]>([]);
  const [userDeadlines, setUserDeadlines] = useState<UserDeadline[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(STATE_STORAGE_KEY) : null;
    setStateCode(saved);
  }, []);

  function load() {
    if (!stateCode) return;
    authFetch(`/api/calendar?state=${stateCode}`)
      .then((r) => (r.ok ? r.json() : { stateDeadlines: [], userDeadlines: [] }))
      .then((d) => {
        setStateDeadlines(d.stateDeadlines ?? []);
        setUserDeadlines(d.userDeadlines ?? []);
      });
  }

  useEffect(load, [stateCode]);

  async function addDeadline(e: React.FormEvent) {
    e.preventDefault();
    if (!getUserToken()) {
      router.push("/login?next=/calendar");
      return;
    }
    await authFetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, dueDate, description }),
    });
    setTitle("");
    setDueDate("");
    setDescription("");
    setShowAdd(false);
    load();
  }

  async function removeDeadline(id: string) {
    await authFetch(`/api/calendar/${id}`, { method: "DELETE" });
    load();
  }

  // Merge into one sorted timeline: state deadlines get projected onto the
  // next occurrence of their month/day (this year, or next year if already
  // passed), personal deadlines use their real due_date.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const merged = [
    ...stateDeadlines.map((d) => {
      let year = today.getFullYear();
      let occursOn = new Date(year, d.month - 1, d.day);
      if (occursOn < today) occursOn = new Date(year + 1, d.month - 1, d.day);
      return {
        id: `state-${d.id}`,
        title: d.title,
        description: d.description,
        date: occursOn,
        kind: "state" as const,
        deletable: false as const,
        rawId: d.id,
      };
    }),
    ...userDeadlines.map((d) => ({
      id: `user-${d.id}`,
      title: d.title,
      description: d.description,
      date: new Date(d.due_date + "T00:00:00"),
      kind: "personal" as const,
      deletable: true as const,
      rawId: d.id,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-bone">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <p className="eyebrow text-red">Compliance Calendar</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">
            What&rsquo;s coming up
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] text-slate">
            State-wide bylaw deadlines, plus anything Coach Eli saved for you from a conversation or you added
            yourself. Ask Eli about a specific deadline and he&rsquo;ll save it here automatically once you have
            a real date.
          </p>

          {!stateCode && (
            <p className="mt-8 border border-rule bg-white p-4 text-[14px] text-slate">
              Pick a state in <a href="/coach" className="underline">Coach Eli</a> first — deadlines are tied to
              your state association.
            </p>
          )}

          {stateCode && (
            <>
              <button
                onClick={() => setShowAdd((v) => !v)}
                className="mt-8 border border-navy-900 px-4 py-2 text-[13px] font-medium text-navy-900 hover:bg-navy-900 hover:text-white"
              >
                + Add a reminder
              </button>

              {showAdd && (
                <form onSubmit={addDeadline} className="mt-4 space-y-3 border border-rule bg-white p-4">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    required
                    className="w-full border border-rule px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
                  />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full border border-rule px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Notes (optional)"
                    rows={2}
                    className="w-full border border-rule px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="border border-red bg-red px-4 py-2 text-[13px] font-medium text-white hover:bg-[#8c1d27]"
                  >
                    Save
                  </button>
                </form>
              )}

              <div className="mt-8 space-y-3">
                {merged.length === 0 && (
                  <p className="text-[14px] text-slate">Nothing on the calendar yet for this state.</p>
                )}
                {merged.map((d) => {
                  const daysAway = Math.round((d.date.getTime() - today.getTime()) / 86400000);
                  const soon = daysAway <= 30;
                  return (
                    <div
                      key={d.id}
                      className={`flex items-start justify-between gap-4 border p-4 ${
                        soon ? "border-red bg-red-tint" : "border-rule bg-white"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-[12px] uppercase tracking-wide text-slate">
                          {MONTH_NAMES[d.date.getMonth()]} {d.date.getDate()}
                          {soon && <span className="ml-2 text-red">— {daysAway <= 0 ? "today" : `${daysAway}d`}</span>}
                          {d.kind === "personal" && <span className="ml-2 text-navy-700">— personal</span>}
                        </p>
                        <p className="mt-1 font-serif text-[15px] font-semibold text-navy-900">{d.title}</p>
                        {d.description && <p className="mt-1 text-[13px] text-slate">{d.description}</p>}
                      </div>
                      {d.deletable && (
                        <button
                          onClick={() => removeDeadline(d.rawId)}
                          className="shrink-0 text-[12px] text-slate hover:text-red"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
