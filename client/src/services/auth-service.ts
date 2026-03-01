import apiClient from "./api-client";
import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  photo: z.any().optional(),
});

export type RegistrationFormData = z.infer<typeof registerSchema>;

const authService = {
    // Send registration data to the backend
    register: (data: RegistrationFormData) => {
        const formData = new FormData();
        formData.append("username", data.username);
        formData.append("email", data.email);
        formData.append("password", data.password);
        
        // If a photo was selected, append it to the form data
        if (data.photo && data.photo[0]) {
            formData.append("photo", data.photo[0]);
        }

        return apiClient.post("/auth/register", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }
};

export default authService;