// @flow
import React from "react";
import palette from "google-palette";
import { Pie } from "react-chartjs-2";
import { withStyles } from "@material-ui/core/styles";
import { withTheme } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import statsService from "../../services/statsService";
import getText from "../../utils/messages";

import { withState } from "../../utils/State";

import ErrorNotification from "../../utils/ErrorNotification";

const styles = theme => ({
  table: {
    minWidth: 650,
  },
  tableContainer: {
    width: "80%",
  },
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
    marginTop: theme.spacing(2),
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
  gridItemWithBorder: {
    border: `1px dotted ${theme.palette.text.primary}`,
    borderRadius: 3,
    backgroundColor: theme.palette.background.paper,
  },
  calendarHeatmap: {
    marginTop: theme.spacing(2),
    width: "75%",
    fontFamily: "sans-serif",
  },
  container: {
    width: "100%",
  },
});


type Props = {
  courseId: number,
  match: any,
  classes: any,
};

type State = {
  error: { open: boolean, message: ?string },
};

class StudentStats extends React.Component<Props, State> {
  state = {
    error: { open: false, message: null },
  };

  componentDidMount() {
    this.loadStats();
  }

  loadStats() {
    let submissionsStats;
    const { courseId } = this.props;
    return statsService
      .getMySubmissionsStats(courseId)
      .then(response => {
        submissionsStats = response;
        return statsService.getMyActivitiesStats(courseId);
      })
      .then(activitiesStats => {
        this.setState({ activitiesStats, submissionsStats });
      })
      .catch(() => {
        this.setState({
          error: {
            open: true,
            message: "Hubo un error al buscar las stats. Por favor reintenta",
          },
        });
      });
  }

  render() {
    const { classes } = this.props;
    const { error, activitiesStats, submissionsStats } = this.state;
    const { theme } = this.props;
    const legendOpts = {
      display: true,
      fullWidth: false,
      position: "left",
      align: "start",
      reverse: false,
      labels: {
        fontColor: theme.palette.text.primary,
      },
    };
    // to re-render the pie charts when the theme changes:
    const pieKey = theme.palette.text.primary

    const activitiesArcColors = [
      "#a7a7a7",
      "#ffa726",
      "#4caf50",
    ];

    const dataActivities = {
      labels: ["Sin empezar", "Intentada", "Resuelta"],
      datasets: [
        {
          data: activitiesStats && [
            activitiesStats.amount_of_activities_not_started,
            activitiesStats.amount_of_activities_started,
            activitiesStats.amount_of_activities_solved,
          ],
          backgroundColor: activitiesArcColors,
        },
      ],
    };

    const submissionsArcColors = [
      "#6e1212",
      "#a83aa8",
      "#d84329",
      "#4caf50",
    ];

    const dataSubmissions = {
      labels: [
        getText("RUNTIME_ERROR"),
        getText("BUILD_ERROR"),
        getText("FAILURE"),
        getText("SUCCESS"),
      ],
      datasets: [
        {
          data: submissionsStats && [
            submissionsStats.submissions_with_runtime_errors,
            submissionsStats.submissions_with_build_errors,
            submissionsStats.submissions_with_failures,
            submissionsStats.successful_submissions,
          ],
          backgroundColor: submissionsArcColors,
        },
      ],
    };

    const scoresArcColors = [
      "#a7a7a7",
      "#4caf50",
    ];

    const dataScore = {
      labels: ["Pendientes", "Obtenidos"],
      datasets: [
        {
          data: activitiesStats && [
            activitiesStats.total_possible_points - activitiesStats.points_obtained,
            activitiesStats.points_obtained,
          ],
          backgroundColor: scoresArcColors,
        },
      ],
    };

    return (
      <Grid container xs={12} spacing={3} className={classes.plotContainerDiv}>
        {error.open && <ErrorNotification open={error.open} message={error.message} />}
        <Grid item xs={12} sm={12} md={8} lg={4} className={classes.gridItemWithBorder} >
          <Typography>Mis Actividades</Typography>
          <Pie key={`act-${pieKey}`} data={dataActivities} legend={legendOpts} />
        </Grid>
        <Grid item xs={12} sm={12} md={8} lg={4} className={classes.gridItemWithBorder} >
          <Typography>Mis Entregas</Typography>
          <Pie key={`sub-${pieKey}`} data={dataSubmissions} legend={legendOpts} />
        </Grid>
        <Grid item xs={12} sm={12} md={8} lg={4} className={classes.gridItemWithBorder} >
          <Typography>Mis Puntos</Typography>
          <Pie key={`score-${pieKey}`} data={dataScore} legend={legendOpts} />
        </Grid>
      </Grid>
    );
  }
}

export default withState(withStyles(styles)(withTheme(StudentStats)));
