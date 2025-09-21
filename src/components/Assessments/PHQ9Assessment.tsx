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

const PHQ9Assessment: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const questions: Question[] = [
    { id: 1, text: "Little interest or pleasure in doing things" },
    { id: 2, text: "Feeling down, depressed, or hopeless" },
    { id: 3, text: "Trouble falling or staying asleep, or sleeping too much" },
    { id: 4, text: "Feeling tired or having little energy" },
    { id: 5, text: "Poor appetite or overeating" },
    { id: 6, text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down" },
    { id: 7, text: "Trouble concentrating on things, such as reading the newspaper or watching television" },
    { id: 8, text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual" },
    { id: 9, text: "Thoughts that you would be better off dead, or of hurting yourself in some way" }
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
        description: "Your responses suggest minimal depression concerns. Keep maintaining your current well-being practices.",
        colorClass: "risk-low",
        suggestions: [
          "Continue with current mental health practices",
          "Maintain regular social connections",
          "Keep up with physical exercise and healthy eating",
          "Practice gratitude and mindfulness regularly"
        ]
      };
    } else if (score <= 19) {
      return {
        level: "Moderate Risk",
        description: "Your responses indicate some depression concerns that may benefit from attention and support.",
        colorClass: "risk-moderate",
        suggestions: [
          "Consider speaking with a mental health professional",
          "Increase social activities and connections",
          "Establish a regular daily routine",
          "Focus on healthy sleep patterns and nutrition"
        ]
      };
    } else {
      return {
        level: "Critical Risk",
        description: "Your responses indicate significant depression concerns requiring immediate professional attention.",
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
    console.log('📊 PHQ-9 Score calculated:', score);
    
    try {
      const payload = {
        userId: user?.id || user?.primaryEmailAddress?.emailAddress,
        screeningType: 'phq9',
        scores: {
          phq9: score
        },
        userProfile: {
          department: 'Computer Science',
          year: '3',
          semester: '6'
        }
      };
      
      console.log('📤 Submitting PHQ-9 assessment:', payload);
      
      const response = await fetch('http://localhost:3000/api/submit-screening', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      console.log('📥 PHQ-9 Response:', result);
      
      if (result.success) {
        setShowResults(true);
        console.log('✅ PHQ-9 assessment submitted successfully');
      } else {
        console.error('❌ PHQ-9 assessment submission failed:', result);
      }
    } catch (error) {
      console.error('❌ Error submitting PHQ-9 assessment:', error);
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
              <h3>Low Mood Check (PHQ-9)</h3>
              <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0' }}>
                {score}/27
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
          <h1 className="assessment-title">Low Mood Check</h1>
          <p className="assessment-subtitle">
            This test is based on the Patient Health Questionnaire-9 (PHQ-9)
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
            Over the last 2 weeks, how often have you been bothered by {currentQ.text.toLowerCase()}?
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

export default PHQ9Assessment;