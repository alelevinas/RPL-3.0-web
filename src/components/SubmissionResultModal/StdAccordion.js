// @flow
import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

type Props = {
  title: string,
  std: string,
  getColor(string): string,
};

const StdAccordion = (props: Props) => {
  const { title, std = "", getColor, startExpanded = false } = props;

  const [expanded, setExpanded] = useState(startExpanded);

  const handleExpanded = (event: Event, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  const renderContent = () => {
    return (
      <div>
        {std.split("\n").map((item, key) => (
          <Typography key={key} variant="subtitle1" color={getColor(item)} component="p">
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
      style={{
        border: "1px solid #000",
      }}
    >
      <AccordionSummary
        id="stdout-header"
        aria-controls="stdout-content"
        expandIcon={<ExpandMoreIcon style={{ color: "#000" }} />}
      >
        <Typography variant="h5" color="black" component="p" style={{ fontWeight: "bold" }}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{renderContent()}</AccordionDetails>
    </Accordion>
  );
};

export default StdAccordion;
