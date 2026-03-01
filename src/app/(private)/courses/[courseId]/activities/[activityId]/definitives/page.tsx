"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, CircularProgress, Button } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import * as submissionsService from "@/services/submissionsService";
import type { SubmissionResult } from "@/types";

export default function DefinitivesPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const activityId = Number(params.activityId);
  const router = useRouter();

  const [submissions, setSubmissions] = useState<SubmissionResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    submissionsService.getAllFinalSubmissions(courseId, activityId).then(setSubmissions).catch(() => {}).finally(() => setLoading(false));
  }, [courseId, activityId]);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Final Submissions</Typography>
      <Paper sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>{sub.submission_rplfile_name}</TableCell>
                <TableCell><Chip label={sub.submission_status} color={sub.submission_status === "SUCCESS" ? "success" : "error"} size="small" /></TableCell>
                <TableCell>{new Date(sub.submission_date).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {submissions.length === 0 && (
              <TableRow><TableCell colSpan={3} align="center">No final submissions yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
      <Button variant="outlined" sx={{ mt: 2 }} onClick={() => router.back()}>Back</Button>
    </Box>
  );
}
