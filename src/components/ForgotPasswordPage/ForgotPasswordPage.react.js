// @flow
import React from "react";
import ForgotPasswordForm from "./ForgotPasswordForm.react";
import HomePage from "../HomePage/HomePage";
import { withState } from "../../utils/State";
import { useThemeContext } from "../../theme/ThemeContextProvider";

function ForgotPasswordPage({ history, context }) {
  const { darkMode, setDarkMode } = useThemeContext();
  return (
    <HomePage
      Form={ForgotPasswordForm}
      history={history}
      context={context}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    />
  );
}

export default withState(ForgotPasswordPage);