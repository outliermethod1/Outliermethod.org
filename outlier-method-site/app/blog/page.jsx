import Ticker from "../../components/Ticker";
import Header from "../../components/Header";
import FieldAudio from "../../components/FieldAudio";
import AuthorAvatar from "../../components/AuthorAvatar";
import { Footer } from "../../components/Sections";
import { getAllPosts, formatDate } from "../../lib/posts";

export const metadata = {
  title: "Blog — Outlier Method",
  description:
    "Field notes, gear breakdowns, and honest advice from Outlier Method — no sponsorships, no fluff.",
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <>
      <Ticker />
      <Header />
      <div className="wrap">
        <div className="blog-head">
          <h1 className="display">The Blog</h1>
          <p>Field notes, gear breakdowns, and honest advice — no sponsorships, no fluff.</p>
        </div>

        {posts.length === 0 ? (
          <p className="blog-empty">No posts yet. Check back soon.</p>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => (
              <a key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
                <div className="b-meta">{formatDate(post.date)}</div>
                <h2 className="display">{post.title}</h2>
                {post.excerpt && <p>{post.excerpt}</p>}
                <div className="b-author">
                  <AuthorAvatar author={post.author} className="avatar-28" />
                  <span>{post.author.name}</span>
                </div>
                <span className="b-read">Read More →</span>
              </a>
            ))}
          </div>
        )}
      </div>
      <Footer />
      <FieldAudio />
    </>
  );
}
