"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useParams, useRouter } from "next/navigation";
import { useAppState } from "@/lib/state";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";
import * as activitiesService from "@/services/activitiesService";
import * as submissionsService from "@/services/submissionsService";
import MultipleTabsEditor from "@/components/MultipleTabsEditor";
import CustomSnackbar from "@/components/CustomSnackbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Activity, FilesMetadata, SubmissionResult } from "@/types";
import { hasPermission } from "@/utils/permissions";

// ─── Language badge (reuse pattern from activities page) ──────────────────────

const LANG_META: Record<string, { label: string; color: string }> = {
  python: { label: "Python", color: "#3572A5" }, python3: { label: "Python", color: "#3572A5" },
  java: { label: "Java", color: "#B07219" }, c: { label: "C", color: "#555" },
  cpp: { label: "C++", color: "#F34B7D" }, "c++": { label: "C++", color: "#F34B7D" },
  javascript: { label: "JS", color: "#c4a000" }, haskell: { label: "Haskell", color: "#5E5186" },
  go: { label: "Go", color: "#00ACD7" }, rust: { label: "Rust", color: "#CE4A00" },
};
function getLangMeta(lang: string) { const k = lang.split("_")[0].toLowerCase(); return LANG_META[k] ?? { label: lang, color: "#666" }; }

function LangBadge({ lang }: { lang: string }) {
  const { label, color } = getLangMeta(lang);
  return (
    <Box sx={{ display: "inline-block", background: color + "22", color, borderRadius: "4px", padding: "2px 7px", fontSize: "11px", fontWeight: 700, lineHeight: 1.6 }}>
      {label}
    </Box>
  );
}

// ─── Status chip ──────────────────────────────────────────────────────────────

type SubmissionStatus = string | null;

const STATUS_DISPLAY: Record<string, { label: string; bg: string; color: string; pulse?: boolean }> = {
  SUCCESS:    { label: "Resuelto",      bg: "greenBg", color: "green" },
  FAILURE:    { label: "Fallado",       bg: "redBg",   color: "red" },
  ERROR:      { label: "Error",         bg: "redBg",   color: "red" },
  TIME_OUT:   { label: "Tiempo agotado", bg: "amberBg", color: "amber" },
  ENQUEUED:   { label: "En cola…",      bg: "blueBg",  color: "blue", pulse: true },
  PENDING:    { label: "En proceso…",   bg: "blueBg",  color: "blue", pulse: true },
  PROCESSING: { label: "Ejecutando…",   bg: "blueBg",  color: "blue", pulse: true },
};

function StatusChip({ status, t, size = "sm" }: { status: SubmissionStatus; t: typeof lightTokens; size?: "sm" | "lg" }) {
  const cfg = status ? STATUS_DISPLAY[status] : null;
  const bg    = cfg ? t[cfg.bg as keyof typeof t] as string   : t.surface2;
  const color = cfg ? t[cfg.color as keyof typeof t] as string : t.textMuted;
  const label = cfg?.label ?? "Sin entregar";
  const pulse = !!cfg?.pulse;
  const pad   = size === "lg" ? "5px 14px" : "3px 11px";
  const fs    = size === "lg" ? "13px" : "12px";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "6px", background: bg, color, borderRadius: "20px", padding: pad, fontSize: fs, fontWeight: 600 }}>
      {pulse && (
        <Box sx={{
          width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0,
          "@keyframes rpl-pulse": { "0%,100%": { transform: "scale(1)", opacity: 1 }, "50%": { transform: "scale(0.85)", opacity: 0.4 } },
          animation: "rpl-pulse 1.1s ease-in-out infinite",
        }} />
      )}
      {label}
    </Box>
  );
}

// ─── Test result row ──────────────────────────────────────────────────────────

