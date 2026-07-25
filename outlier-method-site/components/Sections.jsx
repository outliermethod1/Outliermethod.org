import { STATES } from "../lib/config";
import { getAllPosts } from "../lib/posts";
import { getAllFieldTests } from "../lib/fieldTests";
import AuthorAvatar from "./AuthorAvatar";

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

export function LatestFromField() {
  const posts = getAllPosts()
    .slice(0, 3)
    .map((post) => ({
      kind: "blog",
      href: `/blog/${post.slug}`,
      title: post.title,
      category: post.category || "Field Notes",
      author: post.author,
      blurb: post.excerpt,
    }));

  const fieldTests = getAllFieldTests().map((test) => ({
    kind: "field-test",
    href: `/field-tests/${test.slug}`,
    title: test.title,
    category: `Field Test · ${test.category}`,
    author: test.author,
    blurb: test.description,
  }));

  const items = [...posts, ...fieldTests];
  if (items.length === 0) return null;

  return (
    <div className="latest-field">
      <div className="section-label">
        <h2 className="display">Latest From the Field</h2>
        <div className="rule" />
      </div>
      <div className="blog-grid">
        {items.map((item) => (
          <a key={item.href} href={item.href} className="blog-card">
            <div className="ft-category">{item.category}</div>
            <h3 className="display">{item.title}</h3>
            {item.blurb && <p>{item.blurb}</p>}
            <div className="b-author">
              <AuthorAvatar author={item.author} className="avatar-28" />
              <span>{item.author.name}</span>
            </div>
            <span className="b-read">
              {item.kind === "field-test" ? "Read the Field Test →" : "Read More →"}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function Categories() {
  const cats = [
    { id: "products", icon: "🛻", bg: "radial-gradient(circle at 50% 40%, #3d4d35 0%, #1f2a1b 100%)", title: "Trusted Products", text: "Our top picks. Field tested. Honest reviews.", btn: "Shop Gear", href: "/field-tests" },
    { id: "originals", icon: "🧥", bg: "radial-gradient(circle at 50% 40%, #4a3c28 0%, #251e14 100%)", title: "Outlier Originals", text: "Restored classics. Custom gear. Built the Outlier way.", btn: "Shop Originals", href: "/originals" },
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
            <div className="f-thumb">🐺</div>
            <div>
              <div className="f-title">Why the Wolf Turns Around (and the Lion Walks On By)</div>
              <a href="/blog/why-the-wolf-turns-around">Read More →</a>
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
      <a href="/map" className="campfire-banner">
        Explore the Interactive Map →
      </a>
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
            <a href="tel:+17192701280" style={{ color: "var(--cream-dim)" }}>
              📞 (719) 270-1280
            </a>
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
          <p style={{ marginTop: 8 }}>
            <a href="/disclaimer" style={{ color: "var(--moss-bright)" }}>
              Disclaimer
            </a>
          </p>
          <p style={{ marginTop: 8 }}>
            <a href="/contact" style={{ color: "var(--moss-bright)" }}>
              Contact
            </a>
          </p>
        </div>
        <div>
          <h4>Popular Topics</h4>
          <ul>
            <li><a href="/field-tests">Field Tests</a></li>
            <li><a href="/blog">Public Land Hunting</a></li>
            <li><a href="/blog">Vintage Gear Guides</a></li>
            <li><a href="/blog">Fishing, Started Smart</a></li>
            <li><a href="/blog">DIY &amp; Restoration</a></li>
            <li><a href="/blog">Backcountry Camping</a></li>
            <li><a href="/blog">Survival Skills</a></li>
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
          <img src="/logo.png" alt="Outlier Method" className="footer-logo" />
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
