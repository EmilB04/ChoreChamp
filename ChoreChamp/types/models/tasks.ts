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
    imgEvidence?: string; // URL to image evidence when task is completed
}