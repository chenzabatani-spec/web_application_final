import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract tokens from URL parameters
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const userId = params.get("_id");
    const username = params.get("username");

    if (accessToken && refreshToken) {
        // Store tokens in localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userId", userId || "");
        localStorage.setItem("username", username || "");

        // Redirect to home page after successful login
        navigate("/");
    } else {
        // If tokens are missing, redirect to login page
        console.error("Google authentication failed: Missing tokens in callback URL");
        navigate("/login");
    }
    }, [location, navigate]);

    return (
        <div>
            <h2>Logging in with Google...</h2>
            <p>Please wait while we log you in.</p>
        </div>
    );
};

export default GoogleCallback;