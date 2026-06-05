import SourceBadge from './SourceBadge';

// Trust indicator (principle 9): makes grounding visible — "N sources across M brands".
export default function GroundingBar({ sources }) {
  const count = sources?.length || 0;
  const brands = [...new Set((sources || []).map((s) => s.publisher).filter(Boolean))];

  if (count === 0) {
    return (
      <div className="text-xs text-gray-400 px-1 py-2">
        Answers are grounded in People Inc. editorial — sources appear here.
      </div>
    );
  }

  return (
    <div className="px-1 py-2">
      <p className="text-xs font-semibold text-gray-700 mb-2">
        Grounded in {count} source{count > 1 ? 's' : ''} across {brands.length} brand
        {brands.length > 1 ? 's' : ''}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {brands.map((b) => (
          <SourceBadge key={b} brand={b} small />
        ))}
      </div>
    </div>
  );
}
