const express = require('express');
const multer = require('multer');
const { signup, verifyEmail, login, verifyOTP, userProfile } = require('../controllers/authController.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');

const router = express.Router();
const upload = multer(); // in-memory storage

router.post('/signup', upload.single('document'), signup);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.get('/profile', authMiddleware, userProfile);


module.exports = router;
