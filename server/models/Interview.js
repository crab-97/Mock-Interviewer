const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
    userId: { type: String, default: 'guest' },
    jobRole: { type: String, required: true },
    techStack: { type: String, required: true },

    history: [
        {
            role: { type: String, enum: ['user', 'model'], required: true },
            parts: [{ text: { type: String, required: true } }],
            timestamp: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interview', InterviewSchema);