import React from "react";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import { DropzoneArea } from "material-ui-dropzone";
import { withState } from "../../utils/State";
import cloudinaryService from "../../services/cloudinaryService";
import { validate } from "../../utils/inputValidator";
import authenticationService from "../../services/authenticationService";

const styles = theme => ({
  root: {
    maxWidth: "60%",
    margin: "auto",
    marginTop: theme.spacing(4),
    [theme.breakpoints.down("md")]: {
      maxWidth: "100%",
      marginTop: theme.spacing(2),
    },
  },
  saveButton: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: theme.spacing(2),
  },
  dropzoneContainer: {
    marginBottom: theme.spacing(8),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    border: `1px dashed ${theme.palette.text.primary}`,
    borderRadius: theme.spacing(1),
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(2),
  },
});

class ProfileEdit extends React.Component {
  state = {
    error: { invalidFields: new Set() },
    email: "",
    name: "",
    surname: "",
    degree: "",
    studentId: "",
    university: undefined,
    universities: [],
    userImg: undefined,
  };

  componentDidMount() {
    const { profile } = this.props;

    return authenticationService.getUniversities().then(universities => {
      this.setState({
        universities,
        error: { invalidFields: new Set() },
        name: profile.name,
        surname: profile.surname,
        studentId: profile.student_id,
        email: profile.email,
        degree: profile.degree,
        university: universities.find(university => university.name === profile.university),
        userImg: undefined,
      });
    });
  }

  handleChange(event, valid) {
    event.persist();
    // Close error message
    this.setState(prevState => {
      const { invalidFields } = prevState.error;
      if (valid && invalidFields.has(event.target.id)) {
        invalidFields.delete(event.target.id);
      } else if (!valid) {
        invalidFields.add(event.target.id);
      }
      return {
        [event.target.id]: event.target.value,
        error: { invalidFields },
      };
    });
  }

  handleAddFile(files) {
    if (!files || !files[0]) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => this.setState({ userImg: reader.result });
    reader.readAsDataURL(file);
  }

  handleClickSave() {
    const { userImg, error } = this.state;
    const { onClickSave } = this.props;

    if (error.invalidFields.size !== 0) {
      this.setState(prevState => ({
        error: {
          open: true,
          message: "El formulario cuenta con campos invalidos",
          invalidFields: prevState.error.invalidFields,
        },
      }));
      return;
    }

    const userImgPromise = userImg ? cloudinaryService.uploadFile(userImg) : Promise.resolve();

    userImgPromise.then(userImgAsset =>
      onClickSave({
        name: this.state.name,
        surname: this.state.surname,
        student_id: this.state.studentId,
        email: this.state.email,
        degree: this.state.degree,
        university: this.state.university.name,
        img_uri: userImgAsset && userImgAsset.url,
      })
    );
  }

  canEditProfile() {
    const { error } = this.state;
    return error.invalidFields.size === 0 && this.state.university !== undefined;
  }

  render() {
    const { profile, classes } = this.props;
    const { error, universities, university, degree } = this.state;

    return (
      <Card className={classes.root} elevation={3}>
        <div className={classes.saveButton}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={!this.canEditProfile()}
            onClick={() => this.handleClickSave()}
          >
            Guardar
          </Button>
        </div>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <div className={classes.dropzoneContainer}>
                <DropzoneArea
                  filesLimit={1}
                  acceptedFiles={["image/*"]}
                  dropzoneText="Arrastra una imagen de perfil"
                  onChange={files => this.handleAddFile(files)}
                />
              </div>
              <Typography variant="h6" style={{ marginTop: 16, marginLeft: 10 }}>
                {`Usuario:  ${profile.username}`}
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <form className={classes.form}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Nombre"
                  name="Nombre"
                  autoComplete="name"
                  value={this.state.name}
                  error={error.invalidFields.has("name")}
                  helperText={
                    error.invalidFields.has("name") && "El nombre debe estar formado por letras"
                  }
                  onChange={e =>
                    this.handleChange(e, validate(e.target.value, /^[A-zÀ-ÿ\s]+$/, "string"))
                  }
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="surname"
                  label="Apellido"
                  name="Apellido"
                  autoComplete="surname"
                  value={this.state.surname}
                  error={error.invalidFields.has("surname")}
                  helperText={
                    error.invalidFields.has("surname") &&
                    "El apellido debe estar formado por letras"
                  }
                  onChange={e =>
                    this.handleChange(e, validate(e.target.value, /^[A-zÀ-ÿ\s]+$/, "string"))
                  }
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="studentId"
                  label="Padrón"
                  name="Padrón"
                  autoComplete="studentId"
                  value={this.state.studentId}
                  error={error.invalidFields.has("studentId")}
                  helperText={
                    error.invalidFields.has("studentId") &&
                    "El padron debe estar formado por numeros"
                  }
                  onChange={e =>
                    this.handleChange(e, validate(e.target.value, /^[0-9a-zA-Z]+$/, "string"))
                  }
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="Email"
                  autoComplete="email"
                  value={this.state.email}
                  error={error.invalidFields.has("email")}
                  helperText={
                    error.invalidFields.has("email") && "El email debe ser un email valido"
                  }
                  onChange={e =>
                    this.handleChange(e, validate(e.target.value, /^\S+@\S+\.\S+$/, "string"))
                  }
                />
                <Autocomplete
                  margin="normal"
                  options={universities}
                  id="university"
                  name="Universidad"
                  label="Universidad"
                  autoComplete="university"
                  value={university || {}}
                  onChange={(event, newValue) => this.setState({ university: newValue })}
                  getOptionLabel={uni => uni.name}
                  renderInput={params => (
                    <TextField {...params} label="Universidad" margin="normal" />
                  )}
                />
                <Autocomplete
                  margin="normal"
                  options={university ? university.degrees : []}
                  value={degree}
                  id="degree"
                  name="degree"
                  autoComplete="degree"
                  onChange={(event, newValue) => this.setState({ degree: newValue })}
                  renderInput={params => <TextField {...params} label="Carrera" margin="normal" />}
                />
              </form>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}

export default withState(withStyles(styles)(ProfileEdit));