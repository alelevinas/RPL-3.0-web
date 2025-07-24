// @flow
import React from "react";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import Divider from "@material-ui/core/Divider";
import { withStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import RecentActorsIcon from "@material-ui/icons/RecentActors";
import CodeIcon from "@material-ui/icons/Code";
import SchoolIcon from "@material-ui/icons/School";
import PeopleIcon from "@material-ui/icons/People";
import BarChartIcon from "@material-ui/icons/BarChart";
import SettingsIcon from "@material-ui/icons/Settings";
import { Link, withRouter } from "react-router-dom";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import List from "@material-ui/core/List";
import { withState } from "../../utils/State";

const drawerWidth = 240;

const styles = theme => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  },
  // bottomPush: {
  //   position: "fixed",
  //   bottom: 0,
  //   textAlign: "center",
  //   paddingBottom: 10,
  //   marginLeft: theme.spacing(2),
  // },
});

const actionIcons = {
  Dashboard: BarChartIcon,
  Cursos: SchoolIcon,
  Actividades: CodeIcon,
  "Alumnos y Docentes": PeopleIcon,
  "Configuracion de Curso": SettingsIcon,
  Usuarios: RecentActorsIcon,
  "Clonar Curso": FileCopyIcon,
};

type Props = {
  open: boolean,
  classes: any,
  courseId: ?number,
  handleDrawerClose: () => void,
};

// eslint-disable-next-line react/no-redundant-should-component-update
class SideBar extends React.PureComponent<Props> {

  render() {
    const { open, classes, courseId, context, handleDrawerClose } = this.props;

    const adminItemLinks = {};
    if (context.profile && context.profile.is_admin) {
      adminItemLinks.Usuarios = `/users`;
      adminItemLinks["Clonar Curso"] = `/courses/clone`;
    }

    // Course-specific links
    const itemsLinks = {};

    if (courseId) {
      itemsLinks.Dashboard = `/courses/${courseId}/dashboard`;
      itemsLinks.Actividades = `/courses/${courseId}/activities`;
      if (context.permissions && context.permissions.includes("course_edit")) {
        itemsLinks["Configuracion de Curso"] = `/courses/${courseId}/edit`;
        itemsLinks["Alumnos y Docentes"] = `/courses/${courseId}/students`;
      }
    }

    const configurationLinks = {
      Cursos: "/courses",
    };

    return (
      <Drawer
        className={classes.drawer}
        variant="temporary"
        anchor="left"
        open={open}
        onClose={() => handleDrawerClose()}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={() => handleDrawerClose()}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        {/* Admin links */}
        {Object.keys(adminItemLinks).length > 0 && (
          <>
            <List>
              {Object.keys(adminItemLinks).map(text => {
                const Icon = actionIcons[text];
                return (
                  <ListItem button key={text} component={Link} to={adminItemLinks[text]}>
                    <ListItemIcon>
                      <Icon />
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </ListItem>
                );
              })}
            </List>
            <Divider />
          </>
        )}
        {/* Course links */}
        {Object.keys(itemsLinks).length > 0 && (
          <>
            <List>
              {Object.keys(itemsLinks).map(text => {
                const Icon = actionIcons[text];
                return (
                  <ListItem button key={text} component={Link} to={itemsLinks[text]}>
                    <ListItemIcon>
                      <Icon />
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </ListItem>
                );
              })}
            </List>
            <Divider />
          </>
        )}
        <List>
          {Object.keys(configurationLinks).map(text => {
            const Icon = actionIcons[text];
            return (
              <ListItem button key={text} component={Link} to={configurationLinks[text]}>
                <ListItemIcon>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            );
          })}
        </List>
        {/* <div className={classes.bottomPush}>
          <a href="https://cafecito.app/rpl" rel="noopener noreferrer" target="_blank">
            <img
              srcset="https://cdn.cafecito.app/imgs/buttons/button_5.png 1x, https://cdn.cafecito.app/imgs/buttons/button_5_2x.png 2x, https://cdn.cafecito.app/imgs/buttons/button_5_3.75x.png 3.75x"
              src="https://cdn.cafecito.app/imgs/buttons/button_5.png"
              alt="Invitame un café en cafecito.app"
            />
          </a>
        </div> */}
      </Drawer>
    );
  }
}

export default withRouter(withState(withStyles(styles)(SideBar)));
