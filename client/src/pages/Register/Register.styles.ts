import { styled } from '@mui/material/styles';
import { Box, Card, Button } from '@mui/material';


export const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, #f3e5f5 100%)`,
  padding: theme.spacing(4, 2),
}));

export const RegisterCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(5),
  textAlign: 'center',
  position: 'relative',
  overflow: 'visible',
  width: '100%',
  maxWidth: '450px',
  boxShadow: '0 20px 60px rgba(74, 20, 140, 0.08)',
  borderRadius: theme.shape.borderRadius * 2,
}));

export const AvatarSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

export const StyledAvatarPicker = styled(Box)(({ theme }) => ({
  width: 100,
  height: 100,
  borderRadius: '35px',
  backgroundColor: theme.palette.primary.light,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  marginBottom: theme.spacing(2),
  boxShadow: '0 10px 20px rgba(124, 67, 189, 0.2)',
  cursor: 'pointer',
  overflow: 'hidden',
  border: '4px solid white',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05) rotate(3deg)',
    boxShadow: '0 15px 30px rgba(124, 67, 189, 0.3)',
  },
}));

export const SubmitBtn = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  fontSize: '1rem',
  boxShadow: '0 8px 16px rgba(74, 20, 140, 0.2)',
}));