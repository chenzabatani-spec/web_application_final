import { styled } from '@mui/material/styles';
import { Box, Paper, TextField, Typography } from '@mui/material';

export const HomeRoot = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#f8f9fa', 
});

export const MainContainer = styled(Box)(({ theme }) => ({
  paddingTop: '100px',
  maxWidth: '900px',
  margin: '0 auto',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

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