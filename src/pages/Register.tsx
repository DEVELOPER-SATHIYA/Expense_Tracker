import { useState, useEffect } from "react";
import type { FormEvent, CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import Colors from "../theme/colors";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await signup(email, password);

      toast.success("Registration Successful");

      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
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
      {/* Form Panel */}
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
        <div
          style={{
            width: "100%",
            maxWidth: 460,
            background: "#111827",
            borderRadius: 20,
            padding: isMobile ? "28px 20px" : "32px",
            boxShadow: "0 20px 40px rgba(0,0,0,.08)",
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? 24 : 32,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              Create Your Account
            </h1>

            <p
              style={{
                marginTop: 6,
                color: "#6b7280",
                fontSize: isMobile ? 14 : 15,
              }}
            >
              Join our platform and unlock all features.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div>
              <label style={labelStyle}>Email</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>

              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  required
                  style={{
                    ...inputStyle,
                    paddingRight: 48,
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeButton}
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Confirm Password</label>

              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  style={{
                    ...inputStyle,
                    paddingRight: 48,
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  style={eyeButton}
                >
                  {showConfirmPassword ? (
                    <Eye size={16} />
                  ) : (
                    <EyeOff size={16} />
                  )}
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
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              marginTop: 16,
            }}
          >
            <span
              style={{
                color: "#6b7280",
                fontSize: 15,
              }}
            >
              Already have an account?
            </span>

            <Link
              to="/login"
              style={{
                marginLeft: 8,
                color: Colors.primaryLight,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Log In
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Illustration Side Panel - Hidden on Mobile */}
      {!isMobile && (
        <div
          style={{
            flex: 1,
            background:
              "linear-gradient(135deg, #ff9f1c, #ffbf69, #2ec4b6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            padding: "40px",
            textAlign: "center",
            borderRadius: "0 20px 20px 0",
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
    </div>
  );
}

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: 6,
  textAlign: "left",
  fontWeight: 600,
  color: "#fff",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 15,
  boxSizing: "border-box",
};

const eyeButton: CSSProperties = {
  position: "absolute",
  top: "50%",
  right: 12,
  transform: "translateY(-50%)",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 18,
  display: "flex",
  alignItems: "center",
};
