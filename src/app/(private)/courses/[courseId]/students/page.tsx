"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Avatar, Chip, IconButton, CircularProgress, MenuItem, Select } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams } from "next/navigation";
import { useAppState } from "@/lib/state";
import * as coursesService from "@/services/coursesService";
import type { Student } from "@/types";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function StudentsPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const state = useAppState();
  const permissions = (state.permissions as string[]) || [];
  const canManage = permissions.includes("user_manage");

  const [users, setUsers] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    coursesService.getAllStudentsAndTeachersByCourseId(courseId).then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, [courseId]);

  const handleAccept = async (userId: number) => {
    try {
      await coursesService.acceptStudent(courseId, userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, accepted: true } : u));
      setSuccess("User accepted");
    } catch { setError("Error accepting user"); }
  };

  const handleDelete = async (userId: number) => {
    try {
      await coursesService.deleteStudent(courseId, userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setSuccess("User removed");
    } catch { setError("Error removing user"); }
  };

  const handleRoleChange = async (userId: number, role: string) => {
    try {
      await coursesService.changeStudentRole(courseId, userId, role);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
      setSuccess("Role updated");
    } catch { setError("Error updating role"); }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;

  const pending = users.filter((u) => !u.accepted);
  const accepted = users.filter((u) => u.accepted);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Students & Teachers</Typography>

      {pending.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Pending Approval ({pending.length})</Typography>
          <Table size="small">
            <TableBody>
              {pending.map((user) => (
                <TableRow key={user.id}>
                  <TableCell><Avatar src={user.img_uri || undefined} sx={{ width: 32, height: 32 }}>{user.name[0]}</Avatar></TableCell>
                  <TableCell>{user.name} {user.surname}</TableCell>
                  <TableCell>{user.student_id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {canManage && (
                      <>
                        <IconButton color="success" onClick={() => handleAccept(user.id)}><CheckIcon /></IconButton>
                        <IconButton color="error" onClick={() => handleDelete(user.id)}><DeleteIcon /></IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Members ({accepted.length})</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Student ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              {canManage && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {accepted.map((user) => (
              <TableRow key={user.id}>
                <TableCell><Avatar src={user.img_uri || undefined} sx={{ width: 32, height: 32 }}>{user.name[0]}</Avatar></TableCell>
                <TableCell>{user.name} {user.surname}</TableCell>
                <TableCell>{user.student_id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {canManage ? (
                    <Select size="small" value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}>
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="course_admin">Admin</MenuItem>
                    </Select>
                  ) : (
                    <Chip label={user.role} size="small" />
                  )}
                </TableCell>
                {canManage && (
                  <TableCell>
                    <IconButton color="error" size="small" onClick={() => handleDelete(user.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
      <CustomSnackbar open={!!success} message={success} severity="success" onClose={() => setSuccess("")} />
    </Box>
  );
}
