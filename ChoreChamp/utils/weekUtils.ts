/**
 * Utility functions for handling ISO 8601 week calculations
 * ISO 8601: Week starts on Monday, Week 1 contains first Thursday of year
 */
export interface WeekInfo {
  weekNumber: number;
  year: number;
  weekKey: string; // Format: "2025-W47"
}

/**
 * Get current week information
 */
export function getCurrentWeek(): WeekInfo {
  return getWeekInfo(new Date());
}

/**
 * Get week information for a specific date
 */
export function getWeekInfo(date: Date): WeekInfo {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const dayOfWeek = d.getDay();
    const nearestThursday = new Date(d);
    nearestThursday.setDate(d.getDate() + (4 - (dayOfWeek || 7)));

    const year = nearestThursday.getFullYear();

    const yearStart = new Date(year, 0, 1); 
    const firstThursday = new Date(yearStart);
    const dayOfWeekJan1 = yearStart.getDay();
    const daysUntilThursday = (4 - (dayOfWeekJan1 || 7));
    firstThursday.setDate(1 + daysUntilThursday);

    const weekNumber = Math.ceil(
        (((nearestThursday.getTime() - firstThursday.getTime()) / 86400000) + 1) / 7
    );
    
    const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;

    return { weekNumber, year, weekKey };
}

/**
 * Convert date to week key format (YYYY-Www)
 */
export function getWeekKey(date: Date): string {
    return getWeekInfo(date).weekKey;
}

/**
 * Get Monday of the week for a given date
 */
export function getMondayOfWeek(date: Date): Date {
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

/**
 * Check if two dates are in the same ISO week
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
    const monday1 = getMondayOfWeek(date1).getTime();
    const monday2 = getMondayOfWeek(date2).getTime();
    return monday1 === monday2;
}

/**
 * Get start and end date of a week from weekKey
 */
export function getWeekStartEnd(weekKey: string): { start: Date; end: Date } {
  const [yearStr, weekStr] = weekKey.split('-W');
  const year = parseInt(yearStr);
  const targetWeekNumber = parseInt(weekStr);
  
  let currentDate = new Date(year, 0, 4);
  
  let monday = getMondayOfWeek(currentDate);

  monday.setDate(monday.getDate() + (targetWeekNumber - 1) * 7);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { start: monday, end: sunday };
}