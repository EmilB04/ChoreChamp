import BackButton from '@/components/onBoarding/BackButton';
import OnboardingDots from '@/components/onBoarding/OnboardingDots';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useEntranceAnimation, useScaleAnimation, useStaggeredAnimation } from '@/hooks/useEntranceAnimation';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { updateUserData } = useUser();

    const { t } = useTranslation('onboarding');

    const params = useLocalSearchParams();
    const langParam = typeof params.lang === 'string' ? params.lang : undefined;

    const { fadeAnim } = useEntranceAnimation();
    const iconScaleAnim = useScaleAnimation(100);
    const titleSlideAnim = useScaleAnimation(200, 1);
    const [button1SlideAnim, button2SlideAnim] = useStaggeredAnimation(2, 300, 100);

    useEffect(() => {
      async function applyLanguage() {
        if (!langParam) return;
        if (i18n.language === langParam) return; // already set
        try {
          await i18n.changeLanguage(langParam); // triggers re-render of t()
          await AsyncStorage.setItem('appLanguage', langParam); // persist choice
        } catch (e) {
          console.warn('Language change failed', e);
        }
      }
      applyLanguage();
    }, [langParam]);


    function handleAllow() {
        updateUserData({ notificationsEnabled: true });
        router.push('/(onboarding)/(account)/Register');
    }

    function handleSkip() {
        updateUserData({ notificationsEnabled: false });
        router.push('/(onboarding)/(account)/Register');
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
                    <OnboardingDots activeIndex={3} total={5} />
                    <BackButton />
                </View>

                <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                    {/* Notification animation */}
                    <Animated.View>
                        <LottieView
                            source={require('../../assets/lottie/notification-bell.json')}
                            autoPlay
                            loop
                            style={{ width: 200, height: 200 }}
                        />
                    </Animated.View>

                    {/* Title Section */}
                    <Animated.View style={[styles.titleSection, {
                        transform: [{ scale: titleSlideAnim }],
                    }]}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {t('notifications.title')}
                        </Text>
                        
                        <View style={[styles.descriptionCard, { backgroundColor: colors.contextBackground }]}>
                            <Ionicons name="alarm" size={20} color={colors.tint} style={styles.descIcon} />
                            <Text style={[styles.subtitle, { color: colors.text }]}>
                                {t('notifications.pill')}
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Button Group */}
                    <View style={styles.buttonGroup}>
                        <Animated.View style={{
                            transform: [{ scale: button1SlideAnim }],
                        }}>
                            <TouchableOpacity
                                style={[styles.primaryBtn, { backgroundColor: colors.tint }]}
                                onPress={handleAllow}
                                accessibilityLabel={t('notifications.enableButton')}
                                accessibilityRole="button"
                                activeOpacity={0.7}
                            >
                                <Ionicons name="notifications" size={20} color={colors.darkText} style={styles.btnIcon} />
                                <Text style={[styles.primaryText, { color: colors.darkText }]}>
                                    {t('notifications.enableButton')}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View style={{
                            transform: [{ scale: button2SlideAnim }],
                        }}>
                            <TouchableOpacity
                                style={[styles.secondaryBtn, { backgroundColor: colors.contextBackground }]}
                                onPress={handleSkip}
                                accessibilityLabel={t('notifications.skipButton')}
                                accessibilityRole="button"
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.secondaryText, { color: colors.text }]}>
                                    {t('notifications.skipButton')}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

                    {/* Footer Note */}
                    <Animated.View style={[styles.footerCard, {
                        backgroundColor: colors.contextBackground,
                        opacity: fadeAnim,
                    }]}>
                        <Ionicons name="information-circle" size={16} color={colors.tint} />
                        <Text style={[styles.footer, { color: colors.lightNonInteractiveText }]}>
                            {t('notifications.footer')}
                        </Text>
                    </Animated.View>
                </Animated.View>
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
    container: { 
        flex: 1, 
        justifyContent: 'space-evenly', 
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    iconBadge: {
        width: 140,
        height: 140,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    iconInner: {
        width: 120,
        height: 120,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleSection: {
        width: '100%',
        alignItems: 'center',
        gap: 16,
    },
    title: { 
        fontSize: 28, 
        fontWeight: '700',
        textAlign: 'center',
    },
    descriptionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 14,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    descIcon: {
        marginRight: 4,
    },
    subtitle: { 
        fontSize: 15,
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 22,
        flex: 1,
    },
    buttonGroup: {
        width: '100%',
        gap: 12,
        alignItems: 'center',
    },
    primaryBtn: { 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        minWidth: 250,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        gap: 8,
    },
    btnIcon: {
        marginRight: 4,
    },
    primaryText: { 
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryBtn: { 
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 16,
        minWidth: 200,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    secondaryText: { 
        fontSize: 16,
        fontWeight: '600',
    },
    footerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8,
    },
    footer: { 
        fontSize: 13,
        textAlign: 'center',
        fontWeight: '500',
    },
});
