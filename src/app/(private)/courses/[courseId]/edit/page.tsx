"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, TextField, Button, FormControlLabel, Switch, CircularProgress } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import * as coursesService from "@/services/coursesService";
// Course type used implicitly via service return
import CustomSnackbar from "@/components/CustomSnackbar";

export default function EditCoursePage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const router = useRouter();

  const [form, setForm] = useState({ name: "", description: "", semester: "", active: true, img_uri: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    coursesService.get(courseId).then((c) => {
      setForm({ name: c.name, description: c.description, semester: c.semester, active: c.active, img_uri: c.img_uri || "" });
    }).finally(() => setLoading(false));
  }, [courseId]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await coursesService.edit(courseId, form);
      setSuccess("Course updated");
    } catch (err: unknown) {
      const error = err as { err?: { detail?: string } };
      setError(error?.err?.detail || "Error updating course");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Edit Course</Typography>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Name" value={form.name} onChange={handleChange("name")} margin="normal" required />
          <TextField fullWidth label="Description" value={form.description} onChange={handleChange("description")} margin="normal" multiline rows={3} />
          <TextField fullWidth label="Semester" value={form.semester} onChange={handleChange("semester")} margin="normal" />
          <TextField fullWidth label="Image URL" value={form.img_uri} onChange={handleChange("img_uri")} margin="normal" />
          <FormControlLabel control={<Switch checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />} label="Active" sx={{ mt: 1 }} />
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button variant="contained" type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            <Button variant="outlined" onClick={() => router.back()}>Back</Button>
          </Box>
        </form>
      </Paper>
      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
      <CustomSnackbar open={!!success} message={success} severity="success" onClose={() => setSuccess("")} />
    </Box>
  );
}
