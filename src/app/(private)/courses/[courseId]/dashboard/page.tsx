"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CircularProgress, LinearProgress } from "@mui/material";
import { useParams } from "next/navigation";
import { useAppState } from "@/lib/state";
import * as statsService from "@/services/statsService";

export default function DashboardPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const state = useAppState();
  const course = state.course as { name?: string } | undefined;
  const permissions = (state.permissions as string[]) || [];
  const isTeacher = permissions.includes("activity_manage");

  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = isTeacher ? statsService.getTeacherStats : statsService.getStudentStats;
    fetchStats(courseId).then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, [courseId, isTeacher]);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{course?.name || "Dashboard"}</Typography>

      {stats && !isTeacher && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>Activities Completed</Typography>
                <Typography variant="h3">{(stats.completed_activities as number) || 0}</Typography>
                <Typography variant="body2" color="text.secondary">of {(stats.total_activities as number) || 0}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={((stats.total_activities as number) || 0) > 0 ? ((stats.completed_activities as number) / (stats.total_activities as number)) * 100 : 0}
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>Total Submissions</Typography>
                <Typography variant="h3">{(stats.total_submissions as number) || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>Points</Typography>
                <Typography variant="h3">{(stats.total_points as number) || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {stats && isTeacher && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>Total Students</Typography>
                <Typography variant="h3">{(stats.total_students as number) || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>Total Activities</Typography>
                <Typography variant="h3">{(stats.total_activities as number) || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>Total Submissions</Typography>
                <Typography variant="h3">{(stats.total_submissions as number) || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
