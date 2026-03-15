import { styled } from '@mui/material/styles';
import { Box, Paper, TextField, Avatar, Typography } from '@mui/material';

export const HomeRoot = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#f8f9fa', 
});

export const ProfileHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 32,
  background: 'linear-gradient(135deg, #4a148c, #7c43bd)',
  color: 'white',
  marginBottom: theme.spacing(4),
  position: 'relative',
  boxShadow: '0 10px 30px rgba(74, 20, 140, 0.2)',
}));

export const HeaderActions = styled(Box)({
  display: 'flex', 
  justifyContent: 'flex-end',
});

export const UserInfoSection = styled(Box)(({ theme }) => ({
  display: 'flex', 
  alignItems: 'center', 
  gap: theme.spacing(3), 
  marginTop: theme.spacing(-2),
}));

export const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 100, 
  height: 100, 
  border: '5px solid white', 
  backgroundColor: theme.palette.primary.light,
  fontSize: '2.5rem',
  fontWeight: 700,
}));

export const AISearchField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiOutlinedInput-root': {
    borderRadius: 40,
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  }
}));

export const EmptyFeedPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5), 
  textAlign: 'center', 
  borderRadius: 32, 
  border: '2px dashed #e0e0e0', 
  backgroundColor: 'rgba(255,255,255,0.5)',
  boxShadow: 'none',
}));