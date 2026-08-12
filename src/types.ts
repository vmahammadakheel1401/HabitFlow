/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Frequency = 'daily' | 'weekly' | 'monthly';
export type HabitType = 'yes-no' | 'counter' | 'duration';

export type HabitCategory = string;

export interface Category {
  id: string;
  name: string;
  color: string;
  userId?: string; // Optional for default categories
  isCustom: boolean;
}

export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  timeOfDay: TimeOfDay;
  icon: string;
  color: string;
  frequency: Frequency;
  type: HabitType;
  target?: string;
  startDate: string;
  reminderTime?: string;
  notes?: string;
  userId: string;
  createdAt: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: 'completed' | 'skipped' | 'failed' | 'none';
  value?: number;
  userId: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  hiddenCategoryIds?: string[];
}
