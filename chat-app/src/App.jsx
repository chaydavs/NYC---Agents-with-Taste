import { useState, useRef, useEffect } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import StepIndicator from './components/StepIndicator';
import ProfileBar from './components/ProfileBar';
import StepName from './steps/StepName';
import StepGoalsTraining from './steps/StepGoalsTraining';
import StepDietary from './steps/StepDietary';
import StepLocation from './steps/StepLocation';

const INTAKE_STEPS = [StepName, StepGoalsTraining, StepDietary, StepLocation];

// ─── Intake flow (shown before profile is complete) ───────────────────────────
function IntakeFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [step]);

  const goNext = () => {
    if (step < INTAKE_STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="w-full max-w-xl">
      <StepIndicator current={step} total={INTAKE_STEPS.length} />
      <div className="space-y-2 pb-10">
        {INTAKE_STEPS.slice(0, step + 1).map((Step, i) => (
          <div key={i}>
            <Step onNext={goNext} />
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ─── Post-intake view ─────────────────────────────────────────────────────────
function PostIntake({ onReset }) {
  const { profile } = useChat();
  return (
    <div className="w-full max-w-xl space-y-4">
      <ProfileBar onReset={onReset} />
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center space-y-2">
        <p className="text-2xl">🎉</p>
        <p className="text-sm font-semibold text-gray-800">
          All set, {profile.name}!
        </p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Your profile is saved and will persist on refresh.
          Tap any chip above to update your details.
        </p>
      </div>
    </div>
  );
}

// ─── Inner app (has access to context) ───────────────────────────────────────
function AppInner() {
  const { profile, update, resetProfile } = useChat();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      {/* Header */}
      <div className="w-full max-w-xl mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm select-none">
            W
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Wellness Concierge</p>
            <p className="text-xs text-green-500 font-medium">● Online</p>
          </div>
        </div>
      </div>

      {/* Body */}
      {profile.intakeComplete ? (
        <PostIntake onReset={resetProfile} />
      ) : (
        <IntakeFlow onComplete={() => update({ intakeComplete: true })} />
      )}
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ChatProvider>
      <AppInner />
    </ChatProvider>
  );
}
