import SourceBadge from './SourceBadge';

export default function RecipeCard({ card, onTrySomethingElse }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left">
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug">{card.title}</h3>
          <SourceBadge brand={card.brand} url={card.url} />
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">{card.why}</p>
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          {card.time && (
            <span className="inline-flex items-center gap-1">⏱ {card.time}</span>
          )}
          {card.key_ingredient && (
            <span className="inline-flex items-center gap-1">🍳 {card.key_ingredient}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {card.url && (
            <a
              href={card.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-violet-700 hover:text-violet-900"
            >
              Get the full recipe →
            </a>
          )}
          {onTrySomethingElse && (
            <button
              onClick={onTrySomethingElse}
              className="text-xs font-medium text-gray-400 hover:text-gray-600 ml-auto"
            >
              Try something else
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
