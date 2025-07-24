import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";

const styles = theme => ({
  card: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
    minWidth: 180,
    minHeight: 60,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 10,
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      minWidth: 120,
      minHeight: 40,
      alignItems: "flex-start",
      padding: theme.spacing(0.5),
    },
  },
  media: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: theme.spacing(2),
    objectFit: "contain",
    backgroundSize: "contain",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    [theme.breakpoints.down("sm")]: {
      width: 32,
      height: 32,
      marginRight: theme.spacing(1),
      marginBottom: theme.spacing(0.5),
    },
  },
  name: {
    fontWeight: 600,
    fontSize: "1.1rem",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1rem",
    },
  },
});

function CourseInfoMiniCard({ course, classes }) {
  if (!course) return null;
  return (
    <Card className={classes.card}>
      <CardMedia
        className={classes.media}
        image={course.img_uri || "https://icons.iconarchive.com/icons/ionic/ionicons/128/school-icon.png"}
        title={course.name}
      />
      <Typography className={classes.name}>{course.name}</Typography>
    </Card>
  );
}

export default withStyles(styles)(CourseInfoMiniCard);