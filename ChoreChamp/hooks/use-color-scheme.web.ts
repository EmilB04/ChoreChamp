/*
    Custom Hook: useColorScheme
    This hook wraps the React Native useColorScheme hook to ensure consistent
    behavior across platforms, including web. It adds a hydration check to
    prevent mismatches between server and client rendering on web.
*/

import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
