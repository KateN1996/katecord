import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Message } from '../../types/chat';

const formatMessageTime = (timestamp: string): string => {
  const messageDate = new Date(timestamp);
  const today = new Date();
  const isToday = messageDate.toLocaleDateString() === today.toLocaleDateString();

  if (isToday) {
    return `Today at ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  return messageDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
          {message.display_name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {formatMessageTime(message.created_at)}
        </Typography>
      </Box>
      <Typography
        variant="body1"
        sx={{ color: message.failed ? 'error.main' : 'text.primary' }}
      >
        {message.content}
      </Typography>
      {message.failed && (
        <Typography variant="caption" sx={{ color: 'error.main' }}>
            Failed to send. Click to retry when I implement that functionality lol
        </Typography>
      )}
    </Box>
  );
}