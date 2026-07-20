import { notFound } from "next/navigation";
import Ticker from "../../../components/Ticker";
import Header from "../../../components/Header";
import FieldAudio from "../../../components/FieldAudio";
import AuthorAvatar from "../../../components/AuthorAvatar";
import OutlierScore from "../../../components/OutlierScore";
import { Footer } from "../../../components/Sections";
import { getAllFieldTests, getFieldTestBySlug, getOutlierScoreAverage } from "../../../lib/fieldTests";
import { formatDate } from "../../../lib/posts";

export function generateStaticParams() {
  return getAllFieldTests().map((test) => ({ slug: test.slug }));
}

export function generateMetadata({ params }) {
  const test = getFieldTestBySlug(params.slug);
  if (!test) return {};

  return {
    title: `${test.title} — Field Test — Outlier Method`,
    description: test.description,
    openGraph: {
      title: test.title,
      description: test.description,
      type: "article",
      publishedTime: test.date,
      authors: [test.author.name],
      url: `https://outliermethod.org/field-tests/${test.slug}`,
    },
  };
}

export default function FieldTestPage({ params }) {
  const test = getFieldTestBySlug(params.slug);
  if (!test) notFound();

  const avgScore = getOutlierScoreAverage(test.scores);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: test.title,
    description: test.description,
    category: test.category,
    review: {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: avgScore.toFixed(1),
        bestRating: "5",
        worstRating: "1",
      },
      author: { "@type": "Person", name: test.author.name },
      datePublished: test.date,
    },
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: test.title,
    description: test.description,
    datePublished: test.date,
    ...(test.updated && { dateModified: test.updated }),
    author: { "@type": "Person", name: test.author.name },
    publisher: { "@type": "Organization", name: "Outlier Method" },
    mainEntityOfPage: `https://outliermethod.org/field-tests/${test.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Ticker />
      <Header />
      <div className="wrap">
        <article className="post">
          <a href="/field-tests" className="post-back">
            ← Back to Field Tests
          </a>
          <div className="ft-category">{test.category}</div>
          <h1 className="display">{test.title}</h1>
          <div className="post-byline">
            <AuthorAvatar author={test.author} className="avatar-40" />
            <div>
              <div className="post-byline-name">{test.author.name}</div>
              <div className="post-byline-meta">
                {test.author.role} · {formatDate(test.date)}
                {test.priceRange && ` · ${test.priceRange}`}
              </div>
            </div>
          </div>

          <OutlierScore scores={test.scores} size="lg" />

          <blockquote className="verdict-quote">{test.verdict}</blockquote>

          <div className="post-body" dangerouslySetInnerHTML={{ __html: test.html }} />

          <div className="pros-cons">
            <div className="pros">
              <h3>Pros</h3>
              <ul>
                {test.pros.map((pro) => (
                  <li key={pro}>{pro}</li>
                ))}
              </ul>
            </div>
            <div className="cons">
              <h3>Cons</h3>
              <ul>
                {test.cons.map((con) => (
                  <li key={con}>{con}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="affiliate-box">
            {test.affiliateLink ? (
              <a href={test.affiliateLink} className="btn btn-solid" target="_blank" rel="noopener noreferrer sponsored">
                Check Price →
              </a>
            ) : (
              <p className="affiliate-pending">
                Coming soon — this pick will link out once our gear partnerships are live.
              </p>
            )}
          </div>

          <div className="author-box">
            <AuthorAvatar author={test.author} className="avatar-64" />
            <div>
              <div className="author-box-name">{test.author.name}</div>
              <div className="author-box-role">{test.author.role}</div>
              <p className="author-box-bio">{test.author.bio}</p>
            </div>
          </div>
        </article>
      </div>
      <Footer />
      <FieldAudio />
    </>
  );
}
