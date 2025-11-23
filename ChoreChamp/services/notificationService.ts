import { db } from '@/lib/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';

export interface NotificationData {
    title: string;
    subtitle?: string;
    message: string;
    timestamp: Date;
    read: boolean;
    type: 'task_assigned' | 'task_completed';
    avatar: string;
    points?: number | null;
    householdId: string;
    userId: string; // Who should see this notification
}

export async function createNotification(notification: NotificationData): Promise<string | null> {
    try {
        const notificationsRef = collection(db, 'notifications');
        const notificationData = {
            ...notification,
            timestamp: Timestamp.fromDate(notification.timestamp),
        };
        const docRef = await addDoc(notificationsRef, notificationData);
        return docRef.id;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}
