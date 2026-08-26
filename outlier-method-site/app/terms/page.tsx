import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = { title: "Terms of Service — AD Chief of Staff" };

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-bone">
        <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
          <p className="eyebrow text-red">Legal</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-navy-900">Terms of Service</h1>
          <p className="mt-2 text-[13px] text-slate">Last updated {new Date().toLocaleDateString()}</p>

          <div className="prose-legal mt-8 space-y-6 text-[14px] leading-relaxed text-ink">
            <section>
              <h2 className="font-serif text-lg font-semibold text-navy-900">1. What this is</h2>
              <p className="mt-2">
                AD Chief of Staff ("the Service") is a product of Outlier Method. It provides guidance on
                interscholastic and intercollegiate athletics eligibility and operations, grounded in
                bylaw text indexed from each governing body's own published handbook, bulletins, and
                amendments. Coach Eli Govern is an AI assistant, not a human employee or agent of any
                state association, conference, or governing body.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold text-navy-900">2. Not a ruling, not legal advice</h2>
              <p className="mt-2">
                Every eligibility answer is guidance based on the cited bylaw text as of the date shown —
                it is not a ruling, determination, or interpretation by the relevant state association,
                conference, or governing body, and it is not legal advice. The Service will never state
                that a student is or is not eligible as a final determination; it states what the cited
                bylaw provides and what you need to confirm. Determinations belong to the governing body.
                Run every outcome past your association representative before acting on it.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold text-navy-900">3. Accounts and subscriptions</h2>
              <p className="mt-2">
                A free account includes a limited number of cited eligibility answers per month; operational
                assistance is unlimited on every tier. Paid subscriptions (Athletic Director or District
                tier) are billed in advance, annually or monthly, via Stripe, and renew automatically unless
                canceled. District-tier purchase-order or invoice arrangements are billed net-30 per the
                terms of the individual invoice. You can cancel a card-based subscription at any time from
                your account; access continues through the end of the paid period.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold text-navy-900">4. Acceptable use</h2>
              <p className="mt-2">
                Use the Service for its intended purpose — supporting real athletic department decisions.
                Don't attempt to circumvent usage limits, resell access, scrape the bylaw corpus for
                redistribution, or use the Service in a way that violates the rights of a student, school,
                or governing body.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold text-navy-900">5. No warranty</h2>
              <p className="mt-2">
                The Service is provided "as is." Bylaw text is indexed on a best-effort basis and reviewed
                before publication, but Outlier Method does not guarantee that every rule, amendment, or
                deadline is captured or current at every moment. Always verify a time-sensitive
                determination with your governing body directly.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold text-navy-900">6. Limitation of liability</h2>
              <p className="mt-2">
                To the maximum extent permitted by law, Outlier Method is not liable for decisions made in
                reliance on the Service's output. The Service is a research and drafting aid; the
                responsibility for a final eligibility or operational decision rests with the athletic
                director, school, or governing body making it.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold text-navy-900">7. Contact</h2>
              <p className="mt-2">Questions about these terms: outliermethod1@gmail.com.</p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
