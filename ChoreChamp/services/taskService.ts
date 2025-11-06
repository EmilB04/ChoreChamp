import { db } from '@/lib/firebase';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';

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
        
        console.log('🔍 Fetching all tasks from database...');
        
        // Fetch all tasks
        const querySnapshot = await getDocs(tasksRef);
        
        console.log(`� Total tasks in database: ${querySnapshot.size}`);
        
        const tasks: TaskData[] = [];
        
        // Iterate through all tasks and check if assignedTo matches the user
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const assignedToField = data.assignedTo;
            
            // Handle different types of assignedTo field
            let assignedUserId = '';
            
            if (!assignedToField) {
                console.log(`⚠️ Task "${data.title}" has no assignedTo field`);
                return; // Skip this task
            }
            
            // Check if it's a DocumentReference
            if (typeof assignedToField === 'object' && assignedToField.path) {
                // DocumentReference - extract ID from path
                const parts = assignedToField.path.split('/');
                assignedUserId = parts[parts.length - 1];
                console.log(`🔍 Task "${data.title}": assignedTo is DocumentReference with path="${assignedToField.path}", extracted ID="${assignedUserId}"`);
            } else if (typeof assignedToField === 'string') {
                // String - could be "/users/userId" or just "userId"
                if (assignedToField.includes('/')) {
                    const parts = assignedToField.split('/');
                    assignedUserId = parts[parts.length - 1];
                } else {
                    assignedUserId = assignedToField;
                }
                console.log(`🔍 Task "${data.title}": assignedTo is string="${assignedToField}", extracted ID="${assignedUserId}"`);
            } else {
                console.log(`⚠️ Task "${data.title}" has unexpected assignedTo type:`, typeof assignedToField);
                return; // Skip this task
            }
            
            // Check if this task is assigned to the current user
            if (assignedUserId === userId) {
                console.log(`✅ Task "${data.title}" is assigned to current user!`);
                
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
            } else {
                console.log(`⏭️  Task "${data.title}" is NOT assigned to current user (assigned to: ${assignedUserId})`);
            }
        });
        
        console.log(`✅ Total tasks found for user: ${tasks.length}`);
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
    
    console.log(`📋 Total tasks found for user: ${allTasks.length}`);
    
    // Filter tasks that are scheduled for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log(`📅 Today's date: ${today.toLocaleDateString()}`);
    
    const todayTasks = allTasks.filter(task => {
        const taskDate = new Date(task.timeStart);
        const taskDateOnly = new Date(taskDate);
        taskDateOnly.setHours(0, 0, 0, 0);
        
        const isToday = taskDateOnly.getTime() === today.getTime();
        
        console.log(`🔍 Task "${task.title}": scheduled for ${taskDate.toLocaleDateString()} ${taskDate.toLocaleTimeString()}, isToday: ${isToday}`);
        
        return isToday;
    });
    
    console.log(`✅ Tasks for today: ${todayTasks.length}`);
    return todayTasks;
}

/**
 * Mark a task as complete
 * @param taskId - The task's document ID
 */
export async function markTaskAsComplete(taskId: string): Promise<boolean> {
    console.log('✅ markTaskAsComplete called with taskId:', taskId);
    
    if (!taskId) {
        console.log('⚠️ No taskId provided');
        return false;
    }
    
    try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
            done: true
        });
        
        console.log(`✅ Task ${taskId} marked as complete`);
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
    console.log('↩️ markTaskAsIncomplete called with taskId:', taskId);
    
    if (!taskId) {
        console.log('⚠️ No taskId provided');
        return false;
    }
    
    try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
            done: false
        });
        
        console.log(`↩️ Task ${taskId} marked as incomplete`);
        return true;
    } catch (error) {
        console.error('💥 Error marking task as incomplete:', error);
        return false;
    }
}
