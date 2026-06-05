import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import BotBubble from '../components/BotBubble';
import UserBubble from '../components/UserBubble';

export default function StepName({ onNext }) {
    const { update } = useChat();
    const [name, setName] = useState('');
    const [done, setDone] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        update({ name: name.trim() });
        setDone(true);
        setTimeout(onNext, 400);
    };

    return (
        <div className="space-y-1">
            <BotBubble text="Hi there! 👋 I'm your personal wellness concierge. I'll take a few quick notes so everything I suggest is built around you. What's your name?" />
            {done && <UserBubble text={name} />}
            {!done && (
                <form onSubmit={submit} className="flex gap-2 mt-4">
                    <input
                        autoFocus
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white shadow-sm"
                        placeholder="Your name…"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-5 py-2.5 rounded-xl transition font-medium shadow-sm"
                    >
                        →
                    </button>
                </form>
            )}
        </div>
    );
}
