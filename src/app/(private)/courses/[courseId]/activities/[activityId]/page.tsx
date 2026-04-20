"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Button, CircularProgress, Chip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableRow, TableHead,
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ArticleIcon from "@mui/icons-material/Article";
import { useParams, useRouter } from "next/navigation";
import { useAppState } from "@/lib/state";
import * as activitiesService from "@/services/activitiesService";
import * as submissionsService from "@/services/submissionsService";
import MultipleTabsEditor from "@/components/MultipleTabsEditor";
import CustomSnackbar from "@/components/CustomSnackbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Activity, FilesMetadata, SubmissionResult } from "@/types";
import { hasPermission } from "@/utils/permissions";

const STATUS_COLOR: Record<string, "success" | "error" | "warning" | "default"> = {
  SUCCESS: "success",
  FAILURE: "error",
  ERROR: "error",
  TIME_OUT: "warning",
  PENDING: "default",
  PROCESSING: "default",
  ENQUEUED: "default",
};

function groupByDate(submissions: SubmissionResult[]): [string, SubmissionResult[]][] {
  const map = new Map<string, SubmissionResult[]>();
  for (const sub of submissions) {
    const day = new Date(sub.submission_date).toLocaleDateString(undefined, {
      year: "numeric", month: "long", day: "numeric",
    });
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(sub);
  }
  return Array.from(map.entries());
}

