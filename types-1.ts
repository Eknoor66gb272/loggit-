
export type UserRole = 'MASTER' | 'EMPLOYEE';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  tel: string;
  address: string;
  role: UserRole;
  isActive: boolean;
  isArchived: boolean;
  dob: string;
  isPasswordSet: boolean;
  password?: string;
}

export interface WorkEntry {
  id: string;
  userId: string;
  date: string;
  timeIn: string;
  timeOut: string;
  morningBreak: number;
  lunch: number;
  afternoonBreak: number;
  totalHours: number;
  createdAt: number;
}

export interface MonthSummary {
  monthYear: string;
  totalHours: number;
  entries: WorkEntry[];
  isVerified?: boolean;
}

export interface VerificationRecord {
  userId: string;
  monthYear: string;
  isVerified: boolean;
}
