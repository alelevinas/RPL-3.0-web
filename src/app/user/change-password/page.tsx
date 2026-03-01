"use client";

import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import * as authService from "@/services/authenticationService";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function ChangePasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match"); return; }
    try {
      await authService.resetPassword(token, password);
      setSuccess("Password reset successfully!");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Error resetting password. The link may be expired.");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 12 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h5" align="center" gutterBottom>Reset Password</Typography>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" required />
          <TextField fullWidth label="Confirm Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} margin="normal" required />
          <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>Reset Password</Button>
        </form>
        <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
        <CustomSnackbar open={!!success} message={success} severity="success" onClose={() => setSuccess("")} />
      </Paper>
    </Box>
  );
}
