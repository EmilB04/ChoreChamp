import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import OnboardingDots from '../../components/OnboardingDots';
import { useTheme } from '@/contexts/ThemeContext';

export default function LanguageSelection() {
    const router = useRouter();
    const { colors } = useTheme();

    function select(langCode: string){
        router.push(`/(onboarding)/NotificationsScreen?lang=${encodeURIComponent(langCode)}`);
    }

    return(
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <View style={styles.headerRow}>
                <OnboardingDots activeIndex={2} total={5} />
                
                <TouchableOpacity
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
                    style={styles.backButton}
                >
                    <View style={{ width: 22, height: 22, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 22, color: colors.tint }}>‹</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Image
                            source={require('../../assets/images/Transparent_Logo.png')}
                            style={styles.logo}
                            resizeMode='contain'
                            accessible
                            accessibilityLabel="ChoreChamp logo"
                        />
                        <Text style={[styles.title, { color: colors.text }]}>Select your language</Text>
                    </View>

                    <View style={styles.buttons}>
                        <TouchableOpacity style={[styles.langBtn, { backgroundColor: colors.tint }]} onPress={() => select('en')} accessibilityRole="button" accessibilityLabel="English">
                            <View style={styles.flagWrapper}>
                                <Image source={require('../../assets/images/GB.png')} style={styles.flagImage} />
                            </View>
                            <View style={styles.langTextWrapper}>
                                <Text style={[styles.langText, { color: colors.text }]}>English</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.langBtn, { backgroundColor: colors.tint }]} onPress={() => select('no')} accessibilityRole="button" accessibilityLabel="Norsk">
                            <View style={styles.flagWrapper}>
                                <Image source={require('../../assets/images/NO.png')} style={styles.flagImage} />
                            </View>
                            <View style={styles.langTextWrapper}>
                                <Text style={[styles.langText, { color: colors.text }]}>Norsk</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.langBtn, { backgroundColor: colors.tint }]} onPress={() => select('es')} accessibilityRole="button" accessibilityLabel="Español">
                            <View style={styles.flagWrapper}>
                                <Image source={require('../../assets/images/ES.png')} style={styles.flagImage} />
                            </View>
                            <View style={styles.langTextWrapper}>
                                <Text style={[styles.langText, { color: colors.text }]}>Español</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.langBtn, { backgroundColor: colors.tint }]} onPress={() => select('de')} accessibilityRole="button" accessibilityLabel="Deutsch">
                            <View style={styles.flagWrapper}>
                                <Image source={require('../../assets/images/DE.png')} style={styles.flagImage} />
                            </View>
                            <View style={styles.langTextWrapper}>
                                <Text style={[styles.langText, { color: colors.text }]}>Deutsch</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
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
  backButton: {
    position: 'absolute',
    left: 5,
    height: '100%',
    justifyContent: 'center',
    padding: 8,
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