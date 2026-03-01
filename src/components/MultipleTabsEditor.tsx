"use client";

import React, { useState } from "react";
import { Box, Tabs, Tab, IconButton, TextField, Button, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MonacoEditor from "./MonacoEditor";
import { getMonacoLanguage, getFileExtension } from "@/utils/constants";
import type { FileDisplayMode } from "@/types";

type Props = {
  files: Record<string, string>;
  language: string;
  readOnly?: boolean;
  onChange?: (files: Record<string, string>) => void;
  filesMetadata?: Record<string, { display: FileDisplayMode }>;
};

export default function MultipleTabsEditor({ files, language, readOnly = false, onChange, filesMetadata }: Props) {
  const fileNames = Object.keys(files);
  const [activeTab, setActiveTab] = useState(0);
  const [newFileName, setNewFileName] = useState("");
  const [showNewFile, setShowNewFile] = useState(false);

  const currentFile = fileNames[activeTab] || "";
  const currentContent = files[currentFile] || "";
  const monacoLang = getMonacoLanguage(language);

  const isFileReadOnly = (name: string) => {
    if (readOnly) return true;
    const meta = filesMetadata?.[name];
    if (!meta) return false;
    return meta.display === "read" || meta.display === "hidden";
  };

  const canDelete = (name: string) => {
    if (readOnly) return false;
    const meta = filesMetadata?.[name];
    if (!meta) return true;
    return meta.display === "read_write";
  };

  const handleContentChange = (value: string | undefined) => {
    if (!onChange || !currentFile) return;
    onChange({ ...files, [currentFile]: value || "" });
  };

  const handleAddFile = () => {
    if (!newFileName || !onChange) return;
    const ext = getFileExtension(language);
    const name = newFileName.includes(".") ? newFileName : `${newFileName}${ext}`;
    onChange({ ...files, [name]: "" });
    setNewFileName("");
    setShowNewFile(false);
    setActiveTab(fileNames.length);
  };

  const handleDeleteFile = (name: string) => {
    if (!onChange) return;
    const next = { ...files };
    delete next[name];
    onChange(next);
    setActiveTab(0);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
          {fileNames.map((name) => (
            <Tab
              key={name}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {name}
                  {canDelete(name) && (
                    <CloseIcon
                      fontSize="small"
                      onClick={(e) => { e.stopPropagation(); handleDeleteFile(name); }}
                      sx={{ ml: 0.5, fontSize: 16, "&:hover": { color: "error.main" } }}
                    />
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
        {!readOnly && (
          <IconButton size="small" onClick={() => setShowNewFile(true)} sx={{ ml: 1 }}>
            <AddIcon />
          </IconButton>
        )}
      </Box>

      {showNewFile && (
        <Stack direction="row" spacing={1} sx={{ p: 1 }}>
          <TextField size="small" placeholder="filename" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddFile()} />
          <Button size="small" onClick={handleAddFile}>Add</Button>
          <Button size="small" color="inherit" onClick={() => setShowNewFile(false)}>Cancel</Button>
        </Stack>
      )}

      {currentFile && (
        <MonacoEditor
          value={currentContent}
          language={monacoLang}
          readOnly={isFileReadOnly(currentFile)}
          onChange={handleContentChange}
          height="500px"
        />
      )}
    </Box>
  );
}
