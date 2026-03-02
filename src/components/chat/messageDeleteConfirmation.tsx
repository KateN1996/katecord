import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

interface MessageDeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirmation: () => void;
  messageContent?: string;
}

export function MessageDeleteConfirmDialog({ 
  open, 
  onClose, 
  onConfirmation, 
  messageContent 
}: MessageDeleteConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">
        Delete Message
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          Are you sure you want to delete this message?
          {messageContent && (
            <>
              <br />
              <br />
              <strong>"{messageContent.substring(0, 50)}{messageContent.length > 50 ? '...' : ''}"</strong>
            </>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirmation} color="error" variant="contained" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}