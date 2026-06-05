import { useState } from 'react';
import { useChat } from '../context/ChatContext';

// ─── Constants (shared with edit panels) ──────────────────────────────────────
const GOAL_OPTIONS = ['Lose fat', 'Build muscle', 'Maintain weight', 'General health'];
const TRAINING_OPTIONS = ['Lifting', 'Running', 'Cycling', 'Yoga', 'HIIT', 'Swimming', 'Walking', 'Pilates'];
const DAYS_OPTIONS = ['1–2', '3', '4', '5', '6+', 'Varies'];
const DIET_OPTIONS = ['None', 'Vegetarian', 'Vegan', 'Pescatarian', 'Halal', 'Kosher', 'Keto', 'Paleo', 'Mediterranean'];
const RESTRICTION_OPTIONS = ['Nuts', 'Shellfish', 'Fish', 'Eggs', 'Soy', 'Gluten', 'Lactose', 'Dairy'];

// ─── Small reusable chip for profile bar ──────────────────────────────────────
function ProfileChip({ label, icon, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${active
                    ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-violet-400 hover:text-violet-700 shadow-sm'
                }`}
        >
            {icon && <span>{icon}</span>}
            {label}
        </button>
    );
}

// ─── Selector chip inside edit panels ─────────────────────────────────────────
function SelectChip({ label, selected, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${selected
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'border-gray-300 text-gray-600 hover:border-violet-400 hover:text-violet-700 bg-white'
                }`}
        >
            {label}
        </button>
    );
}

// ─── Goals & Training edit panel ──────────────────────────────────────────────
function GoalsEditPanel({ onClose }) {
    const { profile, update } = useChat();
    const [goal, setGoal] = useState(profile.fitnessGoal || '');
    const [training, setTraining] = useState(profile.trainingTypes || []);
    const [days, setDays] = useState(profile.daysPerWeek || '');
    const [targetNote, setTargetNote] = useState(profile.targetNote || '');

    const toggleTraining = (t) =>
        setTraining((prev) =>
            prev.includes(t) ? prev.filter((x) => x !== t) : [...prev.filter((x) => x !== 'None'), t]
        );

    const save = () => {
        update({ fitnessGoal: goal, trainingTypes: training, daysPerWeek: days, targetNote });
        onClose();
    };

    return (
        <div className="mt-2 bg-white border border-violet-100 rounded-2xl p-4 shadow-md space-y-4">
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Fitness goal</p>
                <div className="flex flex-wrap gap-2">
                    {GOAL_OPTIONS.map((g) => (
                        <SelectChip key={g} label={g} selected={goal === g} onClick={() => setGoal(g)} />
                    ))}
                </div>
            </div>

            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Training type</p>
                <div className="flex flex-wrap gap-2">
                    {TRAINING_OPTIONS.map((t) => (
                        <SelectChip key={t} label={t} selected={training.includes(t)} onClick={() => toggleTraining(t)} />
                    ))}
                </div>
            </div>

            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Days / week</p>
                <div className="flex flex-wrap gap-2">
                    {DAYS_OPTIONS.map((d) => (
                        <SelectChip key={d} label={`${d} days`} selected={days === d} onClick={() => setDays(d)} />
                    ))}
                </div>
            </div>

            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Calorie / macro target</p>
                <input
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    placeholder="e.g. 2 000 cal / 150 g protein"
                    value={targetNote}
                    onChange={(e) => setTargetNote(e.target.value)}
                />
            </div>

            <div className="flex gap-2 pt-1">
                <button onClick={save} className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-2 rounded-xl transition font-medium">
                    Save
                </button>
                <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 transition">
                    Cancel
                </button>
            </div>
        </div>
    );
}

// ─── Dietary edit panel ────────────────────────────────────────────────────────
function DietaryEditPanel({ onClose }) {
    const { profile, update } = useChat();
    const [dietStyle, setDietStyle] = useState(profile.dietStyle || 'None');
    const [restrictions, setRestrictions] = useState(profile.restrictions || []);
    const [dislikes, setDislikes] = useState(profile.dislikes || '');

    const toggleRestriction = (r) =>
        setRestrictions((prev) =>
            prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
        );

    const save = () => {
        update({ dietStyle, restrictions, dislikes });
        onClose();
    };

    return (
        <div className="mt-2 bg-white border border-violet-100 rounded-2xl p-4 shadow-md space-y-4">
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Diet style</p>
                <div className="flex flex-wrap gap-2">
                    {DIET_OPTIONS.map((d) => (
                        <SelectChip key={d} label={d} selected={dietStyle === d} onClick={() => setDietStyle(d)} />
                    ))}
                </div>
            </div>

            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Allergies & intolerances</p>
                <div className="flex flex-wrap gap-2">
                    <SelectChip label="None" selected={restrictions.length === 0} onClick={() => setRestrictions([])} />
                    {RESTRICTION_OPTIONS.map((r) => (
                        <SelectChip key={r} label={r} selected={restrictions.includes(r)} onClick={() => toggleRestriction(r)} />
                    ))}
                </div>
            </div>

            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Dislikes</p>
                <input
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    placeholder="e.g. cilantro, liver, blue cheese"
                    value={dislikes}
                    onChange={(e) => setDislikes(e.target.value)}
                />
            </div>

            <div className="flex gap-2 pt-1">
                <button onClick={save} className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-2 rounded-xl transition font-medium">
                    Save
                </button>
                <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 transition">
                    Cancel
                </button>
            </div>
        </div>
    );
}

