import Ticker from "../../components/Ticker";
import Header from "../../components/Header";
import FieldAudio from "../../components/FieldAudio";
import { Footer } from "../../components/Sections";
import { getPodcastEpisodes } from "../../lib/podcast";
import { formatDate } from "../../lib/posts";

export const metadata = {
  title: "The Outlier Method Podcast — Outlier Method",
  description:
    "The Outlier Mindset for the Modern Man — frontier history, survival stories, and grit, every week.",
};

const SHOW_URL = "https://podcasts.apple.com/us/podcast/outlier-method-podcast/id1854463835";

export default async function PodcastPage() {
  const episodes = await getPodcastEpisodes();

  return (
    <>
      <Ticker />
      <Header />
      <div className="wrap">
        <div className="blog-head">
          <h1 className="display">The Outlier Method Podcast</h1>
          <p>
            The Outlier Mindset for the Modern Man — frontier history, survival stories,
            and grit, every week.
          </p>
        </div>

        <div className="podcast-embed-row">
          <div className="podcast-embed">
            <iframe
              title="The Outlier Method Podcast — Apple Podcasts"
              allow="autoplay *; encrypted-media *;"
              frameBorder="0"
              height="450"
              style={{ width: "100%", overflow: "hidden", background: "transparent" }}
              sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
              src="https://embed.podcasts.apple.com/us/podcast/outlier-method-podcast/id1854463835"
            />
          </div>
          <div className="podcast-listen-box">
            <h3 className="display">Listen Anywhere</h3>
            <p>Prefer Spotify? The show streams there too.</p>
            <a
              href="https://podcasters.spotify.com/pod/show/outlier-method"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-solid"
            >
              Listen on Spotify →
            </a>
            <a
              href={SHOW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              Open in Apple Podcasts →
            </a>
          </div>
        </div>

        {episodes.length === 0 ? (
          <p className="blog-empty">
            Couldn&apos;t load episodes right now — check back soon, or listen directly on{" "}
            <a href={SHOW_URL} target="_blank" rel="noopener noreferrer">
              Apple Podcasts
            </a>
            .
          </p>
        ) : (
          <div className="blog-grid">
            {episodes.map((ep) => (
              <a
                key={ep.link || ep.title}
                href={ep.link || SHOW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="blog-card"
              >
                <div className="b-meta">{formatDate(ep.pubDate) || "Episode"}</div>
                <h2 className="display">{ep.title}</h2>
                {ep.description && <p>{ep.description}</p>}
                <span className="b-read">🎙 Listen →</span>
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
