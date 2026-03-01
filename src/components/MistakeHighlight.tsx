import React from "react";
import { Box, Typography, Paper, Tooltip, IconButton } from "@mui/material";
import { InfoOutlined, WarningAmberOutlined, ErrorOutline } from "@mui/icons-material";

export interface Mistake {
  line: number;
  message: string;
  type: "compilation" | "runtime" | "memory" | "logic";
}

interface MistakeHighlightProps {
  mistakes: Mistake[];
  onMistakeClick?: (mistake: Mistake) => void;
}

const getMistakeIcon = (type: string) => {
  switch (type) {
    case "compilation": return <ErrorOutline color="error" />;
    case "memory": return <WarningAmberOutlined color="warning" />;
    case "runtime": return <WarningAmberOutlined color="warning" />;
    default: return <InfoOutlined color="info" />;
  }
};

const MistakeHighlight: React.FC<MistakeHighlightProps> = ({ mistakes, onMistakeClick }) => {
  if (!mistakes || mistakes.length === 0) return null;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mt: 2, 
        p: 2, 
        borderRadius: 4, 
        border: "1px solid", 
        borderColor: "divider",
        backgroundColor: "background.paper"
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <WarningAmberOutlined color="warning" />
        Identified Potential Issues
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {mistakes.map((mistake, index) => (
          <Box 
            key={index} 
            sx={{ 
              display: "flex", 
              alignItems: "flex-start", 
              gap: 1.5,
              p: 1.5,
              borderRadius: 3,
              backgroundColor: "rgba(0, 0, 0, 0.02)",
              cursor: onMistakeClick ? "pointer" : "default",
              transition: "background-color 0.2s",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)"
              }
            }}
            onClick={() => onMistakeClick && onMistakeClick(mistake)}
          >
            <Box sx={{ mt: 0.25 }}>{getMistakeIcon(mistake.type)}</Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Line {mistake.line}: {mistake.type.charAt(0).toUpperCase() + mistake.type.slice(1)} Issue
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {mistake.message}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default MistakeHighlight;
