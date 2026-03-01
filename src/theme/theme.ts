import { createTheme } from "@mui/material/styles";

// FIUBA Official Colors (Approximated)
const FIUBA_BLUE = "#005BAA";
const FIUBA_GOLD = "#FFC72C";
const FIUBA_NAVY = "#003057";

const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: { fontWeight: 700 },
  h2: { fontWeight: 700 },
  h3: { fontWeight: 600 },
  h4: { fontWeight: 600 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  button: { textTransform: "none", fontWeight: 500 },
};

const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        padding: "10px 24px",
        boxShadow: "none",
        textTransform: "none" as const,
        fontWeight: 600,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.12)",
          transform: "translateY(-1px)",
        },
      },
      containedPrimary: {
        backgroundColor: FIUBA_BLUE,
        "&:hover": {
          backgroundColor: FIUBA_NAVY,
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 20,
        boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.04)",
        border: "1px solid rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 20,
        backgroundImage: "none",
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(8px)",
        color: "#1E293B",
        boxShadow: "none",
        borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: 12,
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: FIUBA_BLUE },
    secondary: { main: FIUBA_GOLD },
    background: { default: "#F8FAFC", paper: "#FFFFFF" },
    text: { primary: "#1E293B", secondary: "#64748B" },
    divider: "#E2E8F0",
  },
  typography,
  components,
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3B82F6" },
    secondary: { main: FIUBA_GOLD },
    background: { default: "#0F172A", paper: "#1E293B" },
    text: { primary: "#F8FAFC", secondary: "#94A3B8" },
    divider: "#334155",
  },
  typography,
  components: {
    ...components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1E293B",
          backgroundImage: "none",
        },
      },
    },
  },
});
