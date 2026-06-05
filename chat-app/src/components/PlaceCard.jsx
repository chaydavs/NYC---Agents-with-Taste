import SourceBadge from './SourceBadge';

export default function PlaceCard({ card, onTrySomethingElse }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    card.maps_query || card.name || ''
  )}`;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left">
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug">{card.name}</h3>
          <SourceBadge brand={card.brand} url={card.url} web={card.web} />
        </div>
        {card.dish && (
          <p className="text-sm text-gray-900 font-medium mb-1">Order: {card.dish}</p>
        )}
        <p className="text-sm text-gray-600 leading-relaxed mb-3">{card.why}</p>
        <div className="flex items-center gap-3">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-[#5E3A1E] hover:text-[#3F2713]"
          >
            Open in Maps →
          </a>
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
