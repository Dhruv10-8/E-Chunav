"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<"email" | "aadhar" | "pan">(
    "email"
  );
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:8000/api/auth/login", {
        loginType,
        identifier,
        password,
      });

      setUserId(res.data.id); // from backend
      setShowOtpInput(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/verify-otp",
        {
          identifier,
          otp,
        }
      );

      localStorage.setItem("token", res.data.token);
      router.push("../profile");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header with Indian Flag */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-12 mb-4">
              <div className="w-full h-full rounded-md overflow-hidden border border-gray-200">
                <div className="h-1/3 bg-orange-500"></div>
                <div className="h-1/3 bg-white"></div>
                <div className="h-1/3 bg-green-600"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Login to E-Chunav
            </h1>
            <Link href="../register">
              <h2 className="text-lg text-gray-600 m-5">or create account here</h2>
            </Link>
            {error && <p className="text-red-600">{error}</p>}

            {!showOtpInput ? (
              <form onSubmit={handleLogin} className="space-y-4 text-gray-800">
                <select
                  value={loginType}
                  onChange={(e) =>
                    setLoginType(e.target.value as "email" | "aadhar" | "pan")
                  }
                  className="input"
                >
                  <option value="email">Email</option>
                  <option value="aadhar">Aadhar</option>
                  <option value="pan">PAN</option>
                </select>

                <input
                  type={loginType === "email" ? "email" : "text"}
                  placeholder={`Enter your ${loginType}`}
                  className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />

                <input
                  type="password"
                  className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending OTP..." : "Login"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter OTP sent to your email"
                  className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 rounded"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
