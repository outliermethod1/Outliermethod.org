"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserToken } from "@/lib/auth-client";

export function SiteHeader() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // Lightweight signal — presence of a token means "was logged in this
    // tab." Not worth a network round trip just to light up a nav link;
    // /profile itself re-validates against the server on load.
    setLoggedIn(!!getUserToken());
  }, []);

  return (
    <header className="border-b border-rule bg-bone">
      <div className="h-[3px] bg-red" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="eyebrow text-navy-900">
          Outlier Method
        </Link>
        <nav className="flex items-center gap-8 text-[15px] text-ink">
          <Link href="/#what-he-handles" className="hidden sm:inline hover:text-navy-700">
            What he handles
          </Link>
          <Link href="/#who-its-for" className="hidden sm:inline hover:text-navy-700">
            Who it&rsquo;s for
          </Link>
          <Link href="/bylaws" className="hidden sm:inline hover:text-navy-700">
            Bylaw Library
          </Link>
          <Link href="/forms" className="hidden sm:inline hover:text-navy-700">
            Forms
          </Link>
          {loggedIn ? (
            <Link href="/profile" className="hidden sm:inline hover:text-navy-700">
              Profile
            </Link>
          ) : (
            <Link href="/login" className="hidden sm:inline hover:text-navy-700">
              Log in
            </Link>
          )}
          <Link
            href="/coach"
            className="border border-navy-900 bg-navy-900 px-4 py-2 text-[14px] font-medium text-bone hover:bg-navy-700"
          >
            Ask Coach Eli
          </Link>
        </nav>
      </div>
    </header>
  );
}
