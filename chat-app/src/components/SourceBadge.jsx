// Provenance badge — the heart of the demo. Every card and source renders one,
// clickable. Editorial (People Inc. brand) = brown; web fallback = gray + globe,
// so the grounding story stays visually honest about where each claim came from.
export default function SourceBadge({ brand, url, small, web }) {
  const label = brand || 'Source';
  const cls = small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';
  const palette = web
    ? 'bg-gray-100 text-gray-600 border-gray-200'
    : 'bg-[#F3E9DC] text-[#5E3A1E] border-[#EAD9C5]';
  const inner = (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${cls} border ${palette}`}
    >
      {web ? (
        <span className="text-[9px]">🌐</span>
      ) : (
        <span className="w-1.5 h-1.5 rounded-full bg-[#9A6B43]" />
      )}
      {web ? `${label} · web` : label}
    </span>
  );
  return url ? (
    <a href={url} target="_blank" rel="noreferrer" className="hover:opacity-80 transition">
      {inner}
    </a>
  ) : (
    inner
  );
}
