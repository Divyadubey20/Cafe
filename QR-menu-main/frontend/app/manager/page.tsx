"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ManagerIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/manager/login");
  }, [router]);

  return null;
}
