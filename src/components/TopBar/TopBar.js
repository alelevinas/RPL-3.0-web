import React from "react";
import IconButton from "@material-ui/core/IconButton";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import MenuIcon from "@material-ui/icons/Menu";
import LockOpenIcon from '@material-ui/icons/LockOpen';
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { withRouter } from "react-router-dom";
import { withState } from "../../utils/State";
import NotificationsButton from "../SideBar/NotificationsButton";
import logo from "../../logo_white_large.png";
import DarkModeToggle from "../ThemeToggler/DarkModeToggle";

const drawerWidth = 240;
const barHeight = 64;

const styles = theme => ({
  appBar: {
    height: barHeight,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  logo: {
    marginRight: theme.spacing(2),
    height: "50%",
  },
  hide: {
    display: "none",
  },
  title: {
    flexGrow: 1,
    marginTop: theme.spacing(0.8),
    marginLeft: theme.spacing(2),
    fontWeight: "bold",
  },
  user: {
    marginRight: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  adminIcon: {
    marginRight: theme.spacing(3),
  },
});

class TopBar extends React.PureComponent {
  state = {
    isNotificationModalOpen: false,
    avatarMenuAnchor: null,
  };

  handleCloseNotificationModal() {
    this.setState({ isNotificationModalOpen: false });
  }

  handleAvatarClick = event => {
    this.setState({ avatarMenuAnchor: event.currentTarget });
  };

  handleAvatarMenuClose = () => {
    this.setState({ avatarMenuAnchor: null });
  };

  handleGoToProfile = () => {
    this.handleAvatarMenuClose();
    this.props.history.push("/profile");
  };

  handleSignOut = () => {
    this.handleAvatarMenuClose();
    this.props.context.invalidate();
    this.props.history.push({
      pathname: "/login",
      search: "",
      state: { hasJustSignOut: true },
    });
  };

  render() {
    const {
      open,
      title,
      handleDrawerOpen,
      context,
      classes,
      refreshNotifications,
      match,
    } = this.props;
    if (!context.profile) return <div />;
    const { name, surname, is_admin, img_uri } = context && context.profile;
    const { courseId } = match.params;
    const courseName = context.course && courseId === context.course.id && context.course.name;
    const { isNotificationModalOpen } = this.state;

    return (
      <AppBar
        position="fixed"
        elevation={0}
        className={`${classes.appBar} ${open ? classes.appBarShift : ""}`}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={`${classes.menuButton} ${open ? classes.hide : ""}`}
          >
            <MenuIcon />
          </IconButton>
          <img className={classes.logo} src={logo} alt="logo" />
          <Typography variant="h6" className={classes.title} noWrap>
            {courseId && courseName ? `${title} - ${courseName}` : title}
          </Typography>
          <DarkModeToggle />
          <NotificationsButton
            open={isNotificationModalOpen}
            refresh={refreshNotifications}
            handleClose={e => this.handleCloseNotificationModal(e)}
            onClick={() => this.setState({ isNotificationModalOpen: !isNotificationModalOpen })}
          />
          <Typography variant="body1" className={classes.user}>
            {`${name} ${surname}`}
          </Typography>
          {is_admin && (
            <div className={classes.adminIcon}>
              <LockOpenIcon />
            </div>
          )}           
          <Avatar
            src={img_uri}
            style={{ cursor: "pointer" }}
            onClick={this.handleAvatarClick}
          >
            {name[0]}
            {surname[0]}
          </Avatar>
          <Menu
            anchorEl={this.state.avatarMenuAnchor}
            open={Boolean(this.state.avatarMenuAnchor)}
            onClose={this.handleAvatarMenuClose}
            keepMounted
            PaperProps={{
              style: { marginTop: 56 },
            }}
          >
            <MenuItem onClick={this.handleGoToProfile}>
              <AccountCircleIcon style={{ marginRight: 8 }} />
              Perfil
            </MenuItem>
            <MenuItem onClick={this.handleSignOut}>
              <ExitToAppIcon style={{ marginRight: 8 }} />
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withRouter(withState(withStyles(styles)(TopBar)));
