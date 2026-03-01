"use client";

import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper, Link as MuiLink, MenuItem } from "@mui/material";
import NextLink from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as authService from "@/services/authenticationService";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", surname: "", student_id: "", email: "", username: "", password: "", university: "", degree: "" });
  const [universities, setUniversities] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    authService.getUniversities().then(setUniversities).catch(() => {});
  }, []);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.signup(form);
      setSuccess("Account created! Check your email to validate.");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      const error = err as { err?: { detail?: string } };
      setError(error?.err?.detail || "Error creating account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
        <Image src="/logo_large.png" alt="RPL" width={60} height={60} />
        <Typography variant="h5" sx={{ mt: 1 }}>Create Account</Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField label="First Name" value={form.name} onChange={handleChange("name")} required />
          <TextField label="Last Name" value={form.surname} onChange={handleChange("surname")} required />
          <TextField label="Student ID" value={form.student_id} onChange={handleChange("student_id")} required />
          <TextField label="Email" type="email" value={form.email} onChange={handleChange("email")} required />
          <TextField label="Username" value={form.username} onChange={handleChange("username")} required />
          <TextField label="Password" type="password" value={form.password} onChange={handleChange("password")} required />
          <TextField select label="University" value={form.university} onChange={handleChange("university")} required>
            {universities.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          <TextField label="Degree" value={form.degree} onChange={handleChange("degree")} required />
        </Box>
        <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ mt: 3, mb: 2 }}>
          {loading ? "Creating..." : "Sign Up"}
        </Button>
      </form>

      <Box sx={{ textAlign: "center" }}>
        <MuiLink component={NextLink} href="/login" variant="body2">Already have an account? Sign in</MuiLink>
      </Box>

      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
      <CustomSnackbar open={!!success} message={success} severity="success" onClose={() => setSuccess("")} />
    </Paper>
  );
}
