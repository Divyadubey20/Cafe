"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CategoryRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "12";

  useEffect(() => {
    // Redirect to home and let the inline chips filter it
    router.replace(`/home?table=${table}`);
  }, [router, table]);

  return null;
}

export default function CategoryPageRedirect() {
  return (
    <Suspense fallback={null}>
      <CategoryRedirectContent />
    </Suspense>
  );
}
