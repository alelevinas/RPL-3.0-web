"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state";
import { Box, Toolbar } from "@mui/material";
import TopBar from "@/components/TopBar";
import SideBar from "@/components/SideBar";
import * as authService from "@/services/authenticationService";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const state = useAppState();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!state.token) {
      router.replace("/login");
      return;
    }
    if (!state.profile) {
      authService.getProfile().then((p) => state.set("profile", p)).catch(() => {
        state.invalidate();
        router.replace("/login");
      });
    }
  }, [state.token]);

  if (!state.token) return null;

  return (
    <Box sx={{ display: "flex" }}>
      <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} showMenu />
      <SideBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} permissions={state.permissions as string[] || []} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
