import { styled } from '@mui/material/styles';
import { Box, Card, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export const PageContainer = styled(Box)(() => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const LoginRoot = styled(Box)(({ theme }) => ({
  minHeight: '100vh', 
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, #f3e5f5 100%)`,
  padding: theme.spacing(4, 2),
}));

export const StyledLoginCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(5),
  textAlign: 'center',
  width: '100%',
  maxWidth: '450px',
  height: '680px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center', 
  boxShadow: '0 20px 60px rgba(74, 20, 140, 0.08)',
  borderRadius: Number(theme.shape.borderRadius) * 2,
}));

export const FormTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontWeight: 900,
}));

export const SubmitBtn = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5),
  fontSize: '1rem',
}));

export const SocialDivider = styled(Box)(({ theme }) => ({
  margin: theme.spacing(3, 0),
  display: 'flex',
  alignItems: 'center',
}));

export const GoogleButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
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

export const FooterContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

export const FooterLink = styled(Link)(() => ({
  textDecoration: 'none',
  color: '#4a148c',
  fontWeight: 800,
  '&:hover': {
    textDecoration: 'underline',
  },
}));