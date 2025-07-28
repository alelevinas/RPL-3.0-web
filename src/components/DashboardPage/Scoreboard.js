// @flow
import React from "react";
import palette from "google-palette";
import { Pie } from "react-chartjs-2";
import { withStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Table from "@material-ui/core/Table";
import Paper from "@material-ui/core/Paper";
import TableContainer from "@material-ui/core/TableContainer";
import CircularProgress from "@material-ui/core/CircularProgress";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import { Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import submissionsService from "../../services/submissionsService";
import coursesService from "../../services/coursesService";
import ativitiesService from "../../services/activitiesService";
import StudentStats from "./StudentStats";
import TeacherStats from "./TeacherStats";


import { withState } from "../../utils/State";

import ErrorNotification from "../../utils/ErrorNotification";
import StudentCategoryStats from "./StudentCategoryStats";
import CategoryStats from "./CategoryStats";

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
  filters: {
    display: "flex",
    alignItems: "center",
  },
  currentUserRow: {
    "&.Mui-selected, &.Mui-selected:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  circularProgress: {
    position: "absolute",
    left: "50%",
    top: "50%",
  },
});

type Props = {
  match: any,
  classes: any,
  context: any,
};

type State = {
  error: { open: boolean, message: ?string },
  loadingData: boolean,
};

class Scoreboard extends React.Component<Props, State> {
  state = {
    error: { open: false, message: null },
    current: 0,
    loadingData: true,
  };

  componentDidMount() {
    this.loadScoreboad();
  }

  loadScoreboad() {
    const { courseId } = this.props;
    this.setState({ loadingData: true });
    return coursesService
      .getScoreboard(courseId)
      .then((scoreboard) => {
          this.setState({ scoreboard });
          this.setState({ loadingData: false });
      })
      .catch(() => {
        this.setState({
          error: {
            open: true,
            message: "Hubo un error al buscar el scoreboard. Por favor reintenta",
          },
          loadingData: false,
        });
      });
  }

  // eslint-disable-next-line class-methods-use-this
  renderHeadRow(classes: any) {
    const cells = [
      <TableCell key={1}>#</TableCell>,
      <TableCell key={2} className={classes.tableAvatarColumn} />,
      <TableCell key={3}>Alumno</TableCell>,
      <TableCell key={4} align="right">
        Score
      </TableCell>,
      <TableCell key={5} align="right">
        # Actividades Completadas
      </TableCell>,
    ];
    return <TableRow key={0}>{cells}</TableRow>;
  }

  // eslint-disable-next-line class-methods-use-this
  renderStudentRow(student: any, classes: any) {
    const { profile } = this.props.context;

    const cells = [
      <TableCell key={1} align="left">
        {student.position}
      </TableCell>,
      <TableCell key={2} component="th" scope="row">
        <Avatar src={student.img_uri}>
          {student.name[0]}
          {student.surname[0]}
        </Avatar>
      </TableCell>,
      <TableCell key={3} component="th" scope="row">
        {`${student.name} ${student.surname}`}
      </TableCell>,
      <TableCell key={4} align="right">
        {student.total_score}
      </TableCell>,
      <TableCell key={5} align="right">
        {student.successful_activities_count}
      </TableCell>,
    ];

    const isCurrentUser = profile.id === student.id;
    return (
      <TableRow
        className={isCurrentUser ? classes.currentUserRow : ""}
        selected={isCurrentUser}
      >
      {cells}
      </TableRow>
    );
  }

  // eslint-disable-next-line class-methods-use-this
  renderScoreBoard(students: Array<Student>, classes: any) {
    return (
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>{this.renderHeadRow(classes)}</TableHead>
          <TableBody>
            {students.map((student, i) =>
              this.renderStudentRow(Object.assign(student, { position: i + 1 }), classes)
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  render() {
    const { classes, match, context } = this.props;
    const { scoreboard, loadingData } = this.state;

    
    if (loadingData) {
          return (
            <div>
              <CircularProgress className={classes.circularProgress} />
            </div>
          );
        }
    return (
      <div>
        <br />
        <Grid container className={classes.filters} xs={12}>
          <Grid item xs={12}>
            {scoreboard && this.renderScoreBoard(scoreboard, classes)}
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withState(withStyles(styles)(Scoreboard));
