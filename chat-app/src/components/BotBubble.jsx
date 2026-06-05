// Reusable chat bubble for AI messages
export default function BotBubble({ text }) {
    return (
        <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold">
                A
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 max-w-lg text-gray-800 shadow-sm text-sm leading-relaxed">
                {text}
            </div>
        </div>
    );
}
