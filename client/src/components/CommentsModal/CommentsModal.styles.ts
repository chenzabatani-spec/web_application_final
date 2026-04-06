import { styled } from '@mui/material/styles';
import { Box, Typography, TextField, Avatar, IconButton, Paper } from '@mui/material';

export const CommentsContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '500px', 
  maxHeight: '80vh',
});

export const CommentsList = styled(Box)({
  flexGrow: 1,
  overflowY: 'auto',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const CommentItem = styled(Box)({
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
});

export const CommentBubble = styled(Paper)({
  padding: '10px 16px',
  borderRadius: '18px',
  backgroundColor: '#f0f2f5',
  maxWidth: '85%',
});

export const CommentAuthor = styled(Typography)({
  fontWeight: 700,
  fontSize: '0.85rem',
  color: '#4a148c',
});

export const CommentText = styled(Typography)({
  fontSize: '0.9rem',
  color: '#1c1e21',
  lineHeight: 1.4,
});

export const InputArea = styled(Box)({
  padding: '16px',
  borderTop: '1px solid #eee',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const StyledInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '25px',
    backgroundColor: '#f0f2f5',
    '& fieldset': { border: 'none' },
  },
});