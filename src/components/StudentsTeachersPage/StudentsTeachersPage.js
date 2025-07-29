// @flow
import React from "react";
import Table from "@material-ui/core/Table";
import Avatar from "@material-ui/core/Avatar";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { withStyles } from "@material-ui/core/styles";
import CheckIcon from "@material-ui/icons/Check";
import EditIcon from "@material-ui/icons/Edit";
import SaveIcon from "@material-ui/icons/Save";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";
import { MenuItem } from "@material-ui/core";
import { withState } from "../../utils/State";
import coursesService from "../../services/coursesService";
import authenticationService from "../../services/authenticationService";
import ErrorNotification from "../../utils/ErrorNotification";
import ConfirmDeleteStudentModal from "./ConfirmDeleteStudentModal.react";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import FormControl from "@material-ui/core/FormControl";
import CircularProgress from "@material-ui/core/CircularProgress";


import type { Student } from "../../types";

const _ = require("lodash");

const styles = theme => ({
  dashboardContainer: {
    width: "75%",
    alignItems: "center",
    justifyContent: "center",
    margin: `0 auto`,
    marginBottom: theme.spacing(5),
  },
  filtersContainer: {
    display: "flex",
    gap: 16,
    marginBottom: 32,
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  table: {
    minWidth: 650,
  },
  tableContainer: {
    width: "100%",
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
    width: theme.spacing(16),
  },
  largeTableIconsColumn: {
    width: theme.spacing(26),
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    fontSize: "0.75rem",
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
  students: Array<Student>,
  teachers: Array<Student>,
  refreshStudentsNotification: boolean,
  deleteModal: { open: boolean, studentId: ?number },
  editMode: boolean,
  currentUserId: string,
  currentUserRole: ?{ id: number, name: string },
  roles: Array<{ id: number, name: string }>,
  tabIndex: number, // 0: students, 1: teachers, 2: pending users
  searchNameQuery: string,
  searchIdQuery: string,
  searchEmailQuery: string,
  currentlyModifyingUserWithId: ?number,
};

class StudentsTeachersPage extends React.Component<Props, State> {
  state = {
    error: { open: false, message: null },
    students: [],
    teachers: [],
    refreshStudentsNotification: false,
    editMode: false,
    currentUserId: "",
    currentUserRole: undefined,
    roles: [],
    deleteModal: { open: false, studentId: null },
    tabIndex: 0, // 0: students, 1: teachers, 2: pending users
    searchNameQuery: "",
    searchIdQuery: "",
    searchEmailQuery: "",
    currentlyModifyingUserWithId: null,
  };

  componentDidMount() {
    if (this.props.location && this.props.location.state && this.props.location.state.fromNotification) {
      this.setState({ tabIndex: 2 });
    }
    this.loadStudents();
    this.loadRoles();
  }

  loadStudents() {
    const { match } = this.props;
    coursesService
      .getAllStudentsAndTeachersByCourseId(match.params.courseId)
      .then(response => {
        const students = response.filter(user => user.role === "student");
        const teachers = response.filter(user => user.role === "course_admin");
        this.setState({ students, teachers });
      })
      .catch(() => {
        this.setState({
          error: {
            open: true,
            message: "Hubo un error al obtener la lista de usuarios, Por favor reintenta",
          },
        });
      });
  }

  loadRoles() {
    authenticationService.getRoles().then(roles => {
      this.setState({ roles });
    });
  }

  handleAcceptStudent(courseId: number, userId: number, event: any) {
    this.setState({ currentlyModifyingUserWithId: userId });
    coursesService
      .acceptStudent(courseId, userId)
      .then(() => this.loadStudents())
      .then(() =>
        this.setState(prevState => ({
          refreshStudentsNotification: !prevState.refreshStudentsNotification,
          currentlyModifyingUserWithId: null,
        }))
      ).catch(() => {
        this.setState({
          error: {
            open: true,
            message: "Hubo un error al aceptar al estudiante, Por favor reintenta",
          },
          currentlyModifyingUserWithId: null,
        });
      });
  }

  handleClickDeleteStudent(studentId: number) {
    this.setState({ deleteModal: { open: true, studentId } });
  }

  handleDeleteStudentConfirmed() {
    const { deleteModal } = this.state;
    const prevStudentId = deleteModal.studentId;
    if (!prevStudentId) {
      this.setState({ deleteModal: { open: false, studentId: null } });
      return;
    }
    this.setState({ deleteModal: { open: false, studentId: prevStudentId } });
    this.setState({ currentlyModifyingUserWithId: prevStudentId });
    const { match } = this.props;
    coursesService
      .deleteStudent(match.params.courseId, prevStudentId)
      .then(() => this.loadStudents())
      .then(() => {
          this.setState(prevState => ({
            refreshStudentsNotification: !prevState.refreshStudentsNotification,
          }));
          this.setState({ deleteModal: { open: false, studentId: null } });
          this.setState({ currentlyModifyingUserWithId: null });
        }
      ).catch(() => {
        this.setState({
          error: {
            open: true,
            message: "Hubo un error al eliminar al estudiante, Por favor reintenta",
          },
          deleteModal: { open: false, studentId: null },
          currentlyModifyingUserWithId: null,
        });
      });
  }

  handleCancelDeleteStudent() {
    this.setState({ deleteModal: { open: false, studentId: null } });
  }

  handleEditStudent(courseId: Number, userId: number, event: any) {
    this.setState(prevState => ({ editMode: true, currentUserId: userId }));
  }

  handleSaveStudent(courseId: Number, userId: number, event: any) {
    if (!this.state.currentUserRole) {
      return this.setState(prevState => ({
        editMode: false,
        currentUserId: "",
        currentUserRole: undefined,
      }));
    }

    this.setState({ currentlyModifyingUserWithId: userId });
    coursesService
      .changeStudentRole(courseId, userId, this.state.currentUserRole.name)
      .then(() => this.loadStudents())
      .then(() => {
        this.setState(prevState => ({
          editMode: false,
          currentUserId: "",
          currentUserRole: undefined,
        }))
        this.setState({ currentlyModifyingUserWithId: null })
      }).catch(() => {
        this.setState({
          error: {
            open: true,
            message: "Hubo un error al guardar el rol del usuario, Por favor reintenta",
          },
          editMode: false,
          currentUserId: "",
          currentUserRole: undefined,
          currentlyModifyingUserWithId: null,
        });
      });
  }

  handleCloseModal() {
    this.setState({ editMode: false });
  }

  handleSelectRole(event) {
    this.setState({ currentUserRole: event.target.value });
  }

  handleTabChange(event, newValue) {
    this.setState({ tabIndex: newValue });
  }

  handleFilterChange(field, value) {
    this.setState({ [field]: value });
  }

  getFilteredUserIdsByQueries(users) {
    const { searchNameQuery, searchIdQuery, searchEmailQuery } = this.state;
    return users
      .filter(user => {
        const matchesName =
          !searchNameQuery ||
          `${user.name} ${user.surname}`.toLowerCase().includes(searchNameQuery.toLowerCase());
        const matchesId =
          !searchIdQuery || (user.student_id && user.student_id.toString().includes(searchIdQuery));
        const matchesEmail =
          !searchEmailQuery || (user.email && user.email.toLowerCase().includes(searchEmailQuery.toLowerCase()));
        return matchesName && matchesId && matchesEmail;
      })
      .map(user => user.id);
  }

  renderRolesOptions() {
    const { roles } = this.state;
    return _.map(roles, role => (
      <MenuItem key={role.id} value={role}>
        {role.name}
      </MenuItem>
    ));
  }

  renderHeadRow(classes: any) {
    const cells = [
      <TableCell key={1} className={classes.tableAvatarColumn} />,
      <TableCell key={2}>Usuario</TableCell>,
      <TableCell key={3} align="right">
        Email
      </TableCell>,
      <TableCell key={4} align="right">
        Id
      </TableCell>,
      <TableCell key={5} align="right">
        Rol
      </TableCell>,
    ];

    const { context } = this.props;
    if (context.permissions && context.permissions.includes("user_manage")) {
      const extraCells = [
        <TableCell key={7} className={classes.tableIconsColumn} />,
      ];

      cells.push(...extraCells);
    }

    return <TableRow key={0}>{cells}</TableRow>;
  }

  renderStudentRow(student: any, classes: any, showAcceptButton = false) {
    const cells = [
      <TableCell key={1} component="th" scope="row">
        <Avatar src={student.img_uri} className={classes.avatar}>
          {student.name[0]}
          {student.surname[0]}
        </Avatar>
      </TableCell>,
      <TableCell key={2} component="th" scope="row">
        {`${student.name} ${student.surname}`}
      </TableCell>,
      <TableCell key={3} align="right">
        {student.email}
      </TableCell>,
      <TableCell key={4} align="right">
        {student.student_id}
      </TableCell>,
      <TableCell key={5} align="right">
        {this.state.editMode && this.state.currentUserId === student.id ? (
          <Select id="role" name="role" onChange={event => this.handleSelectRole(event)}>
            {this.renderRolesOptions()}
          </Select>
        ) : (
          student.role
        )}
      </TableCell>,
    ];

    const { currentlyModifyingUserWithId } = this.state;
    const { match, context } = this.props;
    const { courseId } = match.params;
    if (context.permissions && context.permissions.includes("user_manage")) {
      cells.push(
        <TableCell
          key={7}
          align="right"
          className={showAcceptButton ? classes.largeTableIconsColumn : classes.tableIconsColumn}
        >
          {currentlyModifyingUserWithId === student.id ? (
            <CircularProgress size={24} style={{ marginRight: 16 }} />
          ) : (
            <>
              {showAcceptButton && (
                <Button
                  onClick={event => this.handleAcceptStudent(courseId, student.id, event)}
                  style={{ marginRight: 6 }}
                >
                  Aceptar
                </Button>
              )}
              <IconButton
                component="span"
                onClick={event => this.handleClickDeleteStudent(student.id)}
              >
                <DeleteIcon />
              </IconButton>
              {this.state.editMode && this.state.currentUserId === student.id ? (
                <IconButton
                  component="span"
                  onClick={event => this.handleSaveStudent(courseId, student.id, event)}
                >
                  <SaveIcon />
                </IconButton>
              ) : (
                <IconButton
                  component="span"
                  onClick={event => this.handleEditStudent(courseId, student.id, event)}
                >
                  <EditIcon />
                </IconButton>
              )}
            </>
          )}
        </TableCell>
      );
    }

    return (
      <TableRow hover key={student.id}>
        {cells}
      </TableRow>
    );
  }

  renderFilters(classes) {
    const { searchNameQuery, searchIdQuery, searchEmailQuery } = this.state;
    return (
      <div className={classes.filtersContainer}>
        <Typography variant="subtitle1" color="textSecondary" component="p">
          Filtros
        </Typography>
        <TextField
          label="Nombre"
          value={searchNameQuery}
          onChange={e => this.handleFilterChange("searchNameQuery", e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Email"
          value={searchEmailQuery}
          onChange={e => this.handleFilterChange("searchEmailQuery", e.target.value)}
        />
        <TextField
          label="Id"
          value={searchIdQuery}
          onChange={e => this.handleFilterChange("searchIdQuery", e.target.value)}
        />
      </div>
    );
  }

  renderUsersTable(users, classes, showAcceptButton = false) {
    const filteredIds = this.getFilteredUserIdsByQueries(users);
    const filteredSet = new Set(filteredIds);

    return (
      <div className={classes.tableContainerDiv}>
        {this.renderFilters(classes)}
        <TableContainer className={classes.tableContainer}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>{this.renderHeadRow(classes)}</TableHead>
            <TableBody>
              {users
                .filter(student => filteredSet.has(student.id))
                .map(student =>
                  this.renderStudentRow(student, classes, showAcceptButton)
                )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  }

  
  render() {
    const { classes } = this.props;
    const { students, teachers, error, tabIndex, refreshStudentsNotification } = this.state;

    const acceptedStudents = students.filter(s => s.accepted);
    const pendingStudents = students.filter(s => !s.accepted);

    return (
      <div>
        {error.open && <ErrorNotification open={error.open} message={error.message} />}
        <div className={classes.dashboardContainer}>
          <Paper>
            <Tabs
              value={tabIndex}
              onChange={(event, newValue) => this.handleTabChange(event, newValue)}
              indicatorColor="primary"
              textColor="textPrimary"
              variant="scrollable"
            >
              <Tab label="Alumnos" />
              <Tab label="Docentes" />
              <Tab label="Pendientes" />
            </Tabs>
          </Paper>
          <div>
            {tabIndex === 0 && this.renderUsersTable(acceptedStudents, classes)}
            {tabIndex === 1 && this.renderUsersTable(teachers, classes)}
            {tabIndex === 2 && this.renderUsersTable(pendingStudents, classes, true)}
          </div>
          <ConfirmDeleteStudentModal
            open={this.state.deleteModal.open}
            onDeleteClicked={() => this.handleDeleteStudentConfirmed()}
            onCancelClicked={() => this.handleCancelDeleteStudent()}
          />
        </div>
      </div>
    );
  }

}

export default withState(withStyles(styles)(StudentsTeachersPage));