function IOTestRow({ result, defaultOpen, t }: { result: { name: string; test_in: string; expected_output: string; run_output: string }; defaultOpen: boolean; t: typeof lightTokens }) {
  const [open, setOpen] = useState(defaultOpen);
  const passed = result.expected_output?.trim() === result.run_output?.trim();

  return (
    <Box sx={{ borderRadius: "8px", overflow: "hidden", mb: "6px", border: `1px solid ${passed ? t.greenBg : t.redBg}` }}>
      <Box
        component="button"
        onClick={() => setOpen((v) => !v)}
        sx={{
          width: "100%", display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 14px", background: passed ? t.greenBg : t.redBg,
          border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        }}
      >
        <Box sx={{ width: 16, height: 16, borderRadius: "50%", background: passed ? t.green : t.red, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ color: "#fff", fontSize: "10px", fontWeight: 700, lineHeight: 1 }}>{passed ? "✓" : "✗"}</Typography>
        </Box>
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: passed ? t.green : t.red, flex: 1 }}>{result.name}</Typography>
        <KeyboardArrowDownIcon sx={{ fontSize: 16, color: passed ? t.green : t.red, transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }} />
      </Box>
      {open && (
        <Box sx={{ padding: "12px 14px", background: t.surface }}>
          {result.test_in && (
            <Box sx={{ mb: "10px" }}>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: t.textSoft, letterSpacing: "0.4px", textTransform: "uppercase", mb: "4px" }}>Entrada</Typography>
              <Box component="pre" sx={{ m: 0, p: "8px 10px", background: t.surface2, borderRadius: "6px", fontSize: "12px", fontFamily: "var(--font-jetbrains-mono, monospace)", color: t.text, overflow: "auto", whiteSpace: "pre-wrap" }}>
                {result.test_in}
              </Box>
            </Box>
          )}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <Box>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: t.greenText, letterSpacing: "0.4px", textTransform: "uppercase", mb: "4px" }}>Esperado</Typography>
              <Box component="pre" sx={{ m: 0, p: "8px 10px", background: t.greenBg, borderRadius: "6px", fontSize: "12px", fontFamily: "var(--font-jetbrains-mono, monospace)", color: t.text, overflow: "auto", whiteSpace: "pre-wrap" }}>
                {result.expected_output}
              </Box>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: passed ? t.greenText : t.redText, letterSpacing: "0.4px", textTransform: "uppercase", mb: "4px" }}>Obtenido</Typography>
              <Box component="pre" sx={{ m: 0, p: "8px 10px", background: passed ? t.greenBg : t.redBg, borderRadius: "6px", fontSize: "12px", fontFamily: "var(--font-jetbrains-mono, monospace)", color: t.text, overflow: "auto", whiteSpace: "pre-wrap" }}>
                {result.run_output}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

