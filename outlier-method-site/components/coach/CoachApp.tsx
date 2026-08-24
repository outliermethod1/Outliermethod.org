"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StateSelector } from "./StateSelector";
import { PortraitAvatar, type PortraitPhase } from "./PortraitAvatar";
import { MessageBubble, type ChatMessage } from "./MessageBubble";
import { SourcePanel } from "./SourcePanel";
import { StarterPrompts } from "./StarterPrompts";
import { ConversationRail } from "./ConversationRail";
import type { StateOption } from "@/lib/states-client";
import { authFetch, getUserToken } from "@/lib/auth-client";
import { fetchSpeech, getSpeechRecognitionCtor } from "@/lib/voice-client";

interface FullState extends StateOption {
  eligibility_contact_name: string | null;
  eligibility_contact_phone: string | null;
  eligibility_contact_email: string | null;
}

const STATE_STORAGE_KEY = "ad-chief-of-staff:state-code";

export function CoachApp() {
  const router = useRouter();
  const [states, setStates] = useState<FullState[]>([]);
  const [stateCode, setStateCode] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<{ id: string; title: string; updated_at: string }[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<PortraitPhase>("idle");
  const [openChunkId, setOpenChunkId] = useState<string | null>(null);
  const [railOpen, setRailOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const micSupported = typeof window !== "undefined" && !!getSpeechRecognitionCtor();
  const scrollRef = useRef<HTMLDivElement>(null);
  // Only auto-follow new content while the reader is already at (or near)
  // the bottom. Otherwise every streamed word yanks them back down —
  // that's the "bouncing" the scroll used to do while Eli was still typing.
  const stickToBottomRef = useRef(true);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 80;
  }

  useEffect(() => {
    fetch("/api/states")
      .then((r) => (r.ok ? r.json() : { states: [] }))
      .then((d) => setStates(d.states ?? []))
      .catch(() => setStates([]));
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(STATE_STORAGE_KEY) : null;
    if (saved) setStateCode(saved);

    if (getUserToken()) {
      authFetch("/api/profile")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setVoiceEnabled(!!d?.user?.voice_enabled))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!stateCode) return;
    window.localStorage.setItem(STATE_STORAGE_KEY, stateCode);
    authFetch(`/api/conversations?state=${stateCode}`).then((r) => {
      if (r.status === 401) {
        router.push("/login?next=/coach");
        return { conversations: [] };
      }
      return r.ok ? r.json() : { conversations: [] };
    })
      .then((d) => setConversations(d.conversations ?? []))
      .catch(() => setConversations([]));
  }, [stateCode, router]);

  useEffect(() => {
    if (!stickToBottomRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    // Instant, not smooth — a fresh smooth-scroll animation on every single
    // streamed delta is exactly what produced the bouncing in the first place.
    el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
  }, [messages]);

  const activeState = states.find((s) => s.state_code === stateCode) ?? null;

  async function loadConversation(id: string) {
    setConversationId(id);
    const res = await authFetch(`/api/conversations/${id}`);
    if (res.status === 401) {
      router.push("/login?next=/coach");
      return;
    }
    const data = await res.json();
    setMessages(
      (data.messages ?? []).map((m: any) => ({ id: m.id, role: m.role, content: m.content, mode: m.mode }))
    );
  }

  function startNewConversation() {
    setConversationId(null);
    setMessages([]);
  }

  function stopSpeaking() {
    audioRef.current?.pause();
    audioRef.current = null;
    setSpeakingId(null);
  }

  async function speak(message: ChatMessage) {
    if (speakingId === message.id) {
      stopSpeaking();
      return;
    }
    stopSpeaking();
    setSpeakingId(message.id);
    const blob = await fetchSpeech(message.content);
    if (!blob) {
      setSpeakingId(null);
      return;
    }
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => {
      setSpeakingId((id) => (id === message.id ? null : id));
      URL.revokeObjectURL(url);
    };
    audio.play().catch(() => setSpeakingId(null));
  }

  function toggleMic() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript;
      if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  async function send(text: string) {
    if (!stateCode || !text.trim() || phase !== "idle") return;

    stickToBottomRef.current = true;
    const userMsg: ChatMessage = { id: `local-${Date.now()}`, role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setPhase("thinking");

    const res = await authFetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stateCode, message: text, conversationId }),
    });

    if (res.status === 401) {
      router.push("/login?next=/coach");
      setPhase("idle");
      return;
    }
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
          authFetch(`/api/conversations?state=${stateCode}`)
            .then((r) => (r.ok ? r.json() : { conversations: [] }))
            .then((d) => setConversations(d.conversations ?? []));
          if (voiceEnabled && assistantText) {
            speak({ id: assistantId, role: "assistant", content: assistantText });
          }
        }
      }
    }

    setPhase("idle");
  }

  function exportConversation(id: string) {
    // window.open can't attach an Authorization header, so a beta tester's
    // bearer token rides along as a query param instead — admin's cookie is
    // sent automatically either way.
    const token = getUserToken();
    const url = `/api/export?conversationId=${id}${token ? `&token=${encodeURIComponent(token)}` : ""}`;
    window.open(url, "_blank");
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
      <div className="flex items-center gap-3 border-b border-navy-700 bg-navy-900 px-4 py-3">
        <button
          onClick={() => setRailOpen(true)}
          className="shrink-0 text-bone md:hidden"
          aria-label="Open conversations"
        >
          &#9776;
        </button>
        <div className="shrink-0">
          <PortraitAvatar phase={phase} size={40} />
        </div>
        <p className="hidden shrink-0 whitespace-nowrap font-serif text-sm font-semibold text-bone lg:inline">
          Coach Eli Govern
        </p>
        <div className="min-w-0 flex-1">
          <StateSelector states={states} value={stateCode} onChange={setStateCode} theme="dark" />
        </div>
        <div className="hidden shrink-0 items-center gap-4 sm:flex">
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
      </div>

      <div className="flex flex-1 overflow-hidden">
        <ConversationRail
          conversations={conversations}
          activeId={conversationId}
          onSelect={(id) => {
            loadConversation(id);
            setRailOpen(false);
          }}
          onNew={() => {
            startNewConversation();
            setRailOpen(false);
          }}
          onExport={exportConversation}
          mobileOpen={railOpen}
          onCloseMobile={() => setRailOpen(false)}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-8"
          >
            {messages.length === 0 && (
              <div className="mx-auto max-w-2xl pt-10">
                <StarterPrompts onPick={send} />
              </div>
            )}
            {messages.map((m, i) => (
              <MessageBubble
                key={m.id}
                message={m}
                state={activeState}
                onOpenSource={setOpenChunkId}
                onListen={speak}
                isSpeaking={speakingId === m.id}
                isStreaming={phase === "streaming" && i === messages.length - 1}
              />
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
                placeholder={listening ? "Listening…" : "Ask Coach Eli anything..."}
                className="flex-1 border border-rule px-3 py-2 text-[15px] focus:border-navy-900 focus:outline-none"
              />
              {micSupported && (
                <button
                  type="button"
                  onClick={toggleMic}
                  title={listening ? "Stop listening" : "Speak your question"}
                  aria-label={listening ? "Stop listening" : "Speak your question"}
                  className={`border px-3 py-2 text-[15px] ${
                    listening
                      ? "border-red bg-red text-white"
                      : "border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-bone"
                  }`}
                >
                  🎤
                </button>
              )}
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
