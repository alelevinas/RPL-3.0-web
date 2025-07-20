import React from "react";
import LoginForm from "./LoginForm";
import HomePage from "../HomePage/HomePage";
import { withState } from "../../utils/State";
import { useThemeContext } from "../../theme/ThemeContextProvider";

function LoginPage({ history, context }) {
  const { darkMode, setDarkMode } = useThemeContext();
  return (
    <HomePage
      Form={LoginForm}
      history={history}
      context={context}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    />
  );
}

export default withState(LoginPage);