// ─── Location edit panel ──────────────────────────────────────────────────────
function LocationEditPanel({ onClose }) {
    const { profile, update } = useChat();
    const [homeCity, setHomeCity] = useState(profile.homeCity || '');
    const [travelingTo, setTravelingTo] = useState(profile.travelingTo || '');

    const save = () => {
        update({ homeCity, travelingTo });
        onClose();
    };

    return (
        <div className="mt-2 bg-white border border-violet-100 rounded-2xl p-4 shadow-md space-y-4">
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Home city</p>
                <input
                    autoFocus
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    placeholder="e.g. New York City"
                    value={homeCity}
                    onChange={(e) => setHomeCity(e.target.value)}
                />
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Traveling to</p>
                <input
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                    placeholder="e.g. New Orleans (leave blank if not traveling)"
                    value={travelingTo}
                    onChange={(e) => setTravelingTo(e.target.value)}
                />
            </div>
            <div className="flex gap-2 pt-1">
                <button onClick={save} className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-2 rounded-xl transition font-medium">
                    Save
                </button>
                <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 transition">
                    Cancel
                </button>
            </div>
        </div>
    );
}

// ─── Main ProfileBar ───────────────────────────────────────────────────────────
export default function ProfileBar({ onReset }) {
    const { profile } = useChat();
    const [activeEdit, setActiveEdit] = useState(null); // 'goals' | 'dietary' | 'location'

    const toggle = (section) =>
        setActiveEdit((prev) => (prev === section ? null : section));

    // Derive chip labels
    const goalLabel = profile.fitnessGoal || 'Set goal';

    const trainingLabel = (() => {
        const types = (profile.trainingTypes || []).filter((t) => t !== 'None');
        if (!types.length) return null;
        const display = types.slice(0, 2).join(' & ');
        return profile.daysPerWeek ? `${display} · ${profile.daysPerWeek}×` : display;
    })();

    const dietLabel =
        profile.dietStyle && profile.dietStyle !== 'None' ? profile.dietStyle : null;

    const restrictionsLabel = (() => {
        const r = (profile.restrictions || []).filter(Boolean);
        if (!r.length) return null;
        return `No ${r.slice(0, 3).join(', ')}`;
    })();

    const locationLabel = (() => {
        if (!profile.homeCity) return 'Set location';
        return profile.travelingTo
            ? `${profile.homeCity} · → ${profile.travelingTo}`
            : profile.homeCity;
    })();

    return (
        <div className="w-full max-w-xl">
            {/* Chip bar */}
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Goals section */}
                    <ProfileChip
                        label={goalLabel}
                        icon="🎯"
                        active={activeEdit === 'goals'}
                        onClick={() => toggle('goals')}
                    />
                    {trainingLabel && (
                        <ProfileChip
                            label={trainingLabel}
                            icon="🏋️"
                            active={activeEdit === 'goals'}
                            onClick={() => toggle('goals')}
                        />
                    )}

                    <span className="text-gray-200 select-none px-0.5">·</span>

                    {/* Dietary section */}
                    {dietLabel ? (
                        <ProfileChip
                            label={dietLabel}
                            icon="🥗"
                            active={activeEdit === 'dietary'}
                            onClick={() => toggle('dietary')}
                        />
                    ) : (
                        <ProfileChip
                            label="Set diet"
                            icon="🥗"
                            active={activeEdit === 'dietary'}
                            onClick={() => toggle('dietary')}
                        />
                    )}
                    {restrictionsLabel && (
                        <ProfileChip
                            label={restrictionsLabel}
                            active={activeEdit === 'dietary'}
                            onClick={() => toggle('dietary')}
                        />
                    )}

                    <span className="text-gray-200 select-none px-0.5">·</span>

                    {/* Location section */}
                    <ProfileChip
                        label={locationLabel}
                        icon="📍"
                        active={activeEdit === 'location'}
                        onClick={() => toggle('location')}
                    />

                    {/* Edit profile / redo */}
                    <button
                        onClick={onReset}
                        className="ml-auto text-xs text-gray-400 hover:text-violet-600 transition whitespace-nowrap flex items-center gap-1"
                    >
                        ✏️ Edit profile
                    </button>
                </div>
            </div>

            {/* Inline edit panels */}
            {activeEdit === 'goals' && (
                <GoalsEditPanel onClose={() => setActiveEdit(null)} />
            )}
            {activeEdit === 'dietary' && (
                <DietaryEditPanel onClose={() => setActiveEdit(null)} />
            )}
            {activeEdit === 'location' && (
                <LocationEditPanel onClose={() => setActiveEdit(null)} />
            )}
        </div>
    );
}
