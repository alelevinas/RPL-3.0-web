"use client";

import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, TextField, Button, MenuItem, FormControlLabel, Switch, CircularProgress,
  Divider, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useParams, useRouter } from "next/navigation";
import * as activitiesService from "@/services/activitiesService";
import MultipleTabsEditor from "@/components/MultipleTabsEditor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Tabs, Tab } from "@mui/material";
import { languageOptions, toVersionedLanguage } from "@/utils/constants";
import type { Category } from "@/types";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function EditActivityPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const activityId = Number(params.activityId);
  const router = useRouter();

  const [form, setForm] = useState({
    name: "", description: "", language: "c_std11", points: 10, active: true,
    category_id: 0,
  });
  const [files, setFiles] = useState<Record<string, string>>({});
  const [descTab, setDescTab] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  useEffect(() => {
    Promise.all([
      activitiesService.get(courseId, activityId),
      activitiesService.getCategories(courseId),
    ]).then(([act, cats]) => {
      setForm({
        name: act.name,
        description: act.description || "",
        language: toVersionedLanguage(act.language),
        points: act.points,
        active: act.active,
        category_id: act.category_id,
      });
      setCategories(cats);
      return activitiesService.getStartingFiles(courseId, act.starting_rplfile_id);
    }).then((startingFiles) => {
      setFiles(startingFiles);
    }).finally(() => setLoading(false));
  }, [courseId, activityId]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      const created = await activitiesService.createCategory(courseId, {
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
      });
      setCategories((prev) => [...prev, created]);
      setForm((prev) => ({ ...prev, category_id: created.id }));
      setNewCategoryDialog(false);
      setNewCategoryName("");
      setNewCategoryDescription("");
    } catch (err: unknown) {
      const e = err as { err?: { detail?: string } };
      setError(e?.err?.detail || "Error creating category");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await activitiesService.edit(courseId, activityId, {
        name: form.name,
        description: form.description || undefined,
        language: form.language,
        points: form.points,
        active: form.active,
        category_id: form.category_id,
      }, files);
      setSuccess("Activity updated");
    } catch (err: unknown) {
      const e = err as { err?: { detail?: string } };
      setError(e?.err?.detail || "Error updating activity");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 128px)" }}>
      <Typography variant="h4" gutterBottom>Edit Activity</Typography>

      {/* Top metadata row */}
      <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField label="Activity Name" value={form.name} onChange={handleChange("name")} required size="small" />
        <TextField label="Points" type="number" value={form.points} onChange={handleChange("points")} required size="small" inputProps={{ min: 0 }} />
        <TextField select label="Language" value={form.language} onChange={handleChange("language")} size="small">
          {languageOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
        <TextField
          select label="Category" value={form.category_id}
          onChange={(e) => {
            if (e.target.value === "__create__") { setNewCategoryDialog(true); }
            else { setForm((p) => ({ ...p, category_id: Number(e.target.value) })); }
          }}
          size="small"
        >
          <MenuItem value={0}>None</MenuItem>
          {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          <Divider />
          <MenuItem value="__create__" sx={{ color: "primary.main" }}>
            <AddIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Create new category…" />
          </MenuItem>
        </TextField>
        <FormControlLabel
          control={<Switch checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />}
          label="Active"
        />
      </Box>

      {/* Main two-column area */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, flexGrow: 1, minHeight: 0 }}>
        <MultipleTabsEditor files={files} language={form.language} onChange={setFiles} />

        <Paper variant="outlined" sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Tabs value={descTab} onChange={(_, v) => setDescTab(v)} sx={{ borderBottom: 1, borderColor: "divider", minHeight: 36 }}>
            <Tab label="Write" sx={{ minHeight: 36, py: 0.5 }} />
            <Tab label="Preview" sx={{ minHeight: 36, py: 0.5 }} />
          </Tabs>
          <Box sx={{ flexGrow: 1, overflow: "auto", p: 1 }}>
            {descTab === 0 ? (
              <TextField
                multiline fullWidth value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Problem statement in Markdown…"
                variant="standard"
                InputProps={{ disableUnderline: true, sx: { fontFamily: "monospace", fontSize: 14 } }}
                sx={{ height: "100%", "& .MuiInputBase-root": { height: "100%", alignItems: "flex-start" } }}
              />
            ) : (
              <Box className="markdown-body" sx={{ fontSize: 14, p: 1 }}>
                {form.description
                  ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.description}</ReactMarkdown>
                  : <Typography color="text.secondary" fontSize={14}>Nothing to preview.</Typography>}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Button variant="outlined" onClick={() => router.push(`/courses/${courseId}/activities`)}>← Back</Button>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => router.push(`/courses/${courseId}/activities/${activityId}/edit/correction`)}
          >
            Manage Tests & Flags
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </Box>
      </Box>

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
      <CustomSnackbar open={!!success} message={success} severity="success" onClose={() => setSuccess("")} />

      <Dialog open={newCategoryDialog} onClose={() => setNewCategoryDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New Category</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth label="Name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} margin="normal" required onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()} />
          <TextField fullWidth label="Description (optional)" value={newCategoryDescription} onChange={(e) => setNewCategoryDescription(e.target.value)} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCategoryDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCategory} disabled={!newCategoryName.trim() || creatingCategory}>
            {creatingCategory ? "Creating…" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
