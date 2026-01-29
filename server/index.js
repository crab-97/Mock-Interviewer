const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Interview = require('./models/Interview');
const { chatWithGemini } = require('./services/gemini');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));

app.post('/api/start', async (req, res) => {
    const { jobRole, techStack } = req.body;

    const initialQuestion = `Hello! I see you're applying for the ${jobRole} position working with ${techStack}. Are you ready to begin?`;

    const newInterview = new Interview({
        jobRole,
        techStack,
        history: [
            { role: 'model', parts: [{ text: initialQuestion }] }
        ]
    });

    await newInterview.save();
    res.json({ interviewId: newInterview._id, message: initialQuestion });
});

app.post('/api/chat', async (req, res) => {
    const { interviewId, userMessage } = req.body;

    try {
        const interview = await Interview.findById(interviewId);
        if (!interview) return res.status(404).json({ error: "Interview not found" });

        const aiResponse = await chatWithGemini(
            interview.history,
            userMessage,
            interview.jobRole,
            interview.techStack
        );

        interview.history.push({ role: 'user', parts: [{ text: userMessage }] });
        interview.history.push({ role: 'model', parts: [{ text: aiResponse }] });

        await interview.save();

        res.json({ message: aiResponse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));