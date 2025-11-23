import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getCurrentWeek, getWeekKey, WeekInfo } from '@/utils/weekUtils';
import { getHouseholdMembers } from './householdService';

/**
 * Interface for leaderboard entry
 */
export interface LeaderboardEntry {
    userId: string;
    firstName: string;
    lastName: string;
    username: string;
    imageUri: string;
    points: number;
}

/**
 * Calculate weekly points for each user in a household
 * @param householdId - The household ID
 * @param weekKey - Week key (e.g., "2025-W47"), defaults to current week
 * @returns Object mapping userId to points
 */
export async function calculateWeeklyPoints(
    householdId: string,
    weekKey?: string
): Promise<Record<string, number>> {
    if (!weekKey) {
        weekKey = getCurrentWeek().weekKey;
    }
    
    const [yearStr, weekStr] = weekKey.split('-W');
    const year = parseInt(yearStr);        // "2025" → 2025
    const weekNumber = parseInt(weekStr);  // "47" → 47
    
    const tasksRef = collection(db, 'tasks'); 
    
    const q = query(
        tasksRef,
        where('householdId', '==', householdId),
        where('done', '==', true),
        where('weekNumber', '==', weekNumber),
        where('year', '==', year)
    );
    
    const querySnapshot = await getDocs(q);
    
    const pointsMap: Record<string, number> = {};
    
    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const userId = data.completedBy;
        const points = data.points || 0;
    
        if (pointsMap[userId]) {
            pointsMap[userId] += points;
        } else {
            pointsMap[userId] = points;
        }
    });
    
    console.log(`📊 Weekly points for ${weekKey}:`, pointsMap);
    
    return pointsMap;
}

/**
 * Get weekly leaderboard for a household
 * @param householdId - The household ID
 * @param weekKey - Week key (e.g., "2025-W47"), defaults to current week
 * @returns Sorted array of leaderboard entries (highest points first)
 */
export async function getWeeklyLeaderboard(
    householdId: string,
    weekKey?: string
): Promise<LeaderboardEntry[]> {
    const weeklyPoints = await calculateWeeklyPoints(householdId, weekKey);
    const householdMembers = await getHouseholdMembers(householdId);
    
    const leaderboard: LeaderboardEntry[] = householdMembers.map(member => ({
        userId: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        username: member.username,
        imageUri: member.imageUri,
        points: weeklyPoints[member.id] || 0
    }));
    
    leaderboard.sort((a, b) => b.points - a.points);
    
    console.log(`🏆 Leaderboard for ${weekKey || 'current week'}:`, leaderboard);
    return leaderboard;
}

/**
 * Get leaderboard history for multiple weeks
 * @param householdId - The household ID
 * @param numberOfWeeks - How many weeks back to fetch
 * @returns Array of weekly leaderboards
 */
export async function getLeaderboardHistory(
    householdId: string,
    numberOfWeeks: number = 4
): Promise<{ weekKey: string; leaderboard: LeaderboardEntry[] }[]> {
    const history: { weekKey: string; leaderboard: LeaderboardEntry[] }[] = [];
    const today = new Date();
    
    for (let i = 0; i < numberOfWeeks; i++) {
        const weekDate = new Date(today);
        weekDate.setDate(today.getDate() - (i * 7));
        
        const weekKey = getWeekKey(weekDate);
        const leaderboard = await getWeeklyLeaderboard(householdId, weekKey);
        
        history.push({
            weekKey,
            leaderboard
        });
    }
    
    console.log(`📅 Fetched ${numberOfWeeks} weeks of history`);
    return history;
}

/**
 * Get aggregated leaderboard for multiple weeks
 * @param householdId - The household ID
 * @param weeks - Array of WeekInfo objects to aggregate
 * @returns Sorted array of leaderboard entries with aggregated points
 */
export async function getAggregatedLeaderboard(
    householdId: string,
    weeks: WeekInfo[]
): Promise<LeaderboardEntry[]> {
    if (weeks.length === 0) {
        const householdMembers = await getHouseholdMembers(householdId);
        return householdMembers.map(member => ({
            userId: member.id,
            firstName: member.firstName,
            lastName: member.lastName,
            username: member.username,
            imageUri: member.imageUri,
            points: 0
        }));
    }

    const aggregatedPoints: Record<string, number> = {};
    const weekSet = new Set(weeks.map(w => w.weekKey));
    
    const years = [...new Set(weeks.map(w => w.year))];
    
    for (const year of years) {
        const tasksRef = collection(db, 'tasks');
        const q = query(
            tasksRef,
            where('householdId', '==', householdId),
            where('done', '==', true),
            where('year', '==', year)
        );
        
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const taskWeekKey = `${data.year}-W${data.weekNumber.toString().padStart(2, '0')}`;
            
            if (weekSet.has(taskWeekKey)) {
                const userId = data.completedBy;
                const points = data.points || 0;
                
                if (aggregatedPoints[userId]) {
                    aggregatedPoints[userId] += points;
                } else {
                    aggregatedPoints[userId] = points;
                }
            }
        });
    }
    
    const householdMembers = await getHouseholdMembers(householdId);
    
    const leaderboard: LeaderboardEntry[] = householdMembers.map(member => ({
        userId: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        username: member.username,
        imageUri: member.imageUri,
        points: aggregatedPoints[member.id] || 0
    }));
    
    leaderboard.sort((a, b) => b.points - a.points);
    
    return leaderboard;
}
