// @flow
import React from "react";
import palette from "google-palette";
import { Bar } from "react-chartjs-2";
import { withStyles } from "@material-ui/core/styles";
import { withTheme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import Paper from "@material-ui/core/Paper";
import { Grid } from "@material-ui/core";
import SubmissionsSidePanel from "../ActivitiesPage/SubmissionsSidePanel.react";
import SubmissionResultModal from "../SubmissionResultModal/TestResultsModal.react";

import coursesService from "../../services/coursesService";
import activitiesService from "../../services/activitiesService";
import statsService from "../../services/statsService";

import { withState } from "../../utils/State";

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
    width: "75%",
    fontFamily: "sans-serif",
  },
  container: {
    width: "100%",
  },
  filters: {
    display: "flex",
    alignItems: "center",
  },
  search: {
    margin: "0 auto",
    display: "flex",
  },
  status: {
    height: theme.spacing(1.5),
    width: theme.spacing(1.5),
    borderRadius: "50%",
    display: "inline-block",
  },
  activeStatus: {
    backgroundColor: theme.palette.success.main,
  },
  inactiveStatus: {
    backgroundColor: theme.palette.error.main,
  },
  tableRow: {
    cursor: "pointer",
  },
  circularProgress: {
    position: "absolute",
    left: "50%",
    top: "50%",
  },
});


type Props = {
  courseId: number,
  match: any,
  classes: any,
};

type State = {
  students: Array<any>,
  categories: Array<any>,
  activitiesStats: any,
  studentId: ?number,
  categoryId: ?number,
  submissionsPanel: { isOpen: boolean, activityId: ?number },
  selectedSubmissionId: ?number,
  loadingData: boolean,
  hasSearched: boolean,
};

class StudentCategoryStats extends React.Component<Props, State> {
  state = {
    students: [],
    categories: [],
    activitiesStats: null,
    studentId: undefined,
    categoryId: undefined,
    submissionsPanel: { isOpen: false, activityId: null },
    selectedSubmissionId: null,
    loadingData: false,
    hasSearched: false,
  };

  componentDidMount() {
    const { courseId } = this.props;
    let students;
    return coursesService
      .getAllStudentsByCourseId(courseId)
      .then(response => {
        students = response;
      })
      .then(() => activitiesService.getActivityCategories(courseId))
      .then(categories =>
        this.setState({
          students: students.sort((a, b) => (a.name > b.name ? 1 : -1)),
          categories: categories.sort((a, b) => (a.name > b.name ? 1 : -1)),
        })
      );
  }

  searchStudentCategoryStats() {
    const { courseId } = this.props;
    const { studentId, categoryId, loadingData } = this.state;
    if (!studentId) {
      return Promise.resolve();
    }
    this.setState({ loadingData: true, hasSearched: true });
    return statsService
      .getSubmissionStatsByActivity(courseId, categoryId, studentId)
      .then(response => {
        this.setState({ loadingData: false });
        this.setState({ activitiesStats: response });
      });
  }

  // START CONTROLL OF THE SUBMISSIONS PANEL

  handleOnActivityClick(activityId: number) {
    this.setOpenPanel(activityId);
  }

  // submissions sidepanel
  setOpenPanel(activityId: number) {
    this.setState({ submissionsPanel: { isOpen: true, activityId } });
  }

  // submissions sidepanel
  setClosePanel() {
    this.setState({ submissionsPanel: { isOpen: false, activityId: null } });
  }

  // click on submission in the right SidePanel
  handleClickOnSubmission(submissionId: number, idx: number) {
    this.setState(prevState => ({
      submissionsPanel: { isOpen: false, activityId: prevState.submissionsPanel.activityId },
    }));
    setTimeout(() => {
      this.setState({
        selectedSubmissionId: submissionId,
      });
    }, 200);
  }

  handleCloseModal(e: Event) {
    e.preventDefault();
    this.setState({ selectedSubmissionId: null });
    setTimeout(() => {
      this.setState(prevState => ({
        submissionsPanel: { isOpen: true, activityId: prevState.submissionsPanel.activityId },
        selectedSubmissionId: null,
      }));
    }, 200);
  }

  // END CONTROLL OF THE SUBMISSIONS PANEL

