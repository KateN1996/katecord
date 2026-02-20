import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

interface ChannelCreateDialogProps{
    open: boolean;
    onClose: () => void;
    serverId: number;
    onChannelCreated: () => void;
}

export function ChannelCreateDialog({open,onClose, serverId, onChannelCreated}: ChannelCreateDialogProps) {
    const [channelName, setChannelName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        if(!channelName.trim()){
            setError('Channel name is required');
            return;
        }
        setLoading(true);
        setError(null);

        const {data} = await supabase.auth.getUser();

        const { error } = await supabase
            .from('channels')
            .insert({
                server_id: serverId,
                name: channelName.trim().toLowerCase().replace(/\s+/g, '-'),
                description: description.trim() || null,
                created_by: data.user?.id
            });
        
        setLoading(false);

        if (error){
            setError(error.message.toString());
            return;
        }

        setChannelName('');
        setDescription('');
        onChannelCreated();
        onClose();

    };

    return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            disableEnforceFocus
            disableAutoFocus
            disableRestoreFocus>
        <DialogTitle>Create Channel</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ pt: 2 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                    </Alert>
                )}
                <TextField
                    label="Channel Name"
                    fullWidth
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="general"
                    sx={{ mb: 2 }}
                    disabled={loading}
                    autoFocus
                    slotProps={{ inputLabel:{ shrink: true} }} // idk
                />
                <TextField
                    label="Description (optional)"
                    fullWidth
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Generally general"
                    multiline
                    rows={2}
                    disabled={loading}
                    slotProps={{ inputLabel:{ shrink: true },}} //idk
                />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                Cancel
                </Button>
                <Button 
                onClick={handleCreate} 
                variant="contained"
                disabled={loading}
                >
                {loading ? 'Creating...' : 'Create Channel'}
                </Button>
            </DialogActions>

    </Dialog>
  );
}