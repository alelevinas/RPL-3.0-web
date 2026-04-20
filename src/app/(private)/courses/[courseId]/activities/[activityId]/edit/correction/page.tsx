"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, Radio, RadioGroup, FormControlLabel, FormControl,
  Accordion, AccordionSummary, AccordionDetails, TextField, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow, CircularProgress,
  ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import { useParams, useRouter } from "next/navigation";
import * as activitiesService from "@/services/activitiesService";
import * as activityTestsService from "@/services/activityTestsService";
import MonacoEditor from "@/components/MonacoEditor";
import { getMonacoLanguage, getTestCodeForLanguage } from "@/utils/constants";
import { FILE_DISPLAY_MODE, type FileDisplayMode } from "@/types";
import type { Activity, IOTest } from "@/types";
import CustomSnackbar from "@/components/CustomSnackbar";

const PERMISSION_LABELS: Record<FileDisplayMode, string> = {
  [FILE_DISPLAY_MODE.READ_WRITE]: "Write",
  [FILE_DISPLAY_MODE.READ]: "Read",
  [FILE_DISPLAY_MODE.HIDDEN]: "Hidden",
  [FILE_DISPLAY_MODE.WRITE_CANT_DELETE]: "Write (locked)",
};

export default function CorrectionPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const activityId = Number(params.activityId);
  const router = useRouter();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  // Step 1: test mode
  const [testMode, setTestMode] = useState<"io" | "unit">("io");

  // Step 2a: IO tests
  const [ioTests, setIoTests] = useState<IOTest[]>([]);
  const [newTest, setNewTest] = useState({ name: "", test_in: "", test_out: "" });
  const [addingTest, setAddingTest] = useState(false);

  // Step 2b: Unit tests
  const [unitTestCode, setUnitTestCode] = useState("");
  const [unitTestExists, setUnitTestExists] = useState(false);
  const [savingUnit, setSavingUnit] = useState(false);

  // Step 3: Compilation flags
  const [compilationFlags, setCompilationFlags] = useState("");
  const [savingFlags, setSavingFlags] = useState(false);

  // Step 4: File permissions
  const [startingFiles, setStartingFiles] = useState<Record<string, string>>({});
  const [permissions, setPermissions] = useState<Record<string, FileDisplayMode>>({});
  const [savingPerms, setSavingPerms] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    try {
      const act = await activitiesService.get(courseId, activityId);
      setActivity(act);
      setTestMode(act.is_io_tested ? "io" : "unit");
      setCompilationFlags(act.compilation_flags || "");
      setUnitTestCode(act.activity_unit_tests_content || getTestCodeForLanguage(act.language));
      setUnitTestExists(!!act.activity_unit_tests_content);
      setIoTests(act.activity_io_tests || []);

      const allFiles = await activitiesService.getStartingFiles(courseId, act.starting_rplfile_id);
      const { files_metadata: rawMeta, ...codeFiles } = allFiles;
      setStartingFiles(codeFiles);

      const parsed: Record<string, { display: string }> = rawMeta ? JSON.parse(rawMeta) : {};
      const perms: Record<string, FileDisplayMode> = {};
      for (const name of Object.keys(codeFiles)) {
        perms[name] = (parsed[name]?.display as FileDisplayMode) ?? FILE_DISPLAY_MODE.READ_WRITE;
      }
      setPermissions(perms);
    } finally {
      setLoading(false);
    }
  }, [courseId, activityId]);

  useEffect(() => { load(); }, [load]);

  // IO tests
  const handleAddIOTest = async () => {
    if (!newTest.name.trim()) return;
    setAddingTest(true);
    try {
      await activityTestsService.createIOTest(courseId, activityId, newTest);
      const updated = await activitiesService.get(courseId, activityId);
      setIoTests(updated.activity_io_tests || []);
      setNewTest({ name: "", test_in: "", test_out: "" });
      setSuccess("Test added");
    } catch { setError("Error adding test"); }
    finally { setAddingTest(false); }
  };

  const handleDeleteIOTest = async (testId: number) => {
    try {
      await activityTestsService.deleteIOTest(courseId, activityId, testId);
      setIoTests((prev) => prev.filter((t) => t.id !== testId));
      setSuccess("Test deleted");
    } catch { setError("Error deleting test"); }
  };

  // Unit tests
  const handleSaveUnitTests = async () => {
    setSavingUnit(true);
    try {
      if (unitTestExists) {
        await activityTestsService.updateUnitTests(courseId, activityId, unitTestCode);
      } else {
        await activityTestsService.createUnitTests(courseId, activityId, unitTestCode);
        setUnitTestExists(true);
      }
      setSuccess("Unit tests saved");
    } catch { setError("Error saving unit tests"); }
    finally { setSavingUnit(false); }
  };

  // Compilation flags
  const handleSaveFlags = async () => {
    setSavingFlags(true);
    try {
      await activitiesService.edit(courseId, activityId, { compilation_flags: compilationFlags });
      setSuccess("Compilation flags saved");
    } catch { setError("Error saving flags"); }
    finally { setSavingFlags(false); }
  };

  // File permissions
  const handleSavePermissions = async () => {
    setSavingPerms(true);
    try {
      const metadata: Record<string, { display: string }> = {};
      for (const [name, display] of Object.entries(permissions)) {
        metadata[name] = { display };
      }
      await activitiesService.saveFilePermissions(courseId, activityId, startingFiles, metadata);
      setSuccess("File permissions saved");
    } catch { setError("Error saving file permissions"); }
    finally { setSavingPerms(false); }
  };

  const handlePublish = async () => {
    try {
      await activitiesService.edit(courseId, activityId, { active: true });
      router.push(`/courses/${courseId}/activities`);
    } catch { setError("Error publishing activity"); }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;
  if (!activity) return null;

  const codeFileNames = Object.keys(startingFiles);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Edit Activity — {activity.name}</Typography>

      {/* Step 1: Test mode */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight={600}>Step 1: Select test mode</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Only one mode can be active at a time.</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FormControl>
              <RadioGroup value={testMode} onChange={(e) => setTestMode(e.target.value as "io" | "unit")}>
                <FormControlLabel value="io" control={<Radio />} label="IO tests" />
                <FormControlLabel value="unit" control={<Radio />} label="Unit tests" />
              </RadioGroup>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={async () => {
                try {
                  await activitiesService.edit(courseId, activityId, { is_io_tested: testMode === "io" });
                  setSuccess("Test mode saved");
                } catch { setError("Error saving test mode"); }
              }}
            >
              Save
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Step 2: Tests */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight={600}>
            Step 2: Define tests — {testMode === "io" ? "IO tests" : "Unit tests"}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {testMode === "io" ? (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add input/output test cases. Each passing test counts toward the student&apos;s score.
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr 2fr auto", gap: 2, alignItems: "end", mb: 3 }}>
                <TextField label="Name" value={newTest.name} onChange={(e) => setNewTest((p) => ({ ...p, name: e.target.value }))} size="small" />
                <TextField label="Input" value={newTest.test_in} onChange={(e) => setNewTest((p) => ({ ...p, test_in: e.target.value }))} size="small" multiline minRows={2} />
                <TextField label="Expected Output" value={newTest.test_out} onChange={(e) => setNewTest((p) => ({ ...p, test_out: e.target.value }))} size="small" multiline minRows={2} />
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddIOTest} disabled={addingTest || !newTest.name.trim()}>Add</Button>
              </Box>
              {ioTests.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Input</TableCell>
                      <TableCell>Expected Output</TableCell>
                      <TableCell width={48} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ioTests.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell>{test.name}</TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: 12, whiteSpace: "pre-wrap", maxWidth: 240 }}>{test.test_in}</TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: 12, whiteSpace: "pre-wrap", maxWidth: 240 }}>{test.test_out}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => handleDeleteIOTest(test.id)}><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography color="text.secondary" fontSize={14}>No IO tests yet.</Typography>
              )}
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Write the unit test suite. It will run inside the container alongside the student&apos;s code.
              </Typography>
              <MonacoEditor value={unitTestCode} language={getMonacoLanguage(activity.language)} onChange={(v) => setUnitTestCode(v || "")} height="320px" />
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveUnitTests} disabled={savingUnit} sx={{ mt: 2 }}>
                {savingUnit ? "Saving…" : "Save Unit Tests"}
              </Button>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Step 3: Compilation flags */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight={600}>Step 3: Compilation flags</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Flags passed to the compiler when building student submissions.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <TextField fullWidth label="Compilation Flags" value={compilationFlags} onChange={(e) => setCompilationFlags(e.target.value)} placeholder="-g -O2 -Wall -Wextra" size="small" />
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveFlags} disabled={savingFlags}>
              {savingFlags ? "Saving…" : "Save"}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Step 4: File permissions */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight={600}>Step 4: File permissions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose what students can do with each starting file.
            <br />
            <b>Write</b> — editable and included in submissions. &nbsp;
            <b>Read</b> — visible but not editable. &nbsp;
            <b>Hidden</b> — invisible to students but present in the container.
          </Typography>
          {codeFileNames.length === 0 ? (
            <Typography color="text.secondary" fontSize={14}>No files found.</Typography>
          ) : (
            <Table size="small" sx={{ mb: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>File</TableCell>
                  <TableCell>Permission</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {codeFileNames.map((filename) => (
                  <TableRow key={filename}>
                    <TableCell sx={{ fontFamily: "monospace" }}>{filename}</TableCell>
                    <TableCell>
                      <ToggleButtonGroup
                        value={permissions[filename] ?? FILE_DISPLAY_MODE.READ_WRITE}
                        exclusive
                        onChange={(_, val) => {
                          if (val !== null) {
                            setPermissions((prev) => ({ ...prev, [filename]: val as FileDisplayMode }));
                          }
                        }}
                        size="small"
                      >
                        {([FILE_DISPLAY_MODE.READ_WRITE, FILE_DISPLAY_MODE.READ, FILE_DISPLAY_MODE.HIDDEN] as FileDisplayMode[]).map((mode) => (
                          <ToggleButton key={mode} value={mode}>{PERMISSION_LABELS[mode]}</ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSavePermissions} disabled={savingPerms || codeFileNames.length === 0}>
            {savingPerms ? "Saving…" : "Save Permissions"}
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Bottom actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button variant="outlined" onClick={() => router.push(`/courses/${courseId}/activities/${activityId}/edit`)}>
          ← Back to Activity
        </Button>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" onClick={() => router.push(`/courses/${courseId}/activities/${activityId}`)}>
            Preview as Student
          </Button>
          <Button variant="contained" color="success" onClick={handlePublish}>
            Save and Publish
          </Button>
        </Box>
      </Box>

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
      <CustomSnackbar open={!!success} message={success} severity="success" onClose={() => setSuccess("")} />
    </Box>
  );
}
