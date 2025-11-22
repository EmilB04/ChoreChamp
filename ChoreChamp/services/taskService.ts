import { db } from '@/lib/firebase';
import { addDoc, collection, doc, getDocs, Timestamp, updateDoc } from 'firebase/firestore';
import { getWeekInfo } from '@/utils/weekUtils';

export interface TaskData {
    id: string;
    title: string;
    description?: string;
    timeStart: Date;
    timeEnd: Date;
    assignedTo: string;  // User ID reference path like "/users/userId"
    createdBy: string;   // User ID reference path
    createdByName?: string; // Display name of creator
    createdByAvatar?: string; // Avatar URL of creator
    householdId: string;
    points: number;
    done: boolean;
    // Image evidence and verification (from main)
    imgEvidence?: string; // URL to image evidence when task is completed
    verificationStatus?: 'not_reviewed' | 'verified' | 'rejected'; // Admin verification status
    // Weekly leaderboard tracking (from leaderboard)
    completedAt?: Date;     // When was the task completed?
    completedBy?: string;   // User ID who completed it
    weekNumber?: number;    // ISO week number (1-53)
    year?: number;          // Year when completed
}

export interface CreateTaskInput {
    title: string;
    description?: string;
    timeStart: Date;
    timeEnd: Date;
    assignedTo: string;  // User ID
    createdBy: string;   // User ID
    createdByName: string; // Display name
    createdByAvatar: string; // Avatar URL
    householdId: string;
    points?: number;
}

/**
 * Fetch all tasks assigned to a specific user
 * @param userId - The user's document ID
 */
export async function getTasksForUser(userId: string): Promise<TaskData[]> {
    if (!userId) {
        return [];
    }
    
    try {
        const tasksRef = collection(db, 'tasks');
        
        // Fetch all tasks
        const querySnapshot = await getDocs(tasksRef);
        
        const tasks: TaskData[] = [];
        
        // Iterate through all tasks and check if assignedTo matches the user
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const assignedToField = data.assignedTo;
            
            // Handle different types of assignedTo field
            let assignedUserId = '';
            
            if (!assignedToField) {
                return; // Skip this task
            }
            
            // Check if it's a DocumentReference
            if (typeof assignedToField === 'object' && assignedToField.path) {
                // DocumentReference - extract ID from path
                const parts = assignedToField.path.split('/');
                assignedUserId = parts[parts.length - 1];
            } else if (typeof assignedToField === 'string') {
                // String - could be "/users/userId" or just "userId"
                if (assignedToField.includes('/')) {
                    const parts = assignedToField.split('/');
                    assignedUserId = parts[parts.length - 1];
                } else {
                    assignedUserId = assignedToField;
                }
            } else {
                return; // Skip this task
            }
            
            // Check if this task is assigned to the current user
            if (assignedUserId === userId) {
                
                // Convert Firestore timestamps to Date objects
                const timeStart = data.timeStart?.toDate ? data.timeStart.toDate() : new Date(data.timeStart);
                const timeEnd = data.timeEnd?.toDate ? data.timeEnd.toDate() : new Date(data.timeEnd);
                
                tasks.push({
                    id: docSnap.id,
                    title: data.title || 'Untitled Task',
                    description: data.description,
                    timeStart,
                    timeEnd,
                    assignedTo: data.assignedTo || '',
                    createdBy: data.createdBy || '',
                    createdByName: data.createdByName || '',
                    createdByAvatar: data.createdByAvatar || '',
                    householdId: data.householdId || '',
                    points: data.points || 0,
                    done: data.done || false,
                    imgEvidence: data.imgEvidence || '',
                    verificationStatus: data.verificationStatus || 'not_reviewed',
                });
            }
        });
        
        return tasks;
    } catch (error) {
        console.error('💥 Error fetching tasks for user:', error);
        return [];
    }
}

/**
 * Fetch all tasks for today assigned to a specific user
 * @param userId - The user's document ID
 */
export async function getTodayTasksForUser(userId: string): Promise<TaskData[]> {
    const allTasks = await getTasksForUser(userId);
    
    // Filter tasks that are scheduled for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayTasks = allTasks.filter(task => {
        const taskDate = new Date(task.timeStart);
        const taskDateOnly = new Date(taskDate);
        taskDateOnly.setHours(0, 0, 0, 0);
        
        const isToday = taskDateOnly.getTime() === today.getTime();
        
        return isToday;
    });
    
    return todayTasks;
}

