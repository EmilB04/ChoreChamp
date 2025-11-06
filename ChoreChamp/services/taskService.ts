import { db } from '@/lib/firebase';
import { addDoc, collection, doc, getDocs, Timestamp, updateDoc } from 'firebase/firestore';

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

export interface CreateTaskInput {
    title: string;
    description?: string;
    timeStart: Date;
    timeEnd: Date;
    assignedTo: string;  // User ID
    createdBy: string;   // User ID
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
                    householdId: data.householdId || '',
                    points: data.points || 0,
                    done: data.done || false,
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
 */
export async function markTaskAsComplete(taskId: string): Promise<boolean> {
    if (!taskId) {
        return false;
    }
    
    try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
            done: true
        });
        
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
            done: false
        });
        
        return true;
    } catch (error) {
        console.error('💥 Error marking task as incomplete:', error);
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
            householdId: taskInput.householdId,
            points: taskInput.points || 0,
            done: false,
            status: 'not done' as const,
        };
        
        const docRef = await addDoc(tasksRef, taskData);
        
        return docRef.id;
    } catch (error) {
        console.error('💥 Error creating task:', error);
        return null;
    }
}
