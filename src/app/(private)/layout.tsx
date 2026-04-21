"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppState } from "@/lib/state";
import { Box } from "@mui/material";
import TopBar from "@/components/TopBar";
import SideBar from "@/components/SideBar";
import * as authService from "@/services/authenticationService";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const state = useAppState();
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useThemeMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show sidebar on course-specific pages (path: /courses/:courseId/...)
  const pathParts = pathname.split("/");
  const hasSidebar =
    pathParts[1] === "courses" &&
    !!pathParts[2] &&
    /^\d+$/.test(pathParts[2]);

  const t = isDark ? darkTokens : lightTokens;

  useEffect(() => {
    if (!state.hydrated) return;
    if (!state.token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!state.profile) {
      authService
        .getProfile()
        .then((p) => state.set("profile", p))
        .catch(() => {
          state.invalidate();
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        });
    }
  }, [state.hydrated, state.token]);

  // Close sidebar when leaving a course context
  useEffect(() => {
    if (!hasSidebar) setSidebarOpen(false);
  }, [hasSidebar]);

  if (!state.hydrated || !state.token) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: t.bg, transition: "background-color 0.2s" }}>
      <TopBar
        onMenuClick={() => setSidebarOpen((v) => !v)}
        showMenu={hasSidebar}
      />

      {hasSidebar && (
        <SideBar
          open={sidebarOpen}
          permissions={(state.permissions as string[]) || []}
        />
      )}

      <Box
        component="main"
        sx={{
          paddingTop: "54px",
          paddingLeft: hasSidebar && sidebarOpen ? "220px" : "0px",
          transition: "padding-left 0.22s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <Box
          sx={{
            padding: "28px 28px 48px",
            maxWidth: "1160px",
            margin: "0 auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
