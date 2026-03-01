"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, CardMedia, Chip, CircularProgress, Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state";
import * as coursesService from "@/services/coursesService";
import type { Course } from "@/types";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const state = useAppState();
  const router = useRouter();
  const profile = state.profile as { id: number; is_admin?: boolean } | undefined;

  useEffect(() => {
    if (!profile) return;
    Promise.all([
      coursesService.getAll().catch(() => []),
      coursesService.getAllByUser(profile.id).catch(() => []),
    ]).then(([all, enrolled]) => {
      const enrolledIds = new Set(enrolled.map((c: Course) => c.id));
      const merged = all.map((c: Course) => ({ ...c, enrolled: enrolledIds.has(c.id) }));
      setCourses(merged);
    }).finally(() => setLoading(false));
  }, [profile]);

  const handleEnroll = async (courseId: number) => {
    try {
      await coursesService.enroll(courseId);
      setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, enrolled: true } : c));
    } catch {
      setError("Error enrolling in course");
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Courses</Typography>
        {profile?.is_admin && (
          <Fab color="primary" size="small" onClick={() => router.push("/courses/create")}>
            <AddIcon />
          </Fab>
        )}
      </Box>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              {course.img_uri && (
                <CardMedia component="img" height="140" image={course.img_uri} alt={course.name} />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>{course.name}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>{course.description}</Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <Chip label={course.semester} size="small" />
                  {course.active && <Chip label="Active" color="success" size="small" />}
                  {course.enrolled && <Chip label="Enrolled" color="primary" size="small" variant="outlined" />}
                </Box>
              </CardContent>
              <CardActions>
                {course.enrolled ? (
                  <Button size="small" onClick={() => router.push(`/courses/${course.id}/dashboard`)}>Open</Button>
                ) : (
                  <Button size="small" variant="contained" onClick={() => handleEnroll(course.id)}>Enroll</Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {courses.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>No courses available.</Typography>
      )}

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
    </Box>
  );
}
