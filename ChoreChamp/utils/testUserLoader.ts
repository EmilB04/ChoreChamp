/**
 * 🧪 TEST UTILITY: Force load a specific user for testing
 * 
 * This utility allows you to bypass authentication and load any user's data
 * directly from Firestore for testing purposes.
 * 
 * Usage:
 * ```typescript
 * import { testLoadUser } from '@/utils/testUserLoader';
 * 
 * // In your component or test:
 * await testLoadUser('actual-user-id-from-firestore');
 * ```
 * 
 * To find a user ID:
 * 1. Go to Firebase Console > Firestore Database
 * 2. Click on the 'users' collection
 * 3. Copy any document ID
 * 
 * Note: This file was create by Claude 4.5 to help with testing user loading.
 * Prompt: "Create a test utility to load any user from Firestore by ID for testing purposes."
 * Result: See functions below.
 */

import { getUserData } from '@/services/userService';

/**
 * Load a specific user's data directly from Firestore
 * @param userId The Firestore document ID of the user to load
 * @returns User data or null if not found
 */
export async function testLoadUser(userId: string) {
    console.log('🧪 TEST MODE: Force loading user:', userId);
    
    try {
        const userData = await getUserData(userId);
        
        if (userData) {
            console.log('✅ User loaded successfully:', {
                id: userData.id,
                name: `${userData.firstName} ${userData.lastName}`,
                email: userData.email,
                phone: userData.phone,
                hasImage: !!userData.imageUri,
            });
            return userData;
        } else {
            console.error('❌ User not found with ID:', userId);
            return null;
        }
    } catch (error) {
        console.error('❌ Error loading test user:', error);
        return null;
    }
}

/**
 * Common test user IDs - Add your actual user IDs here
 */
export const TEST_USER_IDS = {
    // Example: uncomment and add real IDs from your Firestore
    // ADMIN_USER: 'abc123def456',
    // REGULAR_USER: 'xyz789uvw012',
    // TEST_USER_1: 'test123',
};