function UnitTestRow({ result, t }: { result: { name: string; passed: boolean; error_messages: string | null }; t: typeof lightTokens }) {
  const [open, setOpen] = useState(!result.passed);
  return (
    <Box sx={{ borderRadius: "8px", overflow: "hidden", mb: "6px", border: `1px solid ${result.passed ? t.greenBg : t.redBg}` }}>
      <Box
        component="button"
        onClick={() => setOpen((v) => !v)}
        sx={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: result.passed ? t.greenBg : t.redBg, border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
      >
        <Box sx={{ width: 16, height: 16, borderRadius: "50%", background: result.passed ? t.green : t.red, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ color: "#fff", fontSize: "10px", fontWeight: 700, lineHeight: 1 }}>{result.passed ? "✓" : "✗"}</Typography>
        </Box>
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: result.passed ? t.green : t.red, flex: 1 }}>{result.name}</Typography>
        {!result.passed && <KeyboardArrowDownIcon sx={{ fontSize: 16, color: t.red, transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }} />}
      </Box>
      {open && result.error_messages && (
        <Box sx={{ padding: "10px 14px", background: t.surface }}>
          <Box component="pre" sx={{ m: 0, fontSize: "12px", fontFamily: "var(--font-jetbrains-mono, monospace)", color: t.redText, whiteSpace: "pre-wrap" }}>
            {result.error_messages}
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ─── Right panel tabs ─────────────────────────────────────────────────────────

type RightTab = "problema" | "resultados" | "historial";

function RightTabBar({ active, onChange, submissionCount, historialCount, t }: { active: RightTab; onChange: (t: RightTab) => void; submissionCount: number; historialCount: number; t: typeof lightTokens }) {
  const tabs: { key: RightTab; label: string }[] = [
    { key: "problema",   label: "Problema" },
    { key: "resultados", label: `Resultados${submissionCount > 0 ? ` (${submissionCount})` : ""}` },
    { key: "historial",  label: `Historial (${historialCount})` },
  ];
  return (
    <Box sx={{ display: "flex", borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
      {tabs.map(({ key, label }) => (
        <Box
          key={key}
          component="button"
          onClick={() => onChange(key)}
          sx={{
            background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
            padding: "0 16px", height: "42px", fontSize: "13px",
            color: active === key ? t.blue : t.textMuted,
            fontWeight: active === key ? 600 : 400,
            borderBottom: `2px solid ${active === key ? t.blue : "transparent"}`,
            transition: "color 0.12s, border-color 0.12s",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Box>
      ))}
    </Box>
  );
}

// ─── Historial row ────────────────────────────────────────────────────────────

const STATUS_ICON: Record<string, { icon: string; color: string; bg: string }> = {
  SUCCESS:    { icon: "✓", color: "#fff", bg: "#16A34A" },
  FAILURE:    { icon: "✗", color: "#fff", bg: "#DC2626" },
  ERROR:      { icon: "!", color: "#fff", bg: "#DC2626" },
  TIME_OUT:   { icon: "⏱", color: "#fff", bg: "#D97706" },
  ENQUEUED:   { icon: "…", color: "#fff", bg: "#005BAA" },
  PENDING:    { icon: "…", color: "#fff", bg: "#005BAA" },
  PROCESSING: { icon: "…", color: "#fff", bg: "#005BAA" },
};

function HistorialRow({ sub, onSelect, t }: { sub: SubmissionResult; onSelect: () => void; t: typeof lightTokens }) {
  const cfg = STATUS_ICON[sub.submission_status] ?? { icon: "?", color: "#fff", bg: t.textSoft };
  const date = new Date(sub.submission_date);
  const testCount = (sub.io_tests_run_results?.length ?? 0) + (sub.unit_tests_run_results?.length ?? 0);
  return (
    <Box
      onClick={onSelect}
      sx={{
        display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px",
        borderRadius: "9px", border: `1px solid ${t.border}`, mb: "6px", cursor: "pointer",
        transition: "border-color 0.12s", "&:hover": { borderColor: t.blue },
      }}
    >
      <Box sx={{ width: 28, height: 28, borderRadius: "50%", background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Typography sx={{ color: cfg.color, fontSize: "12px", fontWeight: 700 }}>{cfg.icon}</Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: t.text }}>{STATUS_DISPLAY[sub.submission_status]?.label ?? sub.submission_status}</Typography>
        {testCount > 0 && (
          <Typography sx={{ fontSize: "11px", color: t.textMuted }}>{testCount} tests</Typography>
        )}
      </Box>
      <Typography sx={{ fontSize: "11px", color: t.textSoft, textAlign: "right" }}>
        {date.toLocaleDateString("es", { day: "2-digit", month: "short" })}<br />
        {date.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
      </Typography>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SolveActivityPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const activityId = Number(params.activityId);
  const router = useRouter();
  const state = useAppState();
  const { isDark } = useThemeMode();
  const t = isDark ? darkTokens : lightTokens;
  const permissions = (state.permissions as string[]) || [];
  const canManage = hasPermission(permissions, "activity_manage");

  const [activity, setActivity] = useState<Activity | null>(null);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [filesMetadata, setFilesMetadata] = useState<FilesMetadata>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [liveStatus, setLiveStatus] = useState<SubmissionStatus>(null);
  const [submissions, setSubmissions] = useState<SubmissionResult[]>([]);
  const [selectedSub, setSelectedSub] = useState<SubmissionResult | null>(null);
  const [activeTab, setActiveTab] = useState<RightTab>("problema");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const pollingRef = useRef(false);

  useEffect(() => {
    Promise.all([
      activitiesService.get(courseId, activityId),
      submissionsService.getAll(courseId, activityId).catch(() => []),
    ]).then(([act, subs]) => {
      setActivity(act);
      setSubmissions(subs);
      if (subs.length > 0) setSelectedSub(subs[0]);
      return activitiesService.getStartingFilesForStudent(courseId, act.starting_rplfile_id);
    }).then((raw) => {
      const { files, filesMetadata } = activitiesService.parseStartingFiles(raw);
      setFiles(files);
      setFilesMetadata(filesMetadata);
    }).finally(() => setLoading(false));
  }, [courseId, activityId]);

  const pollSubmission = useCallback(async (submissionId: number) => {
    pollingRef.current = true;
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      if (!pollingRef.current) break;
      try {
        const sub = await submissionsService.get(courseId, activityId, submissionId);
        setLiveStatus(sub.submission_status);
        if (sub.submission_status !== "PENDING" && sub.submission_status !== "PROCESSING" && sub.submission_status !== "ENQUEUED") {
          pollingRef.current = false;
          setSelectedSub(sub);
          setActiveTab("resultados");
          const subs = await submissionsService.getAll(courseId, activityId);
          setSubmissions(subs);
          return;
        }
      } catch { break; }
    }
    pollingRef.current = false;
    setLiveStatus(null);
    setWarning("La entrega está tardando más de lo esperado. Revisá más tarde.");
  }, [courseId, activityId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    setLiveStatus("ENQUEUED");
    try {
      const result = await submissionsService.submit(courseId, activityId, files);
      const subs = await submissionsService.getAll(courseId, activityId);
      setSubmissions(subs);
      pollSubmission(result.id);
    } catch (err: unknown) {
      const e = err as { err?: { detail?: string } };
      setError(e?.err?.detail || "Error al enviar la solución");
      setLiveStatus(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectHistorial = async (sub: SubmissionResult) => {
    try {
      const full = await submissionsService.get(courseId, activityId, sub.id);
      setSelectedSub(full);
      setActiveTab("resultados");
    } catch {
      setError("Error al cargar el detalle de la entrega");
    }
  };

  const isProcessing = pollingRef.current || submitting;

  if (loading) {
    return (
      <Box sx={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 150, bgcolor: t.bg }}>
        <CircularProgress sx={{ color: t.blue }} />
      </Box>
    );
  }

  if (!activity) {
    return (
      <Box sx={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 150, bgcolor: t.bg }}>
        <Typography sx={{ color: t.textMuted }}>Actividad no encontrada.</Typography>
      </Box>
    );
  }

  const currentStatus = liveStatus ?? (submissions[0]?.submission_status ?? null);

  return (
    <>
      {/* Full-screen overlay that sits above sidebar, below global TopBar */}
      <Box
        sx={{
          position: "fixed",
          top: "54px",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 150,
          display: "flex",
          flexDirection: "column",
          bgcolor: t.bg,
        }}
      >
        {/* Solver TopBar */}
        <Box
          sx={{
            height: "50px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            px: "16px",
            gap: "12px",
            background: t.surface,
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          {/* Left: back + activity info */}
          <Box
            component="button"
            onClick={() => router.push(`/courses/${courseId}/activities`)}
            sx={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontFamily: "inherit", fontSize: "13px", fontWeight: 500, "&:hover": { color: t.text }, flexShrink: 0 }}
          >
            <ArrowBackIcon sx={{ fontSize: 15 }} />
            Actividades
          </Box>

          <Box sx={{ width: "1px", height: "18px", background: t.border, flexShrink: 0 }} />

          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 280 }}>
            {activity.name}
          </Typography>

          <LangBadge lang={activity.language} />

          <Typography sx={{ fontSize: "12px", color: t.textMuted, flexShrink: 0 }}>
            {activity.points} puntos
          </Typography>

          <StatusChip status={currentStatus} t={t} size="sm" />

          <Box sx={{ flex: 1 }} />

          {canManage && (
            <Box
              component="button"
              onClick={() => router.push(`/courses/${courseId}/activities/${activityId}/edit`)}
              sx={{ background: "none", border: `1px solid ${t.border}`, borderRadius: "7px", padding: "5px 12px", fontSize: "12px", fontWeight: 600, color: t.textMuted, fontFamily: "inherit", cursor: "pointer", "&:hover": { borderColor: t.blue, color: t.blue } }}
            >
              Modo profesor
            </Box>
          )}

          <Box
            component="button"
            onClick={handleSubmit}
            disabled={isProcessing}
            sx={{
              background: isProcessing ? t.surface2 : t.blue,
              color: isProcessing ? t.textMuted : "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 18px",
              fontSize: "13.5px",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: isProcessing ? "default" : "pointer",
              transition: "background 0.12s, color 0.12s",
              flexShrink: 0,
            }}
          >
            Entregar
          </Box>
        </Box>

        {/* Body: code editor (left) + tabbed panel (right) */}
        <Box sx={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 0 }}>
          {/* Left: Monaco editor */}
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, background: "#1E1E2E" }}>
            <MultipleTabsEditor
              files={files}
              language={activity.language}
              onChange={setFiles}
              filesMetadata={filesMetadata}
            />
          </Box>

          {/* Right: tabbed panel */}
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, background: t.surface, borderLeft: `1px solid ${t.border}` }}>
            <RightTabBar
              active={activeTab}
              onChange={setActiveTab}
              submissionCount={selectedSub ? 1 : 0}
              historialCount={submissions.length}
              t={t}
            />

            {/* Tab content */}
            <Box sx={{ flex: 1, overflow: "auto", padding: "20px" }}>
              {/* Problema */}
              {activeTab === "problema" && (
                <Box sx={{ "& p": { fontSize: "14px", lineHeight: 1.7, color: t.text }, "& h1,& h2,& h3": { color: t.text, fontWeight: 700 }, "& code": { fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "12.5px", background: t.surface2, borderRadius: "4px", padding: "1px 5px" }, "& pre": { background: "#1E1E2E", color: "#A6ACCD", borderRadius: "8px", padding: "12px 16px", fontSize: "12.5px", overflow: "auto" }, "& pre code": { background: "none", padding: 0 }, "& li": { fontSize: "14px", color: t.text, lineHeight: 1.7 } }}>
                  {activity.description
                    ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{activity.description}</ReactMarkdown>
                    : <Typography sx={{ fontSize: "14px", color: t.textMuted }}>No hay descripción.</Typography>
                  }
                </Box>
              )}

              {/* Resultados */}
              {activeTab === "resultados" && (
                <Box>
                  {!selectedSub && !isProcessing && (
                    <Typography sx={{ fontSize: "14px", color: t.textMuted }}>Todavía no enviaste ninguna solución.</Typography>
                  )}
                  {isProcessing && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "16px" }}>
                      <CircularProgress size={20} sx={{ color: t.blue }} />
                      <Typography sx={{ fontSize: "14px", color: t.textMuted }}>
                        {liveStatus === "ENQUEUED" ? "En cola…" : "Ejecutando…"}
                      </Typography>
                    </Box>
                  )}
                  {selectedSub && (
                    <Box>
                      {/* Header */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "16px" }}>
                        <Typography sx={{ fontSize: "12px", color: t.textMuted }}>
                          {new Date(selectedSub.submission_date).toLocaleString("es")}
                        </Typography>
                        <StatusChip status={selectedSub.submission_status} t={t} size="sm" />
                      </Box>

                      {/* stdout / stderr */}
                      {selectedSub.stdout && (
                        <Box sx={{ mb: "12px" }}>
                          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: t.textSoft, textTransform: "uppercase", letterSpacing: "0.4px", mb: "4px" }}>Salida</Typography>
                          <Box component="pre" sx={{ m: 0, p: "10px 12px", background: t.surface2, borderRadius: "8px", fontSize: "12px", fontFamily: "var(--font-jetbrains-mono, monospace)", color: t.text, overflow: "auto", whiteSpace: "pre-wrap" }}>
                            {selectedSub.stdout}
                          </Box>
                        </Box>
                      )}
                      {selectedSub.stderr && (
                        <Box sx={{ mb: "12px" }}>
                          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: t.redText, textTransform: "uppercase", letterSpacing: "0.4px", mb: "4px" }}>Errores</Typography>
                          <Box component="pre" sx={{ m: 0, p: "10px 12px", background: t.redBg, borderRadius: "8px", fontSize: "12px", fontFamily: "var(--font-jetbrains-mono, monospace)", color: t.redText, overflow: "auto", whiteSpace: "pre-wrap" }}>
                            {selectedSub.stderr}
                          </Box>
                        </Box>
                      )}
                      {selectedSub.exit_message && (
                        <Box sx={{ mb: "12px", p: "10px 12px", background: t.blueBg, borderRadius: "8px" }}>
                          <Typography sx={{ fontSize: "13px", color: t.blue }}>{selectedSub.exit_message}</Typography>
                        </Box>
                      )}

                      {/* I/O test rows */}
                      {selectedSub.io_tests_run_results?.map((r) => (
                        <IOTestRow key={r.id} result={r} defaultOpen={r.expected_output?.trim() !== r.run_output?.trim()} t={t} />
                      ))}

                      {/* Unit test rows */}
                      {selectedSub.unit_tests_run_results?.map((r) => (
                        <UnitTestRow key={r.id} result={r} t={t} />
                      ))}

                      {/* AI hint */}
                      {selectedSub.ai_hint && (
                        <Box sx={{ mt: "16px", background: t.blueBg, border: `1px solid ${t.blue}44`, borderRadius: "9px", padding: "14px 16px" }}>
                          <Typography sx={{ fontSize: "12px", fontWeight: 700, color: t.blue, mb: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                            ✨ Sugerencia del asistente IA
                          </Typography>
                          <Typography sx={{ fontSize: "13px", color: t.text, lineHeight: 1.6 }}>
                            {selectedSub.ai_hint}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              )}

              {/* Historial */}
              {activeTab === "historial" && (
                <Box>
                  {submissions.length === 0 && (
                    <Typography sx={{ fontSize: "14px", color: t.textMuted }}>Todavía no enviaste ninguna solución.</Typography>
                  )}
                  {submissions.map((sub) => (
                    <HistorialRow key={sub.id} sub={sub} onSelect={() => handleSelectHistorial(sub)} t={t} />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
      <CustomSnackbar open={!!warning} message={warning} severity="warning" onClose={() => setWarning("")} />
    </>
  );
}
