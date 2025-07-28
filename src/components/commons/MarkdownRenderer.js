// @flow
import React from "react";
import MarkdownView from "react-showdown";
import "github-markdown-css";
import { useThemeContext } from "../../theme/ThemeContextProvider";

type Props = {
  content: string,
};


export default function MarkdownRenderer(props: Props) {
  const { content } = props;
  const { theme } = useThemeContext();

  return (
    <div
      className="markdown-body"
      style={{
        margin: "30px",
        color: theme.palette.text.primary,
      }}
    >
      <MarkdownView markdown={content} />
    </div>
  );
}