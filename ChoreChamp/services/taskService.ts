import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export interface TaskData {
    id: string;
    title: string;
    description?: string;
    timeStart: Date;
    timeEnd: Date;
    assignedTo: string;  // User ID reference path like "/users/userId"
    createdBy: string;   // User ID reference path
    householdId: string;
    points: number;
    done: boolean;
}

/**
 * Fetch all tasks assigned to a specific user
 * @param userId - The user's document ID
 */
export async function getTasksForUser(userId: string): Promise<TaskData[]> {
    console.log('📋 getTasksForUser called with userId:', userId);
    
    if (!userId) {
        console.log('⚠️ No userId provided');
        return [];
    }
    
    try {
        const tasksRef = collection(db, 'tasks');
        
        // Try different path formats for assignedTo field
        const possiblePaths = [
            `/users/${userId}`,
            `/user/${userId}`,
            userId,
        ];
        
        console.log('🔍 Querying tasks with possible user paths:', possiblePaths);
        
        const tasks: TaskData[] = [];
        const foundIds = new Set<string>(); // Track IDs to avoid duplicates
        
        // Try each possible path format
        for (const path of possiblePaths) {
            const q = query(tasksRef, where('assignedTo', '==', path));
            const querySnapshot = await getDocs(q);
            
            querySnapshot.forEach((docSnap) => {
                if (!foundIds.has(docSnap.id)) {
                    const data = docSnap.data();
                    console.log(`✅ Found task with path "${path}":`, data.title);
                    
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
                        householdId: data.householdId || '',
                        points: data.points || 0,
                        done: data.done || false,
                    });
                    foundIds.add(docSnap.id);
                }
            });
        }
        
        console.log(`✅ Total tasks found: ${tasks.length}`);
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
    console.log('📅 getTodayTasksForUser called with userId:', userId);
    
    const allTasks = await getTasksForUser(userId);
    
    // Filter tasks that are scheduled for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayTasks = allTasks.filter(task => {
        const taskDate = new Date(task.timeStart);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
    });
    
    console.log(`✅ Tasks for today: ${todayTasks.length}`);
    return todayTasks;
}
