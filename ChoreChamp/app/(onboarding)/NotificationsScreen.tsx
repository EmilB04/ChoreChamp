import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import {useRouter} from 'expo-router';
import OnboardingDots from "../../components/OnboardingDots";
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

/*
Notifications Screen
    - Asks user to enable notifications for updates about chores.
    - Two options: allow or skip.
    - Both options navigate to the main app (tabs).
    - Shows progress dots (third dot active).
*/

export default function NotificationsScreen() {
    const router = useRouter();    
    const { colors } = useTheme();

    // If user allows notifications, continue to main app
    function handleAllow(){
        router.replace('/(tabs)');
    }

    // If user skips, continue without enabling notifications
    function handleSkip(){
        router.replace('/(tabs)');
    }

    return(
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
            <View style={styles.headerRow}>
                <OnboardingDots activeIndex={2} />

                <TouchableOpacity
                onPress={() => router.replace('/(onboarding)/WelcomeScreen')} 
                accessibilityRole='button' 
                hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }} 
                style={styles.backButton} 
              >  
                <Ionicons name="chevron-back" size={22} color={colors.tint} />
              </TouchableOpacity> 
            </View>

            <View style= {styles.container}>
                <Image
                    source={require('../../assets/images/bell.png')}
                    style={styles.icon}
                    resizeMode='contain'
                    accessibilityLabel ="Notifications bell icon"
                />

                <Text style={[styles.title, { color: colors.text }]}>Skru på varsler?</Text>
                <Text style={[styles.subtitle, {color: colors.lightNonInteractiveText}]}>Få påminnelser når det er din tur til å gjøre en oppgave.</Text>
                
                <TouchableOpacity  
                    style={[styles.primaryBtn, {backgroundColor: colors.tint}]}
                    onPress={handleAllow}
                    accessibilityLabel="Skru på varsler"
                    accessibilityRole="button"
                >
                    <Text style={[styles.primaryText, { color: colors.darkText }]}>Ja</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.secondaryBtn, { backgroundColor: colors.contextBackground }]}
                    onPress={handleSkip}
                    accessibilityLabel="Ikke nå"
                    accessibilityRole="button"
                >
                    <Text style={[styles.secondaryText, { color: colors.text }]}>Ikke nå</Text>
                </TouchableOpacity>

                <Text style={[styles.footer, { color: colors.lightNonInteractiveText }]}>Du kan endre dette i innstillinger senere.</Text>
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
  safe: { flex: 1},
  headerRow: { width: '100%', paddingHorizontal: 24, height: 56, alignItems: 'center', justifyContent: 'center', position: 'relative' }, // new
  backButton: { position: 'absolute', left: 16, height: '100%', justifyContent: 'center', padding: 8 }, // new
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  icon: { width: 100, height: 100, marginBottom: 32 },
  title: {fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: {fontSize: 14, marginBottom: 32, textAlign: 'center' },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryText: {fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    paddingVertical: 14,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  secondaryText: {fontSize: 16, fontWeight: '700' },
  footer: {fontSize: 12, textAlign: 'center' },
});