import { useState, useRef, useEffect } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import { PERSONAS } from './personas';
import BotBubble from './components/BotBubble';
import UserBubble from './components/UserBubble';
import ChatInput from './components/ChatInput';
import RecipeCard from './components/RecipeCard';
import PlaceCard from './components/PlaceCard';
import GroundingBar from './components/GroundingBar';
import CompareModal from './components/CompareModal';

function latestCardsMessage(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].cards && messages[i].cards.length > 0) return messages[i];
  }
  return null;
}

function lastUserMessage(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return messages[i].text;
  }
  return '';
}

function ChatPane() {
  const { phase, messages, busy, answerOnboarding, sendMessage, loadPersona, profile } = useChat();
  const bottomRef = useRef(null);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSend = (text) => (phase === 'onboarding' ? answerOnboarding(text) : sendMessage(text));
  const cardsMsg = latestCardsMessage(messages);
  const sources = cardsMsg?.sources || [];

  return (
    <div className="min-h-screen bg-gray-50 text-left flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm">
          🍴
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Food Agent</p>
          <p className="text-xs text-green-500 font-medium">● Grounded in People Inc. editorial</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <select
            onChange={(e) => {
              const p = PERSONAS.find((x) => x.id === e.target.value);
              if (p) loadPersona(p);
            }}
            defaultValue=""
            className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 text-gray-600"
          >
            <option value="" disabled>
              Load persona…
            </option>
            {PERSONAS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCompare(true)}
            className="text-xs font-medium bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700"
          >
            Compare vs vanilla
          </button>
        </div>
      </header>

      {/* Two columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] overflow-hidden">
        {/* Left: chat */}
        <div className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <UserBubble key={i} text={m.text} />
              ) : (
                <div key={i}>
                  <BotBubble
                    text={m.text || (m.streaming ? '🔍 Searching People Inc. editorial…' : '')}
                  />
                  {m.cards && m.cards.length > 0 && (
                    <div className="ml-11 mb-4 space-y-2">
                      {m.cards.map((card, ci) =>
                        card.type === 'place' ? (
                          <PlaceCard
                            key={ci}
                            card={card}
                            onTrySomethingElse={() =>
                              sendMessage('Try something else — a different option, no repeats.')
                            }
                          />
                        ) : (
                          <RecipeCard
                            key={ci}
                            card={card}
                            onTrySomethingElse={() =>
                              sendMessage('Try something else — a different option, no repeats.')
                            }
                          />
                        )
                      )}
                    </div>
                  )}
                </div>
              )
            )}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-gray-200 bg-white px-6 py-4">
            <ChatInput
              onSend={onSend}
              disabled={busy}
              placeholder={
                phase === 'onboarding' ? 'Type your answer…' : 'What should I cook tonight?'
              }
            />
          </div>
        </div>

        {/* Right: provenance + cards */}
        <aside className="border-l border-gray-200 bg-white overflow-y-auto px-5 py-5 hidden lg:block">
          <GroundingBar sources={sources} />
          <div className="space-y-3 mt-3">
            {cardsMsg?.cards?.map((card, i) =>
              card.type === 'place' ? (
                <PlaceCard
                  key={i}
                  card={card}
                  onTrySomethingElse={() => sendMessage('Try something else — a different option, no repeats.')}
                />
              ) : (
                <RecipeCard
                  key={i}
                  card={card}
                  onTrySomethingElse={() => sendMessage('Try something else — a different option, no repeats.')}
                />
              )
            )}
          </div>
          {sources.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sources</p>
              <ol className="space-y-2">
                {sources.map((s, i) => (
                  <li key={i} className="text-xs text-gray-600">
                    <a href={s.url} target="_blank" rel="noreferrer" className="text-violet-700 hover:underline">
                      [{i + 1}] {s.publisher ? `${s.publisher} — ` : ''}{s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </aside>
      </div>

      {showCompare && (
        <CompareModal
          profile={profile}
          initialQuery={lastUserMessage(messages)}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ChatProvider>
      <ChatPane />
    </ChatProvider>
  );
}
