/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function Signup() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [pan, setPan] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showVerifyBox, setShowVerifyBox] = useState(false);
  const [tokenInput, setTokenInput] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File must be < 5MB");
        return;
      }
      setDocument(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("dob", dob);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("aadhar", aadhar);
    formData.append("pan", pan);
    if (document) formData.append("document", document);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/signup",
        formData
      );
      setMessage(res.data.message);
      setShowVerifyBox(true);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.response?.data?.error || "Signup failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTokenSubmit = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/auth/verify-email?token=${tokenInput}`
      );
      setMessage(res.data.message || "Email verified successfully.");
      setShowVerifyBox(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Verification failed.");
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
            <h1 className="text-2xl font-bold text-gray-800 m-5">Sign Up</h1>
            <Link href="../login">
              <h2 className="text-lg text-gray-600 m-5">or login here</h2>
            </Link>
            {error && <p className="text-red-500">{error}</p>}
            {message && <p className="text-green-600">{message}</p>}

            {!showVerifyBox ? (
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
                encType="multipart/form-data"
              >
                <input
                  className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  required
                />
                <input
                  className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                  type="date"
                  placeholder="Date of Birth"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
                <input
                  className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
                <input
                  className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <input
                  className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                  value={aadhar}
                  onChange={(e) => setAadhar(e.target.value)}
                  placeholder="Aadhar Number"
                  required
                />
                <input
                  className="text-gray-800 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors"
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  placeholder="PAN Number"
                  required
                />

                <input
                  className="input"
                  placeholder="Uploads"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  required
                />
                {preview && (
                  <img src={preview} alt="Preview" className="w-32 mt-2" />
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Sign Up"}
                </button>
              </form>
            ) : (
              <div className="mt-4">
                <p className="mb-2">
                  Check your email for a verification link. Or enter the token
                  manually:
                </p>
                <input
                  className="input mb-2"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Enter verification token"
                />
                <button
                  className="btn bg-green-600 text-white px-4 py-2 rounded"
                  onClick={handleTokenSubmit}
                >
                  Verify Email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
