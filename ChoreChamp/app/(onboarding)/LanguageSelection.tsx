import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import OnboardingDots from '../../components/OnboardingDots';
import { useTheme } from '@/contexts/ThemeContext';

export default function LanguageSelection() {
    const router = useRouter();
    const { colors } = useTheme();

    function select(langCode: string){
        router.push(`/(onboarding)/WelcomeScreen?lang=${encodeURIComponent(langCode)}`);
    }

    return(
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <OnboardingDots activeIndex={0} />
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }} showsVerticalScrollIndicator={false}>
                <View style= {styles.container}>
                    <View style= {styles.header}>
                        <Image
                            source={require('../../assets/images/Transparent_Logo.png')}
                            style={styles.logo}
                            resizeMode='contain'
                            accessible
                            accessibilityLabel ="ChoreChamp logo"
                        />
                        <Text style={[styles.title, { color: colors.text }]}>Select your language</Text>  
                    </View>

                    <View style={styles.buttons}>
                        <TouchableOpacity
                            accessibilityLabel = "English"
                            accessibilityRole = "button"
                            style={[styles.langBtn, { backgroundColor: colors.tint }]} 
                            onPress={() => select('en')}
                        >
                        <Image
                            source={require('../../assets/images/GB.png')}
                            style={styles.flagImage}
                            accessibilityLabel ="British flag"
                        />
                        <Text style={[styles.langText, { color: colors.text }]}>English</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            accessibilityLabel = "Norsk"
                            accessibilityRole = "button"
                            style={[styles.langBtn, { backgroundColor: colors.tint }]} 
                            onPress={() => select('no')}
                        >
                        <Image
                            source={require('../../assets/images/NO.png')}
                            style={styles.flagImage}
                            accessibilityLabel ="Norwegian flag"
                        />
                        <Text style={[styles.langText, { color: colors.text }]}>Norsk</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            accessibilityLabel = "Español"
                            accessibilityRole = "button"
                            style={[styles.langBtn, { backgroundColor: colors.tint }]} 
                            onPress={() => select('es')}
                        >
                        <Image
                            source={require('../../assets/images/ES.png')}
                            style={styles.flagImage}
                            accessibilityLabel ="Spanish flag"
                        />
                        <Text style={[styles.langText, { color: colors.text }]}>Español</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            accessibilityLabel = "Deutsch"
                            accessibilityRole = "button"
                            style={[styles.langBtn, { backgroundColor: colors.tint }]}  
                            onPress={() => select('de')}
                        >
                        <Image
                            source={require('../../assets/images/DE.png')}
                            style={styles.flagImage}
                            accessibilityLabel ="German flag"
                        />
                        <Text style={[styles.langText, { color: colors.text }]}>Deutsch</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>       
    );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 24, alignItems: 'center' },
  title: {fontSize: 28, fontWeight: '700', marginBottom: 8 },
  buttons: { width: '100%', gap: 20 },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 28,
    width: '100%',
  },
  flagImage: { width: 30, height: 30, marginRight: 12, borderRadius: 2 },
  flag: { fontSize: 22, marginRight: 12 },
  langText: { fontSize: 18, fontWeight: '600' },
  logo: { width: 200, height: 200, marginBottom: 12 },
});
