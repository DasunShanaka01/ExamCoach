const validateKuppiUpload = (req, res, next) => {
    const { title, description, subject, duration } = req.body;
    const hasVideoFile = req.files && req.files.video && req.files.video.length > 0;
    const hasVideoUrl = req.body.videoUrl;

    if (!title || !description || !subject || !duration) {
        return res.status(400).json({
            success: false,
            error: 'Please provide all required fields'
        });
    }

    if (!hasVideoFile && !hasVideoUrl) {
        return res.status(400).json({
            success: false,
            error: 'Video file or video URL is required'
        });
    }

    if (duration <= 0) {
        return res.status(400).json({
            success: false,
            error: 'Duration must be positive'
        });
    }

    next();
};

const validateQuizCreation = (req, res, next) => {
    const { title, subject, questions } = req.body;
    
    if (!title || !subject || !questions || questions.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Please provide title, subject, and at least one question'
        });
    }
    
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question || !q.options || q.options.length < 2 || 
            q.correctAnswer === undefined || q.correctAnswer >= q.options.length) {
            return res.status(400).json({
                success: false,
                error: `Invalid question ${i + 1}`
            });
        }
    }
    
    next();
};

module.exports = { validateKuppiUpload, validateQuizCreation };