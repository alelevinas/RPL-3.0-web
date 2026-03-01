"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Box, CircularProgress } from "@mui/material";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type Props = {
  value: string;
  language?: string;
  readOnly?: boolean;
  height?: string;
  onChange?: (value: string | undefined) => void;
};

export default function MonacoEditor({ value, language = "c", readOnly = false, height = "400px", onChange }: Props) {
  return (
    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        loading={<CircularProgress />}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
        }}
        theme="vs-dark"
      />
    </Box>
  );
}
