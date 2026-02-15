const express = require('express');
const router = express.Router();
const multer = require('multer');
const { summarizeText } = require('../controllers/aiController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/summarize', upload.single('file'), summarizeText);

module.exports = router;
