"use client";

import React, { useState } from "react";
import { Box, Typography, Paper, TextField, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state";
import * as coursesService from "@/services/coursesService";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function CreateCoursePage() {
  const router = useRouter();
  const state = useAppState();
  const profile = state.profile as { id: number } | undefined;
  const [form, setForm] = useState({
    name: "", university: "FIUBA", subject_id: "", semester: "",
    semester_start_date: "", semester_end_date: "", description: "", img_uri: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      await coursesService.create({ ...form, course_admin_user_id: String(profile.id) });
      router.push("/courses");
    } catch (err: unknown) {
      const error = err as { err?: { detail?: string } };
      setError(error?.err?.detail || "Error creating course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Create Course</Typography>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Course Name" value={form.name} onChange={handleChange("name")} margin="normal" required />
          <TextField fullWidth label="Subject ID" value={form.subject_id} onChange={handleChange("subject_id")} margin="normal" required />
          <TextField fullWidth label="University" value={form.university} onChange={handleChange("university")} margin="normal" />
          <TextField fullWidth label="Semester" value={form.semester} onChange={handleChange("semester")} margin="normal" placeholder="2025-1" required />
          <TextField fullWidth label="Start Date" type="date" value={form.semester_start_date} onChange={handleChange("semester_start_date")} margin="normal" InputLabelProps={{ shrink: true }} required />
          <TextField fullWidth label="End Date" type="date" value={form.semester_end_date} onChange={handleChange("semester_end_date")} margin="normal" InputLabelProps={{ shrink: true }} required />
          <TextField fullWidth label="Description" value={form.description} onChange={handleChange("description")} margin="normal" multiline rows={3} />
          <TextField fullWidth label="Image URL" value={form.img_uri} onChange={handleChange("img_uri")} margin="normal" />
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button variant="contained" type="submit" disabled={loading}>{loading ? "Creating..." : "Create"}</Button>
            <Button variant="outlined" onClick={() => router.back()}>Cancel</Button>
          </Box>
        </form>
      </Paper>
      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
    </Box>
  );
}
