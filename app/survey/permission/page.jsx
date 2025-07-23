import { Suspense } from "react";
import PermissionPage from "./PermissionPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PermissionPage />
    </Suspense>
  );
}
