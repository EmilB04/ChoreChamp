import { Timestamp } from "firebase/firestore";

export type Notification = {
    created: Timestamp;
    isRead: boolean;
    message: string;
    title: string;
    type: 'info' | 'new task' | 'alert';
    userId: string;
}