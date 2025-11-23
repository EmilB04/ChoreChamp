export type Household = {
    familyName: string;
    familyMembers: string[];
    adminUsers: string[];
    points: Record<string, number>;
}