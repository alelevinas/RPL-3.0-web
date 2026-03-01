"use client";

import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper, Link as MuiLink } from "@mui/material";
import NextLink from "next/link";
import * as authService from "@/services/authenticationService";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess("If the email exists, a reset link has been sent.");
    } catch {
      setError("Error sending reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>Reset Password</Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Enter your email and we&apos;ll send you a link to reset your password.
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" required autoFocus />
        <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ mt: 2, mb: 2 }}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
      <Box sx={{ textAlign: "center" }}>
        <MuiLink component={NextLink} href="/login" variant="body2">Back to login</MuiLink>
      </Box>
      <CustomSnackbar open={!!success} message={success} severity="success" onClose={() => setSuccess("")} />
      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
    </Paper>
  );
}
