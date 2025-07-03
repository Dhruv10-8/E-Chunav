const { getCandidates } = require("../controllers/canController");
const express = require("express");
const router = express.Router();

router.get("/candidates", getCandidates);

module.exports = router;