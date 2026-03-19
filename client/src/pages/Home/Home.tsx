import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, IconButton, InputAdornment, CircularProgress, Button } from "@mui/material";
import { LogOut, Mail, Sparkles, Search, PlusCircle } from "lucide-react"; 
import { 
  HomeRoot, 
  MainContainer, 
  ProfileHeader, 
  HeaderActions, 
  UserInfoSection,
  UserDetails, 
  StyledAvatar, 
  UserName,
  EmailRow, 
  EmailText,
  AISearchField, 
  SearchResultsContainer,
  ResultCard, 
  ResultText,
  MatchScore, 
  EmptyFeedPaper,
  EmptyFeedTitle,
  EmptyFeedSubText,
  ErrorText 
} from "./Home.styles";
import aiService from "../../services/ai-service";
import postService from "../../services/post-service";
import type { Post } from "../../services/post-service";import PostCard from "../../components/PostCard/PostCard"; 
import CreatePostModal from "../../components/CreatePostModal/CreatePostModal";

interface UserProfile {
  _id?: string;
  username?: string; 
  name?: string;     
  email: string;
  photo?: string;
}

const Home = () => {
  const navigate = useNavigate();

  const [user] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && savedUser !== "undefined") {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search Logic States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Pagination and Feed States
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  useEffect(() => {
    if (!user) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch posts and handle refresh after new post creation
  const fetchPosts = useCallback(async (pageNum: number) => {
    setIsLoadingPosts(true);
    try {
      const response = await postService.getPosts(pageNum, 5);
      if (pageNum === 1) {
        setPosts(response.data.posts);
      } else {
        setPosts((prev) => [...prev, ...response.data.posts]);
      }
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchPosts(1);
  }, [user, fetchPosts]);

  // Function called after post creation to refresh the feed
  const handlePostCreated = () => {
    setPage(1); // Reset page to 1
    fetchPosts(1); // Reload first page to show the new post
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsLoadingSearch(true);
    setSearchError(null);
    setSearchResults([]);

    const { request } = aiService.searchSimilarPosts(searchQuery);
    
    request
      .then((res) => {
        const threshold = parseFloat(import.meta.env.VITE_AI_SEARCH_THRESHOLD || "0.60");
        const filteredResults = res.data.results.filter((post: SearchResult) => post.score >= threshold);
        setSearchResults(filteredResults);
        setIsLoadingSearch(false);
      })
      .catch((err) => {
        if (err.name === 'CanceledError') return;
        setSearchError("Search failed. Please try again.");
        setIsLoadingSearch(false);
      });
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    if (nextPage <= totalPages) {
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  if (!user) return null;

  const displayName = user.username || user.name || "Guest";
  const imageUrl = user?.photo 
    ? (user.photo.startsWith('http') ? user.photo : `http://localhost:3000/public/${user.photo.split('/').pop()}`) 
    : "";

  return (
    <HomeRoot>
      <MainContainer>
        <ProfileHeader elevation={0}>
          <HeaderActions>
            {/* Add Post Button located next to Logout */}
            <IconButton onClick={() => setIsModalOpen(true)} color="inherit">
              <PlusCircle size={20} />
            </IconButton>
            <IconButton onClick={handleLogout} color="inherit">
              <LogOut size={20} />
            </IconButton>
          </HeaderActions>

          <UserInfoSection>
            <StyledAvatar src={imageUrl}>
              {!imageUrl && displayName[0].toUpperCase()}
            </StyledAvatar>
            <UserDetails>
              <UserName>{displayName}</UserName>
              <EmailRow>
                <Mail size={16} /> 
                <EmailText>{user.email}</EmailText>
              </EmailRow>
            </UserDetails>
          </UserInfoSection>
        </ProfileHeader>

        <AISearchField 
          fullWidth 
          placeholder="Search with AI..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          disabled={isLoadingSearch}
          InputProps={{ 
            startAdornment: (
              <InputAdornment position="start">
                <Sparkles size={20} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} disabled={isLoadingSearch || !searchQuery.trim()}>
                  {isLoadingSearch ? <CircularProgress size={20} /> : <Search size={20} />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {searchError && <ErrorText>{searchError}</ErrorText>}

        {searchResults.length > 0 ? (
          <SearchResultsContainer>
            {searchResults.map((post) => (
              <ResultCard key={post.postId}>
                <ResultText>{post.text}</ResultText>
                <MatchScore>
                  🎯 Match: {(post.score * 100).toFixed(0)}%
                </MatchScore>
              </ResultCard>
            ))}
          </SearchResultsContainer>
        ) : (
          <Box>
            {posts.length > 0 ? (
              <Box>
                {posts.map((post) => (
                  <PostCard 
                    key={post._id}
                    username={post.sender.username}
                    userPhoto={post.sender.photo}
                    title={post.title} 
                    text={post.content || ""}
                    postImage={post.photo ? `http://localhost:3000/public/${post.photo}` : undefined}
                    createdAt={post.createdAt}
                    isOwner={post.sender._id === user._id}
                  />
                ))}
                
                {page < totalPages && (
                  <Button 
                    onClick={handleLoadMore} 
                    disabled={isLoadingPosts} 
                    fullWidth 
                    variant="text"
                    sx={{ my: 2, color: '#4a148c', fontWeight: 700 }}
                  >
                    {isLoadingPosts ? <CircularProgress size={24} /> : "Load More Posts"}
                  </Button>
                )}
              </Box>
            ) : (
              !isLoadingPosts && (
                <EmptyFeedPaper>
                    <EmptyFeedTitle>Your feed is on the way!</EmptyFeedTitle>
                    <EmptyFeedSubText>
                      Posts will appear here once they are loaded from the database.
                    </EmptyFeedSubText>
                </EmptyFeedPaper>
              )
            )}
          </Box>
        )}

        {/* Modal render logic */}
        {isModalOpen && (
          <CreatePostModal 
            onClose={() => setIsModalOpen(false)} 
            onPostCreated={handlePostCreated} 
          />
        )}
      </MainContainer>
    </HomeRoot>
  );
};

export default Home;