import { Suspense } from "react";
import SurveyMenu from "./SurveyMenu";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SurveyMenu />
    </Suspense>
  );
}
