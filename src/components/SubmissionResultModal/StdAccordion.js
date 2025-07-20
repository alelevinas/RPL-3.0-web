// @flow
import React, { useState } from "react";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

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
  classes: any,
  title: string,
  std: string,
  getColor(string): string,
  startExpanded?: boolean,
};

const StdAccordion = (props: Props) => {
  const { classes, title, std = "", getColor, startExpanded = false } = props;

  const [expanded, setExpanded] = useState(startExpanded);

  const handleExpanded = (event: Event, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  const renderContent = () => {
    return (
      <div>
      {std.split("\n").map((item, key) => (
        <Typography
          key={key}
          variant="subtitle1"
          component="p"
          style={{ color: getColor(item) }}
        >
        {item}
        </Typography>
      ))}
      </div>
    );
  };

  return (
    <Accordion 
      expanded={expanded} 
      onChange={handleExpanded} 
      className={classes.borderPrimary}
    >
      <AccordionSummary
        id="stdout-header"
        aria-controls="stdout-content"
        expandIcon={<ExpandMoreIcon />}
      >
        <Typography variant="h5" component="p" className={classes.summaryText}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{renderContent()}</AccordionDetails>
    </Accordion>
  );
};

export default withStyles(styles)(StdAccordion);
