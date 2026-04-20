"use client";

import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, MenuItem, Tabs, Tab, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, ListItemText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useParams, useRouter } from "next/navigation";
import * as activitiesService from "@/services/activitiesService";
import MultipleTabsEditor from "@/components/MultipleTabsEditor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { languageOptions, getFileExtension } from "@/utils/constants";
import type { Category } from "@/types";
import CustomSnackbar from "@/components/CustomSnackbar";

function defaultFiles(language: string): Record<string, string> {
  return { [`main${getFileExtension(language)}`]: "" };
}

export default function CreateActivityPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const router = useRouter();

  const [name, setName] = useState("");
  const [points, setPoints] = useState(10);
  const [language, setLanguage] = useState("c_std11");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<Record<string, string>>(defaultFiles("c_std11"));
  const [descTab, setDescTab] = useState(0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  useEffect(() => {
    activitiesService.getCategories(courseId).then(setCategories).catch(() => {});
  }, [courseId]);

  const handleLanguageChange = (lang: string) => {
    const oldExt = getFileExtension(language);
    const newExt = getFileExtension(lang);
    setLanguage(lang);
    setFiles((prev) => {
      const renamed: Record<string, string> = {};
      for (const [name, content] of Object.entries(prev)) {
        const newName = name.endsWith(oldExt) ? name.slice(0, -oldExt.length) + newExt : name;
        renamed[newName] = content;
      }
      return renamed;
    });
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
      setCategoryId(created.id);
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

  const save = async (redirect: "list" | "correction") => {
    if (!name.trim()) { setError("Activity name is required"); return; }
    if (!categoryId) { setError("Please select a category"); return; }
    setLoading(true);
    try {
      const activity = await activitiesService.create(
        courseId,
        { name: name.trim(), description: description.trim() || undefined, language, points, category_id: categoryId },
        files,
      );
      if (redirect === "correction") {
        router.push(`/courses/${courseId}/activities/${activity.id}/edit/correction`);
      } else {
        router.push(`/courses/${courseId}/activities`);
      }
    } catch (err: unknown) {
      const e = err as { err?: { detail?: string } };
      setError(e?.err?.detail || "Error creating activity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 128px)" }}>
      {/* Top bar */}
      <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 2, mb: 2 }}>
        <TextField
          label="Activity Name" value={name} onChange={(e) => setName(e.target.value)}
          required size="small" fullWidth
        />
        <TextField
          label="Points" type="number" value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
          required size="small" inputProps={{ min: 0 }}
        />
        <TextField select label="Language" value={language} onChange={(e) => handleLanguageChange(e.target.value)} size="small">
          {languageOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
        <TextField
          select label="Category" value={categoryId}
          onChange={(e) => {
            if (e.target.value === "__create__") { setNewCategoryDialog(true); }
            else { setCategoryId(Number(e.target.value)); }
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
      </Box>

      {/* Main two-column area */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, flexGrow: 1, minHeight: 0 }}>
        {/* Left: initial code editor */}
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <MultipleTabsEditor
            files={files}
            language={language}
            onChange={setFiles}
          />
        </Box>

        {/* Right: description markdown editor */}
        <Paper variant="outlined" sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Tabs value={descTab} onChange={(_, v) => setDescTab(v)} sx={{ borderBottom: 1, borderColor: "divider", minHeight: 36 }}>
            <Tab label="Write" sx={{ minHeight: 36, py: 0.5 }} />
            <Tab label="Preview" sx={{ minHeight: 36, py: 0.5 }} />
          </Tabs>
          <Box sx={{ flexGrow: 1, overflow: "auto", p: 1 }}>
            {descTab === 0 ? (
              <TextField
                multiline fullWidth value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write the problem statement in Markdown…"
                variant="standard"
                InputProps={{ disableUnderline: true, sx: { fontFamily: "monospace", fontSize: 14 } }}
                sx={{ height: "100%", "& .MuiInputBase-root": { height: "100%", alignItems: "flex-start" } }}
              />
            ) : (
              <Box className="markdown-body" sx={{ fontSize: 14, p: 1 }}>
                {description
                  ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
                  : <Typography color="text.secondary" fontSize={14}>Nothing to preview.</Typography>}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button variant="outlined" onClick={() => router.push(`/courses/${courseId}/activities`)}>Cancel</Button>
        <Button variant="contained" onClick={() => save("list")} disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
        <Button variant="contained" color="secondary" onClick={() => save("correction")} disabled={loading}>
          {loading ? "Saving…" : "Save and Add Tests"}
        </Button>
      </Box>

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />

      <Dialog open={newCategoryDialog} onClose={() => setNewCategoryDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth label="Name" value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            margin="normal" required
            onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
          />
          <TextField
            fullWidth label="Description (optional)" value={newCategoryDescription}
            onChange={(e) => setNewCategoryDescription(e.target.value)}
            margin="normal"
          />
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
