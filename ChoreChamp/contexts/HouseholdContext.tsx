

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