import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const startInterview = (jobRole, techStack) => API.post('/start', { jobRole, techStack });
export const sendMessage = (interviewId, userMessage) => API.post('/chat', { interviewId, userMessage });