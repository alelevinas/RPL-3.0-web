import React, { createContext, useContext, useMemo } from "react";
import useDarkMode from "./useDarkMode";
import { lightTheme, darkTheme } from "./theme";

const ThemeContext = createContext();

export function ThemeContextProvider({ children }) {
  const [darkMode, setDarkMode] = useDarkMode();
  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}