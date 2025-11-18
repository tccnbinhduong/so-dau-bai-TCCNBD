import React, { useState, useEffect, useMemo } from 'react';
import { Teacher, Subject, LessonLog, UserSession } from './types';
import { storageService, ADMIN_PASSWORD } from './services/storageService';
import { PlusIcon, EditIcon, DeleteIcon, LogoutIcon, UserGroupIcon, ChartBarIcon, BookOpenIcon, DownloadIcon } from './components/Icons';
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
                            <input type="text" id="teacher-code" value={teacherCode} onChange={e => setTeacherCode(e.target.value)} className="bg-gray-100 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="ví dụ: GV01" required />
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="admin-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mật khẩu</label>
                            <input type="password" id="admin-password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="bg-gray-100 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required />
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
    const [deletingLog, setDeletingLog] = useState<LessonLog | null>(null);
    const [filterSubjectId, setFilterSubjectId] = useState('');
    const [filterClassName, setFilterClassName] = useState('');


    const teacherSubjects = useMemo(() => allSubjects.filter(s => s.teacherId === teacher.id), [allSubjects, teacher.id]);
    const teacherLogs = useMemo(() => allLogs.filter(l => l.teacherId === teacher.id), [allLogs, teacher.id]);

    const uniqueClassNames = useMemo(() => {
        return [...new Set(teacherLogs.map(log => log.className).filter(Boolean))].sort();
    }, [teacherLogs]);

    const filteredTeacherLogs = useMemo(() => {
        return teacherLogs.filter(log => {
            const subjectMatch = !filterSubjectId || log.subjectId === filterSubjectId;
            const classMatch = !filterClassName || log.className === filterClassName;
            return subjectMatch && classMatch;
        });
    }, [teacherLogs, filterSubjectId, filterClassName]);


    const stats = useMemo(() => {
        const now = new Date();
        const today = now.getDay(); 
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (today === 0 ? 6 : today - 1));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        const periodsThisWeek = teacherLogs
            .filter(log => {
                const logDate = new Date(log.date);
                return logDate >= startOfWeek && logDate <= endOfWeek;
            })
            .reduce((sum, log) => sum + log.periods, 0);

        const periodsThisMonth = teacherLogs
            .filter(log => {
                const logDate = new Date(log.date);
                return logDate >= startOfMonth && logDate <= endOfMonth;
            })
            .reduce((sum, log) => sum + log.periods, 0);

        const periodsByClass = teacherLogs.reduce((acc, log) => {
            if (log.className) {
                acc[log.className] = (acc[log.className] || 0) + log.periods;
            }
            return acc;
        }, {} as { [key: string]: number });

        return {
            thisWeek: periodsThisWeek,
            thisMonth: periodsThisMonth,
            byClass: periodsByClass
        };
    }, [teacherLogs]);

    const getSubjectStats = (subjectId: string) => {
        const logsForSubject = teacherLogs.filter(l => l.subjectId === subjectId);
        const taughtPeriods = logsForSubject.reduce((sum, log) => sum + log.periods, 0);
        const classNames = [...new Set(logsForSubject.map(l => l.className).filter(Boolean))].join(', ');
        return { taughtPeriods, classNames };
    };

    const handleOpenAddLogModal = () => {
        setEditingLog(null);
        setIsLogModalOpen(true);
    };
    
    const handleOpenEditLogModal = (log: LessonLog) => {
        setEditingLog(log);
        setIsLogModalOpen(true);
    };

    const requestDeleteLog = (logId: string) => {
        const logToDelete = allLogs.find(l => l.id === logId);
        if (logToDelete) {
            setDeletingLog(logToDelete);
        }
    };
    
    const confirmDeleteLog = () => {
        if (!deletingLog) return;
        onLogsUpdate(allLogs.filter(log => log.id !== deletingLog.id));
        setDeletingLog(null);
    };

    const handleSaveLog = (log: Omit<LessonLog, 'id'>) => {
        if (editingLog) {
            onLogsUpdate(allLogs.map(l => l.id === editingLog.id ? { ...editingLog, ...log } : l));
        } else {
            onLogsUpdate([...allLogs, { ...log, id: `l${Date.now()}` }]);
        }
        setIsLogModalOpen(false);
    };
    
    const handleSaveSubject = (data: { name: string, totalPeriods: number }) => {
      const { name, totalPeriods } = data;
      if (name && totalPeriods > 0 && !teacherSubjects.some(s => s.name.toLowerCase() === name.toLowerCase())) {
        const newSubject: Subject = {
          id: `s${Date.now()}`,
          name: name,
          teacherId: teacher.id,
          totalPeriods: totalPeriods
        };
        onSubjectsUpdate([...allSubjects, newSubject]);
        setIsSubjectModalOpen(false);
      } else if (teacherSubjects.some(s => s.name.toLowerCase() === name.toLowerCase())) {
        alert("Tên môn học đã tồn tại.");
      }
    }
    
    const confirmDeleteSubject = () => {
        if (!deletingSubject) return;
        onSubjectsUpdate(allSubjects.filter(s => s.id !== deletingSubject.id));
        onLogsUpdate(allLogs.filter(l => l.subjectId !== deletingSubject.id));
        setDeletingSubject(null);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Bảng điều khiển của giáo viên</h2>
            
            {/* Subjects Section */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Quản lý môn học</h3>
                    <button onClick={() => setIsSubjectModalOpen(true)} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                        <PlusIcon /> <span className="ml-2 hidden sm:inline">Thêm môn học</span>
                    </button>
                </div>
                <div className="flex flex-wrap gap-3">
                    {teacherSubjects.length > 0 ? teacherSubjects.map(s => {
                        const { taughtPeriods, classNames } = getSubjectStats(s.id);
                        const remainingPeriods = s.totalPeriods - taughtPeriods;
                        const isWarning = remainingPeriods <= 5 && remainingPeriods >= 0;

                        return (
                            <div key={s.id} className={`pl-3 pr-2 py-1.5 rounded-full inline-flex items-center group transition-colors ${isWarning ? 'bg-red-100 dark:bg-red-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <span className={`font-medium text-sm ${isWarning ? 'text-red-800 dark:text-red-200' : ''}`}>{s.name}</span>
                                <span className={`text-xs ml-1.5 ${isWarning ? 'text-red-600 dark:text-red-300' : 'text-gray-600 dark:text-gray-400'}`}>
                                    ({taughtPeriods}/{s.totalPeriods} tiết)
                                </span>
                                {classNames && <span className={`text-xs ml-1 ${isWarning ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-500'}`}>- {classNames}</span>}
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
                            </div>
                        )
                    }) : <p className="text-gray-500 dark:text-gray-400">Chưa có môn học nào. Hãy thêm môn học để bắt đầu.</p>}
                </div>
            </div>

            {/* Lesson Logs Section */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Sổ đầu bài</h3>
                    <button onClick={handleOpenAddLogModal} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                        <PlusIcon /> <span className="ml-2 hidden sm:inline">Thêm mới</span>
                    </button>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="filterSubject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lọc theo môn học</label>
                        <select 
                            id="filterSubject"
                            value={filterSubjectId} 
                            onChange={e => setFilterSubjectId(e.target.value)} 
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-100 border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="">Tất cả môn học</option>
                            {teacherSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="filterClass" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lọc theo lớp</label>
                        <select 
                            id="filterClass"
                            value={filterClassName} 
                            onChange={e => setFilterClassName(e.target.value)} 
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-100 border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="">Tất cả các lớp</option>
                            {uniqueClassNames.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>
                </div>
                 <LessonLogList logs={filteredTeacherLogs} subjects={teacherSubjects} teachers={[]} onEdit={handleOpenEditLogModal} onDelete={requestDeleteLog} />
            </div>
            
             {/* Stats Section */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Thống kê tiết dạy</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tuần này</p>
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.thisWeek} tiết</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tháng này</p>
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.thisMonth} tiết</p>
                    </div>
                    {Object.entries(stats.byClass).map(([className, periods]) => (
                        <div key={className} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Lớp {className}</p>
                            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{periods} tiết</p>
                        </div>
                    ))}
                     {Object.keys(stats.byClass).length === 0 && teacherLogs.length > 0 && (
                         <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center sm:col-span-2">
                             <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có dữ liệu theo lớp</p>
                             <p className="text-xs text-gray-400 dark:text-gray-500">Vui lòng cập nhật tên lớp trong sổ đầu bài.</p>
                         </div>
                     )}
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

            {deletingLog && (
                <Modal
                    isOpen={!!deletingLog}
                    onClose={() => setDeletingLog(null)}
                    title="Xác nhận xóa tiết dạy"
                >
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                           Bạn có chắc chắn muốn xóa mục sổ đầu bài này?
                           <br />
                           <span className="font-semibold text-gray-700 dark:text-gray-300">
                                Môn: {teacherSubjects.find(s => s.id === deletingLog.subjectId)?.name || 'N/A'}
                           </span>
                           <br/>
                           <span className="font-semibold text-gray-700 dark:text-gray-300">
                               Ngày: {new Date(deletingLog.date).toLocaleDateString('vi-VN')}
                           </span>
                           <br />
                           Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button type="button" onClick={() => setDeletingLog(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                                Hủy
                            </button>
                            <button type="button" onClick={confirmDeleteLog} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
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

    const handleExportPDF = () => {
        const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'N/A';
        const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || 'N/A';

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Không thể mở cửa sổ mới. Vui lòng cho phép pop-up cho trang web này.");
            return;
        }

        const tableRows = filteredLogs
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(log => `
                <tr>
                    <td>${new Date(log.date).toLocaleDateString('vi-VN')}</td>
                    <td style="text-transform: capitalize;">${log.session}</td>
                    <td>${getTeacherName(log.teacherId)}</td>
                    <td>${getSubjectName(log.subjectId)}</td>
                    <td>${log.className || ''}</td>
                    <td>${log.title}</td>
                    <td>${log.classSize}</td>
                    <td>${log.absentStudents || 'Không'}</td>
                </tr>
            `).join('');

        const teacherFilterName = filterTeacher ? teachers.find(t => t.id === filterTeacher)?.name : 'Tất cả';
        const subjectFilterName = filterSubject ? subjects.find(s => s.id === filterSubject)?.name : 'Tất cả';
        const dateFilterRange = startDate && endDate
            ? `Từ ${new Date(startDate).toLocaleDateString('vi-VN')} đến ${new Date(endDate).toLocaleDateString('vi-VN')}`
            : startDate
            ? `Từ ngày ${new Date(startDate).toLocaleDateString('vi-VN')}`
            : endDate
            ? `Đến ngày ${new Date(endDate).toLocaleDateString('vi-VN')}`
            : 'Tất cả';

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <title>Báo Cáo Sổ Đầu Bài</title>
                <style>
                    body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 10px; margin: 20px; }
                    h1, h2 { text-align: center; color: #333; margin-bottom: 10px;}
                    h1 { font-size: 20px; }
                    h2 { font-size: 16px; }
                    .report-info { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 20px; max-width: 600px; margin: 0 auto; font-size: 12px;}
                    .info-grid p { margin: 2px 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 6px; text-align: left; word-break: break-word; }
                    th { background-color: #f2f2f2; }
                    @media print {
                        @page { size: A4 landscape; }
                        body { margin: 1cm; font-size: 9px; }
                        h1 { font-size: 18px; }
                        h2 { font-size: 14px; }
                        .info-grid { font-size: 10px; }
                    }
                </style>
            </head>
            <body>
                <h1>BÁO CÁO SỔ ĐẦU BÀI</h1>
                <div class="report-info">
                    <h2>Thông tin lọc</h2>
                    <div class="info-grid">
                        <p><strong>Giáo viên:</strong> ${teacherFilterName}</p>
                        <p><strong>Môn học:</strong> ${subjectFilterName}</p>
                        <p><strong>Khoảng thời gian:</strong> ${dateFilterRange}</p>
                        <p><strong>Ngày xuất báo cáo:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Ngày dạy</th>
                            <th>Buổi</th>
                            <th>Giáo viên</th>
                            <th>Môn học</th>
                            <th>Lớp</th>
                            <th>Tên bài dạy</th>
                            <th>Sĩ số</th>
                            <th>Vắng</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                        ${tableRows.length === 0 ? '<tr><td colspan="8" style="text-align: center; padding: 20px;">Không có dữ liệu phù hợp với bộ lọc.</td></tr>' : ''}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };


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
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                        <h3 className="text-xl font-semibold">Sổ đầu bài toàn trường</h3>
                         <button onClick={handleExportPDF} disabled={filteredLogs.length === 0} className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            <DownloadIcon /> <span className="ml-2">Xuất PDF</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium">Lọc theo giáo viên</label>
                            <select value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-100 border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600">
                                <option value="">Tất cả giáo viên</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Lọc theo môn học</label>
                             <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-100 border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600">
                                <option value="">Tất cả môn học</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Từ ngày</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 text-base bg-gray-100 border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Đến ngày</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 text-base bg-gray-100 border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>
                    <LessonLogList logs={filteredLogs} subjects={subjects} teachers={teachers} />
                </div>
            )}
            
            {activeTab === 'teachers' && <TeacherManager 
                teachers={teachers} 
                onTeachersUpdate={onTeachersUpdate} 
                subjects={subjects}
                onSubjectsUpdate={onSubjectsUpdate}
                logs={logs}
                onLogsUpdate={onLogsUpdate}
            />}

            {activeTab === 'subjects' && <SubjectManager subjects={subjects} teachers={teachers} onSubjectsUpdate={onSubjectsUpdate} logs={logs} onLogsUpdate={onLogsUpdate} />}

            {activeTab === 'stats' && <StatisticsView logs={logs} teachers={teachers} subjects={subjects} />}

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
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Ngày dạy</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Buổi</th>
                        {!onEdit && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Giáo viên</th>}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Môn học (Lớp)</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Tên bài dạy</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Sĩ số/Vắng</th>
                        {onEdit && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {logs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                        <tr key={log.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{new Date(log.date).toLocaleDateString('vi-VN')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{log.session}</td>
                            {!onEdit && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{getTeacherName(log.teacherId)}</td>}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {getSubjectName(log.subjectId)}
                                {log.className && <span className="font-semibold text-gray-700 dark:text-gray-300"> ({log.className})</span>}
                            </td>
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
        className: log?.className || '',
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
         if(!formData.className) {
            alert('Vui lòng nhập tên lớp');
            return;
        }
        onSave({ ...formData, teacherId });
    };

    const commonInputClass = "bg-gray-100 block w-full border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2.5";
    const commonLabelClass = "block mb-2 text-sm font-medium text-gray-900 dark:text-white";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={log ? 'Chỉnh sửa sổ đầu bài' : 'Thêm mới sổ đầu bài'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="subjectId" className={commonLabelClass}>Môn học</label>
                        <select id="subjectId" name="subjectId" value={formData.subjectId} onChange={handleChange} required className={commonInputClass}>
                            <option value="" disabled>Chọn môn học</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="className" className={commonLabelClass}>Lớp</label>
                        <input type="text" id="className" name="className" placeholder="VD: 10A1" value={formData.className} onChange={handleChange} required className={commonInputClass}/>
                    </div>
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

const SubjectFormModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (data: { name: string; totalPeriods: number }) => void }> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [totalPeriods, setTotalPeriods] = useState<number | string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!name.trim() || !totalPeriods || Number(totalPeriods) <= 0) {
        alert("Vui lòng nhập đầy đủ và hợp lệ thông tin môn học.");
        return;
    }
    onSave({ name: name.trim(), totalPeriods: Number(totalPeriods) });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm môn học mới">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subjectName" className="block text-sm font-medium text-gray-900 dark:text-white">Tên môn học</label>
          <input 
            type="text" 
            id="subjectName" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
            placeholder="VD: Giáo dục chính trị"
            className="mt-1 bg-gray-100 block w-full border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2.5" 
          />
        </div>
        <div>
          <label htmlFor="totalPeriods" className="block text-sm font-medium text-gray-900 dark:text-white">Tổng số tiết</label>
          <input 
            type="number" 
            id="totalPeriods" 
            value={totalPeriods} 
            onChange={e => setTotalPeriods(e.target.value)} 
            required 
            min="1"
            placeholder="VD: 90"
            className="mt-1 bg-gray-100 block w-full border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2.5" 
          />
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
const TeacherManager: React.FC<{ 
    teachers: Teacher[], 
    onTeachersUpdate: (teachers: Teacher[]) => void,
    subjects: Subject[],
    onSubjectsUpdate: (subjects: Subject[]) => void,
    logs: LessonLog[],
    onLogsUpdate: (logs: LessonLog[]) => void,
}> = ({ teachers, onTeachersUpdate, subjects, onSubjectsUpdate, logs, onLogsUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);

    const handleSave = (teacherData: Omit<Teacher, 'id'>) => {
        if (editingTeacher) {
            onTeachersUpdate(teachers.map(t => t.id === editingTeacher.id ? { ...editingTeacher, ...teacherData } : t));
        } else {
            onTeachersUpdate([...teachers, { ...teacherData, id: `t${Date.now()}` }]);
        }
        setIsModalOpen(false);
    };

    const confirmDeleteTeacher = () => {
        if (!deletingTeacher) return;
        
        const subjectsToDeleteIds = subjects
            .filter(s => s.teacherId === deletingTeacher.id)
            .map(s => s.id);
        
        onTeachersUpdate(teachers.filter(t => t.id !== deletingTeacher.id));
        onSubjectsUpdate(subjects.filter(s => s.teacherId !== deletingTeacher.id));
        onLogsUpdate(logs.filter(l => !subjectsToDeleteIds.includes(l.subjectId)));
        
        setDeletingTeacher(null);
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
                                        <button onClick={() => setDeletingTeacher(teacher)} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
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
            
            {deletingTeacher && (
                <Modal
                    isOpen={!!deletingTeacher}
                    onClose={() => setDeletingTeacher(null)}
                    title="Xác nhận xóa giáo viên"
                >
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                           Bạn có chắc chắn muốn xóa giáo viên <span className="font-bold">{deletingTeacher.name}</span>? Mọi môn học và tiết dạy liên quan cũng sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button type="button" onClick={() => setDeletingTeacher(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                                Hủy
                            </button>
                            <button type="button" onClick={confirmDeleteTeacher} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Xóa
                            </button>
                        </div>
                    </div>
                </Modal>
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
                    <input type="text" name="code" value={formData.code} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 p-2.5 dark:bg-gray-700 dark:border-gray-600"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Tên giáo viên</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 p-2.5 dark:bg-gray-700 dark:border-gray-600"/>
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
                           <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Giáo viên</th>
                           <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lớp học</th>
                           <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tổng tiết</th>
                           <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Đã dạy</th>
                           <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Còn lại</th>
                           <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
                        </tr>
                     </thead>
                     <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {subjects.map(subject => {
                            const subjectLogs = logs.filter(l => l.subjectId === subject.id);
                            const taughtPeriods = subjectLogs.reduce((sum, log) => sum + log.periods, 0);
                            const remainingPeriods = subject.totalPeriods - taughtPeriods;
                            const classNames = [...new Set(subjectLogs.map(l => l.className).filter(Boolean))].join(', ');

                            return (
                                <tr key={subject.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{subject.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getTeacherName(subject.teacherId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{classNames || 'Chưa có'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{subject.totalPeriods}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{taughtPeriods}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold">{remainingPeriods}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => setDeletingSubject(subject)} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
                                    </td>
                                </tr>
                            );
                        })}
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


// --- STATISTICS VIEW (ADMIN) ---
const StatisticsView: React.FC<{ logs: LessonLog[], teachers: Teacher[], subjects: Subject[] }> = ({ logs, teachers, subjects }) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const monthDateRange = `${pad(startOfMonth.getDate())}/${pad(startOfMonth.getMonth() + 1)} - ${pad(endOfMonth.getDate())}/${pad(endOfMonth.getMonth() + 1)}/${endOfMonth.getFullYear()}`;

     const statsByTeacher = useMemo(() => {
        const teacherStats: { [key: string]: { name: string, totalPeriods: number, periodsThisMonth: number, subjectNames: string } } = {};
        
        teachers.forEach(t => {
            const teacherSubjectNames = subjects
                .filter(s => s.teacherId === t.id)
                .map(s => s.name)
                .join(', ');

            teacherStats[t.id] = { 
                name: t.name, 
                totalPeriods: 0,
                periodsThisMonth: 0,
                subjectNames: teacherSubjectNames || "Chưa có"
            };
        });

        logs.forEach(log => {
            if (teacherStats[log.teacherId]) {
                teacherStats[log.teacherId].totalPeriods += log.periods;
                
                const logDate = new Date(log.date);
                if (logDate >= startOfMonth && logDate <= endOfMonth) {
                    teacherStats[log.teacherId].periodsThisMonth += log.periods;
                }
            }
        });

        return Object.values(teacherStats).sort((a,b) => b.totalPeriods - a.totalPeriods);
    }, [logs, teachers, subjects, startOfMonth, endOfMonth]);

    const totalPeriods = useMemo(() => logs.reduce((sum, log) => sum + log.periods, 0), [logs]);

    const handleExportTeacherStatsPDF = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Không thể mở cửa sổ mới. Vui lòng cho phép pop-up cho trang web này.");
            return;
        }

        const tableRows = statsByTeacher.map(stat => `
            <tr>
                <td>${stat.name}</td>
                <td>${stat.subjectNames}</td>
                <td style="text-align: center;">${stat.totalPeriods}</td>
                <td style="text-align: center;">${stat.periodsThisMonth}</td>
            </tr>
        `).join('');

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <title>Báo Cáo Thống Kê Theo Giáo Viên</title>
                <style>
                    body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; margin: 20px; }
                    h1 { text-align: center; color: #333; margin-bottom: 20px; font-size: 22px;}
                    p { text-align: center; font-size: 14px; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; word-break: break-word; }
                    th { background-color: #f2f2f2; font-size: 13px; }
                    @media print {
                        @page { size: A4 portrait; }
                        body { margin: 1cm; font-size: 10px; }
                        h1 { font-size: 20px; }
                        p { font-size: 12px; }
                        th { font-size: 11px; }
                    }
                </style>
            </head>
            <body>
                <h1>BÁO CÁO THỐNG KÊ THEO GIÁO VIÊN</h1>
                <p><strong>Ngày xuất báo cáo:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Giáo viên</th>
                            <th>Môn học</th>
                            <th style="text-align: center;">Tổng số tiết dạy</th>
                            <th style="text-align: center;">Tổng tiết tháng (${monthDateRange})</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                         ${tableRows.length === 0 ? '<tr><td colspan="4" style="text-align: center; padding: 20px;">Không có dữ liệu.</td></tr>' : ''}
                    </tbody>
                </table>
            </body>
            </html>
        `;
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };


    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6">
            <h3 className="text-xl font-semibold">Thống kê tổng quan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Tổng số giáo viên" value={teachers.length} icon={<UserGroupIcon />} />
                <StatCard title="Tổng số tiết đã dạy" value={totalPeriods} icon={<ChartBarIcon />} />
                <StatCard title="Tổng số mục sổ đầu bài" value={logs.length} icon={<BookOpenIcon />} />
            </div>
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold">Thống kê theo giáo viên</h4>
                    <button onClick={handleExportTeacherStatsPDF} disabled={statsByTeacher.length === 0} className="inline-flex items-center justify-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm">
                        <DownloadIcon /> <span className="ml-2">Xuất PDF</span>
                    </button>
                </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                         <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Giáo viên</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Môn học</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Tổng số tiết dạy</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">Tổng tiết tháng ({monthDateRange})</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {statsByTeacher.map(stat => (
                                <tr key={stat.name}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{stat.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{stat.subjectNames}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold">{stat.totalPeriods}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{stat.periodsThisMonth}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};