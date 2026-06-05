// Step indicator shown at the top of the chat
export default function StepIndicator({ current, total }) {
    return (
        <div className="flex items-center gap-2 mb-6">
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < current ? 'bg-[#7B4B27]' : i === current ? 'bg-[#A9784F]' : 'bg-gray-200'
                        }`}
                />
            ))}
            <span className="text-xs text-gray-400 ml-1 whitespace-nowrap">
                {current + 1} / {total}
            </span>
        </div>
    );
}
