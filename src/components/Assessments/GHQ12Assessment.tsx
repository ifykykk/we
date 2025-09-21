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

const GHQ12Assessment: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const questions: Question[] = [
    { id: 1, text: "Have you recently been able to concentrate on whatever you're doing?" },
    { id: 2, text: "Have you recently lost much sleep over worry?" },
    { id: 3, text: "Have you recently felt that you were playing a useful part in things?" },
    { id: 4, text: "Have you recently felt capable of making decisions about things?" },
    { id: 5, text: "Have you recently felt constantly under strain?" },
    { id: 6, text: "Have you recently felt you couldn't overcome your difficulties?" },
    { id: 7, text: "Have you recently been able to enjoy your normal day-to-day activities?" },
    { id: 8, text: "Have you recently been able to face up to problems?" },
    { id: 9, text: "Have you recently been feeling unhappy or depressed?" },
    { id: 10, text: "Have you recently been losing confidence in yourself?" },
    { id: 11, text: "Have you recently been thinking of yourself as a worthless person?" },
    { id: 12, text: "Have you recently been feeling reasonably happy, all things considered?" }
  ];

  // GHQ-12 scoring: Questions 1,3,4,7,8,12 are positive (reverse scored), others are negative
  const positiveQuestions = [1, 3, 4, 7, 8, 12];

  const getOptionsForQuestion = (questionId: number) => {
    if (positiveQuestions.includes(questionId)) {
      return [
        { label: "Better than usual", value: 0 },
        { label: "Same as usual", value: 0 },
        { label: "Less than usual", value: 1 },
        { label: "Much less than usual", value: 3 }
      ];
    } else {
      return [
        { label: "Not at all", value: 0 },
        { label: "No more than usual", value: 0 },
        { label: "Rather more than usual", value: 1 },
        { label: "Much more than usual", value: 3 }
      ];
    }
  };

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: value };
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
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
    if (score <= 12) {
      return {
        level: "Low Risk",
        description: "Your responses suggest good emotional wellness and mental health functioning.",
        colorClass: "risk-low",
        suggestions: [
          "Continue maintaining your current well-being practices",
          "Keep up with regular physical activity and social connections",
          "Practice stress management techniques regularly",
          "Maintain a healthy work-life balance"
        ]
      };
    } else if (score <= 25) {
      return {
        level: "Moderate Risk",
        description: "Your responses indicate some emotional wellness concerns that may benefit from attention.",
        colorClass: "risk-moderate",
        suggestions: [
          "Consider developing better stress management strategies",
          "Seek support from friends, family, or counselors",
          "Focus on improving sleep and self-care routines",
          "Consider professional guidance for emotional support"
        ]
      };
    } else {
      return {
        level: "Critical Risk",
        description: "Your responses indicate significant emotional wellness concerns requiring professional attention.",
        colorClass: "risk-critical",
        suggestions: [
          "Contact mental health services immediately",
          "Reach out to campus crisis support",
          "Call a mental health helpline",
          "Do not delay in seeking professional help"
        ]
      };
    }
  };

  const submitAssessment = async (finalAnswers: Record<number, number>) => {
    setLoading(true);
    
    const score = calculateScore(finalAnswers);
    console.log('📊 GHQ-12 Score calculated:', score);
    
    try {
      const payload = {
        userId: user?.id || user?.primaryEmailAddress?.emailAddress,
        screeningType: 'ghq12',
        scores: {
          ghq12: score
        },
        userProfile: {
          department: 'Computer Science',
          year: '3',
          semester: '6'
        }
      };
      
      console.log('📤 Submitting GHQ-12 assessment:', payload);
      
      const response = await fetch('http://localhost:3000/api/submit-screening', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      console.log('📥 GHQ-12 Response:', result);
      
      if (result.success) {
        setShowResults(true);
        console.log('✅ GHQ-12 assessment submitted successfully');
      } else {
        console.error('❌ GHQ-12 assessment submission failed:', result);
      }
    } catch (error) {
      console.error('❌ Error submitting GHQ-12 assessment:', error);
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
              <h3>Emotional Wellness Test (GHQ-12)</h3>
              <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0' }}>
                {score}/36
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
  const options = getOptionsForQuestion(currentQ.id);

  return (
    <div className="assessment-modal">
      <div className="assessment-container">
        <button className="assessment-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="assessment-header">
          <h1 className="assessment-title">Emotional Wellness Test</h1>
          <p className="assessment-subtitle">
            This test is based on the General Health Questionnaire-12 (GHQ-12)
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
            {currentQ.text}
          </h2>
          
          <div className="options-grid">
            {options.map((option, index) => (
              <button
                key={index}
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

export default GHQ12Assessment;