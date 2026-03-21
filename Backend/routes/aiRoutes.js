const express = require('express');
const router = express.Router();
const multer = require('multer');
const { summarizeText, saveSummary, getHistory, deleteHistoryItem } = require('../controllers/aiController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/summarize', upload.array('files', 3), summarizeText);
router.post('/save', upload.single('file'), saveSummary);
router.get('/history/:userId', getHistory);
router.delete('/history/:id', deleteHistoryItem);

module.exports = router;
