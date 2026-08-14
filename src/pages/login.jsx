import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for routing
import { patientApi } from "../api/patientApi";
import { userApi } from "../api/userApi";
import { useAuth } from "../lib/AuthContext";

export const Login = () => {
  // Initialize your hooks right inside the component
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    const payload = {
      ClientName: "QAPHB",
      ApiKey: "GrEkKFk7WLITYO3U0B98QUrW1jaLsYNByy3EFgtv",
      Username: formData.email,
      Password: formData.password,
    };

    try {
      // const response = await userApi.login(payload);
      // 1. Extract the token from your API response payload

      //const token = data.token;
      // 2. Save token to context & localStorage

      // This variable now holds response.data.Data returned from userApi
      const data = await userApi.login(payload);

      // Extract the token directly from the returned data
      // (Check your console to see if it is lowercase 'token' or uppercase 'Token')
      const token = data.Token;
      console.log("Extracted token value:", token);

      if (token) {
        login(token);
        navigate("/Patients");
      } else {
        setError(
          "Server responded successfully, but no token field was found in the payload.",
        );
      }
    } catch (err) {
      // Note: Your interceptor handles global error redirection to '/error',
      // but we catch it here to display the message locally in the form UI as well.
      setError(err.message || "Invalid credentials.");
    }

    // Handle authentication logic here
    console.log("Logging in with:", formData);
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-0 sm:p-4">
      {/* Main Container */}
      <div className="bg-white w-full max-w-5xl min-h-[600px] sm:rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        {/* LEFT SIDE: Extra Content/Branding (Hidden on mobile, visible on desktop) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-indigo-600 to-violet-500 p-12 text-white flex-col justify-between relative overflow-hidden">
          {/* Decorative background shapes */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-20 -right-10 w-60 h-60 bg-indigo-800/30 rounded-full blur-2xl"></div>

          {/* Logo / Brand Name */}
          <div className="flex items-center gap-2 z-10">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="text-indigo-600 font-bold text-xl">P</span>
            </div>
            <span className="font-semibold text-lg tracking-wide">
              Personal Health Budget -iChord
            </span>
          </div>

          <div className="my-auto z-10 max-w-md">
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Quality Framework
            </h1>
            <p className="text-indigo-100 text-lg font-light leading-relaxed">
              The PHB Quality Framework supports ICBs to create the conditions
              to meet PHB performance expectations, with a focus on improving
              operational delivery to: deliver high quality care improve the
              experience of PHB holders realise the ‘life changing’ outcomes
              that PHBs can deliver develop workforce confidence in
              commissioning and delivering PHBs ensure value for money.
            </p>
          </div>

          {/* Footer info inside the left panel */}
          <div className="z-10 pt-4 border-t border-white/20 flex justify-between items-center text-sm text-indigo-100">
            <p>© 2026 iChord -QAPlus</p>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">
                Privacy
              </a>
              <a href="#" className="hover:underline">
                Terms
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center">
          {/* Mobile Logo (Only shows when left panel is hidden) */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="font-semibold text-lg text-slate-800">iChord</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome back
            </h2>
            <p className="text-slate-500 text-sm">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-5 animate-fadeIn">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-900"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 block text-sm text-slate-600 cursor-pointer select-none"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-md shadow-indigo-600/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Sign in
            </button>

            {/* Third-Party Auth Separator */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="border-t border-slate-200 w-full absolute"></div>
              <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wider relative z-10">
                Or sign in with
              </span>
            </div>

            {/* Google Button */}
            <button
              type="button"
              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-4 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.98 1 12 1 7.35 1 3.37 3.65 1.39 7.5l3.78 2.93c.92-2.76 3.5-4.39 6.83-4.39z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.87 3.39-8.48z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.17 14.57c-.24-.71-.37-1.47-.37-2.27s.13-1.56.37-2.27L1.39 7.1c-.88 1.76-1.39 3.74-1.39 5.9s.51 4.14 1.39 5.9l3.78-2.93z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.66-2.84c-1.01.67-2.3 1.08-4.3 1.08-3.33 0-5.91-1.63-6.83-4.39L1.39 16.86C3.37 20.35 7.35 23 12 23z"
                />
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-sm text-slate-500 text-center mt-8">
            Don't have an account?{" "}
            <a
              href="#"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Sign up for free
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
