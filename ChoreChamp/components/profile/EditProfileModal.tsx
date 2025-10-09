import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import * as ImagePicker from 'expo-image-picker';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    currentName: string;
    currentImageUri: string;
    onSave: (name: string, imageUri: string) => void;
}

export default function EditProfileModal({
    visible,
    onClose,
    currentName,
    currentImageUri,
    onSave,
}: EditProfileModalProps) {
    const { colors } = useTheme();
    const [name, setName] = useState(currentName);
    const [imageUri, setImageUri] = useState(currentImageUri);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = () => {
        if (name.trim() === '') {
            Alert.alert('Feil', 'Navnet kan ikke være tomt');
            return;
        }
        
        setIsLoading(true);
        // Simulate API call delay
        setTimeout(() => {
            onSave(name.trim(), imageUri);
            setIsLoading(false);
            onClose();
        }, 500);
    };

    const handleCancel = () => {
        // Reset to original values
        setName(currentName);
        setImageUri(currentImageUri);
        onClose();
    };

    const pickImage = async () => {
        try {
            // Request permission
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (permissionResult.granted === false) {
                Alert.alert('Tillatelse kreves', 'Du må gi tillatelse til å få tilgang til bildegalleri');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Feil', 'Kunne ikke velge bilde');
        }
    };

    const takePhoto = async () => {
        try {
            // Request permission
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            
            if (permissionResult.granted === false) {
                Alert.alert('Tillatelse kreves', 'Du må gi tillatelse til å bruke kameraet');
                return;
            }

            // Launch camera
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Feil', 'Kunne ikke ta bilde');
        }
    };

    const showImageOptions = () => {
        Alert.alert(
            'Velg bilde',
            'Hvordan vil du legge til et profilbilde?',
            [
                { text: 'Galleri', onPress: pickImage },
                { text: 'Kamera', onPress: takePhoto },
                { text: 'Avbryt', style: 'cancel' },
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleCancel}
        >
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: colors.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.contextBackground }]}>
                    <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                        <Text style={[styles.cancelText, { color: colors.text }]}>Avbryt</Text>
                    </TouchableOpacity>
                    
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Rediger profil</Text>
                    
                    <TouchableOpacity 
                        onPress={handleSave} 
                        style={styles.headerButton}
                        disabled={isLoading}
                    >
                        <Text style={[
                            styles.saveText, 
                            { color: isLoading ? colors.lightDarkText : colors.tint }
                        ]}>
                            {isLoading ? 'Lagrer...' : 'Lagre'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Profile Image Section */}
                    <View style={styles.imageSection}>
                        <TouchableOpacity onPress={showImageOptions} style={styles.imageContainer}>
                            <Image source={{ uri: imageUri }} style={styles.profileImage} />
                            <View style={[styles.editImageOverlay, { backgroundColor: colors.tint }]}>
                                <Ionicons name="camera" size={20} color={colors.darkText} />
                            </View>
                        </TouchableOpacity>
                        <Text style={[styles.imageHint, { color: colors.lightDarkText }]}>
                            Trykk for å endre profilbilde
                        </Text>
                    </View>

                    {/* Name Section */}
                    <View style={styles.nameSection}>
                        <Text style={[styles.label, { color: colors.text }]}>Navn</Text>
                        <TextInput
                            style={[
                                styles.nameInput,
                                {
                                    backgroundColor: colors.contextBackground,
                                    color: colors.text,
                                    borderColor: colors.lightDarkText,
                                }
                            ]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Skriv inn navn"
                            placeholderTextColor={colors.lightDarkText}
                            maxLength={50}
                        />
                        <Text style={[styles.characterCount, { color: colors.lightDarkText }]}>
                            {name.length}/50
                        </Text>
                    </View>

                    {/* Additional Info */}
                    <View style={styles.infoSection}>
                        <Text style={[styles.infoText, { color: colors.lightDarkText }]}>
                            Ditt navn vil være synlig for andre medlemmer i dine husstander.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        paddingTop: 60, // Account for status bar
    },
    headerButton: {
        minWidth: 60,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '400',
    },
    saveText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'right',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    imageSection: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    editImageOverlay: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    imageHint: {
        fontSize: 14,
        textAlign: 'center',
    },
    nameSection: {
        marginTop: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    nameInput: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 8,
    },
    characterCount: {
        fontSize: 12,
        textAlign: 'right',
    },
    infoSection: {
        marginTop: 30,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
});
