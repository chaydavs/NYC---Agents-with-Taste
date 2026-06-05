import { createContext, useContext, useState, useCallback } from 'react';
import { streamChat } from '../api/client';

const ChatContext = createContext(null);

const EMPTY_RECOMMENDED = { cuisines: [], proteins: [], techniques: [] };

// The 3 conversational onboarding questions (NOT a form). Free-text answers map
// directly into the user_profile fields the agent reads each turn.
export const ONBOARDING_QUESTIONS = [
  { field: 'eats_summary', q: "Hi! I'm your food agent — everything I suggest is pulled from real editorial sources, never made up. First: what's your situation with food? Anything I should know about how you eat day to day?" },
  { field: 'dines', q: 'Got it. Where do you usually eat — mostly home, mostly out, or a mix of both?' },
  { field: 'restrictions', q: "Last one: anything you absolutely don't or can't eat?" },
];

export function ChatProvider({ children }) {
  const [phase, setPhase] = useState('onboarding'); // 'onboarding' | 'chat'
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [profile, setProfile] = useState({ eats_summary: '', dines: '', restrictions: '' });
  const [recommended, setRecommended] = useState(EMPTY_RECOMMENDED);

  // messages: { role:'bot'|'user', text, cards?, sources?, streaming? }
  const [messages, setMessages] = useState([
    { role: 'bot', text: ONBOARDING_QUESTIONS[0].q },
  ]);
  const [history, setHistory] = useState([]); // API-shaped: {role:'user'|'assistant', content}
  const [busy, setBusy] = useState(false);

  const pushMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  // ---- Onboarding ----
  const answerOnboarding = useCallback(
    (text) => {
      const step = onboardingStep;
      const field = ONBOARDING_QUESTIONS[step].field;
      setProfile((prev) => ({ ...prev, [field]: text }));
      setMessages((prev) => [...prev, { role: 'user', text }]);

      const next = step + 1;
      if (next < ONBOARDING_QUESTIONS.length) {
        setOnboardingStep(next);
        setMessages((prev) => [...prev, { role: 'bot', text: ONBOARDING_QUESTIONS[next].q }]);
      } else {
        setPhase('chat');
        setMessages((prev) => [
          ...prev,
          { role: 'bot', text: "Perfect — I've got your profile. Ask me anything: what to cook, where to eat, or plan your week." },
        ]);
      }
    },
    [onboardingStep]
  );

  // Skip onboarding by loading a seeded persona (demo).
  const loadPersona = useCallback((persona) => {
    setProfile(persona.user_profile);
    setRecommended(persona.already_recommended || EMPTY_RECOMMENDED);
    setPhase('chat');
    setHistory([]);
    setMessages([
      { role: 'bot', text: `Loaded ${persona.label}. Ask me what to cook, where to eat, or to plan your week.` },
    ]);
  }, []);

  // ---- Chat turn: stream a grounded answer ----
  const sendMessage = useCallback(
    async (text) => {
      if (busy) return;
      setBusy(true);
      setMessages((prev) => [...prev, { role: 'user', text }]);

      // Placeholder bot message we fill as deltas arrive.
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
          payload: {
            message: text,
            user_profile: profile,
            already_recommended: recommended,
            history,
          },
          onDelta: (delta) => patchBot((m) => ({ text: m.text + delta })),
          onResult: (result) => {
            // Keep the already-streamed spoken text; attach verified cards + sources.
            patchBot((m) => ({
              text: m.text || result.text || '',
              cards: result.cards || [],
              sources: result.sources || [],
              streaming: false,
            }));
            if (result.recommended_next) setRecommended(result.recommended_next);
            setHistory((prev) => [
              ...prev,
              { role: 'user', content: text },
              { role: 'assistant', content: result.assistantText || '' },
            ]);
          },
          onError: (err) =>
            patchBot((m) => ({
              text: m.text || `Sorry — ${err}`,
              streaming: false,
            })),
        });
      } finally {
        setBusy(false);
      }
    },
    [busy, profile, recommended, history]
  );

  const value = {
    phase,
    profile,
    recommended,
    messages,
    busy,
    answerOnboarding,
    loadPersona,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  return useContext(ChatContext);
}
