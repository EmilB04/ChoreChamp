import { db } from '@/lib/firebase';
import { addDoc, collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { getWeekInfo } from '@/utils/weekUtils';

export interface TaskData {
    id: string;
    title: string;
    description?: string;
    timeStart: Date;
    timeEnd: Date;
    assignedTo: string;  // User ID reference path like "/users/userId"
    assignedToName?: string; // Display name of assigned user
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
            const assignedUserId = extractUserId(data.assignedTo);
            
            if (!assignedUserId) {
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
        console.error('Error fetching tasks for user:', error);
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
        console.error('Error marking task as complete:', error);
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
        console.error('Error marking task as incomplete:', error);
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
        console.error('Error verifying task:', error);
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
        console.error('Error rejecting task:', error);
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
        console.error('Error resetting verification:', error);
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
        console.error('Error creating task:', error);
        return null;
    }
}

/**
 * Weekly summary for history view
 */
export interface WeeklySummary {
    weekNumber: number;
    year: number;
    startDate: Date;
    endDate: Date;
    totalTasks: number;
    completedTasks: number;
    totalPoints: number;
    completedPoints: number;
    allCompleted: boolean;
    topContributor?: {
        userId: string;
        name: string;
        points: number;
    };
    tasks: TaskData[];
}

/**
 * Extract user ID from assignedTo field (handles DocumentReference and string formats)
 */
function extractUserId(assignedToField: any): string {
    if (!assignedToField) return '';
    
    // DocumentReference with path property
    if (typeof assignedToField === 'object' && assignedToField.path) {
        const parts = assignedToField.path.split('/');
        return parts[parts.length - 1];
    }
    
    // String - could be "/users/userId" or just "userId"
    if (typeof assignedToField === 'string') {
        if (assignedToField.includes('/')) {
            const parts = assignedToField.split('/');
            return parts[parts.length - 1];
        }
        return assignedToField;
    }
    
    return '';
}

/**
 * Get week number from a date (ISO 8601 week)
 */
function getWeekNumber(date: Date): { week: number; year: number } {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return { week: weekNo, year: d.getUTCFullYear() };
}

/**
 * Get start and end dates for a given week number and year
 */
function getWeekDates(weekNumber: number, year: number): { startDate: Date; endDate: Date } {
    const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    
    if (dow <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    
    const startDate = new Date(ISOweekStart);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
}

/**
 * Fetch all tasks for a household grouped by week
 * @param householdId - The household's document ID
 * @returns Array of weekly summaries
 */
export async function getWeeklySummariesForHousehold(householdId: string): Promise<WeeklySummary[]> {
    if (!householdId) {
        return [];
    }
    
    try {
        const tasksRef = collection(db, 'tasks');
        const householdQuery = query(tasksRef, where('householdId', '==', householdId));
        const querySnapshot = await getDocs(householdQuery);
        
        const tasks: TaskData[] = [];
        
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
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
        });
        
        // Collect all unique user IDs from assignedTo and createdBy fields
        const allUserIds = new Set<string>();
        tasks.forEach(task => {
            const assignedUserId = extractUserId(task.assignedTo);
            const createdByUserId = extractUserId(task.createdBy);
            if (assignedUserId) allUserIds.add(assignedUserId);
            if (createdByUserId) allUserIds.add(createdByUserId);
        });
        
        // Fetch all user data once and cache it
        const userDataCache = new Map<string, string>();
        if (allUserIds.size > 0) {
            const userDataPromises = Array.from(allUserIds).map(async (userId) => {
                try {
                    const userRef = doc(db, 'users', userId);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        return {
                            userId,
                            name: userData.username || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Ukjent bruker'
                        };
                    }
                } catch (error) {
                    console.error('Error fetching user data for:', userId, error);
                }
                return { userId, name: 'Ukjent bruker' };
            });
            
            const usersData = await Promise.all(userDataPromises);
            usersData.forEach(u => userDataCache.set(u.userId, u.name));
        }
        
        // Add user names to tasks
        tasks.forEach(task => {
            const assignedUserId = extractUserId(task.assignedTo);
            const createdByUserId = extractUserId(task.createdBy);
            task.assignedToName = userDataCache.get(assignedUserId) || 'Ukjent bruker';
            task.createdByName = userDataCache.get(createdByUserId) || 'Ukjent bruker';
        });
        
        // Group tasks by week
        const weekMap = new Map<string, TaskData[]>();
        
        tasks.forEach(task => {
            const { week, year } = getWeekNumber(task.timeStart);
            const weekKey = `${year}-W${week}`;
            
            if (!weekMap.has(weekKey)) {
                weekMap.set(weekKey, []);
            }
            weekMap.get(weekKey)?.push(task);
        });
        
        // Create weekly summaries
        const weeklySummaries: WeeklySummary[] = [];
        
        for (const [weekKey, weekTasks] of weekMap.entries()) {
            const [yearStr, weekStr] = weekKey.split('-W');
            const year = parseInt(yearStr);
            const weekNumber = parseInt(weekStr);
            
            const { startDate, endDate } = getWeekDates(weekNumber, year);
            
            const totalTasks = weekTasks.length;
            const completedTasks = weekTasks.filter(t => t.done).length;
            const totalPoints = weekTasks.reduce((sum, t) => sum + t.points, 0);
            const completedPoints = weekTasks.filter(t => t.done).reduce((sum, t) => sum + t.points, 0);
            const allCompleted = totalTasks > 0 && completedTasks === totalTasks;
            
            // Calculate top contributor (by completed task points)
            const contributorMap = new Map<string, number>();
            
            weekTasks.forEach(task => {
                if (task.done) {
                    const userId = extractUserId(task.assignedTo);
                    if (userId) {
                        const existing = contributorMap.get(userId) || 0;
                        contributorMap.set(userId, existing + task.points);
                    }
                }
            });
            
            let topContributor: WeeklySummary['topContributor'] = undefined;
            
            // Calculate top contributor using cached user data
            if (contributorMap.size > 0) {
                let maxPoints = 0;
                
                contributorMap.forEach((points, userId) => {
                    if (points > maxPoints) {
                        maxPoints = points;
                        const userName = userDataCache.get(userId) || 'Ukjent bruker';
                        topContributor = {
                            userId,
                            name: userName,
                            points: points
                        };
                    }
                });
            }
            
            weeklySummaries.push({
                weekNumber,
                year,
                startDate,
                endDate,
                totalTasks,
                completedTasks,
                totalPoints,
                completedPoints,
                allCompleted,
                topContributor,
                tasks: weekTasks
            });
        }
        
        // Sort by week (newest first)
        weeklySummaries.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.weekNumber - a.weekNumber;
        });
        
        return weeklySummaries;
    } catch (error) {
        console.error('Error fetching weekly summaries:', error);
        return [];
    }
}
