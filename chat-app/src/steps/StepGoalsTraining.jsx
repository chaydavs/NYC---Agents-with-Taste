import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import BotBubble from '../components/BotBubble';
import UserBubble from '../components/UserBubble';

const GOAL_OPTIONS = ['Lose fat', 'Build muscle', 'Maintain weight', 'General health'];
const TRAINING_OPTIONS = ['Lifting', 'Running', 'Cycling', 'Yoga', 'HIIT', 'Swimming', 'Walking', 'Pilates'];
const DAYS_OPTIONS = ['1–2', '3', '4', '5', '6+', 'Varies'];

function Chip({ label, selected, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`text-sm px-4 py-2 rounded-full border transition-all ${selected
                    ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                    : 'border-gray-300 text-gray-700 hover:border-violet-400 hover:text-violet-700 bg-white'
                }`}
        >
            {label}
        </button>
    );
}

export default function StepGoalsTraining({ onNext }) {
    const { profile, update } = useChat();
    const [goal, setGoal] = useState('');
    const [training, setTraining] = useState([]);
    const [trainingDone, setTrainingDone] = useState(false);
    const [days, setDays] = useState('');
    const [targetNote, setTargetNote] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const goalDone = !!goal;
    const daysDone = !!days;
    const trainingLabel = training.length
        ? training.join(', ')
        : 'No specific training';

    const toggleTraining = (t) =>
        setTraining((prev) =>
            prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
        );

    const confirmTraining = () => setTrainingDone(true);

    const finalize = (note) => {
        update({
            fitnessGoal: goal,
            trainingTypes: training.length ? training : ['None'],
            daysPerWeek: days,
            targetNote: note,
        });
        setSubmitted(true);
        setTimeout(onNext, 400);
    };

    const handleTargetSubmit = (e) => {
        e.preventDefault();
        finalize(targetNote.trim());
    };

    return (
        <div className="space-y-1">
            {/* Q1 – fitness goal */}
            <BotBubble text={`Nice to meet you, ${profile.name}! 💪 What's your main fitness goal right now?`} />
            {goalDone && <UserBubble text={goal} />}
            {!goalDone && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {GOAL_OPTIONS.map((g) => (
                        <Chip key={g} label={g} selected={goal === g} onClick={() => setGoal(g)} />
                    ))}
                </div>
            )}

            {/* Q2 – training type */}
            {goalDone && (
                <>
                    <BotBubble text="What does your training look like? Pick everything that applies." />
                    {trainingDone && <UserBubble text={trainingLabel} />}
                    {!trainingDone && (
                        <>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {TRAINING_OPTIONS.map((t) => (
                                    <Chip key={t} label={t} selected={training.includes(t)} onClick={() => toggleTraining(t)} />
                                ))}
                                <Chip
                                    label="None / just starting"
                                    selected={training.length === 0}
                                    onClick={() => setTraining([])}
                                />
                            </div>
                            <button
                                onClick={confirmTraining}
                                className="mt-3 bg-violet-600 hover:bg-violet-700 text-white text-sm px-5 py-2 rounded-xl transition font-medium"
                            >
                                Confirm →
                            </button>
                        </>
                    )}
                </>
            )}

            {/* Q3 – days per week */}
            {trainingDone && (
                <>
                    <BotBubble text="How many days a week do you train?" />
                    {daysDone && <UserBubble text={`${days} days/week`} />}
                    {!daysDone && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {DAYS_OPTIONS.map((d) => (
                                <Chip key={d} label={`${d} days`} selected={days === d} onClick={() => setDays(d)} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Q4 – calorie / macro target */}
            {daysDone && !submitted && (
                <>
                    <BotBubble text="Any calorie or macro target you're tracking? Totally optional — skip if you're not counting." />
                    <form onSubmit={handleTargetSubmit} className="flex gap-2 mt-3">
                        <input
                            autoFocus
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                            placeholder="e.g. 2 000 cal / 150 g protein"
                            value={targetNote}
                            onChange={(e) => setTargetNote(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-2 rounded-xl transition font-medium"
                        >
                            →
                        </button>
                    </form>
                    <button
                        type="button"
                        onClick={() => finalize('')}
                        className="mt-1.5 text-xs text-gray-400 hover:text-gray-600 transition"
                    >
                        Skip for now
                    </button>
                </>
            )}
            {submitted && targetNote && <UserBubble text={targetNote} />}
        </div>
    );
}
