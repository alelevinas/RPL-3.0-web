"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import * as activitiesService from "@/services/activitiesService";
import * as activityTestsService from "@/services/activityTestsService";
import MultipleTabsEditor from "@/components/MultipleTabsEditor";
import MonacoEditor from "@/components/MonacoEditor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  languageOptions, toVersionedLanguage, getFileExtension,
  getMonacoLanguage, getTestCodeForLanguage,
} from "@/utils/constants";
import { FILE_DISPLAY_MODE, type FileDisplayMode, type Category, type Activity, type IOTest } from "@/types";
import CustomSnackbar from "@/components/CustomSnackbar";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";

// ─── Language badge ────────────────────────────────────────────────────────────

const LANG_COLORS: Record<string, string> = {
  python: "#3572A5", java: "#B07219", c: "#555", cpp: "#F34B7D",
  javascript: "#c4a000", haskell: "#5E5186", go: "#00ACD7", rust: "#CE4A00",
};

function LangBadge({ lang }: { lang: string }) {
  const base = lang.split("_")[0].toLowerCase();
  const color = LANG_COLORS[base] || "#888";
  const label = languageOptions.find((o) => o.value === lang)?.label || lang;
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center",
      background: `${color}22`, color, borderRadius: "5px",
      padding: "2px 8px", fontSize: "11px", fontWeight: 700,
    }}>
      {label}
    </Box>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

const TABS = ["Enunciado", "Código inicial", "Tests y corrección"] as const;
type TabId = typeof TABS[number];

