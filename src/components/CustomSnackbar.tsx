"use client";

import React from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";

type ValidationError = { msg?: string; type?: string; loc?: unknown[]; input?: unknown };

type Props = {
  open: boolean;
  message: unknown;
  severity?: AlertColor;
  onClose: () => void;
};

/** Coerce any value into a renderable string. Handles FastAPI validation error
 *  objects/arrays ({ type, loc, msg, input }) that arrive via error.detail. */
function toDisplayString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => (item && typeof item === "object" && "msg" in item ? (item as ValidationError).msg : JSON.stringify(item)))
      .filter(Boolean)
      .join(". ");
  }
  if (typeof value === "object" && "msg" in value) {
    return (value as ValidationError).msg || JSON.stringify(value);
  }
  return JSON.stringify(value);
}

export default function CustomSnackbar({ open, message, severity = "info", onClose }: Props) {
  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={onClose} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: "100%" }}>
        {toDisplayString(message)}
      </Alert>
    </Snackbar>
  );
}
