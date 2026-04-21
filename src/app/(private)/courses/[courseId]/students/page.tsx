"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams } from "next/navigation";
import { useAppState } from "@/lib/state";
import * as coursesService from "@/services/coursesService";
import type { Student } from "@/types";
import CustomSnackbar from "@/components/CustomSnackbar";
import { hasPermission } from "@/utils/permissions";
import { useThemeMode } from "@/theme/ThemeProvider";
import { lightTokens, darkTokens } from "@/theme/tokens";

const AVATAR_COLORS = ["#005BAA", "#16A34A", "#C47F00", "#DC2626", "#7C3AED"];

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const color = AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  return (
    <Box sx={{
      width: size, height: size, borderRadius: "50%", background: `${color}22`,
      color, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>
      {name[0]?.toUpperCase()}
    </Box>
  );
}

export default function StudentsPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const state = useAppState();
  const permissions = (state.permissions as string[]) || [];
  const canManage = hasPermission(permissions, "user_manage");
  const { isDark } = useThemeMode();
  const t = isDark ? darkTokens : lightTokens;

  const [users, setUsers] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    coursesService.getAllStudentsAndTeachersByCourseId(courseId)
      .then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, [courseId]);

  const handleAccept = async (userId: number) => {
    try {
      await coursesService.acceptStudent(courseId, userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, accepted: true } : u));
    } catch { setError("Error al aceptar al usuario"); }
  };

  const handleDelete = async (userId: number) => {
    try {
      await coursesService.deleteStudent(courseId, userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch { setError("Error al eliminar al usuario"); }
  };

  const handleRoleChange = async (userId: number, role: string) => {
    try {
      await coursesService.changeStudentRole(courseId, userId, role);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
    } catch { setError("Error al cambiar el rol"); }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}><CircularProgress sx={{ color: t.blue }} /></Box>;

  const pending = users.filter((u) => !u.accepted);
  const accepted = users.filter((u) => u.accepted);

  const headSx = {
    fontSize: "11px", fontWeight: 700, color: t.textMuted, textTransform: "uppercase" as const,
    letterSpacing: "0.6px", padding: "10px 14px", background: t.surface2,
    borderBottom: `1px solid ${t.border}`, textAlign: "left" as const,
  };
  const cellSx = { fontSize: "13px", color: t.text, padding: "11px 14px", borderBottom: `1px solid ${t.border}` };

  return (
    <Box>
      <Box sx={{ mb: "28px" }}>
        <Typography sx={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.8px", color: t.text, lineHeight: 1.1 }}>
          Alumnos y docentes
        </Typography>
        <Typography sx={{ fontSize: "14px", color: t.textMuted, mt: "4px" }}>
          {accepted.length} miembro{accepted.length !== 1 ? "s" : ""}{pending.length > 0 ? ` · ${pending.length} pendiente${pending.length !== 1 ? "s" : ""}` : ""}
        </Typography>
      </Box>

      {/* Pending */}
      {pending.length > 0 && (
        <Box sx={{ mb: "24px" }}>
          <Typography sx={{ fontSize: "13px", fontWeight: 700, color: t.amber, textTransform: "uppercase", letterSpacing: "0.6px", mb: "10px" }}>
            Pendientes de aprobación ({pending.length})
          </Typography>
          <Box sx={{ border: `1px solid ${t.border}`, borderRadius: "10px", overflow: "hidden" }}>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
              <Box component="tbody">
                {pending.map((user) => (
                  <Box component="tr" key={user.id}>
                    <Box component="td" sx={{ ...cellSx, width: "44px" }}>
                      <Avatar name={user.name} />
                    </Box>
                    <Box component="td" sx={cellSx}>
                      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: t.text }}>{user.name} {user.surname}</Typography>
                      <Typography sx={{ fontSize: "12px", color: t.textMuted }}>{user.email}</Typography>
                    </Box>
                    <Box component="td" sx={{ ...cellSx, color: t.textMuted }}>{user.student_id}</Box>
                    {canManage && (
                      <Box component="td" sx={{ ...cellSx, width: "80px" }}>
                        <Box sx={{ display: "flex", gap: "4px" }}>
                          <Box
                            component="button"
                            onClick={() => handleAccept(user.id)}
                            title="Aceptar"
                            sx={{ background: t.greenBg, color: t.green, border: "none", borderRadius: "6px", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                          >
                            <CheckIcon sx={{ fontSize: 16 }} />
                          </Box>
                          <Box
                            component="button"
                            onClick={() => handleDelete(user.id)}
                            title="Rechazar"
                            sx={{ background: t.redBg, color: t.red, border: "none", borderRadius: "6px", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Members */}
      <Box>
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.6px", mb: "10px" }}>
          Miembros ({accepted.length})
        </Typography>
        <Box sx={{ border: `1px solid ${t.border}`, borderRadius: "10px", overflow: "hidden" }}>
          <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
            <Box component="thead">
              <Box component="tr">
                <Box component="th" sx={{ ...headSx, width: "44px" }} />
                <Box component="th" sx={headSx}>Nombre</Box>
                <Box component="th" sx={headSx}>Padrón</Box>
                <Box component="th" sx={headSx}>Email</Box>
                <Box component="th" sx={headSx}>Rol</Box>
                {canManage && <Box component="th" sx={{ ...headSx, width: "60px" }} />}
              </Box>
            </Box>
            <Box component="tbody">
              {accepted.length === 0 ? (
                <Box component="tr">
                  <Box component="td" colSpan={canManage ? 6 : 5} sx={{ ...cellSx, textAlign: "center", color: t.textMuted, py: "24px" }}>
                    No hay miembros aún
                  </Box>
                </Box>
              ) : accepted.map((user) => (
                <Box component="tr" key={user.id} sx={{ "&:last-child td": { borderBottom: "none" } }}>
                  <Box component="td" sx={cellSx}><Avatar name={user.name} /></Box>
                  <Box component="td" sx={cellSx}>
                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: t.text }}>{user.name} {user.surname}</Typography>
                  </Box>
                  <Box component="td" sx={{ ...cellSx, color: t.textMuted }}>{user.student_id}</Box>
                  <Box component="td" sx={{ ...cellSx, color: t.textMuted }}>{user.email}</Box>
                  <Box component="td" sx={cellSx}>
                    {canManage ? (
                      <Box
                        component="select"
                        value={user.role}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleRoleChange(user.id, e.target.value)}
                        sx={{
                          fontSize: "12px", fontFamily: "inherit", color: t.text, background: t.surface2,
                          border: `1px solid ${t.border}`, borderRadius: "6px", padding: "4px 8px",
                          outline: "none", cursor: "pointer", "&:focus": { borderColor: t.blue },
                        }}
                      >
                        <option value="student">Alumno</option>
                        <option value="course_admin">Docente</option>
                      </Box>
                    ) : (
                      <Box sx={{
                        display: "inline-block", fontSize: "12px", fontWeight: 600,
                        background: user.role === "course_admin" ? t.blueBg : t.surface2,
                        color: user.role === "course_admin" ? t.blue : t.textMuted,
                        borderRadius: "5px", padding: "2px 8px",
                      }}>
                        {user.role === "course_admin" ? "Docente" : "Alumno"}
                      </Box>
                    )}
                  </Box>
                  {canManage && (
                    <Box component="td" sx={cellSx}>
                      <Box
                        component="button"
                        onClick={() => handleDelete(user.id)}
                        sx={{ background: "none", border: "none", cursor: "pointer", color: t.red, display: "flex", alignItems: "center", p: "4px", borderRadius: "5px", "&:hover": { background: t.redBg } }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </Box>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
    </Box>
  );
}
