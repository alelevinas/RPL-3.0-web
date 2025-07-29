// @flow
import React from "react";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import Fab from "@material-ui/core/Fab";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import { withState } from "../../utils/State";
import activitiesService from "../../services/activitiesService";
import ErrorNotification from "../../utils/ErrorNotification";
import type { Activity } from "../../types";
import SubmissionsSidePanel from "./SubmissionsSidePanel.react";
import ActivitiesTable from "./ActivitiesTable.react";
import SubmissionResultModal from "../SubmissionResultModal/TestResultsModal.react";
import CourseInfoMiniCard from "../GeneralCourseInfoCards/CourseInfoMiniCard";

const _ = require("lodash");

const styles = theme => ({
  tableContainerDiv: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    padding: "0px 30px 30px 30px",
  },
  innerTopBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: "11%",
    marginBottom: theme.spacing(5),
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
      flexDirection: "column",
      gap: theme.spacing(1),
    },
  },
});

type Props = {
  match: any,
  classes: any,
  history: any,
  context: any,
};

type State = {
  error: { open: boolean, message: ?string },
  activities: Array<Activity>,
  submissionsPanel: { isOpen: boolean, activityId: ?number },
  isSelectedResult: boolean,
  selectedSubmissionId: ?number,
  loadingData: boolean,
};

class ActivitiesPage extends React.Component<Props, State> {
  state = {
    error: { open: false, message: null },
    activities: [],
    submissionsPanel: { isOpen: false, activityId: null },
    isSelectedResult: false,
    selectedSubmissionId: null,
    loadingData: true,
  };

  componentDidMount() {
    const { match } = this.props;
    this.setState({ loadingData: true });
    activitiesService
      .getAllActivities(match.params.courseId)
      .then(response => {
        this.props.context.set("activities", response);
        this.setState({ activities: response, loadingData: false });
      })
      .catch(() => {
        this.setState({
          error: {
            open: true,
            message: "Hubo un error al obtener las actividades, Por favor reintenta",
          },
          loadingData: false,
        });
      });
  }

  // submissions sidepanel
  setOpenPanel(activityId: number) {
    this.setState({ submissionsPanel: { isOpen: true, activityId } });
  }

  // submissions sidepanel
  setClosePanel() {
    this.setState({ submissionsPanel: { isOpen: false, activityId: null } });
  }

  handleClickOnActivityTitle(event: any, activityId: number) {
    const { history, match } = this.props;
    history.push(`/courses/${match.params.courseId}/activities/${activityId}`);
  }

  // click on submission in the right SidePanel
  handleClickOnSubmission(submissionId: number, idx: number) {
    this.setState(prevState => ({
      submissionsPanel: { isOpen: false, activityId: prevState.submissionsPanel.activityId },
    }));
    setTimeout(() => {
      this.setState({
        isSelectedResult: true,
        selectedSubmissionId: submissionId,
      });
    }, 200);
  }

  handleCloseModal(e: Event) {
    e.preventDefault();
    this.setState({ isSelectedResult: false });
    setTimeout(() => {
      this.setState(prevState => ({
        submissionsPanel: { isOpen: true, activityId: prevState.submissionsPanel.activityId },
        selectedSubmissionId: null,
      }));
    }, 200);
  }

  render() {
    const { classes, match, context } = this.props;

    const {
      activities,
      error,
      submissionsPanel,
      isSelectedResult,
      selectedSubmissionId,
      loadingData,
    } = this.state;

    const activeActivities = _.filter(
      activities || (context && context.activities),
      activity => activity.active && !activity.deleted
    );
    const activitiesByCategory = _.groupBy(activeActivities, "category_name");

    return (
      <div>
        {error.open && <ErrorNotification open={error.open} message={error.message} />}

        {/* Se abre cuando alguien presiona el boton de VER ENTEGAS */}
        <SubmissionsSidePanel
          isOpen={submissionsPanel.isOpen}
          activityId={submissionsPanel.activityId}
          courseId={match.params.courseId}
          backdropClicked={() => this.setClosePanel()}
          onSelectSubmission={(submissionId, i) => this.handleClickOnSubmission(submissionId, i)}
          />

        {/* APARECE CUANDO SE QUIERE VER EL DETALLE DE UNA ENTEGA PASADA DESDE EL SIDE PANEL */}
        {isSelectedResult && (
          <SubmissionResultModal
          open={isSelectedResult}
          handleCloseModal={e => this.handleCloseModal(e)}
          showWaitingDialog
          activitySubmissionId={selectedSubmissionId}
            courseId={match.params.courseId}
          />
        )}

        <div className={classes.innerTopBar}>
          <CourseInfoMiniCard course={context.course} />          
        </div>

        {loadingData && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
            <CircularProgress />
          </div>
        )}

        {activeActivities &&
          Object.keys(activitiesByCategory)
          .sort((a, b) => (a > b ? 1 : -1))
          .map(category => (
            <div key={category} className={classes.tableContainerDiv}>
                <ActivitiesTable
                  activities={activitiesByCategory[category]}
                  setOpenPanel={activityId => this.setOpenPanel(activityId)}
                  handleCellClick={(event, activityId) =>
                    this.handleClickOnActivityTitle(event, activityId)
                  }
                  />
              </div>
            ))}
      </div>
    );
  }
}

export default withState(withStyles(styles)(ActivitiesPage));
