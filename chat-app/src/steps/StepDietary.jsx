import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import BotBubble from '../components/BotBubble';
import UserBubble from '../components/UserBubble';

const DIET_OPTIONS = [
    'None', 'Vegetarian', 'Vegan', 'Pescatarian',
    'Halal', 'Kosher', 'Keto', 'Paleo', 'Mediterranean',
];
const RESTRICTION_OPTIONS = [
    'Nuts', 'Shellfish', 'Fish', 'Eggs', 'Soy', 'Gluten', 'Lactose', 'Dairy',
];

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

export default function StepDietary({ onNext }) {
    const { update } = useChat();
    const [diet, setDiet] = useState('');
    const [restrictions, setRestrictions] = useState([]);
    const [restrictionsDone, setRestrictionsDone] = useState(false);
    const [dislikes, setDislikes] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const dietDone = !!diet;
    const restrictionLabel = restrictions.length
        ? `No ${restrictions.join(', ')}`
        : 'No restrictions';

    const toggleRestriction = (r) =>
        setRestrictions((prev) =>
            prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
        );

    const confirmRestrictions = () => setRestrictionsDone(true);

    const finalize = (note) => {
        update({ dietStyle: diet, restrictions, dislikes: note });
        setSubmitted(true);
        setTimeout(onNext, 400);
    };

    const handleDislikesSubmit = (e) => {
        e.preventDefault();
        finalize(dislikes.trim());
    };

    return (
        <div className="space-y-1">
            {/* Q1 – diet style */}
            <BotBubble text="Now let's talk food. 🍽️ Do you follow any particular diet or eating style?" />
            {dietDone && <UserBubble text={diet} />}
            {!dietDone && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {DIET_OPTIONS.map((d) => (
                        <Chip key={d} label={d} selected={diet === d} onClick={() => setDiet(d)} />
                    ))}
                </div>
            )}

            {/* Q2 – allergies & intolerances */}
            {dietDone && (
                <>
                    <BotBubble text="Any allergies or intolerances I should know about? Select all that apply." />
                    {restrictionsDone && <UserBubble text={restrictionLabel} />}
                    {!restrictionsDone && (
                        <>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <Chip
                                    label="None"
                                    selected={restrictions.length === 0}
                                    onClick={() => setRestrictions([])}
                                />
                                {RESTRICTION_OPTIONS.map((r) => (
                                    <Chip
                                        key={r}
                                        label={r}
                                        selected={restrictions.includes(r)}
                                        onClick={() => toggleRestriction(r)}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={confirmRestrictions}
                                className="mt-3 bg-violet-600 hover:bg-violet-700 text-white text-sm px-5 py-2 rounded-xl transition font-medium"
                            >
                                Confirm →
                            </button>
                        </>
                    )}
                </>
            )}

            {/* Q3 – dislikes */}
            {restrictionsDone && !submitted && (
                <>
                    <BotBubble text="Anything you just strongly dislike or want to avoid? Optional — be as specific as you like." />
                    <form onSubmit={handleDislikesSubmit} className="flex gap-2 mt-3">
                        <input
                            autoFocus
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                            placeholder="e.g. cilantro, liver, anything too spicy…"
                            value={dislikes}
                            onChange={(e) => setDislikes(e.target.value)}
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
            {submitted && dislikes && <UserBubble text={dislikes} />}
        </div>
    );
}
