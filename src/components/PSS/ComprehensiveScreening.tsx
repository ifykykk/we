import { useState } from 'react';
import './PSS.css';
import { useUser } from '@clerk/clerk-react';

interface Question {
  id: number;
  text: string;
  type?: "normal" | "reverse";
}

interface ResultInfo {
  level: string;
  description: string;
  colorClass: string;
  suggestions: string[];
}

const ComprehensiveScreening = () => {
  const [currentScreen, setCurrentScreen] = useState<'pss' | 'phq9' | 'gad7' | 'results'>('pss');
  const [pssAnswers, setPssAnswers] = useState<Record<number, string>>({});
  const [phq9Answers, setPhq9Answers] = useState<Record<number, number>>({});
  const [gad7Answers, setGad7Answers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  // ...existing code...

  const { user } = useUser();

  // PSS Questions
  const pssQuestions: Question[] = [
    {
      id: 1,
      text: "In the last month, how often have you been upset because of something that happened unexpectedly?",
      type: "normal"
    },
    {
      id: 2,
      text: "In the last month, how often have you felt unable to control the important things in your life?",
      type: "normal"
    },
    {
      id: 3,
      text: "In the last month, how often have you felt nervous and stressed?",
      type: "normal"
    },
    {
      id: 4,
      text: "In the last month, how often have you felt confident about your ability to handle personal problems?",
      type: "reverse"
    },
    {
      id: 5,
      text: "In the last month, how often have you felt that things were going your way?",
      type: "reverse"
    },
    {
      id: 6,
      text: "In the last month, how often have you found that you could not cope with all the things you had to do?",
      type: "normal"
    },
    {
      id: 7,
      text: "In the last month, how often have you been able to control irritations in your life?",
      type: "reverse"
    },
    {
      id: 8,
      text: "In the last month, how often have you felt that you were on top of things?",
      type: "reverse"
    },
    {
      id: 9,
      text: "In the last month, how often have you been angered because of things outside of your control?",
      type: "normal"
    },
    {
      id: 10,
      text: "In the last month, how often have you felt difficulties were piling up too high to overcome?",
      type: "normal"
    }
  ];

  // PHQ-9 Questions
  const phq9Questions: Question[] = [
    { id: 1, text: "Little interest or pleasure in doing things." },
    { id: 2, text: "Feeling down, depressed, or hopeless." },
    { id: 3, text: "Trouble falling or staying asleep, or sleeping too much." },
    { id: 4, text: "Feeling tired or having little energy." },
    { id: 5, text: "Poor appetite or overeating." },
    { id: 6, text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down." },
    { id: 7, text: "Trouble concentrating on things, such as reading the newspaper or watching television." },
    { id: 8, text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual." },
    { id: 9, text: "Thoughts that you would be better off dead, or of hurting yourself in some way." }
  ];

  // GAD-7 Questions
  const gad7Questions: Question[] = [
    { id: 1, text: "Feeling nervous, anxious, or on edge" },
    { id: 2, text: "Not being able to stop or control worrying" },
    { id: 3, text: "Worrying too much about different things" },
    { id: 4, text: "Trouble relaxing" },
    { id: 5, text: "Being so restless that it is hard to sit still" },
    { id: 6, text: "Becoming easily annoyed or irritable" },
    { id: 7, text: "Feeling afraid, as if something awful might happen" }
  ];

  const pssOptions = ["Never", "Almost Never", "Sometimes", "Fairly Often", "Very Often"];
  const likertOptions = [
    { label: "Not at all", value: 0 },
    { label: "Several days", value: 1 },
    { label: "More than half the days", value: 2 },
    { label: "Nearly every day", value: 3 }
  ];

  const calculatePSSScore = (): number => {
    let total = 0;
    Object.entries(pssAnswers).forEach(([questionId, answer]) => {
      const question = pssQuestions.find(q => q.id === parseInt(questionId));
      const answerIndex = pssOptions.indexOf(answer as string);
      
      if (question && question.type === "normal") {
        total += answerIndex;
      } else if (question) {
        total += 4 - answerIndex;
      }
    });
    return total;
  };

  const calculatePHQ9Score = (): number => {
    return Object.values(phq9Answers).reduce((sum, val) => sum + val, 0);
  };

  const calculateGAD7Score = (): number => {
    return Object.values(gad7Answers).reduce((sum, val) => sum + val, 0);
  };

  const handlePSSAnswer = (questionId: number, value: string) => {
    setPssAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handlePHQ9Answer = (questionId: number, value: number) => {
    setPhq9Answers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleGAD7Answer = (questionId: number, value: number) => {
    setGad7Answers(prev => ({ ...prev, [questionId]: value }));
  };

  const submitScreening = async () => {
    setLoading(true);
    
    const pssScore = calculatePSSScore();
    const phq9Score = calculatePHQ9Score();
    const gad7Score = calculateGAD7Score();
    
    console.log('📊 Calculated scores:', { pssScore, phq9Score, gad7Score });
    
    try {
      // Submit to our new comprehensive screening endpoint
      const payload = {
        userId: user?.id || user?.primaryEmailAddress?.emailAddress,
        screeningType: 'comprehensive',
        scores: {
          pss: pssScore,
          phq9: phq9Score,
          gad7: gad7Score,
          ghq: 0 // Placeholder for GHQ if implemented later
        },
        userProfile: {
          department: 'Computer Science', // You can get this from user profile
          year: '3',
          semester: '6'
        }
      };
      
      console.log('📤 Submitting screening payload:', payload);
      
      const response = await fetch('http://localhost:3000/api/submit-screening', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      console.log('📥 Response status:', response.status);
      
      const result = await response.json();
      console.log('📥 Response data:', result);
      
      if (result.success) {
  // ...existing code...
        setSubmitted(true);
        setCurrentScreen('results');
        console.log('✅ Screening submitted successfully, risk level:', result.riskLevel);
      } else {
        console.error('❌ Screening submission failed:', result);
      }
    } catch (error) {
      console.error('❌ Error submitting screening:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOverallResultInfo = (pss: number, phq9: number, gad7: number): ResultInfo => {
    // This matches the logic in our backend
    let riskScore = 0;
    
    if (pss >= 27) riskScore += 3;
    else if (pss >= 21) riskScore += 2;
    else if (pss >= 14) riskScore += 1;
    
    if (phq9 >= 15) riskScore += 3;
    else if (phq9 >= 10) riskScore += 2;
    else if (phq9 >= 5) riskScore += 1;
    
    if (gad7 >= 15) riskScore += 3;
    else if (gad7 >= 10) riskScore += 2;
    else if (gad7 >= 5) riskScore += 1;
    
    let level = 'low';
    if (riskScore >= 7) level = 'critical';
    else if (riskScore >= 5) level = 'high';
    else if (riskScore >= 3) level = 'moderate';

    switch (level) {
      case 'low':
        return {
          level: "Low Risk",
          description: "Your responses suggest minimal mental health concerns. Keep maintaining your current well-being practices.",
          colorClass: "stress-low",
          suggestions: [
            "Continue with current stress management techniques",
            "Maintain regular exercise and sleep schedule",
            "Stay connected with friends and family",
            "Practice mindfulness regularly"
          ]
        };
      case 'moderate':
        return {
          level: "Moderate Risk",
          description: "Your responses indicate some mental health concerns that may benefit from attention and support.",
          colorClass: "stress-mid",
          suggestions: [
            "Consider speaking with a counselor or therapist",
            "Implement daily stress reduction activities",
            "Establish clear work-life boundaries",
            "Practice relaxation techniques regularly"
          ]
        };
      case 'high':
        return {
          level: "High Risk",
          description: "Your responses suggest significant mental health concerns. Professional support is strongly recommended.",
          colorClass: "stress-high",
          suggestions: [
            "Seek professional mental health support immediately",
            "Reach out to campus counseling services",
            "Contact a trusted friend or family member",
            "Consider emergency resources if you're in crisis"
          ]
        };
      case 'critical':
        return {
          level: "Critical Risk",
          description: "Your responses indicate severe mental health concerns requiring immediate professional attention.",
          colorClass: "stress-high",
          suggestions: [
            "Contact emergency mental health services immediately",
            "Reach out to campus crisis intervention",
            "Call a mental health helpline",
            "Do not delay in seeking professional help"
          ]
        };
      default:
        return {
          level: "Assessment Complete",
          description: "Thank you for completing the screening.",
          colorClass: "stress-low",
          suggestions: []
        };
    }
  };

  // Render different screens
  if (currentScreen === 'pss') {
    return (
      <div className="pss-container">
        <div className="progress-indicator">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '33%' }}></div>
          </div>
          <p>Step 1 of 3: Stress Assessment (PSS-10)</p>
        </div>
        
        <h1>Perceived Stress Scale</h1>
        <p className="intro-text">Please indicate how often you felt or thought a certain way in the last month.</p>
        
        <div className="questions-section">
          {pssQuestions.map((question) => (
            <div key={question.id} className="question-block">
              <div className="question-text">{question.text}</div>
              <div className="options-group">
                {pssOptions.map((option) => (
                  <button
                    key={option}
                    className={`option-button ${pssAnswers[question.id] === option ? 'selected' : ''}`}
                    onClick={() => handlePSSAnswer(question.id, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          className="submit-button"
          onClick={() => setCurrentScreen('phq9')}
          disabled={Object.keys(pssAnswers).length !== pssQuestions.length}
        >
          Continue to Depression Assessment
        </button>
      </div>
    );
  }

  if (currentScreen === 'phq9') {
    return (
      <div className="pss-container">
        <div className="progress-indicator">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '66%' }}></div>
          </div>
          <p>Step 2 of 3: Depression Assessment (PHQ-9)</p>
        </div>
        
        <h1>Depression Screening</h1>
        <p className="intro-text">Over the last 2 weeks, how often have you been bothered by any of the following problems?</p>
        
        <div className="questions-section">
          {phq9Questions.map((question) => (
            <div key={question.id} className="question-block">
              <div className="question-text">{question.text}</div>
              <div className="options-group">
                {likertOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`option-button ${phq9Answers[question.id] === option.value ? 'selected' : ''}`}
                    onClick={() => handlePHQ9Answer(question.id, option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="navigation-buttons">
          <button
            className="nav-button"
            onClick={() => setCurrentScreen('pss')}
          >
            Back
          </button>
          <button
            className="submit-button"
            onClick={() => setCurrentScreen('gad7')}
            disabled={Object.keys(phq9Answers).length !== phq9Questions.length}
          >
            Continue to Anxiety Assessment
          </button>
        </div>
      </div>
    );
  }

  if (currentScreen === 'gad7') {
    return (
      <div className="pss-container">
        <div className="progress-indicator">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '100%' }}></div>
          </div>
          <p>Step 3 of 3: Anxiety Assessment (GAD-7)</p>
        </div>
        
        <h1>Anxiety Screening</h1>
        <p className="intro-text">Over the last 2 weeks, how often have you been bothered by the following problems?</p>
        
        <div className="questions-section">
          {gad7Questions.map((question) => (
            <div key={question.id} className="question-block">
              <div className="question-text">{question.text}</div>
              <div className="options-group">
                {likertOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`option-button ${gad7Answers[question.id] === option.value ? 'selected' : ''}`}
                    onClick={() => handleGAD7Answer(question.id, option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="navigation-buttons">
          <button
            className="nav-button"
            onClick={() => setCurrentScreen('phq9')}
          >
            Back
          </button>
          <button
            className="submit-button"
            onClick={submitScreening}
            disabled={Object.keys(gad7Answers).length !== gad7Questions.length || loading}
          >
            {loading ? 'Processing...' : 'Complete Assessment'}
          </button>
        </div>
      </div>
    );
  }

  if (currentScreen === 'results' && submitted) {
    const pssScore = calculatePSSScore();
    const phq9Score = calculatePHQ9Score();
    const gad7Score = calculateGAD7Score();
    const { level, description, colorClass, suggestions } = getOverallResultInfo(pssScore, phq9Score, gad7Score);
    
    return (
      <div className="pss-container">
        <h1>Assessment Complete</h1>
        
        <div className="results-section">
          <div className="individual-scores">
            <div className="score-item">
              <h3>Stress Level (PSS)</h3>
              <div className="score-display">{pssScore}/40</div>
            </div>
            <div className="score-item">
              <h3>Depression (PHQ-9)</h3>
              <div className="score-display">{phq9Score}/27</div>
            </div>
            <div className="score-item">
              <h3>Anxiety (GAD-7)</h3>
              <div className="score-display">{gad7Score}/21</div>
            </div>
          </div>
          
          <div className={`stress-level ${colorClass}`}>
            Overall Risk Level: {level}
          </div>
          
          <p className="stress-description">{description}</p>

          <div className="suggestions-card">
            <h3>Personalized Recommendations</h3>
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <span className="suggestion-number">{index + 1}</span>
                  <span className="suggestion-text">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="privacy-notice">
            <p><strong>Privacy Notice:</strong> Your responses have been securely processed and anonymized. 
            If you indicated high-risk concerns, appropriate campus resources may reach out to provide support.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ComprehensiveScreening;
