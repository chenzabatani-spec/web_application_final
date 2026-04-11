import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Box, Typography } from '@mui/material';
import { Heart, MessageCircle, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { 
  StyledPostCard, PostHeader, PostAuthorInfo, AuthorName, 
  PostDate, PostContentArea, PostBodyText, PostImage, PostActionsRow,
  PostTitle, StyledAvatar, ActionGroup,CounterText
} from './PostCard.styles';
import postService from '../../services/post-service';
import { API_BASE_URL } from '../../services/api-client';

interface PostCardProps {
  postId: string;
  currentUserId: string;
  likes?: string[];
  username: string;
  userPhoto?: string;
  title: string; 
  text: string;
  postImage?: string;
  createdAt: string;
  isOwner?: boolean;
  commentsCount: number;
  onCommentsClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PostCard = ({ 
  postId, currentUserId, likes = [],
  username, userPhoto, title, text, postImage, createdAt, isOwner, commentsCount, onCommentsClick, onEdit, onDelete 
}: PostCardProps) => {
  
  // Like State Management
  const [isLiked, setIsLiked] = useState<boolean>(likes.includes(currentUserId));
  const [likesCount, setLikesCount] = useState<number>(likes.length);

  // Like Button Handler - Optimistic UI Update
  const handleLikeClick = async () => {
    // First, we optimistically update the UI
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

    // Then we call the API to toggle the like status on the server
    try {
      await postService.toggleLike(postId);
    } catch (error) {
      console.error("Failed to toggle like", error);
      // If the API call fails, we revert the optimistic update
      setIsLiked(!newIsLiked);
      setLikesCount(prev => !newIsLiked ? prev + 1 : prev - 1);
    }
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const displayDate = createdAt ? new Date(createdAt).toLocaleString('he-IL') : '';
  const authorImg = userPhoto?.startsWith('http') ? userPhoto : `${API_BASE_URL}/public/${userPhoto?.split('/').pop()}`;

  return (
    <StyledPostCard elevation={0}>
      <PostHeader>
        <StyledAvatar src={authorImg}>{username[0].toUpperCase()}</StyledAvatar>
        
        <PostAuthorInfo>
          <AuthorName>{username}</AuthorName>
          <PostDate>{displayDate}</PostDate>
        </PostAuthorInfo>

        {isOwner && (
          <Box>
            <IconButton size="small" onClick={handleMenuClick}>
              <MoreVertical size={18} color="#9e9e9e" />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
              <MenuItem onClick={() => { handleMenuClose(); onEdit?.(); }}>
                <Edit2 size={16} style={{ marginLeft: 8 }} /> edit
              </MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); onDelete?.(); }} sx={{ color: 'error.main' }}>
                <Trash2 size={16} style={{ marginLeft: 8 }} /> delete
              </MenuItem>
            </Menu>
          </Box>
        )}
      </PostHeader>

      <PostContentArea>
        <PostTitle variant="h6">{title}</PostTitle>
        <PostBodyText>{text}</PostBodyText>
      </PostContentArea>

      {postImage && <PostImage image={postImage} title="Post content" />}

      <PostActionsRow>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" onClick={handleLikeClick}>
            <Heart 
              size={20} 
              color={isLiked ? "#e91e63" : "#4a148c"} 
              fill={isLiked ? "#e91e63" : "none"} 
            />
          </IconButton>
          {likesCount > 0 && (
            <Typography variant="body2" sx={{ color: isLiked ? "#e91e63" : "#4a148c", fontWeight: 600 }}>
              {likesCount}
            </Typography>
          )}
        </Box>
        <ActionGroup>
          <IconButton size="small" onClick={onCommentsClick}>
            <MessageCircle size={20} color="#4a148c" />
          </IconButton>
          <CounterText>{commentsCount || 0}</CounterText>
        </ActionGroup>
      </PostActionsRow>
    </StyledPostCard>
  );
};

export default PostCard;