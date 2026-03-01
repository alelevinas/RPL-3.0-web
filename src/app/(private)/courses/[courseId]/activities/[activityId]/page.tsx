"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography, Button, Paper, CircularProgress, Chip, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableRow, TableHead } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { useParams, useRouter } from "next/navigation";
import { useAppState } from "@/lib/state";
import * as activitiesService from "@/services/activitiesService";
import * as submissionsService from "@/services/submissionsService";
import MultipleTabsEditor from "@/components/MultipleTabsEditor";
import CustomSnackbar from "@/components/CustomSnackbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Activity, SubmissionResult } from "@/types";

export default function SolveActivityPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const activityId = Number(params.activityId);
  const router = useRouter();
  const state = useAppState();
  const permissions = (state.permissions as string[]) || [];
  const canManage = permissions.includes("activity_manage");

  const [activity, setActivity] = useState<Activity | null>(null);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<SubmissionResult[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionResult | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    Promise.all([
      activitiesService.get(courseId, activityId),
      activitiesService.getStartingFiles(courseId, activityId).catch(() => ({})),
      submissionsService.getAll(courseId, activityId).catch(() => []),
    ]).then(([act, startFiles, subs]) => {
      setActivity(act);
      setFiles(startFiles as Record<string, string>);
      setSubmissions(subs);
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
    setError("Submission is taking too long. Check back later.");
  }, [courseId, activityId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const result = await submissionsService.submit(courseId, activityId, files);
      pollSubmission(result.id);
    } catch (err: unknown) {
      const error = err as { err?: { detail?: string } };
      setError(error?.err?.detail || "Error submitting solution");
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

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="h4">{activity.name}</Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
            <Chip label={activity.language} size="small" />
            <Chip label={`${activity.points} pts`} size="small" variant="outlined" />
            {activity.is_io_tested && <Chip label="I/O Tested" size="small" color="info" />}
          </Box>
        </Box>
        {canManage && (
          <Button variant="outlined" onClick={() => router.push(`/courses/${courseId}/activities/${activityId}/edit`)}>
            Edit Activity
          </Button>
        )}
      </Box>

      {activity.description && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{activity.description}</ReactMarkdown>
        </Paper>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Solution</Typography>
        <MultipleTabsEditor files={files} language={activity.language} onChange={setFiles} />
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}>
          {(submitting || polling) && <CircularProgress size={24} />}
          <Button variant="contained" onClick={handleSubmit} disabled={submitting || polling}>
            {submitting ? "Submitting..." : polling ? "Running tests..." : "Submit"}
          </Button>
        </Box>
      </Paper>

      {submissions.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Submissions</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((sub, i) => (
                <TableRow key={sub.id}>
                  <TableCell>{submissions.length - i}</TableCell>
                  <TableCell>
                    <Chip
                      icon={sub.submission_status === "SUCCESS" ? <CheckCircleIcon /> : <ErrorIcon />}
                      label={sub.submission_status}
                      color={sub.submission_status === "SUCCESS" ? "success" : sub.submission_status === "FAILURE" || sub.submission_status === "ERROR" ? "error" : "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(sub.submission_date).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleViewSubmission(sub)}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Submission Result Dialog */}
      <Dialog open={resultDialogOpen} onClose={() => setResultDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Submission Result
          {selectedSubmission && (
            <Chip
              label={selectedSubmission.submission_status}
              color={selectedSubmission.submission_status === "SUCCESS" ? "success" : "error"}
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
                  <Typography variant="subtitle2">Output:</Typography>
                  <Paper variant="outlined" sx={{ p: 1, fontFamily: "monospace", fontSize: 13, whiteSpace: "pre-wrap", bgcolor: "grey.900", color: "grey.100" }}>
                    {selectedSubmission.stdout}
                  </Paper>
                </Box>
              )}
              {selectedSubmission.stderr && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="error">Errors:</Typography>
                  <Paper variant="outlined" sx={{ p: 1, fontFamily: "monospace", fontSize: 13, whiteSpace: "pre-wrap", bgcolor: "grey.900", color: "error.light" }}>
                    {selectedSubmission.stderr}
                  </Paper>
                </Box>
              )}
              {selectedSubmission.exit_message && (
                <Alert severity="info" sx={{ mb: 2 }}>{selectedSubmission.exit_message}</Alert>
              )}
              {selectedSubmission.ai_hint && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <span style={{ fontSize: '1.2rem' }}>💡</span> AI Debugging Hint:
                  </Typography>
                  <Alert severity="warning" variant="outlined" sx={{ 
                    borderStyle: 'dashed', 
                    borderColor: 'primary.main', 
                    bgcolor: 'primary.50',
                    '& .MuiAlert-icon': { display: 'none' } 
                  }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary' }}>
                      {selectedSubmission.ai_hint}
                    </Typography>
                  </Alert>
                </Box>
              )}
              {selectedSubmission.io_tests_run_results?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>I/O Test Results:</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Test</TableCell>
                        <TableCell>Input</TableCell>
                        <TableCell>Expected</TableCell>
                        <TableCell>Got</TableCell>
                        <TableCell>Result</TableCell>
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
                  <Typography variant="subtitle2" gutterBottom>Unit Test Results:</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Test</TableCell>
                        <TableCell>Result</TableCell>
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
          <Button onClick={() => setResultDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
    </Box>
  );
}
