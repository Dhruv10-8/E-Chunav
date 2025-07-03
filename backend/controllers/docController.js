import supabase from '../config/supabase.js'
import pool from '../config/db.js'
import fs from 'fs'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import axios from 'axios';
import path from 'path';

export const uploadDoc = async (req, res) => {
    try {
        const file = req.file;
        const userId = req.user.id;
        const docType = req.body.documentType; // add this in the frontend
        if (!file) {
            return res.status(400).json({ error: "File missing." });
        }
        if (!userId || !docType) {
            return res.status(401).json({ error: "User ID or document type missing." });
        }

        const fileBuffer = fs.readFileSync(file.path);
        const filePath = `${userId}/${file.originalname}`;

        const { data, error } = await supabase.storage
            .from('documents')
            .upload(filePath, fileBuffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        fs.unlinkSync(file.path);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        const { data: publicUrlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        const documentUrl = publicUrlData.publicUrl;

        // Insert into PostgreSQL `documents` table
        const query = `
            INSERT INTO documents (user_id, document_type, document_url, uploaded_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING *;
        `;

        const values = [userId, docType, documentUrl];
        const result = await pool.query(query, values);

        return res.status(200).json({
            message: 'Document uploaded and saved successfully.',
            record: result.rows[0],
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const uploadFace = async (req, res) => {
    try {
        const file = req.file;
        const userId = req.body.id;
        const name = req.body.name;
        if (!file) {
            return res.status(400).json({ error: "File missing." });
        }
        if (!userId) {
            return res.status(401).json({ error: "User ID or document type missing." });
        }
        const fileBuffer = fs.readFileSync(file.path);
        const filePath = `${name}/${file.originalname}`;
        const { data, error } = await supabase.storage
            .from('face')
            .upload(filePath, fileBuffer, {
                contentType: file.mimetype,
                upsert: true,
            });
        fs.unlinkSync(file.path);
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const { data: publicUrlData } = supabase.storage
            .from('face')
            .getPublicUrl(filePath);
        const faceUrl = publicUrlData.publicUrl;

        const query = `
            UPDATE users SET face_id_url = $1
            WHERE id = $2
        `;
        const values = [faceUrl, userId];
        const result = await pool.query(query, values);
        return res.status(200).json({
            message: 'Face image uploaded and saved successfully.',
            record: result.rows[0],
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: error.message });
    }
}

export const generateCard = async (req, res) => {
    const userId = req.user.id
    console.log('Generating card for user:', userId);
    try {
        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }
        const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);
        const user = rows[0]
        if (!user) { return res.status(404).json({ error: "User not found." }); }
        if (!user.face_id_url) { return res.staus(405).json({ error: "Face image not uploaded." }) }
        const pdfDoc = await PDFDocument.create()
        const page = pdfDoc.addPage([600, 400]);
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const drawText = (text, x, y, size = 13) => {
            page.drawText(text, {
                x,
                y,
                size,
                font,
                color: rgb(0, 0, 0),
            });
        };
        const imageRes = await axios.get(user.face_id_url, { responseType: 'arraybuffer' });
        const imageBytes = imageRes.data;
        const faceImage = await pdfDoc.embedJpg(imageBytes);
        page.drawImage(faceImage, { x: 270, y: 120, width: 100, height: 100 });
        const qrDataUrl = await QRCode.toDataURL(`voter-${user.id}`);
        const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
        const qrImage = await pdfDoc.embedPng(qrImageBytes);
        page.drawImage(qrImage, { x: 270, y: 20, width: 100, height: 100 });

        const stampPath = path.join(process.cwd(), 'assets', 'stamp.jpg');
        const stampBytes = fs.readFileSync(stampPath);
        const stampImage = await pdfDoc.embedJpg(stampBytes);
        page.drawImage(stampImage, {
            x: 50,
            y: 50,
            width: 300,
            height: 150,
            opacity: 0.2, // transparent watermark
        });

        drawText('Government of India', 20, 380, 18);
        drawText('E-Chunav Voter Card', 120, 220, 16);
        drawText(`Name: ${user.name}`, 20, 190);
        drawText(`Email: ${user.email}`, 20, 170);
        drawText(`DOB: ${user.dob}`, 20, 150);
        drawText(`Aadhar/PAN: ${user.aadhar || user.pan}`, 20, 130);

        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="voter_card.pdf"');
        res.send(pdfBytes);
    } catch (error) {
        console.error('Card generation error:', error);
        return res.status(500).json({ error: error.message });

    }
}