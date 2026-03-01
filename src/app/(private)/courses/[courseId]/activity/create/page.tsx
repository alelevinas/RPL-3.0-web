"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, TextField, Button, MenuItem, FormControlLabel, Switch } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import * as activitiesService from "@/services/activitiesService";
import MonacoEditor from "@/components/MonacoEditor";
import { languageOptions, getTestCodeForLanguage, getMonacoLanguage } from "@/utils/constants";
import type { Category } from "@/types";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function CreateActivityPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const router = useRouter();

  const [form, setForm] = useState({
    name: "", description: "", language: "c_std11", points: 10,
    is_io_tested: false, compilation_flags: "", category_id: 0,
  });
  const [unitTestContent, setUnitTestContent] = useState(getTestCodeForLanguage("c_std11"));
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    activitiesService.getCategories(courseId).then(setCategories).catch(() => {});
  }, [courseId]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "language") setUnitTestContent(getTestCodeForLanguage(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await activitiesService.create(courseId, {
        ...form,
        activity_unit_tests_content: form.is_io_tested ? undefined : unitTestContent,
      });
      router.push(`/courses/${courseId}/activities`);
    } catch (err: unknown) {
      const error = err as { err?: { detail?: string } };
      setError(error?.err?.detail || "Error creating activity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Create Activity</Typography>
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
          <FormControlLabel
            control={<Switch checked={form.is_io_tested} onChange={(e) => setForm((p) => ({ ...p, is_io_tested: e.target.checked }))} />}
            label="I/O Tested (instead of unit tests)"
            sx={{ mt: 2 }}
          />
          {!form.is_io_tested && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Unit Test Code:</Typography>
              <MonacoEditor value={unitTestContent} language={getMonacoLanguage(form.language)} onChange={(v) => setUnitTestContent(v || "")} height="300px" />
            </Box>
          )}
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button variant="contained" type="submit" disabled={loading}>{loading ? "Creating..." : "Create Activity"}</Button>
            <Button variant="outlined" onClick={() => router.back()}>Cancel</Button>
          </Box>
        </form>
      </Paper>
      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
    </Box>
  );
}
