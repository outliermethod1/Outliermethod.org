import Weather from "./Weather";

const NAV = [
  { label: "Home", href: "/", active: true },
  { label: "Trusted Products", href: "#products" },
  { label: "Outlier Originals", href: "#originals" },
  { label: "Woodworking", href: "#woodworking" },
  { label: "State Guides", href: "#states" },
  { label: "Message Board", href: "#community" },
  { label: "Blog", href: "/blog" },
];

export default function Header() {
  return (
    <header>
      <div className="header-inner">
        <a href="/" className="logo">
          <div className="logo-badge">⛰</div>
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
      </div>
    </header>
  );
}
