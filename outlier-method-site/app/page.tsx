import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { WhatHeHandles } from "@/components/WhatHeHandles";
import { HowCurrent } from "@/components/HowCurrent";
import { WhoItsFor } from "@/components/WhoItsFor";
import { TrustStrip } from "@/components/TrustStrip";
import { SiteFooter } from "@/components/SiteFooter";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <WhatHeHandles />
        <HowCurrent />
        <WhoItsFor />
        <TrustStrip />
      </main>
      <SiteFooter />
    </>
  );
}
