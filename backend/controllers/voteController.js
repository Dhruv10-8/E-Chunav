import pool from '../config/db.js';
import Tesseract from 'tesseract.js';
import fetch from 'node-fetch';
import FormData from 'form-data';
import crypto from 'crypto';

export const verifyDoc = async (req, res) => {
    const userId = req.user.id
    try {
        const result = await pool.query(
            `SELECT * FROM users WHERE id = $1`,
            [userId]
        )
        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({ error: 'Document not approved' });
        }
        const response = await fetch(user.document_url)
        const buffer = await response.buffer();

        const { data: { text } } = await Tesseract.recognize(buffer, 'eng')
        // console.log(text);

        const foundMatch = text.includes(user.aadhar) || text.includes(user.pan);
        if (foundMatch) {
            await pool.query(`UPDATE users SET proof_status = 'approved' WHERE id = $1`, [userId]);
            return res.status(200).json({ proof_status: 'approved', message: 'Document verified successfully' });
        }
        else {
            return res.status(400).json({ error: 'Document verification failed, no match' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Document OCR verification failed' });
    }
}


export const submitVote = async (req, res) => {
    try {
        const userId = req.user.id
        const { candidateId } = req.body
        const result = await pool.query(`SELECT * from users where id = $1`, [userId])
        if (!result.rows[0]) { return res.status(404).json({ error: 'User not found' }); }
        if (result.rows[0].proof_status !== 'approved') {
            return res.status(403).json({ error: 'User not verified' });
        }
        if (result.rows[0].has_voted) {
            return res.status(400).json({ error: 'User has already voted' });
        }
        const timeStamp = new Date().toISOString();
        const voteData = `${candidateId}-${timeStamp}`;
        const voteHash = crypto.createHash('sha256').update(voteData).digest('hex');
        await pool.query(`INSERT INTO votes (user_id, candidate_id, vote_hash, timestamp) VALUES ($1, $2, $3, $4)`,
            [userId, candidateId, voteHash, timeStamp])
        await pool.query(`UPDATE users SET has_voted = true WHERE id = $1`, [userId]);
        res.status(200).json({ message: 'Vote submitted successfully', voteHash });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}