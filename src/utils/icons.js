// @flow
import React from "react";
import ThumbUp from "@material-ui/icons/ThumbUp";
import ThumbDown from "@material-ui/icons/ThumbDown";
import ThumbsUpDown from "@material-ui/icons/ThumbsUpDown";
import GradeIcon from '@material-ui/icons/Grade';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import AlarmOffIcon from "@material-ui/icons/AlarmOff";
import { green, red, yellow } from "@material-ui/core/colors";

type SubmissionResultStatusProps = {
  isFinalSolution: boolean,
  submissionStatus: string,
};

function SubmissionResultStatusIcon({
  isFinalSolution,
  submissionStatus,
}: SubmissionResultStatusProps) {
  const iconStyle = {
    marginRight: "9px",
    display: "inline-block",
  };
  if (isFinalSolution) {
    return <GradeIcon style={{ color: green[500] ,...iconStyle }} />;
  }
  if (submissionStatus === "SUCCESS") {
    return <ThumbUp style={{ color: green[500], ...iconStyle }} />;
  }
  if (submissionStatus === "FAILURE" ) {
    return <ThumbDown style={{ color: red[500], ...iconStyle }} />;
  }
  if (submissionStatus.includes("ERROR")) {
    return <ErrorOutlineIcon style={{ color: red[600], ...iconStyle }} />;
  }
  if (submissionStatus === "TIME_OUT") {
    return <AlarmOffIcon style={{ color: red[500], ...iconStyle }} />;
  }
  return <ThumbsUpDown style={{ color: yellow[800], ...iconStyle }} />;
}

export default SubmissionResultStatusIcon;
