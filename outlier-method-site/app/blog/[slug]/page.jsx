import { notFound } from "next/navigation";
import Ticker from "../../../components/Ticker";
import Header from "../../../components/Header";
import FieldAudio from "../../../components/FieldAudio";
import { Footer } from "../../../components/Sections";
import { getAllPosts, getPostBySlug, formatDate } from "../../../lib/posts";

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
      authors: post.author ? [post.author] : undefined,
      url: `https://outliermethod.org/blog/${post.slug}`,
    },
  };
}

export default function BlogPost({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: post.author ? { "@type": "Person", name: post.author } : undefined,
    publisher: { "@type": "Organization", name: "Outlier Method" },
    mainEntityOfPage: `https://outliermethod.org/blog/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Ticker />
      <Header />
      <div className="wrap">
        <article className="post">
          <a href="/blog" className="post-back">
            ← Back to the Blog
          </a>
          <div className="post-meta">
            {formatDate(post.date)}
            {post.author ? ` · ${post.author}` : ""}
          </div>
          <h1 className="display">{post.title}</h1>
          <div className="post-body" dangerouslySetInnerHTML={{ __html: post.html }} />
        </article>
      </div>
      <Footer />
      <FieldAudio />
    </>
  );
}
