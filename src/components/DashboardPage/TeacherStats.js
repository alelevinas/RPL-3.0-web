// @flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CalendarHeatmap from "react-calendar-heatmap-fork";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import Paper from "@material-ui/core/Paper";
import CircularProgress from "@material-ui/core/CircularProgress";
import ReactTooltip from "react-tooltip";
import statsService from "../../services/statsService";

import { useThemeContext } from "../../theme/ThemeContextProvider";
import "./TeacherStatsHeatmapColors.css";

import { withState } from "../../utils/State";

import "react-calendar-heatmap-fork/dist/styles.css";

import ErrorNotification from "../../utils/ErrorNotification";

// TOOD Rename file

const _ = require("lodash");

const styles = theme => ({
  tableContainerDiv: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    padding: "0px 30px 30px 30px",
  },
  tableTitle: {
    alignSelf: "start",
    paddingLeft: "15px",
  },
  tableAvatarColumn: {
    width: theme.spacing(5),
  },
  tableIconsColumn: {
    width: theme.spacing(20),
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    fontSize: "0.75rem",
  },
  plotContainerDiv: {
    alignItems: "center",
    justifyContent: "center",
    padding: "0px 30px 30px 30px",
  },
  plotPaper: {
    width: "80%",
    height: "400px",
  },
  plot: {
    height: "100%",
  },
  calendarHeatmap: {
    marginTop: theme.spacing(2),
    fontFamily: "sans-serif",
    height: "250px",
    "& svg": {
      width: "100%",
      height: "100%",
    },
  },
  container: {
    width: "100%",
  },
  circularProgress: {
    position: "absolute",
    left: "50%",
    top: "65%",
  },
});

type Props = {
  courseId: number,
  match: any,
  classes: any,
};

type State = {
  error: { open: boolean, message: ?string },
  selectedDate: any,
  submissionsByDate: any,
  submissionsByStudent: any,
  loadingData: boolean,
};

