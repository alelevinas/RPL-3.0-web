"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useAppState } from "@/lib/state";
import * as authService from "@/services/authenticationService";
import * as cloudinaryService from "@/services/cloudinaryService";
import CustomSnackbar from "@/components/CustomSnackbar";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";
import CheckIcon from "@mui/icons-material/Check";

const AVATAR_COLORS = ["#005BAA", "#16A34A", "#C47F00", "#DC2626", "#7C3AED"];

export default function ProfilePage() {
  const state = useAppState();
  const profile = state.profile as Record<string, unknown> | undefined;
  const { isDark } = useThemeMode();
  const t = isDark ? darkTokens : lightTokens;

  const [form, setForm] = useState({ name: "", surname: "", student_id: "", degree: "", university: "" });
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: (profile.name as string) || "",
        surname: (profile.surname as string) || "",
        student_id: (profile.student_id as string) || "",
        degree: (profile.degree as string) || "",
        university: (profile.university as string) || "",
      });
    }
  }, [profile]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState("saving");
    try {
      const updated = await authService.updateProfile(form);
      state.set("profile", updated);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setError("Error al guardar el perfil");
      setSaveState("idle");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await cloudinaryService.uploadImage(file);
      await authService.updateProfile({ img_uri: url });
      const updated = await authService.getProfile();
      state.set("profile", updated);
    } catch {
      setError("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return null;

  const initials = `${(profile.name as string)?.[0] ?? ""}${(profile.surname as string)?.[0] ?? ""}`.toUpperCase();
  const avatarColor = AVATAR_COLORS[((profile.name as string)?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  const imgUri = profile.img_uri as string | undefined;

  const labelSx = { fontSize: "11px", fontWeight: 700, color: t.textMuted, textTransform: "uppercase" as const, letterSpacing: "0.5px", mb: "5px" };
  const inputSx = (disabled?: boolean) => ({
    width: "100%", padding: "8px 11px", fontSize: "14px", fontFamily: "inherit",
    color: disabled ? t.textMuted : t.text, background: disabled ? t.surface2 : t.surface2,
    border: `1px solid ${t.border}`, borderRadius: "7px", outline: "none", boxSizing: "border-box" as const,
    opacity: disabled ? 0.7 : 1, cursor: disabled ? "not-allowed" : "text",
    "&:focus": disabled ? {} : { borderColor: t.blue },
  });

  return (
    <Box>
      <Box sx={{ mb: "28px" }}>
        <Typography sx={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.8px", color: t.text, lineHeight: 1.1 }}>
          Mi perfil
        </Typography>
        <Typography sx={{ fontSize: "14px", color: t.textMuted, mt: "4px" }}>
          {(profile.username as string)}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: "520px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Avatar section */}
        <Box sx={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "20px" }}>
          <Box sx={{ position: "relative" }}>
            {imgUri ? (
              <Box
                component="img"
                src={imgUri}
                alt={initials}
                sx={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: `2px solid ${t.border}` }}
              />
            ) : (
              <Box sx={{
                width: 72, height: 72, borderRadius: "50%", background: `${avatarColor}22`, color: avatarColor,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 800,
                border: `2px solid ${t.border}`,
              }}>
                {initials}
              </Box>
            )}
          </Box>
          <Box>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: t.text }}>
              {(profile.name as string)} {(profile.surname as string)}
            </Typography>
            <Typography sx={{ fontSize: "13px", color: t.textMuted, mb: "10px" }}>{(profile.email as string)}</Typography>
            <Box component="label" sx={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer", background: t.surface2, border: `1px solid ${t.border}`, borderRadius: "7px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: t.textMuted, "&:hover": { background: t.border } }}>
              {uploading ? "Subiendo…" : "Cambiar foto"}
              <Box component="input" type="file" accept="image/*" onChange={handleImageUpload} sx={{ display: "none" }} />
            </Box>
          </Box>
        </Box>

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Box>
              <Box sx={labelSx}>Nombre</Box>
              <Box component="input" value={form.name} onChange={set("name")} sx={inputSx()} />
            </Box>
            <Box>
              <Box sx={labelSx}>Apellido</Box>
              <Box component="input" value={form.surname} onChange={set("surname")} sx={inputSx()} />
            </Box>
          </Box>
          <Box>
            <Box sx={labelSx}>Padrón</Box>
            <Box component="input" value={form.student_id} onChange={set("student_id")} sx={inputSx()} />
          </Box>
          <Box>
            <Box sx={labelSx}>Universidad</Box>
            <Box component="input" value={form.university} onChange={set("university")} sx={inputSx()} />
          </Box>
          <Box>
            <Box sx={labelSx}>Carrera</Box>
            <Box component="input" value={form.degree} onChange={set("degree")} sx={inputSx()} />
          </Box>

          <Box sx={{ borderTop: `1px solid ${t.border}`, pt: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <Box>
              <Box sx={labelSx}>Email</Box>
              <Box component="input" value={(profile.email as string) || ""} disabled sx={inputSx(true)} />
            </Box>
            <Box>
              <Box sx={labelSx}>Usuario</Box>
              <Box component="input" value={(profile.username as string) || ""} disabled sx={inputSx(true)} />
            </Box>
          </Box>

          <Box
            component="button"
            type="submit"
            disabled={saveState === "saving"}
            sx={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              background: saveState === "saved" ? t.greenBg : t.blue,
              color: saveState === "saved" ? t.green : "#fff",
              border: "none", borderRadius: "8px", padding: "10px 0",
              fontSize: "14px", fontWeight: 700, fontFamily: "inherit",
              cursor: saveState === "saving" ? "default" : "pointer",
              opacity: saveState === "saving" ? 0.7 : 1,
              transition: "background 0.15s, color 0.15s", mt: "4px",
            }}
          >
            {saveState === "saved" ? <><CheckIcon sx={{ fontSize: 15 }} /> Guardado</> : saveState === "saving" ? "Guardando…" : "Guardar cambios"}
          </Box>
        </Box>
      </Box>

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
    </Box>
  );
}
