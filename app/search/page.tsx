import { Suspense } from "react";
import SearchClientPage from "./SearchClient";

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading search...</div>}>
      <SearchClientPage />
    </Suspense>
  );
}
