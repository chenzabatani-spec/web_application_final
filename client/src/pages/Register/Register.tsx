import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { Box, Typography, TextField, Button, InputAdornment, CircularProgress, Avatar, IconButton } from "@mui/material";
import { User, Mail, Lock, Camera } from "lucide-react";
import axios from 'axios';
import { PageContainer, RegisterCard, AvatarSection } from "./Register.styles";

const registerSchema = z.object({
  username: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
  setLoading(true);
  try {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);
    
    if (image) {
      formData.append("photo", image);
    }

    const res = await axios.post("http://localhost:3000/auth/register", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    navigate("/login");
  } catch (error: any) {
    console.error("Register Error:", error.response?.data);
    alert("Registration Failed: " + (error.response?.data?.message || "Check Server Logs"));
  } finally {
    setLoading(false);
  }
 };

  return (
    <PageContainer>
      <RegisterCard>
        <Typography variant="h4" color="primary" fontWeight={900} sx={{ mb: 3 }}>Register</Typography>
        <AvatarSection>
            <Box sx={{ position: 'relative' }}>
                <Avatar src={preview} sx={{ width: 100, height: 100, mb: 2 }} />
                <input accept="image/*" type="file" id="upload-photo" style={{ display: 'none' }} onChange={handleImageChange} />
                <label htmlFor="upload-photo">
                    <IconButton component="span" sx={{ position: 'absolute', bottom: 5, right: -5, bgcolor: 'white' }}>
                        <Camera size={18} />
                    </IconButton>
                </label>
            </Box>
        </AvatarSection>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField {...register("username")} fullWidth label="Full Name" margin="normal" error={!!errors.username} />
          <TextField {...register("email")} fullWidth label="Email" margin="normal" error={!!errors.email} />
          <TextField {...register("password")} fullWidth label="Password" type="password" margin="normal" error={!!errors.password} />
          <Button fullWidth variant="contained" type="submit" sx={{ mt: 3 }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
          </Button>
        </form>
        <Typography sx={{ mt: 2 }}>
          Already have an account? <Link to="/login">Login</Link>
        </Typography>
      </RegisterCard>
    </PageContainer>
  );
};

export default Register;