import React, { useState } from 'react';
import GAD7Assessment from './GAD7Assessment';
import PHQ9Assessment from './PHQ9Assessment';
import GHQ12Assessment from './GHQ12Assessment';
import './Assessment.css';

// Import images
import anxietyImage from '../../assets/images/anxiety.jpeg';
import lowmoodImage from '../../assets/images/lowmood.jpeg';
import emotionImage from '../../assets/images/emotion.jpeg';

const AssessmentCards: React.FC = () => {
  const [activeAssessment, setActiveAssessment] = useState<'gad7' | 'phq9' | 'ghq12' | null>(null);

  const assessments = [
    {
      id: 'gad7' as const,
      title: 'Are You Anxious?',
      description: 'This test is based on the Generalized Anxiety Disorder-7 (GAD-7)',
      dataType: 'gad7',
      image: anxietyImage
    },
    {
      id: 'phq9' as const,
      title: 'Low Mood Check',
      description: 'This test is based on the Patient Health Questionnaire-9 (PHQ-9)',
      dataType: 'phq9',
      image: lowmoodImage
    },
    {
      id: 'ghq12' as const,
      title: 'Emotional Wellness Test',
      description: 'This test is based on the General Health Questionnaire-12 (GHQ-12)',
      dataType: 'ghq12',
      image: emotionImage
    }
  ];

  const handleAssessmentClick = (assessmentId: 'gad7' | 'phq9' | 'ghq12') => {
    setActiveAssessment(assessmentId);
  };

  const handleCloseAssessment = () => {
    setActiveAssessment(null);
  };

  return (
    <>
      <div className="assessments-section">
        <h2 className="assessments-title">Assessments to Know Yourself Better</h2>
        <p className="assessments-subtitle">
          Take these scientifically-validated assessments to understand your mental health and wellbeing
        </p>
        
        <div className="assessments-grid">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="assessment-card"
              data-type={assessment.dataType}
              onClick={() => handleAssessmentClick(assessment.id)}
            >
              <div 
                className="assessment-card-header"
                style={{
                  backgroundImage: `url(${assessment.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              ></div>
              <div className="assessment-card-content">
                <h3 className="assessment-card-title">{assessment.title}</h3>
                <p className="assessment-card-description">{assessment.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Render Active Assessment */}
      {activeAssessment === 'gad7' && (
        <GAD7Assessment onClose={handleCloseAssessment} />
      )}
      {activeAssessment === 'phq9' && (
        <PHQ9Assessment onClose={handleCloseAssessment} />
      )}
      {activeAssessment === 'ghq12' && (
        <GHQ12Assessment onClose={handleCloseAssessment} />
      )}
    </>
  );
};

export default AssessmentCards;