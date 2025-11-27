import {
  getWeekInfo,
  getMondayOfWeek,
  isSameWeek,
  getWeekStartEnd,
  getWeeksInCurrentYear,
} from '@/utils/weekUtils';

describe('weekUtils', () => {
  describe('getWeekInfo', () => {
    it('calculates correct week number for known dates', () => {
      const jan1 = new Date(2025, 0, 1);
      const weekInfo = getWeekInfo(jan1);
      
      expect(weekInfo.weekNumber).toBe(1);
      expect(weekInfo.year).toBe(2025);
      expect(weekInfo.weekKey).toBe('2025-W01');
    });

    it('handles year transition correctly', () => {
      // December 30, 2024 is Monday of Week 1 of 2025
      const date = new Date(2024, 11, 30);
      const weekInfo = getWeekInfo(date);
      
      expect(weekInfo.year).toBe(2025);
      expect(weekInfo.weekNumber).toBe(1);
    });

    it('returns same week for all days in same ISO week', () => {
      const monday = new Date(2025, 0, 6);
      const friday = new Date(2025, 0, 10);
      
      expect(getWeekInfo(monday).weekKey).toBe(getWeekInfo(friday).weekKey);
    });
  });

  describe('getMondayOfWeek', () => {
    it('returns Monday for any day of the week with time at midnight', () => {
      const monday = new Date(2025, 0, 6);
      const wednesday = new Date(2025, 0, 8, 15, 30, 45);
      const sunday = new Date(2025, 0, 12);
      
      expect(getMondayOfWeek(monday).getDay()).toBe(1);
      expect(getMondayOfWeek(wednesday).getDay()).toBe(1);
      expect(getMondayOfWeek(sunday).getDay()).toBe(1);
      
      // Also verify time is set to midnight
      const result = getMondayOfWeek(wednesday);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });

    it('handles year transition', () => {
      const sunday = new Date(2025, 0, 5);
      const result = getMondayOfWeek(sunday);
      
      expect(result.getDay()).toBe(1);
      expect(result.getFullYear()).toBe(2024);
    });
  });

  describe('isSameWeek', () => {
    it('returns true for days in same week, false for different weeks', () => {
      const monday = new Date(2025, 0, 6);
      const friday = new Date(2025, 0, 10);
      const nextWeek = new Date(2025, 0, 15);
      
      expect(isSameWeek(monday, friday)).toBe(true);
      expect(isSameWeek(monday, nextWeek)).toBe(false);
    });

    it('handles week spanning year boundary', () => {
      const lastDay2024 = new Date(2024, 11, 30); // Monday, Week 1 of 2025
      const firstDay2025 = new Date(2025, 0, 2);  // Thursday, Week 1 of 2025
      expect(isSameWeek(lastDay2024, firstDay2025)).toBe(true);
    });
  });

  describe('getWeekStartEnd', () => {
    it('returns Monday to Sunday for any week', () => {
      const { start, end } = getWeekStartEnd('2025-W02');
      
      expect(start.getDay()).toBe(1); // Monday
      expect(end.getDay()).toBe(0); // Sunday
    });

    it('sets correct times for start and end', () => {
      const { start, end } = getWeekStartEnd('2025-W15');
      
      expect(start.getHours()).toBe(0);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
    });

    it('is consistent with getWeekInfo', () => {
      const originalWeekKey = '2025-W20';
      const { start } = getWeekStartEnd(originalWeekKey);
      const weekInfo = getWeekInfo(start);
      
      expect(weekInfo.weekKey).toBe(originalWeekKey);
    });
  });

  describe('getWeeksInCurrentYear', () => {
    it('returns 52-53 weeks starting with Week 1', () => {
      const weeks = getWeeksInCurrentYear();
      
      expect(weeks.length).toBeGreaterThanOrEqual(52);
      expect(weeks.length).toBeLessThanOrEqual(53);
      expect(weeks[0].weekNumber).toBe(1);
    });

    it('returns unique weeks only', () => {
      const weeks = getWeeksInCurrentYear();
      const weekKeys = weeks.map(w => w.weekKey);
      
      expect(weekKeys.length).toBe(new Set(weekKeys).size);
    });
  });

  describe('Integration tests', () => {
    it('getMondayOfWeek and getWeekInfo are consistent', () => {
      const date = new Date(2025, 5, 15);
      const monday = getMondayOfWeek(date);
      
      expect(getWeekInfo(date).weekKey).toBe(getWeekInfo(monday).weekKey);
    });

    it('getWeekStartEnd covers the correct date range', () => {
      const date = new Date(2025, 5, 15);
      const weekInfo = getWeekInfo(date);
      const { start, end } = getWeekStartEnd(weekInfo.weekKey);
      
      expect(date.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(date.getTime()).toBeLessThanOrEqual(end.getTime());
    });
  });
});
