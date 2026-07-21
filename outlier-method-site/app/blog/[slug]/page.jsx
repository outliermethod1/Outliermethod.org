import { notFound } from "next/navigation";
import Ticker from "../../../components/Ticker";
import Header from "../../../components/Header";
import FieldAudio from "../../../components/FieldAudio";
import AuthorAvatar from "../../../components/AuthorAvatar";
import { Footer } from "../../../components/Sections";
import { getAllPosts, getPostBySlug, getRelatedPosts, formatDate } from "../../../lib/posts";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) return {};

  return {
    title: `${post.title} — Outlier Method`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author.name],
      url: `https://outliermethod.org/blog/${post.slug}`,
    },
  };
}

export default function BlogPost({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.slug, post.category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    ...(post.updated && { dateModified: post.updated }),
    author: { "@type": "Person", name: post.author.name },
    publisher: { "@type": "Organization", name: "Outlier Method" },
    mainEntityOfPage: `https://outliermethod.org/blog/${post.slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://outliermethod.org" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://outliermethod.org/blog" },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://outliermethod.org/blog/${post.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Ticker />
      <Header />
      <div className="wrap">
        <article className="post">
          <a href="/blog" className="post-back">
            ← Back to the Blog
          </a>
          <h1 className="display">{post.title}</h1>
          <div className="post-byline">
            <AuthorAvatar author={post.author} className="avatar-40" />
            <div>
              <div className="post-byline-name">{post.author.name}</div>
              <div className="post-byline-meta">
                {post.author.role} · {formatDate(post.date)}
                {post.updated && ` · Updated ${formatDate(post.updated)}`}
              </div>
            </div>
          </div>
          <div className="post-body" dangerouslySetInnerHTML={{ __html: post.html }} />

          {post.podcastEpisode && (
            <a href="/podcast" className="podcast-callout">
              🎙 Related: listen to <strong>{post.podcastEpisode}</strong> on the Outlier
              Method Podcast →
            </a>
          )}

          <div className="author-box">
            <AuthorAvatar author={post.author} className="avatar-64" />
            <div>
              <div className="author-box-name">{post.author.name}</div>
              <div className="author-box-role">{post.author.role}</div>
              <p className="author-box-bio">{post.author.bio}</p>
            </div>
          </div>

          {related.length > 0 && (
            <div className="related-posts">
              <h2 className="display">More from the Field</h2>
              <div className="blog-grid related-grid">
                {related.map((rel) => (
                  <a key={rel.slug} href={`/blog/${rel.slug}`} className="blog-card">
                    <div className="b-meta">{formatDate(rel.date)}</div>
                    <h3 className="display">{rel.title}</h3>
                    {rel.excerpt && <p>{rel.excerpt}</p>}
                    <div className="b-author">
                      <AuthorAvatar author={rel.author} className="avatar-28" />
                      <span>{rel.author.name}</span>
                    </div>
                    <span className="b-read">Read More →</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
      <Footer />
      <FieldAudio />
    </>
  );
}
