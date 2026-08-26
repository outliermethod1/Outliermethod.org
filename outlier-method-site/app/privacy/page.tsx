import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = { title: "Privacy Policy — AD Chief of Staff" };

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-bone">
        <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
          <p className="eyebrow text-red">Legal</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-navy-900">Privacy Policy</h1>
          <p className="mt-2 text-[13px] text-slate">Last updated {new Date().toLocaleDateString()}</p>

          <div className="mt-8 space-y-6 text-[14px] leading-relaxed text-ink">
            <section>
              <h2 className="font-serif text-lg font-semibold text-navy-900">What we collect</h2>
              <p className="mt-2">
                Account information (email, name, school, state association, an optional email signature),
                the conversations you have with Coach Eli, and basic usage data (which state you asked
                about, how many questions you've asked). If you subscribe, Stripe processes your payment
                details directly — we never see or store your card number.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold text-navy-900">Why we collect it</h2>
              <p className="mt-2">
                To answer your questions, save your conversation history, generate the PDF exports and
                memos you request, enforce free-tier limits, notify you if a bylaw you relied on is later
                amended, and run the subscription you've paid for. Anonymous visitors get a small number
                of free questions tracked by a session cookie, not an account.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold text-navy-900">Who we share it with</h2>
              <p className="mt-2">
                Service providers that make the product work: Anthropic (the AI model powering Coach Eli),
                Stripe (payment processing), Resend (transactional email), ElevenLabs (optional voice
                playback, only if you enable it), and Vercel/Neon (hosting and database). We do not sell
                your data. We do not share your conversations with your state association or anyone else
                without your action (e.g., you choosing to export or forward a memo yourself).
              </p>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold text-navy-900">How long we keep it</h2>
              <p className="mt-2">
                Conversation history is kept for as long as your account exists, since it's part of the
                product's value (your own eligibility record). You can delete your account at any time from
                your profile, which deletes your account data.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold text-navy-900">Your choices</h2>
              <p className="mt-2">
                You can update or delete your account from your profile page at any time, and unsubscribe
                from any email we send. Voice playback is opt-in and can be turned off in your profile.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-lg font-semibold text-navy-900">Contact</h2>
              <p className="mt-2">Questions about this policy: outliermethod1@gmail.com.</p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
