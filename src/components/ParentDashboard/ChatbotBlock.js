import React, { useState, useRef, useEffect } from 'react';
import MessageInput from '../Chatbot/MessageInput';

const ChatbotBlock = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your EarlyVue assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isMinimized, setIsMinimized] = useState(false);
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

    // Greetings
    if (lowerMessage.match(/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/)) {
      response = "Hello! 👋 I'm your EarlyVue AI assistant. I can help you with:\n\n• Starting new screenings\n• Understanding screening results\n• Downloading PDF reports\n• Adding children to your account\n• Developmental milestones\n• Finding specialists\n• Privacy & security questions\n\nWhat would you like to know?";
    }
    
    // How to start screening
    else if (lowerMessage.match(/\b(how|start|begin|do|run|perform).*(screening|test|assessment)\b/)) {
      response = "To start a new screening:\n\n1. Click 'New Screening' in the navigation\n2. Select your child from the list\n3. Choose screening type:\n   • Basic ASD (1 minute)\n   • Advanced ASD (2 minutes)\n4. Click 'Start Screening'\n5. Follow the on-screen instructions\n6. Look at the red circle and press 'C' to calibrate\n7. Follow the white ball with your eyes only\n\nTip: Keep your head still and only move your eyes for best results!";
    }
    
    // Screening types
    else if (lowerMessage.match(/\b(screening type|basic|advanced|difference|which screening)\b/)) {
      response = "We offer two screening types:\n\n🎯 Basic ASD Screening (1 minute):\n• Quick assessment\n• Eye-tracking analysis\n• AI-powered prediction\n• Instant PDF report\n\n🧠 Advanced ASD Screening (2 minutes):\n• Extended data collection\n• Deep learning analysis\n• More comprehensive results\n• Detailed behavioral patterns\n• Enhanced PDF report\n\nRecommendation: Start with Basic for quick screening, use Advanced for more detailed analysis.";
    }
    
    // Understanding results
    else if (lowerMessage.match(/\b(understand|interpret|mean|explain|what is).*(result|score|risk|verdict)\b/)) {
      response = "Understanding Your Results:\n\n🟢 Low Risk (Green):\n• Typical developmental patterns\n• Continue regular monitoring\n• Schedule follow-up screenings\n\n🟡 Medium Risk (Yellow):\n• Some indicators present\n• Consult with pediatrician\n• Consider comprehensive evaluation\n\n🔴 High Risk (Red):\n• Multiple ASD indicators\n• Professional evaluation recommended\n• Contact specialist within 2-4 weeks\n\nConfidence Score: Shows AI model certainty (0-100%)\nModel Predictions: Individual scores from RF, SVM, and DNN models\n\nAlways consult healthcare professionals for diagnosis.";
    }
    
    // PDF Download
    else if (lowerMessage.match(/\b(download|pdf|report|save|get).*(report|pdf|document)\b/)) {
      response = "To download your PDF report:\n\n1. Go to 'All Results' page\n2. Find your screening result\n3. Click '📄 Download PDF Report' button\n4. Report includes:\n   • Patient information\n   • Screening date & time\n   • Risk assessment\n   • Model predictions\n   • Gaze pattern analysis\n   • Recommendations\n\nNote: PDFs are only available for completed screenings. If download fails, ensure the backend is running.";
    }
    
    // Adding children
    else if (lowerMessage.match(/\b(add|register|create|new).*(child|kid|patient)\b/)) {
      response = "To add a new child:\n\n1. Click 'My Profile' in navigation\n2. Scroll to 'Registered Children' section\n3. Click '➕ Add New Child' button\n4. Fill in the form:\n   • Child's full name\n   • Date of birth (age auto-calculated!)\n   • Gender\n5. Click 'Add Child'\n\nThe child will appear in your screening selection list immediately!";
    }
    
    // Age calculation
    else if (lowerMessage.match(/\b(age|months|calculate|automatic|dob|date of birth)\b/)) {
      response = "Age Auto-Calculation Feature:\n\nWhen you enter your child's date of birth, the age in months is automatically calculated!\n\n✓ No manual calculation needed\n✓ Always accurate and up-to-date\n✓ Shows both months and years breakdown\n✓ Updates automatically\n\nExample: DOB Jan 15, 2022 → 45 months (3 years and 9 months)";
    }
    
    // Developmental milestones
    else if (lowerMessage.match(/\b(milestone|development|typical|normal|age appropriate)\b/)) {
      response = "Developmental Milestones:\n\n12-18 Months:\n• Responds to name\n• Waves goodbye\n• Says several words\n• Follows simple directions\n\n18-24 Months:\n• Points to show things\n• 2-4 word sentences\n• Plays pretend games\n\n2-3 Years:\n• Takes turns in games\n• Shows concern for others\n• Uses 2-3 word sentences\n\nRed Flags:\n❌ No response to name by 12 months\n❌ No pointing by 14 months\n❌ No pretend play by 18 months\n❌ Avoids eye contact\n\nFor detailed information, visit Help & Support → Developmental Milestones";
    }
    
    // Privacy & Security
    else if (lowerMessage.match(/\b(privacy|security|safe|data|protect|hipaa|encrypt)\b/)) {
      response = "Your Privacy & Data Security:\n\n🔐 We protect your data with:\n• End-to-end encryption\n• HIPAA-compliant storage\n• Secure database access\n• Regular security audits\n• Two-factor authentication\n\n❌ We NEVER:\n• Sell your personal data\n• Share with advertisers\n• Use data without consent\n\n✓ You can:\n• Access your data anytime\n• Download all reports\n• Request data deletion\n• Control sharing preferences\n\nFor details, visit Help & Support → Privacy and Data Security";
    }
    
    // Finding specialists
    else if (lowerMessage.match(/\b(specialist|doctor|pediatrician|therapist|professional|expert)\b/)) {
      response = "Finding Healthcare Professionals:\n\nWho to Contact:\n👨‍⚕️ Pediatrician - First point of contact\n🧠 Developmental Pediatrician - Specializes in developmental disorders\n🗣️ Speech-Language Pathologist - Communication evaluation\n🎨 Occupational Therapist - Sensory/motor assessment\n👶 Early Intervention Program - Free evaluation for children under 3\n\nWhat to Bring:\n📄 EarlyVue screening PDF reports\n📄 Developmental history\n📄 Medical records\n📄 List of specific concerns\n📄 Videos of behaviors (if applicable)\n\nClick 'Find a Specialist' in the dashboard for local resources.";
    }
    
    // Technical issues
    else if (lowerMessage.match(/\b(error|not working|failed|problem|issue|bug|crash)\b/)) {
      response = "Troubleshooting Common Issues:\n\n🎥 Webcam Not Working:\n• Check browser permissions\n• Close other apps using webcam\n• Try different browser (Chrome recommended)\n• Restart computer\n\n📄 PDF Not Downloading:\n• Ensure backend is running\n• Check browser download settings\n• Try right-click → Save As\n• Run a new screening to generate fresh PDF\n\n🔌 Backend Connection Failed:\n• Start backend: cd backend → python screening_api.py\n• Check http://localhost:5000 is accessible\n• Disable firewall temporarily\n\n❓ Still having issues?\nVisit Help & Support → Technical Support for detailed solutions.";
    }
    
    // Screening duration
    else if (lowerMessage.match(/\b(how long|duration|time|minutes|takes)\b/)) {
      response = "Screening Duration:\n\n⏱️ Basic ASD Screening: 1 minute\n• Quick assessment\n• Suitable for routine monitoring\n\n⏱️ Advanced ASD Screening: 2 minutes\n• Extended analysis\n• More comprehensive data\n• Better for detailed evaluation\n\nTotal Time (including setup):\n• Basic: ~3-5 minutes\n• Advanced: ~4-6 minutes\n\nTips for Success:\n✓ Choose quiet time when child is alert\n✓ Ensure good lighting\n✓ Minimize distractions\n✓ Allow extra time for setup";
    }
    
    // Account/Profile
    else if (lowerMessage.match(/\b(account|profile|settings|update|change|edit)\b/)) {
      response = "Managing Your Account:\n\n👤 My Profile:\n• View/edit guardian information\n• See registered children\n• View account statistics\n• Access quick actions\n\nTo Update Profile:\n1. Click 'My Profile' in navigation\n2. Click '✏️ Edit Profile' button\n3. Update your information\n4. Click '💾 Save Changes'\n\nYou can update:\n• Name, email, phone\n• Address\n• Emergency contacts\n\nNote: Some changes may require re-verification.";
    }
    
    // Accuracy/Reliability
    else if (lowerMessage.match(/\b(accurate|reliable|trust|confidence|how good|effective)\b/)) {
      response = "Screening Accuracy & Reliability:\n\n🤖 Our AI System Uses:\n• Random Forest (RF)\n• Support Vector Machine (SVM)\n• Deep Neural Network (DNN)\n• Ensemble prediction method\n\n📊 Accuracy:\n• Trained on validated datasets\n• Multiple model consensus\n• Confidence scores provided\n• Continuous improvement\n\n⚠️ Important:\n• This is a SCREENING tool, not a diagnosis\n• Always consult healthcare professionals\n• Results should be confirmed by specialists\n• Use as part of comprehensive evaluation\n\nBest used for:\n✓ Early detection\n✓ Monitoring development\n✓ Tracking progress over time";
    }
    
    // Cost/Pricing
    else if (lowerMessage.match(/\b(cost|price|fee|pay|free|subscription)\b/)) {
      response = "EarlyVue is designed to make ASD screening accessible to all families.\n\nFor current pricing information, please contact our support team or check the pricing page.\n\nWhat's Included:\n✓ Unlimited screenings\n✓ PDF reports for all screenings\n✓ Secure data storage\n✓ AI-powered analysis\n✓ Progress tracking\n✓ 24/7 access to results\n✓ Educational resources\n✓ Customer support";
    }
    
    // What is ASD
    else if (lowerMessage.match(/\b(what is|define|explain).*(asd|autism|spectrum)\b/)) {
      response = "Autism Spectrum Disorder (ASD):\n\nASD is a developmental condition affecting:\n• Social communication\n• Behavior patterns\n• Sensory processing\n• Interests and activities\n\nCommon Signs:\n• Limited eye contact\n• Delayed speech/language\n• Repetitive behaviors\n• Difficulty with changes\n• Unusual sensory responses\n• Intense focused interests\n\nKey Points:\n✓ Spectrum = Wide range of symptoms\n✓ Early detection improves outcomes\n✓ Each child is unique\n✓ Many strengths and abilities\n✓ Support and intervention help\n\nFor detailed information, visit Help & Support → Understanding ASD";
    }
    
    // General help
    else if (lowerMessage.match(/\b(help|support|assist|guide)\b/)) {
      response = "I'm here to help! I can answer questions about:\n\n📊 Screenings:\n• How to start screening\n• Screening types\n• Understanding results\n\n📄 Reports:\n• Downloading PDFs\n• Interpreting data\n• Sharing with doctors\n\n👶 Child Management:\n• Adding children\n• Updating information\n• Age calculation\n\n📚 Resources:\n• Developmental milestones\n• Finding specialists\n• Educational materials\n\n🔧 Technical:\n• Troubleshooting\n• System requirements\n• Privacy & security\n\nWhat specific topic would you like help with?";
    }
    
    // Default response with suggestions
    else {
      response = "I'm your EarlyVue AI assistant! I can help with:\n\n• 🎯 Starting screenings\n• 📊 Understanding results\n• 📄 Downloading reports\n• 👶 Adding/managing children\n• 📚 Developmental information\n• 👨‍⚕️ Finding specialists\n• 🔧 Technical support\n• 🔐 Privacy & security\n\nTry asking:\n• \"How do I start a screening?\"\n• \"What do my results mean?\"\n• \"How do I download a PDF?\"\n• \"What are developmental milestones?\"\n• \"How do I add a child?\"\n\nOr use the Quick Actions below!";
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

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your EarlyVue assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="chatbot-block">
      <div className="chatbot-block-header">
        <div className="chatbot-info">
          <div className="chatbot-avatar">🤖</div>
          <div className="chatbot-details">
            <h3>EarlyVue Assistant</h3>
            <p>AI-powered support for parents</p>
          </div>
        </div>
        <div className="chatbot-controls">
          <button
            className="control-btn clear-btn"
            onClick={clearChat}
            title="Clear conversation"
          >
            🗑️
          </button>
          <button
            className="control-btn minimize-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? '⬆️' : '⬇️'}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-avatar">
                  {message.sender === 'bot' ? '🤖' : '👤'}
                </div>
                <div className="message-content">
                  <div className="message-bubble">
                    <p>{message.text}</p>
                  </div>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="quick-actions">
            <h4>Quick Actions</h4>
            <div className="action-buttons">
              <button
                className="quick-action-btn"
                onClick={() => handleQuickAction('viewReport')}
              >
                📊 View Report
              </button>
              <button
                className="quick-action-btn"
                onClick={() => handleQuickAction('scheduleScreening')}
              >
                📅 New Screening
              </button>
              <button
                className="quick-action-btn"
                onClick={() => handleQuickAction('findResources')}
              >
                📚 Resources
              </button>
              <button
                className="quick-action-btn"
                onClick={() => handleQuickAction('contactSupport')}
              >
                🆘 Support
              </button>
            </div>
          </div>

          <div className="message-input-container">
            <MessageInput onSendMessage={handleUserMessage} />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatbotBlock;