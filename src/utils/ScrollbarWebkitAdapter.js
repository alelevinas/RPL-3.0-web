import React from "react";
import { useThemeContext } from "../theme/ThemeContextProvider";

const ScrollbarStyles = () => {
  const { darkMode } = useThemeContext();
  const thumb = darkMode ? "#b0aee0" : "#42414b";
  const thumbHover = darkMode ? "#7c79b8" : "#222222";
  const track = darkMode ? "#181824" : "#adadca";

  const style = `
    ::-webkit-scrollbar {
      width: 12px;
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: ${thumb};
      border-radius: 8px;
      transition: background 0.2s;
      border: 2px solid ${track};
    }
    ::-webkit-scrollbar-thumb:hover {
      background: ${thumbHover};
    }
    ::-webkit-scrollbar-track {
      background: ${track};
      border-radius: 8px;
    }
    ::-webkit-scrollbar-corner {
      background: rgba(0,0,0,0.3);
    }
  `;

  return <style>{style}</style>;
};

export default ScrollbarStyles;