/**
 * Mark a task as complete
 * @param taskId - The task's document ID
 * @param userId - The user ID who is completing the task
 * @param imgEvidence - URL to the uploaded image evidence
 */
export async function markTaskAsComplete(taskId: string, userId: string, imgEvidence: string): Promise<boolean> {
    if (!taskId || !userId || !imgEvidence) {
        console.error('❌ Task ID, user ID, and image evidence are required');
        return false;
    }
    
    try {
        const taskRef = doc(db, 'tasks', taskId);
        
        // Get current timestamp and week info
        const now = new Date();
        const { weekNumber, year } = getWeekInfo(now);
        
        await updateDoc(taskRef, {
            done: true,
            // Leaderboard tracking
            completedAt: Timestamp.fromDate(now),
            completedBy: userId,
            weekNumber: weekNumber,
            year: year,
            // Image evidence and verification
            imgEvidence: imgEvidence,
            verificationStatus: 'not_reviewed'
        });
        
        console.log(`✅ Task ${taskId} completed in week ${weekNumber} of ${year}`);
        
        return true;
    } catch (error) {
        console.error('💥 Error marking task as complete:', error);
        return false;
    }
}

/**
 * Mark a task as incomplete (undo completion)
 * @param taskId - The task's document ID
 */
export async function markTaskAsIncomplete(taskId: string): Promise<boolean> {
    if (!taskId) {
        return false;
    }
    
    try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
            done: false,
            // Remove completion tracking
            completedAt: null,
            completedBy: null,
            weekNumber: null,
            year: null,
            // Reset verification
            verificationStatus: 'not_reviewed'
        });
        
        console.log(`↩️ Task ${taskId} marked as incomplete`);
        
        return true;
    } catch (error) {
        console.error('💥 Error marking task as incomplete:', error);
        return false;
    }
}

/**
 * Verify a completed task (admin action)
 * @param taskId - The task's document ID
 */
export async function verifyTask(taskId: string): Promise<boolean> {
    if (!taskId) {
        return false;
    }
    
    try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
            verificationStatus: 'verified'
        });
        
        return true;
    } catch (error) {
        console.error('💥 Error verifying task:', error);
        return false;
    }
}

/**
 * Reject a completed task (admin action)
 * @param taskId - The task's document ID
 */
export async function rejectTask(taskId: string): Promise<boolean> {
    if (!taskId) {
        return false;
    }
    
    try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
            verificationStatus: 'rejected',
            done: false
        });
        
        return true;
    } catch (error) {
        console.error('💥 Error rejecting task:', error);
        return false;
    }
}

/**
 * Reset verification status back to not_reviewed (admin undo action)
 * @param taskId - The task's document ID
 */
export async function resetVerification(taskId: string): Promise<boolean> {
    if (!taskId) {
        return false;
    }
    
    try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
            verificationStatus: 'not_reviewed',
            done: true
        });
        
        return true;
    } catch (error) {
        console.error('💥 Error resetting verification:', error);
        return false;
    }
}

/**
 * Create a new task
 * @param taskInput - The task data to create
 * @returns The ID of the created task, or null if failed
 */
export async function createTask(taskInput: CreateTaskInput): Promise<string | null> {
    try {
        const tasksRef = collection(db, 'tasks');
        
        // Convert Date objects to Firestore Timestamps
        const taskData = {
            title: taskInput.title,
            description: taskInput.description || '',
            timeStart: Timestamp.fromDate(taskInput.timeStart),
            timeEnd: Timestamp.fromDate(taskInput.timeEnd),
            assignedTo: `/users/${taskInput.assignedTo}`,
            createdBy: `/users/${taskInput.createdBy}`,
            createdByName: taskInput.createdByName,
            createdByAvatar: taskInput.createdByAvatar,
            householdId: taskInput.householdId,
            points: taskInput.points || 0,
            done: false,
            status: 'not done' as const,
            imgEvidence: '',
            verificationStatus: 'not_reviewed' as const,
        };
        
        const docRef = await addDoc(tasksRef, taskData);
        
        return docRef.id;
    } catch (error) {
        console.error('💥 Error creating task:', error);
        return null;
    }
}
