// @flow
import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { withStyles } from "@material-ui/core/styles";
import MultipleTabsEditor from "../MultipleTabsEditor/MultipleTabsEditor.react";
import type { SubmissionResult } from "../../types";

const styles = theme => ({
  codeEditor: {
    height: "500px",
    width: "100%",
    display: "flex",
    paddingBottom: "70px",
    flex: "1 0 auto",
  },
  borderPrimary: {
    border: `1px solid ${theme.palette.text.primary}`,
  },
  summaryText: {
    color: theme.palette.text.primary,
    fontWeight: "bold",
  },
});

type Props = {
  results: SubmissionResult,
  classes: any,
};

const CodeAccordion = (props: Props) => {
  const { results, classes } = props;
  const [expanded, setExpanded] = useState(false);

  const handleExpanded = (event: Event, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  const renderContent = () => {
    const {
      submited_code: submitedCode,
      activity_language: language,
    } = results;

    return (
      submitedCode && (
        <div className={classes.codeEditor}>
          <MultipleTabsEditor
            width="100%"
            initialCode={submitedCode}
            language={language}
            readOnly
          />
        </div>
      )
    );
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={handleExpanded}
      className={classes.borderPrimary}
    >
      <AccordionSummary
        id="code-header"
        aria-controls="code-content"
        expandIcon={<ExpandMoreIcon />}
      >
        <Typography variant="h5" component="p" className={classes.summaryText}>
          Resolución
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{renderContent()}</AccordionDetails>
    </Accordion>
  );
};

export default withStyles(styles)(CodeAccordion);