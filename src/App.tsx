import { Box, Button, Typography, TextField } from '@mui/material'
import { useState } from 'react'

function App() {
  const [message, setMessage] = useState('')

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h3" gutterBottom>
        Katecord
      </Typography>
      <TextField 
        label="Your message" 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        fullWidth
      />
      <Button variant="contained" sx={{ mt: 2 }}>
        Send
      </Button>
    </Box>
  )
}

export default App