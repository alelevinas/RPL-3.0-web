"use client";

import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper, Link as MuiLink, Alert } from "@mui/material";
import NextLink from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/lib/state";
import * as authService from "@/services/authenticationService";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [emailNotValidated, setEmailNotValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const state = useAppState();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/courses";

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("sessionExpired")) {
      setSessionExpired(true);
      localStorage.removeItem("sessionExpired");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailNotValidated(false);
    setLoading(true);

    try {
      const response = await authService.login({ username, password });
      state.set("token", { tokenType: response.token_type, accessToken: response.access_token });

      const profile = await authService.getProfile();
      state.set("profile", profile);

      router.push(next);
    } catch (err: unknown) {
      const error = err as { err?: { detail?: string }; status?: number };
      if (error?.err?.detail === "Email not validated") {
        setEmailNotValidated(true);
      } else {
        setError(error?.err?.detail || "Invalid username or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      await authService.resendEmailToken(username);
      setEmailNotValidated(false);
      setError("");
    } catch {
      setError("Error resending validation email");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
        <Image src="/logo_large.png" alt="RPL" width={80} height={80} />
        <Typography variant="h5" sx={{ mt: 2 }}>Sign In</Typography>
      </Box>

      {sessionExpired && (
        <Alert severity="warning" sx={{ mb: 2 }}>Your session has expired. Please log in again.</Alert>
      )}

      {emailNotValidated && (
        <Alert severity="warning" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={handleResendEmail}>Resend</Button>}>
          Please validate your email first.
        </Alert>
      )}

      <form onSubmit={handleLogin}>
        <TextField fullWidth label="Username or Email" value={username} onChange={(e) => setUsername(e.target.value)} margin="normal" required autoFocus />
        <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" required />
        <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ mt: 2, mb: 2 }}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <MuiLink component={NextLink} href="/forgot-password" variant="body2">Forgot password?</MuiLink>
        <MuiLink component={NextLink} href="/signup" variant="body2">Create account</MuiLink>
      </Box>

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
    </Paper>
  );
}
