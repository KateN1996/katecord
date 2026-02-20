import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import TagIcon from '@mui/icons-material/Tag';
import AddIcon from '@mui/icons-material/Add';
import { ChannelCreateDialog } from './channelCreateDialog';
import type { Channel, Server } from '../../types/chat';

const DRAWER_WIDTH = 240;

interface ChannelListProps {
    server: Server;
    channels: Channel[];
    selectedChannel: number;
    onSelectChannel: (channelId: number) => void;
    onChannelChange: () => void;
}

export function ChannelList({server: server, channels, selectedChannel, onSelectChannel, onChannelChange: onChannelChange}: ChannelListProps){
    const theme = useTheme();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    return (
        <>
            <Drawer
                variant="permanent"
                sx={{
                        width: DRAWER_WIDTH,
                        flexShrink: 0,
                        '& .MuiDrawer-paper':{
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            borderRight: 'none',
                            left: 72,

                        },


                        
                    }}
            >
                <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {server.name}
                    </Typography>
                </Box>
                <List>
                    <ListItem>
                        <><Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                           TEXT CHANNELS </Typography></>
                    </ListItem>
                    {channels.map((channel) => (

                        <ListItem key ={channel.id} disablePadding>
                            <ListItemButton selected= {selectedChannel === channel.id} onClick={() => onSelectChannel(channel.id)}>
                                <TagIcon sx={{mr: 1, fontSize:20,color: 'text.secondary'}}/>
                                <ListItemText 
                                    primary={channel.name}
                                    slotProps={{ secondary: {variant: 'caption' }}}
                                />
                            </ListItemButton>


                        </ListItem>
                        
                    )
                    )}
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => setCreateDialogOpen(true)}>
                            <AddIcon sx ={{mr: 1, fontSize:20,color: 'text.secondary'}}/>
                            <ListItemText primary ="Add Channel"/>

                        </ListItemButton>

                    </ListItem>
                </List>
                    

            </Drawer>
            <ChannelCreateDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} serverId={server.id} onChannelCreated={onChannelChange} />
        </>
    )

}

