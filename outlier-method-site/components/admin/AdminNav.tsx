"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Review Queue" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/config", label: "Configuration" },
  { href: "/admin/schools", label: "Schools" },
  { href: "/admin/forms", label: "Forms" },
  { href: "/admin/deadlines", label: "Deadlines" },
  { href: "/admin/health", label: "Index Health" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/escalations", label: "Escalations" },
  { href: "/admin/business", label: "Business" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <nav className="flex items-center justify-between border-b border-rule bg-white px-6 py-4">
      <div className="flex items-center gap-6">
        <span className="eyebrow text-red">AD Chief of Staff — Admin</span>
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-[14px] ${pathname === l.href ? "font-semibold text-navy-900" : "text-slate hover:text-navy-900"}`}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-5">
        <Link href="/" className="text-[13px] text-slate hover:text-navy-900">
          View site
        </Link>
        <button onClick={logout} className="text-[13px] text-slate hover:text-red">
          Sign out
        </button>
      </div>
    </nav>
  );
}
