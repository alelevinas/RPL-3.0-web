"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, TextField, Button, Avatar } from "@mui/material";
import { useAppState } from "@/lib/state";
import * as authService from "@/services/authenticationService";
import * as cloudinaryService from "@/services/cloudinaryService";
import CustomSnackbar from "@/components/CustomSnackbar";

export default function ProfilePage() {
  const state = useAppState();
  const profile = state.profile as Record<string, unknown> | undefined;

  const [form, setForm] = useState({ name: "", surname: "", student_id: "", degree: "", university: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        name: (profile.name as string) || "",
        surname: (profile.surname as string) || "",
        student_id: (profile.student_id as string) || "",
        degree: (profile.degree as string) || "",
        university: (profile.university as string) || "",
      });
    }
  }, [profile]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await authService.updateProfile(form);
      state.set("profile", updated);
      setSuccess("Profile updated");
    } catch {
      setError("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await cloudinaryService.uploadImage(file);
      await authService.updateProfile({ img_uri: url });
      const updated = await authService.getProfile();
      state.set("profile", updated);
      setSuccess("Profile picture updated");
    } catch {
      setError("Error uploading image");
    }
  };

  if (!profile) return null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Profile</Typography>
      <Paper sx={{ p: 3, maxWidth: 500 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar src={(profile.img_uri as string) || undefined} sx={{ width: 80, height: 80 }}>
            {(profile.name as string)?.[0]}
          </Avatar>
          <Button variant="outlined" component="label">
            Change Photo
            <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
          </Button>
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="First Name" value={form.name} onChange={handleChange("name")} margin="normal" />
          <TextField fullWidth label="Last Name" value={form.surname} onChange={handleChange("surname")} margin="normal" />
          <TextField fullWidth label="Student ID" value={form.student_id} onChange={handleChange("student_id")} margin="normal" />
          <TextField fullWidth label="University" value={form.university} onChange={handleChange("university")} margin="normal" />
          <TextField fullWidth label="Degree" value={form.degree} onChange={handleChange("degree")} margin="normal" />
          <TextField fullWidth label="Email" value={(profile.email as string) || ""} margin="normal" disabled />
          <TextField fullWidth label="Username" value={(profile.username as string) || ""} margin="normal" disabled />
          <Button variant="contained" type="submit" disabled={saving} sx={{ mt: 2 }}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Paper>
      <CustomSnackbar open={!!error} message={error} severity="error" onClose={() => setError("")} />
      <CustomSnackbar open={!!success} message={success} severity="success" onClose={() => setSuccess("")} />
    </Box>
  );
}
