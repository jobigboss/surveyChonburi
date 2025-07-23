"use client";

import dynamic from "next/dynamic";

const SurveyMenu = dynamic(() => import("./components/SurveyMenu"), { ssr: false });

export default function SurveyPage() {
  return <SurveyMenu />;
}
