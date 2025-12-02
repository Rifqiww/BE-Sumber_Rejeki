import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import LOGO from "../assets/LOGO.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data.data;

      if (user.role !== "admin") {
        setError("Access denied. Admin privileges required.");
        setIsLoading(false);
        return;
      }

      login(token, user);
      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);
      const message =
        err.response?.data?.message || err.message || "Login failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary relative overflow-hidden font-sans">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-primary-light/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-tertiary p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/20 relative z-10 backdrop-blur-sm">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20 transform rotate-3 hover:rotate-0 transition-all duration-500">
            <img src={LOGO} alt="Logo" className="w-14 h-14 object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-primary mb-2 tracking-tight">
            Akses Admin
          </h2>
          <p className="text-quaternary font-medium">
            Masukkan kredensial Anda untuk melanjutkan
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm flex items-center border border-red-100 animate-shake shadow-sm">
            <span className="mr-2 font-bold text-lg">!</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-primary ml-1">
              Alamat Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-quaternary group-focus-within:text-secondary transition-colors" />
              </div>
              <input
                type="email"
                className="w-full pl-11 pr-4 py-4 bg-white border-2 border-transparent focus:border-secondary rounded-2xl focus:ring-0 transition-all outline-none text-primary placeholder-quaternary/40 shadow-sm font-medium"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-primary ml-1">
              Kata Sandi
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-quaternary group-focus-within:text-secondary transition-colors" />
              </div>
              <input
                type="password"
                className="w-full pl-11 pr-4 py-4 bg-white border-2 border-transparent focus:border-secondary rounded-2xl focus:ring-0 transition-all outline-none text-primary placeholder-quaternary/40 shadow-sm font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-secondary py-4 rounded-2xl font-bold text-lg hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center group mt-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={24} />
                Memuat...
              </>
            ) : (
              <>
                Masuk Dashboard
                <ArrowRight
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                  size={20}
                />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-xs text-quaternary/60 font-medium">
            © 2025 SR Admin Dashboard. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
