import { useChat } from '../context/ChatContext';
import BotBubble from '../components/BotBubble';

export default function StepSummary() {
    const { userData } = useChat();

    const rows = [
        { label: 'Name', value: userData.name },
        { label: 'Age', value: `${userData.age} years` },
        { label: 'Gender', value: userData.gender },
        { label: 'Fitness goal', value: userData.fitnessGoal },
        { label: 'Activity level', value: userData.activityLevel },
        { label: 'Diet type', value: userData.dietType },
        { label: 'Travelling', value: userData.travelling ? `Yes — ${userData.location}` : 'No (home)' },
        {
            label: 'Dietary restrictions',
            value: [
                ...(userData.restrictions || []),
                ...(userData.otherRestrictions ? [`Other: ${userData.otherRestrictions}`] : []),
            ].join(', ') || 'None',
        },
    ];

    return (
        <div className="space-y-4">
            <BotBubble
                text={`That's everything I need, ${userData.name}! 🎉 Here's a summary of your profile. Your personalised plan is ready.`}
            />

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-violet-50 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-violet-700 uppercase tracking-wide">Your Profile</h2>
                </div>
                <dl className="divide-y divide-gray-100">
                    {rows.map(({ label, value }) => (
                        <div key={label} className="flex items-start px-5 py-3 gap-4">
                            <dt className="w-40 flex-shrink-0 text-xs font-medium text-gray-400 uppercase tracking-wide pt-0.5">
                                {label}
                            </dt>
                            <dd className="text-sm text-gray-800">{value}</dd>
                        </div>
                    ))}
                </dl>
            </div>

            <button className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-5 py-3 rounded-xl transition">
                Generate my plan 🚀
            </button>
        </div>
    );
}
