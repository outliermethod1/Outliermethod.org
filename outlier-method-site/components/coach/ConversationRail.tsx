"use client";

import Link from "next/link";

interface ConversationSummary {
  id: string;
  title: string;
  updated_at: string;
}

export function ConversationRail({
  conversations,
  activeId,
  onSelect,
  onNew,
  onExport,
  onDelete,
  mobileOpen,
  onCloseMobile,
}: {
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onExport: (id: string) => void;
  onDelete: (id: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const body = (
    <>
      <div className="border-b border-navy-700 p-4">
        <button
          onClick={onNew}
          className="w-full border border-red bg-red px-3 py-2 text-[13px] font-medium text-white hover:bg-[#8c1d27]"
        >
          New conversation
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`group flex items-center justify-between border-b border-navy-700 px-4 py-3 text-[13px] ${
              c.id === activeId ? "bg-navy-700" : ""
            }`}
          >
            <button onClick={() => onSelect(c.id)} className="flex-1 truncate text-left text-bone/85 hover:text-bone">
              {c.title}
            </button>
            <div className="ml-2 flex shrink-0 items-center gap-2 opacity-0 group-hover:opacity-100">
              <button onClick={() => onExport(c.id)} className="text-bone/50 hover:text-bone" title="Export to PDF">
                ⇩
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete "${c.title}"? This can't be undone.`)) onDelete(c.id);
                }}
                className="text-bone/50 hover:text-red"
                title="Delete conversation"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: static sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-navy-700 bg-navy-900 md:flex md:flex-col">
        {body}
      </aside>

      {/* Mobile: slide-in overlay */}
      <div
        className={`fixed inset-0 z-50 bg-navy-900/50 transition-opacity md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onCloseMobile}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy-900 transition-transform duration-200 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-navy-700 p-4">
          <span className="eyebrow text-bone/70">Conversations</span>
          <button onClick={onCloseMobile} className="text-bone/70 hover:text-bone" aria-label="Close">
            &#10005;
          </button>
        </div>
        {body}
        <div className="flex flex-wrap items-center gap-4 border-t border-navy-700 p-4 sm:hidden">
          <Link href="/forms" className="text-[13px] text-bone/70 hover:text-bone">
            Forms
          </Link>
          <Link href="/bylaws" className="text-[13px] text-bone/70 hover:text-bone">
            Bylaw Library
          </Link>
          <Link href="/" className="text-[13px] text-bone/70 hover:text-bone">
            Home
          </Link>
        </div>
      </aside>
    </>
  );
}
