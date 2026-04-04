import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, IconButton, InputAdornment, CircularProgress, Button } from "@mui/material";
import { Sparkles, Search } from "lucide-react";
import { 
  HomeRoot, 
  MainContainer, 
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

import aiService, { type SearchResult } from "../../services/ai-service";
import postService, { type Post } from "../../services/post-service";
import PostCard from "../../components/PostCard/PostCard"; 
import CreatePostModal from "../../components/CreatePostModal/CreatePostModal";
import Navbar from "../../components/Navbar/Navbar";
import CommentsModal from "../../components/CommentsModal/CommentsModal";

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
      } catch {
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
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

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

  const handleSearch = () => {
    // If search query is empty, clear results and return
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

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

  const resetHomeState = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    if (nextPage <= totalPages) {
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("are you sure you want to delete this post?")) return;

    try {
      await postService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Failed to delete post", err);
      alert("The deletion failed, please try again later");
    }
  };

  const handleEditClick = (post: Post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };
  if (!user) return null;

  return (
    <HomeRoot>
      <Navbar user={user} onNewPostClick={() => setIsModalOpen(true)} onHomeClick={resetHomeState} />
      <MainContainer>
        <AISearchField 
          fullWidth 
          placeholder="Ask AI for your next stop... (e.g., 'best pasta in Italy')" 
          value={searchQuery}
          onChange={(e) => {
            const value = e.target.value;
            setSearchQuery(value);
            // If user clears the input, reset search results and error
            if (!value.trim()) {
              setSearchResults([]);
              setSearchError(null);
            }
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          disabled={isLoadingSearch}
          InputProps={{ 
            startAdornment: (
              <InputAdornment position="start">
                <Sparkles size={20} color="#4a148c" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} disabled={isLoadingSearch || !searchQuery.trim()}>
                  {isLoadingSearch ? <CircularProgress size={20} /> : <Search size={20} color={searchQuery.trim() ? "#4a148c" : "#ccc"}/>}
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
                    postId={post._id!}
                    currentUserId={user._id || ""}
                    likes={post.likes || []}
                    username={post.sender.username}
                    userPhoto={post.sender.photo}
                    title={post.title} 
                    text={post.content || ""}
                    postImage={post.photo ? `http://localhost:3000/public/${post.photo}` : undefined}
                    createdAt={post.createdAt}
                    isOwner={post.sender._id === user._id}
                    onDelete={() => handleDeletePost(post._id!)} 
                    onEdit={() => handleEditClick(post)}
                    commentsCount={post.commentsCount || 0}
                    onCommentsClick={() => setCommentPostId(post._id!)}
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
            onClose={handleCloseModal} 
            onPostCreated={handlePostCreated} 
            postToEdit={editingPost}
          />
        )}
        {commentPostId && (
            <CommentsModal 
              open={Boolean(commentPostId)} 
              onClose={() => setCommentPostId(null)} 
              postId={commentPostId}
              onCommentAdded={handlePostCreated} 
            />
          )}
      </MainContainer>
    </HomeRoot>
  );
};

export default Home;