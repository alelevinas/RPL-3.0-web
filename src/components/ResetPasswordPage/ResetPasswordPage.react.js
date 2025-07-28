import React from "react";
import ResetPasswordForm from "./ResetPasswordForm.react";
import HomePage from "../HomePage/HomePage";
import { withState } from "../../utils/State";
import { useThemeContext } from "../../theme/ThemeContextProvider";

function ResetPasswordPage({ history, context }) {
  const { darkMode, setDarkMode } = useThemeContext();
  return (
    <HomePage
      Form={ResetPasswordForm}
      history={history}
      context={context}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    />
  );
}

export default withState(ResetPasswordPage);