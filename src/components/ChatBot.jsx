import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function ChatBot() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m SoularBot, your climate change assistant. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock AI responses based on keywords
  const generateResponse = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    // Basic response templates
    const responses = {
      'carbon footprint': 'Your carbon footprint is the total amount of greenhouse gases produced by your activities. The main ways to reduce it are: using public transportation, reducing meat consumption, saving energy at home, and choosing renewable energy sources.',
      'renewable energy': 'Renewable energy sources include solar, wind, hydro, and geothermal power. They\'re crucial for reducing greenhouse gas emissions and fighting climate change. Many communities now offer options to switch to renewable energy providers.',
      'recycling': 'Recycling helps reduce waste and greenhouse gas emissions. Key tips: separate materials properly, clean items before recycling, and reduce consumption first. Remember the three Rs: Reduce, Reuse, Recycle!',
      'climate change': 'Climate change refers to long-term shifts in global weather patterns and temperatures. It\'s primarily caused by greenhouse gas emissions from human activities. We can combat it through individual actions and supporting climate policies.',
      'electric vehicles': 'Electric vehicles (EVs) produce zero direct emissions and are increasingly important for reducing transportation-related carbon emissions. Many countries offer incentives for EV purchases.',
      'plant based': 'A plant-based diet can significantly reduce your carbon footprint. Animal agriculture is responsible for a large portion of global greenhouse gas emissions.',
      'solar panels': 'Solar panels can reduce your home\'s carbon footprint and energy costs. Many regions offer tax incentives and rebates for installation.',
      'default': 'That\'s an interesting question about climate change. While I\'m a mock AI assistant, I encourage you to explore reliable sources like IPCC reports and scientific journals for detailed information.'
    };

    // Find matching response or use default
    const matchingKey = Object.keys(responses).find(key => lowerQuestion.includes(key)) || 'default';
    return responses[matchingKey];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const response = generateResponse(input);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-12rem)]">
      <div className="bg-white dark:bg-darkcard rounded-lg shadow-lg h-full flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about climate change..."
              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatBot;
