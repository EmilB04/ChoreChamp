/*
    Household model definitions for the ChoreChamp application.
    These types define the structure of household-related data used throughout the app.
*/

export type Household = {
    familyName: string;
    familyMembers: string[];
    adminUsers: string[];
    points: Record<string, number>;
}