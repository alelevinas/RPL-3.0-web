"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box, Typography, CircularProgress, Autocomplete, TextField } from "@mui/material";
import { useParams } from "next/navigation";
import { useAppState } from "@/lib/state";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";
import { hasPermission } from "@/utils/permissions";
import * as statsService from "@/services/statsService";
import * as coursesService from "@/services/coursesService";
import * as activitiesService from "@/services/activitiesService";

// ─── Types ────────────────────────────────────────────────────────────────────

type SubmissionStats = {
  total_submissions: number;
  successful_submissions: number;
  submissions_with_build_errors: number;
  submissions_with_failures: number;
  submissions_with_runtime_errors: number;
  avg_error_submissions_by_student?: number;
  total_submitters_with_at_least_one_successful_submission?: number;
  total_submitters_without_successful_submissions?: number;
};
type ActivityMeta = { id: number; name: string; points: number; category_name: string };
type UserMeta = { id: number; name: string; surname: string; username: string; student_id?: string };
type DateMeta = { date: string };
type StatsResponse<M> = { submissions_stats: SubmissionStats[]; metadata: M[] };
type ScoreboardRow = { id: number; name: string; surname: string; img_uri?: string; username?: string; total_score: number; successful_activities_count: number };

function zip<S, M>(stats: S[], meta: M[]): (S & M)[] {
  return stats.map((s, i) => ({ ...s, ...meta[i] }));
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ["#005BAA", "#16A34A", "#D97706", "#DC2626", "#7C3AED"];
function avatarColor(name: string) { return AVATAR_COLORS[(name.charCodeAt(0) || 0) % 5]; }
function initials(name: string, surname: string) { return `${name[0] ?? ""}${surname[0] ?? ""}`.toUpperCase(); }

function RplAvatar({ name, surname, imgUri, size = 32 }: { name: string; surname: string; imgUri?: string; size?: number }) {
  if (imgUri) {
    return <Box component="img" src={imgUri} alt={name} sx={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  }
  return (
    <Box sx={{ width: size, height: size, borderRadius: "50%", background: avatarColor(name), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Typography sx={{ color: "#fff", fontSize: size * 0.35, fontWeight: 700, lineHeight: 1 }}>
        {initials(name, surname)}
      </Typography>
    </Box>
  );
}

// ─── Scoreboard ───────────────────────────────────────────────────────────────

const MEDALS = ["🥇", "🥈", "🥉"];

function ScoreboardList({ courseId, currentUserId, t }: { courseId: number; currentUserId?: number; t: typeof lightTokens }) {
  const [rows, setRows] = useState<ScoreboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesService.getScoreboard(courseId)
      .then((r) => setRows(r as ScoreboardRow[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress sx={{ color: t.blue }} /></Box>;

  return (
    <Box sx={{ mt: 1 }}>
      {rows.map((row, i) => {
        const isCurrent = row.id === currentUserId;
        return (
          <Box
            key={row.id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              borderRadius: "9px",
              padding: "11px 16px",
              mb: "6px",
              background: isCurrent ? t.blueBg : "transparent",
              border: `1px solid ${isCurrent ? t.blue + "55" : "transparent"}`,
            }}
          >
            {/* Rank */}
            <Box sx={{ width: 26, textAlign: "center", flexShrink: 0 }}>
              {i < 3
                ? <Typography sx={{ fontSize: "18px", lineHeight: 1 }}>{MEDALS[i]}</Typography>
                : <Typography sx={{ fontSize: "13px", fontWeight: 600, color: t.textMuted }}>{i + 1}</Typography>
              }
            </Box>

            <RplAvatar name={row.name} surname={row.surname} imgUri={row.img_uri} size={32} />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "14px", fontWeight: 600, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {row.name} {row.surname}
              </Typography>
              {row.username && (
                <Typography sx={{ fontSize: "12px", color: t.textSoft }}>@{row.username}</Typography>
              )}
            </Box>

            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
              <Typography sx={{ fontSize: "16px", fontWeight: 800, color: i === 0 ? t.gold : t.text, lineHeight: 1 }}>
                {row.total_score}
              </Typography>
              <Typography sx={{ fontSize: "11px", color: t.textMuted, mt: "2px" }}>
                {row.successful_activities_count} resueltas
              </Typography>
            </Box>
          </Box>
        );
      })}
      {rows.length === 0 && (
        <Typography sx={{ fontSize: "14px", color: t.textMuted, textAlign: "center", py: 4 }}>
          Sin datos todavía.
        </Typography>
      )}
    </Box>
  );
}

// ─── SVG Progress Ring ────────────────────────────────────────────────────────

const RING_R = 36;
const RING_SW = 8;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

function ProgressRing({ value, max, color, label, t }: { value: number; max: number; color: string; label: string; t: typeof lightTokens }) {
  const fgRef = useRef<SVGCircleElement>(null);
  const pct = max > 0 ? Math.min(value / max, 1) : 0;

  useEffect(() => {
    if (!fgRef.current) return;
    fgRef.current.style.strokeDashoffset = String(CIRCUMFERENCE);
    const id = requestAnimationFrame(() => {
      if (fgRef.current) {
        fgRef.current.style.transition = "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)";
        fgRef.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - pct));
      }
    });
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <Box
      sx={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: "12px",
        padding: "24px 16px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <Box sx={{ position: "relative", width: 96, height: 96 }}>
        <svg width={96} height={96} viewBox="0 0 100 100">
          {/* Background ring */}
          <circle cx={50} cy={50} r={RING_R} fill="none" stroke={t.border} strokeWidth={RING_SW} />
          {/* Foreground ring */}
          <circle
            ref={fgRef}
            cx={50}
            cy={50}
            r={RING_R}
            fill="none"
            stroke={color}
            strokeWidth={RING_SW}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            transform="rotate(-90 50 50)"
          />
        </svg>
        {/* Center text */}
        <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ fontSize: "20px", fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
          <Typography sx={{ fontSize: "10px", color: t.textSoft, lineHeight: 1, mt: "1px" }}>/{max}</Typography>
        </Box>
      </Box>
      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: t.textMuted }}>{label}</Typography>
    </Box>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────

function StudentDashboard({ courseId, currentUserId, t }: { courseId: number; currentUserId?: number; t: typeof lightTokens }) {
  const [actStats, setActStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsService.getMyActivitiesStats(courseId)
      .then((a) => setActStats(a as Record<string, number>))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress sx={{ color: t.blue }} /></Box>;

  const solved = actStats?.amount_of_activities_solved ?? 0;
  const started = actStats?.amount_of_activities_started ?? 0;
  const notStarted = actStats?.amount_of_activities_not_started ?? 0;
  const total = solved + started + notStarted;
  const points = actStats?.points_obtained ?? 0;
  const maxPoints = actStats?.total_possible_points ?? 0;

  return (
    <Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", mb: "32px" }}>
        <ProgressRing value={solved} max={total} color={t.green} label="Resueltas" t={t} />
        <ProgressRing value={points} max={maxPoints} color={t.blue} label="Puntos" t={t} />
        <ProgressRing value={solved + started} max={total} color={t.amber} label="Progreso" t={t} />
      </Box>

      <Typography sx={{ fontSize: "18px", fontWeight: 800, color: t.text, mb: "4px" }}>Ranking</Typography>
      <ScoreboardList courseId={courseId} currentUserId={currentUserId} t={t} />
    </Box>
  );
}

// ─── Calendar Heatmap (custom SVG) ───────────────────────────────────────────

const CELL = 12;
const GAP = 3;

function calendarGrid(values: { date: string; count: number }[]): { weeks: (null | { date: string; count: number })[][]; monthLabels: { label: string; col: number }[] } {
  const countMap = new Map(values.map((v) => [v.date, v.count]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalWeeks = 26;
  const totalDays = totalWeeks * 7;
  // Start from the Sunday on or before `totalDays` ago
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - totalDays + 1);
  // Align to Sunday
  startDay.setDate(startDay.getDate() - startDay.getDay());

  const weeks: (null | { date: string; count: number })[][] = [];
  const monthLabels: { label: string; col: number }[] = [];
  const seenMonths = new Set<string>();
  const cursor = new Date(startDay);

  for (let w = 0; w < totalWeeks; w++) {
    const week: (null | { date: string; count: number })[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = cursor.toISOString().split("T")[0];
      const isInRange = cursor <= today;
      week.push(isInRange ? { date: dateStr, count: countMap.get(dateStr) ?? 0 } : null);
      const monthKey = `${cursor.getFullYear()}-${cursor.getMonth()}`;
      if (isInRange && !seenMonths.has(monthKey)) {
        seenMonths.add(monthKey);
        monthLabels.push({ label: cursor.toLocaleString("es", { month: "short" }), col: w });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return { weeks, monthLabels };
}

function intensityColor(count: number, t: typeof lightTokens): string {
  if (!count) return t.border;
  if (count < 3)  return t.blueBg;
  if (count < 6)  return t.blue + "55";
  if (count < 12) return t.blue + "99";
  return t.blue;
}

function CalendarHeatmap({ values, t }: { values: { date: string; count: number }[]; t: typeof lightTokens }) {
  const { weeks, monthLabels } = calendarGrid(values);
  const W = weeks.length;
  const totalW = W * (CELL + GAP) - GAP;
  const totalH = 7 * (CELL + GAP) - GAP;

  return (
    <Box>
      <svg width={totalW} height={totalH + 20} style={{ overflow: "visible" }}>
        {/* Month labels */}
        {monthLabels.map(({ label, col }) => (
          <text key={label + col} x={col * (CELL + GAP)} y={12} fontSize={9} fill={String(t.textSoft)} fontFamily="inherit">
            {label}
          </text>
        ))}
        {/* Cells */}
        {weeks.map((week, wi) =>
          week.map((cell, di) => (
            <rect
              key={`${wi}-${di}`}
              x={wi * (CELL + GAP)}
              y={20 + di * (CELL + GAP)}
              width={CELL}
              height={CELL}
              rx={2}
              fill={cell ? intensityColor(cell.count, t) : t.surface2}
            >
              {cell && <title>{`${cell.date}: ${cell.count} envíos`}</title>}
            </rect>
          ))
        )}
      </svg>
      {/* Legend */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "4px", mt: "8px" }}>
        <Typography sx={{ fontSize: "10px", color: t.textSoft, mr: "4px" }}>Menos</Typography>
        {[t.border, t.blueBg, t.blue + "55", t.blue + "99", t.blue].map((color, i) => (
          <Box key={i} sx={{ width: CELL, height: CELL, borderRadius: "2px", background: color }} />
        ))}
        <Typography sx={{ fontSize: "10px", color: t.textSoft, ml: "4px" }}>Más</Typography>
      </Box>
    </Box>
  );
}

// ─── Teacher: Calendario tab ──────────────────────────────────────────────────

function CalendarioTab({ courseId, course, t }: { courseId: number; course: { semester_start_date?: string; semester_end_date?: string }; t: typeof lightTokens }) {
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number }[]>([]);
  const [topStudents, setTopStudents] = useState<(SubmissionStats & UserMeta)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      statsService.getSubmissionStatsByDate(courseId),
      statsService.getSubmissionStatsByStudent(courseId),
    ]).then(([byDate, byStudent]) => {
      const d = byDate as StatsResponse<DateMeta>;
      setHeatmapData(zip(d.submissions_stats, d.metadata).map((x) => ({ date: x.date, count: x.total_submissions })));
      const s = byStudent as StatsResponse<UserMeta>;
      setTopStudents(zip(s.submissions_stats, s.metadata).sort((a, b) => b.total_submissions - a.total_submissions).slice(0, 5));
    }).catch(console.error).finally(() => setLoading(false));
  }, [courseId]);

  void course;

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress sx={{ color: t.blue }} /></Box>;

  const maxSubs = topStudents[0]?.total_submissions ?? 1;

  return (
    <Box>
      <Box sx={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "20px", mb: "16px", overflowX: "auto" }}>
        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: t.text, mb: "16px" }}>Actividad de entregas</Typography>
        <CalendarHeatmap values={heatmapData} t={t} />
      </Box>

      {topStudents.length > 0 && (
        <Box sx={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "20px" }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: t.text, mb: "14px" }}>Top alumnos por entregas</Typography>
          {topStudents.map((s) => (
            <Box key={s.id} sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "10px" }}>
              <Typography sx={{ fontSize: "12px", color: t.textMuted, width: 120, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.name} {s.surname}
              </Typography>
              <Box sx={{ flex: 1, height: 8, borderRadius: 4, background: t.surface2, overflow: "hidden" }}>
                <Box sx={{ height: "100%", borderRadius: 4, background: t.blue, width: `${(s.total_submissions / maxSubs) * 100}%`, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
              </Box>
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: t.blue, width: 30, textAlign: "right", flexShrink: 0 }}>
                {s.total_submissions}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ─── Teacher: Insights tab ────────────────────────────────────────────────────

function InsightsTab({ courseId, t }: { courseId: number; t: typeof lightTokens }) {
  const [actStats, setActStats] = useState<(SubmissionStats & ActivityMeta)[] | null>(null);
  const [studentStats, setStudentStats] = useState<(SubmissionStats & UserMeta)[] | null>(null);
  const [loading, setLoading] = useState(true);
  // Search by student
  const [students, setStudents] = useState<UserMeta[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [studentId, setStudentId] = useState<number | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [studentResult, setStudentResult] = useState<(SubmissionStats & ActivityMeta)[] | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    Promise.all([
      statsService.getSubmissionStatsByActivity(courseId) as Promise<StatsResponse<ActivityMeta>>,
      statsService.getSubmissionStatsByStudent(courseId) as Promise<StatsResponse<UserMeta>>,
      coursesService.getAllStudentsByCourseId(courseId),
      activitiesService.getCategories(courseId),
    ]).then(([byAct, byStudent, studs, cats]) => {
      setActStats(zip((byAct as StatsResponse<ActivityMeta>).submissions_stats, (byAct as StatsResponse<ActivityMeta>).metadata).sort((a, b) => b.total_submissions - a.total_submissions));
      setStudentStats(zip((byStudent as StatsResponse<UserMeta>).submissions_stats, (byStudent as StatsResponse<UserMeta>).metadata));
      setStudents((studs as UserMeta[]).sort((a, b) => a.name.localeCompare(b.name)));
      setCategories((cats as { id: number; name: string }[]).sort((a, b) => a.name.localeCompare(b.name)));
    }).catch(console.error).finally(() => setLoading(false));
  }, [courseId]);

  const search = useCallback(async () => {
    if (!studentId) return;
    setSearching(true);
    try {
      const r = await statsService.getSubmissionStatsByActivity(courseId, categoryId, studentId) as StatsResponse<ActivityMeta>;
      setStudentResult(zip(r.submissions_stats, r.metadata));
    } catch { /* ignore */ } finally { setSearching(false); }
  }, [courseId, studentId, categoryId]);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress sx={{ color: t.blue }} /></Box>;

  const top5 = actStats?.slice(0, 5) ?? [];
  const maxAttempts = top5[0]?.total_submissions ?? 1;

  // Distribution totals
  const distBuild   = actStats?.reduce((s, a) => s + (a.submissions_with_build_errors ?? 0), 0) ?? 0;
  const distRuntime = actStats?.reduce((s, a) => s + (a.submissions_with_runtime_errors ?? 0), 0) ?? 0;
  const distFail    = actStats?.reduce((s, a) => s + (a.submissions_with_failures ?? 0), 0) ?? 0;
  const distSuccess = actStats?.reduce((s, a) => s + (a.successful_submissions ?? 0), 0) ?? 0;
  const distTotal   = distBuild + distRuntime + distFail + distSuccess || 1;

  const distSegments = [
    { label: "Errores de compilación", color: t.amber,   value: distBuild },
    { label: "Errores de runtime",     color: t.red,     value: distRuntime },
    { label: "Fallos de tests",        color: "#7C3AED", value: distFail },
    { label: "Exitosas",               color: t.green,   value: distSuccess },
  ];

  // At-risk students: 0 successful, >0 submissions
  const atRisk = studentStats?.filter((s) => s.successful_submissions === 0 && s.total_submissions > 0) ?? [];

  const barColor = (attempts: number) =>
    attempts > 35 ? t.red : attempts > 25 ? t.amber : t.blue;

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
      {/* Most retried activities */}
      <Box sx={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "20px" }}>
        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: t.text, mb: "14px" }}>
          Actividades más reintentadas
        </Typography>
        {top5.map((act) => {
          const solveRate = act.total_submissions > 0 ? Math.round((act.successful_submissions / act.total_submissions) * 100) : 0;
          return (
            <Box key={act.id} sx={{ mb: "12px" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: "4px" }}>
                <Typography sx={{ fontSize: "12px", color: t.text, fontWeight: 500, maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {act.name}
                </Typography>
                <Typography sx={{ fontSize: "11px", color: t.textMuted }}>{solveRate}% resueltas</Typography>
              </Box>
              <Box sx={{ height: 7, borderRadius: 4, background: t.surface2, overflow: "hidden" }}>
                <Box sx={{ height: "100%", borderRadius: 4, background: barColor(act.total_submissions), width: `${(act.total_submissions / maxAttempts) * 100}%`, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
              </Box>
              <Typography sx={{ fontSize: "10px", color: t.textSoft, mt: "2px" }}>{act.total_submissions} intentos</Typography>
            </Box>
          );
        })}
        {top5.length === 0 && <Typography sx={{ fontSize: "13px", color: t.textSoft }}>Sin datos todavía.</Typography>}
      </Box>

      {/* Right column: distribution + at-risk */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Distribution */}
        <Box sx={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "20px" }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: t.text, mb: "14px" }}>
            Distribución de entregas
          </Typography>
          <Box sx={{ height: 16, borderRadius: "4px", overflow: "hidden", display: "flex", mb: "12px" }}>
            {distSegments.map(({ color, value }) => (
              <Box key={color} sx={{ height: "100%", background: color, width: `${(value / distTotal) * 100}%`, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
            ))}
          </Box>
          {distSegments.map(({ label, color, value }) => (
            <Box key={label} sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "4px" }}>
              <Box sx={{ width: 10, height: 10, borderRadius: "2px", background: color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: "12px", color: t.textMuted, flex: 1 }}>{label}</Typography>
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: t.text }}>{value}</Typography>
            </Box>
          ))}
        </Box>

        {/* At-risk students */}
        <Box sx={{ background: t.surface, border: `1px solid ${t.red}44`, borderRadius: "12px", padding: "20px" }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: t.text, mb: "2px" }}>
            Alumnos en riesgo
          </Typography>
          <Typography sx={{ fontSize: "11px", color: t.textMuted, mb: "12px" }}>
            0 resueltas con al menos 1 intento
          </Typography>
          {atRisk.length === 0 && (
            <Typography sx={{ fontSize: "13px", color: t.green }}>¡Sin alumnos en riesgo!</Typography>
          )}
          {atRisk.map((s) => (
            <Box key={s.id} sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "8px" }}>
              <RplAvatar name={s.name} surname={s.surname} size={28} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: t.text }}>{s.name} {s.surname}</Typography>
                <Typography sx={{ fontSize: "11px", color: t.red }}>0 resueltas · {s.total_submissions} intentos</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Detailed search: by student */}
      <Box sx={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "20px", gridColumn: "1/-1" }}>
        <Typography sx={{ fontSize: "14px", fontWeight: 700, color: t.text, mb: "14px" }}>Buscar por alumno</Typography>
        <Box sx={{ display: "flex", gap: "12px", mb: "16px", flexWrap: "wrap" }}>
          <Autocomplete
            options={students}
            getOptionLabel={(u) => `${u.name} ${u.surname} (${u.username})`}
            onChange={(_, v) => setStudentId(v?.id)}
            sx={{ flex: 1, minWidth: 200 }}
            renderInput={(p) => <TextField {...p} label="Alumno" size="small" />}
          />
          <Autocomplete
            options={categories}
            getOptionLabel={(c) => c.name}
            onChange={(_, v) => setCategoryId(v?.id)}
            sx={{ flex: 1, minWidth: 200 }}
            renderInput={(p) => <TextField {...p} label="Categoría (opcional)" size="small" />}
          />
          <Box
            component="button"
            onClick={search}
            disabled={!studentId || searching}
            sx={{
              background: studentId ? t.blue : t.surface2,
              color: studentId ? "#fff" : t.textMuted,
              border: "none",
              borderRadius: "7px",
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: studentId ? "pointer" : "default",
            }}
          >
            {searching ? "Buscando…" : "Buscar"}
          </Box>
        </Box>
        {studentResult && studentResult.length > 0 && (
          <Box sx={{ overflowX: "auto" }}>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <Box component="thead">
                <Box component="tr" sx={{ background: t.surface2 }}>
                  {["Actividad", "Puntos", "Entregas", "Resuelto"].map((h) => (
                    <Box component="th" key={h} sx={{ padding: "8px 12px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: t.textMuted, letterSpacing: "0.4px", textTransform: "uppercase" }}>
                      {h}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {studentResult.map((r, i) => (
                  <Box component="tr" key={i} sx={{ borderTop: `1px solid ${t.border}` }}>
                    <Box component="td" sx={{ padding: "8px 12px", color: t.text }}>{r.name}</Box>
                    <Box component="td" sx={{ padding: "8px 12px", color: t.textMuted }}>{r.points}</Box>
                    <Box component="td" sx={{ padding: "8px 12px", color: t.textMuted }}>{r.total_submissions}</Box>
                    <Box component="td" sx={{ padding: "8px 12px" }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: r.successful_submissions > 0 ? t.green : t.red }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}
        {studentResult?.length === 0 && (
          <Typography sx={{ fontSize: "13px", color: t.textMuted }}>Sin datos para los filtros seleccionados.</Typography>
        )}
      </Box>
    </Box>
  );
}

// ─── Teacher tab bar ──────────────────────────────────────────────────────────

type TeacherTab = "ranking" | "calendario" | "insights";

function TeacherTabBar({ active, onChange, t }: { active: TeacherTab; onChange: (t: TeacherTab) => void; t: typeof lightTokens }) {
  const tabs: { key: TeacherTab; label: string; badge?: string }[] = [
    { key: "ranking",    label: "Ranking" },
    { key: "calendario", label: "Calendario" },
    { key: "insights",   label: "Insights", badge: "NUEVO" },
  ];
  return (
    <Box sx={{ display: "inline-flex", background: t.surface2, borderRadius: "8px", padding: "3px", gap: "2px", mb: "24px" }}>
      {tabs.map(({ key, label, badge }) => (
        <Box
          key={key}
          component="button"
          onClick={() => onChange(key)}
          sx={{
            position: "relative",
            background: active === key ? t.surface : "transparent",
            color: active === key ? t.text : t.textMuted,
            border: "none",
            borderRadius: "6px",
            padding: "5px 14px",
            fontSize: "13px",
            fontWeight: active === key ? 600 : 400,
            fontFamily: "inherit",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: active === key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            transition: "background 0.12s, color 0.12s",
          }}
        >
          {label}
          {badge && (
            <Box sx={{ background: t.blue, color: "#fff", borderRadius: "10px", padding: "1px 6px", fontSize: "10px", fontWeight: 700 }}>
              {badge}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

// ─── Teacher Dashboard ────────────────────────────────────────────────────────

function TeacherDashboard({ courseId, currentUserId, course, t }: { courseId: number; currentUserId?: number; course: { semester_start_date?: string; semester_end_date?: string }; t: typeof lightTokens }) {
  const [tab, setTab] = useState<TeacherTab>("ranking");
  return (
    <Box>
      <TeacherTabBar active={tab} onChange={setTab} t={t} />
      {tab === "ranking"    && <ScoreboardList courseId={courseId} currentUserId={currentUserId} t={t} />}
      {tab === "calendario" && <CalendarioTab courseId={courseId} course={course} t={t} />}
      {tab === "insights"   && <InsightsTab courseId={courseId} t={t} />}
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const state = useAppState();
  const { isDark } = useThemeMode();
  const t = isDark ? darkTokens : lightTokens;
  const course = state.course as { name?: string; semester?: string; semester_start_date?: string; semester_end_date?: string } | null;
  const profile = state.profile as { id?: number } | null;
  const permissions = (state.permissions as string[]) || [];
  const isTeacher = hasPermission(permissions, "activity_manage");

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: "28px" }}>
        <Typography sx={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.8px", color: t.text, lineHeight: 1.1 }}>
          Dashboard
        </Typography>
        {course?.name && (
          <Typography sx={{ fontSize: "14px", color: t.textMuted, mt: "4px" }}>
            {course.name}{course.semester ? ` · ${course.semester}` : ""}
          </Typography>
        )}
      </Box>

      {isTeacher ? (
        <TeacherDashboard
          courseId={courseId}
          currentUserId={profile?.id}
          course={course ?? {}}
          t={t}
        />
      ) : (
        <StudentDashboard
          courseId={courseId}
          currentUserId={profile?.id}
          t={t}
        />
      )}
    </Box>
  );
}