export default function SolveActivityPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const activityId = Number(params.activityId);
  const router = useRouter();
  const state = useAppState();
  const permissions = (state.permissions as string[]) || [];
  const canManage = hasPermission(permissions, "activity_manage");

  const [activity, setActivity] = useState<Activity | null>(null);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [filesMetadata, setFilesMetadata] = useState<FilesMetadata>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [submissions, setSubmissions] = useState<SubmissionResult[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionResult | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [polling, setPolling] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      activitiesService.get(courseId, activityId),
      submissionsService.getAll(courseId, activityId).catch(() => []),
    ]).then(([act, subs]) => {
      setActivity(act);
      setSubmissions(subs);
      return activitiesService.getStartingFilesForStudent(courseId, act.starting_rplfile_id);
    }).then((raw) => {
      const { files, filesMetadata } = activitiesService.parseStartingFiles(raw);
      setFiles(files);
      setFilesMetadata(filesMetadata);
    }).finally(() => setLoading(false));
  }, [courseId, activityId]);

  const pollSubmission = useCallback(async (submissionId: number) => {
    setPolling(true);
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const sub = await submissionsService.get(courseId, activityId, submissionId);
        if (sub.submission_status !== "PENDING" && sub.submission_status !== "PROCESSING") {
          setSelectedSubmission(sub);
          setResultDialogOpen(true);
          setPolling(false);
          const subs = await submissionsService.getAll(courseId, activityId);
          setSubmissions(subs);
          return;
        }
      } catch { break; }
    }
    setPolling(false);
    setWarning("La entrega está tardando más de lo esperado. Revisá más tarde.");
  }, [courseId, activityId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const result = await submissionsService.submit(courseId, activityId, files);
      const subs = await submissionsService.getAll(courseId, activityId);
      setSubmissions(subs);
      setDrawerOpen(true);
      pollSubmission(result.id);
    } catch (err: unknown) {
      const e = err as { err?: { detail?: string } };
      setError(e?.err?.detail || "Error submitting solution");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewSubmission = async (sub: SubmissionResult) => {
    try {
      const full = await submissionsService.get(courseId, activityId, sub.id);
      setSelectedSubmission(full);
      setResultDialogOpen(true);
    } catch {
      setError("Error loading submission details");
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;
  if (!activity) return <Typography>Activity not found</Typography>;

  const grouped = groupByDate(submissions);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>
      {/* Top bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" fontWeight={700}>{activity.name}</Typography>
          <Chip label={activity.language} size="small" />
          <Chip label={`${activity.points} pts`} size="small" variant="outlined" />
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {canManage && (
            <Button size="small" onClick={() => router.push(`/courses/${courseId}/activities/${activityId}/edit`)}>
              Volver a modo profesor
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={() => setDrawerOpen(true)}
            disabled={submissions.length === 0}
          >
            Mis entregas ({submissions.length})
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={handleSubmit}
            disabled={submitting || polling}
            startIcon={(submitting || polling) ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            {submitting ? "Enviando..." : polling ? "Ejecutando..." : "Entregar"}
          </Button>
        </Box>
      </Box>

      {/* Two-column body */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, flexGrow: 1, minHeight: 0 }}>
        <MultipleTabsEditor
          files={files}
          language={activity.language}
          onChange={setFiles}
          filesMetadata={filesMetadata}
        />

        <Box sx={{ overflow: "auto", pr: 1 }}>
          {activity.description
            ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{activity.description}</ReactMarkdown>
            : <Typography color="text.secondary" fontSize={14}>No hay descripción.</Typography>}
        </Box>
      </Box>

      {/* Submissions drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 320, pt: 2 }}>
          <Typography variant="h6" sx={{ px: 2, mb: 1 }}>Mis entregas</Typography>
          <Divider />
          {grouped.map(([day, subs]) => (
            <Box key={day}>
              <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 1, display: "block", fontWeight: 600 }}>
                {day}
              </Typography>
              <List dense disablePadding>
                {subs.map((sub) => {
                  const color = STATUS_COLOR[sub.submission_status] ?? "default";
                  const time = new Date(sub.submission_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                  return (
                    <ListItemButton key={sub.id} onClick={() => { handleViewSubmission(sub); setDrawerOpen(false); }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <ArticleIcon fontSize="small" color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Chip label={sub.submission_status} color={color} size="small" />}
                        secondary={time}
                      />
                      {sub.submission_status === "SUCCESS"
                        ? <CheckCircleIcon color="success" fontSize="small" />
                        : ["PENDING", "PROCESSING", "ENQUEUED"].includes(sub.submission_status)
                          ? <ScheduleIcon color="action" fontSize="small" />
                          : sub.submission_status === "TIME_OUT"
                            ? <ScheduleIcon color="warning" fontSize="small" />
                            : <ErrorIcon color="error" fontSize="small" />}
                    </ListItemButton>
                  );
                })}
              </List>
              <Divider />
            </Box>
          ))}
        </Box>
      </Drawer>

      {/* Submission result dialog */}
      <Dialog open={resultDialogOpen} onClose={() => setResultDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Resultado de entrega
          {selectedSubmission && (
            <Chip
              label={selectedSubmission.submission_status}
              color={STATUS_COLOR[selectedSubmission.submission_status] ?? "default"}
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selectedSubmission && (
            <Box>
              {selectedSubmission.stdout && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Salida:</Typography>
                  <Box component="pre" sx={{ p: 1, fontFamily: "monospace", fontSize: 13, whiteSpace: "pre-wrap", bgcolor: "grey.900", color: "grey.100", borderRadius: 1, m: 0 }}>
                    {selectedSubmission.stdout}
                  </Box>
                </Box>
              )}
              {selectedSubmission.stderr && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="error">Errores:</Typography>
                  <Box component="pre" sx={{ p: 1, fontFamily: "monospace", fontSize: 13, whiteSpace: "pre-wrap", bgcolor: "grey.900", color: "error.light", borderRadius: 1, m: 0 }}>
                    {selectedSubmission.stderr}
                  </Box>
                </Box>
              )}
              {selectedSubmission.exit_message && (
                <Alert severity="info" sx={{ mb: 2 }}>{selectedSubmission.exit_message}</Alert>
              )}
              {selectedSubmission.ai_hint && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="primary" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <span style={{ fontSize: "1.2rem" }}>💡</span> Sugerencia IA:
                  </Typography>
                  <Alert severity="warning" variant="outlined" sx={{ borderStyle: "dashed", borderColor: "primary.main", "& .MuiAlert-icon": { display: "none" } }}>
                    <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                      {selectedSubmission.ai_hint}
                    </Typography>
                  </Alert>
                </Box>
              )}
              {selectedSubmission.io_tests_run_results?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Resultados I/O:</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Test</TableCell>
                        <TableCell>Entrada</TableCell>
                        <TableCell>Esperado</TableCell>
                        <TableCell>Obtenido</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedSubmission.io_tests_run_results.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>{t.name}</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{t.test_in}</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{t.expected_output}</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{t.run_output}</TableCell>
                          <TableCell>
                            {t.expected_output?.trim() === t.run_output?.trim()
                              ? <CheckCircleIcon color="success" fontSize="small" />
                              : <ErrorIcon color="error" fontSize="small" />}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
              {selectedSubmission.unit_tests_run_results?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Resultados unit tests:</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Test</TableCell>
                        <TableCell>Resultado</TableCell>
                        <TableCell>Error</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedSubmission.unit_tests_run_results.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>{t.name}</TableCell>
                          <TableCell>{t.passed ? <CheckCircleIcon color="success" fontSize="small" /> : <ErrorIcon color="error" fontSize="small" />}</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{t.error_messages}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
      <CustomSnackbar open={!!warning} message={warning} severity="warning" onClose={() => setWarning("")} />
    </Box>
  );
}
