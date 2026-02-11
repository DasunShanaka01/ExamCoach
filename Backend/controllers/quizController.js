const { GoogleGenAI } = require("@google/genai");
const fs = require('fs');
const pdf = require('pdf-parse');
const Quiz = require('../models/Quiz');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'du1gjenvg',
    api_key: '735518326372853',
    api_secret: 'APN9C79BAZrybhYYiCL69pqelRs'
});

// Initialize the new Google GenAI Client
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
console.log("-----------------------------------------");
console.log("AI QUIZ CONTROLLER LOADED - timestamp: " + Date.now());
console.log("Model: gemini-2.5-flash");
console.log("-----------------------------------------");

// Helper function to extract text from PDF
const extractPdfText = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error("PDF Parse Error:", error);
        throw new Error("Failed to parse PDF file.");
    }
};

// @desc    Generate a quiz based on uploaded content (text or PDF)
// @route   POST /api/quiz/generate
// @access  Private (Student)
exports.generateQuiz = async (req, res) => {
    let filePath = null;

    try {
        const { numQuestions = 5, difficulty = 'Normal', textInput } = req.body;
        let content = textInput || "";

        // Handle File Upload
        if (req.file) {
            filePath = req.file.path;
            if (req.file.mimetype === 'application/pdf') {
                const pdfText = await extractPdfText(filePath);
                content += "\n\n" + pdfText;
            } else if (req.file.mimetype === 'text/plain') {
                const fileText = fs.readFileSync(filePath, 'utf8');
                content += "\n\n" + fileText;
            }
        }

        // Validate Input
        if (!content || content.trim().length === 0) {
            if (filePath) fs.unlinkSync(filePath); // Cleanup
            return res.status(400).json({
                success: false,
                error: 'Please provide text or upload a document (PDF/TXT) to generate a quiz.'
            });
        }

        // Limit content length
        const maxLength = 40000;
        if (content.length > maxLength) {
            content = content.substring(0, maxLength) + "... [Truncated]";
        }

        const prompt = `
            You are an expert teacher. Create a multiple-choice quiz based on the following text content.
            
            **Settings:**
            - **Number of Questions:** ${numQuestions}
            - **Difficulty Level:** ${difficulty}
            
            **Input Text:**
            ${content}

            **Output Format:**
            Return a valid JSON array of objects.
            Each object must have:
            {
                "question": "The question text",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": "The correct option text",
                "explanation": "Brief explanation"
            }
        `;

        // Use the new SDK method
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        // Parse JSON from the response text
        let text = "";

        // Handle response content safely for different SDK versions
        if (typeof response.text === 'function') {
            text = response.text();
        } else if (typeof response.text === 'string') {
            text = response.text;
        } else if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts && response.candidates[0].content.parts[0].text) {
            text = response.candidates[0].content.parts[0].text;
        } else {
            // Fallback: try to stringify the whole response if structure is unknown, though this likely won't be the quiz JSON
            console.log("Warning: Could not extract text from response in standard way.", response);
            text = JSON.stringify(response);
        }

        // Clean up markdown code blocks if present (Gemini sometimes adds them even with JSON mode)
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        console.log("AI Response Length:", text.length);

        let quiz;
        try {
            quiz = JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error on text:", text);
            throw new Error("Failed to parse AI response as JSON");
        }

        // Upload PDF to Cloudinary if it exists
        let pdfUrl = null;
        if (filePath && req.file.mimetype === 'application/pdf') {
            try {
                const uploadResult = await cloudinary.uploader.upload(filePath, {
                    resource_type: "auto", // Auto-detect (likely 'image' for PDFs) to allow display and transformation
                    format: "pdf", // Ensure the resulting URL ends in .pdf
                    folder: "examcoach_quizzes",
                    use_filename: true,
                    unique_filename: true
                });
                pdfUrl = uploadResult.secure_url;
                console.log("PDF Uploaded to Cloudinary:", pdfUrl);
            } catch (uploadError) {
                console.error("Cloudinary Upload Error:", uploadError);
                // We continue even if upload fails, as we have the text
            }
        }

        // Cleanup uploaded file
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.status(200).json({
            success: true,
            data: quiz,
            sourceContent: content, // Return the source text to be saved later
            pdfUrl: pdfUrl // Return PDF URL if uploaded
        });
    } catch (err) {
        // Cleanup uploaded file on error
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        console.error("AI Quiz Gen Error:", err);
        res.status(500).json({
            success: false,
            error: err.message || 'Failed to generate quiz. Please try again.'
        });
    }
};

// @desc    Save completed quiz result
// @route   POST /api/quiz/save
// @access  Private (Student)
exports.saveQuizResult = async (req, res) => {
    try {
        const { score, totalQuestions, questions, difficulty, sourceContent, pdfUrl } = req.body;

        await Quiz.create({
            student: req.user.id,
            score,
            totalQuestions,
            difficulty,
            questions,
            sourceContent: sourceContent || "",
            pdfUrl: pdfUrl || null
        });

        res.status(201).json({
            success: true,
            message: 'Quiz result saved'
        });
    } catch (err) {
        console.error("Save Quiz Error:", err);
        res.status(500).json({
            success: false,
            error: 'Failed to save quiz result'
        });
    }
};

// @desc    Get student's quiz history
// @route   GET /api/quiz/history
// @access  Private (Student)
exports.getQuizHistory = async (req, res) => {
    try {
        const history = await Quiz.find({ student: req.user.id })
            .select('score totalQuestions difficulty createdAt title sourceContent pdfUrl questions')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (err) {
        console.error("Get History Error:", err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch quiz history'
        });
    }
};
