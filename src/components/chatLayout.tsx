import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import TagIcon from '@mui/icons-material/Tag';
import type { User } from '@supabase/supabase-js';

const DRAWER_WIDTH = 240;

interface Message {
  id: string;
  content: string;
  display_name: string;
  channel_id: number;
  created_at: string;
  failed?: boolean;
}

interface ChatLayoutProps {
  user: User;
}

const formatMessageTime = (timestamp: string): string => {
  const messageDate = new Date(timestamp);
  const today = new Date();
  const isToday = messageDate.toLocaleDateString() === today.toLocaleDateString();

  if (isToday) {
    return `Today at ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  return messageDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export function ChatLayout({ user }: ChatLayoutProps) {
  const theme = useTheme();
  const [servers, _setServers] = useState([
    { id: 1, name: 'Gooncord' },
    { id: 2, name: 'Crackheadnation' },
  ]);
  const [channels, _setChannels] = useState([
    { id: 1, name: 'general', serverId: 1 },
    { id: 2, name: 'vent', serverId: 1 },
  ]);
  const [selectedServer, setSelectedServer] = useState(1);
  const [selectedChannel, setSelectedChannel] = useState(1);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const displayName = user.user_metadata?.display_name || user.email;
  const currentChannel = channels.find(c => c.id === selectedChannel);
  const serverChannels = channels.filter(c => c.serverId === selectedServer);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoadingMessages(true);
      setMessages([]);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', selectedChannel)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error.message.toString());
      } else {
        setMessages(data || []);
      }

      setLoadingMessages(false);
    };

    fetchMessages();

    const subscription = supabase
      .channel(`messages:${selectedChannel}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${selectedChannel}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [selectedChannel]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      content: message.trim(),
      display_name: displayName as string,
      channel_id: selectedChannel,
      created_at: new Date().toISOString(),
      failed: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    const { error } = await supabase
      .from('messages')
      .insert({
        content: newMessage.content,
        user_id: user.id,
        display_name: displayName,
        channel_id: selectedChannel,
      });

    if (error) {
      console.error('Error sending message:', error.message.toString());
      setMessages(prev =>
        prev.map(m => m.id === newMessage.id ? { ...m, failed: true } : m)
      );
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Server List */}
      <Drawer
        variant="permanent"
        sx={{
          width: 72,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 72,
            boxSizing: 'border-box',
            bgcolor: 'secondary.main',
            borderRight: 'none',
          },
        }}
      >
        <List sx={{ p: 1 }}>
          {servers.map((server) => (
            <ListItem key={server.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => setSelectedServer(server.id)}
                sx={{
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: selectedServer === server.id
                    ? theme.palette.primary.main
                    : theme.palette.primary.light,
                  '&:hover': {
                    bgcolor: theme.palette.primary.main,
                    borderRadius: '30%',
                  },
                  transition: 'all 0.2s',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
                  {server.name[0]}
                </Typography>
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding>
            <ListItemButton
              sx={{
                height: 48,
                borderRadius: '50%',
                bgcolor: theme.palette.primary.light,
                '&:hover': {
                  bgcolor: theme.palette.success.light,
                  borderRadius: '30%',
                },
                transition: 'all 0.2s',
                justifyContent: 'center',
              }}
            >
              <AddIcon sx={{ color: 'white' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Channel List */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: 'none',
            left: 72,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {servers.find(s => s.id === selectedServer)?.name}
          </Typography>
        </Box>
        <List>
          <ListItem>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
              TEXT CHANNELS
            </Typography>
          </ListItem>
          {serverChannels.map((channel) => (
            <ListItem key={channel.id} disablePadding>
              <ListItemButton
                selected={selectedChannel === channel.id}
                onClick={() => setSelectedChannel(channel.id)}
              >
                <TagIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                <ListItemText primary={channel.name} />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding>
            <ListItemButton>
              <AddIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <ListItemText primary="Add Channel" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Main Chat Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: 0,
          minWidth: 0,
        }}
      >
        {/* Top Bar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{ bgcolor: 'background.default', borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Toolbar>
            <TagIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6" sx={{ flexGrow: 1, color: 'text.primary' }}>
              {currentChannel?.name}
            </Typography>
            <Typography sx={{ mr: 2, color: 'text.secondary' }}>
              {displayName}
            </Typography>
            <Button onClick={handleSignOut} variant="outlined" size="small">
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>

        {/* Messages Area */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 2,
            bgcolor: 'background.default',
          }}
        >
          {loadingMessages ? (
            <Typography sx={{ color: 'text.secondary', textAlign: 'center', mt: 4 }}>
              Loading messages...
            </Typography>
          ) : messages.length === 0 ? (
            <Typography sx={{ color: 'text.secondary', textAlign: 'center', mt: 4 }}>
              No messages yet. Start the conversation!
            </Typography>
          ) : (
            messages.map((msg) => (
              <Box key={msg.id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                    {msg.display_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {formatMessageTime(msg.created_at)}
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{ color: msg.failed ? 'error.main' : 'text.primary' }}
                >
                  {msg.content}
                </Typography>
                {msg.failed && (
                  <Typography variant="caption" sx={{ color: 'error.main' }}>
                    Failed to send. Click to retry when I implement that functionality lol
                  </Typography>
                )}
              </Box>
            ))
          )}
        </Box>

        {/* Message Input */}
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <TextField
            fullWidth
            placeholder={`Message #${currentChannel?.name}`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}