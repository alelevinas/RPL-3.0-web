"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Button } from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import * as authService from "@/services/authenticationService";

function ValidateEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    authService.validateEmailToken(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 12 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: "center", maxWidth: 400 }}>
        {status === "loading" && <><CircularProgress /><Typography sx={{ mt: 2 }}>Validating email...</Typography></>}
        {status === "success" && (
          <>
            <Typography variant="h5" color="success.main">Email Validated!</Typography>
            <Typography sx={{ mt: 1 }}>You can now log in.</Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push("/login")}>Go to Login</Button>
          </>
        )}
        {status === "error" && (
          <>
            <Typography variant="h5" color="error.main">Validation Failed</Typography>
            <Typography sx={{ mt: 1 }}>The link may be expired or invalid.</Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push("/login")}>Go to Login</Button>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default function ValidateEmailPage() {
  return (
    <Suspense fallback={<Box sx={{ display: "flex", justifyContent: "center", mt: 12 }}><CircularProgress /></Box>}>
      <ValidateEmailContent />
    </Suspense>
  );
}
