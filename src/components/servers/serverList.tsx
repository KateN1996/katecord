import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { ServerCreateDialog } from './serverCreateDialog';
import type { Server } from '../../types/chat';

interface ServerListProps {
  servers: Server[];
  selectedServer: number | null;
  onSelectServer: (serverId: number) => void;
  onServersChange: () => void;
}

export function ServerList({ 
  servers, 
  selectedServer, 
  onSelectServer,
  onServersChange,
}: ServerListProps) {
  const theme = useTheme();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <>
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
                onClick={() => onSelectServer(server.id)}
                sx={{
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: selectedServer !== null && selectedServer === server.id
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
              onClick={() => setCreateDialogOpen(true)}
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

      <ServerCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onServerCreated={onServersChange}
      />
    </>
  );
}