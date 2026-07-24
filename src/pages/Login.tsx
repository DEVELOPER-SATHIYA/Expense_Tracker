import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Colors } from "../theme/colors";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Hook to track screen size for dynamic inline style adjustments
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      await login(email, password);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: Colors.white,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "center",
        alignItems: "stretch",
        padding: isMobile ? 12 : 24,
        fontFamily: "Inter, sans-serif",
        boxSizing: "border-box",
      }}
    >
    
      {!isMobile && (
        <div
          style={{
            flex: 1,
            background:
              "linear-gradient(135deg,#ff9f1c,#ffbf69,#2ec4b6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            padding: "40px",
            textAlign: "center",
            borderRadius: "18px 0 0 18px",
          }}
        >
          <div>
            <img
              src="/register-illustration.svg"
              alt="Register"
              style={{
                width: "80%",
                maxWidth: "450px",
                marginBottom: "16px",
              }}
            />

            <h1
              style={{
                fontSize: "42px",
                fontWeight: 700,
                marginBottom: "16px",
              }}
            >
              Welcome!
            </h1>

            <p
              style={{
                fontSize: "18px",
                opacity: 0.9,
                lineHeight: 1.6,
              }}
            >
              Create your account to manage your expenses, track reports, and
              organize your finances in one place.
            </p>
          </div>
        </div>
      )}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: Colors.white,
          padding: isMobile ? "12px 0" : "8px",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: 420,
            background: "#111827",
            borderRadius: 18,
            padding: isMobile ? "28px 20px" : 40,
            boxShadow: "0 20px 60px rgba(0,0,0,.25)",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            boxSizing: "border-box",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                margin: 0,
                color: Colors.white,
                fontSize: isMobile ? 24 : 30,
              }}
            >
              Welcome Back
            </h1>
            <p
              style={{
                marginTop: 8,
                color: "#6b7280",
                fontSize: 14,
              }}
            >
              Login to continue
            </p>
          </div>

          <div>
            <label
              style={{
                display: "block",
                color: Colors.white,
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Email
            </label>

            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                fontSize: 15,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                color: Colors.white,
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Password
            </label>

            <div
              style={{
                position: "relative",
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 50px 14px 16px",
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  fontSize: 15,
                  boxSizing: "border-box",
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 15,
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 10,
              padding: "15px",
              border: "none",
              borderRadius: 12,
              background: Colors.primaryLight,
              color: "#fff",
              fontWeight: 600,
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "0.25s",
            }}
          >
            {loading ? "Signing In..." : "Login"}
          </button>

          <p
            style={{
              textAlign: "center",
              color: "#6b7280",
              margin: 0,
              fontSize: 14,
            }}
          >
            Don't have an account?
            <Link
              to="/register"
              style={{
                marginLeft: 6,
                color: Colors.primaryLight,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}