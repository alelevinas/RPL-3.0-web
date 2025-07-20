import React from "react";
import IconButton from "@material-ui/core/IconButton";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import { useThemeContext } from "../../theme/ThemeContextProvider";

export default function DarkModeToggle({ props }) {
  const { darkMode, setDarkMode } = useThemeContext();
  return (
    <IconButton
      color="inherit"
      onClick={() => setDarkMode(!darkMode)}
      aria-label="toggle dark mode"
      style={{ marginRight: 8 }}
    >
      {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
}