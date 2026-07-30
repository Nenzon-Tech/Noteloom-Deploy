export interface User {
  id: string;
  email: string;
  name: string;
  uid: string;
  role?: string;
  college?: string;
  avatarUrl?: string;
}

export interface Profile {
  id: string;
  role: string;
  college: string;
  full_name: string;
  isIndividual?: boolean;
}

export interface College {
  _id: string;
  name: string;
  type: string;
  collegeCode: string;
  logoUrl?: string;
  location?: string;
  category?: string;
  featured?: boolean;
  status?: string;
}

export interface MenuItem {
  key: string;
  title: string;
  description: string;
  icon: string;
  category: 'LMS' | 'ERP';
  route?: string;
}

export interface AttendanceRecord {
  _id: string;
  subject: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface Notice {
  _id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

export interface Classroom {
  _id: string;
  name: string;
  subjectCode: string;
  studentCount: number;
  faculty?: string;
}

export interface LeaveApplication {
  _id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface LibraryBook {
  _id: string;
  title: string;
  author: string;
  dueDate?: string;
  issuedDate?: string;
  status: 'issued' | 'available';
}

export interface TimetableEntry {
  _id: string;
  subject: string;
  room: string;
  faculty: string;
  timeSlot: string;
  day: string;
}

export interface FeeRecord {
  _id: string;
  type: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'unpaid';
}

export interface ExamRecord {
  _id: string;
  subject: string;
  examType: string;
  marks: number;
  totalMarks: number;
  semester: number;
}

export interface Message {
  _id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  attachments?: { name: string; uri: string; type: string }[];
}
