"use client";

import Image from "next/image";

export type PortraitPhase = "idle" | "thinking" | "streaming";

// Still image for now; swap the <Image> below for a Rive canvas in Phase 2 —
// the phase prop already carries idle/thinking/streaming state.
export function PortraitAvatar({ phase, size = 64 }: { phase: PortraitPhase; size?: number }) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden border bg-white transition-shadow ${
        phase === "thinking" ? "border-red animate-pulse" : "border-rule"
      }`}
      style={{ width: size, height: size }}
    >
      <Image src="/coach-eli-avatar.jpg" alt="Coach Eli Govern" fill className="object-cover" sizes={`${size}px`} />
    </div>
  );
}
