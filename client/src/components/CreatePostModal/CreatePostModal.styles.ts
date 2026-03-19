import { styled } from '@mui/material/styles';
import { Box, Paper, Button, Typography, TextField } from '@mui/material';

export const ModalOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(74, 20, 140, 0.2)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1300,
});

export const ModalContent = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '500px',
  padding: theme.spacing(4),
  borderRadius: 28,
  boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
  position: 'relative',
}));

export const ImagePreviewBox = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '200px',
  borderRadius: 16,
  backgroundColor: '#f3e5f5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  marginBottom: theme.spacing(2),
  border: '2px dashed #ce93d8',
  cursor: 'pointer',
}));

export const PreviewImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const SubmitPostBtn = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5),
  fontWeight: 700,
  marginTop: theme.spacing(2),
  background: 'linear-gradient(45deg, #4a148c 30%, #7c43bd 90%)',
  boxShadow: '0 3px 5px 2px rgba(124, 67, 189, .3)',
}));