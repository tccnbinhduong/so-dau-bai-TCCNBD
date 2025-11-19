
export interface Teacher {
  id: string;
  code: string;
  name: string;
  signature?: string; // Base64 string of the signature image
  phoneNumber?: string;
  teachingSubjects?: string;
}

export interface Subject {
  id: string;
  name: string;
  teacherId: string;
  totalPeriods: number;
}

export interface LessonLog {
  id: string;
  teacherId: string;
  subjectId: string;
  className: string;
  session: 'sáng' | 'chiều' | 'tối';
  periods: number;
  periodNumber: number;
  date: string;
  title: string;
  classSize: number;
  absentStudents: string;
  remarks: string;
}

export type UserSession = {
  id: string;
  role: 'teacher' | 'admin';
  name: string;
} | null;
