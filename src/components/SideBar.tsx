"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import ListIcon from "@mui/icons-material/List";
import PeopleIcon from "@mui/icons-material/People";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter, useParams, usePathname } from "next/navigation";
import { hasPermission } from "@/utils/permissions";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";

const SIDEBAR_WIDTH = 220;

type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
};

type Props = {
  open: boolean;
  permissions?: string[];
};

export default function SideBar({ open, permissions = [] }: Props) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { isDark } = useThemeMode();
  const courseId = params?.courseId as string | undefined;

  if (!courseId) return null;

  const t = isDark ? darkTokens : lightTokens;
  const canEdit = hasPermission(permissions, "course_edit");
  const canManageUsers = hasPermission(permissions, "user_manage");

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: <GridViewIcon sx={{ fontSize: 17 }} />,
      path: `/courses/${courseId}/dashboard`,
    },
    {
      label: "Actividades",
      icon: <ListIcon sx={{ fontSize: 17 }} />,
      path: `/courses/${courseId}/activities`,
    },
    ...(canManageUsers
      ? [{
          label: "Alumnos",
          icon: <PeopleIcon sx={{ fontSize: 17 }} />,
          path: `/courses/${courseId}/students`,
        }]
      : []),
    ...(canEdit
      ? [{
          label: "Editar curso",
          icon: <DriveFileRenameOutlineIcon sx={{ fontSize: 17 }} />,
          path: `/courses/${courseId}/edit`,
        }]
      : []),
  ];

  return (
    <Box
      component="nav"
      aria-label="course navigation"
      sx={{
        position: "fixed",
        top: "54px",
        left: open ? 0 : `${-(SIDEBAR_WIDTH + 4)}px`,
        width: `${SIDEBAR_WIDTH}px`,
        height: "calc(100vh - 54px)",
        background: t.surface,
        borderRight: `1px solid ${t.border}`,
        zIndex: 90,
        overflowY: "auto",
        transition: "left 0.22s cubic-bezier(0.4,0,0.2,1)",
        display: "flex",
        flexDirection: "column",
        pt: "12px",
        pb: "16px",
      }}
    >
      {/* Back to all courses */}
      <Box
        onClick={() => router.push("/courses")}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          px: "14px",
          py: "9px",
          mx: "6px",
          mb: "8px",
          borderRadius: "7px",
          cursor: "pointer",
          color: t.textMuted,
          transition: "background 0.12s",
          "&:hover": { background: t.surface2 },
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && router.push("/courses")}
        aria-label="back to all courses"
      >
        <ArrowBackIcon sx={{ fontSize: 14 }} />
        <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "inherit" }}>
          Todos los cursos
        </Typography>
      </Box>

      {/* Nav items */}
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.path);
        return (
          <Box
            key={item.path}
            onClick={() => router.push(item.path)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              px: "14px",
              py: "9px",
              mx: "6px",
              my: "1px",
              borderRadius: "7px",
              cursor: "pointer",
              background: isActive ? t.blueBg : "transparent",
              color: isActive ? t.blue : t.text,
              fontWeight: isActive ? 600 : 400,
              "& svg": { opacity: isActive ? 1 : 0.55 },
              transition: "background 0.12s, color 0.12s",
              "&:hover": {
                background: isActive ? t.blueBg : t.surface2,
              },
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && router.push(item.path)}
            aria-current={isActive ? "page" : undefined}
          >
            {item.icon}
            <Typography sx={{ fontSize: "14px", fontWeight: "inherit", color: "inherit" }}>
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
