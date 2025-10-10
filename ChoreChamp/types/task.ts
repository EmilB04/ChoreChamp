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
}
