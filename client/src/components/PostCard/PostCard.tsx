import React from 'react';
import { IconButton, Avatar, Typography } from '@mui/material';
import { Heart, MessageCircle, MoreVertical, Share2 } from 'lucide-react';
import { 
  StyledPostCard, PostHeader, PostAuthorInfo, AuthorName, 
  PostDate, PostContentArea, PostBodyText, PostImage, PostActionsRow 
} from './PostCard.styles';

interface PostCardProps {
  username: string;
  userPhoto?: string;
  title: string; 
  text: string;
  postImage?: string;
  createdAt?: string;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PostCard = ({ 
  username, 
  userPhoto, 
  title,
  text, 
  postImage, 
  createdAt, 
  isOwner 
}: PostCardProps) => {
  
  // Format the date if available
  const displayDate = createdAt ? new Date(createdAt).toLocaleDateString() : '';
  
  // Handle image path from server
  const authorImg = userPhoto?.startsWith('http') 
    ? userPhoto 
    : `http://localhost:3000/public/${userPhoto?.split('/').pop()}`;

  return (
    <StyledPostCard elevation={0}>
      <PostHeader>
        <Avatar 
          src={authorImg} 
          sx={{ width: 45, height: 45, border: '2px solid #f3e5f5' }}
        >
          {username[0].toUpperCase()}
        </Avatar>
        
        <PostAuthorInfo>
          <AuthorName>{username}</AuthorName>
          <PostDate>{displayDate}</PostDate>
        </PostAuthorInfo>

        {isOwner && (
          <IconButton size="small">
            <MoreVertical size={18} color="#9e9e9e" />
          </IconButton>
        )}
      </PostHeader>

      <PostContentArea>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold', 
            mb: 1, 
            color: '#4a148c', 
            fontSize: '1.1rem' 
          }}
        >
          {title}
        </Typography>
        <PostBodyText>{text}</PostBodyText>
      </PostContentArea>

      {postImage && (
        <PostImage 
          component="img"
          image={postImage} 
          alt="Post content" 
        />
      )}

      <PostActionsRow>
        <IconButton size="small">
          <Heart size={20} color="#4a148c" />
        </IconButton>
        <IconButton size="small">
          <MessageCircle size={20} color="#4a148c" />
        </IconButton>
        <IconButton size="small">
          <Share2 size={20} color="#4a148c" />
        </IconButton>
      </PostActionsRow>
    </StyledPostCard>
  );
};

export default PostCard;