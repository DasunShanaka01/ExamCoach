const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const pdfParse = require("pdf-parse");

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
        const prompt = `Summarize the following text:\n\n${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();
        console.log("Summary generated successfully");

        res.status(200).json({ summary });
    } catch (error) {
        console.error("Error summarizing text:", error);
        res.status(500).json({ message: "Failed to summarize text", error: error.message });
    }
};

module.exports = { summarizeText };
