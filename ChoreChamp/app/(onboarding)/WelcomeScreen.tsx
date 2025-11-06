import BackButton from '@/components/onBoarding/BackButton';
import OnboardingDots from '@/components/onBoarding/OnboardingDots';
import { useTheme } from '@/contexts/ThemeContext';
import { useEntranceAnimation, useScaleAnimation } from '@/hooks/useEntranceAnimation';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    subtitle: "Follow the leaderboard and see who's on top! Motivation and fun in one app!",
    copy: "Ready to make chores more fun? Let's get started!",
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
    // --- CHANGED: go to NotificationsScreen next, preserving the selected language
    router.push(`/(onboarding)/NotificationsScreen?lang=${lang}`);
  }

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Gradient Header Background */}
      <View style={styles.headerBackground}>
        <LinearGradient
          colors={[colors.tint, colors.background]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>

      <SafeAreaView style={styles.safeContent}>
        <View style={styles.headerRow}>
          <OnboardingDots activeIndex={1} total={5} />
          <BackButton onPress={() => router.replace('/(onboarding)/LanguageSelection')} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.container, {
            opacity: fadeAnim,
          }]}>
            {/* Icon Badge */}
            <Animated.View style={[styles.iconBadge, {
              backgroundColor: colors.background,
              transform: [{ scale: imageScaleAnim }],
            }]}>
              <View style={[styles.iconInner, { backgroundColor: colors.tint }]}>
                {/* TODO: Replace with logo */}
                <Ionicons name="sparkles" size={48} color={colors.darkText} />
              </View>
            </Animated.View>

            {/* Title Section */}
            <Animated.View style={[styles.titleSection, {
              transform: [{ translateY: slideAnim }],
            }]}>
              <Text style={[styles.title, { color: colors.text }]}>
                {strings.title}
              </Text>

              <View style={[styles.highlightBox, { backgroundColor: colors.contextBackground }]}>
                <Ionicons name="trophy" size={20} color={colors.tint} style={styles.highlightIcon} />
                <Text style={[styles.subtitle, { color: colors.text }]}>
                  {strings.subtitle}
                </Text>
              </View>
            </Animated.View>

            {/* Animation */}
            <Animated.View
              style={[styles.illustration, {
                transform: [{ scale: imageScaleAnim }],
              }]}
              accessibilityLabel="Welcome animation"
            >
              <LottieView
                source={require('../../assets/lottie/winner.json')}
                autoPlay
                loop
                style={{ width: 200, height: 200 }}
              />
            </Animated.View>

            {/* Description Card */}
            <Animated.View style={[styles.descriptionCard, {
              backgroundColor: colors.contextBackground,
              opacity: fadeAnim,
            }]}>
              <Text style={[styles.copy, { color: colors.text }]}>
                {strings.copy}
              </Text>
            </Animated.View>

            {/* Next Button */}
            <Animated.View style={{
              transform: [{ scale: buttonSlideAnim }],
              width: '100%',
            }}>
              <TouchableOpacity
                style={[styles.nextBtn, { backgroundColor: colors.tint }]}
                onPress={goNext}
                accessibilityLabel={strings.next}
                accessibilityRole="button"
                activeOpacity={0.7}
              >
                <Text style={[styles.nextText, { color: colors.darkText }]}>
                  {strings.next}
                </Text>
                <Ionicons name="arrow-forward" size={20} color={colors.darkText} style={styles.arrowIcon} />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  safeContent: {
    flex: 1,
  },
  headerRow: {
    width: '100%',
    paddingHorizontal: 24,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  iconBadge: {
    width: 100,
    height: 100,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  iconInner: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightIcon: {
    marginRight: 4,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  illustration: {
    width: 180,
    height: 180,
    marginVertical: 8,
  },
  descriptionCard: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  copy: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  nextText: {
    fontSize: 18,
    fontWeight: '700',
  },
  arrowIcon: {
    marginLeft: 4,
  },
});
