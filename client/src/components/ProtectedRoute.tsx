import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // Check if token exists in localStorage (Lecture 6)
  const token = localStorage.getItem("accessToken");

  // If no token, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the child components
  return <Outlet />;
};

export default ProtectedRoute;