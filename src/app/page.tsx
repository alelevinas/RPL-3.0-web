"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state";

export default function Home() {
  const router = useRouter();
  const state = useAppState();

  useEffect(() => {
    if (state.token) {
      router.replace("/courses");
    } else {
      router.replace("/login");
    }
  }, [state.token, router]);

  return null;
}
