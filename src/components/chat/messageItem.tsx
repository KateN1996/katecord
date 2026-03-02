import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Message } from '../../types/chat';
import { MessageDeleteConfirmDialog } from './messageDeleteConfirmation';
import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete'
import IconButton  from '@mui/material/IconButton';

interface MessageItemProps {
  message: Message;
  currentUserId: string;
  isServerOwner: boolean;
  onDelete: (messageId: string) => void;
}

export function MessageItem({ message, currentUserId, isServerOwner, onDelete }: MessageItemProps) {
    
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const canDelete = isServerOwner || message.user_id === currentUserId;
    // console.log("this is the message ", message)
    // console.log(" this is the server owner ", isServerOwner)
    // console.log("message user id ", message.user_id)
    // console.log(" current user id ", currentUserId)

    const formatMessageTime = (timestamp: string): string => {
  const messageDate = new Date(timestamp);
  const today = new Date();
  const isToday = messageDate.toLocaleDateString() === today.toLocaleDateString();

  if (isToday) {
    return `Today at ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  return messageDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

    const handleDeleteClick = () => {
        setShowDeleteDialog(true);
    }

    const handleDeleteConfirm = async () => {
        setShowDeleteDialog(false);
        setIsDeleting(true)
        try{
            await onDelete(message.id); // handle error?
        }finally{
            setIsDeleting(false);

        }
        
        
    }

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
    }


return (
        <>
            <Box 
                sx={{ 
                    mb: 2,
                    opacity: isDeleting ? 0.5 : 1,
                    transition: 'opacity 0.2s',
                    position: 'relative',
                    '&:hover .delete-button': {
                        opacity: 1,
                    }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                        {message.display_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {formatMessageTime(message.created_at)}
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Typography
                        variant="body1"
                        sx={{ 
                            color: message.failed ? 'error.main' : 'text.primary',
                            flex: 1,
                            wordBreak: 'break-word'
                        }}
                    >
                        {message.content}
                    </Typography>
                    
                    {canDelete && (
                        <IconButton 
                            className="delete-button"
                            size="small" 
                            onClick={handleDeleteClick}
                            disabled={isDeleting}
                            sx={{ 
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                color: 'error.main',
                                p: 0.5,
                                '&:hover': { 
                                    backgroundColor: 'error.main',
                                    color: 'white',
                                }
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>

                {message.failed && (
                    <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 0.5 }}>
                        Failed to send. Click to retry when I implement that functionality lol
                    </Typography>
                )}
            </Box>
            
            <MessageDeleteConfirmDialog
                open={showDeleteDialog}
                onClose={handleDeleteCancel}
                onConfirmation={handleDeleteConfirm}
                messageContent={message.content}
            />
        </>
    );
}