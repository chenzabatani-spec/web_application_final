import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
import { Edit2, Map, Heart, Camera } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import PostCard from '../../components/PostCard/PostCard';
import CreatePostModal from '../../components/CreatePostModal/CreatePostModal';
import postService, { type Post } from '../../services/post-service';
import userService from '../../services/user-service';
import { 
  ProfileRoot, ProfileContainer, PurpleBanner, EditProfileButton, 
  AvatarWrapper, StyledAvatar, BannerContent, UserDetails, UserNameTitle, UserEmailText, 
  StatsGlassBox, StatItem, StatValue, StatLabel,
  FeedSection, FeedTitle, StatTextWrapper 
} from './Profile.styles';
import CommentsModal from '../../components/CommentsModal/CommentsModal';

const Profile = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved && saved !== "undefined" ? JSON.parse(saved) : null;
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState(currentUser?.username || "");
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, [currentUser, navigate]);

  const fetchUserPosts = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingPosts(true);
    try {
      const response = await postService.getPosts(1, 50, currentUser._id);
      setPosts(response.data.posts);
    } catch (err) {
      console.error("Failed to fetch user posts", err);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  const profileStats = useMemo(() => {
    if (!posts || posts.length === 0) return { postCount: 0, totalLikes: 0 };
    const postCount = posts.length;
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
    return { postCount, totalLikes };
  }, [posts]);

  const handleSaveProfile = async () => {
    if (!currentUser || !editUsername.trim()) return;
    setIsSaving(true);
    
    try {
      const formData = new FormData();
      formData.append("username", editUsername);
      if (editPhotoFile) {
        formData.append("photo", editPhotoFile);
      }

      const res = await userService.updateUser(currentUser._id, formData);
      
      const updatedUser = { ...currentUser, ...res.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setIsEditModalOpen(false);
      
      fetchUserPosts(); 
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) return null;

  const displayName = currentUser.username || currentUser.name || "Traveler";
  const imageUrl = currentUser.photo 
    ? (currentUser.photo.startsWith('http') ? currentUser.photo : `http://localhost:3000/public/${currentUser.photo.split('/').pop()}`) 
    : "";
  const handleEditClick = (post: Post) => {
    setEditingPost(post);
    setIsNewPostModalOpen(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await postService.deletePost(postId);
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseModal = () => {
    setIsNewPostModalOpen(false);
    setEditingPost(null);
  };

  return (
    <ProfileRoot>
      <Navbar user={currentUser} onNewPostClick={() => setIsNewPostModalOpen(true)} />
      
      <ProfileContainer>
        <PurpleBanner>
          <EditProfileButton onClick={() => {
            setEditUsername(currentUser.username);
            setEditPhotoFile(null);
            setIsEditModalOpen(true);
          }}>
            <Edit2 size={16} /> Edit Profile
          </EditProfileButton>

          <AvatarWrapper>
            <StyledAvatar src={imageUrl}>
              {!imageUrl && displayName[0].toUpperCase()}
            </StyledAvatar>
          </AvatarWrapper>
          
          <BannerContent>
            <UserDetails>
              <UserNameTitle>{displayName}</UserNameTitle>
              <UserEmailText>{currentUser.email || "No email provided"}</UserEmailText>
            </UserDetails>

            <StatsGlassBox>
              <StatItem>
                <Map size={32} color="#ce93d8" strokeWidth={2} />
                <StatTextWrapper>
                  <StatValue>{profileStats.postCount}</StatValue>
                  <StatLabel>Posts</StatLabel>
                </StatTextWrapper>
              </StatItem>
              
              <StatItem>
                <Heart size={32} color="#ce93d8" strokeWidth={2} />
                <StatTextWrapper>
                  <StatValue>{profileStats.totalLikes}</StatValue>
                  <StatLabel>Likes</StatLabel>
                </StatTextWrapper>
              </StatItem>
            </StatsGlassBox>
          </BannerContent>

        </PurpleBanner>

        <FeedSection>
          <FeedTitle>My Posts</FeedTitle>
          
          {isLoadingPosts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress color="secondary" />
            </Box>
          ) : posts.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {posts.map((post) => (
                <PostCard 
                  key={post._id}
                  postId={post._id!}
                  currentUserId={currentUser._id || ""}
                  likes={post.likes || []}
                  username={post.sender.username}
                  userPhoto={post.sender.photo}
                  title={post.title} 
                  text={post.content || ""}
                  postImage={post.photo ? `http://localhost:3000/public/${post.photo.split('/').pop()}` : undefined}                  createdAt={post.createdAt}
                  isOwner={true}
                  onEdit={() => handleEditClick(post)}
                  onDelete={() => handleDeletePost(post._id!)}
                  commentsCount={post.commentsCount || 0}
                  onCommentsClick={() => setCommentPostId(post._id!)}
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 4, p: 4, bgcolor: '#ffffff', borderRadius: '12px', border: '1px solid #eee' }}>
              <Typography variant="h6" fontWeight="bold">No posts yet...</Typography>
              <Typography>Time to share your first destination!</Typography>
            </Box>
          )}
        </FeedSection>
      </ProfileContainer>

      <Dialog open={isEditModalOpen} onClose={() => !isSaving && setIsEditModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ style: { borderRadius: 20 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#673ab7' }}>Edit Profile</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <StyledAvatar src={editPhotoFile ? URL.createObjectURL(editPhotoFile) : imageUrl} sx={{ width: 80, height: 80, border: '2px solid #ce93d8', fontSize: '2rem' }}>
              {!imageUrl && !editPhotoFile && displayName[0].toUpperCase()}
            </StyledAvatar>
            <Button component="label" variant="contained" color="secondary" startIcon={<Camera size={18} />} sx={{ borderRadius: 20, textTransform: 'none' }}>
              Upload New Photo
              <input type="file" hidden accept="image/*" onChange={(e) => setEditPhotoFile(e.target.files?.[0] || null)} />
            </Button>
          </Box>
          
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={editUsername}
            onChange={(e) => setEditUsername(e.target.value)}
          />
          <TextField
            label="Email (Read Only)"
            variant="outlined"
            fullWidth
            value={currentUser.email || "No email available"}
            disabled
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsEditModalOpen(false)} disabled={isSaving} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleSaveProfile} disabled={isSaving || !editUsername.trim()} variant="contained" color="secondary" sx={{ borderRadius: 20, textTransform: 'none' }}>
            {isSaving ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {isNewPostModalOpen && (
        <CreatePostModal 
          onClose={handleCloseModal}
          onPostCreated={fetchUserPosts}
          postToEdit={editingPost}
        />
      )}
      {commentPostId && (
        <CommentsModal 
          open={Boolean(commentPostId)} 
          onClose={() => setCommentPostId(null)} 
          postId={commentPostId}
          onCommentAdded={fetchUserPosts} 
        />
      )}
    </ProfileRoot>
  );
};

export default Profile;