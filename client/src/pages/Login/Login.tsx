import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Typography, TextField, Button, Divider, InputAdornment, CircularProgress } from "@mui/material";
import { Mail, Lock } from "lucide-react";
import axios from 'axios';
import { LoginRoot, StyledLoginCard, GoogleButton } from "./Login.styles";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
  setLoading(true);
  try {
    const res = await axios.post("http://localhost:3000/auth/login", data);
    
    const userToSave = res.data.user || res.data;
    
    localStorage.setItem("user", JSON.stringify(userToSave));
    localStorage.setItem("token", res.data.accessToken || res.data.token);
    
    navigate("/");
  } catch (error: any) {
    console.error("Login Error:", error.response?.data);
    alert("Login Failed: " + (error.response?.data || "Invalid Credentials"));
  } finally {
    setLoading(false);
  }
};

  return (
    <LoginRoot>
      <StyledLoginCard>
        <Typography variant="h4" color="primary" fontWeight={900} sx={{ mb: 3 }}>Login</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField {...register("email")} fullWidth label="Email" margin="normal" error={!!errors.email} />
          <TextField {...register("password")} fullWidth label="Password" type="password" margin="normal" error={!!errors.password} />
          <Button fullWidth variant="contained" type="submit" sx={{ mt: 3 }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
          </Button>
        </form>
        <Divider sx={{ my: 3 }}>OR</Divider>
        <GoogleButton fullWidth variant="outlined">Sign in with Google</GoogleButton>
        <Typography sx={{ mt: 2 }}>
          New here? <Link to="/register">Register</Link>
        </Typography>
      </StyledLoginCard>
    </LoginRoot>
  );
};

export default Login;