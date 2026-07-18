import ComingSoonPage from "../../components/ComingSoonPage";

export const metadata = {
  title: "Trusted Products — Coming Soon — Outlier Method",
  description:
    "Field-testing is underway. Every product will carry an Outlier Score before it ever gets listed.",
};

export default function GearPage() {
  return (
    <ComingSoonPage title="Trusted Products — In the Works">
      <p>
        Field-testing is already underway. Every product that lands here will carry a
        full Outlier Score — durability, value, repairability, and beginner-friendliness
        — before it ever gets listed. Nothing goes up that we wouldn&apos;t stake a hunt
        on. Coming soon.
      </p>
    </ComingSoonPage>
  );
}
