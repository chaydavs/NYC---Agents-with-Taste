import { createContext, useContext, useState } from 'react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
    const [userData, setUserData] = useState({
        // Step 1 – User Info
        name: '',
        age: '',
        gender: '',
        // Step 2 – Fitness & Diet
        fitnessGoal: '',
        activityLevel: '',
        dietType: '',
        // Step 3 – Location / Travel
        travelling: null,
        location: '',
        // Step 4 – Dietary Restrictions
        restrictions: [],
        otherRestrictions: '',
    });

    const update = (fields) => setUserData((prev) => ({ ...prev, ...fields }));

    return (
        <ChatContext.Provider value={{ userData, update }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    return useContext(ChatContext);
}
