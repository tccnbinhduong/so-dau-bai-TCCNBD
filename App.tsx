
import React, { useState, useEffect, useMemo } from 'react';
import { Teacher, Subject, LessonLog, UserSession } from './types';
import { storageService, ADMIN_PASSWORD } from './services/storageService';
import { PlusIcon, EditIcon, DeleteIcon, LogoutIcon, UserGroupIcon, ChartBarIcon, BookOpenIcon, DownloadIcon, SignatureIcon } from './components/Icons';
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

// --- ICONS EXTENSION ---
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const RestoreIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
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
                        onTeacherUpdate={(updatedTeacher) => {
                            const updatedTeachers = teachers.map(t => t.id === updatedTeacher.id ? updatedTeacher : t);
                            saveAndSetTeachers(updatedTeachers);
                        }}
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
    const [teacherLoginInput, setTeacherLoginInput] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [error, setError] = useState('');

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (isTeacherTab) {
            const input = teacherLoginInput.trim().toLowerCase();
            const foundTeacher = teachers.find(t => 
                t.code.toLowerCase() === input || 
                (t.phoneNumber && t.phoneNumber === input) ||
                t.name.toLowerCase() === input
            );
            
            if (foundTeacher) {
                onLogin({ id: foundTeacher.id, name: foundTeacher.name, role: 'teacher' });
            } else {
                setError('Thông tin đăng nhập không chính xác (Kiểm tra Mã GV, SĐT hoặc Họ tên).');
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">Sổ đầu bài Online</h1>
                    <p className="mt-2 text-xl text-gray-800 dark:text-gray-300">Trường Trung cấp Công nghiệp Bình Dương</p>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Đăng nhập để tiếp tục</p>
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
                            <label htmlFor="teacher-login-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mã GV / SĐT / Họ tên</label>
                            <input 
                                type="text" 
                                id="teacher-login-input" 
                                value={teacherLoginInput} 
                                onChange={e => setTeacherLoginInput(e.target.value)} 
                                className="bg-gray-100 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                                placeholder="Nhập Mã GV, SĐT hoặc Họ tên" 
                                required 
                            />
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
                   <div className="ml-2">
                        <span className="block font-bold text-lg leading-tight">Sổ đầu bài Online</span>
                        <span className="block text-sm text-gray-500 dark:text-gray-400 leading-tight">Trường Trung cấp Công nghiệp Bình Dương</span>
                   </div>
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
    onTeacherUpdate: (teacher: Teacher) => void;
    allSubjects: Subject[];
    onSubjectsUpdate: (subjects: Subject[]) => void;
    allLogs: LessonLog[];
    onLogsUpdate: (logs: LessonLog[]) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ teacher, onTeacherUpdate, allSubjects, onSubjectsUpdate, allLogs, onLogsUpdate }) => {
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    
    const [editingLog, setEditingLog] = useState<LessonLog | null>(null);
    const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
    const [deletingLog, setDeletingLog] = useState<LessonLog | null>(null);
    const [filterSubjectId, setFilterSubjectId] = useState('');
    const [filterClassName, setFilterClassName] = useState('');


    // FILTER: Only show items that are NOT deleted
    const teacherSubjects = useMemo(() => allSubjects.filter(s => s.teacherId === teacher.id && !s.deletedAt), [allSubjects, teacher.id]);
    const teacherLogs = useMemo(() => allLogs.filter(l => l.teacherId === teacher.id && !l.deletedAt), [allLogs, teacher.id]);

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
    
    // SOFT DELETE LOG
    const confirmDeleteLog = () => {
        if (!deletingLog) return;
        // Mark as deleted instead of removing
        const updatedLogs = allLogs.map(log => 
            log.id === deletingLog.id ? { ...log, deletedAt: new Date().toISOString() } : log
        );
        onLogsUpdate(updatedLogs);
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
    
    // SOFT DELETE SUBJECT
    const confirmDeleteSubject = () => {
        if (!deletingSubject) return;
        // Mark subject as deleted
        const updatedSubjects = allSubjects.map(s => 
            s.id === deletingSubject.id ? { ...s, deletedAt: new Date().toISOString() } : s
        );
        
        // Also soft delete associated logs to keep consistency, or we can just rely on filtering logs by active subject.
        // Strategy: Just delete the subject. Logs are orphaned but soft-delete them too so they show up in Trash.
        const updatedLogs = allLogs.map(l => 
            l.subjectId === deletingSubject.id ? { ...l, deletedAt: new Date().toISOString() } : l
        );

        onSubjectsUpdate(updatedSubjects);
        onLogsUpdate(updatedLogs);
        setDeletingSubject(null);
    };

    const handleSaveSignature = (signature: string | undefined) => {
        onTeacherUpdate({ ...teacher, signature });
        setIsSignatureModalOpen(false);
    };

    const handleTeacherExportPDF = (subjectId: string, className: string) => {
        const exportLogs = teacherLogs
            .filter(log => log.subjectId === subjectId && log.className === className)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const subjectName = teacherSubjects.find(s => s.id === subjectId)?.name || '';

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Không thể mở cửa sổ mới. Vui lòng kiểm tra trình chặn pop-up.");
            return;
        }

        const signatureImg = teacher.signature 
            ? `<img src="${teacher.signature}" style="max-height: 40px; max-width: 80px; display: block; margin: 0 auto;" alt="Ký tên" />` 
            : '';

        const tableRows = exportLogs.map(log => `
            <tr>
                <td style="text-align: center;">${new Date(log.date).toLocaleDateString('vi-VN')}</td>
                <td style="text-align: center; text-transform: capitalize;">${log.session}</td>
                <td style="text-align: center;">${log.periodNumber}</td>
                <td style="text-align: center;">${log.periods}</td>
                <td style="text-align: center;">${log.classSize}</td>
                <td style="text-align: center;">${log.absentStudents}</td>
                <td>${log.title}</td>
                <td>${log.remarks}</td>
                <td style="text-align: center; vertical-align: middle;">${signatureImg}</td>
            </tr>
        `).join('');

        // Generate empty rows if few logs
        const minRows = 5;
        let emptyRows = '';
        if (exportLogs.length < minRows) {
            for (let i = 0; i < (minRows - exportLogs.length); i++) {
                emptyRows += `
                <tr>
                    <td style="height: 30px;"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                </tr>`;
            }
        }

        const footerSignature = teacher.signature 
            ? `<img src="${teacher.signature}" style="max-height: 80px; margin: 10px 0; display: block; margin-left: auto; margin-right: auto;" alt="Chữ ký" />` 
            : '<p style="margin-top: 80px;"></p>';

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <title>Sổ Đầu Bài - ${className}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h3, .header h4 { margin: 5px 0; font-weight: normal; text-transform: uppercase; }
                    .header h1 { margin: 20px 0; font-size: 28px; font-weight: bold; }
                    .info-section { margin-bottom: 15px; padding-left: 50px; }
                    .info-line { margin-bottom: 10px; font-size: 16px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #000; padding: 5px; font-size: 14px; vertical-align: middle; }
                    th { font-weight: bold; text-align: center; }
                    .footer { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; font-weight: bold; padding: 0 20px; }
                    .footer div { width: 30%; }
                    @media print {
                        @page { size: landscape; margin: 1cm; }
                        body { -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h4>SỞ GIÁO DỤC VÀ ĐÀO TẠO TP.HỒ CHÍ MINH</h4>
                    <h4>TRƯỜNG TRUNG CẤP CÔNG NGHIỆP BÌNH DƯƠNG</h4>
                    <h1>SỔ ĐẦU BÀI</h1>
                </div>
                
                <div class="info-section">
                    <div class="info-line">Họ tên giáo viên: ${teacher.name}</div>
                    <div class="info-line">Môn học: ${subjectName}</div>
                    <div class="info-line">Lớp: ${className}</div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th width="10%">Ngày dạy</th>
                            <th width="5%">Buổi</th>
                            <th width="5%">Tiết dạy</th>
                            <th width="5%">Số tiết</th>
                            <th width="5%">Sĩ số</th>
                            <th width="10%">Học sinh vắng</th>
                            <th width="30%">Tên bài học, nội dung công việc</th>
                            <th width="15%">Nhận xét tiết học</th>
                            <th width="15%">Giáo viên kí tên</th>
                        </tr>
                        <tr style="font-style: italic; text-align: center;">
                           <td>(1)</td>
                           <td>(2)</td>
                           <td>(3)</td>
                           <td>(4)</td>
                           <td>(5)</td>
                           <td>(6)</td>
                           <td>(7)</td>
                           <td>(8)</td>
                           <td>(9)</td>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                        ${emptyRows}
                    </tbody>
                </table>

                <div class="footer">
                    <div>
                        <p>Giáo viên bộ môn</p>
                        ${footerSignature}
                        <p>${teacher.name}</p>
                    </div>
                    <div>
                        <p>Giáo viên chủ nhiệm</p>
                    </div>
                    <div>
                        <p>Ban giám hiệu</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Bảng điều khiển của giáo viên</h2>
                <button onClick={() => setIsSignatureModalOpen(true)} className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                    <SignatureIcon /> <span className="ml-2">Cập nhật chữ ký</span>
                </button>
            </div>
            
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
                    <div className="flex space-x-2">
                        <button onClick={() => setIsExportModalOpen(true)} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <DownloadIcon /> <span className="ml-2 hidden sm:inline">Xuất file in</span>
                        </button>
                        <button onClick={handleOpenAddLogModal} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                            <PlusIcon /> <span className="ml-2 hidden sm:inline">Thêm mới</span>
                        </button>
                    </div>
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

            {/* MODALS */}

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
            
            {isExportModalOpen && (
                <TeacherExportModal
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                    onExport={handleTeacherExportPDF}
                    subjects={teacherSubjects}
                    classNames={uniqueClassNames}
                    initialSubjectId={filterSubjectId}
                    initialClassName={filterClassName}
                />
            )}
            
            {isSignatureModalOpen && (
                <SignatureModal
                    isOpen={isSignatureModalOpen}
                    onClose={() => setIsSignatureModalOpen(false)}
                    onSave={handleSaveSignature}
                    existingSignature={teacher.signature}
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
                           Bạn có chắc chắn muốn xóa môn học <span className="font-bold">{deletingSubject.name}</span>? 
                           Mọi tiết dạy liên quan cũng sẽ bị chuyển vào thùng rác.
                        </p>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button type="button" onClick={() => setDeletingSubject(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                                Hủy
                            </button>
                            <button type="button" onClick={confirmDeleteSubject} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Xóa tạm
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
                           Mục này sẽ được chuyển vào thùng rác và có thể phục hồi bởi Quản trị viên.
                        </p>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button type="button" onClick={() => setDeletingLog(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                                Hủy
                            </button>
                            <button type="button" onClick={confirmDeleteLog} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                Xóa tạm
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// ... [SignautureModal and TeacherExportModal remain unchanged, but re-included for full file XML consistency if needed, 
// but typically we can assume they are there. For safety, I'll assume previous context] ...
// (Omitting unchanged SignatureModal and TeacherExportModal code blocks to save tokens, focusing on logic changes. 
// BUT based on instruction "Full content of file_2", I must include everything.)

// --- SIGNATURE MODAL ---
interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (signature: string | undefined) => void;
    existingSignature?: string;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, onSave, existingSignature }) => {
    const [preview, setPreview] = useState<string | undefined>(existingSignature);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        setPreview(existingSignature);
        setFile(null);
    }, [isOpen, existingSignature]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 2 * 1024 * 1024) { // 2MB limit
                alert("File quá lớn. Vui lòng chọn ảnh nhỏ hơn 2MB.");
                return;
            }
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSave = () => {
        onSave(preview);
    };

    const handleRemove = () => {
        setFile(null);
        setPreview(undefined);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cập nhật chữ ký">
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tải lên hình ảnh chữ ký của bạn (định dạng .png, .jpg). Chữ ký này sẽ được tự động chèn vào file in Sổ đầu bài. Nếu không có chữ ký, bạn có thể ký trực tiếp sau khi in.
                </p>
                
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 dark:border-gray-600">
                    {preview ? (
                        <div className="relative">
                            <img src={preview} alt="Chữ ký preview" className="max-h-32 object-contain border border-gray-200 rounded" />
                            <button 
                                onClick={handleRemove}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                                title="Xóa chữ ký"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="mt-2 flex text-sm text-gray-600 dark:text-gray-400">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                    <span className="px-2">Tải file lên</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG tối đa 2MB</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                     <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">Hủy</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Lưu thay đổi</button>
                </div>
            </div>
        </Modal>
    );
}


const TeacherExportModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onExport: (subjectId: string, className: string) => void;
    subjects: Subject[];
    classNames: string[];
    initialSubjectId: string;
    initialClassName: string;
}> = ({ isOpen, onClose, onExport, subjects, classNames, initialSubjectId, initialClassName }) => {
    const [selectedSubject, setSelectedSubject] = useState(initialSubjectId);
    const [selectedClass, setSelectedClass] = useState(initialClassName);

    useEffect(() => {
        setSelectedSubject(initialSubjectId);
        setSelectedClass(initialClassName);
    }, [isOpen, initialSubjectId, initialClassName]);

    const handleExport = () => {
        if (!selectedSubject || !selectedClass) {
            alert("Vui lòng chọn môn học và lớp để xuất file.");
            return;
        }
        onExport(selectedSubject, selectedClass);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Xuất file in Sổ đầu bài">
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Vui lòng chọn Môn học và Lớp để tạo file in theo mẫu.</p>
                <div>
                    <label htmlFor="exportSubject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Môn học</label>
                    <select
                        id="exportSubject"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-100 border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="">-- Chọn môn học --</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="exportClass" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lớp</label>
                    <select
                        id="exportClass"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-100 border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="">-- Chọn lớp --</option>
                        {classNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md shadow-sm hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200">
                        Hủy
                    </button>
                    <button onClick={handleExport} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700">
                        Xuất file in
                    </button>
                </div>
            </div>
        </Modal>
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

    // Filter out deleted logs for main view
    const activeLogs = useMemo(() => logs.filter(l => !l.deletedAt), [logs]);
    const activeSubjects = useMemo(() => subjects.filter(s => !s.deletedAt), [subjects]);

    const filteredLogs = useMemo(() => {
        return activeLogs.filter(log => {
            const teacherMatch = !filterTeacher || log.teacherId === filterTeacher;
            const subjectMatch = !filterSubject || log.subjectId === filterSubject;
            const dateMatch = (!startDate || log.date >= startDate) && (!endDate || log.date <= endDate);
            return teacherMatch && subjectMatch && dateMatch;
        });
    }, [activeLogs, filterTeacher, filterSubject, startDate, endDate]);

    const handleExportPDF = () => {
        const getSubjectName = (id: string) => activeSubjects.find(s => s.id === id)?.name || 'N/A';
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
        const subjectFilterName = filterSubject ? activeSubjects.find(s => s.id === filterSubject)?.name : 'Tất cả';
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
                    <button onClick={() => setActiveTab('trash')} className={`${activeTab === 'trash' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1`}>
                         <TrashIcon /> Thùng rác
                    </button>
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
                                {activeSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                    <LessonLogList logs={filteredLogs} subjects={activeSubjects} teachers={teachers} />
                </div>
            )}
            
            {activeTab === 'teachers' && <TeacherManager 
                teachers={teachers} 
                onTeachersUpdate={onTeachersUpdate} 
                subjects={activeSubjects}
                onSubjectsUpdate={onSubjectsUpdate}
                logs={activeLogs}
                onLogsUpdate={onLogsUpdate}
            />}

            {activeTab === 'subjects' && <SubjectManager subjects={activeSubjects} teachers={teachers} onSubjectsUpdate={onSubjectsUpdate} logs={activeLogs} onLogsUpdate={onLogsUpdate} />}

            {activeTab === 'stats' && <StatisticsView logs={activeLogs} teachers={teachers} subjects={activeSubjects} />}

            {activeTab === 'trash' && <TrashManager 
                logs={logs} 
                subjects={subjects} 
                teachers={teachers}
                onLogsUpdate={onLogsUpdate} 
                onSubjectsUpdate={onSubjectsUpdate} 
            />}

        </div>
    );
};

// --- COMPONENTS DEFINITIONS ---

interface LessonLogListProps {
    logs: LessonLog[];
    subjects: Subject[];
    teachers: Teacher[];
    onEdit?: (log: LessonLog) => void;
    onDelete?: (id: string) => void;
    isTrashView?: boolean;
    onRestore?: (id: string) => void;
    onPermanentDelete?: (id: string) => void;
}

const LessonLogList: React.FC<LessonLogListProps> = ({ logs, subjects, teachers, onEdit, onDelete, isTrashView, onRestore, onPermanentDelete }) => {
    const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'N/A';
    const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || 'N/A';

    if (logs.length === 0) {
        return <div className="text-center p-4 text-gray-500 dark:text-gray-400">Chưa có dữ liệu.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày / Buổi</th>
                        {(teachers.length > 0 || isTrashView) && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Giáo viên</th>}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Môn / Lớp</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tiết</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nội dung</th>
                        {isTrashView && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày xóa</th>}
                        {(onEdit || onDelete || isTrashView) && <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{new Date(log.date).toLocaleDateString('vi-VN')}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{log.session}</div>
                            </td>
                            {(teachers.length > 0 || isTrashView) && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">{getTeacherName(log.teacherId)}</div>
                                </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{getSubjectName(log.subjectId)}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Lớp: {log.className}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">Tiết thứ: {log.periodNumber}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Số tiết: {log.periods}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 dark:text-white truncate max-w-xs" title={log.title}>{log.title}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs" title={log.remarks}>{log.remarks}</div>
                            </td>
                            {isTrashView && log.deletedAt && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-red-500">{new Date(log.deletedAt).toLocaleDateString('vi-VN')}</div>
                                </td>
                            )}
                            {(onEdit || onDelete || isTrashView) && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        {isTrashView ? (
                                            <>
                                                {onRestore && (
                                                    <button onClick={() => onRestore(log.id)} className="text-green-600 hover:text-green-900 dark:text-green-400" title="Phục hồi">
                                                        <RestoreIcon />
                                                    </button>
                                                )}
                                                {onPermanentDelete && (
                                                    <button onClick={() => onPermanentDelete(log.id)} className="text-red-600 hover:text-red-900 dark:text-red-400" title="Xóa vĩnh viễn">
                                                        <DeleteIcon />
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {onEdit && (
                                                    <button onClick={() => onEdit(log)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                                        <EditIcon />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button onClick={() => onDelete(log.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                        <DeleteIcon />
                                                    </button>
                                                )}
                                            </>
                                        )}
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

// ... [LessonLogFormModal, SubjectFormModal, TeacherManager, SubjectManager, StatisticsView remain almost identical, just ensure standard export is there]
// I will paste them for completeness to ensure the file is valid as per instructions.

interface LessonLogFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (log: Omit<LessonLog, 'id'>) => void;
    log: LessonLog | null;
    teacherId: string;
    subjects: Subject[];
}

const LessonLogFormModal: React.FC<LessonLogFormModalProps> = ({ isOpen, onClose, onSave, log, teacherId, subjects }) => {
    const [formData, setFormData] = useState<Omit<LessonLog, 'id'>>({
        teacherId,
        subjectId: '',
        className: '',
        session: 'sáng',
        periods: 1,
        periodNumber: 1,
        date: new Date().toISOString().split('T')[0],
        title: '',
        classSize: 0,
        absentStudents: 'Không',
        remarks: ''
    });

    useEffect(() => {
        if (log) {
            const { id, ...rest } = log;
            setFormData(rest);
        } else {
             setFormData(prev => ({ ...prev, subjectId: '' }));
        }
    }, [log, subjects]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'periods' || name === 'periodNumber' || name === 'classSize' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={log ? "Chỉnh sửa sổ đầu bài" : "Thêm sổ đầu bài"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Môn học</label>
                        <select name="subjectId" value={formData.subjectId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm p-2 border" required>
                            <option value="" disabled>-- Chọn môn học --</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ngày dạy</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm p-2 border" required />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lớp</label>
                        <input type="text" name="className" value={formData.className} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm p-2 border" required placeholder="VD: 10A1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sĩ số</label>
                        <input type="number" name="classSize" value={formData.classSize} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm p-2 border" required min="1" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Buổi</label>
                        <select name="session" value={formData.session} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm p-2 border">
                            <option value="sáng">Sáng</option>
                            <option value="chiều">Chiều</option>
                            <option value="tối">Tối</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tiết thứ</label>
                        <input type="number" name="periodNumber" value={formData.periodNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm p-2 border" required min="1" max="12" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Số tiết dạy</label>
                        <input type="number" name="periods" value={formData.periods} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm p-2 border" required min="1" max="5" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tên bài / Nội dung</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm p-2 border" required />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Học sinh vắng</label>
                    <input type="text" name="absentStudents" value={formData.absentStudents} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm p-2 border" placeholder="Ghi tên học sinh vắng hoặc 'Không'" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nhận xét</label>
                    <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm p-2 border" placeholder="Tình hình học tập, kỷ luật..."></textarea>
                </div>

                <div className="flex justify-end pt-4">
                     <button type="button" onClick={onClose} className="mr-3 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">Hủy</button>
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Lưu</button>
                </div>
            </form>
        </Modal>
    );
};

interface SubjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string, totalPeriods: number }) => void;
}

const SubjectFormModal: React.FC<SubjectFormModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [totalPeriods, setTotalPeriods] = useState(45);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, totalPeriods });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Thêm môn học mới">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tên môn học</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm p-2 border" required autoFocus />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tổng số tiết (theo chương trình)</label>
                    <input type="number" value={totalPeriods} onChange={e => setTotalPeriods(parseInt(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 sm:text-sm p-2 border" required min="1" />
                </div>
                <div className="flex justify-end pt-4">
                     <button type="button" onClick={onClose} className="mr-3 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">Hủy</button>
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Thêm</button>
                </div>
            </form>
        </Modal>
    );
};

interface TeacherManagerProps {
    teachers: Teacher[];
    onTeachersUpdate: (teachers: Teacher[]) => void;
    subjects: Subject[];
    onSubjectsUpdate: (subjects: Subject[]) => void;
    logs: LessonLog[];
    onLogsUpdate: (logs: LessonLog[]) => void;
}

const TeacherManager: React.FC<TeacherManagerProps> = ({ teachers, onTeachersUpdate, subjects, onSubjectsUpdate, logs, onLogsUpdate }) => {
    const [newTeacherName, setNewTeacherName] = useState('');
    const [newTeacherCode, setNewTeacherCode] = useState('');
    const [newTeacherPhone, setNewTeacherPhone] = useState('');
    const [newTeacherSubjects, setNewTeacherSubjects] = useState('');
    const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);

    const handleAddTeacher = (e: React.FormEvent) => {
        e.preventDefault();
        if (teachers.some(t => t.code === newTeacherCode)) {
            alert('Mã giáo viên đã tồn tại');
            return;
        }
        const newTeacher: Teacher = {
            id: `t${Date.now()}`,
            name: newTeacherName,
            code: newTeacherCode,
            phoneNumber: newTeacherPhone,
            teachingSubjects: newTeacherSubjects
        };
        onTeachersUpdate([...teachers, newTeacher]);
        setNewTeacherName('');
        setNewTeacherCode('');
        setNewTeacherPhone('');
        setNewTeacherSubjects('');
    };

    const confirmDeleteTeacher = () => {
        if (!deletingTeacher) return;
        const updatedSubjects = subjects.filter(s => s.teacherId !== deletingTeacher.id);
        const updatedLogs = logs.filter(l => l.teacherId !== deletingTeacher.id);
        
        onSubjectsUpdate(updatedSubjects);
        onLogsUpdate(updatedLogs);
        onTeachersUpdate(teachers.filter(t => t.id !== deletingTeacher.id));
        setDeletingTeacher(null);
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Quản lý giáo viên</h3>
            <form onSubmit={handleAddTeacher} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mã giáo viên</label>
                        <input type="text" value={newTeacherCode} onChange={e => setNewTeacherCode(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white sm:text-sm p-2 border" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Họ tên</label>
                        <input type="text" value={newTeacherName} onChange={e => setNewTeacherName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white sm:text-sm p-2 border" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Số điện thoại</label>
                        <input type="text" value={newTeacherPhone} onChange={e => setNewTeacherPhone(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white sm:text-sm p-2 border" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Môn dạy</label>
                        <input type="text" value={newTeacherSubjects} onChange={e => setNewTeacherSubjects(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white sm:text-sm p-2 border" placeholder="VD: Toán, Lý" />
                    </div>
                    <button type="submit" className="w-full flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none">
                        <PlusIcon /> <span className="ml-2">Thêm</span>
                    </button>
                </div>
            </form>

            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Mã GV</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Họ tên</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">SĐT</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Môn dạy</th>
                             <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Số lượng môn</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                <span className="sr-only">Xóa</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                        {teachers.map((teacher) => (
                            <tr key={teacher.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">{teacher.code}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">{teacher.name}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">{teacher.phoneNumber || '-'}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">{teacher.teachingSubjects || '-'}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                                    {subjects.filter(s => s.teacherId === teacher.id && !s.deletedAt).length}
                                </td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <button onClick={() => setDeletingTeacher(teacher)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                        <DeleteIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {deletingTeacher && (
                <Modal isOpen={!!deletingTeacher} onClose={() => setDeletingTeacher(null)} title="Xóa giáo viên">
                    <div className="space-y-4">
                         <p className="text-gray-700 dark:text-gray-300">Bạn có chắc chắn muốn xóa giáo viên <strong>{deletingTeacher.name}</strong>?</p>
                         <p className="text-red-500 text-sm">Cảnh báo: Tất cả môn học và sổ đầu bài của giáo viên này cũng sẽ bị xóa!</p>
                         <div className="flex justify-end gap-3">
                            <button onClick={() => setDeletingTeacher(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Hủy</button>
                            <button onClick={confirmDeleteTeacher} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Xóa vĩnh viễn</button>
                         </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

interface SubjectManagerProps {
    subjects: Subject[];
    teachers: Teacher[];
    onSubjectsUpdate: (subjects: Subject[]) => void;
    logs: LessonLog[];
    onLogsUpdate: (logs: LessonLog[]) => void;
}
const SubjectManager: React.FC<SubjectManagerProps> = ({ subjects, teachers, onSubjectsUpdate, logs, onLogsUpdate }) => {
    const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
    
    const confirmDelete = () => {
        if(!deletingSubject) return;
        // Hard delete for admin in Subject Manager, or soft delete? 
        // Usually admin delete is hard delete, but let's consistent. 
        // However, prompt said "Teacher's dashboard... stored momentarily in trash".
        // Admin dashboard usually implies power. Let's make it soft delete for consistency or hard?
        // Let's do soft delete so it goes to trash too, just in case.
        const updatedSubjects = subjects.map(s => 
             s.id === deletingSubject.id ? { ...s, deletedAt: new Date().toISOString() } : s
        );
        onSubjectsUpdate(updatedSubjects);
        // No need to update logs here for soft delete if we filter by subject deleted status, 
        // but to be safe and show in trash, let's soft delete logs too.
        const updatedLogs = logs.map(l => 
             l.subjectId === deletingSubject.id ? { ...l, deletedAt: new Date().toISOString() } : l
        );
        onLogsUpdate(updatedLogs);
        setDeletingSubject(null);
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Danh sách môn học toàn trường</h3>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Tên môn học</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Giáo viên phụ trách</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Tổng tiết</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Số tiết đã dạy</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Số tiết còn lại</th>
                            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Hành động</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                        {subjects.filter(s => !s.deletedAt).map(subject => {
                            const taughtPeriods = logs
                                .filter(l => l.subjectId === subject.id && !l.deletedAt)
                                .reduce((sum, l) => sum + l.periods, 0);
                            const remainingPeriods = subject.totalPeriods - taughtPeriods;

                            return (
                                <tr key={subject.id}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">{subject.name}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">{teachers.find(t => t.id === subject.teacherId)?.name || 'Unknown'}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">{subject.totalPeriods}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">{taughtPeriods}</td>
                                    <td className={`whitespace-nowrap px-3 py-4 text-sm font-medium ${remainingPeriods < 0 ? 'text-red-600' : 'text-gray-500 dark:text-gray-300'}`}>{remainingPeriods}</td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                         <button onClick={() => setDeletingSubject(subject)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                            <DeleteIcon />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                         {subjects.filter(s => !s.deletedAt).length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-4 text-center text-gray-500">Chưa có môn học nào được tạo.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
             {deletingSubject && (
                <Modal isOpen={!!deletingSubject} onClose={() => setDeletingSubject(null)} title="Xóa môn học">
                    <div className="space-y-4">
                         <p className="text-gray-700 dark:text-gray-300">Bạn có chắc chắn muốn xóa môn học <strong>{deletingSubject.name}</strong>?</p>
                         <p className="text-red-500 text-sm">Hành động này sẽ chuyển môn học và các tiết dạy liên quan vào thùng rác.</p>
                         <div className="flex justify-end gap-3">
                            <button onClick={() => setDeletingSubject(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Hủy</button>
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Xóa</button>
                         </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

interface StatisticsViewProps {
    logs: LessonLog[];
    teachers: Teacher[];
    subjects: Subject[];
}
const StatisticsView: React.FC<StatisticsViewProps> = ({ logs, teachers, subjects }) => {
    const [filterTeacherId, setFilterTeacherId] = useState('');
    const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [filterSubjectId, setFilterSubjectId] = useState('');

    // Filter active logs
    const activeLogs = useMemo(() => logs.filter(l => !l.deletedAt), [logs]);

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

        const relevantTeachers = filterTeacherId 
            ? teachers.filter(t => t.id === filterTeacherId)
            : teachers;

        return relevantTeachers.map(t => {
            const tLogs = activeLogs.filter(l => l.teacherId === t.id);
            const total = tLogs.reduce((sum, l) => sum + l.periods, 0);
            
            const week = tLogs.filter(l => {
                const d = new Date(l.date);
                return d >= startOfWeek && d <= endOfWeek;
            }).reduce((sum, l) => sum + l.periods, 0);

            const month = tLogs.filter(l => {
                const d = new Date(l.date);
                return d >= startOfMonth && d <= endOfMonth;
            }).reduce((sum, l) => sum + l.periods, 0);

            return { name: t.name, total, week, month, count: tLogs.length };
        }).sort((a, b) => b.total - a.total);
    }, [activeLogs, teachers, filterTeacherId]);

    const totalPeriods = stats.reduce((acc, s) => acc + s.total, 0);
    const totalLogs = stats.reduce((acc, s) => acc + s.count, 0);
    
    const handleExportReport = () => {
        const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'N/A';
        
        const filteredLogs = activeLogs.filter(log => {
            const teacherMatch = !filterTeacherId || log.teacherId === filterTeacherId;
            const subjectMatch = !filterSubjectId || log.subjectId === filterSubjectId;
            const dateMatch = log.date.startsWith(filterMonth);
            return teacherMatch && subjectMatch && dateMatch;
        });

        const totalFilteredPeriods = filteredLogs.reduce((sum, log) => sum + log.periods, 0);
        const sortedLogs = filteredLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Không thể mở cửa sổ mới.");
            return;
        }

        const teacherFilterName = filterTeacherId ? teachers.find(t => t.id === filterTeacherId)?.name : 'Tất cả giáo viên';
        const subjectFilterName = filterSubjectId ? subjects.find(s => s.id === filterSubjectId)?.name : 'Tất cả môn học';
        const [year, month] = filterMonth.split('-');

        const tableRows = sortedLogs.map(log => `
            <tr>
                <td style="text-align: center;">${new Date(log.date).toLocaleDateString('vi-VN')}</td>
                <td>${getSubjectName(log.subjectId)}</td>
                <td style="text-align: center;">${log.className}</td>
                <td style="text-align: center;">${log.periods}</td>
            </tr>
        `).join('');

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <title>Báo Cáo Thống Kê Chi Tiết</title>
                <style>
                    body { font-family: 'Times New Roman', serif; margin: 40px; font-size: 14px; }
                    h1, h2 { text-align: center; margin: 10px 0; }
                    h1 { font-size: 20px; font-weight: bold; text-transform: uppercase; }
                    .header-info { text-align: center; margin-bottom: 30px; font-style: italic; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #333; padding: 8px; text-align: left; }
                    th { background-color: #f0f0f0; text-align: center; font-weight: bold; }
                    .total-row { font-weight: bold; background-color: #e0e0e0; }
                    .footer { margin-top: 40px; text-align: right; padding-right: 40px; }
                </style>
            </head>
            <body>
                <h1>THỐNG KÊ GIỜ DẠY</h1>
                <div class="header-info">
                    <p>Giáo viên: <strong>${teacherFilterName}</strong></p>
                    <p>Tháng: ${month}/${year} - Môn học: ${subjectFilterName}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 20%">Ngày dạy</th>
                            <th style="width: 40%">Môn dạy</th>
                            <th style="width: 20%">Lớp dạy</th>
                            <th style="width: 20%">Số tiết dạy</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                        ${tableRows ? '' : '<tr><td colspan="4" style="text-align: center; padding: 20px;">Không có dữ liệu</td></tr>'}
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="3" style="text-align: right; padding-right: 20px;">TỔNG SỐ TIẾT DẠY</td>
                            <td style="text-align: center;">${totalFilteredPeriods}</td>
                        </tr>
                    </tfoot>
                </table>
                <div class="footer">
                    <p>Ngày ..... tháng ..... năm .......</p>
                    <p>Người lập bảng</p>
                </div>
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
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bộ lọc thống kê & Báo cáo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giáo viên</label>
                        <select 
                            value={filterTeacherId} 
                            onChange={(e) => setFilterTeacherId(e.target.value)} 
                            className="block w-full pl-3 pr-10 py-2 text-base bg-gray-100 border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="">Tất cả giáo viên</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tháng</label>
                        <input 
                            type="month" 
                            value={filterMonth} 
                            onChange={(e) => setFilterMonth(e.target.value)} 
                            className="block w-full pl-3 pr-3 py-2 text-base bg-gray-100 border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Môn học</label>
                        <select 
                            value={filterSubjectId} 
                            onChange={(e) => setFilterSubjectId(e.target.value)} 
                            className="block w-full pl-3 pr-10 py-2 text-base bg-gray-100 border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="">Tất cả môn học</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <button onClick={handleExportReport} className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <DownloadIcon /> <span className="ml-2">Xuất báo cáo PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <StatCard title="Tổng số tiết dạy (Toàn bộ)" value={totalPeriods} icon={<ChartBarIcon />} />
                 <StatCard title="Tổng số phiếu sổ đầu bài (Toàn bộ)" value={totalLogs} icon={<BookOpenIcon />} />
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Thống kê chi tiết (Tổng quan)</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Giáo viên</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tuần này</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tháng này</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tổng số tiết</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Số lần nhập sổ</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {stats.map((t, idx) => (
                                <tr key={idx}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{t.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{t.week}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{t.month}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">{t.total}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{t.count}</td>
                                </tr>
                            ))}
                            {stats.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Không có dữ liệu</td>
                                </tr>
                            )}
                         </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// --- TRASH MANAGER ---

interface TrashManagerProps {
    logs: LessonLog[];
    subjects: Subject[];
    teachers: Teacher[];
    onLogsUpdate: (logs: LessonLog[]) => void;
    onSubjectsUpdate: (subjects: Subject[]) => void;
}

const TrashManager: React.FC<TrashManagerProps> = ({ logs, subjects, teachers, onLogsUpdate, onSubjectsUpdate }) => {
    const [deletedSubjects, setDeletedSubjects] = useState<Subject[]>([]);
    const [deletedLogs, setDeletedLogs] = useState<LessonLog[]>([]);

    useEffect(() => {
        setDeletedSubjects(subjects.filter(s => s.deletedAt));
        setDeletedLogs(logs.filter(l => l.deletedAt));
    }, [subjects, logs]);

    const handleRestoreSubject = (id: string) => {
        const updatedSubjects = subjects.map(s => 
            s.id === id ? { ...s, deletedAt: undefined } : s
        );
        onSubjectsUpdate(updatedSubjects);
    };

    const handlePermanentDeleteSubject = (id: string) => {
        if(window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn môn học này? Không thể khôi phục lại.")) {
            onSubjectsUpdate(subjects.filter(s => s.id !== id));
            // Cleanup orphans optionally? Nah, leave logs for manual check or let them stay deleted
        }
    };

    const handleRestoreLog = (id: string) => {
        const log = logs.find(l => l.id === id);
        // Check if subject exists/is active
        const subject = subjects.find(s => s.id === log?.subjectId);
        if (subject && subject.deletedAt) {
            alert(`Môn học "${subject.name}" của mục này đang nằm trong thùng rác. Vui lòng khôi phục môn học trước.`);
            return;
        }

        const updatedLogs = logs.map(l => 
            l.id === id ? { ...l, deletedAt: undefined } : l
        );
        onLogsUpdate(updatedLogs);
    };

    const handlePermanentDeleteLog = (id: string) => {
        if(window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn mục này?")) {
            onLogsUpdate(logs.filter(l => l.id !== id));
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-red-600 flex items-center gap-2">
                    <TrashIcon /> Môn học đã xóa
                </h3>
                {deletedSubjects.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">Thùng rác trống.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tên môn</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Giáo viên</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày xóa</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {deletedSubjects.map(s => (
                                    <tr key={s.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{s.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{teachers.find(t => t.id === s.teacherId)?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">{s.deletedAt ? new Date(s.deletedAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleRestoreSubject(s.id)} className="text-green-600 hover:text-green-900 mr-3" title="Phục hồi"><RestoreIcon /></button>
                                            <button onClick={() => handlePermanentDeleteSubject(s.id)} className="text-red-600 hover:text-red-900" title="Xóa vĩnh viễn"><DeleteIcon /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-red-600 flex items-center gap-2">
                    <TrashIcon /> Sổ đầu bài đã xóa
                </h3>
                {deletedLogs.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">Thùng rác trống.</p>
                ) : (
                    <LessonLogList 
                        logs={deletedLogs} 
                        subjects={subjects} 
                        teachers={teachers} 
                        isTrashView={true}
                        onRestore={handleRestoreLog}
                        onPermanentDelete={handlePermanentDeleteLog}
                    />
                )}
            </div>
        </div>
    );
};
