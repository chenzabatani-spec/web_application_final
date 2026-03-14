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

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
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
      alert("Login Failed: " + (error.response?.data?.error || "Invalid Credentials"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  return (
    <LoginRoot>
      <StyledLoginCard>
        <Typography variant="h4" color="primary" fontWeight={900} sx={{ mb: 3 }}>Login</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField 
            {...register("email")} 
            fullWidth label="Email" margin="normal" 
            error={!!errors.email} helperText={errors.email?.message} 
            InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} /></InputAdornment> }}
          />
          <TextField 
            {...register("password")} 
            fullWidth label="Password" type="password" margin="normal" 
            error={!!errors.password} helperText={errors.password?.message}
            InputProps={{ startAdornment: <InputAdornment position="start"><Lock size={18} /></InputAdornment> }}
          />
          <Button fullWidth variant="contained" type="submit" sx={{ mt: 3 }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
          </Button>
        </form>
        <Box sx={{ my: 3, display: 'flex', alignItems: 'center' }}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="caption" sx={{ px: 2 }}>OR</Typography>
          <Divider sx={{ flex: 1 }} />
        </Box>
        <GoogleButton 
          fullWidth 
          variant="outlined" 
          onClick={handleGoogleLogin}
          startIcon={<img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width={20} alt="G" />}
        >
          Sign in with Google
        </GoogleButton>
        <Typography sx={{ mt: 4 }}>
          New here? <Link to="/register" style={{ color: '#4a148c', fontWeight: 800 }}>Register</Link>
        </Typography>
      </StyledLoginCard>
    </LoginRoot>
  );
};

export default Login;