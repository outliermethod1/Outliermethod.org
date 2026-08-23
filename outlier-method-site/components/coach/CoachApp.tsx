"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { StateSelector } from "./StateSelector";
import { PortraitAvatar, type PortraitPhase } from "./PortraitAvatar";
import { MessageBubble, type ChatMessage } from "./MessageBubble";
import { SourcePanel } from "./SourcePanel";
import { StarterPrompts } from "./StarterPrompts";
import { ConversationRail } from "./ConversationRail";
import type { StateOption } from "@/lib/states-client";

interface FullState extends StateOption {
  eligibility_contact_name: string | null;
  eligibility_contact_phone: string | null;
  eligibility_contact_email: string | null;
}

const STATE_STORAGE_KEY = "ad-chief-of-staff:state-code";

export function CoachApp() {
  const [states, setStates] = useState<FullState[]>([]);
  const [stateCode, setStateCode] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<{ id: string; title: string; updated_at: string }[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<PortraitPhase>("idle");
  const [openChunkId, setOpenChunkId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/states")
      .then((r) => (r.ok ? r.json() : { states: [] }))
      .then((d) => setStates(d.states ?? []))
      .catch(() => setStates([]));
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(STATE_STORAGE_KEY) : null;
    if (saved) setStateCode(saved);
  }, []);

  useEffect(() => {
    if (!stateCode) return;
    window.localStorage.setItem(STATE_STORAGE_KEY, stateCode);
    fetch(`/api/conversations?state=${stateCode}`)
      .then((r) => (r.ok ? r.json() : { conversations: [] }))
      .then((d) => setConversations(d.conversations ?? []))
      .catch(() => setConversations([]));
  }, [stateCode]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const activeState = states.find((s) => s.state_code === stateCode) ?? null;

  async function loadConversation(id: string) {
    setConversationId(id);
    const res = await fetch(`/api/conversations/${id}`);
    const data = await res.json();
    setMessages(
      (data.messages ?? []).map((m: any) => ({ id: m.id, role: m.role, content: m.content, mode: m.mode }))
    );
  }

  function startNewConversation() {
    setConversationId(null);
    setMessages([]);
  }

  async function send(text: string) {
    if (!stateCode || !text.trim() || phase !== "idle") return;

    const userMsg: ChatMessage = { id: `local-${Date.now()}`, role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setPhase("thinking");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stateCode, message: text, conversationId }),
    });

    if (!res.body) {
      setPhase("idle");
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantId = `local-assistant-${Date.now()}`;
    let assistantText = "";
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);
    setPhase("streaming");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const raw of events) {
        const eventMatch = raw.match(/^event: (\w+)\ndata: (.*)$/s);
        if (!eventMatch) continue;
        const [, eventName, dataStr] = eventMatch;
        const data = JSON.parse(dataStr);

        if (eventName === "conversation") {
          setConversationId(data.conversationId);
        } else if (eventName === "delta") {
          assistantText += data.text;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: assistantText } : m))
          );
        } else if (eventName === "done") {
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, mode: data.mode } : m)));
          fetch(`/api/conversations?state=${stateCode}`)
            .then((r) => r.json())
            .then((d) => setConversations(d.conversations ?? []));
        }
      }
    }

    setPhase("idle");
  }

  function exportConversation(id: string) {
    window.open(`/api/export?conversationId=${id}`, "_blank");
  }

  if (!stateCode) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bone px-6">
        <PortraitAvatar phase="idle" size={96} />
        <h1 className="font-serif text-2xl font-semibold text-navy-900">Which state association?</h1>
        <p className="max-w-md text-center text-sm text-slate">
          Coach Eli grounds every eligibility answer in your state&rsquo;s bylaws. Pick your state before you start.
        </p>
        <div className="w-full max-w-sm">
          <StateSelector states={states} value={stateCode} onChange={setStateCode} variant="full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-bone">
      <div className="flex items-center justify-between border-b border-rule bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <PortraitAvatar phase={phase} size={40} />
          <div>
            <p className="font-serif text-sm font-semibold text-navy-900">Coach Eli Govern</p>
            <p className="text-[12px] text-slate">{activeState?.association_name ?? stateCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/bylaws" className="hidden text-[13px] text-slate hover:text-navy-900 sm:inline">
            Bylaw Library
          </Link>
          <Link href="/" className="hidden text-[13px] text-slate hover:text-navy-900 sm:inline">
            Home
          </Link>
          <StateSelector states={states} value={stateCode} onChange={setStateCode} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <ConversationRail
          conversations={conversations}
          activeId={conversationId}
          onSelect={loadConversation}
          onNew={startNewConversation}
          onExport={exportConversation}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-8">
            {messages.length === 0 && (
              <div className="mx-auto max-w-2xl pt-10">
                <StarterPrompts onPick={send} />
              </div>
            )}
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} state={activeState} onOpenSource={setOpenChunkId} />
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-rule bg-white p-4"
          >
            <div className="mx-auto flex max-w-3xl gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Coach Eli anything..."
                className="flex-1 border border-rule px-3 py-2 text-[15px] focus:border-navy-900 focus:outline-none"
              />
              <button
                type="submit"
                disabled={phase !== "idle"}
                className="border border-navy-900 bg-navy-900 px-5 py-2 text-[14px] font-medium text-bone hover:bg-navy-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>

      {openChunkId && <SourcePanel chunkId={openChunkId} onClose={() => setOpenChunkId(null)} />}
    </div>
  );
}
