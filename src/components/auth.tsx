import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateInputs = (): boolean => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      alert('Check your email for the confirmation link!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!validateInputs()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !loading) {
      handleSignIn();
    }
  };

  return (
    <Box 
      sx={{ 
        maxWidth: 400, 
        margin: '100px auto', 
        padding: 3 
      }}
    >
      <Typography 
        variant="h4" 
        gutterBottom
        sx={{ textAlign: 'center' }}
      >
        Welcome Back
      </Typography>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      <TextField
        label="Email"
        type="email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyPress={handleKeyPress}
        sx={{ mb: 2 }}
        disabled={loading}
        autoComplete="email"
        autoFocus
      />
      
      <TextField
        label="Password"
        type="password"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyPress={handleKeyPress}
        sx={{ mb: 2 }}
        disabled={loading}
        autoComplete="current-password"
      />
      
      <Button 
        variant="contained" 
        fullWidth 
        onClick={handleSignIn}
        disabled={loading}
        sx={{ mb: 1 }}
        size="large"
      >
        {loading ? 'Loading...' : 'Sign In'}
      </Button>
      
      <Button 
        variant="outlined" 
        fullWidth 
        onClick={handleSignUp}
        disabled={loading}
        size="large"
      >
        Create Account
      </Button>
    </Box>
  );
}