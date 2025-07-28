// @flow
import React from "react";
import HomePage from "../HomePage/HomePage";
import ValidateEmailForm from "./ValidateEmailForm.react";
import { withState } from "../../utils/State";
import { useThemeContext } from "../../theme/ThemeContextProvider";

function ValidateEmailPage({ history, context }) {
  const { darkMode, setDarkMode } = useThemeContext();
  return (
    <HomePage
      Form={ValidateEmailForm}
      history={history}
      context={context}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    />
  );
}

export default withState(ValidateEmailPage);