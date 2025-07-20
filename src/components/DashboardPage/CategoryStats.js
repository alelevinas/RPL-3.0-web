// @flow
import React from "react";
import palette from "google-palette";
import { Bar } from "react-chartjs-2";
import { withStyles } from "@material-ui/core/styles";
import { withTheme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import Table from "@material-ui/core/Table";
import CircularProgress from "@material-ui/core/CircularProgress";
import TableCell from "@material-ui/core/TableCell";
import Paper from "@material-ui/core/Paper";

import { Grid } from "@material-ui/core";
import ErrorNotification from "../../utils/ErrorNotification";
import activitiesService from "../../services/activitiesService";
import statsService from "../../services/statsService";

import { withState } from "../../utils/State";

const _ = require("lodash");

const styles = theme => ({
  table: {
    // minWidth: 650,
  },
  tableContainer: {
    // width: "80%",
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
  error: { open: boolean, message: ?string },
  categories: any,
  categoryId: any,
  activitiesStats: any,
  loadingData: boolean,
  hasSearched: boolean,
};

class CategoryStats extends React.Component<Props, State> {
  state = {
    error: { open: false, message: null },
    categories: [],
    categoryId: undefined,
    activitiesStats: undefined,
    loadingData: false,
    hasSearched: false,
  };

  componentDidMount() {
    const { courseId } = this.props;
    this.setState({ loadingData: true });
    return activitiesService
      .getActivityCategories(courseId)
      .then(categories =>{
        this.setState({ categories: categories.sort((a, b) => (a.name > b.name ? 1 : -1)) });
        this.setState({ loadingData: false });
      });
  }

  searchCategoryStats() {
    const { courseId } = this.props;
    const { categoryId } = this.state;
    if (!categoryId) {
      return Promise.resolve();
    }
    this.setState({ loadingData: true });
    return statsService.getSubmissionStatsByActivity(courseId, categoryId).then(response => {
      this.setState({ activitiesStats: response });
      this.setState({ loadingData: false , hasSearched: true });
    });
  }

  renderActivities() {
    const { classes } = this.props;
    const { activitiesStats } = this.state;

    const { metadata, submissions_stats } = activitiesStats;
    const data = _.zipWith(submissions_stats, metadata, (stat, meta) => ({
      ...stat,
      ...meta,
    }));

    return (
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow key={0}>
              <TableCell key={1}>#</TableCell>
              <TableCell key={2}>Categoria</TableCell>
              <TableCell key={3}>Actividad</TableCell>
              <TableCell key={4}>Puntos</TableCell>
              <TableCell key={5}>Alumnos en proceso</TableCell>
              <TableCell key={6}>Alumnos exitosos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((activity, i) => (
              <TableRow>
                <TableCell key={1}>{i}</TableCell>
                <TableCell key={2}>{activity.category_name}</TableCell>
                <TableCell key={3}>{activity.name}</TableCell>
                <TableCell key={4}>{activity.points}</TableCell>
                <TableCell key={5}>{activity.total_submitters_without_successful_submissions}</TableCell>
                <TableCell key={6}>{activity.total_submitters_with_at_least_one_successful_submission}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  render() {
    const { classes } = this.props;
    const { error, activitiesStats, loadingData, hasSearched } = this.state;
    const { theme } = this.props;

    const colors = palette("sequential", 2).map(hex => `#${hex}`);
    const data =
      activitiesStats &&
      activitiesStats.submissions_stats.map(activity => activity.avg_error_submissions_by_student);
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
        {error.open && <ErrorNotification open={error.open} message={error.message} />}
        <br />
        <Grid container className={classes.filters} xs={12} spacing={3}>
          <Grid item xs={5}>
            <Autocomplete
              margin="normal"
              options={this.state.categories}
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
              onClick={() => this.searchCategoryStats()}
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
                ? this.renderActivities()
                : <></>
              )
            }
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withState(withStyles(styles)(withTheme(CategoryStats)));
