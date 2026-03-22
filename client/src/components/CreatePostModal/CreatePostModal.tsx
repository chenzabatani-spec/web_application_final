import React, { useState, useRef, useEffect } from 'react';
import { IconButton, CircularProgress, Typography } from '@mui/material';
import { X, Camera } from 'lucide-react';
import postService, { type Post } from '../../services/post-service';
import { 
  ModalOverlay, ModalContent, ImagePreviewBox, PreviewImage, SubmitPostBtn, ModalHeader, 
  ModalTitle, StyledTextField, PhotoPlaceholder,PreviewContainer,RemoveImageBtn 
} from './CreatePostModal.styles';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: () => void;
  postToEdit?: Post | null;
}

const CreatePostModal = ({ onClose, onPostCreated, postToEdit }: CreatePostModalProps) => {
  const [title, setTitle] = useState(postToEdit?.title || '');
  const [content, setContent] = useState(postToEdit?.content || '');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(
    postToEdit?.photo ? `http://localhost:3000/public/${postToEdit.photo}` : ''
  );
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title || '');
      setContent(postToEdit.content || '');
      setPreview(postToEdit.photo ? `http://localhost:3000/public/${postToEdit.photo}` : '');
    } else {
      setTitle('');
      setContent('');
      setPreview('');
    }
  }, [postToEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();     
    setImage(null);
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const formData = new FormData(); 
      formData.append('title', title);
      formData.append('content', content);

      if (image) {
        formData.append('photo', image); 
      } else if (preview === '') {
        formData.append('deletePhoto', 'true'); 
      }
      if (postToEdit?._id) {
        await postService.updatePost(postToEdit._id, formData); 
      } else {
        await postService.createPost(formData); 
      }

      onPostCreated();
      onClose();
    } catch (error) {
      console.error("Failed to save post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()} elevation={0}>
        <ModalHeader>
          <ModalTitle variant="h6">
            {postToEdit ? 'Edit Post' : 'Create New Post'}
          </ModalTitle>
          <IconButton onClick={onClose} size="small"><X size={20} /></IconButton>
        </ModalHeader>

        <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />

        <ImagePreviewBox onClick={() => fileInputRef.current?.click()}>
          {preview ? (
            <PreviewContainer>
              <PreviewImage src={preview} alt="Preview" />
              <RemoveImageBtn onClick={handleRemoveImage} size="small">
                <X size={16} color="#d32f2f" />
              </RemoveImageBtn>
            </PreviewContainer>
          ) : (
            <PhotoPlaceholder>
              <Camera size={40} />
              <Typography variant="body2">Click to add a photo</Typography>
            </PhotoPlaceholder>
          )}
        </ImagePreviewBox>

        <StyledTextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <StyledTextField
          fullWidth
          label="What's on your mind?"
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
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            postToEdit ? "Update Post" : "Post Now"
          )}
        </SubmitPostBtn>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CreatePostModal;