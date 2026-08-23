export function TrustStrip() {
  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div className="hairline-grid pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="h-[3px] w-12 bg-red" />
        <p className="mt-5 eyebrow text-[#E8A2A9]">The advantage</p>
        <p className="mt-5 max-w-3xl font-serif text-2xl font-medium leading-snug text-bone sm:text-3xl">
          Eli gives you a cited, reasoned read on your bylaws so you walk into the conversation with your
          association already knowing where you stand.
        </p>
        <p className="mt-5 text-[15px] text-bone/70">Guidance, not a ruling.</p>
      </div>
    </section>
  );
}
