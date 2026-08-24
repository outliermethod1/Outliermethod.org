import { Suspense } from "react";
import { CoachApp } from "@/components/coach/CoachApp";

export default function CoachPage() {
  return (
    <Suspense fallback={null}>
      <CoachApp />
    </Suspense>
  );
}
