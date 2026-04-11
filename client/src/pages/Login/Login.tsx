import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextField, InputAdornment, CircularProgress, Divider, Typography } from "@mui/material";
import { Mail, Lock } from "lucide-react";
import axios from 'axios';
import { API_BASE_URL } from '../../services/api-client';
import { 
  LoginRoot, 
  StyledLoginCard, 
  GoogleButton, 
  FormTitle, 
  SubmitBtn, 
  SocialDivider, 
  FooterContainer, 
  FooterLink 
} from "./Login.styles";

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
      const res = await axios.post(`${API_BASE_URL}/auth/login`, data);
      
      // Extracting tokens and user info from the response
      const { accessToken, refreshToken, user } = res.data;
      
      // Saving user info and tokens to localStorage for session management
      localStorage.setItem("user", JSON.stringify(user || res.data));
      localStorage.setItem("accessToken", accessToken || res.data.token); // Backup for older response format
      localStorage.setItem("refreshToken", refreshToken); 
      
      navigate("/");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Login error:", err.response?.data);
      alert("Login Failed: " + (err.response?.data?.message || "Invalid Credentials"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <LoginRoot>
      <StyledLoginCard>
        <FormTitle variant="h4" color="primary">Login</FormTitle>
        
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
          <SubmitBtn fullWidth variant="contained" type="submit" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
          </SubmitBtn>
        </form>

        <SocialDivider>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="caption" sx={{ px: 2 }}>OR</Typography>
          <Divider sx={{ flex: 1 }} />
        </SocialDivider>

        <GoogleButton 
          fullWidth 
          variant="outlined" 
          onClick={handleGoogleLogin}
          startIcon={<img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" width={20} alt="G" />}
        >
          Sign in with Google
        </GoogleButton>

        <FooterContainer>
          <Typography variant="body2">
            New here? <FooterLink to="/register">Register</FooterLink>
          </Typography>
        </FooterContainer>
      </StyledLoginCard>
    </LoginRoot>
  );
};

export default Login;