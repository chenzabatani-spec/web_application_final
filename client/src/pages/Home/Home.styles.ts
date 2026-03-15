import { styled } from '@mui/material/styles';
import { Box, Paper, TextField, Avatar, Typography } from '@mui/material';

export const HomeRoot = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#f8f9fa', 
});

export const MainContainer = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  maxWidth: '900px',
  margin: '0 auto',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

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

export const UserDetails = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
});

export const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 100, 
  height: 100, 
  border: '5px solid white', 
  backgroundColor: theme.palette.primary.light,
  fontSize: '2.5rem',
  fontWeight: 700,
}));

export const UserName = styled(Typography)({
  fontSize: '2.125rem',
  fontWeight: 900,
  lineHeight: 1.2,
});

export const EmailRow = styled(Box)({
  opacity: 0.8,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '4px',
});

export const EmailText = styled(Typography)({
  fontSize: '1rem',
});

export const AISearchField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiOutlinedInput-root': {
    borderRadius: 40,
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  }
}));

export const SearchResultsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const ResultCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  textAlign: 'right',
  borderLeft: `4px solid #4a148c`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
}));

export const ResultText = styled(Typography)({
  fontSize: '1rem',
  marginBottom: '8px',
});

export const MatchScore = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 'bold',
  fontSize: '0.75rem',
  display: 'block',
}));

export const EmptyFeedPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5), 
  textAlign: 'center', 
  borderRadius: 32, 
  border: '2px dashed #e0e0e0', 
  backgroundColor: 'rgba(255,255,255,0.5)',
  boxShadow: 'none',
}));

export const EmptyFeedTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '1.25rem', 
  fontWeight: 700,
  marginBottom: theme.spacing(1),
}));

export const EmptyFeedSubText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const ErrorText = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  textAlign: 'center',
  marginBottom: theme.spacing(2),
}));