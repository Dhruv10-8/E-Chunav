"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { User, ArrowLeft } from "lucide-react";
import Link from "next/link";

const VoteVerificationPage = () => {
  const [docVerified, setDocVerified] = useState("");
  const [faceVerified, setFaceVerified] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [storedUrl, setStoredUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Get token from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    }
  }, []);

  // Start webcam
  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current!.srcObject = stream;
        })
        .catch((err) => {
          console.error("Webcam access denied:", err);
        });
    }
  }, []);

  // Fetch doc status and face image URL
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const docRes = await axios.get("http://localhost:8000/api/vote/verifydoc", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDocVerified(docRes.data.proof_status);

        const profileRes = await axios.get("http://localhost:8000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStoredUrl(profileRes.data.user.face_id_url);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchData();
  }, [token]);

  // Face capture + verification
  const captureAndSubmit = async () => {
    if (!videoRef.current || !canvasRef.current || !storedUrl) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    setIsCapturing(true);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("live_image", blob, "face.jpg");
      formData.append("stored_url", storedUrl);

      try {
        const res = await axios.post("http://localhost:8001/verify-face", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res.data.match) {
          setFaceVerified(true);
        } else {
          setFaceVerified(false);
        }
      } catch (err) {
        console.error("Face verification failed", err);
      } finally {
        setIsCapturing(false);
      }
    }, "image/jpeg");
  };

  const handleVote = () => {
    window.location.href = "./placevote";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Flag */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-12 rounded-lg overflow-hidden shadow-md">
            <div className="h-1/3 bg-orange-500"></div>
            <div className="h-1/3 bg-white"></div>
            <div className="h-1/3 bg-green-600"></div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
          Face ID Verification
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Verify your identity to proceed with voting
        </p>

        {/* Document Status */}
        <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Document Status:</span>
            <span className={`text-sm font-semibold ${docVerified === "approved" ? "text-green-600" : "text-red-600"}`}>
              {docVerified === "approved" ? "Verified ✅" : "Not Verified ❌"}
            </span>
          </div>
        </div>

        {/* Camera View */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 mb-6 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mb-4">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <button
            onClick={captureAndSubmit}
            disabled={faceVerified || isCapturing || docVerified !== "approved"}
            className={`px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 ${
              faceVerified
                ? "bg-green-600 hover:bg-green-700"
                : isCapturing
                ? "bg-orange-400"
                : docVerified !== "approved"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isCapturing ? "Verifying..." : faceVerified ? "Face Verified ✅" : "Start Face Verification"}
          </button>
        </div>

        {/* Proceed Button */}
        <button
          onClick={handleVote}
          disabled={docVerified !== "approved" || !faceVerified}
          className={`w-full py-3 rounded-lg font-medium text-white transition-all duration-200 mb-4 ${
            docVerified === "approved" && faceVerified
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Proceed to Vote
        </button>

        {/* Back Button */}
        <Link
          href="../profile"
          className="w-full py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          
          Back to Dashboard
        </Link>

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
};

export default VoteVerificationPage;
