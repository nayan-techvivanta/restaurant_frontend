import React, { useEffect, useState } from "react";
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import Logo from "../../assets/images/Loginpage/Logo.png";
import bg01 from "../../assets/images/Loginpage/bg01.jpg";
import bg02 from "../../assets/images/Loginpage/bg02.jpg";
import bg03 from "../../assets/images/Loginpage/bg03.jpg";
import bg04 from "../../assets/images/Loginpage/bg04.jpg";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        toast.error("Please fill in all fields");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      const response = await axiosInstance.post("/api/v1/auth/login-email", {
        email: formData.email,
        password: formData.password,
        type: "staff",
      });

      const data = response.data;

      const token = data?.data?.access_token;

      if (!token) {
        toast.error("Token not received from server");
        return;
      }

      
      localStorage.setItem("access_token", token);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", data?.data?.email || formData.email);

      toast.success("Login successful!");

      // Redirect after short delay
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);

      // API error handling
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.response?.status === 401) {
        toast.error("Invalid email or password");
      } else if (err.code === "ERR_NETWORK") {
        toast.error("Network error. Please check your internet connection.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4 sm:p-6 lg:p-8 relative transition-all duration-1000 ease-in-out"
      style={{
        backgroundImage: `url(${bg02})`,
      }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Main Container */}
      <div className="relative w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center lg:justify-between z-10 lg:ps-10 gap-8 lg:gap-0">
        <div className="hidden md:block text-white max-w-xl space-y-4 lg:space-y-6 m-auto">
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl xl:text-7xl font-extrabold leading-tight">
            <span className="text-gray-100 block">Welcome To</span>
            <span
              className="block text-[#F5C857] drop-shadow-lg"
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              Restaurant Vivanta
            </span>
          </h1>

          {/* Underline */}
          <div className="h-1 w-20 lg:w-24 bg-yellow-400 rounded-full shadow-md"></div>

          {/* Description */}
          <p className="text-base sm:text-lg xl:text-xl text-gray-200 leading-relaxed tracking-wide">
            Experience a seamless login experience with industry-level security.
            Enjoy a clean, fast, and user-friendly dashboard trusted by
            professionals across the hospitality sector.
          </p>
        </div>

        {/* Mobile Header - Only shows on small screens */}
        <div className="md:hidden text-white text-center w-full max-w-md">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            <span className="text-gray-100 block">Welcome To</span>
            <span
              className="block text-[#F5C857] drop-shadow-lg"
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              Hotel Vivanta
            </span>
          </h1>
          <div className="h-1 w-16 bg-yellow-400 rounded-full shadow-md mx-auto mb-4"></div>
          <p className="text-sm text-gray-200 px-4">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md sm:max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-8">
          {/* Logo */}
          <div className="flex justify-center ">
            <img
              src={Logo}
              alt="Hotel Vivanta Logo"
              className="
              w-24        
              sm:w-32     
              md:w-36     
              lg:w-40     
              xl:w-44     
              object-contain 
              drop-shadow-lg
    "
            />
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <p className="text-gray-300 text-sm sm:text-base">
              Sign in to continue your journey
            </p>
          </div>

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="text-white font-medium mb-2 block text-sm sm:text-base">
                Email Address
              </label>
              <div className="flex items-center bg-white/10 border border-white/20 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-sm transition-all duration-300 hover:border-white/40 focus-within:border-yellow-400">
                <FiMail className="text-gray-300 text-lg sm:text-xl" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-transparent w-full outline-none px-3 py-1 text-white placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-white font-medium mb-2 block text-sm sm:text-base">
                Password
              </label>
              <div className="flex items-center bg-white/10 border border-white/20 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-sm transition-all duration-300 hover:border-white/40 focus-within:border-yellow-400">
                <FiLock className="text-gray-300 text-lg sm:text-xl" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-transparent w-full outline-none px-3 py-1 text-white placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Enter your password"
                  required
                />
                {/* Password Toggle Button */}
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-300 hover:text-[#F5C857] transition-colors duration-200 p-1"
                >
                  {showPassword ? (
                    <FiEyeOff className="text-lg sm:text-xl" />
                  ) : (
                    <FiEye className="text-lg sm:text-xl" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <label className="flex items-center text-gray-300 cursor-pointer text-sm sm:text-base">
                <input
                  type="checkbox"
                  className="mr-2 rounded bg-white/10 border-white/20 text-[#F5C857] focus:ring-yellow-400 w-4 h-4 sm:w-5 sm:h-5"
                />
                Remember me
              </label>
              <a
                href="#"
                className="text-[#F5C857] hover:text-yellow-300 transition-colors duration-300 text-sm"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 sm:py-3.5 text-base sm:text-lg font-semibold rounded-xl bg-linear-to-r from-yellow-500 to-yellow-600 text-black shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login to Account</span>
                  <FiArrowRight className="text-lg sm:text-xl" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center texat-gray-300 mt-6 sm:mt-8 text-sm sm:text-base">
            Don't have an account?{" "}
            <button
              type="button"
              // onClick={() => navigate("/register")}
              className="text-[#F5C857] font-semibold hover:text-yellow-300 transition-colors duration-300"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
