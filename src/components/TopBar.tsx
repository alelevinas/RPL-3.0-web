"use client";

import React, { useState } from "react";
import { Box, IconButton, Avatar, Menu, MenuItem, Divider, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import ReplayIcon from "@mui/icons-material/Replay";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";
import { useAppState } from "@/lib/state";
import { useRouter } from "next/navigation";
import Image from "next/image";
import * as submissionsService from "@/services/submissionsService";
import CustomSnackbar from "@/components/CustomSnackbar";

type Props = {
  onMenuClick?: () => void;
  showMenu?: boolean;
};

const AVATAR_COLORS = ["#005BAA", "#16A34A", "#D97706", "#DC2626", "#7C3AED"];

function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % 5];
}

function getInitials(name?: string, surname?: string): string {
  return `${name?.[0] ?? ""}${surname?.[0] ?? ""}`.toUpperCase();
}

export default function TopBar({ onMenuClick, showMenu = false }: Props) {
  const { isDark, toggle } = useThemeMode();
  const state = useAppState();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [reprocessing, setReprocessing] = useState(false);
  const [reprocessMsg, setReprocessMsg] = useState("");

  const profile = state.profile as { name?: string; surname?: string; img_uri?: string; is_admin?: boolean } | undefined;
  const isLoggedIn = !!state.token;
  const isAdmin = !!profile?.is_admin;

  const t = isDark ? darkTokens : lightTokens;

  const handleReprocess = async () => {
    setReprocessing(true);
    try {
      const result = await submissionsService.reprocessAll() as unknown[];
      setReprocessMsg(`${result.length} submission(s) requeued`);
    } catch {
      setReprocessMsg("Error triggering reprocess");
    } finally {
      setReprocessing(false);
    }
  };

  const handleLogout = () => {
    state.invalidate();
    router.push("/login");
    setAnchorEl(null);
  };

  return (
    <>
      <Box
        component="header"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "54px",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          px: "16px",
          gap: "4px",
          background: isDark ? "rgba(26,26,30,0.95)" : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        {/* Left: hamburger + logo */}
        {showMenu && (
          <IconButton
            onClick={onMenuClick}
            size="small"
            sx={{ color: t.textMuted, mr: "4px" }}
            aria-label="toggle sidebar"
          >
            <MenuIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}

        <Box
          onClick={() => router.push(isLoggedIn ? "/courses" : "/login")}
          sx={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && router.push(isLoggedIn ? "/courses" : "/login")}
          aria-label="go to home"
        >
          <Image
            src={isDark ? "/logo_white_large.png" : "/logo_large.png"}
            alt="RPL logo"
            width={26}
            height={26}
          />
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 800,
              letterSpacing: "-0.8px",
              color: t.text,
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            RPL 3.0
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Admin reprocess button */}
        {isAdmin && (
          <IconButton
            onClick={handleReprocess}
            disabled={reprocessing}
            size="small"
            sx={{ color: t.textMuted }}
            aria-label="reprocess stuck submissions"
            title="Reprocess stuck submissions"
          >
            <ReplayIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}

        {/* Theme toggle */}
        <IconButton
          onClick={toggle}
          size="small"
          sx={{ color: t.textMuted }}
          aria-label={isDark ? "switch to light mode" : "switch to dark mode"}
        >
          {isDark
            ? <Brightness7Icon sx={{ fontSize: 18 }} />
            : <Brightness4Icon sx={{ fontSize: 18 }} />
          }
        </IconButton>

        {/* User avatar */}
        {isLoggedIn && profile && (
          <>
            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                ml: "4px",
                borderRadius: "7px",
                px: "8px",
                py: "4px",
                transition: "background 0.12s",
                "&:hover": { background: t.surface2 },
              }}
              role="button"
              aria-label="user menu"
              aria-haspopup="true"
              aria-expanded={!!anchorEl}
            >
              <Avatar
                src={profile.img_uri || undefined}
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: "12px",
                  fontWeight: 700,
                  bgcolor: profile.img_uri ? undefined : getAvatarColor(profile.name || "U"),
                }}
              >
                {!profile.img_uri && getInitials(profile.name, profile.surname)}
              </Avatar>
              <Typography sx={{ fontSize: "13px", fontWeight: 500, color: t.text, lineHeight: 1 }}>
                {profile.name} {profile.surname}
              </Typography>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={!!anchorEl}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                sx: {
                  mt: "6px",
                  minWidth: 200,
                  borderRadius: "10px",
                  border: `1px solid ${t.border}`,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  background: t.surface,
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "14px", color: t.text }}>
                  {profile.name} {profile.surname}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: t.border }} />
              <MenuItem
                onClick={handleLogout}
                sx={{ gap: 1.5, color: t.text, fontSize: "14px", py: 1.5 }}
              >
                <LogoutIcon sx={{ fontSize: 16 }} />
                Cerrar sesión
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>

      <CustomSnackbar
        open={!!reprocessMsg}
        message={reprocessMsg}
        severity={reprocessMsg.includes("Error") ? "error" : "success"}
        onClose={() => setReprocessMsg("")}
      />
    </>
  );
}
