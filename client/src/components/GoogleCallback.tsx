import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract tokens and user info from URL parameters
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const userId = params.get("_id");
    const username = params.get("username");
    const email = params.get("email"); 
    const photo = params.get("photo");

    if (accessToken) {
        // 1. Construct the user object EXACTLY as Home.tsx expects it
        const userObj = {
            _id: userId || "",
            username: username || "Google User",
            email: email || "", 
            photo: photo || ""
        };

        // 2. Store user as a JSON string (matching standard Login.tsx behavior)
        localStorage.setItem("user", JSON.stringify(userObj));
        
        // 3. Store tokens (using "token" to match Login.tsx behavior)
        localStorage.setItem("token", accessToken);
        if (refreshToken) {
             localStorage.setItem("refreshToken", refreshToken);
        }

        // Redirect to home page after successful login
        navigate("/");
    } else {
        // If tokens are missing, redirect to login page
        console.error("DEBUG - Full URL Search String:", location.search);
        console.error("DEBUG - Access Token is missing!");
        console.error("Google authentication failed: Missing tokens in callback URL");
        navigate("/login");
    }
  }, [location, navigate]);

  return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <h2>Logging in with Google...</h2>
          <p>Please wait while we log you in.</p>
      </div>
  );
};

export default GoogleCallback;