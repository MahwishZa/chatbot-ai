import React, { useEffect, useRef } from 'react';

const ChatWindow = ({ conversation }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {conversation
        .filter(msg => msg.role !== 'system') // Filter out system messages
        .map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-3 rounded-2xl max-w-[85%] sm:max-w-[70%] lg:max-w-[60%] relative ${msg.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-200 shadow-sm'
                }`}
            >
              {/* Sender Label */}
              <div className={`text-xs font-medium mb-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                {msg.role === 'user' ? 'You' : 'AI Coach'}
              </div>

              {/* Message Content */}
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

      <div ref={endRef} />
    </div>
  );
};

export default ChatWindow;
