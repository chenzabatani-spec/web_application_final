import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { TextField, InputAdornment, CircularProgress } from "@mui/material";
import { User, Mail, Lock, Camera } from "lucide-react";
import axios from 'axios';
import { API_BASE_URL } from '../../services/api-client';
import { 
  PageContainer, 
  RegisterCard, 
  AvatarSection, 
  StyledAvatarPicker, 
  PreviewAvatar,
  SubmitBtn,
  FormTitle,
  FooterContainer,
  FooterLink,
  HelperText
} from "./Register.styles";

const registerSchema = z.object({
  username: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
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
      if (image) formData.append("photo", image);

      await axios.post(`${API_BASE_URL}/auth/register`, formData);
      navigate("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Registration error:", error.response?.data);
        alert("Registration Failed: " + (error.response?.data?.message || "Please try again"));
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <RegisterCard>
        <FormTitle variant="h4" color="primary">Register</FormTitle>

        <AvatarSection>
          <input accept="image/*" type="file" id="upload-photo" style={{ display: 'none' }} onChange={handleImageChange} />
          <label htmlFor="upload-photo">
            <StyledAvatarPicker>
              {preview ? <PreviewAvatar src={preview} /> : <Camera size={32} />}
            </StyledAvatarPicker>
          </label>
          <HelperText variant="caption" color="textSecondary">Click to upload profile picture</HelperText>
        </AvatarSection>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField 
            {...register("username")} 
            fullWidth label="Full Name" margin="normal" error={!!errors.username} helperText={errors.username?.message}
            InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} /></InputAdornment> }}
          />

          <TextField 
            {...register("email")} 
            fullWidth label="Email" margin="normal" error={!!errors.email} helperText={errors.email?.message}
            InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} /></InputAdornment> }}
          />

          <TextField 
            {...register("password")} 
            fullWidth label="Password" type="password" margin="normal" error={!!errors.password} helperText={errors.password?.message}
            InputProps={{ startAdornment: <InputAdornment position="start"><Lock size={18} /></InputAdornment> }}
          />

          <SubmitBtn fullWidth variant="contained" type="submit" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
          </SubmitBtn>
        </form>

        <FooterContainer>
          <HelperText>
            Already have an account? <FooterLink to="/login">Login</FooterLink>
          </HelperText>
        </FooterContainer>
      </RegisterCard>
    </PageContainer>
  );
};

export default Register;