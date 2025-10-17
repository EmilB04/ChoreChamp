import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Pressable, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import OnboardingDots from '../../../components/OnboardingDots';
import { Ionicons } from '@expo/vector-icons';

function darken(hex: string, amount = 0.06) {
  try {
    const h = hex.replace('#', '');
    const num = parseInt(h, 16);
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;
    r = Math.max(0, Math.min(255, Math.floor(r * (1 - amount))));
    g = Math.max(0, Math.min(255, Math.floor(g * (1 - amount))));
    b = Math.max(0, Math.min(255, Math.floor(b * (1 - amount))));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch {
    return hex;
  }
}

type SocialButtonProps = {
  label: string;
  icon?: React.ReactNode;
  onPress?: () => void;
};

const SocialButton = ({ label, icon, onPress }: SocialButtonProps) => {
  const [pressed, setPressed] = useState(false);
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.socialBtn,
        {
          backgroundColor: pressed
            ? darken(colors.tint)
            : colors.tint,
        },
      ]}
    >
      {icon && <View style={styles.socialIconWrap}>{icon}</View>}
      <Text style={[styles.socialText, { color: colors.darkText }]}>{label}</Text>
    </Pressable>
  );
};

export default function Login() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace('/(onboarding)/NotificationsScreen')}
          accessibilityRole="button"
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color={colors.tint} />
        </TouchableOpacity>
        <OnboardingDots activeIndex={3} total={4} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require('@/assets/images/LoginPic.png')}
          style={styles.illustration}
          resizeMode="contain"
        />

        <View style={styles.socialStack}>
          <SocialButton
            label="Logg inn med Google"
            icon={<Image source={require('@/assets/images/Google.png')} style={styles.socialIcon} />}
            onPress={() => console.log('Google login')}
          />
          <SocialButton
            label="Logg inn med Facebook"
            icon={<Image source={require('@/assets/images/Facebook.png')} style={styles.socialIcon} />}
            onPress={() => console.log('Facebook login')}
          />
          <SocialButton
            label="Logg inn med Apple"
            icon={<Image source={require('@/assets/images/Apple.png')} style={styles.socialIcon} />}
            onPress={() => console.log('Apple login')}
          />
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(onboarding)/(account)/Register')}
          accessibilityRole="button"
        >
          <Text style={[styles.registerText, { color: colors.text }]}>
            Ny på ChoreChamp?{' '}
            <Text style={{ color: colors.tint, fontWeight: '800' }}>
              Registrer ny bruker
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  backButton: { position: 'absolute', left: 8, justifyContent: 'center', height: '100%' },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  illustration: {
    width: 250,
    height: 200,
    marginBottom: 40,
  },
  socialStack: {
    width: '100%',
    gap: 14,
    marginBottom: 60,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 2,
  },
  socialIconWrap: {
    width: 36,
    height: 36,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: { width: 30, height: 30, resizeMode: 'contain' },
  socialText: { fontSize: 16, fontWeight: '700' },
  registerText: { fontSize: 15, textAlign: 'center' },
});
