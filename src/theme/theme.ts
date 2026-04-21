import { createTheme } from "@mui/material/styles";
import { lightTokens, darkTokens } from "./tokens";

const typography = {
  fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", "Inter", sans-serif',
  h1: { fontWeight: 800 },
  h2: { fontWeight: 800 },
  h3: { fontWeight: 700 },
  h4: { fontWeight: 700, letterSpacing: "-0.5px" },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  button: { textTransform: "none" as const, fontWeight: 700 },
};

const baseComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: "8px",
        boxShadow: "none",
        textTransform: "none" as const,
        fontWeight: 700,
        "&:hover": { boxShadow: "none" },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: "12px",
        boxShadow: "none",
        overflow: "hidden",
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
        borderRadius: "12px",
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: lightTokens.blue },
    success: { main: lightTokens.green },
    error: { main: lightTokens.red },
    warning: { main: lightTokens.amber },
    background: { default: lightTokens.bg, paper: lightTokens.surface },
    text: { primary: lightTokens.text, secondary: lightTokens.textMuted },
    divider: lightTokens.border,
  },
  typography,
  components: {
    ...baseComponents,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          color: lightTokens.text,
          boxShadow: "none",
          borderBottom: `1px solid ${lightTokens.border}`,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          transition: "background-color 0.2s, color 0.2s",
        },
        p: { textWrap: "pretty" },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: darkTokens.blue },
    success: { main: darkTokens.green },
    error: { main: darkTokens.red },
    warning: { main: darkTokens.amber },
    background: { default: darkTokens.bg, paper: darkTokens.surface },
    text: { primary: darkTokens.text, secondary: darkTokens.textMuted },
    divider: darkTokens.border,
  },
  typography,
  components: {
    ...baseComponents,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(26,26,30,0.95)",
          backdropFilter: "blur(10px)",
          color: darkTokens.text,
          boxShadow: "none",
          borderBottom: `1px solid ${darkTokens.border}`,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          transition: "background-color 0.2s, color 0.2s",
        },
        p: { textWrap: "pretty" },
      },
    },
  },
});
