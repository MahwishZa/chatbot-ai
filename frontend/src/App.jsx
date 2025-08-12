import React, { useState } from 'react';
import axios from 'axios';
import ChatWindow from './components/ChatWindow';

function App() {
  const [conversation, setConversation] = useState([]);
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  // Send message to backend and update conversation
  const sendMessage = async () => {
    if (!input.trim()) return;
    setError('');
    try {
      const { data } = await axios.post('http://localhost:5000/chat', {
        message: input,
        conversation,
      });
      setConversation(data.conversation);
      setInput('');
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || 'Error communicating with the server.';
      setError(errorMessage);
    }
  };

  // End session and get summary
  const endSession = async () => {
    setError('');
    try {
      const { data } = await axios.post('http://localhost:5000/summary', { conversation });
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
      setError('Error generating summary.');
    }
  };

  // Start a new session
  const startNewSession = () => {
    setConversation([]);
    setSummary('');
    setError('');
  };

  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
      <div className="min-h-screen flex flex-col items-center p-4">
        {/* Header */}
        <header className="w-full max-w-full sm:max-w-xl mb-4">
          <h1 className="text-3xl font-bold text-center">AI Assistant</h1>
        </header>

        {/* Chat Window */}
        <div className="w-full max-w-full sm:max-w-xl flex bg-white rounded-lg shadow overflow-hidden">
          {conversation.length > 0 && <ChatWindow conversation={conversation} />}
        </div>

        {/* Input and Send Button */}
        <div className="w-full max-w-full sm:max-w-xl mt-4 flex shadow-lg rounded-lg overflow-hidden">
          <input
            type="text"
            className="flex-1 p-3 border-none focus:outline-none"
            placeholder="Type your uplifting message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 hover:bg-blue-600 transition-colors duration-300 text-white px-6"
          >
            Send
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="w-full max-w-full sm:max-w-xl mt-2 text-red-500 text-center">
            {error}
          </div>
        )}

        {/* End Session & New Session Buttons */}
        <div className="w-full max-w-full sm:max-w-xl mt-4 flex justify-center space-x-2">
          <button
            onClick={startNewSession}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-all duration-300"
          >
            New Session
          </button>
          <button
            onClick={endSession}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-all duration-300"
          >
            End Session
          </button>
        </div>

        {/* Session Summary */}
        {summary && (
          <div className="w-full max-w-full sm:max-w-xl mt-4 bg-green-100 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">Session Summary</h2>
            <p>{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
