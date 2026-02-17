import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#6666ff',
    },
    secondary: {
      main: '#5555dd',
    },
    background: {
      default: '#e6e6ff',
      paper: '#ffffff',
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
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#d0d0ff',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#b0b0ee',
          },
          '&:hover': {
            backgroundColor: '#c0c0ee',
          },
        },
      },
    },
  },
});