"use client";
import React from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

const Candidates = () => {
  const [candidates, setCandidates] = React.useState([]);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
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
  return (
    <div className="bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-6 rounded overflow-hidden border border-gray-300">
                <div className="h-2 bg-orange-500"></div>
                <div className="h-2 bg-white"></div>
                <div className="h-2 bg-green-600"></div>
              </div>
              <Link href="../profile">
                <h1 className="text-xl font-bold text-gray-900">
                  Digital Voting Portal
                </h1>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <h1 className="text-3xl font-bold text-gray-800 mb-8 px-8 py-3">
        Candidates - Delhi Central Constituency
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="px-8 space-y-4">
        {candidates.map((candidate, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-gray-400 w-8">
                  {index + 1}
                </span>
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                  <Image
                    src={candidate.symbol_url || "/placeholder.png"}
                    alt={`${candidate.name}'s photo`}
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {candidate.name}
                </h3>
                <p className="text-blue-600 font-medium mb-1">
                  {candidate.party}
                </p>
                <p className="text-gray-500 text-sm">
                  {candidate.constituency}
                </p>
                {candidate.description && (
                  <p className="text-gray-600 text-sm mt-2">
                    {candidate.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {candidates.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">Loading candidates...</div>
        </div>
      )}
    </div>
  );
};

export default Candidates;
