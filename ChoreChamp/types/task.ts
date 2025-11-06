// Type definitions for tasks

export interface Task {
  id: number;
  title: string;
  description?: string;
  time: string;
  assignedTo: string;
  avatar: any;
  duration: number; // in minutes
  finished: boolean;
  timeStart?: Date; // Full Date object for start time
  timeEnd?: Date; // Full Date object for end time
  firebaseId?: string; // Firebase document ID for updates
}
