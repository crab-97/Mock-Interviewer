import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startInterview } from '../api';

const Home = () => {
    const [jobRole, setJobRole] = useState('');
    const [techStack, setTechStack] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await startInterview(jobRole, techStack);
            // Navigate to the interview room with ID and the first AI message
            navigate(`/interview/${data.interviewId}`, { state: { firstMessage: data.message } });
        } catch (err) {
            alert("Failed to start interview. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96">
                <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">AI Interviewer</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">Job Role</label>
                        <input
                            type="text"
                            placeholder="e.g. Frontend Developer"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Tech Stack</label>
                        <input
                            type="text"
                            placeholder="e.g. React, Node.js"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                            value={techStack}
                            onChange={(e) => setTechStack(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                    >
                        {loading ? "Setting up Environment..." : "Start Interview"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Home;