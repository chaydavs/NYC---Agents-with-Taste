import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import BotBubble from '../components/BotBubble';
import UserBubble from '../components/UserBubble';

const COMMON_RESTRICTIONS = [
    'None',
    'Vegetarian',
    'Vegan',
    'Gluten-free',
    'Dairy-free',
    'Nut allergy',
    'Shellfish allergy',
    'Halal',
    'Kosher',
    'Low-sodium',
    'Diabetic-friendly',
];

export default function StepDietaryRestrictions({ onNext }) {
    const { update } = useChat();
    const [selected, setSelected] = useState([]);
    const [other, setOther] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    const [showOther, setShowOther] = useState(false);

    const toggle = (item) => {
        if (item === 'None') {
            setSelected(['None']);
            return;
        }
        setSelected((prev) => {
            const without = prev.filter((x) => x !== 'None');
            return without.includes(item) ? without.filter((x) => x !== item) : [...without, item];
        });
    };

    const handleConfirm = () => {
        const restrictions = selected.length === 0 ? ['None'] : selected;
        update({ restrictions, otherRestrictions: other.trim() });
        setConfirmed(true);
        setTimeout(() => onNext(), 600);
    };

    const summaryText =
        selected.length === 0
            ? 'No restrictions selected'
            : [
                ...selected,
                ...(other.trim() ? [`Other: ${other.trim()}`] : []),
            ].join(', ');

    return (
        <div className="space-y-1">
            <BotBubble text="Almost done! Do you have any dietary restrictions or allergies I should know about? Select all that apply." />

            {confirmed && <UserBubble text={summaryText} />}

            {!confirmed && (
                <>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {COMMON_RESTRICTIONS.map((r) => (
                            <button
                                key={r}
                                onClick={() => toggle(r)}
                                className={`text-sm px-4 py-2 rounded-xl border transition ${selected.includes(r)
                                        ? 'bg-violet-600 text-white border-violet-600'
                                        : 'border-violet-400 text-violet-700 hover:bg-violet-50'
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowOther((v) => !v)}
                            className={`text-sm px-4 py-2 rounded-xl border transition ${showOther
                                    ? 'bg-violet-100 text-violet-700 border-violet-400'
                                    : 'border-violet-400 text-violet-700 hover:bg-violet-50'
                                }`}
                        >
                            Other…
                        </button>
                    </div>

                    {showOther && (
                        <input
                            className="mt-3 w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                            placeholder="Describe any other restrictions…"
                            value={other}
                            onChange={(e) => setOther(e.target.value)}
                        />
                    )}

                    <button
                        onClick={handleConfirm}
                        className="mt-4 w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-5 py-3 rounded-xl transition"
                    >
                        Confirm &amp; Continue →
                    </button>
                </>
            )}
        </div>
    );
}
