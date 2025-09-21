import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
    to?: string;
    className?: string;
    children?: React.ReactNode;
}

const BackButton: React.FC<BackButtonProps> = ({ 
    to, 
    className = '', 
    children 
}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1); // Go back to previous page
        }
    };

    return (
        <button
            onClick={handleBack}
            className={`
                inline-flex items-center justify-center
                px-4 py-2 text-sm font-medium
                bg-white/80 backdrop-blur-sm
                text-gray-700 rounded-xl
                shadow-lg hover:shadow-xl
                transform hover:scale-[1.02]
                transition-all duration-200
                border border-gray-200
                hover:bg-white hover:border-gray-300
                focus:outline-none focus:ring-2 focus:ring-blue-200
                ${className}
            `}
        >
            <svg 
                className="w-4 h-4 mr-2 text-gray-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
            </svg>
            {children || 'Back'}
        </button>
    );
};

export default BackButton;
