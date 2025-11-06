import { db } from '@/lib/firebase';
import { collection, doc, DocumentReference, getDoc, getDocs, query, where } from 'firebase/firestore';

export interface Household {
    id: string;
    familyName: string;
    familyMembers: string[];
    points: Record<string, number>;
}

/**
 * Fetch all households where the user is a member
 * Queries the households collection by familyMembers array
 * @param userId - The user's document ID
 */
export async function getHouseholdsForUser(userId: string): Promise<Household[]> {
    console.log('🏠 getHouseholdsForUser called with userId:', userId);
    
    if (!userId) {
        console.log('⚠️ No userId provided');
        return [];
    }
    
    try {
        const householdsRef = collection(db, 'households');
        
        // Try different path formats that might be stored in familyMembers
        const possiblePaths = [
            `/user/${userId}`,
            `/users/${userId}`,
            userId,
        ];
        
        console.log('🔍 Querying households with possible user paths:', possiblePaths);
        
        const households: Household[] = [];
        const foundIds = new Set<string>(); // Track IDs to avoid duplicates
        
        // Try each possible path format
        for (const path of possiblePaths) {
            const q = query(householdsRef, where('familyMembers', 'array-contains', path));
            const querySnapshot = await getDocs(q);
            
            querySnapshot.forEach((docSnap) => {
                if (!foundIds.has(docSnap.id)) {
                    const data = docSnap.data();
                    console.log(`✅ Found household with path "${path}":`, data.familyName);
                    households.push({
                        id: docSnap.id,
                        familyName: data.familyName || 'Ukjent husstand',
                        familyMembers: data.familyMembers || [],
                        points: data.points || {},
                    });
                    foundIds.add(docSnap.id);
                }
            });
        }
        
        console.log(`✅ Total households found: ${households.length}`);
        return households;
    } catch (error) {
        console.error('💥 Error fetching households for user:', error);
        return [];
    }
}

/**
 * Fetch households from an array of household references (from user.household field)
 * @param householdRefs - Array of Firestore DocumentReferences or reference paths
 */
export async function getUserHouseholds(householdRefs: (DocumentReference | string)[]): Promise<Household[]> {
    console.log('🏠 getUserHouseholds called with:', householdRefs);
    
    if (!householdRefs || householdRefs.length === 0) {
        console.log('⚠️ No household references provided');
        return [];
    }
    
    try {
        const households: Household[] = [];
        
        // Fetch each household
        for (const ref of householdRefs) {
            let householdDoc;
            
            // Handle both DocumentReference and string path formats
            if (typeof ref === 'string') {
                // Extract household ID from path like "/households/NMogPiBLWF4nmwsHBTlP"
                const householdId = ref.split('/').pop();
                if (householdId) {
                    householdDoc = await getDoc(doc(db, 'households', householdId));
                }
            } else if (ref && typeof ref === 'object' && 'path' in ref) {
                // It's a DocumentReference
                householdDoc = await getDoc(ref as DocumentReference);
            }
            
            if (householdDoc && householdDoc.exists()) {
                const data = householdDoc.data();
                households.push({
                    id: householdDoc.id,
                    familyName: data.familyName || 'Ukjent husstand',
                    familyMembers: data.familyMembers || [],
                    points: data.points || {},
                });
                console.log('✅ Fetched household:', data.familyName);
            } else {
                console.warn('⚠️ Household not found for reference:', ref);
            }
        }
        
        console.log(`✅ Total households fetched: ${households.length}`);
        return households;
    } catch (error) {
        console.error('💥 Error fetching households:', error);
        return [];
    }
}

/**
 * Fetch a single household by ID
 */
export async function getHouseholdById(householdId: string): Promise<Household | null> {
    console.log('🏠 getHouseholdById called with:', householdId);
    
    try {
        const householdDoc = await getDoc(doc(db, 'households', householdId));
        
        if (householdDoc.exists()) {
            const data = householdDoc.data();
            return {
                id: householdDoc.id,
                familyName: data.familyName || 'Ukjent husstand',
                familyMembers: data.familyMembers || [],
                points: data.points || {},
            };
        }
        
        console.warn('⚠️ Household not found:', householdId);
        return null;
    } catch (error) {
        console.error('💥 Error fetching household:', error);
        return null;
    }
}

/**
 * Fetch all members of a household with their user data and points
 */
export async function getHouseholdMembers(householdId: string): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    imageUri: string;
    points: number;
}[]> {
    console.log('👥 getHouseholdMembers called with householdId:', householdId);
    
    try {
        // Query all users who have this household in their household array
        const usersRef = collection(db, 'users');
        const householdRef = doc(db, 'households', householdId);
        
        // Query users where household array contains reference to this household
        const q = query(usersRef, where('household', 'array-contains', householdRef));
        const querySnapshot = await getDocs(q);
        
        const members: {
            id: string;
            firstName: string;
            lastName: string;
            username: string;
            imageUri: string;
            points: number;
        }[] = [];
        
        querySnapshot.forEach((userDoc) => {
            const data = userDoc.data();
            members.push({
                id: userDoc.id,
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                username: data.username || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
                imageUri: data.imageUri || '',
                points: data.points || 0,
            });
            console.log(`✅ Fetched member: ${data.firstName} ${data.lastName} (${data.points} pts)`);
        });
        
        console.log(`✅ Total members fetched: ${members.length}`);
        return members;
    } catch (error) {
        console.error('💥 Error fetching household members:', error);
        return [];
    }
}
