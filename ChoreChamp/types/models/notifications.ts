/*
    Notification model definitions for the ChoreChamp application.
    These types define the structure of notification-related data used throughout the app.
*/

import { Timestamp } from "firebase/firestore";

export type Notification = {
    created: Timestamp;
    isRead: boolean;
    message: string;
    title: string;
    type: 'info' | 'new task' | 'alert';
    userId: string;
}