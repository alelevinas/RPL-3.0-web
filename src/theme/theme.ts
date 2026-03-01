import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#3a31d8" },
    secondary: { main: "#a0214c" },
    background: { default: "#f5f5f5", paper: "#ffffff" },
    text: { primary: "#333333", secondary: "#666666" },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6c63ff" },
    secondary: { main: "#ff6b9d" },
    background: { default: "#121212", paper: "#1e1e1e" },
    text: { primary: "#e0e0e0", secondary: "#aaaaaa" },
  },
  typography: lightTheme.typography,
  components: lightTheme.components,
});
