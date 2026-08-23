import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-navy-700 bg-navy-900">
      <div className="hairline-grid pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 sm:py-24 md:grid-cols-[280px_1fr]">
        <div className="mx-auto w-56 border-2 border-red/70 bg-white p-2 shadow-[0_0_0_1px_rgba(247,245,241,0.15)] md:mx-0 md:w-full">
          <Image
            src="/coach-eli-govern.jpg"
            alt="Coach Eli Govern"
            width={560}
            height={700}
            className="h-auto w-full object-cover"
            priority
          />
        </div>
        <div>
          <p className="eyebrow text-[#E8A2A9]">Outlier Method</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-bone sm:text-5xl">
            AD Chief of Staff
          </h1>
          <p className="mt-5 max-w-xl text-lg text-bone/75">
            Meet Coach Eli Govern &mdash; thirty years in the chair, and every bylaw in your state, on call.
          </p>
          <div className="mt-8">
            <Link
              href="/coach"
              className="inline-block border border-red bg-red px-6 py-3 text-[15px] font-medium text-white hover:bg-[#8c1d27]"
            >
              Ask Coach Eli
            </Link>
            <p className="mt-3 text-sm text-bone/60">
              Grounded in your state association&rsquo;s bylaws. Every answer cited.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
