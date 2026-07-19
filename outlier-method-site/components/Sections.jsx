import { STATES } from "../lib/config";

export function Manifesto() {
  return (
    <div className="manifesto">
      <div className="m-rule" />
      <p>
        The world keeps telling you to buy more.
        <br />
        We think you need less.
      </p>
      <div className="m-big">
        Less money. Less nonsense.
        <br />
        <span className="up">More mountains. More campfires. More life.</span>
      </div>
    </div>
  );
}

export function ValueStrip() {
  const values = [
    { icon: "🏷", title: "Field Tested", text: "Used hard. Trusted easy. We don't list junk." },
    { icon: "★", title: "Earned", text: "Proven gear at honest prices. Discipline beats a big budget." },
    { icon: "🛠", title: "Built To Last", text: "If it can't take a beating, it doesn't make the list." },
    { icon: "🤝", title: "Pass It Down", text: "Gear worth handing to your kids. That's the standard." },
  ];
  return (
    <div className="value-strip">
      {values.map((v) => (
        <div className="value-item" key={v.title}>
          <div className="value-icon">{v.icon}</div>
          <div>
            <h3 className="display">{v.title}</h3>
            <p>{v.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Categories() {
  const cats = [
    { id: "products", icon: "🛻", bg: "radial-gradient(circle at 50% 40%, #3d4d35 0%, #1f2a1b 100%)", title: "Trusted Products", text: "Our top picks. Field tested. Honest reviews.", btn: "Shop Gear", href: "/gear" },
    { id: "originals", icon: "🧥", bg: "radial-gradient(circle at 50% 40%, #4a3c28 0%, #251e14 100%)", title: "Outlier Originals", text: "Restored classics. Custom gear. Built the Outlier way.", btn: "Shop Originals", href: "/blog" },
    { id: "blog", icon: "🥾", bg: "radial-gradient(circle at 50% 40%, #35483d 0%, #1a2620 100%)", title: "Blog & Adventures", text: "Stories, guides, and hard lessons from the field.", btn: "Read Articles", href: "/blog" },
    { id: "community", icon: "🔥", bg: "radial-gradient(circle at 50% 55%, #55401f 0%, #241a0e 100%)", title: "Message Board", text: "Ask questions. Share wins. Learn from real people.", btn: "Join the Community", href: "/community" },
    { id: "woodworking", icon: "🪚", bg: "radial-gradient(circle at 50% 40%, #4d4030 0%, #241d14 100%)", title: "Woodworking", text: "Projects, tips, and old ways that still build today.", btn: "View Projects", href: "/woodworking" },
  ];
  return (
    <div className="cards-row">
      {cats.map((c) => (
        <div className="cat-card" key={c.title} id={c.id}>
          <div className="cat-img" style={{ background: c.bg }}>
            {c.icon}
          </div>
          <div className="cat-body">
            <h3 className="display">{c.title}</h3>
            <p>{c.text}</p>
            <a href={c.href} className="btn btn-solid">
              {c.btn}
            </a>
          </div>
        </div>
      ))}

      <div className="featured-stack">
        <div className="featured">
          <div className="f-label">Featured Article</div>
          <div className="f-row">
            <div className="f-thumb">🎣</div>
            <div>
              <div className="f-title">5 Vintage Fishing Reels That Still Outperform New Gear</div>
              <a href="/blog">Read More →</a>
            </div>
          </div>
        </div>
        <div className="featured">
          <div className="f-label">Featured Product</div>
          <div className="f-row">
            <div className="f-thumb">🧥</div>
            <div style={{ flexGrow: 1 }}>
              <div className="f-title">Restored Woolrich Mackinaw Jacket</div>
              <div className="f-price">$89.00</div>
              <div className="oscore">
                <div className="os-title">The Outlier Score™</div>
                <div className="os-row">
                  <span>Durability</span>
                  <span className="os-val">★★★★★</span>
                </div>
                <div className="os-row">
                  <span>Value</span>
                  <span className="os-val">💲💲</span>
                </div>
                <div className="os-row">
                  <span>Repairability</span>
                  <span className="os-val">🛠🛠🛠🛠</span>
                </div>
                <div className="os-row">
                  <span>Beginner Friendly</span>
                  <span className="os-val">👍👍👍</span>
                </div>
              </div>
              <a href="/gear">View Product →</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StateGuides() {
  return (
    <div className="states" id="states">
      <div className="section-label">
        <h2 className="display">State Field Guides</h2>
        <div className="rule" />
      </div>
      <div className="states-grid">
        {STATES.map((s) => (
          <a className="state-card" key={s.abbr} href={`/states/${s.name.toLowerCase()}`}>
            <div className="st-abbr">{s.abbr}</div>
            <h3 className="display">{s.name}</h3>
            <p>Wildlife · Public Land · Camping · Fishing</p>
            <div className="st-tags">{s.tags}</div>
          </a>
        ))}
        <a className="state-card" href="/states">
          <div className="st-abbr">＋</div>
          <h3 className="display">All States</h3>
          <p>Every state guide, one place.</p>
          <div className="st-tags">Explore the map →</div>
        </a>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="wrap footer-grid">
        <div>
          <h4>About Outlier Method</h4>
          <p>
            We believe the outdoors belongs to everyone. Not just the wealthy. Not
            just the experts.
          </p>
          <p style={{ marginTop: 8 }}>
            <a href="/about" style={{ color: "var(--moss-bright)" }}>
              Learn more about our mission →
            </a>
          </p>
          <p style={{ marginTop: 8 }}>
            <a href="/why-trust-us" style={{ color: "var(--moss-bright)" }}>
              Why Trust Us
            </a>
          </p>
          <p style={{ marginTop: 8 }}>
            <a href="/disclosure" style={{ color: "var(--moss-bright)" }}>
              Affiliate Disclosure
            </a>
          </p>
        </div>
        <div>
          <h4>Popular Topics</h4>
          <ul>
            <li>Public Land Hunting</li>
            <li>Vintage Gear Guides</li>
            <li>Fishing, Started Smart</li>
            <li>DIY &amp; Restoration</li>
            <li>Backcountry Camping</li>
            <li>Survival Skills</li>
          </ul>
        </div>
        <div>
          <h4>Follow the Journey</h4>
          <div className="footer-social">
            <span>📷</span>
            <span>▶</span>
            <span>ⓕ</span>
            <span>✉</span>
          </div>
        </div>
        <div>
          <h4>Outlier Method</h4>
          <p>
            The Outdoors
            <br />
            Belongs To Everyone.
          </p>
        </div>
      </div>
    </footer>
  );
}
