import AvatarCreatorModal from "@/components/modals/AvatarCreatorModal";
import { useTheme } from "@/contexts/ThemeContext";
import {
  AvatarData,
  createDicebearUri,
  generateAvatarSvg,
  isDicebearAvatar,
  parseDicebearUri,
} from "@/lib/avatarUtils";
import { requestPermissionWithCheck } from "@/lib/permissionUtils";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    currentUsername: string;
    currentImageUri: string;
    onSave: (username: string, imageUri: string) => Promise<void>;
}

export default function EditProfileModal({
    visible,
    onClose,
    currentUsername,
    currentImageUri,
    onSave,
}: EditProfileModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation('app');
  const [username, setUsername] = useState(currentUsername);
  const [imageUri, setImageUri] = useState(currentImageUri);
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

    const handleSave = async () => {
        if (username.trim() === '') {
          Alert.alert(t('profile.editProfileForm.errors.emptyTitle'), t('profile.editProfileForm.errors.empty'));
            return;
        }
        
        try {
            setIsLoading(true);
            await onSave(username.trim(), imageUri);
            
            // Close modal first
            onClose();
            
            // Then show success message
            Alert.alert(t('profile.editProfileForm.successTitle'), t('profile.editProfileForm.successMessage'));
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert(t('profile.editProfileForm.errorTitle'), t('profile.editProfileForm.errorMessage'));
        } finally {
            setIsLoading(false); 
        }
    };

    const handleCancel = () => {
        // Reset to original values
        setUsername(currentUsername);
        setImageUri(currentImageUri);
        onClose();
    };

  const pickImage = async () => {
    try {
      // Request permission using native MediaLibrary API with better UX
      const hasPermission = await requestPermissionWithCheck('mediaLibrary');

      if (!hasPermission) {
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

            if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert(t('profile.editProfileForm.errorTitle'), t('profile.editProfileForm.errorPickImage'));
            console.error('Error picking image:', error);
        }
    };

  const takePhoto = async () => {
    try {
      // Request permission using native Camera API with better UX
      const hasPermission = await requestPermissionWithCheck('camera');

      if (!hasPermission) {
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
      Alert.alert(t('profile.editProfileForm.errorTitle'), t('profile.editProfileForm.errorTakePhoto'));
            console.error('Error taking photo:', error);
    }
  };

  const handleAvatarSave = (avatarData: AvatarData) => {
    const uri = createDicebearUri(avatarData);
    setImageUri(uri);
    setShowAvatarModal(false);
  };

  const showImageOptions = () => {
    Alert.alert(
      t('profile.editProfileForm.selectImageTitle'),
      t('profile.editProfileForm.selectImageMessage'),
      [
        { text: t('profile.editProfileForm.gallery'), onPress: pickImage },
        { text: t('profile.editProfileForm.camera'), onPress: takePhoto },
        { text: t('profile.editProfileForm.avatar'), onPress: () => setShowAvatarModal(true) },
        { text: t('profile.cancel'), style: 'cancel' },
      ]
    );
  };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleCancel}
            accessibilityViewIsModal={true}
        >
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: colors.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                importantForAccessibility="yes"
            >
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.contextBackground }]}>
                  <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                    <Text style={[styles.cancelText, { color: colors.text }]}>{t('profile.cancel')}</Text>
                  </TouchableOpacity>

                  <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.editProfile')}</Text>

                  <TouchableOpacity 
                    onPress={handleSave} 
                    style={styles.headerButton}
                    disabled={isLoading}
                  >
                    <Text style={[
                      styles.saveText, 
                      { color: isLoading ? colors.lightDarkText : colors.tint }
                    ]}>
                      {isLoading ? t('profile.saving') : t('profile.save')}
                    </Text>
                  </TouchableOpacity>
                </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Image Section */}
          <View style={styles.imageSection}>
            <TouchableOpacity
              onPress={showImageOptions}
              style={styles.imageContainer}
            >
              {!imageUri ? (
                <View style={[styles.profileImage, {alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tint}]}>
                  <Ionicons name="person" size={80} color={colors.darkText} />
                </View>
              ) : isDicebearAvatar(imageUri) ? (
              <View
                style={[
                  styles.profileImage,
                  {
                    borderRadius: 60,
                    overflow: "hidden",
                  },
                ]}
              >
                <SvgXml
                  xml={generateAvatarSvg(parseDicebearUri(imageUri)!)}
                  width={120}
                  height={120}
                />
              </View>
              ) : (
                <Image source={{ uri: imageUri }} style={styles.profileImage} />
              )}
              <View
                style={[
                  styles.editImageOverlay,
                  { backgroundColor: colors.tint },
                ]}
              >
                <Ionicons name="camera" size={20} color={colors.darkText} />
              </View>
            </TouchableOpacity>
              <Text style={[styles.imageHint, { color: colors.lightDarkText }]}> 
                {t('profile.editProfileForm.imageHint')}
              </Text>
          </View>

                    {/* Username Section */}
                    <View style={styles.nameSection}>
                        <Text style={[styles.label, { color: colors.text }]}>{t('profile.editProfileForm.usernameLabel')}</Text>
                        <TextInput
                            style={[
                                styles.nameInput,
                                {
                                    backgroundColor: colors.contextBackground,
                                    color: colors.text,
                                    borderColor: colors.lightDarkText,
                                }
                            ]}
                            value={username}
                            onChangeText={setUsername}
                          placeholder={t('profile.editProfileForm.usernamePlaceholder')}
                            placeholderTextColor={colors.lightDarkText}
                            maxLength={30}
                        />
                        <Text style={[styles.characterCount, { color: colors.lightDarkText }]}>
                            {username.length}/30
                        </Text>
                    </View>

          {/* Additional Info */}
          <View style={styles.infoSection}>
              <Text style={[styles.imageHint, { color: colors.lightDarkText }]}> 
                {t('profile.editProfileForm.usernameHint')}
              </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AvatarCreatorModal
        visible={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onSave={handleAvatarSave}
        initialAvatarData={
          isDicebearAvatar(imageUri)
            ? parseDicebearUri(imageUri) ?? undefined
            : undefined
        }
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontWeight: "400",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageSection: {
    alignItems: "center",
    paddingVertical: 40,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  editImageOverlay: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  imageHint: {
    fontSize: 14,
    textAlign: "center",
  },
  nameSection: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
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
    textAlign: "right",
  },
  infoSection: {
    marginTop: 30,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
