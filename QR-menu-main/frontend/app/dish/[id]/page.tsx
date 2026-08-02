"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function DishRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const table = searchParams.get("table") || "12";

  useEffect(() => {
    router.replace(`/home?table=${table}`);
  }, [router, table]);

  return null;
}

export default function DishPageRedirect() {
  return (
    <Suspense fallback={null}>
      <DishRedirectContent />
    </Suspense>
  );
}
