
import { User } from './types';

export const COLORS = {
  BG_ONYX: 'bg-[#050505]',
  BG_SLATE: 'bg-slate-900',
  BG_SLATE_LIGHT: 'bg-slate-800',
  ACCENT_GREEN: '#10b981',
  ACCENT_PEACH: '#E8B49A',
  ACCENT_BLUE: '#89CFF0',
  ACCENT_YELLOW: '#facc15',
};

export const MASTER_CREDENTIALS = {
  username: 'JasveerKaurkhalsa108',
  accessCode: 'QUEENONE&ONLYJKK6291'
};

export const INITIAL_USERS: User[] = [
  {
    id: 'master-jkk',
    username: MASTER_CREDENTIALS.username,
    fullName: 'Jasveer Kaur Khalsa',
    email: 'jkk@loggit.com',
    tel: 'PRIVATE',
    address: 'JKK HQ',
    role: 'MASTER',
    isActive: true,
    status: 'active',
    isArchived: false,
    dob: '1900-01-01',
    isPasswordSet: true,
    password: MASTER_CREDENTIALS.accessCode
  }
];
