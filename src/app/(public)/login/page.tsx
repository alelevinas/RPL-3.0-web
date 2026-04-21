"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Alert, Button } from "@mui/material";
import NextLink from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/lib/state";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";
import * as authService from "@/services/authenticationService";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="label"
      sx={{
        display: "block",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.4px",
        textTransform: "uppercase",
        mb: "6px",
      }}
    >
      {children}
    </Box>
  );
}

type InputProps = {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  tokens: typeof lightTokens;
};

function StyledInput({ type = "text", value, onChange, placeholder, required, autoFocus, tokens: t }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <Box
      component="input"
      type={type}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      autoFocus={autoFocus}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      sx={{
        display: "block",
        width: "100%",
        padding: "9px 12px",
        fontSize: "14px",
        fontFamily: "inherit",
        color: t.text,
        background: t.surface2,
        border: `1.5px solid ${focused ? t.blue : t.border}`,
        borderRadius: "7px",
        outline: "none",
        transition: "border-color 0.12s",
        boxSizing: "border-box",
        "&::placeholder": { color: t.textSoft },
      }}
    />
  );
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [emailNotValidated, setEmailNotValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const state = useAppState();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/courses";
  const { isDark } = useThemeMode();
  const t = isDark ? darkTokens : lightTokens;

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("sessionExpired")) {
      setSessionExpired(true);
      localStorage.removeItem("sessionExpired");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailNotValidated(false);
    setLoading(true);
    try {
      const response = await authService.login({ username, password });
      state.set("token", { tokenType: response.token_type, accessToken: response.access_token });
      const profile = await authService.getProfile();
      state.set("profile", profile);
      router.push(next);
    } catch (err: unknown) {
      const apiErr = err as { err?: { detail?: string } };
      if (apiErr?.err?.detail === "Email not validated") {
        setEmailNotValidated(true);
      } else {
        setError(apiErr?.err?.detail || "Usuario o contraseña incorrectos");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      await authService.resendEmailToken(username);
      setEmailNotValidated(false);
      setError("");
    } catch {
      setError("Error al reenviar el correo de validación");
    }
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
      {/* Logo + wordmark */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <Image src="/logo_large.png" alt="RPL logo" width={52} height={52} />
        <Box sx={{ textAlign: "center" }}>
          <Typography
            sx={{
              fontSize: "24px",
              fontWeight: 800,
              letterSpacing: "-0.8px",
              color: t.text,
              lineHeight: 1.1,
            }}
          >
            RPL 3.0
          </Typography>
          <Typography sx={{ fontSize: "14px", color: t.textMuted, mt: "4px" }}>
            Sistema de ejercicios de programación · FIUBA
          </Typography>
        </Box>
      </Box>

      {/* Card */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "380px",
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: "14px",
          padding: "28px 28px 24px",
        }}
      >
        {sessionExpired && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: "8px" }}>
            Tu sesión expiró. Por favor, ingresá de nuevo.
          </Alert>
        )}

        {emailNotValidated && (
          <Alert
            severity="warning"
            sx={{ mb: 2, borderRadius: "8px" }}
            action={
              <Button color="inherit" size="small" onClick={handleResendEmail}>
                Reenviar
              </Button>
            }
          >
            Primero debés validar tu correo electrónico.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Box>
            <FieldLabel>Usuario</FieldLabel>
            <StyledInput
              value={username}
              onChange={setUsername}
              autoFocus
              required
              tokens={t}
            />
          </Box>

          <Box>
            <FieldLabel>Contraseña</FieldLabel>
            <StyledInput
              type="password"
              value={password}
              onChange={setPassword}
              required
              tokens={t}
            />
          </Box>

          <Box
            component="button"
            type="submit"
            disabled={loading}
            sx={{
              width: "100%",
              padding: "11px 0",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "inherit",
              letterSpacing: "0.1px",
              background: loading ? t.surface2 : t.blue,
              color: loading ? t.textMuted : "#fff",
              border: "none",
              borderRadius: "9px",
              cursor: loading ? "default" : "pointer",
              transition: "background 0.12s, color 0.12s",
              mt: "4px",
            }}
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </Box>
        </Box>

        {/* Footer links */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: "20px" }}>
          <Box
            component={NextLink}
            href="/forgot-password"
            sx={{ fontSize: "13px", color: t.blue, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            ¿Olvidaste tu contraseña?
          </Box>
          <Box
            component={NextLink}
            href="/signup"
            sx={{ fontSize: "13px", color: t.blue, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            Crear cuenta
          </Box>
        </Box>
      </Box>

      {/* Page footer */}
      <Typography sx={{ fontSize: "12px", color: t.textSoft, textAlign: "center" }}>
        Facultad de Ingeniería · Universidad de Buenos Aires
      </Typography>
    </Box>
  );
}
