"use client";

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
}: {
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onExport: (id: string) => void;
}) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-rule bg-bone md:flex md:flex-col">
      <div className="border-b border-rule p-4">
        <button
          onClick={onNew}
          className="w-full border border-navy-900 bg-navy-900 px-3 py-2 text-[13px] font-medium text-bone hover:bg-navy-700"
        >
          New conversation
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`group flex items-center justify-between border-b border-rule px-4 py-3 text-[13px] ${
              c.id === activeId ? "bg-white" : ""
            }`}
          >
            <button onClick={() => onSelect(c.id)} className="flex-1 truncate text-left text-ink hover:text-navy-900">
              {c.title}
            </button>
            <button
              onClick={() => onExport(c.id)}
              className="ml-2 shrink-0 text-slate opacity-0 hover:text-red group-hover:opacity-100"
              title="Export to PDF"
            >
              ⇩
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
