import { styled } from '@mui/material/styles';
import { Box, Card, Button } from '@mui/material';


export const LoginRoot = styled(Box)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.background.default,
  padding: theme.spacing(0, 2),
}));

export const StyledLoginCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(5),
  textAlign: 'center',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 15px 50px rgba(0,0,0,0.06)',
  borderRadius: (theme.shape.borderRadius as number) * 2,
}));

export const GoogleButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderColor: '#e0e0e0',
  color: theme.palette.text.secondary,
  padding: theme.spacing(1.2, 0),
  fontWeight: 700,
  borderRadius: 12,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: 'rgba(74, 20, 140, 0.04)',
  }
}));