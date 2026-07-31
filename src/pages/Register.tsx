import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { markNeedsOnboarding } from "../utils/onboarding";
import logo from "../assets/money-leak-logo.png";

export default function Register() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await signup(email, password);
      markNeedsOnboarding();
      toast.success("Registration successful");
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
    <div className="flex min-h-[100dvh] bg-[#0d1117]">
      <div className="safe-px safe-pb flex flex-1 items-center justify-center p-4 sm:p-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-5 rounded-2xl border border-white/[0.07] bg-[#161b22] p-5 shadow-2xl sm:p-8"
        >
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <img
              src={logo}
              alt="கல்லாப்பெட்டி"
              className="mb-3 h-16 w-16 object-contain lg:hidden"
            />
            <h2 className="text-2xl font-bold text-white">Create account</h2>
            <p className="mt-1 text-sm text-slate-400">
              Start plugging the leaks in your spending
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-700 bg-[#0d1117] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full rounded-xl border border-slate-700 bg-[#0d1117] px-4 py-3 pr-12 text-sm text-white outline-none placeholder:text-slate-600 focus:border-amber-500/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Confirm password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full rounded-xl border border-slate-700 bg-[#0d1117] px-4 py-3 pr-12 text-sm text-white outline-none placeholder:text-slate-600 focus:border-amber-500/50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-[#0d1117] transition hover:bg-amber-400 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-amber-400 hover:text-amber-300"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>

      <div className="relative hidden w-[46%] overflow-hidden border-l border-white/[0.06] lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(244,63,94,0.12),_transparent_50%)]" />
        <img
          src={logo}
          alt="கல்லாப்பெட்டி"
          className="relative z-10 mb-6 h-44 w-44 object-contain drop-shadow-2xl"
        />
        <h1 className="relative z-10 text-3xl font-bold tracking-tight text-white">
          கல்லாப்பெட்டி
        </h1>
        <p className="relative z-10 mt-3 max-w-sm text-center text-sm leading-relaxed text-slate-400">
          Know exactly where cash slips away — categories, payment methods, and
          monthly trends in one place.
        </p>
      </div>
    </div>
  );
}
