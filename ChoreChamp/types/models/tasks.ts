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
    // Weekly leaderboard tracking
    completedAt?: Date;     // When was the task completed?
    completedBy?: string;   // User ID who completed it
    weekNumber?: number;    // ISO week number (1-53)
    year?: number;          // Year when completed
}