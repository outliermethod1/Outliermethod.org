"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { StateSelector } from "./StateSelector";
import { PortraitAvatar, type PortraitPhase } from "./PortraitAvatar";
import { MessageBubble, type ChatMessage } from "./MessageBubble";
import { SourcePanel } from "./SourcePanel";
import { StarterPrompts } from "./StarterPrompts";
import { ConversationRail } from "./ConversationRail";
import { FreeQuestionGate } from "./FreeQuestionGate";
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
  const params = useSearchParams();
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
  const [voiceMode, setVoiceMode] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  // null = not yet known, true = logged in (user or admin), false = anonymous
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const [remainingFree, setRemainingFree] = useState<number | null>(null);
  const [showGate, setShowGate] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  // Mirrors voiceMode for the async audio.onended callback below, which
  // closes over whatever voiceMode was at speak()-call time otherwise —
  // a ref always reads the latest value.
  const voiceModeRef = useRef(false);
  useEffect(() => {
    voiceModeRef.current = voiceMode;
  }, [voiceMode]);
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
    // 401 here just means "anonymous visitor" now, not "go log in" — Coach
    // Eli is public. Saved conversation history (this rail) is the account
    // feature; an anonymous visitor simply doesn't get one.
    authFetch(`/api/conversations?state=${stateCode}`)
      .then((r) => {
        setHasAccount(r.status !== 401);
        return r.ok ? r.json() : { conversations: [] };
      })
      .then((d) => setConversations(d.conversations ?? []))
      .catch(() => setConversations([]));
  }, [stateCode]);

  // A ?resume=<conversationId> arrives right after signing up/logging in
  // from the free-question gate — load that conversation back up instead
  // of starting fresh, once we know the account fetch above succeeded.
  useEffect(() => {
    if (hasAccount !== true) return;
    const resume = params.get("resume");
    if (!resume) return;
    loadConversation(resume);
    setShowGate(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("resume");
    window.history.replaceState({}, "", url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccount]);

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
    if (!res.ok) return;
    const data = await res.json();
    setMessages(
      (data.messages ?? []).map((m: any) => ({ id: m.id, role: m.role, content: m.content, mode: m.mode }))
    );
  }

  function startNewConversation() {
    setConversationId(null);
    setMessages([]);
    setShowGate(false);
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
      // Voice Mode conversation: once Eli finishes talking, reopen the mic
      // for the next question automatically instead of waiting on a tap.
      if (voiceModeRef.current) startListening();
    };
    audio.play().catch(() => setSpeakingId(null));
  }

  function startListening() {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript;
      if (!transcript) return;
      if (voiceModeRef.current) {
        send(transcript);
      } else {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function toggleMic() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    startListening();
  }

  function toggleVoiceMode() {
    setVoiceMode((v) => {
      const next = !v;
      voiceModeRef.current = next;
      if (next) {
        if (phase === "idle") startListening();
      } else {
        recognitionRef.current?.stop();
        stopSpeaking();
      }
      return next;
    });
  }

  async function send(text: string) {
    if (!stateCode || !text.trim() || phase !== "idle" || showGate) return;

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

    if (res.status === 403) {
      const data = await res.json().catch(() => null);
      if (data?.error === "free_limit_reached") {
        setRemainingFree(0);
        setShowGate(true);
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        setPhase("idle");
        return;
      }
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
        } else if (eventName === "quota") {
          setRemainingFree(data.remaining);
        } else if (eventName === "delta") {
          assistantText += data.text;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: assistantText } : m))
          );
        } else if (eventName === "done") {
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, mode: data.mode } : m)));
          if (hasAccount) {
            authFetch(`/api/conversations?state=${stateCode}`)
              .then((r) => (r.ok ? r.json() : { conversations: [] }))
              .then((d) => setConversations(d.conversations ?? []));
          }
          if ((voiceEnabled || voiceModeRef.current) && assistantText) {
            speak({ id: assistantId, role: "assistant", content: assistantText });
          }
        }
      }
    }

    setPhase("idle");
  }

  async function deleteConversation(id: string) {
    await authFetch(`/api/conversations/${id}`, { method: "DELETE" });
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (conversationId === id) startNewConversation();
  }

  function exportConversation(id: string) {
    // window.open can't attach an Authorization header, so a beta tester's
    // bearer token rides along as a query param instead — admin's cookie is
    // sent automatically either way.
    const token = getUserToken();
    const url = `/api/export?conversationId=${id}${token ? `&token=${encodeURIComponent(token)}` : ""}`;
    window.open(url, "_blank");
  }

  function goToAuth(kind: "signup" | "login") {
    const qs = new URLSearchParams({ next: "/coach" });
    if (conversationId) qs.set("conversationId", conversationId);
    router.push(`/${kind}?${qs.toString()}`);
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
        {hasAccount && (
          <button
            onClick={() => setRailOpen(true)}
            className="shrink-0 text-bone md:hidden"
            aria-label="Open conversations"
          >
            &#9776;
          </button>
        )}
        <p className="hidden shrink-0 whitespace-nowrap font-serif text-sm font-semibold text-bone lg:inline">
          Coach Eli Govern
        </p>
        <div className="min-w-0 flex-1">
          <StateSelector states={states} value={stateCode} onChange={setStateCode} theme="dark" />
        </div>
        <div className="hidden shrink-0 items-center gap-4 sm:flex">
          {hasAccount === false && (
            <>
              <Link href="/login" className="text-[13px] text-bone/70 hover:text-bone">
                Log in
              </Link>
              <Link href="/signup" className="text-[13px] font-medium text-bone hover:text-red">
                Create free account
              </Link>
            </>
          )}
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
        {hasAccount && (
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
            onDelete={deleteConversation}
            mobileOpen={railOpen}
            onCloseMobile={() => setRailOpen(false)}
          />
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-8"
          >
            {messages.length === 0 && !showGate && (
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
            {showGate && (
              <div className="mx-auto max-w-2xl">
                <FreeQuestionGate
                  onSignup={() => goToAuth("signup")}
                  onLogin={() => goToAuth("login")}
                />
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-rule bg-white p-4"
          >
            <div className="mx-auto flex max-w-3xl items-end gap-3">
              <div className="hidden shrink-0 sm:block">
                <PortraitAvatar phase={phase} size={88} />
              </div>
              <div className="flex flex-1 gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={listening ? "Listening…" : showGate ? "Create a free account to keep going" : "Ask Coach Eli anything..."}
                disabled={showGate}
                className="flex-1 border border-rule px-3 py-2 text-[15px] focus:border-navy-900 focus:outline-none disabled:bg-bone disabled:text-slate"
              />
              {micSupported && !showGate && (
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
              {micSupported && !showGate && (
                <button
                  type="button"
                  onClick={toggleVoiceMode}
                  title={voiceMode ? "Turn off Voice Mode" : "Turn on Voice Mode — hands-free conversation"}
                  className={`flex items-center gap-1 border px-3 py-2 text-[13px] font-medium ${
                    voiceMode
                      ? "border-red bg-red text-white"
                      : "border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-bone"
                  }`}
                >
                  🎙️
                  <span className="hidden sm:inline">
                    Voice Mode{voiceMode && (listening ? " — listening" : speakingId ? " — speaking" : " — on")}
                  </span>
                </button>
              )}
              <button
                type="submit"
                disabled={phase !== "idle" || showGate}
                className="border border-navy-900 bg-navy-900 px-5 py-2 text-[14px] font-medium text-bone hover:bg-navy-700 disabled:opacity-50"
              >
                Send
              </button>
              </div>
            </div>
            {hasAccount === false && remainingFree !== null && !showGate && (
              <p className="mx-auto mt-2 max-w-3xl text-[12px] text-slate">
                {remainingFree === 0
                  ? "No free questions left."
                  : `${remainingFree} free question${remainingFree === 1 ? "" : "s"} left`}
              </p>
            )}
          </form>
        </div>
      </div>

      {openChunkId && <SourcePanel chunkId={openChunkId} onClose={() => setOpenChunkId(null)} />}
    </div>
  );
}
