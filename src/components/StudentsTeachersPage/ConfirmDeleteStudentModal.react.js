// @flow
import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import WarningIcon from '@material-ui/icons/Warning';

type Props = {
  open: boolean,
  onDeleteClicked: void => void,
  onCancelClicked: void => void,
};

export default function ConfirmDeleteStudentModal(props: Props) {
  const { open, onDeleteClicked, onCancelClicked } = props;
  return (
    <Dialog
      open={open}
      onBackdropClick={() => onCancelClicked()}
      scroll="paper"
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      maxWidth="sm"
    >
      <DialogTitle id="scroll-dialog-title">¿Seguro que querés eliminar este estudiante del curso?</DialogTitle>
      <DialogContent>
        <DialogActions>
          <Button onClick={() => onCancelClicked()} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={() => onDeleteClicked()}
            variant="contained"
            color="secondary"
            startIcon={<WarningIcon />}
          >
            Si, Eliminar
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}