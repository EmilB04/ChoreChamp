export type Task = {
    createdBy: string;
    description: string;
    householdId: string;
    points: number;
    status: 'pending' | 'in progress' | 'completed';
    title: string;
}