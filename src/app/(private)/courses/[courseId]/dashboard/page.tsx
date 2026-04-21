"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Grid, CircularProgress, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Avatar,
  Autocomplete, TextField, Button,
} from "@mui/material";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  Tooltip, Legend,
} from "chart.js";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { useParams } from "next/navigation";
import { useAppState } from "@/lib/state";
import { hasPermission } from "@/utils/permissions";
import * as statsService from "@/services/statsService";
import * as coursesService from "@/services/coursesService";
import * as activitiesService from "@/services/activitiesService";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// ─── Types ───────────────────────────────────────────────────────────────────

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

function zip<S, M>(stats: S[], meta: M[]): (S & M)[] {
  return stats.map((s, i) => ({ ...s, ...meta[i] }));
}

// ─── Scoreboard ──────────────────────────────────────────────────────────────

function Scoreboard({ courseId, currentUserId }: { courseId: number; currentUserId?: number }) {
  const [rows, setRows] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesService.getScoreboard(courseId)
      .then(setRows)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>;

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell />
            <TableCell>Alumno</TableCell>
            <TableCell align="right">Score</TableCell>
            <TableCell align="right"># Actividades Completadas</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rows as { id: number; name: string; surname: string; img_uri: string; total_score: number; successful_activities_count: number }[]).map((s, i) => (
            <TableRow key={s.id} selected={s.id === currentUserId} hover>
              <TableCell>{i + 1}</TableCell>
              <TableCell><Avatar src={s.img_uri} sx={{ width: 32, height: 32, fontSize: "0.75rem" }}>{s.name[0]}{s.surname[0]}</Avatar></TableCell>
              <TableCell>{s.name} {s.surname}</TableCell>
              <TableCell align="right">{s.total_score}</TableCell>
              <TableCell align="right">{s.successful_activities_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ─── Teacher: Envios por Fecha ────────────────────────────────────────────────

function SubmissionsByDate({ courseId, course }: { courseId: number; course: { semester_start_date?: string; semester_end_date?: string } }) {
  const [byDate, setByDate] = useState<StatsResponse<DateMeta> | null>(null);
  const [byStudent, setByStudent] = useState<StatsResponse<UserMeta> | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      statsService.getSubmissionStatsByDate(courseId),
      statsService.getSubmissionStatsByStudent(courseId),
    ]).then(([d, s]) => { setByDate(d); setByStudent(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleDateClick = useCallback((value: { date: string } | undefined) => {
    if (!value) return;
    const date = value.date === selectedDate ? undefined : value.date;
    setSelectedDate(date ?? null);
    setLoading(true);
    statsService.getSubmissionStatsByStudent(courseId, date)
      .then(setByStudent)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [courseId, selectedDate]);

  if (loading || !byDate) return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>;

  const heatmapValues = zip(byDate.submissions_stats, byDate.metadata).map(d => ({
    date: d.date,
    count: d.total_submissions,
  }));

  const startDate = course.semester_start_date ? new Date(course.semester_start_date) : new Date(new Date().setMonth(new Date().getMonth() - 4));
  const endDate = course.semester_end_date ? new Date(course.semester_end_date) : new Date();

  const students = byStudent ? zip(byStudent.submissions_stats, byStudent.metadata).sort((a, b) => b.total_submissions - a.total_submissions) : [];

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Totales del curso</Typography>
      <Box sx={{ height: 180, mt: 1 }}>
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={heatmapValues}
          showWeekdayLabels
          onClick={handleDateClick}
          classForValue={(v) => {
            if (!v || !v.count) return "color-empty";
            const level = Math.min(Math.floor(v.count / 10) + 1, 4);
            return `color-scale-${level}`;
          }}
        />
      </Box>
      <Typography variant="h6" sx={{ mt: 3 }}>
        {selectedDate ? `Fecha seleccionada: ${selectedDate}` : "Envios totales por alumno"}
      </Typography>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper} sx={{ mt: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Apellido</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell align="right">Envios exitosos</TableCell>
                <TableCell align="right">Envios totales</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((s, i) => (
                <TableRow key={i} hover>
                  <TableCell>{i}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.surname}</TableCell>
                  <TableCell>{s.username}</TableCell>
                  <TableCell align="right">{s.successful_submissions}</TableCell>
                  <TableCell align="right">{s.total_submissions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

// ─── Teacher: Envios por Alumno ───────────────────────────────────────────────

function SubmissionsByStudent({ courseId }: { courseId: number }) {
  const [students, setStudents] = useState<UserMeta[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [studentId, setStudentId] = useState<number | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [result, setResult] = useState<(SubmissionStats & ActivityMeta)[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    Promise.all([
      coursesService.getAllStudentsByCourseId(courseId),
      activitiesService.getCategories(courseId),
    ]).then(([s, c]) => {
      setStudents((s as UserMeta[]).sort((a, b) => a.name.localeCompare(b.name)));
      setCategories((c as { id: number; name: string }[]).sort((a, b) => a.name.localeCompare(b.name)));
    }).catch(console.error);
  }, [courseId]);

  const search = () => {
    if (!studentId) return;
    setLoading(true);
    setSearched(true);
    statsService.getSubmissionStatsByActivity(courseId, categoryId, studentId)
      .then((r: StatsResponse<ActivityMeta>) => setResult(zip(r.submissions_stats, r.metadata)))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const colors = result?.map(r => r.successful_submissions > 0 ? "#4caf50" : "#f44336") ?? [];

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 5 }}>
          <Autocomplete options={students} getOptionLabel={u => `${u.name} ${u.surname} (${u.username})`}
            onChange={(_, v) => setStudentId(v?.id)} renderInput={p => <TextField {...p} label="Alumno" size="small" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 5 }}>
          <Autocomplete options={categories} getOptionLabel={c => c.name}
            onChange={(_, v) => setCategoryId(v?.id)} renderInput={p => <TextField {...p} label="Categoría" size="small" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Button onClick={search} variant="text" color="primary">Buscar</Button>
        </Grid>
      </Grid>
      {loading && <Box sx={{ mt: 2 }}><CircularProgress /></Box>}
      {!loading && result && result.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ height: 200 }}>
            <Bar data={{ labels: result.map(r => r.name), datasets: [{ data: result.map(r => r.total_submissions), backgroundColor: colors }] }}
              options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </Box>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead><TableRow>
                <TableCell>#</TableCell><TableCell>Categoría</TableCell><TableCell>Actividad</TableCell>
                <TableCell>Puntos</TableCell><TableCell align="right">Envios</TableCell><TableCell align="right">Resuelto</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {result.sort((a, b) => a.name.localeCompare(b.name)).map((r, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{i}</TableCell><TableCell>{r.category_name}</TableCell><TableCell>{r.name}</TableCell>
                    <TableCell>{r.points}</TableCell><TableCell align="right">{r.total_submissions}</TableCell>
                    <TableCell align="right"><Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: r.successful_submissions > 0 ? "success.main" : "error.main", display: "inline-block" }} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      {!loading && searched && (!result || result.length === 0) && (
        <Paper sx={{ p: 3, mt: 2, textAlign: "center" }}>No hay datos para los filtros seleccionados.</Paper>
      )}
    </Box>
  );
}

// ─── Teacher: Envios por Categoría ───────────────────────────────────────────

function SubmissionsByCategory({ courseId }: { courseId: number }) {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [result, setResult] = useState<(SubmissionStats & ActivityMeta)[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    activitiesService.getCategories(courseId)
      .then((c: { id: number; name: string }[]) => setCategories(c.sort((a, b) => a.name.localeCompare(b.name))))
      .catch(console.error);
  }, [courseId]);

  const search = () => {
    setLoading(true);
    setSearched(true);
    statsService.getSubmissionStatsByActivity(courseId, categoryId)
      .then((r: StatsResponse<ActivityMeta>) => setResult(zip(r.submissions_stats, r.metadata)))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const data = result?.map(r => r.avg_error_submissions_by_student ?? 0) ?? [];

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 5 }}>
          <Autocomplete options={categories} getOptionLabel={c => c.name}
            onChange={(_, v) => setCategoryId(v?.id)} renderInput={p => <TextField {...p} label="Categoría" size="small" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Button onClick={search} variant="text" color="primary">Buscar</Button>
        </Grid>
      </Grid>
      {loading && <Box sx={{ mt: 2 }}><CircularProgress /></Box>}
      {!loading && result && result.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ height: 200 }}>
            <Bar
              data={{ labels: result.map(r => r.name), datasets: [{ data, backgroundColor: "rgba(99,102,241,0.7)", borderColor: "rgba(99,102,241,1)", borderWidth: 1 }] }}
              options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false } } }}
            />
          </Box>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead><TableRow>
                <TableCell>#</TableCell><TableCell>Categoría</TableCell><TableCell>Actividad</TableCell>
                <TableCell>Puntos</TableCell><TableCell align="right">Alumnos en proceso</TableCell><TableCell align="right">Alumnos exitosos</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {result.map((r, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{i}</TableCell><TableCell>{r.category_name}</TableCell><TableCell>{r.name}</TableCell>
                    <TableCell>{r.points}</TableCell>
                    <TableCell align="right">{r.total_submitters_without_successful_submissions ?? 0}</TableCell>
                    <TableCell align="right">{r.total_submitters_with_at_least_one_successful_submission ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      {!loading && searched && (!result || result.length === 0) && (
        <Paper sx={{ p: 3, mt: 2, textAlign: "center" }}>No hay datos para los filtros seleccionados.</Paper>
      )}
    </Box>
  );
}

// ─── Teacher: Alumnos por Ejercicio ──────────────────────────────────────────

function StudentsByActivity({ courseId }: { courseId: number }) {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [allActivities, setAllActivities] = useState<{ id: number; name: string; category_id: number }[]>([]);
  const [activities, setActivities] = useState<{ id: number; name: string; category_id: number }[]>([]);
  const [activityId, setActivityId] = useState<number | undefined>();
  const [result, setResult] = useState<(SubmissionStats & UserMeta)[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    Promise.all([
      activitiesService.getCategories(courseId),
      activitiesService.getAll(courseId),
    ]).then(([c, a]) => {
      setCategories((c as { id: number; name: string }[]).sort((x, y) => x.name.localeCompare(y.name)));
      const active = (a as { id: number; name: string; active: boolean; category_id: number }[]).filter(x => x.active);
      setAllActivities(active);
      setActivities(active);
    }).catch(console.error);
  }, [courseId]);

  const onCategoryChange = (categoryId?: number) => {
    setActivities(categoryId ? allActivities.filter(a => a.category_id === categoryId) : allActivities);
    setActivityId(undefined);
  };

  const search = () => {
    if (!activityId) return;
    setLoading(true);
    setSearched(true);
    statsService.getActivityStatsByStudent(courseId, activityId)
      .then((r: StatsResponse<UserMeta>) => setResult(
        zip(r.submissions_stats, r.metadata).sort((a, b) => b.total_submissions - a.total_submissions)
      ))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 5 }}>
          <Autocomplete options={categories} getOptionLabel={c => c.name}
            onChange={(_, v) => onCategoryChange(v?.id)} renderInput={p => <TextField {...p} label="Categoría" size="small" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 5 }}>
          <Autocomplete key={activities.length} options={activities} getOptionLabel={a => a.name}
            onChange={(_, v) => setActivityId(v?.id)} renderInput={p => <TextField {...p} label="Actividad" size="small" />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <Button onClick={search} variant="text" color="primary">Buscar</Button>
        </Grid>
      </Grid>
      {loading && <Box sx={{ mt: 2 }}><CircularProgress /></Box>}
      {!loading && result && result.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead><TableRow>
              <TableCell>#</TableCell><TableCell>Nombre</TableCell><TableCell>Apellido</TableCell>
              <TableCell>Padrón</TableCell><TableCell align="right">Envios exitosos</TableCell>
              <TableCell align="right">Envios totales</TableCell><TableCell align="center">Resuelto</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {result.map((r, i) => (
                <TableRow key={i} hover>
                  <TableCell>{i}</TableCell><TableCell>{r.name}</TableCell><TableCell>{r.surname}</TableCell>
                  <TableCell>{r.student_id}</TableCell><TableCell align="right">{r.successful_submissions}</TableCell>
                  <TableCell align="right">{r.total_submissions}</TableCell>
                  <TableCell align="center"><Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: r.successful_submissions > 0 ? "success.main" : "error.main", display: "inline-block" }} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {!loading && searched && (!result || result.length === 0) && (
        <Paper sx={{ p: 3, mt: 2, textAlign: "center" }}>No hay datos para los filtros seleccionados.</Paper>
      )}
    </Box>
  );
}

// ─── Student Stats (pie charts) ───────────────────────────────────────────────

function StudentStats({ courseId }: { courseId: number }) {
  const [actStats, setActStats] = useState<Record<string, number> | null>(null);
  const [subStats, setSubStats] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    Promise.all([
      statsService.getMyActivitiesStats(courseId),
      statsService.getMySubmissionsStats(courseId),
    ]).then(([a, s]) => { setActStats(a); setSubStats(s); })
      .catch(console.error);
  }, [courseId]);

  if (!actStats || !subStats) return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>;

  const pieOpts = { plugins: { legend: { position: "left" as const } } };

  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Mis Actividades</Typography>
          <Pie data={{ labels: ["Sin empezar", "Intentada", "Resuelta"], datasets: [{ data: [actStats.amount_of_activities_not_started, actStats.amount_of_activities_started, actStats.amount_of_activities_solved], backgroundColor: ["#a7a7a7", "#ffa726", "#4caf50"] }] }} options={pieOpts} />
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Mis Entregas</Typography>
          <Pie data={{ labels: ["Error de runtime", "Error de compilación", "Falla", "Exitosa"], datasets: [{ data: [subStats.submissions_with_runtime_errors, subStats.submissions_with_build_errors, subStats.submissions_with_failures, subStats.successful_submissions], backgroundColor: ["#6e1212", "#a83aa8", "#d84329", "#4caf50"] }] }} options={pieOpts} />
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Mis Puntos</Typography>
          <Pie data={{ labels: ["Pendientes", "Obtenidos"], datasets: [{ data: [actStats.total_possible_points - actStats.points_obtained, actStats.points_obtained], backgroundColor: ["#a7a7a7", "#4caf50"] }] }} options={pieOpts} />
        </Paper>
      </Grid>
    </Grid>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const state = useAppState();
  const course = state.course as { name?: string; semester_start_date?: string; semester_end_date?: string } | undefined;
  const profile = state.profile as { id?: number } | undefined;
  const permissions = (state.permissions as string[]) || [];
  const isTeacher = hasPermission(permissions, "activity_manage");

  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{course?.name || "Dashboard"}</Typography>

      {isTeacher ? (
        <>
          <Paper sx={{ mb: 2 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
              <Tab label="Ranking" />
              <Tab label="Envios por Fecha" />
              <Tab label="Envios por Alumno" />
              <Tab label="Envios por Categoría" />
              <Tab label="Alumnos por Ejercicio" />
            </Tabs>
          </Paper>
          {tab === 0 && <Scoreboard courseId={courseId} currentUserId={profile?.id} />}
          {tab === 1 && <SubmissionsByDate courseId={courseId} course={course ?? {}} />}
          {tab === 2 && <SubmissionsByStudent courseId={courseId} />}
          {tab === 3 && <SubmissionsByCategory courseId={courseId} />}
          {tab === 4 && <StudentsByActivity courseId={courseId} />}
        </>
      ) : (
        <>
          <Typography variant="h5" sx={{ mt: 2 }}>Mis estadísticas</Typography>
          <StudentStats courseId={courseId} />
          <Typography variant="h5" sx={{ mt: 4 }}>Ranking</Typography>
          <Scoreboard courseId={courseId} currentUserId={profile?.id} />
        </>
      )}
    </Box>
  );
}
