"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

const UserProfile = () => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [file, setfile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8000/api/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data.user);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile.");
      }
    };

    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setfile(e.target.files[0]);
    }
  };

  const handleFaceUpload = async () => {
    if (!file || !user) return;

    const formData = new FormData();
    formData.append("file", file); // 👈 matches multer field name
    formData.append("id", user.id);
    formData.append("name", user.name);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/vote/uploadface",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUploadMessage("Face uploaded successfully.");
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadMessage("Upload failed.");
    }
  };

  if (error) return <p className="text-red-600">{error}</p>;
  if (!user) return <p>Loading profile...</p>;

  return (
    <div>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-6 rounded overflow-hidden border border-gray-300">
                <div className="h-2 bg-orange-500"></div>
                <div className="h-2 bg-white"></div>
                <div className="h-2 bg-green-600"></div>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Digital Voting Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.name}</span>
            </div>
          </div>
        </div>
      </header>
      <div className="min-h-screen bg-gray-50 flex items-left p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl text-lg text-gray-600 m-5 shadow-lg p-8">
            <h1 className="text-2xl font-bold mb-4 text-gray-600 m-5">
              User Profile
            </h1>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Aadhar:</strong> {user.aadhar}
            </p>
            <p>
              <strong>PAN:</strong> {user.pan}
            </p>

            <hr className="my-4" />

            <div>
              <label className="block mb-2 font-medium">Upload Face ID</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mb-2 border-green-300 w-full px-4 py-3 outline-3px"
              />
              <button
                onClick={handleFaceUpload}
                className="bg-orange-500 text-white px-4 py-2 rounded"
              >
                Upload Face
              </button>
              {uploadMessage && (
                <p className="mt-2 text-sm text-green-700">{uploadMessage}</p>
              )}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center mb-4">
                <div className="h-6 w-6 text-orange-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Want to vote?
                </h2>
              </div>
              <p className="text-gray-600 mb-6">
                Click below to proceed with the voting process.
              </p>
              <Link href="../votes">
                <button className="w-full bg-white hover:bg-gray-50 text-orange-600 font-medium py-3 px-4 rounded-lg border border-green-200 transition-colors">
                  Start voting
                </button>
              </Link>
            </div>
            {/* Candidates & Parties Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center mb-4">
                <div className="h-6 w-6 text-green-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Candidates & Parties
                </h2>
              </div>
              <p className="text-gray-600 mb-6">
                Learn about the candidates and political parties in your
                constituency.
              </p>

              <button className="w-full bg-white hover:bg-gray-50 text-green-600 font-medium py-3 px-4 rounded-lg border border-green-200 transition-colors">
                View Candidates
              </button>
            </div>

            {/* How to Vote Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center mb-4">
                <div className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  How to Vote
                </h2>
              </div>
              <p className="text-gray-600 mb-6">
                Step-by-step guide on how to use the digital voting platform.
              </p>

              <button className="w-full bg-white hover:bg-gray-50 text-blue-600 font-medium py-3 px-4 rounded-lg border border-blue-200 transition-colors">
                Read Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
