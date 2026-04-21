"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state";
import { Box } from "@mui/material";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const state = useAppState();
  const router = useRouter();
  const { isDark } = useThemeMode();
  const t = isDark ? darkTokens : lightTokens;

  useEffect(() => {
    if (state.token) {
      router.replace("/courses");
    }
  }, [state.token, router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: t.bg,
        transition: "background-color 0.2s",
        px: 2,
      }}
    >
      {children}
    </Box>
  );
}
