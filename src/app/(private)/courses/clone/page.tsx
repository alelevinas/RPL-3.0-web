"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, TextField, Button, MenuItem, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state";
import * as coursesService from "@/services/coursesService";
import type { Course } from "@/types";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function CloneCoursePage() {
  const router = useRouter();
  const state = useAppState();
  const profile = state.profile as { id: number } | undefined;
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
      const error = err as { err?: { detail?: string } };
      setError(error?.err?.detail || "Error cloning course");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Clone Course</Typography>
      <Paper sx={{ p: 3, maxWidth: 500 }}>
        <form onSubmit={handleSubmit}>
          <TextField select fullWidth label="Source Course" value={selectedCourse} onChange={(e) => setSelectedCourse(Number(e.target.value))} margin="normal" required>
            {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.name} ({c.semester})</MenuItem>)}
          </TextField>
          <TextField fullWidth label="New Semester" value={semester} onChange={(e) => setSemester(e.target.value)} margin="normal" placeholder="2025-2" required />
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button variant="contained" type="submit" disabled={saving}>{saving ? "Cloning..." : "Clone"}</Button>
            <Button variant="outlined" onClick={() => router.back()}>Cancel</Button>
          </Box>
        </form>
      </Paper>
      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
    </Box>
  );
}
