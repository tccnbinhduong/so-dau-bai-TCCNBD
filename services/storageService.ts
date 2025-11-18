
import { Teacher, Subject, LessonLog } from '../types';

const TEACHERS_KEY = 'teachers';
const SUBJECTS_KEY = 'subjects';
const LESSON_LOGS_KEY = 'lesson_logs';
export const ADMIN_PASSWORD = 'tccnbd';

const getFromStorage = <T,>(key: string): T | null => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return null;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    const item = JSON.stringify(value);
    window.localStorage.setItem(key, item);
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};

const seedInitialData = () => {
  const initialTeachers: Teacher[] = [
    { id: 't1', code: 'GV01', name: 'Nguyễn Văn An' },
    { id: 't2', code: 'GV02', name: 'Trần Thị Bình' },
  ];
  const initialSubjects: Subject[] = [
    { id: 's1', teacherId: 't1', name: 'Toán học', totalPeriods: 90 },
    { id: 's2', teacherId: 't1', name: 'Vật lý', totalPeriods: 70 },
    { id: 's3', teacherId: 't2', name: 'Ngữ văn', totalPeriods: 105 },
  ];
  const initialLogs: LessonLog[] = [
    {
      id: 'l1',
      teacherId: 't1',
      subjectId: 's1',
      className: '10A1',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      session: 'sáng',
      periodNumber: 1,
      periods: 2,
      classSize: 40,
      absentStudents: 'Vắng: Minh, Huy',
      title: 'Bài 1: Phương trình bậc hai',
      remarks: 'Lớp học tập trung, sôi nổi.',
    },
    {
      id: 'l2',
      teacherId: 't2',
      subjectId: 's3',
      className: '12B3',
      date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
      session: 'chiều',
      periodNumber: 3,
      periods: 1,
      classSize: 38,
      absentStudents: 'Không',
      title: 'Bài 2: Phân tích tác phẩm "Lão Hạc"',
      remarks: 'Học sinh tích cực phát biểu.',
    },
  ];

  if (!getFromStorage(TEACHERS_KEY)) {
    saveToStorage(TEACHERS_KEY, initialTeachers);
  }
  if (!getFromStorage(SUBJECTS_KEY)) {
    saveToStorage(SUBJECTS_KEY, initialSubjects);
  }
  if (!getFromStorage(LESSON_LOGS_KEY)) {
    saveToStorage(LESSON_LOGS_KEY, initialLogs);
  }
};

seedInitialData();

export const storageService = {
  getTeachers: (): Teacher[] => getFromStorage<Teacher[]>(TEACHERS_KEY) || [],
  saveTeachers: (teachers: Teacher[]) => saveToStorage(TEACHERS_KEY, teachers),
  getSubjects: (): Subject[] => getFromStorage<Subject[]>(SUBJECTS_KEY) || [],
  saveSubjects: (subjects: Subject[]) => saveToStorage(SUBJECTS_KEY, subjects),
  getLessonLogs: (): LessonLog[] => getFromStorage<LessonLog[]>(LESSON_LOGS_KEY) || [],
  saveLessonLogs: (logs: LessonLog[]) => saveToStorage(LESSON_LOGS_KEY, logs),
};