  renderActivities(activitiesStats: any) {
    const { classes } = this.props;

    const { metadata, submissions_stats } = activitiesStats;
    const data = _.zipWith(submissions_stats, metadata, (stat, meta) => ({
      ...stat,
      ...meta,
    }));

    const dataOrderedByActivityName = data.sort((a, b) => (a.name > b.name ? 1 : -1));

    return (
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow key={0}>
              <TableCell key={1}>#</TableCell>
              <TableCell key={2}>Categoria</TableCell>
              <TableCell key={3}>Actividad</TableCell>
              <TableCell key={4}>Puntos</TableCell>
              <TableCell key={5}>Envios</TableCell>
              <TableCell key={6}>Resuelto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataOrderedByActivityName.map((activity, i) => (
              <TableRow
                key={i}
                hover
                onClick={() => this.handleOnActivityClick(activity.id)}
                className={classes.tableRow}
              >
                <TableCell key={1}>{i}</TableCell>
                <TableCell key={2}>{activity.category_name}</TableCell>
                <TableCell key={3}>{activity.name}</TableCell>
                <TableCell key={4}>{activity.points}</TableCell>
                <TableCell key={5}>{activity.total_submissions}</TableCell>
                <TableCell key={6} align="center">
                  <span
                    className={`${classes.status} ${
                      activity.successful_submissions ? classes.activeStatus : classes.inactiveStatus
                    }`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  render() {
    const { classes, courseId } = this.props;
    const {
      activitiesStats,
      students,
      categories,
      submissionsPanel,
      selectedSubmissionId,
      studentId,
      loadingData,
      hasSearched,
    } = this.state;
    const { theme } = this.props;

    const colors = palette("sequential", 2).map(hex => `#${hex}`);
    const data =
      activitiesStats && activitiesStats.submissions_stats.map(activity => activity.total_submissions);
    const dataScore = {
      labels: activitiesStats && activitiesStats.metadata.map(activity => activity.name),
      datasets: [
        {
          backgroundColor: colors[0],
          borderColor: colors[1],
          borderWidth: 1,
          data,
        },
      ],
    };

    const barChartOpts = {
      legend: {
        display: false,
      },
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 32,
        },
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              min: 0,
              max: Math.max(...(data || [])) + 1,
              fontColor: theme.palette.text.primary,
            },
            gridLines: {
              color: theme.palette.text.secondary,
              borderDash: [4, 4],
              zeroLineColor: theme.palette.text.secondary,
            },
          }
        ],
        xAxes: [
          {
            display: false,
          },
        ],
      },
    }


    return (
      <div>
        {/* Se abre cuando alguien presiona el boton de VER ENTEGAS */}
        <SubmissionsSidePanel
          isOpen={submissionsPanel.isOpen}
          activityId={submissionsPanel.activityId}
          courseId={courseId}
          studentId={studentId}
          backdropClicked={() => this.setClosePanel()}
          onSelectSubmission={(submissionId, i) => this.handleClickOnSubmission(submissionId, i)}
        />

        {/* APARECE CUANDO SE QUIERE VER EL DETALLE DE UNA ENTEGA PASADA DESDE EL SIDE PANEL */}
        {selectedSubmissionId !== null && (
          <SubmissionResultModal
            open={selectedSubmissionId !== null}
            handleCloseModal={e => this.handleCloseModal(e)}
            showWaitingDialog
            showActivityDescription
            activitySubmissionId={selectedSubmissionId}
            courseId={courseId}
          />
        )}
        <br />
        <Grid container className={classes.filters} xs={12} spacing={3}>
          <Grid item xs={5}>
            <Autocomplete
              margin="normal"
              options={students}
              id="student"
              name="student"
              autoComplete="student"
              onChange={(event, newValue) => this.setState({ studentId: newValue ? newValue.id : undefined })}
              getOptionLabel={user => `${user.name} ${user.surname} (${user.username})`}
              renderInput={params => <TextField {...params} label="Alumno" margin="normal" />}
            />
          </Grid>
          <Grid item xs={5}>
            <Autocomplete
              margin="normal"
              options={categories}
              id="category"
              name="category"
              autoComplete="category"
              onChange={(event, newValue) => this.setState({ categoryId: newValue ? newValue.id : undefined })}
              getOptionLabel={category => `${category.name}`}
              renderInput={params => <TextField {...params} label="Categoria" margin="normal" />}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              className={classes.search}
              color="primary"
              onClick={() => this.searchStudentCategoryStats()}
            >
              Buscar
            </Button>
          </Grid>
          <Grid item xs={12}>
            {loadingData && <CircularProgress className={classes.circularProgress} />}
            {!loadingData && (
              <div>
                {activitiesStats && activitiesStats.submissions_stats && activitiesStats.submissions_stats.length > 0 ? (
                  <Bar
                    data={dataScore}
                    options={barChartOpts}
                  />
                ) : (
                  hasSearched && (
                    <Paper style={{ padding: 24, textAlign: "center" }}>
                      No hay datos para los filtros seleccionados.
                    </Paper>
                  )
                )}
              </div>
            )}
          </Grid>
          <Grid item xs={12}>
            {!loadingData &&
              (
                activitiesStats && activitiesStats.submissions_stats && activitiesStats.submissions_stats.length > 0
                ? this.renderActivities(activitiesStats)
                : <></>
              )
            }
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withState(withStyles(styles)(withTheme(StudentCategoryStats)));
