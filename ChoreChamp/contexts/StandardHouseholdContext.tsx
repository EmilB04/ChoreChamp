import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StandardHouseholdContextType {
  standardHouseholdId: string | null;
  setStandardHouseholdId: (id: string) => void;
}

const StandardHouseholdContext = createContext<StandardHouseholdContextType | undefined>(undefined);

export function StandardHouseholdProvider({ children }: { children: ReactNode }) {
  const [standardHouseholdId, setStandardHouseholdIdState] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('defaultHouseholdId');
      if (stored) setStandardHouseholdIdState(stored);
    })();
  }, []);

  const setStandardHouseholdId = (id: string) => {
    setStandardHouseholdIdState(id);
    AsyncStorage.setItem('defaultHouseholdId', id).catch(() => {});
  };

  return (
    <StandardHouseholdContext.Provider value={{ standardHouseholdId, setStandardHouseholdId }}>
      {children}
    </StandardHouseholdContext.Provider>
  );
}

export function useStandardHousehold() {
  const ctx = useContext(StandardHouseholdContext);
  if (!ctx) throw new Error('useStandardHousehold must be used within StandardHouseholdProvider');
  return ctx;
}
