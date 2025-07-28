import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";

const styles = theme => ({
  card: {
    display: "flex",
    flexDirection: "row",
    maxWidth: "100%",
    maxHeight: "300px",
    borderRadius: 10,
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(3),
    alignItems: "center",
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      maxHeight: "none",
    },
  },
  media: {
    width: 220,
    height: 220,
    borderRadius: 8,
    marginRight: theme.spacing(4),
    marginLeft: theme.spacing(2),
    objectFit: "contain",
    backgroundSize: "contain",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    [theme.breakpoints.down("sm")]: {
      marginRight: 0,
      marginBottom: theme.spacing(2),
      width: "100%",
      maxHeight: 150,
    },
  },
  content: {
    flex: 1,
    width: "100%",
  }
});

function CourseInfoCard({ course, classes }) {
  if (!course) return null;
  return (
    <Card className={classes.card}>
      <CardMedia
        className={classes.media}
        image={course.img_uri || "https://icons.iconarchive.com/icons/ionic/ionicons/128/school-icon.png"}
        title={course.name}
      />
      <CardContent className={classes.content}>
        <Typography variant="h5">{course.name}</Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {course.subject_id} &mdash; {course.semester}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {course.description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default withStyles(styles)(CourseInfoCard);