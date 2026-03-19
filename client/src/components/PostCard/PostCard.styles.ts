import { styled } from '@mui/material/styles';
import { Card, Box, Typography, Avatar, CardMedia } from '@mui/material';

export const StyledPostCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 24,
  boxShadow: '0 10px 30px rgba(74, 20, 140, 0.05)',
  border: '1px solid #f0e6ff',
  overflow: 'hidden',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

export const PostHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

export const PostAuthorInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
});

export const AuthorName = styled(Typography)({
  fontWeight: 800,
  fontSize: '1rem',
  color: '#4a148c',
});

export const PostDate = styled(Typography)({
  fontSize: '0.75rem',
  color: '#9e9e9e',
});

export const PostContentArea = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 3, 2, 3),
}));

export const PostBodyText = styled(Typography)({
  fontSize: '1rem',
  lineHeight: 1.6,
  color: '#333',
});

export const PostImage = styled(CardMedia)({
  height: '350px',
  width: '100%',
  objectFit: 'cover',
});

export const PostActionsRow = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  borderTop: '1px solid #f8f0ff',
  backgroundColor: '#fdfbff',
}));