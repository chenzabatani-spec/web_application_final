import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, Avatar, IconButton, InputAdornment, Paper, CircularProgress } from "@mui/material";
import { LogOut, Mail, Sparkles, Search } from "lucide-react";
import { HomeRoot, ProfileHeader, AISearchField } from "./Home.styles";
import aiService, { type SearchResult } from "../../services/ai-service";

interface UserProfile {
  _id?: string;
  username: string;
  email: string;
  photo?: string;
}

const Home = () => {
  const navigate = useNavigate();

  // State to hold the user profile, search query, search results, loading state, and error message
  const [user] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && savedUser !== "undefined") {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error("Failed to parse user", e);
        return null;
      }
    }
    return null;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on component mount, and redirect to login if not
  useEffect(() => {
    if (!user) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    const { request } = aiService.searchSimilarPosts(searchQuery);
    
    request
      .then((res) => {
        // Filter results to only include those with a similarity score of 60% or higher before updating state
        const filteredResults = res.data.results.filter((post: SearchResult) => post.score >= 0.60);
        setSearchResults(filteredResults);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name === 'CanceledError') return;
        setError("אופס! משהו השתבש בחיפוש. נסה שוב.");
        setIsLoading(false);
      });
  };

  if (!user) return null;
    const imageUrl = user?.photo 
      ? `http://localhost:3000/public/${user.photo.split('/').pop()}` 
      : "";

  return (
    <HomeRoot>
      <Container maxWidth="md" sx={{ pt: 4 }}>
        <ProfileHeader elevation={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={handleLogout} sx={{ color: 'white' }}>
              <LogOut size={20} />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: -2 }}>
            <Avatar 
              src={imageUrl} 
              sx={{ width: 100, height: 100, border: '5px solid white', bgcolor: 'primary.light' }}
            >
              {}
              {!imageUrl && user.username?.[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={900}>
                {user.username}
              </Typography>
              <Typography sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Mail size={16} /> {user.email}
              </Typography>
            </Box>
          </Box>
        </ProfileHeader>

        <AISearchField 
          fullWidth 
          placeholder="חיפוש חכם בעזרת AI..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          disabled={isLoading}
          InputProps={{ 
            startAdornment: (
              <InputAdornment position="start">
                <Sparkles size={20} color={isLoading ? "#ccc" : "#4a148c"} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} disabled={isLoading || !searchQuery.trim()}>
                  {isLoading ? <CircularProgress size={20} color="primary" /> : <Search size={20} color={searchQuery.trim() ? "#4a148c" : "#ccc"} />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        {error && (
          <Typography color="error" textAlign="center" mb={2}>
            {error}
          </Typography>
        )}

        {searchResults.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {searchResults.map((post) => (
              <Paper key={post.postId} sx={{ p: 3, borderRadius: 4, textAlign: 'right', borderLeft: '4px solid #4a148c' }}>
                <Typography variant="body1" sx={{ mb: 1 }}>{post.text}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                  🎯 התאמה: {(post.score * 100).toFixed(0)}%
                </Typography>
              </Paper>
            ))}
          </Box>
        ) : (
          !isLoading && (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 8, border: '2px dashed #e0e0e0', bgcolor: 'rgba(255,255,255,0.5)' }}>
                <Typography color="primary" variant="h6" fontWeight={700} gutterBottom>
                  הפיד שלך בדרך!
                </Typography>
                <Typography color="text.secondary">
                  כאן יופיעו הפוסטים מ-MongoDB אחרי שנחבר את ה-Post Controller.
                </Typography>
            </Paper>
          )
        )}
        
      </Container>
    </HomeRoot>
  );
};

export default Home;