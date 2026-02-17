import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from './components/auth';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { User } from '@supabase/supabase-js';

function App() {
  const [user, setUser] = useState <User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!user) {
    return <Auth />;
  }

  return (
  <Box sx={{ padding: 4 }}>
    <Typography variant="h3" gutterBottom>
      Katecord
    </Typography>
    {user ? (
      <>
        <Typography>Welcome, {user.email}!</Typography>
        <Button variant="outlined" onClick={handleSignOut} sx={{ mt: 2 }}>
          Sign Out
        </Button>
      </>
    ) : (
      <Typography>Please sign in</Typography>
    )}
  </Box>
);

}

export default App