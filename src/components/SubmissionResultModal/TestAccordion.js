import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Box from "@material-ui/core/Box";
import { withStyles } from "@material-ui/core/styles";
import IOTestSection from "./IOTestSection";
import UnitTestSection from "./UnitTestSection";
import ErrorMessageSection from "./ErrorMessageSection";
import type { SubmissionResult } from "../../types";

const styles = theme => ({
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

const TestAccordion = (props: Props) => {
  const { results, classes } = props;
  const [expanded, setExpanded] = useState(true);

  const handleExpanded = (event: Event, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  const renderContent = () => {
    const {
      io_tests_run_results: ioTestResults,
      unit_tests_run_results: unitTestResults,
      submission_status: status,
      exit_message: exitMessage,
    } = results;

    return (
      <>
        {ioTestResults && ioTestResults.length > 0 && (
          <Box mb={3}>
            <IOTestSection ioTestResults={ioTestResults} />
          </Box>
        )}
        {unitTestResults && unitTestResults.length > 0 && (
          <Box mb={3}>
            <UnitTestSection unitTestResults={unitTestResults} />
          </Box>
        )}
        {status.includes("ERROR") && (
          <Box mb={3}>
            <ErrorMessageSection exitMessage={exitMessage} />
          </Box>
        )}
      </>
    );
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={handleExpanded}
      className={classes.borderPrimary}
    >
      <AccordionSummary
        id="test-header"
        aria-controls="test-content"
        expandIcon={<ExpandMoreIcon />}
      >
        <Typography variant="h5" component="p" className={classes.summaryText}>
          Resultados
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{renderContent()}</AccordionDetails>
    </Accordion>
  );
};

export default withStyles(styles)(TestAccordion);