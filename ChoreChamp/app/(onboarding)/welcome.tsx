import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

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

  // Hent språkparameter trygt (params.lang kan være string | string[] | undefined)
  const rawLang =
    typeof params.lang === 'string' ? params.lang : Array.isArray(params.lang) ? params.lang[0] : undefined;

  // Sjekk at rawLang er et gyldig nøkkel i STRINGS; ellers fallback til 'en'
  const lang = (rawLang && (rawLang === 'no' || rawLang === 'en' || rawLang === 'es' || rawLang === 'de')) ? (rawLang as LangKey) : 'en';
  const strings = STRINGS[lang];

  function goNext() {
    router.replace('/(onboarding)/notifications');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{strings.title}</Text>

        <Text style={styles.subtitle}>{strings.subtitle}</Text>

        <Image
          source={require('../../assets/images/WelcomeAvatar.png')}
          style={styles.illustration}
          resizeMode="contain"
          accessibilityLabel="Welcome illustration"
        />

        <Text style={styles.copy}>{strings.copy}</Text>

        <TouchableOpacity
          style={styles.nextBtn}
          onPress={goNext}
          accessibilityLabel={strings.next}
          accessibilityRole="button"
        >
          <Text style={styles.nextText}>{strings.next}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  subtitle: { color: '#FFC107', fontSize: 16, textAlign: 'center', marginBottom: 24 },
  illustration: { width: 150, height: 150, marginBottom: 24 },
  copy: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 30 },
  nextBtn: {
    backgroundColor: '#FFC107',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  nextText: { color: '#000', fontSize: 18, fontWeight: '700' },
});
