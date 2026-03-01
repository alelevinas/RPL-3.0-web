"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, TextField, Button, IconButton, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useParams, useRouter } from "next/navigation";
import * as activityTestsService from "@/services/activityTestsService";
import type { IOTest } from "@/types";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function CorrectionTestsPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const activityId = Number(params.activityId);
  const router = useRouter();

  const [ioTests, setIoTests] = useState<IOTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newTest, setNewTest] = useState({ name: "", test_in: "", test_out: "" });

  useEffect(() => {
    activityTestsService.getIOTests(courseId, activityId).then(setIoTests).catch(() => {}).finally(() => setLoading(false));
  }, [courseId, activityId]);

  const handleAdd = async () => {
    if (!newTest.name) return;
    try {
      await activityTestsService.createIOTest(courseId, activityId, newTest);
      const tests = await activityTestsService.getIOTests(courseId, activityId);
      setIoTests(tests);
      setNewTest({ name: "", test_in: "", test_out: "" });
      setSuccess("Test added");
    } catch {
      setError("Error adding test");
    }
  };

  const handleDelete = async (testId: number) => {
    try {
      await activityTestsService.deleteIOTest(courseId, activityId, testId);
      setIoTests((prev) => prev.filter((t) => t.id !== testId));
      setSuccess("Test deleted");
    } catch {
      setError("Error deleting test");
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>I/O Correction Tests</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Add New Test</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr 2fr auto", gap: 2, alignItems: "end" }}>
          <TextField label="Name" value={newTest.name} onChange={(e) => setNewTest((p) => ({ ...p, name: e.target.value }))} size="small" />
          <TextField label="Input" value={newTest.test_in} onChange={(e) => setNewTest((p) => ({ ...p, test_in: e.target.value }))} size="small" multiline />
          <TextField label="Expected Output" value={newTest.test_out} onChange={(e) => setNewTest((p) => ({ ...p, test_out: e.target.value }))} size="small" multiline />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>Add</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Existing Tests ({ioTests.length})</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Input</TableCell>
              <TableCell>Expected Output</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ioTests.map((test) => (
              <TableRow key={test.id}>
                <TableCell>{test.name}</TableCell>
                <TableCell sx={{ fontFamily: "monospace", fontSize: 12, whiteSpace: "pre-wrap" }}>{test.test_in}</TableCell>
                <TableCell sx={{ fontFamily: "monospace", fontSize: 12, whiteSpace: "pre-wrap" }}>{test.test_out}</TableCell>
                <TableCell>
                  <IconButton size="small" color="error" onClick={() => handleDelete(test.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Button variant="outlined" sx={{ mt: 2 }} onClick={() => router.back()}>Back</Button>
      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
      <CustomSnackbar open={!!success} message={success} severity="success" onClose={() => setSuccess("")} />
    </Box>
  );
}
