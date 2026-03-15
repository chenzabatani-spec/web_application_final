import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Box, Typography, IconButton, InputAdornment } from "@mui/material";
import { LogOut, Mail, Sparkles } from "lucide-react";
import { 
  HomeRoot, 
  ProfileHeader, 
  HeaderActions,
  UserInfoSection,
  StyledAvatar,
  AISearchField, 
  EmptyFeedPaper 
} from "./Home.styles";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    
    if (!savedUser || savedUser === "undefined") {
      localStorage.removeItem("user"); 
      navigate("/login");
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
    } catch (e) {
      console.error("Failed to parse user", e);
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) return null;

  const imageUrl = user?.photo 
    ? `http://localhost:3000/public/${user.photo.split('/').pop()}` 
    : "";

  return (
    <HomeRoot>
      <Container maxWidth="md" sx={{ pt: 4 }}>
        <ProfileHeader elevation={0}>
          <HeaderActions>
            <IconButton onClick={handleLogout} sx={{ color: 'white' }}>
              <LogOut size={20} />
            </IconButton>
          </HeaderActions>

          <UserInfoSection>
            <StyledAvatar src={imageUrl}>
              {!imageUrl && user.username?.[0].toUpperCase()}
            </StyledAvatar>
            
            <Box>
              <Typography variant="h4" fontWeight={900}>
                {user.username}
              </Typography>
              <Typography sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Mail size={16} /> {user.email}
              </Typography>
            </Box>
          </UserInfoSection>
        </ProfileHeader>

        <AISearchField 
          fullWidth 
          placeholder="חיפוש חכם בעזרת AI..." 
          InputProps={{ 
            startAdornment: (
              <InputAdornment position="start">
                <Sparkles size={20} color="#4a148c" />
              </InputAdornment>
            ) 
          }}
        />
        
        <EmptyFeedPaper>
            <Typography color="primary" variant="h6" fontWeight={700} gutterBottom>
              הפיד שלך בדרך!
            </Typography>
            <Typography color="text.secondary">
              כאן יופיעו הפוסטים מ-MongoDB אחרי שנחבר את ה-Post Controller.
            </Typography>
        </EmptyFeedPaper>
      </Container>
    </HomeRoot>
  );
};

export default Home;