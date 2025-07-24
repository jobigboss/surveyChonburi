import { Suspense } from "react";
import PermissionNoPage from "./Permission_noPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PermissionNoPage />
    </Suspense>
  );
}
