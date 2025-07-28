import React from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import CssBaseline from "@material-ui/core/CssBaseline";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import Fiuba from "./fiuba.jpg";
import Fiuba1 from "./fiuba1.jpg";
import Fiuba2 from "./fiuba2.jpg";
import Fiuba3 from "./fiuba3.jpg";
import Fiuba4 from "./fiuba4.jpg";
import Fiuba5 from "./fiuba5.jpg";
import Fiuba6 from "./fiuba6.jpg";
import FiubaNoche from "./fiuba_noche.jpg";
import FiubaNoche1 from "./fiuba_noche1.jpg";
import FiubaNoche2 from "./fiuba_noche2.jpg";
import FiubaNoche3 from "./fiuba_noche3.jpg";
import FiubaNoche4 from "./fiuba_noche4.jpg";
import FiubaNoche5 from "./fiuba_noche5.jpg";
import FiubaNoche6 from "./fiuba_noche6.jpg";

import logo from "../../logo_large.png";
import logoInverted from "../../logo_invert_large.png";
import DarkModeToggle from "../ThemeToggler/DarkModeToggle";

const styles = theme => ({
  root: {
    height: "100vh",
    backgroundColor: theme.palette.background.default,
  },
  paper: {
    margin: theme.spacing(4, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  image: {
    backgroundImage: `url(${Fiuba})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
  },
  fadeBg: {
    transition: "opacity 0.5s ease",
    opacity: 1,
    height: "100%",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  fadeBgHidden: {
    opacity: 0,
  },
  footer: {
    position: "absolute",
    width: "100%",
    bottom: "5%",
    left: "50%",
    transform: "translate(-50%, -5%)",
    background: "rgba(0,0,0,0.8)",
    zIndex: 1,
  },
  footerText: {
    fontSize: theme.typography.pxToRem(12),
    color: "lightgrey",
    zIndex: 2,
  },
  bottomPush: {
    position: "absolute",
    bottom: 0,
    right: 0,
    textAlign: "center",
    marginRight: theme.spacing(2),
  },
  themeToggle: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 2,
  },
  logo: {
    marginBottom: theme.spacing(3),
  },
});

class HomePage extends React.Component {
  constructor(props, defaultProps) {
    super(props, defaultProps);
    this.state = {
      imageIndex: 0,
      selectedImage: Fiuba,
      fading: false,
    };
    this.imageInterval = null;
    this.preloadedImages = [];
  }

  getImages(darkMode) {
    return darkMode
      ? [FiubaNoche, FiubaNoche1, FiubaNoche2, FiubaNoche3, FiubaNoche4, FiubaNoche5, FiubaNoche6]
      : [Fiuba, Fiuba1, Fiuba2, Fiuba3, Fiuba4, Fiuba5, Fiuba6];
  }

  preloadImages(images) {
    images.forEach(imageSrc => {
      if (!this.preloadedImages.includes(imageSrc)) {
        const img = new window.Image();
        img.src = imageSrc;
        this.preloadedImages.push(imageSrc);
      }
    });
  }

  startImageRotation(darkMode) {
    const images = this.getImages(darkMode);
    this.preloadImages(images);
    this.setState({ imageIndex: 0, selectedImage: images[0] });

    if (this.imageInterval) clearInterval(this.imageInterval);

    this.imageInterval = setInterval(() => {
      this.setState({ fading: true });
      setTimeout(() => {
        this.setState(prevState => {
          const nextIndex = (prevState.imageIndex + 1) % images.length;
          return {
            imageIndex: nextIndex,
            selectedImage: images[nextIndex],
            fading: false,
          };
        });
      }, 500); // match transition duration
    }, 9000); // 9 seconds
  }

  componentDidMount() {
    this.startImageRotation(this.props.darkMode);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.darkMode !== this.props.darkMode) {
      this.startImageRotation(this.props.darkMode);
    }
  }

  componentWillUnmount() {
    if (this.imageInterval) clearInterval(this.imageInterval);
  }

  render() {
    const { classes, history, Form, darkMode, setDarkMode } = this.props;
    const { selectedImage, fading } = this.state;

    return (
      <Grid container className={classes.root} component="main">
        <CssBaseline />
        <Grid
          align="center"
          item
          xs={false}
          sm={4}
          md={7}
          style={{ position: "relative", overflow: "hidden" }}
        >
          <div
            className={`${classes.fadeBg} ${fading ? classes.fadeBgHidden : ""}`}
            style={{
              backgroundImage: `url(${selectedImage})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className={classes.footer}>
            <Typography
              className={classes.footerText}
              variant="body1"
              component="body1"
            >
              <span> RPL 3.0: Trabajo Profesional de Vásquez Jiménez Miguel, Gamberale Luciano y Martinez Quintero Erick </span>
              <br/>
              <span> Tutor: Dr. Mendez Mariano </span>
              <br/>
              <span> Co-tutores y desarrolladores RPL 2.0: Ing. Cano Matías José, Ing. Levinas Alejandro</span>
              <br/>
              <span> Facultad de Ingeniería, Universidad de Buenos Aires </span>
              <br/>
              <span> © FIUBA 2025 </span>
            </Typography>
          </div>
        </Grid>
        <Grid item xs={12} sm={8} md={5} elevation={6} square component={Paper}>
          <div className={classes.paper}>
            <img
              width="30%"
              src={darkMode ? logoInverted : logo}
              alt="logo"
              className={classes.logo}
            />
            <Form history={history} />
          </div>
          <div className={classes.themeToggle}>
            <DarkModeToggle />
          </div>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(HomePage);
