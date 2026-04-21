"use client";

import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import NextLink from "next/link";
import * as authService from "@/services/authenticationService";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isDark } = useThemeMode();
  const t = isDark ? darkTokens : lightTokens;
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      setError("Error al enviar el correo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.8px", color: t.text, lineHeight: 1.1 }}>
          Recuperar contraseña
        </Typography>
        <Typography sx={{ fontSize: "14px", color: t.textMuted, mt: "4px" }}>
          Ingresá tu email y te enviaremos un link para resetearla
        </Typography>
      </Box>

      <Box sx={{ width: "100%", maxWidth: "380px", background: t.surface, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "28px 28px 24px" }}>
        {sent ? (
          <Box sx={{ textAlign: "center", py: "8px" }}>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: t.green, mb: "8px" }}>¡Correo enviado!</Typography>
            <Typography sx={{ fontSize: "14px", color: t.textMuted }}>
              Si el email existe en el sistema, recibirás el link para resetear tu contraseña.
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {error && (
              <Box sx={{ background: t.redBg, color: t.red, borderRadius: "8px", padding: "10px 14px", fontSize: "13px" }}>
                {error}
              </Box>
            )}
            <Box>
              <Box component="label" sx={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", mb: "6px" }}>
                Email
              </Box>
              <Box
                component="input"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                autoFocus
                required
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                sx={{
                  display: "block", width: "100%", padding: "9px 12px", fontSize: "14px",
                  fontFamily: "inherit", color: t.text, background: t.surface2,
                  border: `1.5px solid ${focused ? t.blue : t.border}`, borderRadius: "7px",
                  outline: "none", transition: "border-color 0.12s", boxSizing: "border-box",
                }}
              />
            </Box>
            <Box
              component="button"
              type="submit"
              disabled={loading}
              sx={{
                width: "100%", padding: "11px 0", fontSize: "14px", fontWeight: 700,
                fontFamily: "inherit", background: loading ? t.surface2 : t.blue,
                color: loading ? t.textMuted : "#fff", border: "none", borderRadius: "9px",
                cursor: loading ? "default" : "pointer", transition: "background 0.12s, color 0.12s",
              }}
            >
              {loading ? "Enviando…" : "Enviar link"}
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "center", mt: "20px" }}>
          <Box
            component={NextLink}
            href="/login"
            sx={{ fontSize: "13px", color: t.blue, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            ← Volver al login
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
