import pool from '../config/db.js';
export const getCandidates = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM candidates`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch candidates' });
    }
}