import { DialogTitle } from "@mui/material";
import Dialog from "@mui/material/Dialog";

interface MessageDeleteConfirmationProps{
    open: boolean,
    onClose: () => void,
    onConfirmation: () =>void,
    message: string,


}

export function MessageDeleteConfirmation({open, onClose, onConfirmation, message}:MessageDeleteConfirmationProps){

    return(
        <Dialog 
        open={open} 
        onClose={onClose} 
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description">
            <DialogTitle id="delete-dialog-title">
                Delete Message



            </DialogTitle>

            
        </Dialog>
    )

}