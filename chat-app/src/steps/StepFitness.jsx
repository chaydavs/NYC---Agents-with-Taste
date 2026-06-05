import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import BotBubble from '../components/BotBubble';
import UserBubble from '../components/UserBubble';

const FITNESS_GOALS = [
    'Lose weight',
    'Build muscle',
    'Improve endurance',
    'Stay active & healthy',
    'Rehabilitation / recovery',
];

const ACTIVITY_LEVELS = [
    { label: 'Sedentary', desc: 'Little or no exercise' },
    { label: 'Lightly active', desc: '1–3 days/week' },
    { label: 'Moderately active', desc: '3–5 days/week' },
    { label: 'Very active', desc: '6–7 days/week' },
    { label: 'Athlete', desc: 'Intense training daily' },
];

const DIET_TYPES = [
    'No preference',
    'Balanced',
    'High-protein',
    'Low-carb / Keto',
    'Plant-based',
    'Mediterranean',
    'Intermittent fasting',
];

export default function StepFitness({ onNext }) {
    const { userData, update } = useChat();
    const [phase, setPhase] = useState(0); // 0=goal, 1=activity, 2=diet
    const [submitted, setSubmitted] = useState({ goal: false, activity: false, diet: false });
    const [goal, setGoal] = useState('');
    const [activity, setActivity] = useState('');
    const [diet, setDiet] = useState('');

    const handleGoal = (val) => {
        setGoal(val);
        setSubmitted((s) => ({ ...s, goal: true }));
        setPhase(1);
    };

    const handleActivity = (val) => {
        setActivity(val);
        setSubmitted((s) => ({ ...s, activity: true }));
        setPhase(2);
    };

    const handleDiet = (val) => {
        setDiet(val);
        setSubmitted((s) => ({ ...s, diet: true }));
        update({ fitnessGoal: goal, activityLevel: activity, dietType: val });
        setTimeout(() => onNext(), 600);
    };

    return (
        <div className="space-y-1">
            <BotBubble text={`Awesome, ${userData.name}! Now let's talk fitness. What's your primary goal?`} />
            {submitted.goal && <UserBubble text={goal} />}

            {phase >= 1 && (
                <>
                    <BotBubble text="Got it! How would you describe your current activity level?" />
                    {submitted.activity && <UserBubble text={activity} />}
                </>
            )}

            {phase >= 2 && (
                <>
                    <BotBubble text="What type of diet are you following or interested in?" />
                    {submitted.diet && <UserBubble text={diet} />}
                </>
            )}

            {/* Chips */}
            {phase === 0 && !submitted.goal && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {FITNESS_GOALS.map((g) => (
                        <button
                            key={g}
                            onClick={() => handleGoal(g)}
                            className="border border-violet-400 text-violet-700 hover:bg-violet-50 text-sm px-4 py-2 rounded-xl transition"
                        >
                            {g}
                        </button>
                    ))}
                </div>
            )}

            {phase === 1 && !submitted.activity && (
                <div className="flex flex-col gap-2 mt-4">
                    {ACTIVITY_LEVELS.map(({ label, desc }) => (
                        <button
                            key={label}
                            onClick={() => handleActivity(label)}
                            className="flex items-center justify-between border border-violet-400 text-violet-700 hover:bg-violet-50 text-sm px-4 py-2 rounded-xl transition text-left"
                        >
                            <span className="font-medium">{label}</span>
                            <span className="text-gray-400 text-xs">{desc}</span>
                        </button>
                    ))}
                </div>
            )}

            {phase === 2 && !submitted.diet && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {DIET_TYPES.map((d) => (
                        <button
                            key={d}
                            onClick={() => handleDiet(d)}
                            className="border border-violet-400 text-violet-700 hover:bg-violet-50 text-sm px-4 py-2 rounded-xl transition"
                        >
                            {d}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
