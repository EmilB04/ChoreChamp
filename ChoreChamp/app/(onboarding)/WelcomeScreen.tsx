import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import OnboardingDots from '../../components/OnboardingDots';
import { useTheme } from '@/contexts/ThemeContext'; 
import { Ionicons } from '@expo/vector-icons';

/*
Welcome Screen
    - Displays introduction text based on selected language.
    - Texts are stored in STRINGS and chosen using the lang parameter.
    - User continues to notifications setup.
    - Shows progress dots (second dot active).
*/

type LangKey = 'no' | 'en' | 'es' | 'de';

const STRINGS: Record<LangKey, { title: string; subtitle: string; copy: string; next: string }> = {
  no: {
    title: 'Velkommen til ChoreChamp!',
    subtitle: 'Følg med på leaderboarden og se hvem som leder! Motivasjon og moro i én og samme app!',
    copy: 'Klar til å gjøre husarbeid litt mer gøy? La oss komme i gang!',
    next: 'Neste',
  },
  en: {
    title: 'Welcome to ChoreChamp!',
    subtitle: 'Follow the leaderboard and see who’s on top! Motivation and fun in one app!',
    copy: 'Ready to make chores more fun? Let’s get started!',
    next: 'Next',
  },
  es: {
    title: '¡Bienvenido a ChoreChamp!',
    subtitle: '¡Sigue la clasificación y mira quién está en la cima! ¡Motivación y diversión en una sola app!',
    copy: '¿Listo para hacer las tareas más divertidas? ¡Vamos allá!',
    next: 'Siguiente',
  },
  de: {
    title: 'Willkommen bei ChoreChamp!',
    subtitle: 'Verfolge die Bestenliste und sieh, wer an der Spitze steht! Motivation und Spaß in einer App!',
    copy: 'Bereit, Hausarbeit lustiger zu machen? Lass uns anfangen!',
    next: 'Weiter',
  },
};

export default function WelcomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();

  // Safely read language parameter from URL
  const rawLang =
    typeof params.lang === 'string' ? params.lang : Array.isArray(params.lang) ? params.lang[0] : undefined;

  // Validate that the language exists in STRINGS, otherwise default to Norwegian
  const lang = (rawLang && (rawLang === 'no' || rawLang === 'en' || rawLang === 'es' || rawLang === 'de')) ? (rawLang as LangKey) : 'no';
  const strings = STRINGS[lang];

  // Navigate to the notifications screen
  function goNext() {
    router.replace('/(onboarding)/NotificationsScreen');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <OnboardingDots activeIndex={1} />

        <TouchableOpacity
          onPress={() => router.replace('/(onboarding)/LanguageSelection')}
          accessibilityRole='button'
          hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <View style={[styles.container]}>
        <Text style={[styles.title, { color: colors.text }]}>{strings.title}</Text>

        <Text style={[styles.subtitle, { color: colors.tint }]}>{strings.subtitle}</Text> 

        <Image
          source={require('../../assets/images/WelcomeAvatar.png')}
          style={styles.illustration}
          resizeMode="contain"
          accessibilityLabel="Welcome illustration"
        />

         <Text style={[styles.copy, { color: colors.text }]}>{strings.copy}</Text>

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: colors.tint }]}
          onPress={goNext}
          accessibilityLabel={strings.next}
          accessibilityRole="button"
        >
          <Text style={[styles.nextText, { color: colors.darkText }]}>{strings.next}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1},
  headerRow: { width: '100%', paddingHorizontal: 24, height: 56, alignItems: 'center', justifyContent: 'center', position: 'relative' }, // new
  backButton: { position: 'absolute', left: 16, height: '100%', justifyContent: 'center', padding: 8 }, // new
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  subtitle: {fontSize: 16, textAlign: 'center', marginBottom: 24 },
  illustration: { width: 150, height: 150, marginBottom: 24 },
  copy: {fontSize: 16, textAlign: 'center', marginBottom: 30 },
  nextBtn: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  nextText: {fontSize: 18, fontWeight: '700' },
});