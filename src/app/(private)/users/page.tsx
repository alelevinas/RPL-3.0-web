"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import * as usersService from "@/services/usersService";
import type { Student } from "@/types";
import CustomSnackbar from "@/components/CustomSnackbar";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";

const AVATAR_COLORS = ["#005BAA", "#16A34A", "#C47F00", "#DC2626", "#7C3AED"];

function Avatar({ name }: { name: string }) {
  const color = AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  return (
    <Box sx={{
      width: 30, height: 30, borderRadius: "50%", background: `${color}22`, color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "11px", fontWeight: 700, flexShrink: 0,
    }}>
      {name[0]?.toUpperCase()}
    </Box>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const { isDark } = useThemeMode();
  const t = isDark ? darkTokens : lightTokens;

  useEffect(() => {
    usersService.getAll().then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (userId: number) => {
    try {
      await usersService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch { setError("Error al eliminar usuario"); }
  };

  const filtered = users.filter((u) =>
    `${u.name} ${u.surname} ${u.email} ${u.username} ${u.student_id}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}><CircularProgress sx={{ color: t.blue }} /></Box>;

  const headSx = {
    fontSize: "11px", fontWeight: 700, color: t.textMuted, textTransform: "uppercase" as const,
    letterSpacing: "0.6px", padding: "10px 14px", background: t.surface2,
    borderBottom: `1px solid ${t.border}`, textAlign: "left" as const,
  };
  const cellSx = { fontSize: "13px", color: t.text, padding: "10px 14px", borderBottom: `1px solid ${t.border}` };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "24px" }}>
        <Box>
          <Typography sx={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.8px", color: t.text, lineHeight: 1.1 }}>
            Usuarios
          </Typography>
          <Typography sx={{ fontSize: "14px", color: t.textMuted, mt: "4px" }}>
            {filtered.length} usuario{filtered.length !== 1 ? "s" : ""}
            {search ? ` para "${search}"` : ""}
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{ position: "relative" }}>
          <SearchIcon sx={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: 16, color: t.textSoft }} />
          <Box
            component="input"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Buscar usuarios…"
            sx={{
              padding: "8px 12px 8px 32px", fontSize: "13px", fontFamily: "inherit",
              color: t.text, background: t.surface2, border: `1px solid ${t.border}`,
              borderRadius: "8px", outline: "none", width: "240px",
              "&:focus": { borderColor: t.blue },
            }}
          />
        </Box>
      </Box>

      <Box sx={{ border: `1px solid ${t.border}`, borderRadius: "10px", overflow: "hidden" }}>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <Box component="thead">
            <Box component="tr">
              <Box component="th" sx={{ ...headSx, width: "44px" }} />
              <Box component="th" sx={headSx}>Nombre</Box>
              <Box component="th" sx={headSx}>Usuario</Box>
              <Box component="th" sx={headSx}>Email</Box>
              <Box component="th" sx={headSx}>Padrón</Box>
              <Box component="th" sx={headSx}>Universidad</Box>
              <Box component="th" sx={{ ...headSx, width: "50px" }} />
            </Box>
          </Box>
          <Box component="tbody">
            {filtered.length === 0 ? (
              <Box component="tr">
                <Box component="td" colSpan={7} sx={{ ...cellSx, textAlign: "center", color: t.textMuted, py: "32px", borderBottom: "none" }}>
                  {search ? "No se encontraron usuarios" : "No hay usuarios"}
                </Box>
              </Box>
            ) : filtered.map((user) => (
              <Box component="tr" key={user.id} sx={{ "&:last-child td": { borderBottom: "none" } }}>
                <Box component="td" sx={{ ...cellSx, py: "8px" }}><Avatar name={user.name} /></Box>
                <Box component="td" sx={{ ...cellSx, fontWeight: 500 }}>{user.name} {user.surname}</Box>
                <Box component="td" sx={{ ...cellSx, color: t.textMuted, fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "12px" }}>{user.username}</Box>
                <Box component="td" sx={{ ...cellSx, color: t.textMuted }}>{user.email}</Box>
                <Box component="td" sx={{ ...cellSx, color: t.textMuted }}>{user.student_id}</Box>
                <Box component="td" sx={{ ...cellSx, color: t.textMuted }}>{user.university}</Box>
                <Box component="td" sx={cellSx}>
                  <Box
                    component="button"
                    onClick={() => handleDelete(user.id)}
                    sx={{ background: "none", border: "none", cursor: "pointer", color: t.red, display: "flex", alignItems: "center", p: "4px", borderRadius: "5px", "&:hover": { background: t.redBg } }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
    </Box>
  );
}
