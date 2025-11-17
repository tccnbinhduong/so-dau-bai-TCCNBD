
import React, { useState, useEffect, useMemo } from 'react';
import { Teacher, Subject, LessonLog, UserSession } from './types';
import { storageService, ADMIN_PASSWORD } from './services/storageService';
import { PlusIcon, EditIcon, DeleteIcon, LogoutIcon, UserGroupIcon, ChartBarIcon, BookOpenIcon } from './components/Icons';
import Modal from './components/Modal';

// --- HELPER COMPONENTS (Defined outside main App to prevent re-creation on re-renders) ---

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

// --- MAIN APP COMPONENT ---

export default function App() {
    const [user, setUser] = useState<UserSession>(null);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [lessonLogs, setLessonLogs] = useState<LessonLog[]>([]);

    useEffect(() => {
        setTeachers(storageService.getTeachers());
        setSubjects(storageService.getSubjects());
        setLessonLogs(storageService.getLessonLogs());
    }, []);

    const handleLogin = (newUser: UserSession) => {
        setUser(newUser);
    };

    const handleLogout = () => {
        setUser(null);
    };
    
    // CRUD Handlers
    const saveAndSetTeachers = (newTeachers: Teacher[]) => {
        storageService.saveTeachers(newTeachers);
        setTeachers(newTeachers);
    };

    const saveAndSetSubjects = (newSubjects: Subject[]) => {
        storageService.saveSubjects(newSubjects);
        setSubjects(newSubjects);
    };
    
    const saveAndSetLogs = (newLogs: LessonLog[]) => {
        storageService.saveLessonLogs(newLogs);
        setLessonLogs(newLogs);
    }
    
    if (!user) {
        return <LoginPage onLogin={handleLogin} teachers={teachers} />;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <Header userName={user.name} userRole={user.role} onLogout={handleLogout} />
            <main className="p-4 sm:p-6 lg:p-8">
                {user.role === 'teacher' ? (
                    <TeacherDashboard
                        teacher={teachers.find(t => t.id === user.id)!}
                        allSubjects={subjects}
                        onSubjectsUpdate={saveAndSetSubjects}
                        allLogs={lessonLogs}
                        onLogsUpdate={saveAndSetLogs}
                    />
                ) : (
                    <AdminDashboard
                        teachers={teachers}
                        onTeachersUpdate={saveAndSetTeachers}
                        subjects={subjects}
                        onSubjectsUpdate={saveAndSetSubjects}
                        logs={lessonLogs}
                        onLogsUpdate={saveAndSetLogs}
                    />
                )}
            </main>
        </div>
    );
}

// --- LOGIN PAGE ---

