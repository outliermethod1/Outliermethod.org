import { MANUFACTURERS } from "../lib/config";
import { getAllFieldTests } from "../lib/fieldTests";
import AuthorAvatar from "./AuthorAvatar";
import OutlierScore from "./OutlierScore";
import LiveField from "./LiveField";
import Campfire from "./Campfire";

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

export function FeaturedReviews() {
  const tests = getAllFieldTests().slice(0, 4);
  if (tests.length === 0) return null;

  return (
    <div className="featured-reviews">
      <div className="section-label">
        <h2 className="display">Featured Reviews</h2>
        <div className="rule" />
      </div>
      <div className="blog-grid field-grid">
        {tests.map((test) => (
          <a key={test.slug} href={`/field-tests/${test.slug}`} className="blog-card field-card">
            <div className="ft-category">{test.category}</div>
            <h3 className="display">{test.title}</h3>
            <div className="b-author">
              <AuthorAvatar author={test.author} className="avatar-28" />
              <span>{test.author.name}</span>
            </div>
            <OutlierScore scores={test.scores} />
            <p className="ft-verdict">&ldquo;{test.verdict}&rdquo;</p>
            <span className="b-read">Read the Field Test →</span>
          </a>
        ))}
      </div>
      <a href="/field-tests" className="campfire-banner">
        See All Field Tests →
      </a>
    </div>
  );
}

export function FeaturedManufacturers() {
  return (
    <div className="manufacturers">
      <div className="section-label">
        <h2 className="display">Featured American Manufacturers</h2>
        <div className="rule" />
      </div>
      <div className="manufacturers-grid">
        {MANUFACTURERS.map((m) => (
          <a key={m.name} href={m.href} className="manufacturer-card">
            <div className="mf-icon">{m.icon}</div>
            <div className="mf-name display">{m.name}</div>
            <span className="mf-link">See the Review →</span>
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

export function CommandCenter() {
  return (
    <div className="command-center">
      <div className="section-label">
        <h2 className="display">The Outlier Command Center</h2>
        <div className="rule" />
      </div>
      <p className="command-center-intro">
        Go deeper: live wildlife cams, trip planning tools, our podcast, and more.
      </p>

      <LiveField />

      <div className="command-grid">
        <a href="/map" className="command-card">
          <div className="cc-icon">🗺️</div>
          <h3 className="display">Interactive Map</h3>
          <p>Live cams, state field guides, and public land — one map. Click anywhere to plan your trip.</p>
          <span className="cc-link">Explore the Map →</span>
        </a>
        <a href="/trip-planner" className="command-card">
          <div className="cc-icon">⛺</div>
          <h3 className="display">Trip Planner</h3>
          <p>Pick your trip, tell us where, get real conditions and a straight read before you go.</p>
          <span className="cc-link">Plan a Trip →</span>
        </a>
        <a href="/podcast" className="command-card">
          <div className="cc-icon">🎙️</div>
          <h3 className="display">The Outlier Method Podcast</h3>
          <p>Frontier history, survival stories, and grit — 6+ episodes and a 5.0 rating.</p>
          <span className="cc-link">Listen Now →</span>
        </a>
        <a href="/states" className="command-card">
          <div className="cc-icon">🧭</div>
          <h3 className="display">State Guides</h3>
          <p>Public land, seasons, and agencies — one page per state we cover.</p>
          <span className="cc-link">Browse States →</span>
        </a>
      </div>

      <Campfire />
      <Categories />
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
