import { useState } from 'react';
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

interface ChatLayoutProps {
  user: User;
}

export function ChatLayout({ user }: ChatLayoutProps) {
  const theme = useTheme();
  const [servers, setServers] = useState([
    { id: 1, name: 'Gooncord' },
    { id: 2, name: 'Crackheadnation' },
  ]);
  const [channels, setChannels] = useState([
    { id: 1, name: 'general', serverId: 1 },
    { id: 2, name: 'vent', serverId: 1 },
  ]);
  const [selectedServer, setSelectedServer] = useState(1);
  const [selectedChannel, setSelectedChannel] = useState(1);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { content: message, user: displayName }]);
      setMessage('');
    }
  };

  const displayName = user.user_metadata?.display_name || user.email;
  const currentChannel = channels.find(c => c.id === selectedChannel);
  const serverChannels = channels.filter(c => c.serverId === selectedServer);

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
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
                  bgcolor: selectedServer === server.id ? 'primary.main' : '#7777ee',
                  '&:hover': {
                    bgcolor: 'primary.main',
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
                bgcolor: '#7777ee',
                '&:hover': {
                  bgcolor: '#88dd88',
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

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#d0d0ff',
            borderRight: 'none',
            left: 72,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #b0b0dd' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
            {servers.find(s => s.id === selectedServer)?.name}
          </Typography>
        </Box>
        <List>
          <ListItem>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold' }}>
              TEXT CHANNELS
            </Typography>
          </ListItem>
          {serverChannels.map((channel) => (
            <ListItem key={channel.id} disablePadding>
              <ListItemButton
                selected={selectedChannel === channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: '#b0b0ee',
                  },
                  '&:hover': {
                    bgcolor: '#c0c0ee',
                  },
                }}
              >
                <TagIcon sx={{ mr: 1, fontSize: 20, color: '#666' }} />
                <ListItemText primary={channel.name} />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding>
            <ListItemButton>
              <AddIcon sx={{ mr: 1, fontSize: 20, color: '#666' }} />
              <ListItemText primary="Add Channel" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

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
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ bgcolor: 'background.default', borderBottom: '1px solid #d0d0ff' }}
        >
          <Toolbar>
            <TagIcon sx={{ mr: 1, color: '#666' }} />
            <Typography variant="h6" sx={{ flexGrow: 1, color: '#333' }}>
              {currentChannel?.name}
            </Typography>
            <Typography sx={{ mr: 2, color: '#666' }}>
              {displayName}
            </Typography>
            <Button onClick={handleSignOut} variant="outlined" size="small">
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 2,
            bgcolor: 'background.default',
          }}
        >
          {messages.length === 0 ? (
            <Typography sx={{ color: '#666', textAlign: 'center', mt: 4 }}>
              No messages yet. Start the conversation!
            </Typography>
          ) : (
            messages.map((msg, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 'bold' }}>
                  {msg.user}
                </Typography>
                <Typography variant="body1">{msg.content}</Typography>
              </Box>
            ))
          )}
        </Box>

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