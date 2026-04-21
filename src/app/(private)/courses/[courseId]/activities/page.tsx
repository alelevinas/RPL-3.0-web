"use client";

import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useParams, useRouter } from "next/navigation";
import { useAppState } from "@/lib/state";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";
import * as activitiesService from "@/services/activitiesService";
import type { Activity, Category } from "@/types";
import { hasPermission } from "@/utils/permissions";

// ─── Language badge ────────────────────────────────────────────────────────────

const LANG_META: Record<string, { label: string; color: string }> = {
  python:     { label: "Python",  color: "#3572A5" },
  python3:    { label: "Python",  color: "#3572A5" },
  java:       { label: "Java",    color: "#B07219" },
  c:          { label: "C",       color: "#555"    },
  cpp:        { label: "C++",     color: "#F34B7D" },
  "c++":      { label: "C++",     color: "#F34B7D" },
  javascript: { label: "JS",      color: "#c4a000" },
  js:         { label: "JS",      color: "#c4a000" },
  haskell:    { label: "Haskell", color: "#5E5186" },
  go:         { label: "Go",      color: "#00ACD7" },
  rust:       { label: "Rust",    color: "#CE4A00" },
};

function getLangMeta(lang: string) {
  const key = lang.split("_")[0].toLowerCase();
  return LANG_META[key] ?? { label: lang, color: "#666" };
}

function LanguageBadge({ lang }: { lang: string }) {
  const { label, color } = getLangMeta(lang);
  return (
    <Box
      sx={{
        display: "inline-block",
        background: color + "22",
        color,
        borderRadius: "4px",
        padding: "2px 7px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.2px",
        lineHeight: 1.6,
      }}
    >
      {label}
    </Box>
  );
}

// ─── Difficulty dots ───────────────────────────────────────────────────────────

function difficultyConfig(points: number): { filled: number; color: string } {
  if (points <= 5)  return { filled: 1, color: "#16A34A" };
  if (points <= 15) return { filled: 2, color: "#16A34A" };
  if (points <= 25) return { filled: 3, color: "#C47F00" };
  return             { filled: 4, color: "#DC2626" };
}

function DifficultyDots({ points, t }: { points: number; t: typeof lightTokens }) {
  const { filled, color } = difficultyConfig(points);
  return (
    <Box sx={{ display: "flex", gap: "3px", alignItems: "center" }}>
      {[0, 1, 2, 3].map((i) => (
        <Box
          key={i}
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: i < filled ? color : t.border,
          }}
        />
      ))}
    </Box>
  );
}

// ─── Status row ───────────────────────────────────────────────────────────────

