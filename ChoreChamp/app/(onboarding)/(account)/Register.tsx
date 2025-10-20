import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import OnboardingDots from '../../../components/OnboardingDots';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Register() {
  const router = useRouter();
  const { colors } = useTheme();

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [birth, setBirth] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    const currentDate = selectedDate || new Date();
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear();
    setBirth(`${day}/${month}/${year}`);
    setShowDatePicker(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color={colors.tint} />
        </TouchableOpacity>
        <OnboardingDots activeIndex={4} total={5} />
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
            style={[styles.input, { backgroundColor: colors.white, color: '#000000' }]}
          />

          <Text style={[styles.label, { color: colors.tint, marginTop: 12 }]}>Mobilnummer</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Skriv inn mobilnummer"
            placeholderTextColor="#BDBDBD"
            keyboardType="phone-pad"
            style={[
              styles.input,
              { backgroundColor: colors.white, color: '#000000', borderWidth: 1, borderColor: colors.tint },
            ]}
          />

          <Text style={[styles.label, { color: colors.tint, marginTop: 12 }]}>Fødselsdato</Text>
          {Platform.OS === 'web' ? (
            <TextInput
              value={birth}
              onChangeText={setBirth}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#BDBDBD"
              style={[styles.input, { backgroundColor: colors.white, color: '#000000' }]}
            />
          ) : (
            <>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View pointerEvents="none">
                  <TextInput
                    value={birth}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#BDBDBD"
                    editable={false}
                    style={[
                      styles.input,
                      { backgroundColor: colors.white, color: '#000000', borderWidth: 1, borderColor: colors.tint },
                    ]}
                  />
                </View>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={birth ? new Date(birth.split('/').reverse().join('-')) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </>
          )}

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
    width: '100%',
    paddingHorizontal: 24,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: { position: 'absolute', left: 8, height: '100%', justifyContent: 'center', padding: 8 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
