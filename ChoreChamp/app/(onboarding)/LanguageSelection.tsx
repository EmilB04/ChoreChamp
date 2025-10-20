import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import OnboardingDots from '../../components/onBoarding/OnboardingDots';
import { useTheme } from '@/contexts/ThemeContext';
import { useEntranceAnimation, useScaleAnimation, useStaggeredAnimation } from '@/hooks/useEntranceAnimation';
import BackButton from '@/components/onBoarding/BackButton';

export default function LanguageSelection() {
    const router = useRouter();
    const { colors } = useTheme();

    const { fadeAnim } = useEntranceAnimation();
    const logoScaleAnim = useScaleAnimation(100);
    const titleSlideAnim = useScaleAnimation(200, 1);
    const [button1ScaleAnim, button2ScaleAnim, button3ScaleAnim, button4ScaleAnim] = useStaggeredAnimation(4, 300, 50);

    function select(langCode: string){
        router.push(`/(onboarding)/NotificationsScreen?lang=${encodeURIComponent(langCode)}`);
    }

    return(
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <View style={styles.headerRow}>
                <OnboardingDots activeIndex={2} total={5} />
                <BackButton />
            </View>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }} showsVerticalScrollIndicator={false}>
                <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                    <View style={styles.header}>
                        <Animated.Image
                            source={require('../../assets/images/Transparent_Logo.png')}
                            style={[styles.logo, {
                                transform: [{ scale: logoScaleAnim }],
                            }]}
                            resizeMode='contain'
                            accessible
                            accessibilityLabel="ChoreChamp logo"
                        />
                        <Animated.Text style={[styles.title, { 
                            color: colors.text,
                            transform: [{ scale: titleSlideAnim }],
                        }]}>Select your language</Animated.Text>
                    </View>

                    <View style={styles.buttons}>
                        <Animated.View style={{ transform: [{ scale: button1ScaleAnim }] }}>
                            <TouchableOpacity 
                                style={[styles.langBtn, { backgroundColor: colors.tint }]} 
                                onPress={() => select('en')} 
                                accessibilityRole="button" 
                                accessibilityLabel="English"
                                activeOpacity={0.7}
                            >
                                <View style={styles.flagWrapper}>
                                    <Image source={require('../../assets/images/GB.png')} style={styles.flagImage} />
                                </View>
                                <View style={styles.langTextWrapper}>
                                    <Text style={[styles.langText, { color: colors.text }]}>English</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View style={{ transform: [{ scale: button2ScaleAnim }] }}>
                            <TouchableOpacity 
                                style={[styles.langBtn, { backgroundColor: colors.tint }]} 
                                onPress={() => select('no')} 
                                accessibilityRole="button" 
                                accessibilityLabel="Norsk"
                                activeOpacity={0.7}
                            >
                                <View style={styles.flagWrapper}>
                                    <Image source={require('../../assets/images/NO.png')} style={styles.flagImage} />
                                </View>
                                <View style={styles.langTextWrapper}>
                                    <Text style={[styles.langText, { color: colors.text }]}>Norsk</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View style={{ transform: [{ scale: button3ScaleAnim }] }}>
                            <TouchableOpacity 
                                style={[styles.langBtn, { backgroundColor: colors.tint }]} 
                                onPress={() => select('es')} 
                                accessibilityRole="button" 
                                accessibilityLabel="Español"
                                activeOpacity={0.7}
                            >
                                <View style={styles.flagWrapper}>
                                    <Image source={require('../../assets/images/ES.png')} style={styles.flagImage} />
                                </View>
                                <View style={styles.langTextWrapper}>
                                    <Text style={[styles.langText, { color: colors.text }]}>Español</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View style={{ transform: [{ scale: button4ScaleAnim }] }}>
                            <TouchableOpacity 
                                style={[styles.langBtn, { backgroundColor: colors.tint }]} 
                                onPress={() => select('de')} 
                                accessibilityRole="button" 
                                accessibilityLabel="Deutsch"
                                activeOpacity={0.7}
                            >
                                <View style={styles.flagWrapper}>
                                    <Image source={require('../../assets/images/DE.png')} style={styles.flagImage} />
                                </View>
                                <View style={styles.langTextWrapper}>
                                    <Text style={[styles.langText, { color: colors.text }]}>Deutsch</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
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
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  header: { marginBottom: 24, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  buttons: { width: '100%', gap: 20, alignItems: 'center' },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    width: Dimensions.get('window').width * 0.8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
  },
  flagWrapper: { width: 40, alignItems: 'flex-start' },
  langTextWrapper: { flex: 1, alignItems: 'center' },
  flagImage: { width: 30, height: 30, borderRadius: 2 },
  langText: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  logo: { width: 200, height: 200, marginBottom: 12 },
});