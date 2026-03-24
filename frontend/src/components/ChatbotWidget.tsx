'use client';

import { useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const commonQuestions = [
  'What are the GST filing deadlines?',
  'How do I file income tax?',
  'What are the charges for your services?',
  'How can I claim deductions?',
  'What documents do I need for filing?',
];

const botReplies: { [key: string]: string } = {
  'gst filing': 'GST filing deadlines:\n• GSTR-1: 15th of next month\n• GSTR-3B: 20th of next month\n• GSTR-9: Annual filing by Dec 31',
  'income tax': 'Income Tax filing deadline is 31st July for the previous financial year. You need income documents, deduction proofs, and TDS certificates.',
  'charges': 'Our charges are transparent and vary based on service complexity. Basic ITR filing starts at ₹499. Contact our team for custom quotes.',
  'deductions': 'Common deductions include: Life Insurance (80C), Medical Insurance (80D), Rent (80GG), Education Loan Interest (80E), and Section 80D/80DD benefits.',
  'documents': 'Required documents: PAN, Aadhar, Bank statements, Salary slips, Form 16, Investment proofs, GST certificates, and any other income documents.',
  'default': 'Thanks for reaching out! I\'m here to help with your tax and compliance questions. Please choose a common question or describe your issue.',
};

function getRandomResponse(): string {
  const responses = [
    'Great question! Let me provide more details...',
    'That\'s a common question! Here\'s what you need to know...',
    'Absolutely! Here\'s the information you need...',
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: 'Hello! 👋 I\'m your Tax Assistant. Ask me about GST filing, income tax, deductions, or any compliance-related questions. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      let botResponse = botReplies['default'];
      const lowerText = text.toLowerCase();

      for (const [key] of Object.entries(botReplies)) {
        if (lowerText.includes(key)) {
          botResponse = botReplies[key];
          break;
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: botResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  return (
    <>
      {/* Chatbot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 bg-gradient-to-r from-amber-500 to-yellow-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition transform z-40"
          title="Open Tax Assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 max-h-[500px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Tax Assistant 🤖</h3>
              <p className="text-xs text-amber-100">Always here to help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-amber-500 text-white rounded-br-none'
                      : 'bg-gray-300 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-white">
              <p className="text-xs font-semibold text-gray-600 mb-2">Quick questions:</p>
              <div className="grid grid-cols-1 gap-2">
                {commonQuestions.slice(0, 3).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="text-left text-xs p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
              placeholder="Ask your question..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <button
              onClick={() => handleSendMessage(input)}
              className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-lg transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