interface LoginPageProps {
    onLogin: (user: UserSession) => void;
    teachers: Teacher[];
}
const LoginPage: React.FC<LoginPageProps> = ({ onLogin, teachers }) => {
    const [isTeacherTab, setIsTeacherTab] = useState(true);
    const [teacherCode, setTeacherCode] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [error, setError] = useState('');

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (isTeacherTab) {
            const foundTeacher = teachers.find(t => t.code.toLowerCase() === teacherCode.toLowerCase());
            if (foundTeacher) {
                onLogin({ id: foundTeacher.id, name: foundTeacher.name, role: 'teacher' });
            } else {
                setError('Mã giáo viên không hợp lệ.');
            }
        } else {
            if (adminPassword === ADMIN_PASSWORD) {
                onLogin({ id: 'admin', name: 'Quản trị viên', role: 'admin' });
            } else {
                setError('Mật khẩu không đúng.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sổ Đầu Bài Điện Tử</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Đăng nhập để tiếp tục</p>
                </div>
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button onClick={() => setIsTeacherTab(true)} className={`w-1/2 py-4 text-sm font-medium text-center transition-colors ${isTeacherTab ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        Giáo viên
                    </button>
                    <button onClick={() => setIsTeacherTab(false)} className={`w-1/2 py-4 text-sm font-medium text-center transition-colors ${!isTeacherTab ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                        Quản trị viên
                    </button>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
                    {isTeacherTab ? (
                        <div>
                            <label htmlFor="teacher-code" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mã giáo viên</label>
                            <input type="text" id="teacher-code" value={teacherCode} onChange={e => setTeacherCode(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="ví dụ: GV01" required />
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="admin-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mật khẩu</label>
                            <input type="password" id="admin-password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                    )}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Đăng nhập</button>
                </form>
            </div>
        </div>
    );
};

// --- HEADER ---

interface HeaderProps {
    userName: string;
    userRole: 'teacher' | 'admin';
    onLogout: () => void;
}
const Header: React.FC<HeaderProps> = ({ userName, userRole, onLogout }) => (
    <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                   <BookOpenIcon />
                   <span className="font-semibold text-xl ml-2">Sổ Đầu Bài</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-gray-800 dark:text-gray-200">
                        <span className="hidden sm:inline">Xin chào, </span>
                        <span className="font-medium">
                            {userRole === 'teacher' ? `Thầy/Cô ${userName}` : userName}
                        </span>
                    </span>
                    <button onClick={onLogout} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white" title="Đăng xuất">
                        <LogoutIcon />
                    </button>
                </div>
            </div>
        </div>
    </header>
);

// --- TEACHER DASHBOARD ---
interface TeacherDashboardProps {
    teacher: Teacher;
    allSubjects: Subject[];
    onSubjectsUpdate: (subjects: Subject[]) => void;
    allLogs: LessonLog[];
    onLogsUpdate: (logs: LessonLog[]) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ teacher, allSubjects, onSubjectsUpdate, allLogs, onLogsUpdate }) => {
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<LessonLog | null>(null);
    const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);


    const teacherSubjects = useMemo(() => allSubjects.filter(s => s.teacherId === teacher.id), [allSubjects, teacher.id]);
    const teacherLogs = useMemo(() => allLogs.filter(l => l.teacherId === teacher.id), [allLogs, teacher.id]);

    const handleOpenAddLogModal = () => {
        setEditingLog(null);
        setIsLogModalOpen(true);
    };
    
    const handleOpenEditLogModal = (log: LessonLog) => {
        setEditingLog(log);
        setIsLogModalOpen(true);
    };

    const handleDeleteLog = (logId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa mục này?')) {
            onLogsUpdate(allLogs.filter(log => log.id !== logId));
        }
    };

    const handleSaveLog = (log: Omit<LessonLog, 'id'>) => {
        if (editingLog) {
            onLogsUpdate(allLogs.map(l => l.id === editingLog.id ? { ...editingLog, ...log } : l));
        } else {
            onLogsUpdate([...allLogs, { ...log, id: `l${Date.now()}` }]);
        }
        setIsLogModalOpen(false);
    };
    
    const handleSaveSubject = (subjectName: string) => {
      if(subjectName && !teacherSubjects.some(s => s.name === subjectName)){
        const newSubject: Subject = {
          id: `s${Date.now()}`,
          name: subjectName,
          teacherId: teacher.id
        };
        onSubjectsUpdate([...allSubjects, newSubject]);
      }
      setIsSubjectModalOpen(false);
    }
    
    const confirmDeleteSubject = () => {
        if (!deletingSubject) return;
        onSubjectsUpdate(allSubjects.filter(s => s.id !== deletingSubject.id));
        onLogsUpdate(allLogs.filter(l => l.subjectId !== deletingSubject.id));
        setDeletingSubject(null);
    };


    const totalPeriods = useMemo(() => teacherLogs.reduce((sum, log) => sum + log.periods, 0), [teacherLogs]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Bảng điều khiển của giáo viên</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <StatCard title="Tổng số tiết đã dạy" value={totalPeriods} icon={<ChartBarIcon />} />
                 <StatCard title="Số môn học" value={teacherSubjects.length} icon={<BookOpenIcon />} />
             </div>

            {/* Lesson Logs Section */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Sổ đầu bài</h3>
                    <button onClick={handleOpenAddLogModal} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                        <PlusIcon /> <span className="ml-2 hidden sm:inline">Thêm mới</span>
                    </button>
                </div>
                 <LessonLogList logs={teacherLogs} subjects={teacherSubjects} teachers={[]} onEdit={handleOpenEditLogModal} onDelete={handleDeleteLog} />
            </div>

            {/* Subjects Section */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Quản lý môn học</h3>
                    <button onClick={() => setIsSubjectModalOpen(true)} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                        <PlusIcon /> <span className="ml-2 hidden sm:inline">Thêm môn học</span>
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {teacherSubjects.length > 0 ? teacherSubjects.map(s => (
                        <span key={s.id} className="bg-gray-200 dark:bg-gray-700 text-sm font-medium pl-3 pr-2 py-1 rounded-full inline-flex items-center">
                            {s.name}
                            <button
                                onClick={() => setDeletingSubject(s)}
                                className="ml-2 -mr-1 flex-shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full text-gray-500 hover:bg-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                aria-label={`Xóa môn ${s.name}`}
                            >
                                <span className="sr-only">Xóa môn {s.name}</span>
                                <svg className="h-4 w-4" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    )) : <p>Chưa có môn học nào.</p>}
                </div>
            </div>

            {isLogModalOpen && (
                <LessonLogFormModal 
                    isOpen={isLogModalOpen} 
                    onClose={() => setIsLogModalOpen(false)} 
                    onSave={handleSaveLog}
                    log={editingLog}
                    teacherId={teacher.id}
                    subjects={teacherSubjects}
                />
            )}
            
            {isSubjectModalOpen && (
              <SubjectFormModal 
                isOpen={isSubjectModalOpen}
                onClose={() => setIsSubjectModalOpen(false)}
                onSave={handleSaveSubject}
              />
            )}

            {deletingSubject && (
                <Modal
                    isOpen={!!deletingSubject}
                    onClose={() => setDeletingSubject(null)}
                    title="Xác nhận xóa môn học"
                >
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                           Bạn có chắc chắn muốn xóa môn học <span className="font-bold">{deletingSubject.name}</span>? Mọi tiết dạy liên quan cũng sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button type="button" onClick={() => setDeletingSubject(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                                Hủy
                            </button>
                            <button type="button" onClick={confirmDeleteSubject} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Xóa
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};


// --- ADMIN DASHBOARD ---
interface AdminDashboardProps {
    teachers: Teacher[];
    onTeachersUpdate: (teachers: Teacher[]) => void;
    subjects: Subject[];
    onSubjectsUpdate: (subjects: Subject[]) => void;
    logs: LessonLog[];
    onLogsUpdate: (logs: LessonLog[]) => void;
}
const AdminDashboard: React.FC<AdminDashboardProps> = ({ teachers, onTeachersUpdate, subjects, onSubjectsUpdate, logs, onLogsUpdate }) => {
    const [activeTab, setActiveTab] = useState('logs');
    const [filterTeacher, setFilterTeacher] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const teacherMatch = !filterTeacher || log.teacherId === filterTeacher;
            const subjectMatch = !filterSubject || log.subjectId === filterSubject;
            const dateMatch = (!startDate || log.date >= startDate) && (!endDate || log.date <= endDate);
            return teacherMatch && subjectMatch && dateMatch;
        });
    }, [logs, filterTeacher, filterSubject, startDate, endDate]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Bảng điều khiển Quản trị viên</h2>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    <button onClick={() => setActiveTab('logs')} className={`${activeTab === 'logs' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Sổ đầu bài</button>
                    <button onClick={() => setActiveTab('teachers')} className={`${activeTab === 'teachers' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Quản lý giáo viên</button>
                    <button onClick={() => setActiveTab('subjects')} className={`${activeTab === 'subjects' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Quản lý môn học</button>
                    <button onClick={() => setActiveTab('stats')} className={`${activeTab === 'stats' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Thống kê</button>
                </nav>
            </div>

            {activeTab === 'logs' && (
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium">Lọc theo giáo viên</label>
                            <select value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600">
                                <option value="">Tất cả giáo viên</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Lọc theo môn học</label>
                             <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600">
                                <option value="">Tất cả môn học</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Từ ngày</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Đến ngày</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>
                    <LessonLogList logs={filteredLogs} subjects={subjects} teachers={teachers} />
                </div>
            )}
            
            {activeTab === 'teachers' && <TeacherManager teachers={teachers} onUpdate={onTeachersUpdate} />}

            {activeTab === 'subjects' && <SubjectManager subjects={subjects} teachers={teachers} onSubjectsUpdate={onSubjectsUpdate} logs={logs} onLogsUpdate={onLogsUpdate} />}

            {activeTab === 'stats' && <StatisticsView logs={logs} teachers={teachers} />}

        </div>
    );
};

// --- LOG LIST COMPONENT ---
interface LessonLogListProps {
  logs: LessonLog[];
  subjects: Subject[];
  teachers: Teacher[];
  onEdit?: (log: LessonLog) => void;
  onDelete?: (logId: string) => void;
}
const LessonLogList: React.FC<LessonLogListProps> = ({ logs, subjects, teachers, onEdit, onDelete }) => {
    const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'N/A';
    const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name;

    if (logs.length === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400 py-4">Không có dữ liệu.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        {!onEdit && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Ngày/Buổi</th>}
                        {onEdit && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Ngày dạy</th>}
                        {onEdit && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Buổi</th>}
                        {onEdit && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Môn học</th>}
                        {!onEdit && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Giáo viên</th>}
                        {!onEdit && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Môn học</th>}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Tên bài dạy</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Sĩ số/Vắng</th>
                        {onEdit && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {logs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                        <tr key={log.id}>
                            {!onEdit && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(log.date).toLocaleDateString('vi-VN')}
                                    <span className="block text-xs capitalize">{log.session}</span>
                                </td>
                            )}
                            {onEdit && <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{new Date(log.date).toLocaleDateString('vi-VN')}</td>}
                            {onEdit && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{log.session}</td>}
                            {onEdit && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{getSubjectName(log.subjectId)}</td>}
                            {!onEdit && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{getTeacherName(log.teacherId)}</td>}
                            {!onEdit && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{getSubjectName(log.subjectId)}</td>}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.classSize} / {log.absentStudents}</td>
                            {onEdit && onDelete && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex space-x-2 justify-end">
                                        <button onClick={() => onEdit(log)} className="text-primary-600 hover:text-primary-900"><EditIcon /></button>
                                        <button onClick={() => onDelete(log.id)} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- MODAL FORMS ---
const LessonLogFormModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (log: Omit<LessonLog, 'id'>) => void, log: LessonLog | null, teacherId: string, subjects: Subject[] }> = ({ isOpen, onClose, onSave, log, teacherId, subjects }) => {
    const [formData, setFormData] = useState({
        subjectId: log?.subjectId || '',
        date: log?.date || new Date().toISOString().split('T')[0],
        session: log?.session || 'sáng',
        periodNumber: log?.periodNumber || 1,
        periods: log?.periods || 1,
        title: log?.title || '',
        classSize: log?.classSize || 40,
        absentStudents: log?.absentStudents || '',
        remarks: log?.remarks || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'classSize' || name === 'periods' || name === 'periodNumber' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.subjectId) {
            alert('Vui lòng chọn môn học');
            return;
        }
        onSave({ ...formData, teacherId });
    };

    const commonInputClass = "bg-gray-100 block w-full border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2.5";
    const commonLabelClass = "block mb-2 text-sm font-medium text-gray-900 dark:text-white";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={log ? 'Chỉnh sửa sổ đầu bài' : 'Thêm mới sổ đầu bài'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="subjectId" className={commonLabelClass}>Môn học</label>
                    <select id="subjectId" name="subjectId" value={formData.subjectId} onChange={handleChange} required className={commonInputClass}>
                        <option value="" disabled>Chọn môn học</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="date" className={commonLabelClass}>Ngày dạy</label>
                        <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required className={commonInputClass}/>
                    </div>
                    <div>
                        <label htmlFor="session" className={commonLabelClass}>Buổi dạy</label>
                        <select id="session" name="session" value={formData.session} onChange={handleChange} required className={commonInputClass}>
                            <option value="sáng">Sáng</option>
                            <option value="chiều">Chiều</option>
                            <option value="tối">Tối</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="periodNumber" className={commonLabelClass}>Tiết dạy (thứ tự)</label>
                        <input type="number" id="periodNumber" name="periodNumber" min="1" value={formData.periodNumber} onChange={handleChange} required className={commonInputClass}/>
                    </div>
                    <div>
                        <label htmlFor="periods" className={commonLabelClass}>Số tiết</label>
                        <input type="number" id="periods" name="periods" min="1" value={formData.periods} onChange={handleChange} required className={commonInputClass}/>
                    </div>
                     <div>
                        <label htmlFor="classSize" className={commonLabelClass}>Sĩ số</label>
                        <input type="number" id="classSize" name="classSize" min="0" value={formData.classSize} onChange={handleChange} required className={commonInputClass}/>
                    </div>
                </div>

                <div>
                    <label htmlFor="absentStudents" className={commonLabelClass}>Học sinh vắng</label>
                    <input type="text" id="absentStudents" name="absentStudents" placeholder="VD: An, Bình (phép)" value={formData.absentStudents} onChange={handleChange} className={commonInputClass}/>
                </div>

                <div>
                    <label htmlFor="title" className={commonLabelClass}>Tên bài dạy / Nội dung công việc</label>
                    <textarea id="title" name="title" value={formData.title} onChange={handleChange} required rows={3} className={commonInputClass}/>
                </div>

                <div>
                    <label htmlFor="remarks" className={commonLabelClass}>Nhận xét tiết học</label>
                    <textarea id="remarks" name="remarks" value={formData.remarks} onChange={handleChange} rows={3} className={commonInputClass}/>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-700">Hủy</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Lưu</button>
                </div>
            </form>
        </Modal>
    );
};

const SubjectFormModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (name: string) => void }> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name);
    setName('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm môn học mới">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subjectName" className="block text-sm font-medium">Tên môn học</label>
          <input type="text" id="subjectName" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600" />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Hủy</button>
          <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Lưu</button>
        </div>
      </form>
    </Modal>
  );
};

// --- TEACHER MANAGER (ADMIN) ---
const TeacherManager: React.FC<{ teachers: Teacher[], onUpdate: (teachers: Teacher[]) => void }> = ({ teachers, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

    const handleSave = (teacherData: Omit<Teacher, 'id'>) => {
        if (editingTeacher) {
            onUpdate(teachers.map(t => t.id === editingTeacher.id ? { ...editingTeacher, ...teacherData } : t));
        } else {
            onUpdate([...teachers, { ...teacherData, id: `t${Date.now()}` }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (teacherId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa giáo viên này? Mọi dữ liệu sổ đầu bài liên quan sẽ bị mất.')) {
            onUpdate(teachers.filter(t => t.id !== teacherId));
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Danh sách giáo viên</h3>
                <button onClick={() => { setEditingTeacher(null); setIsModalOpen(true); }} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    <PlusIcon /> <span className="ml-2 hidden sm:inline">Thêm giáo viên</span>
                </button>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                     <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                           <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mã GV</th>
                           <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tên giáo viên</th>
                           <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                     </thead>
                     <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {teachers.map(teacher => (
                            <tr key={teacher.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{teacher.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{teacher.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                     <div className="flex space-x-2 justify-end">
                                        <button onClick={() => { setEditingTeacher(teacher); setIsModalOpen(true); }} className="text-primary-600 hover:text-primary-900"><EditIcon /></button>
                                        <button onClick={() => handleDelete(teacher.id)} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <TeacherFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    teacher={editingTeacher}
                />
            )}
        </div>
    );
};

const TeacherFormModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (data: Omit<Teacher, 'id'>) => void, teacher: Teacher | null }> = ({ isOpen, onClose, onSave, teacher }) => {
    const [formData, setFormData] = useState({ code: teacher?.code || '', name: teacher?.name || '' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={teacher ? "Sửa thông tin giáo viên" : "Thêm giáo viên mới"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium">Mã giáo viên</label>
                    <input type="text" name="code" value={formData.code} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Tên giáo viên</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600"/>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Hủy</button>
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Lưu</button>
                </div>
            </form>
        </Modal>
    );
};

// --- SUBJECT MANAGER (ADMIN) ---
const SubjectManager: React.FC<{ subjects: Subject[], teachers: Teacher[], onSubjectsUpdate: (s: Subject[]) => void, logs: LessonLog[], onLogsUpdate: (l: LessonLog[]) => void }> = ({ subjects, teachers, onSubjectsUpdate, logs, onLogsUpdate }) => {
    const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
    const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || 'N/A';
    
    const confirmDeleteSubject = () => {
        if (!deletingSubject) return;
        onSubjectsUpdate(subjects.filter(s => s.id !== deletingSubject.id));
        onLogsUpdate(logs.filter(l => l.subjectId !== deletingSubject.id));
        setDeletingSubject(null);
    };


    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Tất cả môn học</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                     <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                           <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tên môn học</th>
                           <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Giáo viên phụ trách</th>
                           <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                     </thead>
                     <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {subjects.map(subject => (
                            <tr key={subject.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{subject.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{getTeacherName(subject.teacherId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                     <button onClick={() => setDeletingSubject(subject)} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             {deletingSubject && (
                <Modal
                    isOpen={!!deletingSubject}
                    onClose={() => setDeletingSubject(null)}
                    title="Xác nhận xóa môn học"
                >
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                           Bạn có chắc chắn muốn xóa môn học <span className="font-bold">{deletingSubject.name}</span>? Mọi tiết dạy liên quan cũng sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button type="button" onClick={() => setDeletingSubject(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                                Hủy
                            </button>
                            <button type="button" onClick={confirmDeleteSubject} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Xóa
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};


// --- STATISTICS (ADMIN) ---
const StatisticsView: React.FC<{ logs: LessonLog[], teachers: Teacher[] }> = ({ logs, teachers }) => {
    const statsByTeacher = useMemo(() => {
        const result: { [teacherId: string]: { name: string, periodCount: number, logCount: number } } = {};
        teachers.forEach(t => {
            result[t.id] = { name: t.name, periodCount: 0, logCount: 0 };
        });
        logs.forEach(log => {
            if (result[log.teacherId]) {
                result[log.teacherId].periodCount += log.periods;
                result[log.teacherId].logCount += 1;
            }
        });
        return Object.values(result).sort((a,b) => b.periodCount - a.periodCount);
    }, [logs, teachers]);

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Thống kê số tiết dạy theo giáo viên</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                     <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                           <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tên giáo viên</th>
                           <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Số lần ghi sổ</th>
                           <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tổng số tiết đã dạy</th>
                        </tr>
                     </thead>
                     <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {statsByTeacher.map(stat => (
                            <tr key={stat.name}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{stat.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{stat.logCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{stat.periodCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