function StatusLabel({ status, t }: { status: string | null; t: typeof lightTokens }) {
  let dotColor = t.textSoft;
  let label = "Sin comenzar";
  let textColor = t.textSoft;

  if (status === "SUCCESS") {
    dotColor = t.green; label = "Resuelto"; textColor = t.green;
  } else if (status === "FAILURE" || status === "ERROR") {
    dotColor = t.amber; label = "Intentado"; textColor = t.amber;
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <Box sx={{ width: 7, height: 7, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
      <Typography sx={{ fontSize: "12px", fontWeight: 500, color: textColor }}>{label}</Typography>
    </Box>
  );
}

// ─── Activity card ─────────────────────────────────────────────────────────────

type ActivityCardProps = {
  activity: Activity;
  canManage: boolean;
  onOpen: () => void;
  onEdit: (e: React.MouseEvent) => void;
  t: typeof lightTokens;
};

function ActivityCard({ activity, canManage, onOpen, onEdit, t }: ActivityCardProps) {
  const solved = activity.submission_status === "SUCCESS";
  return (
    <Box
      onClick={onOpen}
      sx={{
        borderRadius: "10px",
        padding: "16px",
        border: `1px solid ${solved ? t.green + "44" : t.border}`,
        background: t.surface,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        transition: "border-color 0.13s, box-shadow 0.13s, transform 0.13s",
        "&:hover": {
          borderColor: t.blue,
          boxShadow: `0 0 0 3px ${t.blueBg}, 0 4px 12px rgba(0,0,0,0.06)`,
          transform: "translateY(-1px)",
        },
      }}
    >
      {/* Top row: language badge + dots + points */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <LanguageBadge lang={activity.language} />
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <DifficultyDots points={activity.points} t={t} />
          <Typography sx={{ fontSize: "12px", fontWeight: 700, color: t.gold }}>
            {activity.points}p
          </Typography>
        </Box>
      </Box>

      {/* Name */}
      <Typography sx={{ fontSize: "14px", fontWeight: 700, color: t.text, lineHeight: 1.3 }}>
        {activity.name}
      </Typography>

      {/* Description */}
      <Typography
        sx={{
          fontSize: "12px",
          color: t.textMuted,
          lineHeight: 1.55,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          flexGrow: 1,
        }}
      >
        {activity.description}
      </Typography>

      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${t.border}`,
          pt: "10px",
          mt: "auto",
        }}
      >
        <StatusLabel status={activity.submission_status ?? null} t={t} />
        {canManage && (
          <Box
            component="button"
            onClick={onEdit}
            sx={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: t.blue,
              fontSize: "12px",
              fontWeight: 600,
              fontFamily: "inherit",
              padding: "2px 6px",
              borderRadius: "5px",
              "&:hover": { background: t.blueBg },
            }}
          >
            <EditIcon sx={{ fontSize: 13 }} />
            Editar
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── Ghost "new activity" card (teacher) ───────────────────────────────────────

function NewActivityCard({ onClick, t }: { onClick: () => void; t: typeof lightTokens }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: "10px",
        padding: "16px",
        border: `2px dashed ${t.border}`,
        minHeight: "120px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: t.textSoft,
        fontSize: "13px",
        fontWeight: 600,
        gap: "6px",
        transition: "border-color 0.13s, color 0.13s",
        "&:hover": { borderColor: t.blue, color: t.blue },
      }}
    >
      <AddIcon sx={{ fontSize: 18 }} />
      Nueva actividad
    </Box>
  );
}

// ─── Filter tabs (student) ─────────────────────────────────────────────────────

type FilterTab = "all" | "pending" | "resolved";

function FilterTabs({ active, onChange, t }: { active: FilterTab; onChange: (f: FilterTab) => void; t: typeof lightTokens }) {
  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "pending", label: "Pendientes" },
    { key: "resolved", label: "Resueltas" },
  ];
  return (
    <Box
      sx={{
        display: "inline-flex",
        background: t.surface2,
        borderRadius: "8px",
        padding: "3px",
        gap: "2px",
      }}
    >
      {tabs.map(({ key, label }) => (
        <Box
          key={key}
          component="button"
          onClick={() => onChange(key)}
          sx={{
            background: active === key ? t.surface : "transparent",
            color: active === key ? t.text : t.textMuted,
            border: "none",
            borderRadius: "6px",
            padding: "5px 14px",
            fontSize: "13px",
            fontWeight: active === key ? 600 : 400,
            fontFamily: "inherit",
            cursor: "pointer",
            boxShadow: active === key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            transition: "background 0.12s, color 0.12s",
          }}
        >
          {label}
        </Box>
      ))}
    </Box>
  );
}

// ─── Progress summary card (student) ──────────────────────────────────────────

function ProgressSummary({ resolved, points, t }: { resolved: number; points: number; t: typeof lightTokens }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: "10px",
        padding: "12px 20px",
        flexShrink: 0,
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontSize: "22px", fontWeight: 800, color: t.green, lineHeight: 1 }}>{resolved}</Typography>
        <Typography sx={{ fontSize: "11px", color: t.textMuted, mt: "2px" }}>resueltas</Typography>
      </Box>
      <Box sx={{ width: "1px", height: "36px", background: t.border }} />
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontSize: "22px", fontWeight: 800, color: t.blue, lineHeight: 1 }}>{points}</Typography>
        <Typography sx={{ fontSize: "11px", color: t.textMuted, mt: "2px" }}>puntos</Typography>
      </Box>
    </Box>
  );
}

// ─── Category section ──────────────────────────────────────────────────────────

type CategorySectionProps = {
  cat: Category & { activities: Activity[] };
  canManage: boolean;
  courseId: number;
  filter: FilterTab;
  router: ReturnType<typeof useRouter>;
  t: typeof lightTokens;
};

function CategorySection({ cat, canManage, courseId, filter, router, t }: CategorySectionProps) {
  const [expanded, setExpanded] = useState(true);
  const progressRef = useRef<HTMLDivElement>(null);

  const total = cat.activities.length;
  const solved = cat.activities.filter((a) => a.submission_status === "SUCCESS").length;
  const pct = total > 0 ? (solved / total) * 100 : 0;
  const complete = pct === 100 && total > 0;

  const filtered = cat.activities.filter((a) => {
    if (filter === "resolved") return a.submission_status === "SUCCESS";
    if (filter === "pending")  return a.submission_status !== "SUCCESS";
    return true;
  });

  useEffect(() => {
    // Trigger progress bar animation after mount
    if (progressRef.current) {
      progressRef.current.style.width = `${pct}%`;
    }
  }, [pct]);

  return (
    <Box sx={{ mb: "32px" }}>
      {/* Collapsible header */}
      <Box
        component="button"
        onClick={() => setExpanded((v) => !v)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px 0 8px",
          textAlign: "left",
          fontFamily: "inherit",
        }}
      >
        <Typography sx={{ fontSize: "18px", fontWeight: 800, color: t.text }}>{cat.name}</Typography>
        {cat.description && (
          <Typography sx={{ fontSize: "12px", color: t.textSoft, fontWeight: 400 }}>
            {cat.description}
          </Typography>
        )}
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: "12px", color: t.textMuted, fontWeight: 500, mr: "4px" }}>
          {solved}/{total}
        </Typography>
        <KeyboardArrowDownIcon
          sx={{
            fontSize: 18,
            color: t.textMuted,
            transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.18s",
          }}
        />
      </Box>

      {/* Progress bar */}
      <Box sx={{ height: "3px", borderRadius: "2px", background: t.border, mb: "14px", overflow: "hidden" }}>
        <Box
          ref={progressRef}
          sx={{
            height: "100%",
            borderRadius: "2px",
            background: complete ? t.green : t.blue,
            width: "0%",
            transition: "width 0.6s cubic-bezier(0.4,0,0.2,1), background 0.3s",
          }}
        />
      </Box>

      {/* Cards grid */}
      {expanded && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))",
            gap: "12px",
          }}
        >
          {filtered.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              canManage={canManage}
              onOpen={() => router.push(`/courses/${courseId}/activities/${activity.id}`)}
              onEdit={(e) => { e.stopPropagation(); router.push(`/courses/${courseId}/activities/${activity.id}/edit`); }}
              t={t}
            />
          ))}
          {canManage && (
            <NewActivityCard
              onClick={() => router.push(`/courses/${courseId}/activity/create`)}
              t={t}
            />
          )}
          {filtered.length === 0 && !canManage && (
            <Typography sx={{ fontSize: "13px", color: t.textSoft, gridColumn: "1/-1", py: 2 }}>
              No hay actividades en esta categoría.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ActivitiesPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const router = useRouter();
  const state = useAppState();
  const { isDark } = useThemeMode();
  const t = isDark ? darkTokens : lightTokens;
  const permissions = (state.permissions as string[]) || [];
  const canManage = hasPermission(permissions, "activity_manage");
  const course = state.course as { name?: string; semester?: string } | null;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");

  useEffect(() => {
    Promise.all([
      activitiesService.getAll(courseId),
      activitiesService.getCategories(courseId),
    ]).then(([acts, cats]) => {
      setActivities(acts);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
        <CircularProgress sx={{ color: t.blue }} />
      </Box>
    );
  }

  const grouped = categories.map((cat) => ({
    ...cat,
    activities: activities.filter((a) => a.category_id === cat.id),
  }));

  const resolvedCount = activities.filter((a) => a.submission_status === "SUCCESS").length;
  const resolvedPoints = activities
    .filter((a) => a.submission_status === "SUCCESS")
    .reduce((sum, a) => sum + a.points, 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "24px" }}>
        <Box>
          <Typography
            sx={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.8px", color: t.text, lineHeight: 1.1 }}
          >
            Actividades
          </Typography>
          {course?.name && (
            <Typography sx={{ fontSize: "14px", color: t.textMuted, mt: "4px" }}>
              {course.name}{course.semester ? ` · ${course.semester}` : ""}
            </Typography>
          )}
        </Box>

        {canManage ? (
          <Box
            component="button"
            onClick={() => router.push(`/courses/${courseId}/activity/create`)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: t.blue,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "9px 16px",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <AddIcon sx={{ fontSize: 16 }} />
            Nueva actividad
          </Box>
        ) : (
          <ProgressSummary resolved={resolvedCount} points={resolvedPoints} t={t} />
        )}
      </Box>

      {/* Filter tabs (student only) */}
      {!canManage && (
        <Box sx={{ mb: "24px" }}>
          <FilterTabs active={filter} onChange={setFilter} t={t} />
        </Box>
      )}

      {/* Category sections */}
      {grouped.map((cat) => (
        <CategorySection
          key={cat.id}
          cat={cat}
          canManage={canManage}
          courseId={courseId}
          filter={filter}
          router={router}
          t={t}
        />
      ))}

      {grouped.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography sx={{ fontSize: "15px", color: t.textMuted }}>
            No hay actividades en este curso todavía.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
