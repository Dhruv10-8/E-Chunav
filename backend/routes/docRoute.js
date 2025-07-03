const express = require('express');
const multer = require('multer');
const { uploadFace, generateCard } = require('../controllers/docController');
const router = express.Router();
const upload = multer({ dest: 'temp/' })
const { verifyDoc, verifyFace, submitVote } = require('../controllers/voteController.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');


router.post('/uploadface', upload.single('file'), uploadFace);
router.get('/verifydoc', authMiddleware, verifyDoc);
// router.post('/verifyface', authMiddleware, upload.fields([
//     { name: 'live_image', maxCount: 1 },
//     { name: 'stored_url', maxCount: 1 }
// ]), verifyFace);
router.post('/submitvote', authMiddleware, submitVote);
router.get('/generatecard', authMiddleware, generateCard)

module.exports = router;
