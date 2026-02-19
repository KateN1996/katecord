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

    const { data: userData } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('servers')
      .insert({
        name: serverName.trim(),
        owner_id: userData.user?.id
      });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setServerName('');
      onServerCreated();
      onClose();
    }
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