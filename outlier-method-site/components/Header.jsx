"use client";
import { useEffect, useRef, useState } from "react";
import Weather from "./Weather";

const NAV = [
  { label: "Home", href: "/", active: true },
  { label: "Field Tests", href: "/field-tests" },
  { label: "Trusted Products", href: "/gear" },
  { label: "Outlier Originals", href: "/originals" },
  { label: "State Guides", href: "/states" },
  { label: "Trip Planner", href: "/trip-planner" },
  { label: "Map", href: "/map" },
  { label: "Blog", href: "/blog" },
  { label: "Podcast", href: "/podcast" },
  { label: "About", href: "/about" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        toggleRef.current && !toggleRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <header>
      <div className="header-inner">
        <a href="/" className="logo">
          <img src="/logo.png" alt="Outlier Method" className="logo-badge" />
          <div className="logo-text">
            <div className="name display">Outlier Method</div>
            <div className="tag">The Outdoors Belongs To Everyone.</div>
          </div>
        </a>
        <nav>
          {NAV.map((item) => (
            <a key={item.label} href={item.href} className={item.active ? "active" : ""}>
              {item.label}
            </a>
          ))}
        </nav>
        <Weather />
        <button
          ref={toggleRef}
          type="button"
          className="mobile-nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
      {open && (
        <div className="mobile-nav-panel" ref={panelRef}>
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={item.active ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
