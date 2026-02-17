import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#6666ff',
    },
    background: {
      default: '#e6e6ff',
      paper: '#ffffff',
    },
    secondary: {
      main: '#5555dd',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#e6e6ff',
        },
      },
    },
  },
});