import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WaitlistForm } from "@/components/WaitlistForm";
import { listStates } from "@/lib/db/states";
import { indexHealthByState } from "@/lib/db/chunks";

export const metadata = {
  title: "Bylaw Library — AD Chief of Staff",
  description:
    "Browse cited, dated eligibility bylaws by state athletic association and by college governing body. Superseded text is never shown as current.",
};

export default async function BylawLibraryPage({
  searchParams,
}: {
  searchParams: { level?: string };
}) {
  const level = searchParams.level === "college" ? "college" : "high_school";
  const [states, health] = await Promise.all([listStates(), indexHealthByState()]);
  const healthByCode = Object.fromEntries(health.map((h) => [h.state_code, h]));
  const filtered = states
    .filter((s) => s.level === level)
    .map((s) => ({ ...s, covered: (healthByCode[s.state_code]?.current_chunk_count ?? 0) > 0 }));

  const covered = filtered.filter((s) => s.covered);
  const notCovered = filtered.filter((s) => !s.covered);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-bone">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <p className="eyebrow text-red">Bylaw Library</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">
            Browse by state
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] text-slate">
            Every current bylaw section on file, by governing body, with its effective date and
            citation. Superseded text is never shown here as current.
          </p>

          <div className="mt-8 inline-flex border border-rule">
            {(["high_school", "college"] as const).map((l) => (
              <Link
                key={l}
                href={l === "high_school" ? "/bylaws" : "/bylaws?level=college"}
                className={`px-5 py-2 text-[13px] font-medium uppercase tracking-wide ${
                  level === l ? "bg-navy-900 text-bone" : "bg-white text-slate hover:text-navy-900"
                }`}
              >
                {l === "high_school" ? "High School" : "College"}
              </Link>
            ))}
          </div>

          {covered.length > 0 && (
            <>
              <p className="mt-10 eyebrow text-navy-900">Fully indexed — {covered.length}</p>
              <div className="mt-4 grid grid-cols-1 gap-px border border-rule bg-rule sm:grid-cols-2 md:grid-cols-3">
                {covered.map((s) => (
                  <Link key={s.state_code} href={`/bylaws/${s.state_code}`} className="bg-white p-5 hover:bg-red-tint">
                    <p className="font-serif text-lg font-semibold text-navy-900">{s.state_name}</p>
                    <p className="mt-1 text-[13px] text-slate">{s.association_name}</p>
                  </Link>
                ))}
              </div>
            </>
          )}

          {notCovered.length > 0 && (
            <>
              <p className="mt-10 eyebrow text-slate">Not yet covered — join the waitlist</p>
              <p className="mt-2 max-w-2xl text-[13px] text-slate">
                Three honest states beat fifty implied ones. These aren&rsquo;t indexed yet — tell us
                you need one and it moves up the build order.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-px border border-rule bg-rule sm:grid-cols-2 md:grid-cols-3">
                {notCovered.map((s) => (
                  <div key={s.state_code} className="bg-white p-5">
                    <p className="font-serif text-lg font-semibold text-navy-900">{s.state_name}</p>
                    <p className="mt-1 text-[13px] text-slate">{s.association_name}</p>
                    <WaitlistForm stateCode={s.state_code} stateName={s.state_name} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
