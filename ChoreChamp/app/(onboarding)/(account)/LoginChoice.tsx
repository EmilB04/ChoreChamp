import BackButton from '@/components/onBoarding/BackButton';
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from '@/contexts/ThemeContext';
import { useButtonPressAnimation, useEntranceAnimation, useStaggeredAnimation } from '@/hooks/useEntranceAnimation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OnboardingDots from '../../../components/onBoarding/OnboardingDots';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/i18n';


type SocialButtonProps = {
  label: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  index: number;
};
 

const SocialButton = ({ label, icon, onPress, index }: SocialButtonProps) => {
  const { colors } = useTheme();
  const staggeredAnims = useStaggeredAnimation(1, index * 100);
  const scaleAnim = staggeredAnims[0];
  const { scaleAnim: pressScaleAnim, handlePressIn, handlePressOut } = useButtonPressAnimation();

  return (
    <Animated.View style={{
      transform: [{ scale: scaleAnim }],
    }}>
      <Animated.View style={{
        transform: [{ scale: pressScaleAnim }],
      }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={[
            styles.socialBtn,
            { backgroundColor: colors.contextBackground }
          ]}
        >
          {icon && <View style={styles.socialIconWrap}>{icon}</View>}
          <Text style={[styles.socialText, { color: colors.text }]}>{label}</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.tint} style={styles.arrowIcon} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default function LoginChoice() {
  const router = useRouter();
  const { colors } = useTheme();
  const { fadeAnim: headerFadeAnim, slideAnim: titleSlideAnim } = useEntranceAnimation();
  const { signInWithGoogle } = useAuth(); 
  const { t } = useTranslation('onboarding');

  const params = useLocalSearchParams();
  const langParam = typeof params.lang === 'string' ? params.lang : undefined;

  useEffect(() => {
    async function applyLanguage() {
      if (!langParam) return;
      if (i18n.language === langParam) return;
      try {
        await i18n.changeLanguage(langParam);
        await AsyncStorage.setItem('appLanguage', langParam);
      } catch (e) {
        console.warn('Language change failed', e);
      }
    }
    applyLanguage();
  }, [langParam]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <BackButton />
        <OnboardingDots activeIndex={4} total={5} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[
          styles.titleContainer,
          {
            opacity: headerFadeAnim,
            transform: [{ translateY: titleSlideAnim }],
          }
        ]}>
          <View style={[styles.iconWrapper]}>
            <View style={[styles.loginIcon, { backgroundColor: colors.tint }]}>
              <Ionicons name="log-in" size={40} color={colors.darkText} />
            </View>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{t('loginchoice.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.lightDarkText }]}>
            {t('loginchoice.subtitle')}
          </Text>
        </Animated.View>

        <View style={styles.socialStack}>
          <SocialButton
            label={t('loginchoice.google')}
            icon={<Image source={require('@/assets/images/Google.png')} style={styles.socialIcon} />}
            onPress={signInWithGoogle}
            index={0}
          />
          <SocialButton
            label={t('loginchoice.facebook')}
            icon={<Ionicons name="logo-facebook" size={24} color="#4267B2" />}
            onPress={() => console.log('Facebook login')}
            index={1}
          />
          <SocialButton
            label={t('loginchoice.apple')}
            icon={<Ionicons name="logo-apple" size={24} color="#fff" />}
            onPress={() => console.log('Apple login')}
            index={2}
          />
          <SocialButton
            label={t('loginchoice.phone')}
            icon={<Ionicons name="call" size={24} color="#34A853" />}
            onPress={() => router.push('/(onboarding)/(account)/Login')}
            index={3}
          />
        </View>

        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: colors.lightDarkText }]} />
          <Text style={[styles.dividerText, { color: colors.lightDarkText }]}>{t('loginchoice.or')}</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.lightDarkText }]} />
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(onboarding)/(account)/Register')}
          accessibilityRole="button"
          style={[styles.registerButton, { backgroundColor: colors.tint }]}
          activeOpacity={0.7}
        >
          <View style={styles.registerButtonContent}>
            <Ionicons name="person-add" size={20} color={colors.darkText} style={styles.registerIcon} />
            <Text style={[styles.registerButtonText, { color: colors.darkText }]}>
              {t('loginchoice.createAccount')}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
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
    paddingVertical: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrapper: {
    marginBottom: 20,
  },
  loginIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  socialStack: {
    width: '100%',
    gap: 14,
    marginBottom: 32,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialIconWrap: {
    width: 28,
    height: 28,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: { 
    width: 24, 
    height: 24, 
    resizeMode: 'contain' 
  },
  socialText: { 
    fontSize: 16, 
    fontWeight: '600',
    flex: 1,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 16,
    opacity: 0.7,
  },
  registerButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerIcon: {
    marginRight: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
