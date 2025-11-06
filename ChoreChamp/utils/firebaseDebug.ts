/**
 * 🧪 Firebase Connection Debugger
 * 
 * This utility helps diagnose Firebase connection and query issues.
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

/**
 * Test Firebase connection and list all users in the collection
 */
export async function debugFirebaseConnection() {
    console.log('🔍 ===== FIREBASE CONNECTION DEBUG =====');
    
    try {
        // Check if db is initialized
        console.log('1: Database initialized:', !!db);
        console.log('   Database type:', db ? typeof db : 'undefined');
        
        if (!db) {
            console.error('❌ Firestore database is not initialized!');
            return;
        }
        
        // Try to list users collection
        console.log('\n2: Attempting to list users collection...');
        const usersRef = collection(db, 'users');
        console.log('   Collection reference created:', usersRef.path);
        
        // Get first 5 users
        const q = query(usersRef, limit(5));
        const querySnapshot = await getDocs(q);
        
        console.log('\n3️⃣ Query completed!');
        console.log('   Documents found:', querySnapshot.size);
        
        if (querySnapshot.empty) {
            console.warn('⚠️ Users collection is EMPTY!');
            console.warn('💡 Make sure you have documents in the "users" collection in Firebase Console');
        } else {
            console.log('\n4: Available users in Firestore:');
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                console.log(`   📄 ID: ${doc.id}`);
                console.log(`      Name: ${data.firstName || 'N/A'} ${data.lastName || 'N/A'}`);
                console.log(`      Email: ${data.email || 'N/A'}`);
            });
        }
        
        console.log('\n✅ Firebase connection is working!');
        
    } catch (error) {
        console.error('\n💥 Firebase connection ERROR:');
        console.error('   Message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('   Full error:', error);
        
        if (error instanceof Error) {
            if (error.message.includes('Missing or insufficient permissions')) {
                console.error('\n🔒 PERMISSIONS ERROR:');
                console.error('   Your Firebase security rules may be blocking access.');
                console.error('   Check: https://console.firebase.google.com > Firestore > Rules');
            } else if (error.message.includes('network')) {
                console.error('\n🌐 NETWORK ERROR:');
                console.error('   Check your internet connection or Firebase configuration.');
            }
        }
    }
    
    console.log('===== END DEBUG =====\n');
}

/**
 * Quick test to check if a specific user ID exists
 */
export async function checkUserExists(userId: string): Promise<boolean> {
    console.log(`🔍 Checking if user exists: ${userId}`);
    
    try {
        const { doc, getDoc } = await import('firebase/firestore');
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        
        const exists = userDoc.exists();
        console.log(exists ? '✅ User exists!' : '❌ User does NOT exist');
        
        return exists;
    } catch (error) {
        console.error('❌ Error checking user:', error);
        return false;
    }
}
