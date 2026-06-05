import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'wellness_profile_v2';

export const DEFAULT_PROFILE = {
  name: '',
  // Goals & Training
  fitnessGoal: '',
  trainingTypes: [],
  daysPerWeek: '',
  targetNote: '',
  // Dietary
  dietStyle: '',
  restrictions: [],
  dislikes: '',
  // Location
  homeCity: '',
  travelingTo: '',
  // Meta
  intakeComplete: false,
};

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_PROFILE;
      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const update = (fields) => setProfile((prev) => ({ ...prev, ...fields }));

  const resetProfile = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(DEFAULT_PROFILE);
  };

  return (
    <ChatContext.Provider value={{ profile, update, resetProfile }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
