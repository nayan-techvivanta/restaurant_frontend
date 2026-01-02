import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiCheck,
  FiArrowLeft,
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
} from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Logo from "../../assets/images/Loginpage/Logo.png";
import bg02 from "../../assets/images/Loginpage/bg02.jpg";

const OTPInput = ({ code, setCode }) => {
  const inputs = Array(6).fill(0);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
    const newCode = code.split("");
    newCode[index] = value;
    setCode(newCode.join(""));

    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {inputs.map((_, index) => (
        <motion.input
          key={index}
          id={`otp-input-${index}`}
          type="text"
          maxLength={1}
          value={code[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-14 h-14 sm:w-16 sm:h-16 text-2xl font-bold text-center bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:border-yellow-400 focus:outline-none text-white transition-all duration-300 hover:border-white/50"
          style={{ letterSpacing: "1px" }}
        />
      ))}
    </div>
  );
};

export default function VerifyOtp() {
  const [code, setCode] = useState("");
  const [otpId, setOtpId] = useState(null);
  const [counter, setCounter] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpAutoFetched, setOtpAutoFetched] = useState(false);

  const navigate = useNavigate();
  const { userId } = useParams();
  const otpSentRef = useRef(false);

  const fetchLatestOtp = async () => {
    try {
      const response = await axiosInstance.post("/api/v1/auth/get-last-otp", {
        user_id: userId,
      });

      const otp = response.data?.data?.otp;
      if (otp) {
        setCode(otp.toString().padStart(6, "0"));
        toast.success("OTP auto-filled! Verifying...", {
          toastId: "otp-auto-fetch",
        });
        setOtpAutoFetched(true);

        setTimeout(() => {
          if (otpId) handleSubmit({ preventDefault: () => {} });
        }, 1500);
      }
    } catch (error) {
      console.error(
        "Failed to fetch latest OTP:",
        error.response?.data || error.message
      );
      toast.error("Failed to fetch latest OTP", { toastId: "fetch-otp-fail" });
    }
  };

  useEffect(() => {
    if (!userId || otpSentRef.current) return;

    otpSentRef.current = true;

    const lastOtpTime = localStorage.getItem("lastOtpSentTime");
    const now = Date.now();

    if (lastOtpTime) {
      const elapsed = (now - parseInt(lastOtpTime, 10)) / 1000;
      if (elapsed < 60) {
        setCounter(60 - Math.floor(elapsed));
        fetchLatestOtp();
        return;
      }
    }

    sendOtp();
  }, [userId]);

  useEffect(() => {
    if (counter === 0) return;

    const timer = setInterval(() => {
      setCounter((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [counter]);

  const sendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/api/v1/auth/send-auth-otp", {
        user_id: userId,
      });

      const { otp_id, message } = response.data;
      setOtpId(otp_id);
      toast.success(message || "OTP sent successfully!");

      localStorage.setItem("lastOtpSentTime", Date.now().toString());
      setCounter(60);

      setTimeout(() => {
        fetchLatestOtp();
      }, 2000);
    } catch (error) {
      console.error("OTP send failed:", error);
      toast.error(error.response?.data?.message || "Sending OTP failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!otpId) {
      toast.error("OTP ID missing. Please resend OTP.");
      return;
    }

    if (code.length !== 6) {
      toast.error("Please enter complete 6-digit code");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await axiosInstance.post(
        "/api/v1/auth/verify-auth-otp",
        {
          otp_id: otpId,
          otp: code,
        }
      );

      console.log("Verification Response:", response.data);

      const { message, data } = response.data;
      const token = data?.token;
      const userData = data;
      const isEmailVerified = data?.is_email_verified;

      toast.success(message || "Email verified successfully!");

      if (isEmailVerified && token) {
        localStorage.setItem("access_token", token);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", userData?.email);
        localStorage.setItem("userData", JSON.stringify(userData));

        localStorage.removeItem("temp_user_id");
        localStorage.removeItem("temp_user_email");
        localStorage.removeItem("temp_user_data");

        toast.success("Welcome  to dashboard...");

        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1500);
      } else {
        toast.error("Verification failed. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4 sm:p-6 lg:p-8 relative transition-all duration-1000 ease-in-out"
      style={{ backgroundImage: `url(${bg02})` }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center lg:justify-between z-10 lg:ps-10 gap-8 lg:gap-0">
        <motion.div
          className="hidden md:block text-white max-w-xl space-y-4 lg:space-y-6 m-auto"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.h1
            className="text-4xl sm:text-5xl xl:text-7xl font-extrabold leading-tight"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <span className="text-gray-100 block">Verify Your</span>
            <span
              className="block text-[#F5C857] drop-shadow-lg"
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              Email Address
            </span>
          </motion.h1>

          <div className="h-1 w-20 lg:w-24 bg-linear-to-r from-yellow-400 to-yellow-500 rounded-full shadow-md"></div>

          <motion.p
            className="text-base sm:text-lg xl:text-xl text-gray-200 leading-relaxed tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {otpAutoFetched
              ? "OTP auto-detected! Complete verification to access dashboard."
              : "Enter the 6-digit code sent to your email to access your secure dashboard."}
          </motion.p>
        </motion.div>

        {/* Mobile Header - EXACT Login Layout */}
        <motion.div
          className="md:hidden text-white text-center w-full max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            <span className="text-gray-100 block">Verify Your</span>
            <span
              className="block text-[#F5C857] drop-shadow-lg"
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              Email OTP
            </span>
          </motion.h1>
          <div className="h-1 w-16 bg-yellow-400 rounded-full shadow-md mx-auto mb-4"></div>
          <p className="text-sm text-gray-200 px-4">
            Enter OTP to access your dashboard
          </p>
        </motion.div>

        {/* Verification Form - EXACT Login Form Style */}
        <motion.div
          className="w-full max-w-md sm:max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex justify-center">
            <motion.img
              src={Logo}
              alt="Hotel Vivanta Logo"
              className="w-24 sm:w-32 md:w-36 lg:w-40 xl:w-44 object-contain drop-shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.7 }}
            />
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <motion.p
              className="text-gray-300 text-sm sm:text-base"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              Enter verification code to continue
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="text-white font-medium mb-2 block text-sm sm:text-base text-center">
                Verification Code
              </label>
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <OTPInput code={code} setCode={setCode} />
              </motion.div>
            </div>

            <div className="text-center">
              <motion.p
                className="text-sm text-gray-300 flex items-center justify-center gap-2 flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {counter > 0 ? (
                  <>
                    <FiClock className="text-yellow-400" />
                    Resend in {counter}s
                  </>
                ) : (
                  <>
                    Didn't receive code?{" "}
                    <motion.button
                      type="button"
                      onClick={sendOtp}
                      disabled={isLoading}
                      className="text-[#F5C857] font-semibold hover:text-yellow-300 underline flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isLoading ? (
                        <FiRefreshCw className="animate-spin text-sm" />
                      ) : (
                        "Resend OTP"
                      )}
                    </motion.button>
                  </>
                )}
              </motion.p>
            </div>

            <motion.button
              type="submit"
              disabled={isVerifying || code.length !== 6}
              className="w-full py-3 sm:py-3.5 text-base sm:text-lg font-semibold rounded-xl bg-linear-to-r from-yellow-500 to-yellow-600 text-black shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isVerifying ? (
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
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify Email</span>
                  <FiCheck className="text-lg sm:text-xl" />
                </>
              )}
            </motion.button>
          </form>

          <motion.div
            className="text-center mt-6 sm:mt-8 pt-4 border-t border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <motion.button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiArrowLeft />
              Back to Login
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
