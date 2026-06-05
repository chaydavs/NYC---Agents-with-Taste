import SourceBadge from './SourceBadge';

// Trust indicator: makes grounding visible, and honest about tier —
// editorial (People Inc. brands) vs. web fallback.
export default function GroundingBar({ sources }) {
  const list = sources || [];
  const count = list.length;
  if (count === 0) {
    return (
      <div className="text-xs text-gray-400 px-1 py-2">
        Answers are grounded in People Inc. editorial — sources appear here.
      </div>
    );
  }

  const editorial = [...new Set(list.filter((s) => !s.web).map((s) => s.publisher).filter(Boolean))];
  const web = [...new Set(list.filter((s) => s.web).map((s) => s.publisher).filter(Boolean))];

  const headline =
    editorial.length > 0 && web.length === 0
      ? `Grounded in ${count} editorial source${count > 1 ? 's' : ''} across ${editorial.length} People Inc. brand${editorial.length > 1 ? 's' : ''}`
      : web.length > 0 && editorial.length === 0
        ? `No editorial coverage — fell back to ${web.length} web source${web.length > 1 ? 's' : ''}`
        : `Grounded in ${editorial.length} editorial brand${editorial.length > 1 ? 's' : ''} + ${web.length} web source${web.length > 1 ? 's' : ''}`;

  return (
    <div className="px-1 py-2">
      <p className="text-xs font-semibold text-gray-700 mb-2">{headline}</p>
      <div className="flex flex-wrap gap-1.5">
        {editorial.map((b) => (
          <SourceBadge key={`e-${b}`} brand={b} small />
        ))}
        {web.map((b) => (
          <SourceBadge key={`w-${b}`} brand={b} small web />
        ))}
      </div>
    </div>
  );
}
