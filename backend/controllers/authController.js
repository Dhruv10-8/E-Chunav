import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import supabase from '../config/supabase.js';
import { sendVerificationEmail } from '../config/sendEmail.js';
import { transporter } from '../config/sendEmail.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
  try {
    const { name, dob, email, password, aadhar, pan } = req.body;

    const file = req.file;
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Upload to Supabase
    const fileName = `${Date.now()}_${file.originalname}`;
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(`${fileName}`, file.buffer, {
        contentType: file.mimetype
      });

    if (error) return res.status(500).json({ error: 'Supabase upload failed' });

    const documentUrl = `https://bgffnonuitogoeonxysq.supabase.co/storage/v1/object/public/documents/${fileName}`;

    await pool.query(
      `INSERT INTO users (name, dob, email, password_hash, aadhar, pan, document_url, verification_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [name, dob, email, hashedPassword, aadhar, pan, documentUrl, verificationToken]
    );

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: 'Signup successful, verify your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const result = await pool.query(
      'UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING id',
      [token]
    );
    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'Invalid token' });
    }
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Email verification failed' });
  }
};

export const login = async (req, res) => {
  const { identifier, password } = req.body; // identifier = email or aadhar or pan

  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1 OR aadhar = $1 OR pan = $1`,
      [identifier]
    );
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'User not found' });

    if (!user.is_verified) return res.status(401).json({ error: 'Email not verified' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate 6-digit OTP and expiry
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min from now

    await pool.query(
      `UPDATE users SET otp_code = $1, otp_expiry = $2 WHERE id = $3`,
      [otp, expiry, user.id]
    );

    // Send email
    await transporter.sendMail({
      from: process.env.MAIL_HOST,
      to: user.email,
      subject: 'Your OTP for Login',
      html: `<h2>Your OTP</h2><p>${otp}</p><p>It is valid for 5 minutes.</p>`
    });

    res.status(200).json({message: 'OTP sent to your email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const verifyOTP = async (req, res) => {
  const { identifier, otp } = req.body;

  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1 OR aadhar = $1 OR pan = $1`,
      [identifier]
    );
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'User not found' });

    if (!user.otp_code) {
      return res.status(400).json({ error: 'No OTP generated' });
    }

    const isExpired = new Date() > new Date(user.otp_expiry);
    if (isExpired || user.otp_code !== otp) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Clear OTP and issue token
    await pool.query(
      `UPDATE users SET otp_code = NULL, otp_expiry = NULL WHERE id = $1`,
      [user.id]
    );

    const token = jwt.sign({ id: user.id, email: user.email, aadhar:user.aadhar, pan: user.pan }, process.env.JWT, { expiresIn: '7h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OTP verification failed' });
  }
};

export const userProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [req.user.id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
};
