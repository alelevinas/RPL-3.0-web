"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state";
import * as coursesService from "@/services/coursesService";
import type { Course } from "@/types";
import CustomSnackbar from "@/components/CustomSnackbar";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";

export default function CloneCoursePage() {
  const router = useRouter();
  const state = useAppState();
  const profile = state.profile as { id: number } | undefined;
  const { isDark } = useThemeMode();
  const t = isDark ? darkTokens : lightTokens;

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number>(0);
  const [semester, setSemester] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) return;
    coursesService.getAllByUser(profile.id).then(setCourses).catch(() => {}).finally(() => setLoading(false));
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !profile) return;
    setSaving(true);
    try {
      const source = courses.find((c) => c.id === selectedCourse);
      if (!source) return;
      await coursesService.clone({ ...source, semester, course_admin_user_id: String(profile.id) });
      router.push("/courses");
    } catch (err: unknown) {
      const e = err as { err?: { detail?: string } };
      setError(e?.err?.detail || "Error al clonar el curso");
    } finally {
      setSaving(false);
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
          Clonar curso
        </Typography>
        <Typography sx={{ fontSize: "14px", color: t.textMuted, mt: "4px" }}>
          Crea una copia de un curso existente para un nuevo cuatrimestre
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ maxWidth: "480px", background: t.surface, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <Box>
          <Box sx={labelSx}>Curso origen</Box>
          <Box
            component="select"
            value={selectedCourse}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCourse(Number(e.target.value))}
            required
            sx={{ ...inputSx, cursor: "pointer" }}
          >
            <option value={0} disabled>Seleccioná un curso…</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.semester})</option>)}
          </Box>
        </Box>

        <Box>
          <Box sx={labelSx}>Nuevo cuatrimestre</Box>
          <Box
            component="input"
            value={semester}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSemester(e.target.value)}
            placeholder="2025-2"
            required
            sx={inputSx}
          />
        </Box>

        <Box sx={{ display: "flex", gap: "10px", mt: "4px" }}>
          <Box
            component="button"
            type="submit"
            disabled={saving || !selectedCourse}
            sx={{ background: t.blue, color: "#fff", border: "none", borderRadius: "8px", padding: "9px 20px", fontSize: "14px", fontWeight: 700, fontFamily: "inherit", cursor: (saving || !selectedCourse) ? "default" : "pointer", opacity: (saving || !selectedCourse) ? 0.7 : 1 }}
          >
            {saving ? "Clonando…" : "Clonar curso"}
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
