"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useRouter } from "next/navigation";
import * as activitiesService from "@/services/activitiesService";
import MultipleTabsEditor from "@/components/MultipleTabsEditor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { languageOptions, getFileExtension } from "@/utils/constants";
import type { Category } from "@/types";
import CustomSnackbar from "@/components/CustomSnackbar";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";

function defaultFiles(language: string): Record<string, string> {
  return { [`main${getFileExtension(language)}`]: "" };
}

export default function CreateActivityPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const router = useRouter();
  const { isDark } = useThemeMode();
  const t = isDark ? darkTokens : lightTokens;

  const [name, setName] = useState("");
  const [points, setPoints] = useState(10);
  const [language, setLanguage] = useState("c_std11");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<Record<string, string>>(defaultFiles("c_std11"));
  const [showPreview, setShowPreview] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  useEffect(() => {
    activitiesService.getCategories(courseId).then(setCategories).catch(() => {});
  }, [courseId]);

  const handleLanguageChange = (lang: string) => {
    const oldExt = getFileExtension(language);
    const newExt = getFileExtension(lang);
    setLanguage(lang);
    setFiles((prev) => {
      const renamed: Record<string, string> = {};
      for (const [fname, content] of Object.entries(prev)) {
        const newName = fname.endsWith(oldExt) ? fname.slice(0, -oldExt.length) + newExt : fname;
        renamed[newName] = content;
      }
      return renamed;
    });
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    try {
      const created = await activitiesService.createCategory(courseId, {
        name: newCatName.trim(),
        description: newCatDesc.trim() || undefined,
      });
      setCategories((prev) => [...prev, created]);
      setCategoryId(created.id);
      setNewCategoryDialog(false);
      setNewCatName("");
      setNewCatDesc("");
    } catch (err: unknown) {
      const e = err as { err?: { detail?: string } };
      setError(e?.err?.detail || "Error al crear categoría");
    } finally {
      setCreatingCat(false);
    }
  };

  const save = async (redirect: "list" | "edit") => {
    if (!name.trim()) { setError("El nombre de la actividad es requerido"); return; }
    if (!categoryId) { setError("Seleccioná una categoría"); return; }
    setLoading(true);
    try {
      const activity = await activitiesService.create(
        courseId,
        { name: name.trim(), description: description.trim() || undefined, language, points, category_id: categoryId },
        files,
      );
      if (redirect === "edit") {
        router.push(`/courses/${courseId}/activities/${activity.id}/edit`);
      } else {
        router.push(`/courses/${courseId}/activities`);
      }
    } catch (err: unknown) {
      const e = err as { err?: { detail?: string } };
      setError(e?.err?.detail || "Error al crear actividad");
    } finally {
      setLoading(false);
    }
  };

  const labelSx = { fontSize: "10px", fontWeight: 700, color: t.textMuted, textTransform: "uppercase" as const, letterSpacing: "0.5px", mb: "4px" };
  const inputSx = {
    fontSize: "13px", color: t.text, background: t.surface2,
    border: `1px solid ${t.border}`, borderRadius: "7px",
    padding: "6px 10px", outline: "none", fontFamily: "inherit",
    "&:focus": { borderColor: t.blue },
    boxSizing: "border-box" as const,
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 128px)" }}>
      {/* Page header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "20px" }}>
        <Box
          component="button"
          onClick={() => router.push(`/courses/${courseId}/activities`)}
          sx={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "none", border: "none", cursor: "pointer",
            color: t.textMuted, fontSize: "13px", fontWeight: 500, fontFamily: "inherit",
            borderRadius: "6px", padding: "4px 8px",
            "&:hover": { background: t.surface2, color: t.text },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 15 }} />
          Actividades
        </Box>
        <Box sx={{ width: "1px", height: "16px", background: t.border }} />
        <Typography sx={{ fontSize: "20px", fontWeight: 800, color: t.text, letterSpacing: "-0.5px" }}>
          Nueva actividad
        </Typography>
      </Box>

      {/* Metadata row */}
      <Box sx={{
        display: "flex", alignItems: "flex-end", gap: "10px", flexWrap: "wrap",
        mb: "16px", pb: "16px", borderBottom: `1px solid ${t.border}`,
      }}>
        {/* Name */}
        <Box sx={{ flexGrow: 1, minWidth: "200px" }}>
          <Box sx={labelSx}>Nombre</Box>
          <Box
            component="input"
            autoFocus
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="Nombre de la actividad"
            sx={{ ...inputSx, width: "100%" }}
          />
        </Box>

        {/* Points */}
        <Box>
          <Box sx={labelSx}>Puntos</Box>
          <Box
            component="input"
            type="number"
            value={points}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPoints(Number(e.target.value))}
            min={0}
            sx={{ ...inputSx, width: "80px" }}
          />
        </Box>

        {/* Language */}
        <Box>
          <Box sx={labelSx}>Lenguaje</Box>
          <Box
            component="select"
            value={language}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleLanguageChange(e.target.value)}
            sx={{ ...inputSx, cursor: "pointer", padding: "6px 28px 6px 10px" }}
          >
            {languageOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Box>
        </Box>

        {/* Category */}
        <Box>
          <Box sx={labelSx}>Categoría</Box>
          <Box
            component="select"
            value={categoryId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              if (e.target.value === "__create__") { setNewCategoryDialog(true); }
              else { setCategoryId(Number(e.target.value)); }
            }}
            sx={{ ...inputSx, cursor: "pointer", padding: "6px 28px 6px 10px" }}
          >
            <option value={0}>Sin categoría</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="__create__">+ Nueva categoría…</option>
          </Box>
        </Box>

        {/* Preview toggle */}
        <Box sx={{ ml: "auto" }}>
          <Box
            component="button"
            onClick={() => setShowPreview((p) => !p)}
            sx={{
              background: "none", border: `1px solid ${t.border}`, borderRadius: "7px",
              padding: "6px 12px", fontSize: "12px", fontWeight: 600, fontFamily: "inherit",
              color: t.textMuted, cursor: "pointer",
              "&:hover": { background: t.surface2 },
            }}
          >
            {showPreview ? "Ocultar preview" : "Mostrar preview"}
          </Box>
        </Box>
      </Box>

      {/* Main area: editor + description */}
      <Box sx={{ display: "grid", gridTemplateColumns: showPreview ? "1fr 1fr" : "1fr", gap: "16px", flexGrow: 1, minHeight: 0 }}>
        <MultipleTabsEditor files={files} language={language} onChange={setFiles} />

        {showPreview && (
          <Box sx={{
            display: "flex", flexDirection: "column",
            border: `1px solid ${t.border}`, borderRadius: "8px", overflow: "hidden",
            background: t.surface,
          }}>
            <Box sx={{ display: "flex", borderBottom: `1px solid ${t.border}` }}>
              <Box sx={{ px: "16px", py: "10px", fontSize: "12px", fontWeight: 700, color: t.textMuted }}>Enunciado</Box>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", flexGrow: 1, minHeight: 0, overflow: "hidden" }}>
              <Box
                component="textarea"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder="Enunciado en Markdown…"
                sx={{
                  width: "100%", height: "100%", padding: "14px",
                  fontSize: "13px", fontFamily: "var(--font-jetbrains-mono, monospace)",
                  color: t.text, background: t.surface,
                  border: "none", borderRight: `1px solid ${t.border}`,
                  outline: "none", resize: "none", boxSizing: "border-box",
                  lineHeight: 1.6,
                  "&::placeholder": { color: t.textSoft },
                }}
              />
              <Box sx={{ overflow: "auto", padding: "14px" }}>
                {description ? (
                  <Box sx={{
                    fontSize: "13px", lineHeight: 1.7, color: t.text,
                    "& h1,& h2,& h3": { color: t.text, fontWeight: 700 },
                    "& code": { fontFamily: "var(--font-jetbrains-mono, monospace)", background: t.surface2, borderRadius: "4px", padding: "1px 5px" },
                    "& pre": { background: t.surface2, borderRadius: "8px", padding: "10px 14px", overflow: "auto" },
                    "& pre code": { background: "none", padding: 0 },
                  }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: "13px", color: t.textSoft }}>Vista previa…</Typography>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "10px", mt: "16px" }}>
        <Box
          component="button"
          onClick={() => router.push(`/courses/${courseId}/activities`)}
          sx={{
            background: "none", border: `1px solid ${t.border}`, borderRadius: "8px",
            padding: "8px 16px", fontSize: "13px", fontWeight: 600, fontFamily: "inherit",
            color: t.textMuted, cursor: "pointer",
            "&:hover": { background: t.surface2 },
          }}
        >
          Cancelar
        </Box>
        <Box
          component="button"
          onClick={() => save("edit")}
          disabled={loading}
          sx={{
            background: t.surface2, border: `1px solid ${t.border}`, borderRadius: "8px",
            padding: "8px 16px", fontSize: "13px", fontWeight: 700, fontFamily: "inherit",
            color: t.text, cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          Guardar y agregar tests
        </Box>
        <Box
          component="button"
          onClick={() => save("list")}
          disabled={loading}
          sx={{
            background: t.blue, color: "#fff", border: "none", borderRadius: "8px",
            padding: "8px 16px", fontSize: "13px", fontWeight: 700, fontFamily: "inherit",
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Guardando…" : "Guardar"}
        </Box>
      </Box>

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />

      <Dialog open={newCategoryDialog} onClose={() => setNewCategoryDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700 }}>Nueva categoría</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", pt: "4px" }}>
            <Box>
              <Box sx={{ fontSize: "11px", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px", mb: "4px" }}>Nombre</Box>
              <Box
                component="input"
                autoFocus
                value={newCatName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCatName(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") handleCreateCategory(); }}
                sx={{ width: "100%", padding: "8px 10px", fontSize: "14px", borderRadius: "7px", border: "1px solid", borderColor: "divider", outline: "none", boxSizing: "border-box" }}
              />
            </Box>
            <Box>
              <Box sx={{ fontSize: "11px", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px", mb: "4px" }}>Descripción (opcional)</Box>
              <Box
                component="input"
                value={newCatDesc}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCatDesc(e.target.value)}
                sx={{ width: "100%", padding: "8px 10px", fontSize: "14px", borderRadius: "7px", border: "1px solid", borderColor: "divider", outline: "none", boxSizing: "border-box" }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: "20px", pb: "16px" }}>
          <Box component="button" onClick={() => setNewCategoryDialog(false)} sx={{ background: "none", border: "1px solid", borderColor: "divider", borderRadius: "7px", padding: "7px 14px", fontSize: "13px", fontFamily: "inherit", cursor: "pointer" }}>
            Cancelar
          </Box>
          <Box
            component="button"
            onClick={handleCreateCategory}
            disabled={!newCatName.trim() || creatingCat}
            sx={{ bgcolor: "primary.main", color: "#fff", border: "none", borderRadius: "7px", padding: "7px 16px", fontSize: "13px", fontWeight: 700, fontFamily: "inherit", cursor: (!newCatName.trim() || creatingCat) ? "default" : "pointer", opacity: (!newCatName.trim() || creatingCat) ? 0.6 : 1 }}
          >
            {creatingCat ? "Creando…" : "Crear"}
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
