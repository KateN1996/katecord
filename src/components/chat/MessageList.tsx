import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MessageItem } from './messageItem';
import type { Message } from '../../types/chat';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  currentUserId: string;
  isServerOwner: boolean;
  onDeleteMessage: (messageId: string) => void;

}

export function MessageList({ messages, loading, currentUserId, isServerOwner, onDeleteMessage }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box 
      sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography sx={{ color: 'text.secondary' }}>
            Loading messages...
          </Typography>
        </Box>
      ) : messages.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography sx={{ color: 'text.secondary' }}>
            No messages yet. Start the conversation!
          </Typography>
        </Box>
      ) : (
        <>
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} currentUserId={currentUserId} isServerOwner={isServerOwner} onDelete={onDeleteMessage}/>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </Box>
  );
}