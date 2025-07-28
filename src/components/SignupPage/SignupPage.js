import React from "react";
import HomePage from "../HomePage/HomePage";
import SignupForm from "./SignupForm";
import { useThemeContext } from "../../theme/ThemeContextProvider";

function SignupPage({ history }) {
  const { darkMode, setDarkMode } = useThemeContext();
  return (
    <HomePage
      Form={SignupForm}
      history={history}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    />
  );
}

export default SignupPage;