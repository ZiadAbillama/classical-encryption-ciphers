import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Shield } from "lucide-react";

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const OAuthCallbackPage = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = query.get("token");
    const id = query.get("id");
    const name = query.get("name") || "User";
    const email = query.get("email") || "";

    if (!token || !id) {
      setError("Missing authentication data. Please log in again.");
      return;
    }

    // Store JWT just like normal login/signup
    localStorage.setItem("auth_token", token);

    // Update global auth state
    login({
      id,
      name,
      email,
      avatar: null,
      joinDate: new Date().toISOString(),
      token,
    });

    // Go to home
    navigate("/", { replace: true });
  }, [query, login, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="bg-slate-900/80 border border-red-500/40 rounded-3xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-300 mb-2">
            OAuth Error
          </h1>
          <p className="text-slate-200 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Loading state while we process query params
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="bg-slate-900/80 border border-slate-700 rounded-3xl p-8 max-w-md w-full flex flex-col items-center">
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-700 rounded-2xl blur-lg opacity-75" />
            <div className="relative bg-gradient-to-r from-cyan-600 to-purple-700 p-4 rounded-2xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">
          Signing you in…
        </h1>
        <p className="text-slate-300 text-sm mb-4">
          Please wait while we complete your secure login.
        </p>
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
