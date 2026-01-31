import React from 'react';

export type UserRole = 'MASTER' | 'EMPLOYEE';
export type UserStatus = 'active' | 'left';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  tel: string;
  address: string;
  role: UserRole;
  isActive: boolean;
  status: UserStatus;
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

export interface BuildComponent {
  id: string;
  type: 'text' | 'button' | 'image' | 'container';
  content: string;
  styles: React.CSSProperties;
}

export interface DesignProject {
  id: string;
  name: string;
  components: BuildComponent[];
  updatedAt: number;
}