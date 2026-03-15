import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, Avatar, IconButton, InputAdornment, Paper, CircularProgress } from "@mui/material";
import { LogOut, Mail, Sparkles, Search } from "lucide-react";
import { HomeRoot, ProfileHeader, AISearchField } from "./Home.styles";
import aiService, { type SearchResult } from "../../services/ai-service";

interface UserProfile {
  _id?: string;
  username?: string; // Optional because Google auth might not return it
  name?: string;     // Support for Google auth name field
  email: string;
  photo?: string;
}

const Home = () => {
  const navigate = useNavigate();

// Initialize user state from localStorage, but only once on component mount
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

  // Will log out the user if the user state becomes null (e.g., after logout or if localStorage is cleared)
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
        const threshold = parseFloat(import.meta.env.VITE_AI_SEARCH_THRESHOLD || "0.60");
const filteredResults = res.data.results.filter((post: SearchResult) => post.score >= threshold);
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
  
  // Determine display name: username (regular auth), name (Google auth), or fallback
  const displayName = user.username || user.name || "Guest";

  // Handle profile image: use full URL for Google auth, otherwise fetch from local server
  const imageUrl = user?.photo 
    ? (user.photo.startsWith('http') ? user.photo : `http://localhost:3000/public/${user.photo.split('/').pop()}`) 
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
              {/* Display the first letter of the name as a fallback if no image exists */}
              {!imageUrl && displayName[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={900}>
                {displayName}
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