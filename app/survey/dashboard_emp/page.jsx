// /app/survey/dashboard_emp/page.jsx
import React, { Suspense } from "react";
import DashboardEmp from "./components/DashboardEmp";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardEmp />
    </Suspense>
  );
}
