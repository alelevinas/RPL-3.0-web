"use client";

import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state";
import * as coursesService from "@/services/coursesService";
import CustomSnackbar from "@/components/CustomSnackbar";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";

export default function CreateCoursePage() {
  const router = useRouter();
  const state = useAppState();
  const profile = state.profile as { id: number } | undefined;
  const { isDark } = useThemeMode();
  const t = isDark ? darkTokens : lightTokens;

  const [form, setForm] = useState({
    name: "", university: "FIUBA", subject_id: "", semester: "",
    semester_start_date: "", semester_end_date: "", description: "", img_uri: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      await coursesService.create({ ...form, course_admin_user_id: String(profile.id) });
      router.push("/courses");
    } catch (err: unknown) {
      const e = err as { err?: { detail?: string } };
      setError(e?.err?.detail || "Error al crear el curso");
    } finally {
      setLoading(false);
    }
  };

  const labelSx = { fontSize: "11px", fontWeight: 700, color: t.textMuted, textTransform: "uppercase" as const, letterSpacing: "0.5px", mb: "5px" };
  const inputSx = {
    width: "100%", padding: "8px 11px", fontSize: "14px", fontFamily: "inherit",
    color: t.text, background: t.surface2, border: `1px solid ${t.border}`,
    borderRadius: "7px", outline: "none", boxSizing: "border-box" as const,
    "&:focus": { borderColor: t.blue },
  };

  return (
    <Box>
      <Box sx={{ mb: "24px" }}>
        <Typography sx={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.8px", color: t.text, lineHeight: 1.1 }}>
          Nuevo curso
        </Typography>
        <Typography sx={{ fontSize: "14px", color: t.textMuted, mt: "4px" }}>Completá los datos del curso</Typography>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ maxWidth: "580px", background: t.surface, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "24px" }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Box>
              <Box sx={labelSx}>Nombre del curso</Box>
              <Box component="input" value={form.name} onChange={set("name")} required autoFocus sx={inputSx} />
            </Box>
            <Box>
              <Box sx={labelSx}>Código de materia</Box>
              <Box component="input" value={form.subject_id} onChange={set("subject_id")} required sx={inputSx} />
            </Box>
            <Box>
              <Box sx={labelSx}>Universidad</Box>
              <Box component="input" value={form.university} onChange={set("university")} sx={inputSx} />
            </Box>
            <Box>
              <Box sx={labelSx}>Cuatrimestre</Box>
              <Box component="input" value={form.semester} onChange={set("semester")} placeholder="2025-1" required sx={inputSx} />
            </Box>
            <Box>
              <Box sx={labelSx}>Fecha de inicio</Box>
              <Box component="input" type="date" value={form.semester_start_date} onChange={set("semester_start_date")} required sx={inputSx} />
            </Box>
            <Box>
              <Box sx={labelSx}>Fecha de fin</Box>
              <Box component="input" type="date" value={form.semester_end_date} onChange={set("semester_end_date")} required sx={inputSx} />
            </Box>
          </Box>

          <Box>
            <Box sx={labelSx}>Descripción</Box>
            <Box component="textarea" value={form.description} onChange={set("description")} rows={3} sx={{ ...inputSx, resize: "vertical", lineHeight: 1.5 }} />
          </Box>

          <Box>
            <Box sx={labelSx}>URL de imagen (opcional)</Box>
            <Box component="input" value={form.img_uri} onChange={set("img_uri")} placeholder="https://…" sx={inputSx} />
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: "10px", mt: "20px" }}>
          <Box
            component="button"
            type="submit"
            disabled={loading}
            sx={{ background: t.blue, color: "#fff", border: "none", borderRadius: "8px", padding: "9px 20px", fontSize: "14px", fontWeight: 700, fontFamily: "inherit", cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creando…" : "Crear curso"}
          </Box>
          <Box
            component="button"
            type="button"
            onClick={() => router.back()}
            sx={{ background: "none", border: `1px solid ${t.border}`, borderRadius: "8px", padding: "9px 20px", fontSize: "14px", fontWeight: 600, fontFamily: "inherit", color: t.textMuted, cursor: "pointer", "&:hover": { background: t.surface2 } }}
          >
            Cancelar
          </Box>
        </Box>
      </Box>

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
    </Box>
  );
}
