import { createTheme } from '@mui/material/styles';

export const purpleTheme = createTheme({
  palette: {
    primary: {
      main: '#4a148c', 
      light: '#7c43bd',
      dark: '#12005e',
    },
    background: {
      default: '#f8f9fc',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Assistant", "Roboto", sans-serif',
    h4: { fontWeight: 900 },
    h6: { fontWeight: 800 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 12,
        },
      },
    },
  },
});