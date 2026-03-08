import { styled } from '@mui/material/styles';
import { Box, Paper, TextField } from '@mui/material';

export const HomeRoot = styled(Box)({
  minHeight: '100vh',
});

export const ProfileHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 32,
  background: 'linear-gradient(135deg, #4a148c, #7c43bd)',
  color: 'white',
  marginBottom: theme.spacing(4),
  position: 'relative',
}));

export const AISearchField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiOutlinedInput-root': {
    borderRadius: 40,
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  }
}));