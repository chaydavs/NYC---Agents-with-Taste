// Reusable chat bubble for user replies
export default function UserBubble({ text }) {
    return (
        <div className="flex justify-end mb-4">
            <div className="bg-violet-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-lg text-sm leading-relaxed shadow-sm">
                {text}
            </div>
        </div>
    );
}
