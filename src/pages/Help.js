import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/ParentDashboard/Header';
import '../styles/medical-theme.css';

const Help = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState(null);

  const helpTopics = [
    {
      id: 'screening-results',
      title: 'Understanding Screening Results',
      description: 'Learn how to interpret your child\'s ASD screening results and what the different risk levels mean.',
      icon: '📊',
      content: {
        overview: 'The EarlyVue screening system uses advanced eye-tracking and machine learning to assess ASD indicators in children.',
        sections: [
          {
            title: 'Risk Levels Explained',
            content: [
              '<strong>Low Risk (Green):</strong> The screening indicates typical developmental patterns. Continue regular monitoring and developmental check-ups.',
              '<strong>Medium Risk (Yellow):</strong> Some indicators suggest further evaluation may be beneficial. Consult with your pediatrician for a comprehensive assessment.',
              '<strong>High Risk (Red):</strong> Multiple indicators suggest ASD characteristics. Professional diagnostic evaluation is strongly recommended.'
            ]
          },
          {
            title: 'Understanding the Scores',
            content: [
              '<strong>Confidence Score:</strong> Indicates how certain the AI model is about the prediction (0-100%).',
              '<strong>Model Predictions:</strong> Shows individual predictions from Random Forest, SVM, and Deep Neural Network models.',
              '<strong>Gaze Patterns:</strong> Analysis of eye movement, fixation duration, and attention patterns.'
            ]
          },
          {
            title: 'What to Do Next',
            content: [
              '1. Review the detailed PDF report with all screening data',
              '2. Share results with your pediatrician or healthcare provider',
              '3. Schedule follow-up screenings to track developmental progress',
              '4. If high risk, seek professional diagnostic evaluation within 2-4 weeks'
            ]
          }
        ]
      }
    },
    {
      id: 'milestones',
      title: 'Developmental Milestones',
      description: 'Track your child\'s development against typical milestones and understand what to look for.',
      icon: '🎯',
      content: {
        overview: 'Understanding typical developmental milestones helps identify potential concerns early.',
        sections: [
          {
            title: '12-18 Months',
            content: [
              '<strong>Social:</strong> Shows interest in other children, responds to name, waves goodbye',
              '<strong>Communication:</strong> Says several single words, follows simple directions',
              '<strong>Cognitive:</strong> Explores objects in different ways, finds hidden objects',
              '<strong>Motor:</strong> Walks alone, drinks from cup, uses spoon'
            ]
          },
          {
            title: '18-24 Months',
            content: [
              '<strong>Social:</strong> Copies others, shows affection, plays simple pretend games',
              '<strong>Communication:</strong> Points to show things, says 2-4 word sentences',
              '<strong>Cognitive:</strong> Finds things even when hidden, sorts shapes and colors',
              '<strong>Motor:</strong> Runs, kicks ball, begins to run'
            ]
          },
          {
            title: '2-3 Years',
            content: [
              '<strong>Social:</strong> Shows concern for crying friend, takes turns in games',
              '<strong>Communication:</strong> Uses 2-3 word sentences, follows 2-step instructions',
              '<strong>Cognitive:</strong> Plays make-believe, works toys with buttons',
              '<strong>Motor:</strong> Climbs well, runs easily, pedals tricycle'
            ]
          },
          {
            title: 'Red Flags to Watch For',
            content: [
              '❌ Doesn\'t respond to name by 12 months',
              '❌ Doesn\'t point at objects to show interest by 14 months',
              '❌ Doesn\'t play pretend games by 18 months',
              '❌ Avoids eye contact and wants to be alone',
              '❌ Has trouble understanding other people\'s feelings',
              '❌ Delayed speech and language skills',
              '❌ Repeats words or phrases over and over',
              '❌ Gets upset by minor changes in routine'
            ]
          }
        ]
      }
    },
    {
      id: 'professional-help',
      title: 'When to Seek Professional Help',
      description: 'Know when to consult with healthcare professionals about your child\'s development.',
      icon: '👨‍⚕️',
      content: {
        overview: 'Early intervention is crucial for the best outcomes. Here\'s when to seek professional evaluation.',
        sections: [
          {
            title: 'Immediate Consultation Needed',
            content: [
              '🚨 High-risk screening results',
              '🚨 Loss of previously acquired skills (regression)',
              '🚨 No babbling by 12 months',
              '🚨 No gesturing (pointing, waving) by 12 months',
              '🚨 No single words by 16 months',
              '🚨 No two-word phrases by 24 months'
            ]
          },
          {
            title: 'Schedule Evaluation Within 2-4 Weeks',
            content: [
              '⚠️ Medium-risk screening results',
              '⚠️ Limited eye contact or social engagement',
              '⚠️ Repetitive behaviors or restricted interests',
              '⚠️ Unusual reactions to sensory input',
              '⚠️ Difficulty with changes in routine',
              '⚠️ Parent or caregiver concerns about development'
            ]
          },
          {
            title: 'Who to Contact',
            content: [
              '<strong>Pediatrician:</strong> First point of contact for developmental concerns',
              '<strong>Developmental Pediatrician:</strong> Specializes in developmental disorders',
              '<strong>Child Psychologist:</strong> Behavioral and developmental assessment',
              '<strong>Speech-Language Pathologist:</strong> Communication and language evaluation',
              '<strong>Occupational Therapist:</strong> Sensory and motor skills assessment',
              '<strong>Early Intervention Program:</strong> Free evaluation for children under 3'
            ]
          },
          {
            title: 'What to Bring to Appointments',
            content: [
              '📄 EarlyVue screening PDF reports',
              '📄 Developmental history and milestones',
              '📄 Medical records and immunization history',
              '📄 List of concerns and specific examples',
              '📄 Videos of concerning behaviors (if applicable)',
              '📄 Family medical history'
            ]
          }
        ]
      }
    },
    {
      id: 'screening-process',
      title: 'Screening Process',
      description: 'Step-by-step guide on how the screening process works and what to expect.',
      icon: '📋',
      content: {
        overview: 'The EarlyVue screening uses eye-tracking technology and AI to assess ASD indicators in a non-invasive, game-like format.',
        sections: [
          {
            title: 'Before the Screening',
            content: [
              '✓ Ensure your child is well-rested and fed',
              '✓ Choose a quiet time when your child is alert and cooperative',
              '✓ Have your webcam positioned at eye level',
              '✓ Ensure good lighting (avoid backlighting)',
              '✓ Minimize distractions in the room',
              '✓ Allow 5-10 minutes for the complete process'
            ]
          },
          {
            title: 'During the Screening',
            content: [
              '<strong>Step 1 - Calibration:</strong> Your child looks at a red circle on screen. Press "C" when they are looking at it.',
              '<strong>Step 2 - Tracking:</strong> A white ball bounces around the screen for 60 seconds. Your child should follow it with their eyes.',
              '<strong>Step 3 - Data Collection:</strong> The system tracks eye movements, fixation patterns, and gaze behavior.',
              '<strong>Step 4 - Analysis:</strong> AI models analyze the data using Random Forest, SVM, and Deep Neural Networks.',
              '<strong>Step 5 - Results:</strong> A comprehensive report is generated with risk assessment and recommendations.'
            ]
          },
          {
            title: 'Tips for Success',
            content: [
              '👀 Sit behind the child so they focus on the screen',
              '👀 Keep your head still, only move eyes to follow the ball',
              '👀 If child loses interest, you can exit early with "Q" key',
              '👀 Multiple screenings over time provide better tracking',
              '👀 Consistency in environment helps with accurate results'
            ]
          },
          {
            title: 'After the Screening',
            content: [
              '📊 Review the results immediately on the All Results page',
              '📄 Download the professional PDF report',
              '📧 Share the report with your healthcare provider',
              '📅 Schedule follow-up screenings every 3-6 months',
              '📝 Keep notes on any developmental changes'
            ]
          }
        ]
      }
    },
    {
      id: 'privacy',
      title: 'Privacy and Data Security',
      description: 'Information about how we protect your family\'s privacy and handle your data.',
      icon: '🔒',
      content: {
        overview: 'Your family\'s privacy and data security are our top priorities. We follow HIPAA guidelines and industry best practices.',
        sections: [
          {
            title: 'Data We Collect',
            content: [
              '<strong>Account Information:</strong> Name, email, phone number (encrypted)',
              '<strong>Child Information:</strong> Name, age, gender (stored securely)',
              '<strong>Screening Data:</strong> Eye-tracking coordinates, timestamps, analysis results',
              '<strong>Usage Data:</strong> Login times, feature usage (anonymized)'
            ]
          },
          {
            title: 'How We Protect Your Data',
            content: [
              '🔐 End-to-end encryption for all data transmission',
              '🔐 Secure database with role-based access control',
              '🔐 Regular security audits and penetration testing',
              '🔐 HIPAA-compliant data storage and handling',
              '🔐 Two-factor authentication available',
              '🔐 Automatic session timeout for security'
            ]
          },
          {
            title: 'Your Data Rights',
            content: [
              '✓ Access your data at any time',
              '✓ Download all your screening reports',
              '✓ Request data deletion (right to be forgotten)',
              '✓ Export your data in standard formats',
              '✓ Opt-out of research data usage',
              '✓ Control who can access your information'
            ]
          },
          {
            title: 'Data Sharing',
            content: [
              '❌ We NEVER sell your personal data',
              '❌ We NEVER share data with third-party advertisers',
              '✓ Data shared only with your explicit consent',
              '✓ Healthcare providers access only with your permission',
              '✓ Anonymized data may be used for research (opt-in only)',
              '✓ You control all data sharing preferences'
            ]
          }
        ]
      }
    },
    {
      id: 'technical',
      title: 'Technical Support',
      description: 'Get help with technical issues, account problems, or using the platform.',
      icon: '🛠️',
      content: {
        overview: 'Having technical difficulties? Here are solutions to common issues.',
        sections: [
          {
            title: 'Common Issues & Solutions',
            content: [
              '<strong>Webcam Not Working:</strong><br/>• Check browser permissions (allow camera access)<br/>• Ensure no other app is using the webcam<br/>• Try a different browser (Chrome recommended)<br/>• Restart your computer',
              '<strong>Screening Window Not Opening:</strong><br/>• Disable popup blockers<br/>• Check if window is behind browser<br/>• Clear browser cache and cookies<br/>• Update your browser to latest version',
              '<strong>PDF Report Not Downloading:</strong><br/>• Check browser download settings<br/>• Ensure sufficient disk space<br/>• Try right-click and "Save As"<br/>• Disable download manager extensions'
            ]
          },
          {
            title: 'System Requirements',
            content: [
              '<strong>Browser:</strong> Chrome 90+, Firefox 88+, Safari 14+, Edge 90+',
              '<strong>Webcam:</strong> 720p or higher resolution',
              '<strong>Internet:</strong> Minimum 5 Mbps connection',
              '<strong>Screen:</strong> 1280x720 minimum resolution',
              '<strong>OS:</strong> Windows 10+, macOS 10.14+, Linux (Ubuntu 20.04+)'
            ]
          },
          {
            title: 'Account Issues',
            content: [
              '<strong>Forgot Password:</strong> Use "Forgot Password" link on login page',
              '<strong>Email Not Verified:</strong> Check spam folder for verification email',
              '<strong>Can\'t Login:</strong> Clear cookies, try incognito mode, reset password',
              '<strong>Account Locked:</strong> Contact support for immediate assistance'
            ]
          },
          {
            title: 'Contact Technical Support',
            content: [
              '📧 Email: support@earlyvue.com',
              '💬 Live Chat: Available 9 AM - 6 PM EST',
              '📞 Phone: 1-800-EARLYVUE',
              '🎫 Submit Ticket: help.earlyvue.com'
            ]
          }
        ]
      }
    }
  ];

  if (selectedTopic) {
    const topic = helpTopics.find(t => t.id === selectedTopic);
    
    return (
      <div className="help-page" style={{ background: 'var(--medical-gray-50)', minHeight: '100vh' }}>
        <Header />
        <main className="main-content" style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--spacing-xl)' }}>
          <button
            className="medical-btn medical-btn-secondary"
            onClick={() => setSelectedTopic(null)}
            style={{ marginBottom: 'var(--spacing-lg)' }}
          >
            ← Back to Help Topics
          </button>
          
          <div className="medical-card">
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
              <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-md)' }}>{topic.icon}</div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--medical-gray-900)', marginBottom: 'var(--spacing-sm)' }}>
                {topic.title}
              </h1>
              <p style={{ fontSize: '16px', color: 'var(--medical-gray-600)' }}>
                {topic.content.overview}
              </p>
            </div>
            
            {topic.content.sections.map((section, idx) => (
              <div key={idx} style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: '700', 
                  color: 'var(--medical-primary)', 
                  marginBottom: 'var(--spacing-md)',
                  paddingBottom: 'var(--spacing-sm)',
                  borderBottom: '2px solid var(--medical-gray-200)'
                }}>
                  {section.title}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  {section.content.map((item, i) => (
                    <div 
                      key={i}
                      style={{
                        padding: 'var(--spacing-md)',
                        background: 'var(--medical-gray-50)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '4px solid var(--medical-primary)',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        color: 'var(--medical-gray-700)'
                      }}
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="help-page" style={{ background: 'var(--medical-gray-50)', minHeight: '100vh' }}>
      <Header />
      <main className="main-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--spacing-xl)' }}>
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <button
            className="medical-btn medical-btn-secondary"
            onClick={() => navigate('/dashboard')}
            style={{ marginBottom: 'var(--spacing-md)' }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--medical-gray-900)', marginBottom: 'var(--spacing-sm)' }}>
            Help & Support
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--medical-gray-600)' }}>
            Find answers to common questions and get support
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-2xl)' }}>
          {helpTopics.map((topic) => (
            <div key={topic.id} className="medical-card" style={{ cursor: 'pointer', transition: 'var(--transition-base)' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: 'var(--spacing-md)' }}>
                {topic.icon}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--medical-gray-900)', marginBottom: 'var(--spacing-sm)' }}>
                {topic.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--medical-gray-600)', marginBottom: 'var(--spacing-lg)', lineHeight: '1.6' }}>
                {topic.description}
              </p>
              <button 
                className="medical-btn medical-btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setSelectedTopic(topic.id)}
              >
                Learn More →
              </button>
            </div>
          ))}
        </div>

        <div className="medical-card" style={{ background: 'linear-gradient(135deg, var(--medical-primary-light) 0%, var(--medical-white) 100%)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--medical-gray-900)', marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>
            Still Need Help?
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--medical-gray-600)', marginBottom: 'var(--spacing-xl)' }}>
            Our support team is here to assist you with any questions or concerns.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)' }}>
            <div style={{ padding: 'var(--spacing-lg)', background: 'var(--medical-white)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 'var(--spacing-sm)' }}>📧 Email Support</h4>
              <p style={{ fontSize: '14px', color: 'var(--medical-gray-600)', marginBottom: 'var(--spacing-md)' }}>
                Get help via email - we'll respond within 24 hours
              </p>
              <button className="medical-btn medical-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Email Us
              </button>
            </div>
            <div style={{ padding: 'var(--spacing-lg)', background: 'var(--medical-white)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 'var(--spacing-sm)' }}>💬 Live Chat</h4>
              <p style={{ fontSize: '14px', color: 'var(--medical-gray-600)', marginBottom: 'var(--spacing-md)' }}>
                Chat with our support team in real-time
              </p>
              <button className="medical-btn medical-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Start Chat
              </button>
            </div>
            <div style={{ padding: 'var(--spacing-lg)', background: 'var(--medical-white)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: 'var(--spacing-sm)' }}>📞 Phone Support</h4>
              <p style={{ fontSize: '14px', color: 'var(--medical-gray-600)', marginBottom: 'var(--spacing-md)' }}>
                Speak directly with our experts
              </p>
              <button className="medical-btn medical-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Call Us
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Help;