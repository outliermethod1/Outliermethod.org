"use client";

import Image from "next/image";

export type PortraitPhase = "idle" | "thinking" | "streaming";

// Transparent-background figure, no card/border — he just stands there next
// to the chat. Still a still image for now; swap the <Image> below for a
// Rive canvas in Phase 2 (the phase prop already carries idle/thinking/
// streaming state, and drives a CSS animation in the meantime).
export function PortraitAvatar({ phase, size = 64 }: { phase: PortraitPhase; size?: number }) {
  const animationClass =
    phase === "thinking" ? "eli-bounce" : phase === "streaming" ? "eli-talk" : "eli-idle";

  return (
    <div className={`relative shrink-0 ${animationClass}`} style={{ width: size, height: size * 1.5 }}>
      <Image
        src="/coach-eli-avatar-nobg.png"
        alt="Coach Eli Govern"
        fill
        className="object-contain object-bottom"
        sizes={`${size}px`}
        priority
      />
    </div>
  );
}
