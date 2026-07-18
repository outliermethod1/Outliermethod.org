import ComingSoonPage from "../../components/ComingSoonPage";

export const metadata = {
  title: "The Message Board — Coming Soon — Outlier Method",
  description:
    "A place for real people to trade field knowledge — being built the right way, not the fast way.",
};

export default function CommunityPage() {
  return (
    <ComingSoonPage title="The Message Board — Coming Soon">
      <p>
        We&apos;re building a place for real people to trade field knowledge — public
        land questions, gear wins, hard-earned lessons, the stuff that doesn&apos;t fit
        in a comment section. It&apos;s being built the right way, not the fast way.
      </p>
    </ComingSoonPage>
  );
}
