// @flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import coursesService from "../../services/coursesService";
import StudentStats from "./StudentStats";
import TeacherStats from "./TeacherStats";

import { withState } from "../../utils/State";

import ErrorNotification from "../../utils/ErrorNotification";
import StudentCategoryStats from "./StudentCategoryStats";
import CategoryStats from "./CategoryStats";
import ActivityStats from "./ActivityStats";
import Scoreboard from "./Scoreboard";

import Tag from "../commons/Tag";

const styles = theme => ({
  table: {
    minWidth: 650,
  },
  tableContainer: {
    width: "75%",
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
    alignItems: "center",
    justifyContent: "center",
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
  dashboardContainer: {
    width: "75%",
    alignItems: "center",
    justifyContent: "center",
    margin: `0 auto`,
    marginBottom: theme.spacing(5),
  },
});

const legendOpts = {
  display: true,
  fullWidth: false,
  position: "left",
  reverse: false,
  labels: {
    fontSize: 10,
  },
};

type Props = {
  match: any,
  classes: any,
  context: any,
};

type State = {
  error: { open: boolean, message: ?string },
};

class DashboardPage extends React.Component<Props, State> {
  state = {
    error: { open: false, message: null },
    current: 0,
  };

  componentDidMount() {
    this.loadScoreboad();
  }

  loadScoreboad() {
    const { courseId } = this.props.match.params;
    return coursesService
      .getScoreboard(courseId)
      .then(scoreboard => this.setState({ scoreboard }))
      .catch(() => {
        this.setState({
          error: {
            open: true,
            message: "Hubo un error al buscar el scoreboard. Por favor reintenta",
          },
        });
      });
  }

  handleChange(event, newValue) {
    this.setState({ current: newValue });
  }

  render() {
    const { classes, match, context } = this.props;
    const { permissions } = context;
    const { error, scoreboard } = this.state;

    const teacherStats = [
      <Scoreboard courseId={match.params.courseId} />,
      <TeacherStats courseId={match.params.courseId} />,
      <StudentCategoryStats className={classes.stats} courseId={match.params.courseId} />,
      <CategoryStats className={classes.stats} courseId={match.params.courseId} />,
      <ActivityStats className={classes.stats} courseId={match.params.courseId} />,
    ];

    return (
      <div>
        {error.open && <ErrorNotification open={error.open} message={error.message} />}
        <div className={classes.dashboardContainer}>
          {permissions.includes("user_manage") ? (
            <div>
              <Paper>
                <Tabs
                  value={this.state.current}
                  onChange={(event, newValue) => this.handleChange(event, newValue)}
                  indicatorColor="primary"
                  textColor="textPrimary"
                  variant="scrollable"
                >
                  <Tab label="Ranking" />
                  <Tab label="Envios por Fecha" />
                  <Tab label="Envios por Alumno" />
                  <Tab label="Envios por Categoría" />
                  <Tab label="Alumnos por Ejercicio"/>
                </Tabs>
              </Paper>
              {teacherStats[this.state.current]}
            </div>
          ) : (
            <div>
              <Typography variant="h5">
                Mis estadísticas
              </Typography>
              <StudentStats courseId={match.params.courseId} />
              <Typography variant="h5">
                Ranking
              </Typography>
              <Scoreboard courseId={match.params.courseId} />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withState(withStyles(styles)(DashboardPage));
