"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";
import * as coursesService from "@/services/coursesService";
import type { Course } from "@/types";
import CustomSnackbar from "@/components/CustomSnackbar";

// ─── Course Card ───────────────────────────────────────────────────────────────

type CourseCardProps = {
  course: Course & { enrolled?: boolean };
  isAdmin: boolean;
  onOpen: () => void;
  onEnroll: () => Promise<void>;
  t: typeof lightTokens;
};

function CourseCard({ course, isAdmin, onOpen, onEnroll, t }: CourseCardProps) {
  const [enrolling, setEnrolling] = useState(false);
  const [justEnrolled, setJustEnrolled] = useState(false);
  const isInteractive = course.enrolled || isAdmin;

  const handleEnroll = async () => {
    setEnrolling(true);
    await onEnroll();
    setEnrolling(false);
    setJustEnrolled(true);
    setTimeout(() => setJustEnrolled(false), 1200);
  };

  return (
    <Box
      sx={{
        position: "relative",
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: "12px",
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.13s, box-shadow 0.13s",
        cursor: isInteractive ? "pointer" : "default",
        ...(isInteractive && {
          "&:hover": {
            borderColor: t.blue,
            boxShadow: `0 0 0 3px ${t.blueBg}`,
          },
        }),
      }}
      onClick={isInteractive ? onOpen : undefined}
    >
      {/* Status badge */}
      <Box
        sx={{
          position: "absolute",
          top: "16px",
          right: "16px",
          borderRadius: "20px",
          padding: "2px 9px",
          fontSize: "11px",
          fontWeight: 600,
          background: course.active ? t.greenBg : t.surface2,
          color: course.active ? t.green : t.textMuted,
        }}
      >
        {course.active ? "Activo" : "Finalizado"}
      </Box>

      {/* Subject code */}
      <Typography
        sx={{
          fontSize: "11px",
          fontWeight: 700,
          color: t.textSoft,
          letterSpacing: "0.8px",
          textTransform: "uppercase",
          mb: "6px",
        }}
      >
        {course.subject_id}
      </Typography>

      {/* Course name */}
      <Typography
        sx={{
          fontSize: "17px",
          fontWeight: 700,
          lineHeight: 1.3,
          color: t.text,
          pr: "72px",
          mb: "8px",
        }}
      >
        {course.name}
      </Typography>

      {/* Description */}
      <Typography
        sx={{
          fontSize: "13px",
          color: t.textMuted,
          lineHeight: 1.55,
          flexGrow: 1,
          mb: "16px",
        }}
      >
        {course.description}
      </Typography>

      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${t.border}`,
          pt: "14px",
          mt: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography sx={{ fontSize: "12px", color: t.textMuted, fontWeight: 500 }}>
          {course.semester}
        </Typography>

        {course.enrolled || isAdmin ? (
          <Box
            component="button"
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
            sx={{
              background: t.blue,
              color: "#fff",
              border: "none",
              borderRadius: "7px",
              padding: "6px 14px",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Abrir
          </Box>
        ) : justEnrolled ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: t.greenBg,
              color: t.green,
              borderRadius: "7px",
              padding: "6px 14px",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            <CheckIcon sx={{ fontSize: 14 }} />
            Inscripto
          </Box>
        ) : (
          <Box
            component="button"
            onClick={handleEnroll}
            disabled={enrolling}
            sx={{
              background: t.blue,
              color: "#fff",
              border: "none",
              borderRadius: "7px",
              padding: "6px 14px",
              fontSize: "13px",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: enrolling ? "default" : "pointer",
              opacity: enrolling ? 0.7 : 1,
              transition: "opacity 0.12s",
            }}
          >
            {enrolling ? "Inscribiendo…" : "Inscribirse"}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CoursesPage() {
  const [courses, setCourses] = useState<(Course & { enrolled?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const state = useAppState();
  const router = useRouter();
  const { isDark } = useThemeMode();
  const t = isDark ? darkTokens : lightTokens;
  const profile = state.profile as { id: number; is_admin?: boolean } | undefined;
  const isAdmin = !!profile?.is_admin;

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

  const handleEnroll = useCallback(async (courseId: number) => {
    try {
      await coursesService.enroll(courseId);
      setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, enrolled: true } : c));
    } catch {
      setError("Error al inscribirse en el curso");
    }
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
        <CircularProgress sx={{ color: t.blue }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "28px" }}>
        <Box>
          <Typography
            sx={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.8px", color: t.text, lineHeight: 1.1 }}
          >
            Cursos
          </Typography>
          <Typography sx={{ fontSize: "14px", color: t.textMuted, mt: "4px" }}>
            {isAdmin
              ? "Gestioná tus cursos y actividades"
              : "Inscribite a un curso para comenzar"}
          </Typography>
        </Box>

        {isAdmin && (
          <Box
            component="button"
            onClick={() => router.push("/courses/create")}
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
            Nuevo curso
          </Box>
        )}
      </Box>

      {/* Grid */}
      {courses.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
            gap: "16px",
          }}
        >
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isAdmin={isAdmin}
              onOpen={() => router.push(`/courses/${course.id}/dashboard`)}
              onEnroll={() => handleEnroll(course.id)}
              t={t}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography sx={{ fontSize: "15px", color: t.textMuted }}>
            No hay cursos disponibles.
          </Typography>
        </Box>
      )}

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
    </Box>
  );
}
