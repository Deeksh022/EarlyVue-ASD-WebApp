import React, { useState, useRef, useEffect } from 'react';
import MessageInput from './MessageInput';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your EarlyVue assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUserMessage = (text) => {
    const userMessage = {
      id: messages.length + 1,
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      generateBotResponse(text);
    }, 1000);
  };

  const generateBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';

    if (lowerMessage.includes('report') || lowerMessage.includes('result')) {
      response = "I can help you view your child's screening reports. Would you like to see the latest report or view historical data?";
    } 
    else if (lowerMessage.includes('screen') || lowerMessage.includes('test')) {
      response = "I can help you schedule a new screening or view past screening results. What would you like to do?";
    }
    else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      response = "I'm here to help! I can assist with viewing reports, understanding results, finding resources, or connecting you with support. What do you need help with?";
    }
    else if (lowerMessage.includes('resource') || lowerMessage.includes('helpful')) {
      response = "I can direct you to helpful resources about child development and ASD. Would you like information about developmental milestones, specialist contacts, or educational materials?";
    }
    else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = "Hello! I'm your EarlyVue assistant. I can help you with screening reports, results interpretation, and finding resources. How can I assist you today?";
    }
    else {
      response = "I'm here to help you with your child's screening results and developmental tracking. You can ask me about reports, results, resources, or anything else related to EarlyVue.";
    }

    const botMessage = {
      id: messages.length + 2,
      text: response,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const handleQuickAction = (action) => {
    let message = '';
    switch(action) {
      case 'viewReport':
        message = "Show me my child's latest report";
        break;
      case 'scheduleScreening':
        message = "I want to schedule a new screening";
        break;
      case 'findResources':
        message = "Show me helpful resources";
        break;
      case 'contactSupport':
        message = "I need to contact support";
        break;
      default:
        message = "Help me with something";
    }
    handleUserMessage(message);
  };

  return (
    <div className={`chatbot-widget ${isOpen ? 'open' : ''}`}>
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>EarlyVue Assistant</h3>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  <p>{message.text}</p>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="quick-actions">
            <button 
              className="quick-action-btn"
              onClick={() => handleQuickAction('viewReport')}
            >
              View Report
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => handleQuickAction('scheduleScreening')}
            >
              New Screening
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => handleQuickAction('findResources')}
            >
              Resources
            </button>
          </div>

          <MessageInput onSendMessage={handleUserMessage} />
        </div>
      )}
      
      {!isOpen && (
        <button 
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
        >
          <span className="chat-icon">💬</span>
          <span className="chat-label">Help</span>
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;