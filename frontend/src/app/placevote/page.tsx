'use client'
import React, { useEffect } from 'react'
import axios from 'axios';

const page = () => {
    const [candidates, setCandidates] = React.useState([]);
    const [selectedCandidate, setSelectedCandidate] = React.useState(null);
    const [error, setError] = React.useState("");
    const [success, setSuccess] = React.useState("");

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/getcandidates/candidates');
                setCandidates(response.data);
            } catch (error) {
                console.error("Error fetching candidates:", error);
                setError("Failed to fetch candidates. Please try again later.");
            }
        }
        fetchCandidates();
    }, [])

    const handleVote = async () => {
        if (!selectedCandidate) {
            setError("Please select a candidate to vote for.");
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            setError("You must be logged in to vote.");
            return;
        }
        try {
            const response = await axios.post('http://localhost:8000/api/vote/submitvote', {
                candidateId: selectedCandidate,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            }
            )
            if (response.status === 200) {
                setSuccess("Your vote has been successfully submitted!");
                setError("");
                // Optionally, you can redirect or clear the selection
                setSelectedCandidate(null);
            } else {
                setError("Failed to submit your vote. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting vote:", error);
            setError("Failed to submit your vote. Please try again later.");
        }
    }
    return (
        <div>
            <h1>Place Your Vote</h1>
            <p>Please confirm your vote below:</p>
            <ul>
                {candidates.map((candidate) => (
                    <li key={candidate.id}>
                        <label>
                            <input
                                type="radio"
                                name="candidate"
                                value={candidate.id}
                                checked={selectedCandidate === candidate.id}
                                onChange={() => setSelectedCandidate(candidate.id)}
                            />
                            {candidate.name}
                        </label>
                    </li>
                ))}
            </ul>
            <button
                onClick={() => {
                    if (selectedCandidate) {
                        // Submit the vote
                    }
                }}
            >
                Submit Vote
            </button>
        </div>
    )
}


export default page
