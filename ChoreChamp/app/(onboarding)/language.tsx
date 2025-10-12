import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function LanguageSelection() {
    const router = useRouter();

    function select(langCode: string){
        //navigate to welcome screen and pass language as query parameter
        router.push(`/(onboarding)/welcome?lang=${encodeURIComponent(langCode)}`);
    }

    return(
        <SafeAreaView style={styles.safe}>
            <View style= {styles.container}>
                <View style= {styles.header}>
                    <Image
                        source={require('../../assets/images/Transparent_Logo.png')}
                        style={styles.logo}
                        resizeMode='contain'
                        accessible
                        accessibilityLabel ="ChoreChamp logo"
                    />
                    <Text style={styles.title}>Select your language</Text>  
                </View>


                <View style={styles.buttons}>

                    <TouchableOpacity
                        accessibilityLabel = "English"
                        accessibilityRole = "button"
                        style={styles.langBtn}
                        onPress={() => select('en')}
                    >
                    <Image
                        source={require('../../assets/images/GB.png')}
                        style={styles.flagImage}
                        accessibilityLabel ="British flag"
                    />
                    <Text style={styles.langText}>English</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        accessibilityLabel = "Norsk"
                        accessibilityRole = "button"
                        style={styles.langBtn}
                        onPress={() => select('no')}
                    >
                    <Image
                        source={require('../../assets/images/NO.png')}
                        style={styles.flagImage}
                        accessibilityLabel ="Norwegian flag"
                    />
                    <Text style={styles.langText}>Norsk</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        accessibilityLabel = "Español"
                        accessibilityRole = "button"
                        style={styles.langBtn}
                        onPress={() => select('es')}
                    >
                    <Image
                        source={require('../../assets/images/ES.png')}
                        style={styles.flagImage}
                        accessibilityLabel ="Spanish flag"
                    />
                    <Text style={styles.langText}>Español</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        accessibilityLabel = "Deutsch"
                        accessibilityRole = "button"
                        style={styles.langBtn}
                        onPress={() => select('de')}
                    >
                    <Image
                        source={require('../../assets/images/DE.png')}
                        style={styles.flagImage}
                        accessibilityLabel ="German flag"
                    />
                    <Text style={styles.langText}>Deutsch</Text>
                    </TouchableOpacity>

                </View>
        </View>
    </SafeAreaView>       
    );
    }

const styles = StyleSheet.create({

  safe: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 24, alignItems: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 8 },
  buttons: { width: '100%', gap: 20 },

  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC107', 
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 28,
    width: '100%',
  },

    flagImage: { width: 30, height: 30, marginRight: 12, borderRadius: 2 }, // NEW:
    flag: { fontSize: 22, marginRight: 12 },
    langText: { fontSize: 18, color: '#000', fontWeight: '600' },

    logo: { width: 200, height: 200, marginBottom: 12 },
});