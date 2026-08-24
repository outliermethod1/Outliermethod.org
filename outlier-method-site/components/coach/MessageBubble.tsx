"use client";

import { Fragment } from "react";
import { CitationChip } from "./CitationChip";
import { DisclaimerBlock } from "./DisclaimerBlock";
import type { StateOption } from "@/lib/states-client";

interface ContactInfo {
  eligibility_contact_name: string | null;
  eligibility_contact_phone: string | null;
  eligibility_contact_email: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: "A" | "B" | null;
}

const CITE_RE = /\[\[cite:([a-f0-9-]+)\]\]/g;

export function MessageBubble({
  message,
  state,
  onOpenSource,
  onListen,
  isSpeaking,
  isStreaming,
}: {
  message: ChatMessage;
  state: (StateOption & ContactInfo) | null;
  onOpenSource: (chunkId: string) => void;
  onListen?: (message: ChatMessage) => void;
  isSpeaking?: boolean;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";
  const parts = renderWithChips(message.content, onOpenSource);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] px-4 py-3 text-[15px] leading-relaxed ${
          isUser
            ? "bg-navy-500/10 text-ink"
            : "border-l-2 border-navy-900 bg-white text-ink"
        }`}
      >
        <div className="whitespace-pre-wrap">{parts}</div>
        {!isUser && message.mode === "A" && <DisclaimerBlock state={state} />}
        {!isUser && onListen && message.content && !isStreaming && (
          <button
            onClick={() => onListen(message)}
            className="mt-2 flex items-center gap-1 text-[12px] text-navy-700 hover:text-red"
          >
            {isSpeaking ? "◼ Stop" : "🔊 Listen"}
          </button>
        )}
      </div>
    </div>
  );
}

function renderWithChips(text: string, onOpenSource: (id: string) => void) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let chipCount = 0;
  const seen = new Map<string, number>();
  let match: RegExpExecArray | null;
  CITE_RE.lastIndex = 0;

  while ((match = CITE_RE.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(<Fragment key={lastIndex}>{text.slice(lastIndex, match.index)}</Fragment>);
    }
    const id = match[1];
    if (!seen.has(id)) {
      chipCount++;
      seen.set(id, chipCount);
    }
    const n = seen.get(id)!;
    nodes.push(<CitationChip key={`${id}-${match.index}`} label={`§${n}`} onClick={() => onOpenSource(id)} />);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    nodes.push(<Fragment key={`tail-${lastIndex}`}>{text.slice(lastIndex)}</Fragment>);
  }
  return nodes;
}
