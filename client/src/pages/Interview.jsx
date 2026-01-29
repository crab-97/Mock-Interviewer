import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { sendMessage } from '../api';
import { FaMicrophone, FaStop, FaPaperPlane } from 'react-icons/fa';

const Interview = () => {
    const { id } = useParams();
    const location = useLocation();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Ref for speech synthesis to stop it if needed
    const synthesisRef = useRef(window.speechSynthesis);

    // Initialize with the first message from the previous page
    useEffect(() => {
        if (location.state?.firstMessage) {
            const msg = { role: 'ai', text: location.state.firstMessage };
            setMessages([msg]);
            speak(msg.text);
        }
    }, []);

    // --- TEXT TO SPEECH (AI Voice) ---
    const speak = (text) => {
        if (synthesisRef.current.speaking) synthesisRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1; // Speed
        utterance.pitch = 1;
        synthesisRef.current.speak(utterance);
    };

    // --- SPEECH TO TEXT (User Voice) ---
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support Speech Recognition. Please use Chrome.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsListening(true);
        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error("Speech error:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);
    };

    // --- HANDLE SEND ---
    const handleSend = async () => {
        if (!input.trim()) return;

        // 1. Add User Message to UI
        const userMsg = { role: 'user', text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // 2. Send to Backend
            const { data } = await sendMessage(id, userMsg.text);

            // 3. Add AI Response to UI
            const aiMsg = { role: 'ai', text: data.message };
            setMessages((prev) => [...prev, aiMsg]);

            // 4. Speak AI Response
            speak(data.message);
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-blue-600 p-4 text-white shadow-md">
                <h2 className="text-xl font-bold">Mock Interview Session</h2>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-4 rounded-lg shadow ${
                            msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && <div className="text-gray-500 text-sm animate-pulse ml-2">AI is thinking...</div>}
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 shadow-lg flex items-center gap-2">
                <button
                    onClick={startListening}
                    className={`p-3 rounded-full text-white transition ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-600 hover:bg-gray-700'}`}
                    title="Click to Speak"
                >
                    {isListening ? <FaStop /> : <FaMicrophone />}
                </button>

                <input
                    type="text"
                    className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your answer or use microphone..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />

                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg disabled:opacity-50"
                >
                    <FaPaperPlane />
                </button>
            </div>
        </div>
    );
};

export default Interview;