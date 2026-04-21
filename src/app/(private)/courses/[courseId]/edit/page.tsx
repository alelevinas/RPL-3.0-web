"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import * as coursesService from "@/services/coursesService";
import CustomSnackbar from "@/components/CustomSnackbar";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";
import CheckIcon from "@mui/icons-material/Check";

export default function EditCoursePage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const router = useRouter();
  const { isDark } = useThemeMode();
  const t = isDark ? darkTokens : lightTokens;

  const [form, setForm] = useState({ name: "", description: "", semester: "", active: true, img_uri: "" });
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    coursesService.get(courseId).then((c) => {
      setForm({ name: c.name, description: c.description, semester: c.semester, active: c.active, img_uri: c.img_uri || "" });
    }).finally(() => setLoading(false));
  }, [courseId]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState("saving");
    try {
      await coursesService.edit(courseId, form);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err: unknown) {
      const e = err as { err?: { detail?: string } };
      setError(e?.err?.detail || "Error al guardar");
      setSaveState("idle");
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}><CircularProgress sx={{ color: t.blue }} /></Box>;

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
          Editar curso
        </Typography>
        <Typography sx={{ fontSize: "14px", color: t.textMuted, mt: "4px" }}>Modificá los datos del curso</Typography>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ maxWidth: "580px", background: t.surface, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <Box>
          <Box sx={labelSx}>Nombre</Box>
          <Box component="input" value={form.name} onChange={set("name")} required autoFocus sx={inputSx} />
        </Box>

        <Box>
          <Box sx={labelSx}>Descripción</Box>
          <Box component="textarea" value={form.description} onChange={set("description")} rows={3} sx={{ ...inputSx, resize: "vertical", lineHeight: 1.5 }} />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <Box>
            <Box sx={labelSx}>Cuatrimestre</Box>
            <Box component="input" value={form.semester} onChange={set("semester")} sx={inputSx} />
          </Box>
          <Box>
            <Box sx={labelSx}>URL de imagen (opcional)</Box>
            <Box component="input" value={form.img_uri} onChange={set("img_uri")} placeholder="https://…" sx={inputSx} />
          </Box>
        </Box>

        <Box>
          <Box sx={labelSx}>Estado</Box>
          <Box
            component="button"
            type="button"
            onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
            sx={{
              background: form.active ? t.greenBg : t.surface2,
              color: form.active ? t.green : t.textMuted,
              border: "none", borderRadius: "7px", padding: "6px 14px",
              fontSize: "13px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
              transition: "background 0.12s, color 0.12s",
            }}
          >
            {form.active ? "Activo" : "Finalizado"}
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: "10px", mt: "4px" }}>
          <Box
            component="button"
            type="submit"
            disabled={saveState === "saving"}
            sx={{
              display: "flex", alignItems: "center", gap: "6px",
              background: saveState === "saved" ? t.greenBg : t.blue,
              color: saveState === "saved" ? t.green : "#fff",
              border: "none", borderRadius: "8px", padding: "9px 20px",
              fontSize: "14px", fontWeight: 700, fontFamily: "inherit",
              cursor: saveState === "saving" ? "default" : "pointer",
              opacity: saveState === "saving" ? 0.7 : 1,
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {saveState === "saved" ? <><CheckIcon sx={{ fontSize: 15 }} /> Guardado</> : saveState === "saving" ? "Guardando…" : "Guardar cambios"}
          </Box>
          <Box
            component="button"
            type="button"
            onClick={() => router.back()}
            sx={{ background: "none", border: `1px solid ${t.border}`, borderRadius: "8px", padding: "9px 20px", fontSize: "14px", fontWeight: 600, fontFamily: "inherit", color: t.textMuted, cursor: "pointer", "&:hover": { background: t.surface2 } }}
          >
            Volver
          </Box>
        </Box>
      </Box>

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
    </Box>
  );
}
