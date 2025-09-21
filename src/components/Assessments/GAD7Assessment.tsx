import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { X, ArrowLeft } from 'lucide-react';
import './Assessment.css';

interface Question {
  id: number;
  text: string;
}

interface ResultInfo {
  level: string;
  description: string;
  colorClass: string;
  suggestions: string[];
}

const GAD7Assessment: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const questions: Question[] = [
    { id: 1, text: "Feeling nervous, anxious, or on edge" },
    { id: 2, text: "Not being able to stop or control worrying" },
    { id: 3, text: "Worrying too much about different things" },
    { id: 4, text: "Trouble relaxing" },
    { id: 5, text: "Being so restless that it is hard to sit still" },
    { id: 6, text: "Becoming easily annoyed or irritable" },
    { id: 7, text: "Feeling afraid, as if something awful might happen" }
  ];

  const options = [
    { label: "Not at all", value: 0 },
    { label: "Several days", value: 1 },
    { label: "More than half the days", value: 2 },
    { label: "Nearly every day", value: 3 }
  ];

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Last question answered, submit
      submitAssessment(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = (allAnswers: Record<number, number>): number => {
    return Object.values(allAnswers).reduce((sum, val) => sum + val, 0);
  };

  const getResultInfo = (score: number): ResultInfo => {
    if (score <= 9) {
      return {
        level: "Low Risk",
        description: "Your responses suggest minimal anxiety concerns. Keep maintaining your current well-being practices.",
        colorClass: "risk-low",
        suggestions: [
          "Continue with current stress management techniques",
          "Maintain regular exercise and sleep schedule",
          "Practice mindfulness or relaxation techniques",
          "Stay connected with supportive friends and family"
        ]
      };
    } else if (score <= 14) {
      return {
        level: "Moderate Risk",
        description: "Your responses indicate some anxiety concerns that may benefit from attention and support.",
        colorClass: "risk-moderate",
        suggestions: [
          "Consider speaking with a counselor or therapist",
          "Practice daily relaxation or breathing exercises",
          "Limit caffeine and alcohol intake",
          "Establish a regular sleep routine"
        ]
      };
    } else {
      return {
        level: "Critical Risk",
        description: "Your responses indicate significant anxiety concerns requiring immediate professional attention.",
        colorClass: "risk-critical",
        suggestions: [
          "Contact emergency mental health services immediately",
          "Reach out to campus crisis intervention",
          "Call a mental health helpline",
          "Do not delay in seeking professional help"
        ]
      };
    }
  };

  const submitAssessment = async (finalAnswers: Record<number, number>) => {
    setLoading(true);
    
    const score = calculateScore(finalAnswers);
    console.log('📊 GAD-7 Score calculated:', score);
    
    try {
      const payload = {
        userId: user?.id || user?.primaryEmailAddress?.emailAddress,
        screeningType: 'gad7',
        scores: {
          gad7: score
        },
        userProfile: {
          department: 'Computer Science',
          year: '3',
          semester: '6'
        }
      };
      
      console.log('📤 Submitting GAD-7 assessment:', payload);
      
      const response = await fetch('http://localhost:3000/api/submit-screening', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      console.log('📥 GAD-7 Response:', result);
      
      if (result.success) {
        setShowResults(true);
        console.log('✅ GAD-7 assessment submitted successfully');
      } else {
        console.error('❌ GAD-7 assessment submission failed:', result);
      }
    } catch (error) {
      console.error('❌ Error submitting GAD-7 assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showResults) {
    const score = calculateScore(answers);
    const resultInfo = getResultInfo(score);
    
    return (
      <div className="assessment-modal">
        <div className="assessment-container">
          <button className="assessment-close" onClick={onClose}>
            <X size={20} />
          </button>
          
          <div className="results-container">
            <h1 className="results-title">Assessment Complete</h1>
            
            <div className="score-display">
              <h3>Anxiety Level (GAD-7)</h3>
              <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0' }}>
                {score}/21
              </div>
            </div>
            
            <div className={`risk-level ${resultInfo.colorClass}`}>
              Overall Risk Level: {resultInfo.level}
            </div>
            
            <p className="risk-description">{resultInfo.description}</p>

            <div className="recommendations-section">
              <h3 className="recommendations-title">Personalized Recommendations</h3>
              <ul className="recommendations-list">
                {resultInfo.suggestions.map((suggestion, index) => (
                  <li key={index} className="recommendation-item">
                    <span className="recommendation-icon">•</span>
                    <span className="recommendation-text">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="privacy-notice">
              <strong>Privacy Notice:</strong> Your responses have been securely processed and anonymized. 
              If you indicated high-risk concerns, appropriate campus resources may reach out to provide support.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="assessment-modal">
        <div className="assessment-container">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2>Processing your assessment...</h2>
            <p>Please wait while we analyze your responses.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="assessment-modal">
      <div className="assessment-container">
        <button className="assessment-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="assessment-header">
          <h1 className="assessment-title">Anxiety Test</h1>
          <p className="assessment-subtitle">
            This test is based on the Generalized Anxiety Disorder-7 (GAD-7)
          </p>
        </div>

        <div className="progress-section">
          <p className="progress-text">
            SCREEN {currentQuestion + 1} of {questions.length}
          </p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="question-section">
          <h2 className="question-text">
            In the past 1 month, have you experienced {currentQ.text.toLowerCase()}?
          </h2>
          
          <div className="options-grid">
            {options.map((option) => (
              <button
                key={option.value}
                className={`option-button ${answers[currentQ.id] === option.value ? 'selected' : ''}`}
                onClick={() => handleAnswer(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="navigation-buttons">
          <button
            className="nav-button"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft size={16} style={{ marginRight: '8px' }} />
            Previous
          </button>
          <button
            className="nav-button"
            onClick={() => {}}
            disabled
            style={{ visibility: 'hidden' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default GAD7Assessment;