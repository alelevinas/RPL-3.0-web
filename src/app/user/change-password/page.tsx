"use client";

import React, { Suspense, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import NextLink from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import * as authService from "@/services/authenticationService";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";

function ChangePasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const { isDark } = useThemeMode();
  const t = isDark ? darkTokens : lightTokens;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Las contraseñas no coinciden"); return; }
    setLoading(true);
    setError("");
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Error al resetear la contraseña. El link puede haber expirado.");
    } finally {
      setLoading(false);
    }
  };

  const inputSx = (field: string) => ({
    display: "block", width: "100%", padding: "9px 12px", fontSize: "14px",
    fontFamily: "inherit", color: t.text, background: t.surface2,
    border: `1.5px solid ${focusedField === field ? t.blue : t.border}`,
    borderRadius: "7px", outline: "none", transition: "border-color 0.12s", boxSizing: "border-box" as const,
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: "80px", gap: "24px", minHeight: "100vh", background: t.bg }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.8px", color: t.text }}>Nueva contraseña</Typography>
        <Typography sx={{ fontSize: "14px", color: t.textMuted, mt: "4px" }}>Ingresá tu nueva contraseña</Typography>
      </Box>

      <Box sx={{ width: "100%", maxWidth: "380px", background: t.surface, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "28px 28px 24px" }}>
        {success ? (
          <Box sx={{ textAlign: "center", py: "8px" }}>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: t.green, mb: "8px" }}>¡Contraseña actualizada!</Typography>
            <Typography sx={{ fontSize: "14px", color: t.textMuted }}>Redirigiendo al login…</Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {error && (
              <Box sx={{ background: t.redBg, color: t.red, borderRadius: "8px", padding: "10px 14px", fontSize: "13px" }}>{error}</Box>
            )}
            <Box>
              <Box component="label" sx={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", mb: "6px" }}>Nueva contraseña</Box>
              <Box component="input" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required autoFocus onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)} sx={inputSx("password")} />
            </Box>
            <Box>
              <Box component="label" sx={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", mb: "6px" }}>Confirmar contraseña</Box>
              <Box component="input" type="password" value={confirm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)} required onFocus={() => setFocusedField("confirm")} onBlur={() => setFocusedField(null)} sx={inputSx("confirm")} />
            </Box>
            <Box component="button" type="submit" disabled={loading} sx={{ width: "100%", padding: "11px 0", fontSize: "14px", fontWeight: 700, fontFamily: "inherit", background: loading ? t.surface2 : t.blue, color: loading ? t.textMuted : "#fff", border: "none", borderRadius: "9px", cursor: loading ? "default" : "pointer", transition: "background 0.12s, color 0.12s" }}>
              {loading ? "Guardando…" : "Guardar contraseña"}
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "center", mt: "20px" }}>
          <Box component={NextLink} href="/login" sx={{ fontSize: "13px", color: t.blue, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
            ← Volver al login
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}><CircularProgress /></Box>}>
      <ChangePasswordForm />
    </Suspense>
  );
}
