import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import authService from "../services/auth-service";
import { useNavigate } from "react-router-dom";

const SERVER_URL = import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:3000";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormFields = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormFields>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormFields) => {
    try {
      await authService.login(data);
      navigate("/"); 
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid email or password");
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to the backend route that starts the Google OAuth flow
    window.location.href = `${SERVER_URL}/auth/google`;
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Email</label>
          <input {...register("email")} type="email" />
          {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
        </div>

        <div>
          <label>Password</label>
          <input {...register("password")} type="password" />
          {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}
        </div>
        <button type="submit" style={{ marginTop: "10px" }}>Login</button>
      </form>

      <div className="separator-container">
        <div className="separator-line"></div>
        <span className="separator-text">OR</span>
        <div className="separator-line"></div>
      </div>

      <button onClick={handleGoogleLogin} style={{ backgroundColor: "#4285F4", color: "white", padding: "10px", border: "none", borderRadius: "4px" }}>
        Login with Google
      </button>

    </div>
  );
};

export default Login;