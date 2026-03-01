"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, TextField, Button, MenuItem, FormControlLabel, Switch, CircularProgress } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import * as activitiesService from "@/services/activitiesService";
import MonacoEditor from "@/components/MonacoEditor";
import { languageOptions, getMonacoLanguage } from "@/utils/constants";
import type { Category } from "@/types";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function EditActivityPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const activityId = Number(params.activityId);
  const router = useRouter();

  const [form, setForm] = useState({ name: "", description: "", language: "c_std11", points: 10, is_io_tested: false, compilation_flags: "", category_id: 0, active: true });
  const [unitTestContent, setUnitTestContent] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([
      activitiesService.get(courseId, activityId),
      activitiesService.getCategories(courseId),
    ]).then(([act, cats]) => {
      setForm({ name: act.name, description: act.description || "", language: act.language, points: act.points, is_io_tested: act.is_io_tested, compilation_flags: act.compilation_flags || "", category_id: act.category_id, active: act.active });
      setUnitTestContent(act.activity_unit_tests_content || "");
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, [courseId, activityId]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await activitiesService.edit(courseId, activityId, { ...form, activity_unit_tests_content: form.is_io_tested ? undefined : unitTestContent });
      setSuccess("Activity updated");
    } catch (err: unknown) {
      const error = err as { err?: { detail?: string } };
      setError(error?.err?.detail || "Error updating activity");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Edit Activity</Typography>
      <Paper sx={{ p: 3, maxWidth: 800 }}>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Name" value={form.name} onChange={handleChange("name")} margin="normal" required />
          <TextField fullWidth label="Description" value={form.description} onChange={handleChange("description")} margin="normal" multiline rows={3} />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 1 }}>
            <TextField select label="Language" value={form.language} onChange={handleChange("language")}>
              {languageOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </TextField>
            <TextField select label="Category" value={form.category_id} onChange={handleChange("category_id")}>
              <MenuItem value={0}>None</MenuItem>
              {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField label="Points" type="number" value={form.points} onChange={handleChange("points")} />
            <TextField label="Compilation Flags" value={form.compilation_flags} onChange={handleChange("compilation_flags")} />
          </Box>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <FormControlLabel control={<Switch checked={form.is_io_tested} onChange={(e) => setForm((p) => ({ ...p, is_io_tested: e.target.checked }))} />} label="I/O Tested" />
            <FormControlLabel control={<Switch checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />} label="Active" />
          </Box>
          {!form.is_io_tested && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Unit Test Code:</Typography>
              <MonacoEditor value={unitTestContent} language={getMonacoLanguage(form.language)} onChange={(v) => setUnitTestContent(v || "")} height="300px" />
            </Box>
          )}
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button variant="contained" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            <Button variant="outlined" onClick={() => router.push(`/courses/${courseId}/activities/${activityId}/edit/correction`)}>Manage Tests</Button>
            <Button variant="outlined" onClick={() => router.back()}>Back</Button>
          </Box>
        </form>
      </Paper>
      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
      <CustomSnackbar open={!!success} message={success} severity="success" onClose={() => setSuccess("")} />
    </Box>
  );
}
