import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import OnboardingDots from '../../components/onBoarding/OnboardingDots';
import { useTheme } from '@/contexts/ThemeContext';
import { useEntranceAnimation, useScaleAnimation } from '@/hooks/useEntranceAnimation';

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

  const { fadeAnim, slideAnim } = useEntranceAnimation();
  const imageScaleAnim = useScaleAnimation(200);
  const buttonSlideAnim = useScaleAnimation(400, 1);

  const rawLang =
    typeof params.lang === 'string' ? params.lang : Array.isArray(params.lang) ? params.lang[0] : undefined;

  const lang = (rawLang && (rawLang === 'no' || rawLang === 'en' || rawLang === 'es' || rawLang === 'de')) ? (rawLang as LangKey) : 'no';
  const strings = STRINGS[lang];

  function goNext() {
    router.push('/(onboarding)/LoginCheckScreen');
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <OnboardingDots activeIndex={0} total={5} />
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.container, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }]}>
          <Text style={[styles.title, { color: colors.text }]}>{strings.title}</Text>

          <Text style={[styles.subtitle, { color: colors.tint }]}>{strings.subtitle}</Text> 

          <Animated.Image
            source={require('../../assets/images/WelcomeAvatar.png')}
            style={[styles.illustration, {
              transform: [{ scale: imageScaleAnim }],
            }]}
            resizeMode="contain"
            accessibilityLabel="Welcome illustration"
          />

          <Text style={[styles.copy, { color: colors.text }]}>{strings.copy}</Text>

          <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateY: buttonSlideAnim }],
          }}>
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: colors.tint }]}
              onPress={goNext}
              accessibilityLabel={strings.next}
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <Text style={[styles.nextText, { color: colors.darkText }]}>{strings.next}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerRow: {
    width: '100%',
    paddingHorizontal: 24,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: { position: 'absolute', left: 5, height: '100%', justifyContent: 'center', padding: 8 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
  illustration: { width: 150, height: 150, marginBottom: 24 },
  copy: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
  nextBtn: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 30 },
  nextText: { fontSize: 18, fontWeight: '700' },
});
