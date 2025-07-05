"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

const VotingPage = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(115); // 1:55 in seconds
  const [totalTime] = useState(115); // Total voting time

  // Fetch candidates on load
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/getcandidates/candidates"
        );
        setCandidates(response.data);
      } catch (error) {
        console.error("Error fetching candidates:", error);
        setError("Failed to fetch candidates. Please try again later.");
      }
    };
    fetchCandidates();
  }, []);

  // Timer countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Redirect to profile if time runs out
  useEffect(() => {
    if (timeLeft <= 0) {
      setError("Voting time is up! Redirecting to your profile...");
      const redirectTimer = setTimeout(() => {
        window.location.href = "../profile";
      }, 5000); // 5s grace before redirect
      return () => clearTimeout(redirectTimer);
    }
  }, [timeLeft]);

  const handleVote = async () => {
    if (!selectedCandidate) {
      setError("Please select a candidate to vote for.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to vote.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:8000/api/vote/submitvote",
        { candidateId: selectedCandidate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setSuccess("Your vote has been successfully submitted! Redirecting...");
        setError("");
        setSelectedCandidate(null);

        setTimeout(() => {
          window.location.href = "../profile";
        }, 3000); // 3s before redirect for user acknowledgment
      } else {
        setError(
          "Failed to submit your vote. Please try again. If you have already voted, you cannot vote again."
        );
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      setError("Failed to submit your vote. Please try again later.");
    }
  };

  const handleCancel = () => {
    window.location.href = "../profile";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
          <div className="items-center space-x-2">
            <div className="w-12 h-2 bg-orange-500 rounded-t"></div>
            <div className="w-12 h-2 bg-white rounded-t"></div>
            <div className="w-12 h-2 bg-green-500 rounded-t"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 ml-2">
            Cast Your Vote
          </h1>
          <div className="text-right">
            <span className="text-red-500 font-bold text-lg">
              Time Left: {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Select Your Candidate
            </h2>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
              <div
                className="bg-gradient-to-r from-orange-500 to-green-500 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          {/* Candidates List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedCandidate === candidate.id
                    ? "border-orange-500 bg-orange-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                onClick={() => setSelectedCandidate(candidate.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                      {candidate.name}
                    </h3>
                    <Image
                      src={candidate.symbol_url || "/placeholder.png"}
                      alt={`${candidate.name}'s photo`}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                    <p className="text-blue-600 font-medium mb-1">
                      {candidate.party}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {candidate.constituency}
                    </p>
                  </div>
                  <div>
                    <input
                      type="radio"
                      name="candidate"
                      value={candidate.id}
                      checked={selectedCandidate === candidate.id}
                      onChange={() => setSelectedCandidate(candidate.id)}
                      className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleCancel}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleVote}
              disabled={!selectedCandidate}
              className={`px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                selectedCandidate
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              📝 <span>Submit Vote</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingPage;
