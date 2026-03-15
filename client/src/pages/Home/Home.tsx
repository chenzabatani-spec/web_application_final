import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, IconButton, InputAdornment, CircularProgress } from "@mui/material";
import { LogOut, Mail, Sparkles, Search } from "lucide-react";
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
import aiService, { type SearchResult } from "../../services/ai-service";

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

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const displayName = user.username || user.name || "Guest";
  const imageUrl = user?.photo 
    ? (user.photo.startsWith('http') ? user.photo : `http://localhost:3000/public/${user.photo.split('/').pop()}`) 
    : "";

  return (
    <HomeRoot>
      <MainContainer>
        <ProfileHeader elevation={0}>
          <HeaderActions>
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
          placeholder="חיפוש חכם בעזרת AI..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          disabled={isLoading}
          InputProps={{ 
            startAdornment: (
              <InputAdornment position="start">
                <Sparkles size={20} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} disabled={isLoading || !searchQuery.trim()}>
                  {isLoading ? <CircularProgress size={20} /> : <Search size={20} />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {error && <ErrorText>{error}</ErrorText>}

        {searchResults.length > 0 ? (
          <SearchResultsContainer>
            {searchResults.map((post) => (
              <ResultCard key={post.postId}>
                <ResultText>{post.text}</ResultText>
                <MatchScore>
                  🎯 התאמה: {(post.score * 100).toFixed(0)}%
                </MatchScore>
              </ResultCard>
            ))}
          </SearchResultsContainer>
        ) : (
          !isLoading && (
            <EmptyFeedPaper>
                <EmptyFeedTitle>הפיד שלך בדרך!</EmptyFeedTitle>
                <EmptyFeedSubText>
                  כאן יופיעו הפוסטים מ-MongoDB אחרי שנחבר את ה-Post Controller.
                </EmptyFeedSubText>
            </EmptyFeedPaper>
          )
        )}
      </MainContainer>
    </HomeRoot>
  );
};

export default Home;