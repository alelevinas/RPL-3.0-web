// @flow
import React from "react";
import Typography from "@material-ui/core/Typography";
import DialogContentText from "@material-ui/core/DialogContentText";
import { Alert } from "@material-ui/lab";
import ReactDiffViewer from "react-diff-viewer";
import type { IOTestRunResult } from "../../types";
import { useThemeContext } from "../../theme/ThemeContextProvider";

type Props = {
  ioTestResults: Array<IOTestRunResult>,
};

const IOTestSection = (props: Props) => {
  const { ioTestResults } = props;
  const { darkMode }  = useThemeContext();

  const renderContent = () => {
    return ioTestResults.map((ioResult, idx) => {
      const {
        id,
        name,
        expected_output: expectedOutput,
        run_output: runOutput
      } = ioResult;

      const result = expectedOutput === runOutput ? "success" : "error";

      const diffViewerStyle = {
        variables: {
          light: {
            diffViewerTitleBackground: '#fafbfc',
            diffViewerTitleColor: '#212529',
          },
          dark: {
            diffViewerTitleBackground: '#2f323e',
            diffViewerTitleColor: '#f8f9fa',
          },
        },
      };


      const separateNewLines = str => str.replace(/(\n)\1+/g, str => str.split("").join(" "));
      // Hack to fix issue #97 where '\n\n' is not displayed in diff viewer correctly but '\n \n' does

      return (
        <DialogContentText key={idx} id="scroll-dialog-description" tabIndex={-1} component="div">
          <Alert severity={result}>{name}</Alert>
          <ReactDiffViewer
            styles={diffViewerStyle}
            key={id}
            leftTitle="Resultado de la ejecución"
            oldValue={separateNewLines(runOutput)}
            rightTitle="Resultado esperado"
            newValue={separateNewLines(expectedOutput)}
            showDiffOnly={false}
            splitView
            useDarkTheme={darkMode}
          />
        </DialogContentText>
      );
    });
  };

  return (
    <>
      <Typography variant="h5" color="black" component="p">
        Tests de entrada/salida:
      </Typography>
      {renderContent()}
    </>
  );
};

export default IOTestSection;
