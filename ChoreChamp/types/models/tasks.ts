export type Task = {
    assignedTo: string; // Reference to /collection/users
    createdBy: string;
    description: string;
    householdId: string;
    points: number;
    status: 'not done' | 'in progress' | 'completed';
    timeEnd: Date;
    timeStart: Date;
    title: string;
}