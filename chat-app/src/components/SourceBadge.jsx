// Provenance badge — the heart of the demo. Every card and source renders one,
// clickable, so any claim traces to a People Inc. brand (Hard Rule #1).
export default function SourceBadge({ brand, url, small }) {
  const label = brand || 'Source';
  const cls = small
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2 py-1';
  const inner = (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-violet-50 text-violet-700 font-medium ${cls} border border-violet-100`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
      {label}
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
