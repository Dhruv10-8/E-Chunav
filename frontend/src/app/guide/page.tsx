"use client";
import React from "react";
import Link from "next/link";

const Candidates = () => {
  
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
        Your Guide to Voting
      </h1>
      <div className="px-8 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Introduction</h2>
        <p className="text-gray-600">
          Welcome to the Digital Voting Portal! This guide will help you navigate the voting process and make your voice heard.
        </p>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Steps to Vote</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            <strong>Register:</strong> Register using all your details. Name, Email, Password, Aadhaar number and PAN number are necessary. Uploading documents like AAdhar and PAN is STRICTLY needed. In case of Fake aadhaar, you will face legal action.
            Click on verify email button and open the link which is sent to your email by 'testdriver999@gmail.com'
          </li>
          <li>
            <strong>Login:</strong> Use your email/aadhar/PAN to log in to the Digital Voting Portal. Open email to check the OTP which is valid for 5 minutes.
          </li>
          <li>
            <strong>Review Candidates:</strong> Take time to review the candidates and their policies before casting your vote. You can review them on the Candidates page.
          </li>
          <li>
            <strong>Cast Your Vote:</strong> Upload your face's photo, skip if already uploaded. Then verify your face using face scan and document verification will happen automatically. Finally, select the person you want to vote for and submit vote.
            WARNING: Once you submit your vote, it cannot be changed. Make sure you are certain before submitting.
          </li>
        </ol>
      </div>
    </div>
  );
};

export default Candidates;
