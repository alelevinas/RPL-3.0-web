"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state";
import { Box, Container } from "@mui/material";
import TopBar from "@/components/TopBar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const state = useAppState();
  const router = useRouter();

  useEffect(() => {
    if (state.token) {
      router.replace("/courses");
    }
  }, [state.token, router]);

  return (
    <Box>
      <TopBar />
      <Container maxWidth="sm" sx={{ mt: 12 }}>
        {children}
      </Container>
    </Box>
  );
}
