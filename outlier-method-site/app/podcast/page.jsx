import Ticker from "../../components/Ticker";
import Header from "../../components/Header";
import FieldAudio from "../../components/FieldAudio";
import { Footer } from "../../components/Sections";

export const metadata = {
  title: "The Outlier Method Podcast — Outlier Method",
  description:
    "The Outlier Mindset for the Modern Man — frontier history, survival stories, and grit, every week.",
};

const EPISODES = [
  {
    title: "Tom Tobin and the Bloody Espinozas",
    description:
      "The frontier tracker who rode down Colorado's most feared outlaw brothers — and what it took to actually catch them.",
  },
  {
    title: "John Wesley Hardin",
    description:
      "One of the Old West's most notorious and complicated gunfighters, and the code he claimed justified it all.",
  },
  {
    title: "The Musashi-Inspired Interview",
    description:
      "A conversation on discipline, mastery, and the way of the swordsman, pulled from Miyamoto Musashi's philosophy.",
  },
  {
    title: "Beck Weathers Survival Series",
    description:
      "Left for dead on Everest, he walked off the mountain anyway. What survival instinct actually looks like under the worst conditions.",
  },
  {
    title: "Stephen Callahan's Survival Story",
    description:
      "Seventy-six days adrift alone in a life raft in the Atlantic — and the resourcefulness it took to outlast the odds.",
  },
];

export default function PodcastPage() {
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
              href="https://podcasts.apple.com/us/podcast/outlier-method-podcast/id1854463835"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              Open in Apple Podcasts →
            </a>
          </div>
        </div>

        <div className="blog-grid">
          {EPISODES.map((ep) => (
            <a
              key={ep.title}
              href="https://podcasts.apple.com/us/podcast/outlier-method-podcast/id1854463835"
              target="_blank"
              rel="noopener noreferrer"
              className="blog-card"
            >
              <div className="ft-category">Episode</div>
              <h2 className="display">{ep.title}</h2>
              <p>{ep.description}</p>
              <span className="b-read">🎙 Listen on Apple Podcasts →</span>
            </a>
          ))}
        </div>
      </div>
      <Footer />
      <FieldAudio />
    </>
  );
}
