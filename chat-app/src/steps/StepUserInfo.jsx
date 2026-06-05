import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import BotBubble from '../components/BotBubble';
import UserBubble from '../components/UserBubble';

export default function StepUserInfo({ onNext }) {
    const { update } = useChat();
    const [phase, setPhase] = useState(0); // 0=name, 1=age, 2=gender
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [submitted, setSubmitted] = useState({ name: false, age: false, gender: false });

    const handleNameSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSubmitted((s) => ({ ...s, name: true }));
        setPhase(1);
    };

    const handleAgeSubmit = (e) => {
        e.preventDefault();
        if (!age.trim() || isNaN(age) || Number(age) < 1) return;
        setSubmitted((s) => ({ ...s, age: true }));
        setPhase(2);
    };

    const handleGenderSelect = (val) => {
        setGender(val);
        setSubmitted((s) => ({ ...s, gender: true }));
        update({ name: name.trim(), age: age.trim(), gender: val });
        setTimeout(() => onNext(), 600);
    };

    return (
        <div className="space-y-1">
            {/* Name */}
            <BotBubble text="Hi there! 👋 I'm your personal wellness assistant. Let's get started. What's your name?" />
            {submitted.name && <UserBubble text={name} />}

            {phase >= 1 && (
                <>
                    <BotBubble text={`Great to meet you, ${name}! How old are you?`} />
                    {submitted.age && <UserBubble text={`${age} years old`} />}
                </>
            )}

            {phase >= 2 && (
                <>
                    <BotBubble text="Perfect! What's your gender? (This helps personalise your plan.)" />
                    {submitted.gender && <UserBubble text={gender} />}
                </>
            )}

            {/* Input area */}
            {phase === 0 && !submitted.name && (
                <form onSubmit={handleNameSubmit} className="flex gap-2 mt-4">
                    <input
                        autoFocus
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                        placeholder="Your name…"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-5 py-2 rounded-xl transition"
                    >
                        Send
                    </button>
                </form>
            )}

            {phase === 1 && !submitted.age && (
                <form onSubmit={handleAgeSubmit} className="flex gap-2 mt-4">
                    <input
                        autoFocus
                        type="number"
                        min="1"
                        max="120"
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                        placeholder="Your age…"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-5 py-2 rounded-xl transition"
                    >
                        Send
                    </button>
                </form>
            )}

            {phase === 2 && !submitted.gender && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((g) => (
                        <button
                            key={g}
                            onClick={() => handleGenderSelect(g)}
                            className="border border-violet-400 text-violet-700 hover:bg-violet-50 text-sm px-4 py-2 rounded-xl transition"
                        >
                            {g}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