function TabBar({ active, onChange, disabledTabs, t }: {
  active: TabId;
  onChange: (t: TabId) => void;
  disabledTabs?: TabId[];
  t: typeof lightTokens;
}) {
  return (
    <Box sx={{ display: "flex", borderBottom: `1px solid ${t.border}`, px: "20px", flexShrink: 0 }}>
      {TABS.map((tab) => {
        const isActive = tab === active;
        const isDisabled = disabledTabs?.includes(tab);
        return (
          <Box
            key={tab}
            onClick={() => !isDisabled && onChange(tab)}
            title={isDisabled ? "Guardá la actividad primero" : undefined}
            sx={{
              px: "4px", py: "12px", mr: "24px", fontSize: "13px", fontWeight: 600,
              color: isDisabled ? t.textSoft : isActive ? t.blue : t.textMuted,
              borderBottom: isActive ? `2px solid ${t.blue}` : "2px solid transparent",
              cursor: isDisabled ? "not-allowed" : "pointer",
              transition: "color 0.12s, border-color 0.12s",
              userSelect: "none",
            }}
          >
            {tab}
            {isDisabled && (
              <Box component="span" sx={{ ml: "6px", fontSize: "10px", color: t.textSoft }}>
                (guardá primero)
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Pill segmented toggle ─────────────────────────────────────────────────────

function PillToggle<T extends string>({ options, value, onChange, t }: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  t: typeof lightTokens;
}) {
  return (
    <Box sx={{ display: "flex", background: t.surface2, borderRadius: "8px", padding: "3px", gap: "2px" }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Box
            key={o.value}
            onClick={() => onChange(o.value)}
            sx={{
              px: "14px", py: "5px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
              background: active ? t.surface : "transparent",
              color: active ? t.text : t.textMuted,
              boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              cursor: "pointer", transition: "background 0.12s, color 0.12s", userSelect: "none",
            }}
          >
            {o.label}
          </Box>
        );
      })}
    </Box>
  );
}

// ─── IO Tests panel ───────────────────────────────────────────────────────────

function IOTestsPanel({ courseId, activityId, ioTests, setIoTests, t, onError }: {
  courseId: number; activityId: number;
  ioTests: IOTest[]; setIoTests: React.Dispatch<React.SetStateAction<IOTest[]>>;
  t: typeof lightTokens; onError: (m: string) => void;
}) {
  const [newTest, setNewTest] = useState({ name: "", test_in: "", test_out: "" });
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newTest.name.trim()) return;
    setAdding(true);
    try {
      await activityTestsService.createIOTest(courseId, activityId, newTest);
      const updated = await activitiesService.get(courseId, activityId);
      setIoTests(updated.activity_io_tests || []);
      setNewTest({ name: "", test_in: "", test_out: "" });
    } catch { onError("Error al agregar test"); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await activityTestsService.deleteIOTest(courseId, activityId, id);
      setIoTests((prev) => prev.filter((t) => t.id !== id));
    } catch { onError("Error al eliminar test"); }
  };

  const cellSx = {
    fontSize: "13px", color: t.text, borderBottom: `1px solid ${t.border}`, py: "10px", px: "12px",
  };
  const headSx = {
    ...cellSx, fontWeight: 700, fontSize: "11px", color: t.textMuted,
    textTransform: "uppercase" as const, letterSpacing: "0.6px", background: t.surface2,
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Add row */}
      <Box sx={{ display: "grid", gridTemplateColumns: "22% 37% 37% 4%", gap: "8px", alignItems: "end" }}>
        {[
          { label: "Nombre", key: "name", ph: "ej. test1", mono: false },
          { label: "Entrada", key: "test_in", ph: "stdin…", mono: true },
          { label: "Salida esperada", key: "test_out", ph: "stdout…", mono: true },
        ].map(({ label, key, ph, mono }) => (
          <Box key={key} sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Box sx={{ fontSize: "11px", fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</Box>
            <Box
              component={key === "name" ? "input" : "textarea"}
              value={newTest[key as keyof typeof newTest]}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setNewTest((p) => ({ ...p, [key]: e.target.value }))
              }
              placeholder={ph}
              rows={key === "name" ? undefined : 2}
              sx={{
                width: "100%", padding: "7px 10px", fontSize: "13px",
                fontFamily: mono ? "var(--font-jetbrains-mono, monospace)" : "inherit",
                color: t.text, background: t.surface2, border: `1px solid ${t.border}`,
                borderRadius: "7px", outline: "none", resize: "vertical", boxSizing: "border-box",
                "&:focus": { borderColor: t.blue },
              }}
            />
          </Box>
        ))}
        <Box
          component="button"
          onClick={handleAdd}
          disabled={adding || !newTest.name.trim()}
          sx={{
            display: "flex", alignItems: "center", justifyContent: "center",
            background: t.blue, color: "#fff", border: "none", borderRadius: "7px",
            height: "32px", width: "32px", cursor: adding ? "default" : "pointer",
            opacity: (adding || !newTest.name.trim()) ? 0.5 : 1, alignSelf: "flex-end",
          }}
        >
          <AddIcon sx={{ fontSize: 16 }} />
        </Box>
      </Box>

      {/* Table */}
      {ioTests.length > 0 ? (
        <Box sx={{ border: `1px solid ${t.border}`, borderRadius: "8px", overflow: "hidden" }}>
          <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
            <Box component="thead">
              <Box component="tr">
                {["Nombre", "Entrada", "Salida esperada", ""].map((h, i) => (
                  <Box key={i} component="th" sx={{ ...headSx, width: i === 3 ? "40px" : undefined, textAlign: "left" }}>{h}</Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {ioTests.map((test) => (
                <Box component="tr" key={test.id}>
                  <Box component="td" sx={cellSx}>{test.name}</Box>
                  <Box component="td" sx={{ ...cellSx, fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "12px", whiteSpace: "pre-wrap", maxWidth: "200px" }}>{test.test_in}</Box>
                  <Box component="td" sx={{ ...cellSx, fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "12px", whiteSpace: "pre-wrap", maxWidth: "200px" }}>{test.test_out}</Box>
                  <Box component="td" sx={cellSx}>
                    <Box
                      component="button"
                      onClick={() => handleDelete(test.id)}
                      sx={{ background: "none", border: "none", cursor: "pointer", color: t.red, display: "flex", alignItems: "center", p: "4px" }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      ) : (
        <Typography sx={{ fontSize: "13px", color: t.textMuted }}>
          No hay tests aún. Agregá el primero arriba.
        </Typography>
      )}
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = {
  courseId: number;
  activityId?: number; // undefined = create mode
};

export default function ActivityEditor({ courseId, activityId: initialActivityId }: Props) {
  const router = useRouter();
  const { isDark } = useThemeMode();
  const t = isDark ? darkTokens : lightTokens;

  // After first save in create mode, we get a real ID
  const [activityId, setActivityId] = useState<number | undefined>(initialActivityId);
  const isCreateMode = activityId === undefined;

  const [loading, setLoading] = useState(!isCreateMode);
  const [activeTab, setActiveTab] = useState<TabId>("Enunciado");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [error, setError] = useState("");

  // Editable name
  const [name, setName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [form, setForm] = useState({
    description: "", language: "c_std11", points: 10, active: true,
    category_id: 0, compilation_flags: "",
  });
  const [showPreview, setShowPreview] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // Category dialog
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  // Files & permissions
  const [files, setFiles] = useState<Record<string, string>>({ [`main${getFileExtension("c_std11")}`]: "" });
  const [startingFilesRaw, setStartingFilesRaw] = useState<Record<string, string>>({});
  const [permissions, setPermissions] = useState<Record<string, FileDisplayMode>>({});
  const [showPermsPanel, setShowPermsPanel] = useState(false);

  // Tests
  const [testMode, setTestMode] = useState<"io" | "unit">("io");
  const [ioTests, setIoTests] = useState<IOTest[]>([]);
  const [unitTestCode, setUnitTestCode] = useState("");
  const [unitTestExists, setUnitTestExists] = useState(false);
  const [activity, setActivity] = useState<Activity | null>(null);

  // Load categories always (needed for create too)
  useEffect(() => {
    activitiesService.getCategories(courseId).then(setCategories).catch(() => {});
  }, [courseId]);

  const loadActivity = useCallback(async (id: number) => {
    try {
      const act = await activitiesService.get(courseId, id);
      setActivity(act);
      setName(act.name);
      setForm({
        description: act.description || "",
        language: toVersionedLanguage(act.language),
        points: act.points,
        active: act.active,
        category_id: act.category_id,
        compilation_flags: act.compilation_flags || "",
      });
      setTestMode(act.is_io_tested ? "io" : "unit");
      setIoTests(act.activity_io_tests || []);
      setUnitTestCode(act.activity_unit_tests_content || getTestCodeForLanguage(act.language));
      setUnitTestExists(!!act.activity_unit_tests_content);

      const allFiles = await activitiesService.getStartingFiles(courseId, act.starting_rplfile_id);
      const { files_metadata: rawMeta, ...codeFiles } = allFiles;
      setStartingFilesRaw(codeFiles);
      setFiles(codeFiles);

      const parsed: Record<string, { display: string }> = rawMeta ? JSON.parse(rawMeta) : {};
      const perms: Record<string, FileDisplayMode> = {};
      for (const fname of Object.keys(codeFiles)) {
        perms[fname] = (parsed[fname]?.display as FileDisplayMode) ?? FILE_DISPLAY_MODE.READ_WRITE;
      }
      setPermissions(perms);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (initialActivityId !== undefined) loadActivity(initialActivityId);
  }, [initialActivityId, loadActivity]);

  useEffect(() => {
    if (editingName && nameInputRef.current) nameInputRef.current.focus();
  }, [editingName]);

  // Language change: rename files to match new extension
  const handleLanguageChange = (lang: string) => {
    const oldExt = getFileExtension(form.language);
    const newExt = getFileExtension(lang);
    setForm((p) => ({ ...p, language: lang }));
    setFiles((prev) => {
      const renamed: Record<string, string> = {};
      for (const [fname, content] of Object.entries(prev)) {
        renamed[fname.endsWith(oldExt) ? fname.slice(0, -oldExt.length) + newExt : fname] = content;
      }
      return renamed;
    });
  };

  const handleSave = async () => {
    if (saveState === "saving") return;
    if (!name.trim()) { setError("El nombre de la actividad es requerido"); return; }
    if (!form.category_id) { setError("Seleccioná una categoría"); return; }
    setSaveState("saving");

    try {
      const metadata: Record<string, { display: string }> = {};
      for (const [fname, display] of Object.entries(permissions)) {
        metadata[fname] = { display };
      }
      const filesToSave = { ...files };
      if (Object.keys(metadata).length > 0) {
        (filesToSave as Record<string, string>).files_metadata = JSON.stringify(metadata);
      }

      if (isCreateMode) {
        // Create new activity, then transition to edit mode
        const created = await activitiesService.create(
          courseId,
          {
            name: name.trim(),
            description: form.description.trim() || undefined,
            language: form.language,
            points: form.points,
            category_id: form.category_id,
          },
          filesToSave,
        );
        setActivityId(created.id);
        setActivity(created);
        // Update URL without full reload so tabs unlock
        router.replace(`/courses/${courseId}/activities/${created.id}/edit`);
      } else {
        // Save all changes
        await Promise.all([
          activitiesService.edit(courseId, activityId, {
            name: name.trim(),
            description: form.description || undefined,
            language: form.language,
            points: form.points,
            active: form.active,
            category_id: form.category_id,
            compilation_flags: form.compilation_flags || undefined,
            is_io_tested: testMode === "io",
          }, filesToSave),
          unitTestExists
            ? activityTestsService.updateUnitTests(courseId, activityId, unitTestCode)
            : Promise.resolve(),
        ]);
      }

      setSaveState("saved");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveState("idle"), 2000);
    } catch (err: unknown) {
      const e = err as { err?: { detail?: string } };
      setError(e?.err?.detail || "Error al guardar");
      setSaveState("idle");
    }
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
      setForm((p) => ({ ...p, category_id: created.id }));
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

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box sx={{ position: "fixed", top: "54px", left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", background: t.bg }}>
        <CircularProgress sx={{ color: t.blue }} />
      </Box>
    );
  }

  const PERM_LABELS: Record<FileDisplayMode, string> = {
    [FILE_DISPLAY_MODE.READ_WRITE]: "Editable",
    [FILE_DISPLAY_MODE.READ]: "Solo lectura",
    [FILE_DISPLAY_MODE.HIDDEN]: "Oculto",
    [FILE_DISPLAY_MODE.WRITE_CANT_DELETE]: "Editable fijo",
  };
  const PERM_OPTIONS = [
    FILE_DISPLAY_MODE.READ_WRITE,
    FILE_DISPLAY_MODE.READ,
    FILE_DISPLAY_MODE.WRITE_CANT_DELETE,
    FILE_DISPLAY_MODE.HIDDEN,
  ] as FileDisplayMode[];

  const inputSx = {
    fontSize: "13px", color: t.text, background: t.surface2,
    border: `1px solid ${t.border}`, borderRadius: "7px",
    padding: "5px 10px", outline: "none", fontFamily: "inherit",
    "&:focus": { borderColor: t.blue }, boxSizing: "border-box" as const,
  };
  const labelSx = {
    fontSize: "10px", fontWeight: 700, color: t.textMuted,
    textTransform: "uppercase" as const, letterSpacing: "0.5px", mb: "4px",
  };

  return (
    <Box sx={{
      position: "fixed", top: "54px", left: 0, right: 0, bottom: 0,
      zIndex: 150, background: t.bg,
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Editor TopBar */}
      <Box sx={{
        height: "50px", display: "flex", alignItems: "center",
        borderBottom: `1px solid ${t.border}`, background: t.surface,
        px: "16px", gap: "12px", flexShrink: 0,
      }}>
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

        <Box sx={{ width: "1px", height: "18px", background: t.border }} />

        {/* Editable name */}
        {editingName ? (
          <Box
            component="input"
            ref={nameInputRef}
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") setEditingName(false); }}
            placeholder="Nombre de la actividad"
            sx={{
              fontSize: "14px", fontWeight: 700, color: t.text, fontFamily: "inherit",
              background: t.surface2, border: `1.5px solid ${t.blue}`,
              borderRadius: "6px", padding: "3px 8px", outline: "none", minWidth: "200px",
            }}
          />
        ) : (
          <Box
            onClick={() => setEditingName(true)}
            sx={{
              fontSize: "14px", fontWeight: 700,
              color: name ? t.text : t.textSoft,
              cursor: "text", borderRadius: "6px", padding: "3px 8px",
              border: "1.5px solid transparent",
              "&:hover": { border: `1.5px solid ${t.border}`, background: t.surface2 },
            }}
          >
            {name || "Nueva actividad"}
          </Box>
        )}

        <LangBadge lang={form.language} />

        {isCreateMode && (
          <Box sx={{ fontSize: "11px", fontWeight: 600, color: t.amber, background: t.amberBg, borderRadius: "5px", padding: "2px 8px" }}>
            Borrador
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Box
          component="button"
          onClick={handleSave}
          disabled={saveState === "saving"}
          sx={{
            display: "flex", alignItems: "center", gap: "6px",
            background: saveState === "saved" ? t.greenBg : t.blue,
            color: saveState === "saved" ? t.green : "#fff",
            border: "none", borderRadius: "8px",
            padding: "7px 16px", fontSize: "13px", fontWeight: 700, fontFamily: "inherit",
            cursor: saveState === "saving" ? "default" : "pointer",
            opacity: saveState === "saving" ? 0.7 : 1,
            transition: "background 0.15s, color 0.15s",
          }}
        >
          {saveState === "saved"
            ? <><CheckIcon sx={{ fontSize: 14 }} /> Guardado</>
            : saveState === "saving" ? "Guardando…"
            : isCreateMode ? "Crear actividad" : "Guardar cambios"}
        </Box>
      </Box>

      {/* Tab bar */}
      <TabBar
        active={activeTab}
        onChange={setActiveTab}
        disabledTabs={isCreateMode ? ["Tests y corrección"] : undefined}
        t={t}
      />

      {/* Tab content */}
      <Box sx={{ flexGrow: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* ── Enunciado ── */}
        {activeTab === "Enunciado" && (
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
            {/* Metadata row */}
            <Box sx={{
              display: "flex", alignItems: "flex-end", gap: "10px", flexWrap: "wrap",
              px: "20px", py: "12px", borderBottom: `1px solid ${t.border}`, flexShrink: 0,
            }}>
              {/* Category */}
              <Box>
                <Box sx={labelSx}>Categoría</Box>
                <Box
                  component="select"
                  value={form.category_id}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    if (e.target.value === "__create__") setNewCategoryDialog(true);
                    else setForm((p) => ({ ...p, category_id: Number(e.target.value) }));
                  }}
                  sx={{ ...inputSx, cursor: "pointer", padding: "5px 28px 5px 10px" }}
                >
                  <option value={0}>Sin categoría</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  <option value="__create__">+ Nueva categoría…</option>
                </Box>
              </Box>

              {/* Language */}
              <Box>
                <Box sx={labelSx}>Lenguaje</Box>
                <Box
                  component="select"
                  value={form.language}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleLanguageChange(e.target.value)}
                  sx={{ ...inputSx, cursor: "pointer", padding: "5px 28px 5px 10px" }}
                >
                  {languageOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Box>
              </Box>

              {/* Points */}
              <Box>
                <Box sx={labelSx}>Puntos</Box>
                <Box
                  component="input"
                  type="number"
                  value={form.points}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, points: Number(e.target.value) }))}
                  min={0}
                  sx={{ ...inputSx, width: "80px" }}
                />
              </Box>

              {/* Compilation flags (edit mode only) */}
              {!isCreateMode && (
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={labelSx}>Flags de compilación</Box>
                  <Box
                    component="input"
                    value={form.compilation_flags}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, compilation_flags: e.target.value }))}
                    placeholder="-g -O2 -Wall"
                    sx={{ ...inputSx, width: "100%", fontFamily: "var(--font-jetbrains-mono, monospace)" }}
                  />
                </Box>
              )}

              {/* Active toggle (edit mode only) */}
              {!isCreateMode && (
                <Box>
                  <Box sx={labelSx}>Estado</Box>
                  <Box
                    component="button"
                    onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
                    sx={{
                      background: form.active ? t.greenBg : t.surface2,
                      color: form.active ? t.green : t.textMuted,
                      border: "none", borderRadius: "7px",
                      padding: "5px 12px", fontSize: "12px", fontWeight: 700, fontFamily: "inherit",
                      cursor: "pointer", transition: "background 0.12s, color 0.12s",
                    }}
                  >
                    {form.active ? "Activo" : "Inactivo"}
                  </Box>
                </Box>
              )}

              <Box sx={{ ml: "auto" }}>
                <Box
                  component="button"
                  onClick={() => setShowPreview((p) => !p)}
                  sx={{
                    background: "none", border: `1px solid ${t.border}`, borderRadius: "7px",
                    padding: "5px 12px", fontSize: "12px", fontWeight: 600, fontFamily: "inherit",
                    color: t.textMuted, cursor: "pointer",
                    "&:hover": { background: t.surface2 },
                  }}
                >
                  {showPreview ? "Ocultar preview" : "Mostrar preview"}
                </Box>
              </Box>
            </Box>

            {/* Markdown editor + preview */}
            <Box sx={{ flexGrow: 1, display: "grid", gridTemplateColumns: showPreview ? "1fr 1fr" : "1fr", overflow: "hidden" }}>
              <Box
                component="textarea"
                value={form.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Enunciado del problema en Markdown…"
                sx={{
                  width: "100%", height: "100%", padding: "20px",
                  fontSize: "14px", fontFamily: "var(--font-jetbrains-mono, monospace)",
                  color: t.text, background: t.surface,
                  border: "none", borderRight: showPreview ? `1px solid ${t.border}` : "none",
                  outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.6,
                  "&::placeholder": { color: t.textSoft },
                }}
              />
              {showPreview && (
                <Box sx={{ overflow: "auto", padding: "20px", background: t.surface }}>
                  {form.description ? (
                    <Box sx={{
                      fontSize: "14px", lineHeight: 1.7, color: t.text,
                      "& h1,& h2,& h3": { color: t.text, fontWeight: 700, mt: "1.2em", mb: "0.4em" },
                      "& code": { fontFamily: "var(--font-jetbrains-mono, monospace)", background: t.surface2, borderRadius: "4px", padding: "1px 5px", fontSize: "13px" },
                      "& pre": { background: t.surface2, borderRadius: "8px", padding: "12px 16px", overflow: "auto" },
                      "& pre code": { background: "none", padding: 0 },
                      "& blockquote": { borderLeft: `3px solid ${t.border}`, pl: "12px", color: t.textMuted },
                      "& table": { borderCollapse: "collapse", width: "100%" },
                      "& th, & td": { border: `1px solid ${t.border}`, padding: "6px 10px" },
                    }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.description}</ReactMarkdown>
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: "13px", color: t.textSoft }}>Vista previa…</Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* ── Código inicial ── */}
        {activeTab === "Código inicial" && (
          <Box sx={{ display: "flex", height: "100%", overflow: "hidden", position: "relative" }}>
            <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
              <MultipleTabsEditor files={files} language={form.language} onChange={setFiles} />
            </Box>

            {!isCreateMode && (
              <>
                <Box
                  component="button"
                  onClick={() => setShowPermsPanel((p) => !p)}
                  sx={{
                    position: "absolute", right: showPermsPanel ? "220px" : "0px",
                    top: "50%", transform: "translateY(-50%)",
                    background: t.surface, border: `1px solid ${t.border}`,
                    borderRight: "none", borderRadius: "8px 0 0 8px",
                    padding: "8px 4px", cursor: "pointer", color: t.textMuted,
                    fontSize: "11px", fontWeight: 600, fontFamily: "inherit",
                    writingMode: "vertical-rl",
                    transition: "right 0.22s cubic-bezier(0.4,0,0.2,1)",
                    zIndex: 10,
                  }}
                >
                  Permisos
                </Box>

                <Box sx={{
                  width: showPermsPanel ? "220px" : "0px",
                  overflow: "hidden",
                  borderLeft: showPermsPanel ? `1px solid ${t.border}` : "none",
                  background: t.surface,
                  transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
                  display: "flex", flexDirection: "column", flexShrink: 0,
                }}>
                  <Box sx={{ width: "220px" }}>
                    <Box sx={{ padding: "14px 16px", borderBottom: `1px solid ${t.border}` }}>
                      <Typography sx={{ fontSize: "12px", fontWeight: 700, color: t.text }}>Permisos de archivos</Typography>
                      <Typography sx={{ fontSize: "11px", color: t.textMuted, mt: "2px" }}>Qué puede ver/editar el alumno</Typography>
                    </Box>
                    {Object.keys(startingFilesRaw).map((fname) => (
                      <Box key={fname} sx={{ padding: "12px 16px", borderBottom: `1px solid ${t.border}` }}>
                        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: t.text, fontFamily: "var(--font-jetbrains-mono, monospace)", mb: "8px" }}>
                          {fname}
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          {PERM_OPTIONS.map((mode) => {
                            const active = (permissions[fname] ?? FILE_DISPLAY_MODE.READ_WRITE) === mode;
                            return (
                              <Box
                                key={mode}
                                component="label"
                                sx={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
                              >
                                <Box
                                  component="input"
                                  type="radio"
                                  name={`perm-${fname}`}
                                  checked={active}
                                  onChange={() => setPermissions((p) => ({ ...p, [fname]: mode }))}
                                  sx={{ accentColor: t.blue }}
                                />
                                <Typography sx={{ fontSize: "12px", color: active ? t.text : t.textMuted, fontWeight: active ? 600 : 400 }}>
                                  {PERM_LABELS[mode]}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </>
            )}
          </Box>
        )}

        {/* ── Tests y corrección ── */}
        {activeTab === "Tests y corrección" && !isCreateMode && activity && (
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "16px", px: "20px", py: "14px", borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
              <PillToggle
                options={[{ label: "Entrada/Salida", value: "io" }, { label: "Unit Tests", value: "unit" }]}
                value={testMode}
                onChange={setTestMode}
                t={t}
              />
              <Typography sx={{ fontSize: "12px", color: t.textMuted }}>
                {testMode === "io"
                  ? "Casos de prueba con stdin/stdout"
                  : "Suite de pruebas ejecutada junto al código del alumno"}
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: "auto", padding: "20px" }}>
              {testMode === "io" ? (
                <IOTestsPanel
                  courseId={courseId}
                  activityId={activityId}
                  ioTests={ioTests}
                  setIoTests={setIoTests}
                  t={t}
                  onError={setError}
                />
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Box
                      component="button"
                      onClick={() => setUnitTestCode(getTestCodeForLanguage(activity.language))}
                      sx={{
                        background: "none", border: `1px solid ${t.border}`, borderRadius: "7px",
                        padding: "5px 12px", fontSize: "12px", fontWeight: 600, fontFamily: "inherit",
                        color: t.textMuted, cursor: "pointer",
                        "&:hover": { background: t.surface2 },
                      }}
                    >
                      Usar plantilla
                    </Box>
                  </Box>
                  <Box sx={{ borderRadius: "8px", overflow: "hidden", border: `1px solid ${t.border}` }}>
                    <MonacoEditor
                      value={unitTestCode}
                      language={getMonacoLanguage(activity.language)}
                      onChange={(v) => setUnitTestCode(v || "")}
                      height="420px"
                    />
                  </Box>
                  <Box>
                    <Box
                      component="button"
                      onClick={async () => {
                        try {
                          if (unitTestExists) {
                            await activityTestsService.updateUnitTests(courseId, activityId, unitTestCode);
                          } else {
                            await activityTestsService.createUnitTests(courseId, activityId, unitTestCode);
                            setUnitTestExists(true);
                          }
                        } catch { setError("Error al guardar unit tests"); }
                      }}
                      sx={{
                        background: t.blue, color: "#fff", border: "none", borderRadius: "7px",
                        padding: "7px 16px", fontSize: "13px", fontWeight: 700, fontFamily: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      Guardar unit tests
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* New category dialog */}
      <Dialog open={newCategoryDialog} onClose={() => setNewCategoryDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "16px", fontWeight: 700 }}>Nueva categoría</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", pt: "4px" }}>
            {[
              { label: "Nombre", val: newCatName, set: setNewCatName, auto: true },
              { label: "Descripción (opcional)", val: newCatDesc, set: setNewCatDesc, auto: false },
            ].map(({ label, val, set, auto }) => (
              <Box key={label}>
                <Box sx={{ fontSize: "11px", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px", mb: "4px" }}>{label}</Box>
                <Box
                  component="input"
                  autoFocus={auto}
                  value={val}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set(e.target.value)}
                  onKeyDown={auto ? (e: React.KeyboardEvent) => { if (e.key === "Enter") handleCreateCategory(); } : undefined}
                  sx={{ width: "100%", padding: "8px 10px", fontSize: "14px", borderRadius: "7px", border: "1px solid", borderColor: "divider", outline: "none", boxSizing: "border-box" }}
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: "20px", pb: "16px", gap: "8px" }}>
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

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
    </Box>
  );
}
