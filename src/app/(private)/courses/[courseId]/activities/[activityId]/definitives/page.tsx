"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useRouter } from "next/navigation";
import * as submissionsService from "@/services/submissionsService";
import type { SubmissionResult } from "@/types";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  SUCCESS:   { bg: "greenBg", color: "green",   label: "Exitoso" },
  FAILED:    { bg: "redBg",   color: "red",     label: "Fallido" },
  ERROR:     { bg: "redBg",   color: "red",     label: "Error" },
  TIMEOUT:   { bg: "amberBg", color: "amber",   label: "Timeout" },
};

export default function DefinitivesPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const activityId = Number(params.activityId);
  const router = useRouter();
  const { isDark } = useThemeMode();
  const t = isDark ? darkTokens : lightTokens;

  const [submissions, setSubmissions] = useState<SubmissionResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    submissionsService.getAllFinalSubmissions(courseId, activityId)
      .then(setSubmissions).catch(() => {}).finally(() => setLoading(false));
  }, [courseId, activityId]);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}><CircularProgress sx={{ color: t.blue }} /></Box>;

  const headSx = {
    fontSize: "11px", fontWeight: 700, color: t.textMuted, textTransform: "uppercase" as const,
    letterSpacing: "0.6px", padding: "10px 14px", background: t.surface2,
    borderBottom: `1px solid ${t.border}`, textAlign: "left" as const,
  };
  const cellSx = { fontSize: "13px", color: t.text, padding: "11px 14px", borderBottom: `1px solid ${t.border}` };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "24px" }}>
        <Box
          component="button"
          onClick={() => router.back()}
          sx={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "none", border: "none", cursor: "pointer",
            color: t.textMuted, fontSize: "13px", fontWeight: 500, fontFamily: "inherit",
            borderRadius: "6px", padding: "4px 8px",
            "&:hover": { background: t.surface2, color: t.text },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 15 }} />
          Volver
        </Box>
        <Box sx={{ width: "1px", height: "16px", background: t.border }} />
        <Box>
          <Typography sx={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.8px", color: t.text, lineHeight: 1.1 }}>
            Entregas finales
          </Typography>
          <Typography sx={{ fontSize: "14px", color: t.textMuted, mt: "4px" }}>
            {submissions.length} entrega{submissions.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ border: `1px solid ${t.border}`, borderRadius: "10px", overflow: "hidden" }}>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <Box component="thead">
            <Box component="tr">
              <Box component="th" sx={headSx}>Alumno</Box>
              <Box component="th" sx={headSx}>Estado</Box>
              <Box component="th" sx={headSx}>Fecha</Box>
            </Box>
          </Box>
          <Box component="tbody">
            {submissions.length === 0 ? (
              <Box component="tr">
                <Box component="td" colSpan={3} sx={{ ...cellSx, textAlign: "center", color: t.textMuted, py: "32px", borderBottom: "none" }}>
                  No hay entregas finales aún
                </Box>
              </Box>
            ) : submissions.map((sub) => {
              const style = STATUS_STYLE[sub.submission_status] ?? { bg: "surface2", color: "textMuted", label: sub.submission_status };
              return (
                <Box component="tr" key={sub.id} sx={{ "&:last-child td": { borderBottom: "none" } }}>
                  <Box component="td" sx={{ ...cellSx, fontWeight: 500 }}>{sub.submission_rplfile_name}</Box>
                  <Box component="td" sx={cellSx}>
                    <Box sx={{
                      display: "inline-block", fontSize: "12px", fontWeight: 700,
                      background: t[style.bg as keyof typeof t] as string,
                      color: t[style.color as keyof typeof t] as string,
                      borderRadius: "5px", padding: "2px 8px",
                    }}>
                      {style.label}
                    </Box>
                  </Box>
                  <Box component="td" sx={{ ...cellSx, color: t.textMuted }}>
                    {new Date(sub.submission_date).toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
