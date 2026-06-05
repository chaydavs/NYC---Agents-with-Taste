import { useState } from 'react';
import { compare } from '../api/client';
import RecipeCard from './RecipeCard';
import PlaceCard from './PlaceCard';
import SourceBadge from './SourceBadge';

// Jury-bonus reveal. Two ways to see the same query:
//  - "Switch": flip one big panel between the grounded answer (color) and what
//    you'd get with outdated generic data (black & white). The contrast is the pitch.
//  - "Side by side": both at once.

function OutdatedView({ text }) {
  // Deliberately desaturated — "this is what outdated, ungrounded data looks like".
  return (
    <div className="grayscale">
      <div className="inline-flex items-center gap-2 mb-3 text-xs font-medium text-gray-600 bg-gray-200 border border-gray-300 rounded-full px-3 py-1">
        ⚠ Generic model · no live sources · may be outdated
      </div>
      <div className="bg-gray-100 border border-gray-300 rounded-2xl p-4 text-sm text-gray-600 leading-relaxed min-h-[80px]">
        {text || '…'}
      </div>
      <p className="text-xs text-gray-400 mt-2 italic">No citations. No brands. No way to verify any of this.</p>
    </div>
  );
}

function GroundedView({ grounded }) {
  const brands = [...new Set((grounded?.sources || []).map((s) => s.publisher).filter(Boolean))];
  return (
    <div>
      <div className="inline-flex items-center gap-2 mb-3 text-xs font-medium text-[#5E3A1E] bg-[#F3E9DC] border border-[#E8D8C4] rounded-full px-3 py-1">
        ● Grounded in People Inc. editorial · verified sources
      </div>
      <div className="bg-white border border-[#E8D8C4] rounded-2xl p-4 mb-3 text-sm text-gray-800 leading-relaxed min-h-[80px]">
        {grounded?.text || '…'}
      </div>
      <div className="space-y-3">
        {(grounded?.cards || []).map((card, i) =>
          card.type === 'place' ? <PlaceCard key={i} card={card} /> : <RecipeCard key={i} card={card} />
        )}
      </div>
      {brands.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {brands.map((b) => (
            <SourceBadge key={b} brand={b} small />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CompareModal({ profile, initialQuery, onClose }) {
  const [query, setQuery] = useState(
    initialQuery || 'What should I cook tonight? Got chicken thighs and feeling lazy.'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('switch'); // 'switch' | 'side'
  const [view, setView] = useState('grounded'); // for switch mode

  const run = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await compare({ message: query, user_profile: profile });
      setResult(data);
      setView('grounded');
    } catch (err) {
      setError(err?.message || 'compare failed');
    } finally {
      setLoading(false);
    }
  };

  const seg = (active) =>
    `px-3 py-1.5 text-xs font-medium rounded-full transition ${
      active ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
    }`;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header + mode selector */}
        <div className="px-5 py-4 bg-white border-b border-gray-200 flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-900">Premium grounding vs. outdated generic data</h2>
          <div className="ml-auto inline-flex bg-gray-100 rounded-full p-1">
            <button className={seg(mode === 'switch')} onClick={() => setMode('switch')}>
              Switch
            </button>
            <button className={seg(mode === 'side')} onClick={() => setMode('side')}>
              Side by side
            </button>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
            ✕
          </button>
        </div>

        {/* Query bar */}
        <div className="px-5 py-3 bg-white border-b border-gray-200 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A9784F]"
          />
          <button
            onClick={run}
            disabled={loading}
            className="bg-[#7B4B27] hover:bg-[#5E3A1E] disabled:bg-[#C9A883] text-white text-sm font-medium px-4 py-2 rounded-xl"
          >
            {loading ? 'Running…' : 'Run'}
          </button>
        </div>

        {error && <div className="px-5 py-3 text-sm text-red-600">{error}</div>}

        <div className="p-5 overflow-y-auto">
          {!result && !loading && (
            <p className="text-sm text-gray-500">
              Run the same question two ways and flip between them. The grounded answer cites real
              People Inc. brands; the generic one is what you'd get from a model working off stale,
              unsourced data.
            </p>
          )}

          {/* SWITCH MODE — one panel, toggle between the two experiences */}
          {result && mode === 'switch' && (
            <div>
              <div className="flex justify-center mb-5">
                <div className="inline-flex bg-gray-100 rounded-full p-1">
                  <button
                    className={`px-4 py-2 text-xs font-semibold rounded-full transition ${
                      view === 'grounded' ? 'bg-[#7B4B27] text-white shadow' : 'text-gray-500'
                    }`}
                    onClick={() => setView('grounded')}
                  >
                    ✦ Grounded · People Inc.
                  </button>
                  <button
                    className={`px-4 py-2 text-xs font-semibold rounded-full transition ${
                      view === 'outdated' ? 'bg-gray-800 text-white shadow' : 'text-gray-500'
                    }`}
                    onClick={() => setView('outdated')}
                  >
                    ⚠ Outdated generic
                  </button>
                </div>
              </div>
              <div className="max-w-xl mx-auto">
                {view === 'grounded' ? (
                  <GroundedView grounded={result.grounded} />
                ) : (
                  <OutdatedView text={result.vanilla?.text} />
                )}
              </div>
            </div>
          )}

          {/* SIDE BY SIDE MODE */}
          {result && mode === 'side' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <OutdatedView text={result.vanilla?.text} />
              <GroundedView grounded={result.grounded} />
            </div>
          )}

          {loading && <p className="text-sm text-gray-500">Running both…</p>}
        </div>
      </div>
    </div>
  );
}
