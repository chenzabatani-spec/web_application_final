import React, { useState, useRef } from 'react';
import { IconButton, TextField, CircularProgress, Box, Typography } from '@mui/material';
import { X, Camera, Image as ImageIcon } from 'lucide-react';
import postService from '../../services/post-service';
import { 
  ModalOverlay, ModalContent, ImagePreviewBox, 
  PreviewImage, SubmitPostBtn 
} from './CreatePostModal.styles';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: () => void;
}

const CreatePostModal = ({ onClose, onPostCreated }: CreatePostModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image selection and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      // Using FormData to send both text and binary file (Section 4 requirement)
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (image) {
        formData.append('photo', image);
      }

      await postService.createPost(formData);
      onPostCreated(); // Refresh the feed
      onClose(); // Close modal
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()} elevation={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={800} color="primary">Create New Post</Typography>
          <IconButton onClick={onClose} size="small"><X size={20} /></IconButton>
        </Box>

        <input 
          type="file" 
          hidden 
          ref={fileInputRef} 
          onChange={handleImageChange} 
          accept="image/*" 
        />

        <ImagePreviewBox onClick={() => fileInputRef.current?.click()}>
          {preview ? (
            <PreviewImage src={preview} alt="Preview" />
          ) : (
            <Box textAlign="center" color="#7c43bd">
              <Camera size={40} />
              <Typography variant="body2">Click to add a photo</Typography>
            </Box>
          )}
        </ImagePreviewBox>

        <TextField
          fullWidth
          label="Title"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="What's on your mind?"
          variant="outlined"
          multiline
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <SubmitPostBtn 
          fullWidth 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading || !title.trim()}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Post Now"}
        </SubmitPostBtn>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CreatePostModal;