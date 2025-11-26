/*
    Task model definitions for the ChoreChamp application.
    These types define the structure of task-related data used throughout the app.
*/

export type Task = {
    assignedTo: string; // Reference to /collection/users
    createdBy: string;
    createdByName: string; // Display name of the creator
    createdByAvatar: string; // Avatar URL of the creator
    description: string;
    householdId: string;
    points: number;
    status: 'not done' | 'in progress' | 'completed';
    timeEnd: Date;
    timeStart: Date;
    title: string;
    // Image evidence and verification (from main)
    imgEvidence?: string; // URL to image evidence when task is completed
    verificationStatus?: 'not_reviewed' | 'verified' | 'rejected'; // Admin verification status
    // Weekly leaderboard tracking (from leaderboard)
    completedAt?: Date;     // When was the task completed?
    completedBy?: string;   // User ID who completed it
    weekNumber?: number;    // ISO week number (1-53)
    year?: number;          // Year when completed
}