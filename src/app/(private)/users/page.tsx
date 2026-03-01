"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, IconButton, CircularProgress, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import * as usersService from "@/services/usersService";
import type { Student } from "@/types";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function UsersPage() {
  const [users, setUsers] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    usersService.getAll().then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (userId: number) => {
    try {
      await usersService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      setError("Error deleting user");
    }
  };

  const filtered = users.filter((u) =>
    `${u.name} ${u.surname} ${u.email} ${u.username} ${u.student_id}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Users</Typography>
      <TextField fullWidth placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ mb: 2 }} size="small" />
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Student ID</TableCell>
              <TableCell>University</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name} {user.surname}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.student_id}</TableCell>
                <TableCell>{user.university}</TableCell>
                <TableCell>
                  <IconButton size="small" color="error" onClick={() => handleDelete(user.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
    </Box>
  );
}