class StudentStats
  extends React.Component<Props, State> {
  state = {
    error: { open: false, message: null },
    selectedDate: null,
    submissionsByDate: null,
    submissionsByStudent: null,
    loadingData: true,
  };

  componentDidMount() {
    const {courseId} = this.props;
    let submissionsByDate;
    this.setState({ loadingData: true });
    return statsService.getSubmissionStatsByDate(courseId).then(
      response => {
        submissionsByDate = response;
        return statsService.getSubmissionStatsByStudent(courseId);
      },
    ).then(
      submissionsByStudent => {
        this.setState({ submissionsByDate, submissionsByStudent });
        this.setState({ loadingData: false });
      },
    );
  }

  generateTooltipData(value) {
    if (!value || !value.count) {
      return { "data-tip": `No hay envios` };
    }
    return { "data-tip": `${value.date}: ${value.count} envios` };
  }

  getHeatmapColorClass(value, darkMode) {
    if (!value) {
      return darkMode 
              ? "custom-color-empty-dark" 
              : "custom-color-empty-light";
    }
    const level = Math.min(Math.floor(value.count / 50), 5); // <50 solved activities in a day is color 0 (we have 0->5 colors + the empty color)
    return darkMode
            ? `custom-color-dark-${level}`
            : `custom-color-light-${level}`;
  }

  getDynamicHeatmapOutlineColors(darkMode) {
    const borderColor = darkMode ? "#fff" : "#222";
    const labelColor = darkMode ? "#fff" : "#000";
    return `
      .react-calendar-heatmap rect {
        stroke: ${borderColor} !important;
        stroke-width: 0.5px !important;
      }
      .react-calendar-heatmap text {
        fill: ${labelColor} !important;
      }`;
  }

  handleDateClick(value) {
    const {courseId} = this.props;
    const {selectedDate} = this.state;
    this.setState({ error: { open: false, message: null } });
    
    if (!value) {
      return;
    }
    
    const {date} = value;
    
    if (selectedDate === date) {
      this.setState({ selectedDate: null, loadingData: true });
      statsService.getSubmissionStatsByStudent(courseId, null).then(
        submissionsByStudent => {
          this.setState({ submissionsByStudent, loadingData: false });
        },
      ).catch(
        error => {
          this.setState({
            error: { open: true, message: "Error al cargar los envios por alumno" },
            loadingData: false,
          });
        },
      );
      return;
    }
    
    this.setState({ selectedDate: date, loadingData: true });
    statsService.getSubmissionStatsByStudent(courseId, date).then(
      submissionsByStudent => {
        return this.setState({ submissionsByStudent, loadingData: false });
      },
    ).catch(
      error => {
        this.setState({
          error: { open: true, message: "Error al cargar los envios por alumno" },
          loadingData: false,
        });
      },
    );
  }

  renderStudentsTable() {
    const {classes} = this.props;
    const {submissionsByStudent} = this.state;
    
    const {metadata, submissions_stats} = submissionsByStudent;
    const data = _.zipWith(
      submissions_stats,
      metadata,
      (stat, meta) => ({ ...stat, ...meta }),
    );
    
    const dataOrderedByQuantityDesc = data.sort(
      (a, b) => a.total_submissions < b.total_submissions ? 1 : -1,
    );
    
    return (
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow key={0}>
              <TableCell key={1}>#</TableCell>
              <TableCell key={2}>Nombre</TableCell>
              <TableCell key={3}>Apellido</TableCell>
              <TableCell key={4}>Usuario</TableCell>
              <TableCell key={5}>Envios exitosos</TableCell>
              <TableCell key={6}>Envios totales</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataOrderedByQuantityDesc.map(
              (student, i) => <TableRow key={i}>
                <TableCell key={1}>{i}</TableCell>
                <TableCell key={2}>{student.name}</TableCell>
                <TableCell key={3}>{student.surname}</TableCell>
                <TableCell key={4}>{student.username}</TableCell>
                <TableCell key={5}>{student.successful_submissions}</TableCell>
                <TableCell key={6}>{student.total_submissions}</TableCell>
              </TableRow>,
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  render() {
    const {classes, context} = this.props;
    const {darkMode} = this.props;
    const {error, submissionsByDate, selectedDate, loadingData} = this.state;
    const {course} = context;
    
    if (loadingData) {
      return (
        <div>
          <CircularProgress className={classes.circularProgress} />
        </div>
      );
    }
    
    if (!submissionsByDate) {
      return <div />;
    }
    
    const {metadata, submissions_stats} = submissionsByDate;
    
    const data = _.zipWith(
      submissions_stats,
      metadata,
      (stat, meta) => ({ count: stat.total_submissions, date: meta.date }),
    );
    
    return (
      <div>
        {error.open &&
          <ErrorNotification open={error.open} message={error.message} />}
        <br />
        <Grid container xs={12}>
          <Grid item xs={12}>
            <Typography variant="h5">Totales del curso</Typography>
            <div className={classes.calendarHeatmap}>
              <style>
                {this.getDynamicHeatmapOutlineColors(darkMode)}
              </style>
              <CalendarHeatmap
                startDate={new Date(course.semester_start_date)}
                endDate={new Date(course.semester_end_date)}
                onClick={value => this.handleDateClick(value)}
                tooltipDataAttrs={value => this.generateTooltipData(value)}
                showWeekdayLabels
                values={data}
                firstWeekdayMonday
                classForValue={value => this.getHeatmapColorClass(value, darkMode)}
              />
              <ReactTooltip />
            </div>
          </Grid>
          <Grid item xs={12}>
            {selectedDate &&
              <Typography variant="h5">{`Fecha seleccionada: ${selectedDate}`}</Typography>}
            {!selectedDate &&
              <Typography variant="h5">Envios totales por alumno</Typography>}
            {loadingData &&
              <CircularProgress className={classes.circularProgress} />}
            {!loadingData && this.renderStudentsTable()}
          </Grid>
        </Grid>
      </div>
    );
  }
}

// Wrapper to inject darkMode
function StudentStatsWithTheme(props) {
  const { darkMode } = useThemeContext();
  return <StudentStats {...props} darkMode={darkMode} />;
}

export default withState(withStyles(styles)(StudentStatsWithTheme));
