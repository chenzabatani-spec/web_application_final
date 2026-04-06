import { useState, useEffect } from 'react';import { Dialog, DialogTitle, IconButton, Avatar, CircularProgress, Box, Typography} from '@mui/material';
import { X, Send } from 'lucide-react';
import commentService, { type Comment } from '../../services/comment-service';
import { 
  CommentsContainer, CommentsList, CommentItem, 
  CommentBubble, CommentAuthor, CommentText, 
  InputArea, StyledInput 
} from './CommentsModal.styles';

interface CommentsModalProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  onCommentAdded: () => void; 
}

const CommentsModal = ({ open, onClose, postId, onCommentAdded }: CommentsModalProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchComments = async () => {
        setLoading(true);
        try {
          const res = await commentService.getCommentsByPostId(postId);
          setComments(res.data);
        } catch (err) {
          console.error("Failed to load comments", err);
        } finally {
          setLoading(false);
        }
      };
      fetchComments();
    }
  }, [open, postId]);

  const handleSend = async () => {
    if (!newComment.trim()) return;
    try {
      await commentService.createComment({ postId, content: newComment });
      setNewComment("");
      onCommentAdded(); 
      const res = await commentService.getCommentsByPostId(postId);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to send comment", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '15px' } }}>
      <DialogTitle sx={{ m: 0, p: 2, fontWeight: 'bold', color: '#4a148c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Comments
        <IconButton onClick={onClose} size="small"><X size={20} /></IconButton>
      </DialogTitle>

      <CommentsContainer>
        <CommentsList>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress color="secondary" /></Box>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem key={comment._id}>
                <Avatar 
                  src={comment.sender?.photo ? `http://localhost:3000/public/${comment.sender.photo}` : undefined}
                  sx={{ width: 32, height: 32 }}
                />
                <CommentBubble elevation={0}>
                  <CommentAuthor>{comment.sender?.username}</CommentAuthor>
                  <CommentText>{comment.content}</CommentText>
                </CommentBubble>
              </CommentItem>
            ))
          ) : (
            <Typography sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>No comments yet. Be the first!</Typography>
          )}
        </CommentsList>

        <InputArea>
          <StyledInput 
            fullWidth 
            placeholder="Add a comment..." 
            variant="outlined" 
            size="small"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <IconButton onClick={handleSend} disabled={!newComment.trim()} sx={{ color: '#4a148c' }}>
            <Send size={20} />
          </IconButton>
        </InputArea>
      </CommentsContainer>
    </Dialog>
  );
};

export default CommentsModal;