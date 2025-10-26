"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MCenterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/mcenter/overview");
  }, [router]);

  return null;
}

