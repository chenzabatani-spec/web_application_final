import { useEffect, useState } from "react";
import authService from "../services/auth-service";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  username: string;
  email: string;
  photo?: string;
}

const Home = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // If profile fetch fails (e.g. expired token), go to login
        navigate("/login");
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Welcome, {user.username}!</h1>
      
      {user.photo && (
        <img 
          src={`http://localhost:3000/${user.photo}`} 
          alt="Profile" 
          style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover" }} 
        />
      )}
      
      <p>Logged in as: {user.email}</p>
      
      <button onClick={handleLogout} style={{ marginTop: "20px" }}>
        Logout
      </button>
    </div>
  );
};

export default Home;