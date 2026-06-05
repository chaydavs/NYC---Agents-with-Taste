import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import BotBubble from '../components/BotBubble';
import UserBubble from '../components/UserBubble';

export default function StepLocation({ onNext }) {
    const { userData, update } = useChat();
    const [phase, setPhase] = useState(0); // 0=travelling?, 1=location input
    const [travelling, setTravelling] = useState(null);
    const [location, setLocation] = useState('');
    const [submitted, setSubmitted] = useState({ travelling: false, location: false });

    const handleTravelling = (val) => {
        setTravelling(val);
        setSubmitted((s) => ({ ...s, travelling: true }));
        if (val === false) {
            update({ travelling: false, location: 'Home / local' });
            setTimeout(() => onNext(), 600);
        } else {
            setPhase(1);
        }
    };

    const handleLocationSubmit = (e) => {
        e.preventDefault();
        if (!location.trim()) return;
        setSubmitted((s) => ({ ...s, location: true }));
        update({ travelling: true, location: location.trim() });
        setTimeout(() => onNext(), 600);
    };

    return (
        <div className="space-y-1">
            <BotBubble text="Are you currently travelling or away from home?" />
            {submitted.travelling && <UserBubble text={travelling ? "Yes, I'm travelling" : "No, I'm at home"} />}

            {phase === 1 && (
                <>
                    <BotBubble text="Where are you headed? I'll factor that into your recommendations." />
                    {submitted.location && <UserBubble text={location} />}
                </>
            )}

            {phase === 0 && !submitted.travelling && (
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={() => handleTravelling(true)}
                        className="flex-1 border border-violet-400 text-violet-700 hover:bg-violet-50 text-sm px-4 py-3 rounded-xl transition font-medium"
                    >
                        ✈️ Yes, travelling
                    </button>
                    <button
                        onClick={() => handleTravelling(false)}
                        className="flex-1 border border-violet-400 text-violet-700 hover:bg-violet-50 text-sm px-4 py-3 rounded-xl transition font-medium"
                    >
                        🏠 No, at home
                    </button>
                </div>
            )}

            {phase === 1 && !submitted.location && (
                <form onSubmit={handleLocationSubmit} className="flex gap-2 mt-4">
                    <input
                        autoFocus
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                        placeholder="City, country, or region…"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-5 py-2 rounded-xl transition"
                    >
                        Send
                    </button>
                </form>
            )}
        </div>
    );
}
