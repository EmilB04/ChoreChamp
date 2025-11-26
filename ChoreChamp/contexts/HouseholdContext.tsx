/*
    Household Data Interface for ChoreChamp Application
    Defines the structure of household data used in HouseholdContext
*/


interface HouseholdData {
    id: string;
    name: string;
    familyMembers: {
        id: string;
    }[];
    points: {
        [userId: string]: number;
    }
}