const AUDIENCE = [
  "Athletic directors",
  "Activities directors",
  "District administrators",
  "Officials",
  "State association staff",
];

export function WhoItsFor() {
  return (
    <section id="who-its-for" className="border-b border-rule bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <p className="eyebrow text-red">Who it&rsquo;s for</p>
        <div className="mt-6 flex flex-wrap gap-x-3 gap-y-3 text-lg text-navy-900">
          {AUDIENCE.map((role, i) => (
            <span key={role} className="flex items-center gap-3">
              <span className="font-serif font-medium">{role}</span>
              {i < AUDIENCE.length - 1 && <span className="text-rule">&middot;</span>}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
