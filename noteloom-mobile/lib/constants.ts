import { Platform } from 'react-native';

export const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://10.84.220.137:4000';

export const HF_TOKEN = process.env.EXPO_PUBLIC_HF_TOKEN || '';

export const APP_THEME = {
  primary: '#9333ea',
  primaryHover: '#7e22ce',
  secondary: '#2563eb',
  darkBg: '#0f172a',
  darkCard: '#1e293b',
  lightBg: '#f8fafc',
  lightCard: '#ffffff',
  accent: '#10b981',
  danger: '#ef4444',
};

export const ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  COLLEGE_ADMIN: 'college_admin',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  student: 'Student',
  faculty: 'Faculty',
  college_admin: 'College Admin',
};

export const STORAGE_KEYS = {
  SESSION_TOKEN: 'sessionToken',
  COLLEGE_CODE: 'selectedCollegeCode',
  COLLEGE_NAME: 'selectedCollegeName',
  COLLEGE_LOGO: 'selectedCollegeLogo',
  USER_PROFILE: 'userProfile',
  THEME_PREF: 'themePreference',
  BIOMETRIC_ENABLED: 'biometricEnabled',
};

export const ICON_MAP: Record<string, string> = {
  BookOpen: 'BookOpen',
  ClipboardList: 'ClipboardList',
  MessageSquare: 'MessageSquare',
  Users: 'Users',
  Calendar: 'Calendar',
  Banknote: 'Banknote',
  IndianRupee: 'IndianRupee',
  FolderPlus: 'FolderPlus',
  GraduationCap: 'GraduationCap',
  ListTodo: 'ListTodo',
  FormInput: 'FormInput',
  FileText: 'FileText',
  Receipt: 'Receipt',
  User: 'User',
  PenBox: 'PenBox',
  CheckCircle: 'CheckCircle',
  Upload: 'Upload',
  Clock: 'Clock',
  Briefcase: 'Briefcase',
  Settings: 'Settings',
  ShieldCheck: 'ShieldCheck',
  UserPlus: 'UserPlus',
  Building: 'Building',
  FileCog: 'FileCog',
  Library: 'Library',
  Default: 'Circle',
};
