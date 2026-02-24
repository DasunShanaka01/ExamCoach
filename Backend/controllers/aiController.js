const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const pdfParse = require("pdf-parse");
const AISummary = require('../models/AISummary');
const { cloudinary } = require('../config/cloudinary');
const stream = require('stream');

dotenv.config();

const summarizeText = async (req, res) => {
    try {
        let text = req.body.text;

        if (req.file) {
            console.log("Processing PDF file...");
            const dataBuffer = req.file.buffer;
            try {
                const pdfData = await pdfParse(dataBuffer);
                text = pdfData.text;
                console.log("PDF Text extracted, length:", text.length);
            } catch (pdfError) {
                console.error("Error parsing PDF:", pdfError);
                return res.status(400).json({ message: "Failed to parse PDF file", error: pdfError.message });
            }
        }

        if (!text) {
            return res.status(400).json({ message: "Text or PDF file is required for summarization" });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is missing");
            return res.status(500).json({ message: "Server configuration error: API Key missing" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use gemini-1.5-flash as it's often more reliable for free tier/tasks, fallback to pro if needed
        // But user said gemini-2.5-flash worked for text. Let's keep it but add logging.
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        console.log("Generating summary with model...");

        // Request structured JSON output
        const prompt = `
        Analyze the following text and provide a response in JSON format.
        The JSON object must have two keys:
        1. "summary": A concise summary of the text.
        2. "relatedResources": An array of at least 3 related study resources found on the web (YouTube videos, articles, documentation). 
           Each resource object must have:
           - "title": Title of the resource
           - "link": A valid URL (search for actual relevant links if possible, or generate highly probable search links)
           - "type": One of "youtube", "website", "other"

        Text to analyze:
        ${text}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Clean up markdown formatting if present (e.g. ```json ... ```)
        const jsonString = textResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "");

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse JSON response:", textResponse);
            // Fallback if JSON parsing fails - treat entire text as summary
            parsedResponse = {
                summary: textResponse,
                relatedResources: []
            };
        }

        console.log("Summary and resources generated successfully");

        res.status(200).json(parsedResponse);
    } catch (error) {
        console.error("Error summarizing text:", error);
        res.status(500).json({ message: "Failed to summarize text", error: error.message });
    }
};

const saveSummary = async (req, res) => {
    try {
        const { title, summary, type, originalText, userId } = req.body;
        let originalContent = originalText;

        if (req.file) {
            // Upload to Cloudinary
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "ai_learning_lab", resource_type: "auto" },
                async (error, result) => {
                    if (error) {
                        console.error("Cloudinary Upload Error:", error);
                        return res.status(500).json({ message: "Upload failed", error });
                    }

                    originalContent = result.secure_url;

                    const newSummary = new AISummary({
                        user: userId,
                        title: title || req.file.originalname,
                        originalContent,
                        summary,
                        relatedResources: req.body.relatedResources ? JSON.parse(req.body.relatedResources) : [],
                        type: 'pdf'
                    });

                    await newSummary.save();
                    res.status(201).json(newSummary);
                }
            );

            const bufferStream = new stream.PassThrough();
            bufferStream.end(req.file.buffer);
            bufferStream.pipe(uploadStream);

        } else {
            const newSummary = new AISummary({
                user: userId,
                title: title || 'Text Summary',
                originalContent,
                summary,
                relatedResources: req.body.relatedResources ? JSON.parse(req.body.relatedResources) : [],
                type: 'text'
            });

            await newSummary.save();
            res.status(201).json(newSummary);
        }

    } catch (error) {
        console.error("Error saving summary:", error);
        res.status(500).json({ message: "Failed to save summary", error: error.message });
    }
};

const getHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await AISummary.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json(history);
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ message: "Failed to fetch history", error: error.message });
    }
};

module.exports = { summarizeText, saveSummary, getHistory };
