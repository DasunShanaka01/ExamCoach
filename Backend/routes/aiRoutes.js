const express = require('express');
const router = express.Router();
const multer = require('multer');
const { summarizeText, saveSummary, getHistory } = require('../controllers/aiController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/summarize', upload.single('file'), summarizeText);
router.post('/save', upload.single('file'), saveSummary);
router.get('/history/:userId', getHistory);

module.exports = router;
