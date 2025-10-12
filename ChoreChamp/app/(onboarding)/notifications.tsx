import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Image } from "react-native";
import {useRouter} from 'expo-router';

export default function NotificationsScreen() {
    const router = useRouter();

    function handleAllow(){
        router.replace('/(tabs)');
    }

    function handleSkip(){
        router.replace('/(tabs)');
    }

    return(
        <SafeAreaView style={styles.safe}>
            <View style= {styles.container}>

                <Image
                    source={require('../../assets/images/bell.png')}
                    style={styles.icon}
                    resizeMode='contain'
                    accessibilityLabel ="Notifications bell icon"
                />

                <Text style={styles.title}>Skru på varsler?</Text>
                <Text style={styles.subtitle}>Du vil få varsler om nye gjøremål.</Text>

                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleAllow}
                    accessibilityLabel="Skru på varsler"
                    accessibilityRole="button"
                >
                    <Text style={styles.primaryText}>Ja</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={handleSkip}
                    accessibilityLabel="Ikke nå"
                    accessibilityRole="button"
                >
                    <Text style={styles.secondaryText}>Ikke nå</Text>
                </TouchableOpacity>

                <Text style={styles.footer}>Du kan endre dette i innstillinger senere.</Text>
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  icon: { width: 100, height: 100, marginBottom: 32 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#ccc', fontSize: 14, marginBottom: 32 },
  primaryBtn: {
    backgroundColor: '#FFC107',
    paddingVertical: 14,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryText: { color: '#000', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: '#333',
    paddingVertical: 14,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  secondaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { color: '#888', fontSize: 12, textAlign: 'center' },
});