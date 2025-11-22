import i18n from '@/app/i18n/i18n';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Linking, Platform } from 'react-native';

export type PermissionType = 'camera' | 'mediaLibrary';

interface PermissionResult {
  granted: boolean;
  canAskAgain: boolean;
}

/**
 * Request camera permission with native dialog
 * Returns true if permission is granted, false otherwise
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();
    
    if (status === 'granted') {
      return true;
    }

    // If user denied and we can't ask again (permanent denial), show settings option
    if (!canAskAgain) {
      showPermissionDeniedAlert('camera');
      return false;
    }

    // User denied but we can ask again
    return false;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    const errorText = i18n.t('permissions:error');
    const couldNotRequestText = i18n.t('permissions:couldNotRequestPermission');
    Alert.alert(errorText, couldNotRequestText);
    return false;
  }
}

/**
 * Request media library permission with native dialog
 * Returns true if permission is granted, false otherwise
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  try {
    const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
    
    if (status === 'granted') {
      return true;
    }

    // If user denied and we can't ask again (permanent denial), show settings option
    if (!canAskAgain) {
      showPermissionDeniedAlert('mediaLibrary');
      return false;
    }

    // User denied but we can ask again
    return false;
  } catch (error) {
    console.error('Error requesting media library permission:', error);
    const errorText = i18n.t('permissions:error');
    const couldNotRequestText = i18n.t('permissions:couldNotRequestPermission');
    Alert.alert(errorText, couldNotRequestText);
    return false;
  }
}

/**
 * Check if camera permission is granted
 */
export async function checkCameraPermission(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await Camera.getCameraPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain,
    };
  } catch (error) {
    console.error('Error checking camera permission:', error);
    return { granted: false, canAskAgain: true };
  }
}

/**
 * Check if media library permission is granted
 */
export async function checkMediaLibraryPermission(): Promise<PermissionResult> {
  try {
    const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain,
    };
  } catch (error) {
    console.error('Error checking media library permission:', error);
    return { granted: false, canAskAgain: true };
  }
}

/**
 * Show alert when permission is permanently denied
 * Offers to open app settings
 */
function showPermissionDeniedAlert(type: PermissionType) {
  const title = i18n.t(`permissions:${type}.title`);
  const message = i18n.t(`permissions:${type}.message`);
  const cancelText = i18n.t('permissions:cancel');
  const openSettingsText = i18n.t('permissions:openSettings');
  const errorText = i18n.t('permissions:error');
  const couldNotOpenSettingsText = i18n.t('permissions:couldNotOpenSettings');

  Alert.alert(
    title,
    message,
    [
      { text: cancelText, style: 'cancel' },
      {
        text: openSettingsText,
        onPress: async () => {
          try {
            if (Platform.OS === 'ios') {
              await Linking.openURL('app-settings:');
            } else {
              await Linking.openSettings();
            }
          } catch (error) {
            console.error('Error opening settings:', error);
            Alert.alert(errorText, couldNotOpenSettingsText);
          }
        },
      },
    ],
    { cancelable: true }
  );
}

/**
 * Request permission with better UX - checks first, then requests if needed
 */
export async function requestPermissionWithCheck(type: PermissionType): Promise<boolean> {
  try {
    // First check current permission status
    const checkFn = type === 'camera' ? checkCameraPermission : checkMediaLibraryPermission;
    const { granted, canAskAgain } = await checkFn();

    // Already granted
    if (granted) {
      return true;
    }

    // Can't ask again (permanently denied)
    if (!canAskAgain) {
      showPermissionDeniedAlert(type);
      return false;
    }

    // Request permission
    const requestFn = type === 'camera' ? requestCameraPermission : requestMediaLibraryPermission;
    return await requestFn();
  } catch (error) {
    console.error(`Error in requestPermissionWithCheck for ${type}:`, error);
    return false;
  }
}
