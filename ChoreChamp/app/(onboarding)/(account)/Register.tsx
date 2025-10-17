import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import OnboardingDots from '../../../components/OnboardingDots';

export default function Register() {
  const router = useRouter();
  const { colors } = useTheme();

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [birth, setBirth] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!username.trim()) return 'Skriv inn brukernavn';
    return null;
  }

  async function handleNext() {
    const v = validate();
    if (v) return setError(v);
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      router.replace('/(tabs)');
    } catch {
      setError('Noe gikk galt');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace('/(onboarding)/(account)/Login')}
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
        <Text style={[styles.title, { color: colors.text }]}>Lag din profil</Text>

        <View style={styles.avatarWrap}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.white }]}>
            <Ionicons name="person" size={36} color="#0B0B0B" />
          </View>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.tint }]}>Brukernavn</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Legg til brukernavn"
            placeholderTextColor="#BDBDBD"
            style={[styles.input, { backgroundColor: colors.white, color: colors.text }]}
          />

          <Text style={[styles.label, { color: colors.tint, marginTop: 12 }]}>Mobilnummer</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Legg til mobilnummer"
            placeholderTextColor="#BDBDBD"
            keyboardType="phone-pad"
            style={[styles.input, { backgroundColor: colors.white, color: colors.text }]}
          />

          <Text style={[styles.label, { color: colors.tint, marginTop: 12 }]}>Fødselsdato</Text>
          <TextInput
            value={birth}
            onChangeText={setBirth}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#BDBDBD"
            style={[styles.input, { backgroundColor: colors.white, color: colors.text }]}
          />

          {error && <Text style={[styles.error, { color: colors.statusFailedText }]}>{error}</Text>}

          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: colors.tint }]}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={[styles.nextText, { color: colors.darkText }]}>
              {loading ? 'Laster...' : 'Neste'}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 80, 
    paddingBottom: 40,
  },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 18 },
  avatarWrap: { alignItems: 'center', marginBottom: 18 },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: { width: '100%' },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: { marginTop: 8, textAlign: 'center' },
  nextBtn: {
    marginTop: 18,
    borderRadius: 40,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2,
  },
  nextText: { fontSize: 16, fontWeight: '700' },
});
