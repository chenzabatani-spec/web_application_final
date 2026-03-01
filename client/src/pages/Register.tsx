import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Import the service as a default object AND the specific schema
import authService, { registerSchema } from '../services/auth-service';
import type { RegistrationFormData } from '../services/auth-service';

const Register: React.FC = () => {
    /**
     * Initialize useForm hook with Zod resolver
     * This connects our rules to the actual form
     */
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegistrationFormData>({
        resolver: zodResolver(registerSchema),
    });

    /**
     * Function called when form is valid and submitted
     */
    const onSubmit = (data: RegistrationFormData) => {
        console.log("Form submitted successfully:", data);
        // Next step: Send data to backend using Axios
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                
                {/* Username Input */}
                <div style={{ marginBottom: '10px' }}>
                    <input {...register('username')} placeholder="Username" style={{ width: '100%' }} />
                    {errors.username && <p style={{ color: 'red', fontSize: '12px' }}>{errors.username.message}</p>}
                </div>

                {/* Email Input */}
                <div style={{ marginBottom: '10px' }}>
                    <input {...register('email')} placeholder="Email" style={{ width: '100%' }} />
                    {errors.email && <p style={{ color: 'red', fontSize: '12px' }}>{errors.email.message}</p>}
                </div>

                {/* Password Input */}
                <div style={{ marginBottom: '10px' }}>
                    <input {...register('password')} type="password" placeholder="Password" style={{ width: '100%' }} />
                    {errors.password && <p style={{ color: 'red', fontSize: '12px' }}>{errors.password.message}</p>}
                </div>

                {/* Photo Upload - Lecture 11 Requirement */}
                <div style={{ marginBottom: '20px' }}>
                    <label>Profile Picture:</label>
                    <input {...register('photo')} type="file" accept="image/*" />
                </div>

                <button type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer' }}>
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default Register;