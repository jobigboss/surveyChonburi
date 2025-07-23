import { Suspense } from "react";
import SurveyMenuClient from "./components/SurveyMenuClient";

export default function SurveyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SurveyMenuClient />
    </Suspense>
  );
}
