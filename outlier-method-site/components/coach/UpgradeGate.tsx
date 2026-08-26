"use client";

import Link from "next/link";

// Renders inline once a logged-in free-tier account has used its 5 cited
// answers this month — same non-modal, non-redirect pattern as
// FreeQuestionGate. Mode B (operational) questions never trigger this.
export function UpgradeGate({ limit }: { limit: number }) {
  return (
    <div className="border border-navy-900 bg-white p-6 sm:p-8">
      <p className="font-serif text-xl font-semibold text-navy-900 sm:text-2xl">
        That&rsquo;s your {limit} free cited answers this month.
      </p>
      <p className="mt-2 text-[14px] text-slate">
        Operational questions (forms, scheduling, budgets) are still unlimited — it&rsquo;s eligibility
        answers with bylaw citations specifically. Upgrade for unlimited cited answers, memo export, and
        full history.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/pricing"
          className="border border-red bg-red px-5 py-2.5 text-[14px] font-medium text-white hover:bg-[#8c1d27]"
        >
          See pricing
        </Link>
      </div>
    </div>
  );
}
