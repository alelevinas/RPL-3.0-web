"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import NextLink from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as authService from "@/services/authenticationService";
import CustomSnackbar from "@/components/CustomSnackbar";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Box component="label" sx={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", mb: "6px" }}>
      {children}
    </Box>
  );
}

function StyledInput({ type = "text", value, onChange, placeholder, required, autoFocus, t }: {
  type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; autoFocus?: boolean; t: typeof lightTokens;
}) {
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
        display: "block", width: "100%", padding: "9px 12px", fontSize: "14px",
        fontFamily: "inherit", color: t.text, background: t.surface2,
        border: `1.5px solid ${focused ? t.blue : t.border}`, borderRadius: "7px",
        outline: "none", transition: "border-color 0.12s", boxSizing: "border-box",
        "&::placeholder": { color: t.textSoft },
      }}
    />
  );
}

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "", surname: "", student_id: "", email: "",
    username: "", password: "", university: "", degree: "",
  });
  const [universities, setUniversities] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isDark } = useThemeMode();
  const t = isDark ? darkTokens : lightTokens;

  useEffect(() => {
    authService.getUniversities().then(setUniversities).catch(() => {});
  }, []);

  const set = (field: string) => (v: string) => setForm((p) => ({ ...p, [field]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.signup(form);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      const e = err as { err?: { detail?: string } };
      setError(e?.err?.detail || "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
      {/* Logo + wordmark */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <Image src="/logo_large.png" alt="RPL logo" width={52} height={52} />
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.8px", color: t.text, lineHeight: 1.1 }}>RPL 3.0</Typography>
          <Typography sx={{ fontSize: "14px", color: t.textMuted, mt: "4px" }}>Creá tu cuenta</Typography>
        </Box>
      </Box>

      {/* Card */}
      <Box sx={{ width: "100%", maxWidth: "480px", background: t.surface, border: `1px solid ${t.border}`, borderRadius: "14px", padding: "28px 28px 24px" }}>
        {success ? (
          <Box sx={{ textAlign: "center", py: "16px" }}>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: t.green, mb: "8px" }}>¡Cuenta creada!</Typography>
            <Typography sx={{ fontSize: "14px", color: t.textMuted }}>Revisá tu email para validar tu cuenta. Redirigiendo al login…</Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {error && (
              <Box sx={{ background: t.redBg, color: t.red, borderRadius: "8px", padding: "10px 14px", fontSize: "13px", fontWeight: 500 }}>
                {error}
              </Box>
            )}

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Box><FieldLabel>Nombre</FieldLabel><StyledInput value={form.name} onChange={set("name")} required autoFocus t={t} /></Box>
              <Box><FieldLabel>Apellido</FieldLabel><StyledInput value={form.surname} onChange={set("surname")} required t={t} /></Box>
              <Box><FieldLabel>Padrón</FieldLabel><StyledInput value={form.student_id} onChange={set("student_id")} required t={t} /></Box>
              <Box><FieldLabel>Email</FieldLabel><StyledInput type="email" value={form.email} onChange={set("email")} required t={t} /></Box>
              <Box><FieldLabel>Usuario</FieldLabel><StyledInput value={form.username} onChange={set("username")} required t={t} /></Box>
              <Box><FieldLabel>Contraseña</FieldLabel><StyledInput type="password" value={form.password} onChange={set("password")} required t={t} /></Box>
              <Box>
                <FieldLabel>Universidad</FieldLabel>
                <Box
                  component="select"
                  value={form.university}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set("university")(e.target.value)}
                  required
                  sx={{
                    display: "block", width: "100%", padding: "9px 12px", fontSize: "14px",
                    fontFamily: "inherit", color: form.university ? t.text : t.textSoft,
                    background: t.surface2, border: `1.5px solid ${t.border}`,
                    borderRadius: "7px", outline: "none", boxSizing: "border-box",
                    "&:focus": { borderColor: t.blue },
                  }}
                >
                  <option value="" disabled>Seleccioná…</option>
                  {universities.map((u) => <option key={u} value={u}>{u}</option>)}
                  <option value="other">Otra</option>
                </Box>
              </Box>
              <Box><FieldLabel>Carrera</FieldLabel><StyledInput value={form.degree} onChange={set("degree")} required t={t} /></Box>
            </Box>

            <Box
              component="button"
              type="submit"
              disabled={loading}
              sx={{
                width: "100%", padding: "11px 0", fontSize: "14px", fontWeight: 700,
                fontFamily: "inherit", letterSpacing: "0.1px",
                background: loading ? t.surface2 : t.blue,
                color: loading ? t.textMuted : "#fff",
                border: "none", borderRadius: "9px",
                cursor: loading ? "default" : "pointer",
                transition: "background 0.12s, color 0.12s", mt: "4px",
              }}
            >
              {loading ? "Creando cuenta…" : "Crear cuenta"}
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "center", mt: "20px" }}>
          <Box
            component={NextLink}
            href="/login"
            sx={{ fontSize: "13px", color: t.blue, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            ¿Ya tenés cuenta? Ingresá
          </Box>
        </Box>
      </Box>

      <Typography sx={{ fontSize: "12px", color: t.textSoft, textAlign: "center" }}>
        Facultad de Ingeniería · Universidad de Buenos Aires
      </Typography>

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
    </Box>
  );
}
