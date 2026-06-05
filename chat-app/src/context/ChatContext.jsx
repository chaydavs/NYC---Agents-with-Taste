import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { streamChat } from '../api/client';

const ChatContext = createContext(null);

const EMPTY_RECOMMENDED = { cuisines: [], proteins: [], techniques: [] };

// Hidden first turn: the agent itself writes the greeting + first onboarding
// question. Nothing about onboarding is hardcoded on the client.
const INIT_TRIGGER =
  '(The user just opened the app. Greet them as BananaBread and begin onboarding.)';

export function ChatProvider({ children }) {
  const [profile, setProfile] = useState({ eats_summary: '', dines: '', restrictions: '' });
  const [recommended, setRecommended] = useState(EMPTY_RECOMMENDED);
  // messages: { role:'bot'|'user', text, cards?, sources?, streaming? }
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]); // API-shaped: {role:'user'|'assistant', content}
  const [busy, setBusy] = useState(false);
  const started = useRef(false);

  // One turn runner for BOTH the agent-written greeting and every user message.
  // `display` hides the user line (used for the silent init trigger).
  const runTurn = useCallback(
    async (userText, { display = true } = {}) => {
      if (display && userText) {
        setMessages((prev) => [...prev, { role: 'user', text: userText }]);
      }
      setBusy(true);

      const botIndex = { current: -1 };
      setMessages((prev) => {
        botIndex.current = prev.length;
        return [...prev, { role: 'bot', text: '', streaming: true, cards: [], sources: [] }];
      });
      const patchBot = (patch) =>
        setMessages((prev) =>
          prev.map((m, i) => (i === botIndex.current ? { ...m, ...patch(m) } : m))
        );

      try {
        await streamChat({
          payload: { message: userText, user_profile: profile, already_recommended: recommended, history },
          onDelta: (delta) => patchBot((m) => ({ text: m.text + delta })),
          onResult: (result) => {
            patchBot((m) => ({
              text: m.text || result.text || '',
              cards: result.cards || [],
              sources: result.sources || [],
              streaming: false,
            }));
            if (result.recommended_next) setRecommended(result.recommended_next);
            setHistory((prev) => [
              ...prev,
              { role: 'user', content: userText },
              { role: 'assistant', content: result.assistantText || '' },
            ]);
          },
          onError: (err) =>
            patchBot((m) => ({ text: m.text || `Sorry — ${err}`, streaming: false })),
        });
      } finally {
        setBusy(false);
      }
    },
    [profile, recommended, history]
  );

  // Agent-driven opening on mount (no hardcoded greeting/questions).
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    runTurn(INIT_TRIGGER, { display: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback(
    (text) => {
      if (busy) return;
      return runTurn(text);
    },
    [busy, runTurn]
  );

  // Demo shortcut: seed a known profile, then let the agent greet with it.
  const loadPersona = useCallback(
    (persona) => {
      setProfile(persona.user_profile);
      setRecommended(persona.already_recommended || EMPTY_RECOMMENDED);
      setHistory([]);
      setMessages([]);
      started.current = true;
      runTurn(
        `(The user loaded the "${persona.label}" profile. Greet them warmly in one line using what you know, and invite a food question — do not re-onboard.)`,
        { display: false }
      );
    },
    [runTurn]
  );

  const value = { profile, recommended, messages, busy, loadPersona, sendMessage };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  return useContext(ChatContext);
}
