import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface WalkthroughStep {
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    title: 'Welcome to Nexus! 🚀',
    description: 'Nexus connects investors with entrepreneurs. Let us show you around the platform and its powerful features.',
    position: 'center',
  },
  {
    title: 'Dashboard Overview',
    description: 'Your dashboard shows key metrics, connections, and activity at a glance. Use the sidebar to navigate between features.',
    position: 'center',
  },
  {
    title: 'Meeting Scheduler 📅',
    description: 'Schedule meetings with investors or entrepreneurs. Set your availability, send meeting requests, and manage your calendar.',
    position: 'center',
  },
  {
    title: 'Video Calls 📹',
    description: 'Start video calls directly from the platform. Toggle audio/video, share your screen, and use the in-call chat feature.',
    position: 'center',
  },
  {
    title: 'Document Chamber 📄',
    description: 'Upload contracts and deals, preview documents, and sign them with our built-in e-signature pad. Track status: Draft → In Review → Signed.',
    position: 'center',
  },
  {
    title: 'Payments & Wallet 💳',
    description: 'Manage your funds with deposit, withdraw, and transfer options. Investors can fund startups, and entrepreneurs can receive payments.',
    position: 'center',
  },
  {
    title: 'Security Center 🔒',
    description: 'Protect your account with a strong password, enable two-factor authentication, and manage active sessions.',
    position: 'center',
  },
  {
    title: 'You\'re all set! ✨',
    description: 'Explore the platform and start connecting. You can always access this tour from the Help section. Happy collaborating!',
    position: 'center',
  },
];

const STORAGE_KEY = 'nexus_walkthrough_completed';

export const GuidedWalkthrough: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setTimeout(() => setIsActive(true), 1500);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < WALKTHROUGH_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleComplete = () => {
    setIsActive(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  if (!isActive && showButton) {
    return (
      <button
        onClick={handleRestart}
        className="fixed bottom-6 right-6 z-40 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-110 group"
        title="Platform Tour"
      >
        <Sparkles size={20} />
        <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Platform Tour
        </span>
      </button>
    );
  }

  if (!isActive) return null;

  const step = WALKTHROUGH_STEPS[currentStep];
  const progress = ((currentStep + 1) / WALKTHROUGH_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleComplete} />

      {/* Tooltip */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-in overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs text-primary-600 font-medium">Step {currentStep + 1} of {WALKTHROUGH_STEPS.length}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{step.title}</h3>
              </div>
              <button onClick={handleComplete} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                  currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={16} /> Back
              </button>

              <div className="flex gap-1">
                {WALKTHROUGH_STEPS.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentStep ? 'bg-primary-500' : i < currentStep ? 'bg-primary-200' : 'bg-gray-200'}`} />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-1 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors"
              >
                {currentStep === WALKTHROUGH_STEPS.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={16} />
              </button>
            </div>

            {/* Skip */}
            {currentStep < WALKTHROUGH_STEPS.length - 1 && (
              <button onClick={handleComplete} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-3">
                Skip tour
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
