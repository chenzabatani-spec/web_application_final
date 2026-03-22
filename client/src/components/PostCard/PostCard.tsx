import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Box } from '@mui/material';
import { Heart, MessageCircle, MoreVertical, Share2, Edit2, Trash2 } from 'lucide-react';
import { 
  StyledPostCard, PostHeader, PostAuthorInfo, AuthorName, 
  PostDate, PostContentArea, PostBodyText, PostImage, PostActionsRow,
  PostTitle, StyledAvatar 
} from './PostCard.styles';

interface PostCardProps {
  username: string;
  userPhoto?: string;
  title: string; 
  text: string;
  postImage?: string;
  createdAt: string;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PostCard = ({ 
  username, userPhoto, title, text, postImage, createdAt, isOwner, onEdit, onDelete 
}: PostCardProps) => {
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const displayDate = createdAt ? new Date(createdAt).toLocaleString('he-IL') : '';
  const authorImg = userPhoto?.startsWith('http') ? userPhoto : `http://localhost:3000/public/${userPhoto?.split('/').pop()}`;

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

      {postImage && <PostImage component="img" image={postImage} alt="Post content" />}

      <PostActionsRow>
        <IconButton size="small"><Heart size={20} color="#4a148c" /></IconButton>
        <IconButton size="small"><MessageCircle size={20} color="#4a148c" /></IconButton>
        <IconButton size="small"><Share2 size={20} color="#4a148c" /></IconButton>
      </PostActionsRow>
    </StyledPostCard>
  );
};

export default PostCard;