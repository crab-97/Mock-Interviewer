const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const chatWithGemini = async (currentHistory, userMessage, jobRole, techStack) => {
    const systemInstruction = `You are a strict but fair technical interviewer for a ${jobRole} role focusing on ${techStack}. 
  - Ask only ONE question at a time.
  - Keep your responses short (under 3 sentences) like a real conversation.
  - If the user's answer is wrong, politely correct them and move on.
  - Do not write code unless asked.`;

    const chat = model.startChat({
        history: currentHistory, // Pass previous conversation
        systemInstruction: systemInstruction,
    });

    try {
        const result = await chat.sendMessage(userMessage);
        return result.response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "I'm having trouble connecting to the server right now. Let's move to the next question.";
    }
};

module.exports = { chatWithGemini };