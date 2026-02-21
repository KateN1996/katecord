import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

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
    if (isSignUp && !displayName.trim()) {
      setError('Please enter a display name');
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
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
      });
      if (error) throw error;
      // alert('Check your email for the confirmation link!'); TODO: re-enable this
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
      if (isSignUp) {
        handleSignUp();
      } else {
        handleSignIn();
      }
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
        {isSignUp ? 'Create Account' : 'Welcome Back to Katecord'}
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

      {isSignUp && (
        <TextField
          label="Display Name"
          fullWidth
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          sx={{ mb: 2 }}
          disabled={loading}
          autoFocus
        />
      )}

      <TextField
        label="Email"
        type="email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyPress}
        sx={{ mb: 2 }}
        disabled={loading}
        autoComplete="email"
        autoFocus={!isSignUp}
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyPress}
        sx={{ mb: 2 }}
        disabled={loading}
        autoComplete="current-password"
      />

      {isSignUp ? (
        <>
          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleSignUp}
            disabled={loading}
            sx={{ mb: 1 }}
            size="large"
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </Button>
          <Button 
            variant="text" 
            fullWidth 
            onClick={() => setIsSignUp(false)}
          >
            Already have an account? Sign In
          </Button>
        </>
      ) : (
        <>
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
            variant="text" 
            fullWidth 
            onClick={() => setIsSignUp(true)}
          >
            Need an account? Sign Up
          </Button>
        </>
      )}
    </Box>
  );
}