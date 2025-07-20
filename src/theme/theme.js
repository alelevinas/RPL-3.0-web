import { createMuiTheme } from "@material-ui/core/styles";

export const lightTheme = createMuiTheme({
  palette: {
    primary: {
      main: "#3a31d8",
    },
    secondary: {
      main: "#a0214c",
    },
    background: {
      default: "#fbfbfe",
      paper: "#e5e5f6",
    },
    text: {
      primary: "#000000",
      secondary: "#040316",
    },
  },
});

export const darkTheme = createMuiTheme({
  palette: {
    primary: {
      main: "#4d46d6",
    },
    secondary: {
      main: "#b82757",
    },
    background: {
      default: "#010104",
      paper: "#141420",
    },
    text: {
      primary: "#ffffff",
      secondary: "#c6c4fd",
    },
    action: {
      disabledBackground: "#2b2b2b",
      hover: "#1f262b",
    },
  },
  overrides: {
    MuiButton: {
      root: {
        backgroundColor: "#4d46d6", // Primary button color
        color: "#ffffff", // White text
        "&:hover:not($disabled)": {
          backgroundColor: "#2c25b0", // Darker shade on hover
        },
        "&$disabled": {
          backgroundColor: "#16161c", // Disabled button color
          color: "#46464d",
        },
      },
      containedPrimary: {
        backgroundColor: "#4d46d6", // Primary button color
        color: "#ffffff", // White text
        "&:hover:not($disabled)": {
          backgroundColor: "#2c25b0",
        },
        "&$disabled": {
          backgroundColor: "#16161c", // Disabled button color
          color: "#46464d",
        },
      },
      containedSecondary: {
        backgroundColor: "#b82757", // Secondary button color
        color: "#ffffff", // White text
        "&:hover:not($disabled)": {
          backgroundColor: "#751837",
        },
        "&$disabled": {
          backgroundColor: "#16161c", // Disabled button color
          color: "#46464d",
        },
      },
      textPrimary: {
        color: "#ffffff",
      },
      textSecondary: {
        color: "#ffffff",
      },
    },
    MuiIconButton: {
      root: {
        color: "#716bee",
        "&:hover": {
          color: "#ffffff",
        },
      },
    },
    MuiListItemIcon: {
      root: {
        color: "#8b85f0"
      },
    },
    MuiAccordionSummary: {
      expandIcon: {
        color: "#c6c4fd",
        "&:hover": {
          color: "#ffffff",
        },
      },
    },
    MuiSelect: {
      icon: {
        color: "#c6c4fd", // light select icon color
      },
    },
    MuiTypography: {
      h1: { color: "#ffffff" }, h2: { color: "#ffffff" }, h3: { color: "#ffffff" },
      h4: { color: "#ffffff" }, h5: { color: "#ffffff" }, h6: { color: "#ffffff" },
      body1: { color: "#ffffff" }, body2: { color: "#ffffff" },
    },
    MuiLink: {
      root: {
        color: "#e7e6f8ff", // light link color
        "&:hover": {
          color: "#ffffff",
        },
      },
    },
    MuiDivider: {
      root: {
        backgroundColor: "#c6c4fd", // light divider color
      },
    },
    MuiInput: {
      underline: {
        "&:before": {
          borderBottomColor: "#c6c4fd", // light underline when not focused
        },
        "&:hover:not($disabled):not($focused):not($error):before": {
          borderBottomColor: "#ffffff", // white on hover
        },
        "&:after": {
          borderBottomColor: "#ffffff", // white when focused
        },
      },
    },
    MuiInputLabel: {
      root: {
        color: "#c6c4fd", // light label color
        "&$focused": {
          color: "#ffffff", // white when focused
        },
      }, 
    },
    MuiOutlinedInput: {
      root: {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#c6c4fd", // light border color
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#ffffff", // white on hover
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#ffffff", // white when focused
        },
      },
    },
    MuiFormLabel: {
      root: {
        color: "#c6c4fd", // light label color
      },
    },
    MuiAlert: {
      standardInfo: {
        backgroundColor: "#030e18",
        color: "#a6d5fa",
      },
      standardSuccess: {
        backgroundColor: "#071107",
        color: "#b7dfb9",
      },
      standardError: {
        backgroundColor: "#180605",
        color: "#ffbfba",
      },
      standardWarning: {
        backgroundColor: "#190f00",
        color: "#ffd599",
      },
    },
  },
});