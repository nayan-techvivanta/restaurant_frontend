
import React, { useState } from "react";
import bgImg from "../../assets/images/Loginpage/bg01.jpg";
import { useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiUser,
  FiPhone,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
} from "react-icons/fi";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log("Registration attempt:", formData);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4 sm:p-6 lg:p-8 relative"
      style={{
        backgroundImage: `url(${bgImg})`,
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center lg:justify-between z-10 lg:ps-10 gap-6 sm:gap-8 lg:gap-0">
        
        {/* Left Side Content - Hidden on mobile, shown on tablets and larger */}
        <div className="hidden md:block text-white max-w-xl space-y-4 lg:space-y-6 m-auto">
          <h1 className="text-4xl sm:text-5xl xl:text-7xl font-extrabold leading-tight">
            <span className="text-gray-100 block">Join</span>
            <span
              className="block text-yellow-400 drop-shadow-lg"
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              Hotel Vivanta
            </span>
          </h1>

          <div className="h-1 w-20 lg:w-24 bg-yellow-400 rounded-full shadow-md"></div>

          <p className="text-base sm:text-lg xl:text-xl text-gray-200 leading-relaxed tracking-wide">
            Create your account to unlock exclusive benefits and personalized
            experiences. Join our community of valued guests and enjoy special
            offers tailored just for you.
          </p>
        </div>

        {/* Mobile Header - Only shows on small screens */}
        <div className="md:hidden text-white text-center w-full max-w-md">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            <span className="text-gray-100 block">Join</span>
            <span
              className="block text-yellow-400 drop-shadow-lg"
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
            Create your account to get started
          </p>
        </div>

        {/* Registration Form */}
        <div className="w-full max-w-md sm:max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Create Account
            </h2>
            <p className="text-gray-300 text-sm sm:text-base">
              Sign up to start your journey with us
            </p>
          </div>

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center bg-white/10 border border-white/20 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-sm transition-all duration-300 hover:border-white/40 focus-within:border-yellow-400">
                  <FiUser className="text-gray-300 text-lg sm:text-xl" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="bg-transparent w-full outline-none px-3 py-1 text-white placeholder-gray-400 text-sm sm:text-base"
                    placeholder="First name"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center bg-white/10 border border-white/20 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-sm transition-all duration-300 hover:border-white/40 focus-within:border-yellow-400">
                  <FiUser className="text-gray-300 text-lg sm:text-xl" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="bg-transparent w-full outline-none px-3 py-1 text-white placeholder-gray-400 text-sm sm:text-base"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
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

            {/* Phone Field */}
            <div>
              <div className="flex items-center bg-white/10 border border-white/20 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-sm transition-all duration-300 hover:border-white/40 focus-within:border-yellow-400">
                <FiPhone className="text-gray-300 text-lg sm:text-xl" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="bg-transparent w-full outline-none px-3 py-1 text-white placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
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
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 p-1"
                >
                  {showPassword ? (
                    <FiEyeOff className="text-lg sm:text-xl" />
                  ) : (
                    <FiEye className="text-lg sm:text-xl" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <div className="flex items-center bg-white/10 border border-white/20 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-sm transition-all duration-300 hover:border-white/40 focus-within:border-yellow-400">
                <FiLock className="text-gray-300 text-lg sm:text-xl" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="bg-transparent w-full outline-none px-3 py-1 text-white placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 p-1"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="text-lg sm:text-xl" />
                  ) : (
                    <FiEye className="text-lg sm:text-xl" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <label className="flex items-start text-gray-300 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  className="mr-2 rounded bg-white/10 border-white/20 text-yellow-400 focus:ring-yellow-400 mt-1 w-4 h-4 sm:w-5 sm:h-5"
                  required
                />
                <span className="text-xs sm:text-sm">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
                  >
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full py-3 sm:py-3.5 text-base sm:text-lg font-semibold rounded-xl bg-linear-to-r from-yellow-500 to-yellow-600 text-black shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <span>Create Account</span>
              <FiArrowRight className="text-lg sm:text-xl" />
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center text-gray-300 mt-6 sm:mt-8">
            <p className="text-sm sm:text-base mb-3">
              Already have an account?
            </p>
            <button
              onClick={() => navigate("/login")}
              className="text-yellow-400 font-semibold hover:text-yellow-300 transition-colors duration-300 flex items-center justify-center mx-auto"
            >
              <FiArrowLeft className="mr-2" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}