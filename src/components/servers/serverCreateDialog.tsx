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

interface ServerCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onServerCreated: () => void;
}

export function ServerCreateDialog({ 
  open, 
  onClose, 
  onServerCreated 
}: ServerCreateDialogProps) {
  const [serverName, setServerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!serverName.trim()) {
      setError('Server name is required');
      return;
    }

    setLoading(true);
    setError(null);

    const { data: user } = await supabase.auth.getUser();

    if (!user){
        setError('girl log yourself in'); 
        setLoading(false);
        return;
    }
    
    const {data: serverData, error: error } = await supabase
      .from('servers')
      .insert({
        name: serverName.trim(),
        owner_id: user.user?.id
      })
      .select()
      .single();



    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    } 

    const { error: channelError} = await supabase
        .from('channels')
        .insert({
            server_id: serverData.id,
            name: 'general',
            description: 'Generally General',
            created_by: user.user?.id
        });
    
    if (channelError){
        console.error('Error creating general channel:', channelError);
        setError('Server created but failed to create general channel'); // is there a better way to do this? like a transaction
        setLoading(false);
        return;
        

    }

    setLoading(false);
    setServerName('');
    onServerCreated();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Server</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Server Name"
            fullWidth
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            placeholder="Lost Hikers 2.0 :)"
            disabled={loading}
            autoFocus
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
          {loading ? 'Creating...' : 'Create Server'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}