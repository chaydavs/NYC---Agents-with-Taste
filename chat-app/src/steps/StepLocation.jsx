import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import BotBubble from '../components/BotBubble';
import UserBubble from '../components/UserBubble';

export default function StepLocation({ onNext }) {
    const { update } = useChat();
    const [homeCity, setHomeCity] = useState('');
    const [homeDone, setHomeDone] = useState(false);
    const [travelingTo, setTravelingTo] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleHomeSubmit = (e) => {
        e.preventDefault();
        if (!homeCity.trim()) return;
        setHomeDone(true);
    };

    const finalize = (travel) => {
        update({ homeCity: homeCity.trim(), travelingTo: travel.trim() });
        setSubmitted(true);
        setTimeout(onNext, 400);
    };

    const handleTravelSubmit = (e) => {
        e.preventDefault();
        finalize(travelingTo);
    };

    return (
        <div className="space-y-1">
            {/* Q1 – home city */}
            <BotBubble text="Almost done! Where are you based? I'll use this to tailor local restaurant and grocery picks." />
            {homeDone && <UserBubble text={homeCity} />}
            {!homeDone && (
                <form onSubmit={handleHomeSubmit} className="flex gap-2 mt-3">
                    <input
                        autoFocus
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                        placeholder="e.g. New York City"
                        value={homeCity}
                        onChange={(e) => setHomeCity(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-2 rounded-xl transition font-medium"
                    >
                        →
                    </button>
                </form>
            )}

            {/* Q2 – traveling? */}
            {homeDone && !submitted && (
                <>
                    <BotBubble text="Are you traveling anywhere soon? I can adapt recommendations to wherever you actually are." />
                    <form onSubmit={handleTravelSubmit} className="flex gap-2 mt-3">
                        <input
                            autoFocus
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                            placeholder="Traveling to… (optional)"
                            value={travelingTo}
                            onChange={(e) => setTravelingTo(e.target.value)}
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
                        Not traveling right now
                    </button>
                </>
            )}
            {submitted && travelingTo && <UserBubble text={`Traveling to ${travelingTo}`} />}
        </div>
    );
}
