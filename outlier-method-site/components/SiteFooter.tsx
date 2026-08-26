import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-bone">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 text-sm text-slate sm:flex-row sm:items-center">
        <span>&copy; {new Date().getFullYear()} Outlier Method &mdash; AD Chief of Staff</span>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/pricing" className="hover:text-navy-900">
            Pricing
          </Link>
          <Link href="/terms" className="hover:text-navy-900">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-navy-900">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
