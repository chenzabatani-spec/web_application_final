import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// Import the service we updated with Axios
import authService, { registerSchema } from '../services/auth-service';
import type { RegistrationFormData } from '../services/auth-service';

const Register: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegistrationFormData>({
        resolver: zodResolver(registerSchema),
    });

    // We make this function async to wait for the Axios response
    const onSubmit = async (data: RegistrationFormData) => {
        try {
            console.log("Sending data to server...");
            const response = await authService.register(data);
            console.log("Success! User created:", response.data);
            alert("Registration successful!");
        } catch (error: any) {
            console.error("Registration failed:", error.response?.data || error.message);
            alert("Error: " + (error.response?.data || "Server error"));
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Inputs stay the same as before */}
                <div style={{ marginBottom: '10px' }}>
                    <input {...register('username')} placeholder="Username" style={{ width: '100%' }} />
                    {errors.username && <p style={{ color: 'red' }}>{errors.username.message}</p>}
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <input {...register('email')} placeholder="Email" style={{ width: '100%' }} />
                    {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <input {...register('password')} type="password" placeholder="Password" style={{ width: '100%' }} />
                    {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label>Profile Picture:</label>
                    <input {...register('photo')} type="file" accept="image/*" />
                </div>

                <button type="submit" style={{ width: '100%', padding: '10px' }}>Sign Up</button>
            </form>
        </div>
    );
};

export default Register;