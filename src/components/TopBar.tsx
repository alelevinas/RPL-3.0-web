"use client";

import React from "react";
import { AppBar, Toolbar, Typography, IconButton, Box, Button, Avatar, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useThemeMode } from "@/theme/ThemeProvider";
import { useAppState } from "@/lib/state";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Props = {
  onMenuClick?: () => void;
  showMenu?: boolean;
};

export default function TopBar({ onMenuClick, showMenu = false }: Props) {
  const { isDark, toggle } = useThemeMode();
  const state = useAppState();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const profile = state.profile as { name?: string; surname?: string; img_uri?: string } | undefined;
  const isLoggedIn = !!state.token;

  const handleLogout = () => {
    state.invalidate();
    router.push("/login");
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {showMenu && (
          <IconButton 
            color="inherit" 
            edge="start" 
            onClick={onMenuClick} 
            sx={{ mr: 2 }}
            aria-label="open drawer"
          >
            <MenuIcon />
          </IconButton>
        )}
        <Box 
          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }} 
          onClick={() => router.push(isLoggedIn ? "/courses" : "/login")}
          role="button"
          aria-label="go to home"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && router.push(isLoggedIn ? "/courses" : "/login")}
        >
          <Image src="/logo_white_large.png" alt="RPL logo" width={40} height={40} style={{ marginRight: 8 }} />
          <Typography variant="h6" noWrap>RPL 3.0</Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton 
          color="inherit" 
          onClick={toggle}
          aria-label={isDark ? "switch to light mode" : "switch to dark mode"}
        >
          {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        {isLoggedIn && profile && (
          <>
            <Button 
              color="inherit" 
              onClick={(e) => setAnchorEl(e.currentTarget)} 
              sx={{ ml: 1, textTransform: "none" }}
              aria-label="user profile menu"
              aria-haspopup="true"
              aria-expanded={!!anchorEl}
            >
              <Avatar src={profile.img_uri || undefined} sx={{ width: 32, height: 32, mr: 1 }}>
                {profile.name?.[0]}
              </Avatar>
              {profile.name} {profile.surname}
            </Button>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={() => { router.push("/profile"); setAnchorEl(null); }}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
