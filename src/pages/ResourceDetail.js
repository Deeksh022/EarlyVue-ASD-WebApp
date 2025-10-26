import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/ParentDashboard/Header';

const ResourceDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock resource data - in a real app, this would come from an API or context
  const resources = {
    1: {
      title: 'Understanding ASD Screening',
      content: `
        <h2>What is ASD Screening?</h2>
        <p>Autism Spectrum Disorder (ASD) screening is a process designed to identify children who may benefit from a comprehensive evaluation for developmental concerns. Early screening is crucial because it allows for timely intervention and support.</p>

        <h2>How Does the Screening Work?</h2>
        <p>Our screening uses evidence-based questionnaires and observational tools that assess various developmental domains including:</p>
        <ul>
          <li>Social communication skills</li>
          <li>Behavioral patterns</li>
          <li>Developmental milestones</li>
          <li>Language development</li>
        </ul>

        <h2>Understanding Your Results</h2>
        <p>The screening provides a risk assessment categorized as:</p>
        <ul>
          <li><strong>Low Risk:</strong> Typical development patterns observed</li>
          <li><strong>Medium Risk:</strong> Some developmental differences noted, follow-up recommended</li>
          <li><strong>High Risk:</strong> Significant developmental concerns identified, immediate evaluation advised</li>
        </ul>
      `,
      icon: '📚'
    },
    2: {
      title: 'Developmental Milestones',
      content: `
        <h2>Why Developmental Milestones Matter</h2>
        <p>Developmental milestones are key indicators of your child's growth and development. Tracking these milestones helps identify potential developmental delays early.</p>

        <h2>Key Milestones by Age</h2>
        <h3>12-18 Months</h3>
        <ul>
          <li>First words (mama, dada)</li>
          <li>Points to objects of interest</li>
          <li>Follows simple instructions</li>
          <li>Shows affection to familiar people</li>
        </ul>

        <h3>18-24 Months</h3>
        <ul>
          <li>Uses 10-20 words vocabulary</li>
          <li>Points to body parts when asked</li>
          <li>Begins to play pretend</li>
          <li>Follows two-step instructions</li>
        </ul>

        <h2>What to Do If Concerns Arise</h2>
        <p>If you notice your child is not meeting expected milestones, discuss your concerns with your pediatrician. Early intervention can make a significant difference in developmental outcomes.</p>
      `,
      icon: '📈'
    },
    3: {
      title: 'Find a Specialist',
      content: `
        <h2>Types of Specialists</h2>
        <p>Different professionals can help support your child's development:</p>

        <h3>Developmental Pediatrician</h3>
        <p>Specializes in child development and can provide comprehensive evaluations and guidance.</p>

        <h3>Child Psychologist</h3>
        <p>Experts in child behavior and development who can assess developmental concerns.</p>

        <h3>Speech-Language Pathologist</h3>
        <p>Specialists who work on communication skills and language development.</p>

        <h3>Occupational Therapist</h3>
        <p>Professionals who help with sensory processing and daily living skills.</p>

        <h2>How to Find Help</h2>
        <p>Several resources are available to help you find qualified specialists:</p>
        <ul>
          <li>Ask your pediatrician for referrals</li>
          <li>Contact your local early intervention program</li>
          <li>Use professional directories and databases</li>
          <li>Check with your insurance provider</li>
        </ul>
      `,
      icon: '👨‍⚕️'
    }
  };

  const resource = resources[id];

  if (!resource) {
    return (
      <div className="resource-detail-page">
        <Header />
        <main className="main-content">
          <div className="page-container">
            <div className="page-header">
              <button
                className="btn btn-outline back-btn"
                onClick={() => navigate('/dashboard')}
              >
                ← Back to Dashboard
              </button>
              <h1>Resource Not Found</h1>
              <p>The requested resource could not be found.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="resource-detail-page">
      <Header />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <button
              className="btn btn-outline back-btn"
              onClick={() => navigate('/dashboard')}
            >
              ← Back to Dashboard
            </button>
            <div className="resource-header">
              <div className="resource-icon">{resource.icon}</div>
              <h1>{resource.title}</h1>
            </div>
          </div>

          <div className="resource-content">
            <div
              className="resource-text"
              dangerouslySetInnerHTML={{ __html: resource.content }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResourceDetail;