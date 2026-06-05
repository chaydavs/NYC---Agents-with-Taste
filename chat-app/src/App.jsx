import { useState, useRef, useEffect } from 'react';
import { ChatProvider } from './context/ChatContext';
import StepIndicator from './components/StepIndicator';
import StepUserInfo from './steps/StepUserInfo';
import StepFitness from './steps/StepFitness';
import StepLocation from './steps/StepLocation';
import StepDietaryRestrictions from './steps/StepDietaryRestrictions';
import StepSummary from './steps/StepSummary';

const STEPS = [
  { component: StepUserInfo, label: 'About you' },
  { component: StepFitness, label: 'Fitness & Diet' },
  { component: StepLocation, label: 'Location' },
  { component: StepDietaryRestrictions, label: 'Restrictions' },
  { component: StepSummary, label: 'Summary' },
];

function ChatFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentStep]);

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      {/* Header */}
      <div className="w-full max-w-xl mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Wellness Assistant</p>
            <p className="text-xs text-green-500 font-medium">● Online</p>
          </div>
        </div>
        <StepIndicator current={currentStep} total={STEPS.length} />
      </div>

      {/* Chat window */}
      <div className="w-full max-w-xl flex-1 space-y-2 pb-4">
        {STEPS.slice(0, currentStep + 1).map((step, i) => {
          const Component = step.component;
          return (
            <div key={i}>
              <Component onNext={goNext} />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ChatProvider>
      <ChatFlow />
    </ChatProvider>
  );
}
