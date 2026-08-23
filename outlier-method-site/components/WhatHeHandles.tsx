const COLUMNS = [
  {
    title: "Eligibility & Bylaws",
    body: "Transfers, residence, age, semesters of participation, academics, amateurism, undue influence. Every answer quotes the bylaw and links the source.",
  },
  {
    title: "Department Operations",
    body: "Transportation, scheduling, contracts, budgets, facilities, officials, Title IX tracking, event management.",
  },
  {
    title: "Forms & Documents",
    body: "He drafts them. Transportation requests, contest contracts, evaluation rubrics, parent letters, emergency action plans.",
  },
];

export function WhatHeHandles() {
  return (
    <section id="what-he-handles" className="border-b border-rule bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <p className="eyebrow text-red">What he handles</p>
        <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title} className="border-t-2 border-navy-900 pt-5">
              <h3 className="font-serif text-xl font-semibold text-navy-900">{col.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-slate">{col.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
