import { db } from '@/lib/firebase';
import { addDoc, arrayUnion, collection, doc, DocumentReference, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';

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
        });
        
        return members;
    } catch (error) {
        console.error('💥 Error fetching household members:', error);
        return [];
    }
}

/**
 * Create a new household
 * @param familyName - Name of the household
 * @param creatorId - User ID of the creator
 * @returns The created household ID
 */
export async function createHousehold(familyName: string, creatorId: string): Promise<string | null> {
    console.log('🏠 createHousehold called with:', { familyName, creatorId });
    
    try {
        // Create the household document
        const householdsRef = collection(db, 'households');
        const newHousehold = {
            familyName: familyName.trim(),
            familyMembers: [`/users/${creatorId}`],
            points: {},
            createdAt: new Date(),
            createdBy: creatorId,
        };
        
        const docRef = await addDoc(householdsRef, newHousehold);
        console.log('✅ Household created with ID:', docRef.id);
        
        // Add household reference to user's household array
        const userRef = doc(db, 'users', creatorId);
        const householdRef = doc(db, 'households', docRef.id);
        await updateDoc(userRef, {
            household: arrayUnion(householdRef)
        });
        console.log('✅ Added household reference to user');
        
        return docRef.id;
    } catch (error) {
        console.error('💥 Error creating household:', error);
        return null;
    }
}

/**
 * Join an existing household using a household code
 * @param householdCode - The household ID code (e.g., "NMogPiBLWF4nmwsHBTlP")
 * @param userId - User ID of the person joining
 * @returns Success status
 */
export async function joinHousehold(householdCode: string, userId: string): Promise<{ success: boolean; error?: string; householdName?: string }> {
    console.log('🏠 joinHousehold called with:', { householdCode, userId });
    
    try {
        // Check if household exists
        const householdRef = doc(db, 'households', householdCode);
        const householdDoc = await getDoc(householdRef);
        
        if (!householdDoc.exists()) {
            console.warn('⚠️ Household not found:', householdCode);
            return { success: false, error: 'Husstand ikke funnet. Sjekk koden og prøv igjen.' };
        }
        
        const householdData = householdDoc.data();
        const userPath = `/users/${userId}`;
        
        // Check if user is already a member
        if (householdData.familyMembers && householdData.familyMembers.includes(userPath)) {
            console.log('⚠️ User already a member of this household');
            return { success: false, error: 'Du er allerede medlem av denne husstanden.' };
        }
        
        // Add user to household's familyMembers
        await updateDoc(householdRef, {
            familyMembers: arrayUnion(userPath)
        });
        console.log('✅ Added user to household familyMembers');
        
        // Add household reference to user's household array
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            household: arrayUnion(householdRef)
        });
        console.log('✅ Added household reference to user');
        
        return { 
            success: true, 
            householdName: householdData.familyName || 'Husstand' 
        };
    } catch (error) {
        console.error('💥 Error joining household:', error);
        return { success: false, error: 'En feil oppstod. Vennligst prøv igjen.' };
    }
}

/**
 * Leave a household
 * @param householdId - The household ID to leave
 * @param userId - User ID of the person leaving
 * @returns Success status
 */
export async function leaveHousehold(householdId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    console.log('🏠 leaveHousehold called with:', { householdId, userId });
    
    try {
        const householdRef = doc(db, 'households', householdId);
        const householdDoc = await getDoc(householdRef);
        
        if (!householdDoc.exists()) {
            return { success: false, error: 'Husstand ikke funnet.' };
        }
        
        const householdData = householdDoc.data();
        const userPath = `/users/${userId}`;
        
        // Remove user from household's familyMembers
        const updatedMembers = (householdData.familyMembers || []).filter(
            (member: string) => member !== userPath
        );
        
        await updateDoc(householdRef, {
            familyMembers: updatedMembers
        });
        console.log('✅ Removed user from household familyMembers');
        
        // Remove household reference from user's household array
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const updatedHouseholds = (userData.household || []).filter((ref: DocumentReference | string) => {
                if (typeof ref === 'string') {
                    return !ref.includes(householdId);
                } else if (ref && typeof ref === 'object' && 'id' in ref) {
                    return (ref as any).id !== householdId;
                }
                return true;
            });
            
            await updateDoc(userRef, {
                household: updatedHouseholds
            });
            console.log('✅ Removed household reference from user');
        }
        
        return { success: true };
    } catch (error) {
        console.error('💥 Error leaving household:', error);
        return { success: false, error: 'En feil oppstod. Vennligst prøv igjen.' };
    }
}
