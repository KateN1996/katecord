import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import type { Message } from '../../types/chat';
import { MessageDeleteConfirmDialog } from './messageDeleteConfirmation';
import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton  from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';

interface MessageItemProps {
  message: Message;
  currentUserId: string;
  isServerOwner: boolean;
  onDelete: (messageId: string) => void;
  onEdit: (messageId: string, newMessage: string) => void;
}

export function MessageItem({ message, currentUserId, isServerOwner, onDelete, onEdit }: MessageItemProps) {
    
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);

    const canDelete = isServerOwner || message.user_id === currentUserId;
    const canEdit = message.user_id === currentUserId;

    const formatMessageTime = (timestamp: string): string => {
        const messageDate = new Date(timestamp);
        const today = new Date();
        const isToday = messageDate.toLocaleDateString() === today.toLocaleDateString();

        if (isToday) {
            return `Today at ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        return messageDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditContent(message.content);
    };

    const handleEditSave = async () => {
        if (!editContent.trim() || editContent === message.content) {
            setIsEditing(false);
            return;
        }
        
        try {
            await onEdit(message.id, editContent);
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving edit:', error);
        }
    };

    const handleEditCancel = () => {
        setIsEditing(false);
        setEditContent(message.content);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEditSave();
        } else if (e.key === 'Escape') {
            handleEditCancel();
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        setShowDeleteDialog(false);
        setIsDeleting(true);
        try {
            await onDelete(message.id);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
    };

    return (
        <>
            <Box 
                sx={{ 
                    mb: 2,
                    opacity: isDeleting ? 0.5 : 1,
                    transition: 'opacity 0.2s',
                    position: 'relative',
                    '&:hover .message-actions': {
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
                    {isEditing ? (
                        <TextField
                            fullWidth
                            size="small"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleEditSave}
                            autoFocus
                            sx={{
                                '& .MuiInputBase-input': {
                                    py: 0.5,
                                    fontSize: '1rem',
                                }
                            }}
                            helperText="escape to cancel • enter to save"
                        />
                    ) : (
                        <Typography
                            variant="body1"
                            sx={{ 
                                color: message.failed ? 'error.main' : 'text.primary',
                                flex: 1,
                                wordBreak: 'break-word'
                            }}
                        >
                            {message.content}
                            {message.is_edited && ( 
                                <Typography
                                    component="span"
                                    variant="caption"
                                    sx={{ color: 'text.disabled', ml: 1 }}
                                >
                                    (edited)
                                </Typography>
                            )}
                        </Typography>
                    )}
                    
                    {!isEditing && (canEdit || canDelete) && (
                        <Box className="message-actions" sx={{ display: 'flex', gap: 0.5, opacity: 0, transition: 'opacity 0.2s' }}>
                            {canEdit && (
                                <IconButton 
                                    size="small" 
                                    onClick={handleEditClick}
                                    disabled={isDeleting}
                                    sx={{ 
                                        color: 'info.main',
                                        p: 0.5,
                                        '&:hover': { 
                                            backgroundColor: 'info.main',
                                            color: 'white',
                                        }
                                    }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            )}
                            
                            {canDelete && (
                                <IconButton 
                                    size="small" 
                                    onClick={handleDeleteClick}
                                    disabled={isDeleting}
                                    sx={{ 
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