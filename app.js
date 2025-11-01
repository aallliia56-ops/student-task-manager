// Firebase Configuration (Replace with your actual Firebase config)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- الثوابت والرموز السرية ---
const TEACHER_CODE = "TEACHER1"; // الرمز السري الخاص بالمعلم

// --- DOM Elements ---
const authScreen = document.getElementById('auth-screen');
const teacherScreen = document.getElementById('teacher-screen');
const studentScreen = document.getElementById('student-screen');

const authMessage = document.getElementById('auth-message');
const loginCodeInput = document.getElementById('login-code');
const loginButton = document.getElementById('login-button');

// Teacher Screen Elements
const logoutButtonTeacher = document.getElementById('logout-button-teacher');
const teacherTabButtons = document.querySelectorAll('#teacher-screen .tab-button');
const teacherTabContents = document.querySelectorAll('#teacher-screen .tab-content');

const manageStudentsMessage = document.getElementById('manage-students-message');
const studentList = document.getElementById('student-list');

const addStudentMessage = document.getElementById('add-student-message');
const newStudentNameInput = document.getElementById('new-student-name');
const newStudentCodeInput = document.getElementById('new-student-code');
const newStudentHifzStartSelect = document.getElementById('new-student-hifz-start');
const newStudentMurajaaStartSelect = document.getElementById('new-student-murajaa-start');
const newStudentHifzGoalStartSelect = document.getElementById('new-student-hifz-goal-start');
const newStudentHifzGoalEndSelect = document.getElementById('new-student-hifz-goal-end');
const addStudentButton = document.getElementById('add-student-button');

const assignTasksMessage = document.getElementById('assign-tasks-message');
const assignTaskStudentSelect = document.getElementById('assign-task-student');
const assignTaskTypeSelect = document.getElementById('assign-task-type');
const hifzSectionSelectGroup = document.getElementById('hifz-section-select-group');
const hifzSectionSelect = document.getElementById('hifz-section-select');
const murajaaSectionSelectGroup = document.getElementById('murajaa-section-select-group');
const murajaaSectionSelect = document.getElementById('murajaa-section-select');
const assignTaskDescriptionTextarea = document.getElementById('assign-task-description');
const assignTaskPointsInput = document.getElementById('assign-task-points');
const assignTaskButton = document.getElementById('assign-task-button');

const pendingTasksMessage = document.getElementById('pending-tasks-message');
const pendingTasksList = document.getElementById('pending-tasks-list');

const leaderboardMessage = document.getElementById('leaderboard-message');
const leaderboardList = document.getElementById('leaderboard-list');

const curriculumTypeSelect = document.getElementById('curriculum-type-select');
const curriculumList = document.getElementById('curriculum-list');

// Student Screen Elements
const logoutButtonStudent = document.getElementById('logout-button-student');
const studentNameDisplay = document.getElementById('student-name-display');
const studentDashboardMessage = document.getElementById('student-dashboard-message');
const studentTotalPointsDisplay = document.getElementById('student-total-points-display');
const studentHifzProgressDisplay = document.getElementById('student-hifz-progress-display');
const studentMurajaaProgressDisplay = document.getElementById('student-murajaa-progress-display');
const studentTasksList = document.getElementById('student-tasks-list');
const studentHifzGoalDisplay = document.getElementById('student-hifz-goal-display');
const hifzProgressBar = document.getElementById('hifz-progress-bar');
const murajaaProgressBar = document.getElementById('murajaa-progress-bar');


// --- Global Variables ---
let currentUser = null; // Stores current user (student or teacher) data
let userRole = null;    // 'teacher' or 'student'


// --- Curriculum Data ---
// المنهج يمثل مقاطع الحفظ
const HifzCurriculum = [
    // المرسلات
    { surah: 'المرسلات', start_ayah: 1, end_ayah: 15, points: 5, type: 'hifz', label: 'المرسلات (1-15)' },
    { surah: 'المرسلات', start_ayah: 16, end_ayah: 24, points: 5, type: 'hifz', label: 'المرسلات (16-24)' },
    { surah: 'المرسلات', start_ayah: 25, end_ayah: 28, points: 5, type: 'hifz', label: 'المرسلات (25-28)' },
    { surah: 'المرسلات', start_ayah: 29, end_ayah: 34, points: 5, type: 'hifz', label: 'المرسلات (29-34)' },
    { surah: 'المرسلات', start_ayah: 35, end_ayah: 40, points: 5, type: 'hifz', label: 'المرسلات (35-40)' },
    { surah: 'المرسلات', start_ayah: 41, end_ayah: 50, points: 5, type: 'hifz', label: 'المرسلات (41-50)' },
    // الإنسان
    { surah: 'الإنسان', start_ayah: 1, end_ayah: 5, points: 5, type: 'hifz', label: 'الإنسان (1-5)' },
    { surah: 'الإنسان', start_ayah: 6, end_ayah: 12, points: 5, type: 'hifz', label: 'الإنسان (6-12)' },
    { surah: 'الإنسان', start_ayah: 13, end_ayah: 18, points: 5, type: 'hifz', label: 'الإنسان (13-18)' },
    { surah: 'الإنسان', start_ayah: 19, end_ayah: 23, points: 5, type: 'hifz', label: 'الإنسان (19-23)' },
    { surah: 'الإنسان', start_ayah: 24, end_ayah: 28, points: 5, type: 'hifz', label: 'الإنسان (24-28)' },
    { surah: 'الإنسان', start_ayah: 29, end_ayah: 31, points: 5, type: 'hifz', label: 'الإنسان (29-31)' },
    // القيامة
    { surah: 'القيامة', start_ayah: 1, end_ayah: 10, points: 5, type: 'hifz', label: 'القيامة (1-10)' },
    { surah: 'القيامة', start_ayah: 11, end_ayah: 19, points: 5, type: 'hifz', label: 'القيامة (11-19)' },
    { surah: 'القيامة', start_ayah: 20, end_ayah: 33, points: 5, type: 'hifz', label: 'القيامة (20-33)' },
    { surah: 'القيامة', start_ayah: 34, end_ayah: 40, points: 5, type: 'hifz', label: 'القيامة (34-40)' },
    // المدثر
    { surah: 'المدثر', start_ayah: 1, end_ayah: 10, points: 5, type: 'hifz', label: 'المدثر (1-10)' },
    { surah: 'المدثر', start_ayah: 11, end_ayah: 18, points: 5, type: 'hifz', label: 'المدثر (11-18)' },
    { surah: 'المدثر', start_ayah: 19, end_ayah: 30, points: 5, type: 'hifz', label: 'المدثر (19-30)' },
    { surah: 'المدثر', start_ayah: 31, end_ayah: 41, points: 5, type: 'hifz', label: 'المدثر (31-41)' },
    { surah: 'المدثر', start_ayah: 42, end_ayah: 47, points: 5, type: 'hifz', label: 'المدثر (42-47)' },
    { surah: 'المدثر', start_ayah: 48, end_ayah: 56, points: 5, type: 'hifz', label: 'المدثر (48-56)' },
    // المزمل
    { surah: 'المزمل', start_ayah: 1, end_ayah: 8, points: 5, type: 'hifz', label: 'المزمل (1-8)' },
    { surah: 'المزمل', start_ayah: 9, end_ayah: 14, points: 5, type: 'hifz', label: 'المزمل (9-14)' },
    { surah: 'المزمل', start_ayah: 15, end_ayah: 19, points: 5, type: 'hifz', label: 'المزمل (15-19)' },
    { surah: 'المزمل', start_ayah: 20, end_ayah: 20, points: 5, type: 'hifz', label: 'المزمل (20-20)' },
    // الجن
    { surah: 'الجن', start_ayah: 1, end_ayah: 4, points: 5, type: 'hifz', label: 'الجن (1-4)' },
    { surah: 'الجن', start_ayah: 5, end_ayah: 8, points: 5, type: 'hifz', label: 'الجن (5-8)' },
    { surah: 'الجن', start_ayah: 9, end_ayah: 11, points: 5, type: 'hifz', label: 'الجن (9-11)' },
    { surah: 'الجن', start_ayah: 12, end_ayah: 14, points: 5, type: 'hifz', label: 'الجن (12-14)' },
    { surah: 'الجن', start_ayah: 15, end_ayah: 19, points: 5, type: 'hifz', label: 'الجن (15-19)' },
    { surah: 'الجن', start_ayah: 20, end_ayah: 23, points: 5, type: 'hifz', label: 'الجن (20-23)' },
    { surah: 'الجن', start_ayah: 24, end_ayah: 28, points: 5, type: 'hifz', label: 'الجن (24-28)' },
    // نوح
    { surah: 'نوح', start_ayah: 1, end_ayah: 4, points: 5, type: 'hifz', label: 'نوح (1-4)' },
    { surah: 'نوح', start_ayah: 5, end_ayah: 10, points: 5, type: 'hifz', label: 'نوح (5-10)' },
    { surah: 'نوح', start_ayah: 11, end_ayah: 20, points: 5, type: 'hifz', label: 'نوح (11-20)' },
    { surah: 'نوح', start_ayah: 21, end_ayah: 25, points: 5, type: 'hifz', label: 'نوح (21-25)' },
    { surah: 'نوح', start_ayah: 26, end_ayah: 28, points: 5, type: 'hifz', label: 'نوح (26-28)' },
    // المعارج
    { surah: 'المعارج', start_ayah: 1, end_ayah: 10, points: 5, type: 'hifz', label: 'المعارج (1-10)' },
    { surah: 'المعارج', start_ayah: 11, end_ayah: 18, points: 5, type: 'hifz', label: 'المعارج (11-18)' },
    { surah: 'المعارج', start_ayah: 19, end_ayah: 28, points: 5, type: 'hifz', label: 'المعارج (19-28)' },
    { surah: 'المعارج', start_ayah: 29, end_ayah: 35, points: 5, type: 'hifz', label: 'المعارج (29-35)' },
    { surah: 'المعارج', start_ayah: 36, end_ayah: 40, points: 5, type: 'hifz', label: 'المعارج (36-40)' },
    { surah: 'المعارج', start_ayah: 41, end_ayah: 44, points: 5, type: 'hifz', label: 'المعارج (41-44)' },
    // الحاقة
    { surah: 'الحاقة', start_ayah: 1, end_ayah: 8, points: 5, type: 'hifz', label: 'الحاقة (1-8)' },
    { surah: 'الحاقة', start_ayah: 9, end_ayah: 18, points: 5, type: 'hifz', label: 'الحاقة (9-18)' },
    { surah: 'الحاقة', start_ayah: 19, end_ayah: 24, points: 5, type: 'hifz', label: 'الحاقة (19-24)' },
    { surah: 'الحاقة', start_ayah: 25, end_ayah: 35, points: 5, type: 'hifz', label: 'الحاقة (25-35)' },
    { surah: 'الحاقة', start_ayah: 36, end_ayah: 43, points: 5, type: 'hifz', label: 'الحاقة (36-43)' },
    { surah: 'الحاقة', start_ayah: 44, end_ayah: 52, points: 5, type: 'hifz', label: 'الحاقة (44-52)' },
    // القلم
    { surah: 'القلم', start_ayah: 1, end_ayah: 9, points: 5, type: 'hifz', label: 'القلم (1-9)' },
    { surah: 'القلم', start_ayah: 10, end_ayah: 16, points: 5, type: 'hifz', label: 'القلم (10-16)' },
    { surah: 'القلم', start_ayah: 17, end_ayah: 27, points: 5, type: 'hifz', label: 'القلم (17-27)' },
    { surah: 'القلم', start_ayah: 28, end_ayah: 33, points: 5, type: 'hifz', label: 'القلم (28-33)' },
    { surah: 'القلم', start_ayah: 34, end_ayah: 42, points: 5, type: 'hifz', label: 'القلم (34-42)' },
    { surah: 'القلم', start_ayah: 43, end_ayah: 47, points: 5, type: 'hifz', label: 'القلم (43-47)' },
    { surah: 'القلم', start_ayah: 48, end_ayah: 52, points: 5, type: 'hifz', label: 'القلم (48-52)' },
    // الملك
    { surah: 'الملك', start_ayah: 1, end_ayah: 5, points: 5, type: 'hifz', label: 'الملك (1-5)' },
    { surah: 'الملك', start_ayah: 6, end_ayah: 12, points: 5, type: 'hifz', label: 'الملك (6-12)' },
    { surah: 'الملك', start_ayah: 13, end_ayah: 19, points: 5, type: 'hifz', label: 'الملك (13-19)' },
    { surah: 'الملك', start_ayah: 20, end_ayah: 26, points: 5, type: 'hifz', label: 'الملك (20-26)' },
    { surah: 'الملك', start_ayah: 27, end_ayah: 30, points: 5, type: 'hifz', label: 'الملك (27-30)' },
    // التحريم
    { surah: 'التحريم', start_ayah: 1, end_ayah: 3, points: 5, type: 'hifz', label: 'التحريم (1-3)' },
    { surah: 'التحريم', start_ayah: 4, end_ayah: 5, points: 5, type: 'hifz', label: 'التحريم (4-5)' },
    { surah: 'التحريم', start_ayah: 6, end_ayah: 7, points: 5, type: 'hifz', label: 'التحريم (6-7)' },
    { surah: 'التحريم', start_ayah: 8, end_ayah: 10, points: 5, type: 'hifz', label: 'التحريم (8-10)' },
    { surah: 'التحريم', start_ayah: 11, end_ayah: 12, points: 5, type: 'hifz', label: 'التحريم (11-12)' },
    // الطلاق
    { surah: 'الطلاق', start_ayah: 1, end_ayah: 2, points: 5, type: 'hifz', label: 'الطلاق (1-2)' },
    { surah: 'الطلاق', start_ayah: 3, end_ayah: 5, points: 5, type: 'hifz', label: 'الطلاق (3-5)' },
    { surah: 'الطلاق', start_ayah: 6, end_ayah: 9, points: 5, type: 'hifz', label: 'الطلاق (6-9)' },
    { surah: 'الطلاق', start_ayah: 10, end_ayah: 11, points: 5, type: 'hifz', label: 'الطلاق (10-11)' },
    { surah: 'الطلاق', start_ayah: 12, end_ayah: 12, points: 5, type: 'hifz', label: 'الطلاق (12-12)' },
    // التغابن
    { surah: 'التغابن', start_ayah: 1, end_ayah: 4, points: 5, type: 'hifz', label: 'التغابن (1-4)' },
    { surah: 'التغابن', start_ayah: 5, end_ayah: 7, points: 5, type: 'hifz', label: 'التغابن (5-7)' },
    { surah: 'التغابن', start_ayah: 8, end_ayah: 9, points: 5, type: 'hifz', label: 'التغابن (8-9)' },
    { surah: 'التغابن', start_ayah: 10, end_ayah: 13, points: 5, type: 'hifz', label: 'التغابن (10-13)' },
    { surah: 'التغابن', start_ayah: 14, end_ayah: 15, points: 5, type: 'hifz', label: 'التغابن (14-15)' },
    { surah: 'التغابن', start_ayah: 16, end_ayah: 18, points: 5, type: 'hifz', label: 'التغابن (16-18)' },
    // المنافقون
    { surah: 'المنافقون', start_ayah: 1, end_ayah: 3, points: 5, type: 'hifz', label: 'المنافقون (1-3)' },
    { surah: 'المنافقون', start_ayah: 4, end_ayah: 5, points: 5, type: 'hifz', label: 'المنافقون (4-5)' },
    { surah: 'المنافقون', start_ayah: 6, end_ayah: 7, points: 5, type: 'hifz', label: 'المنافقون (6-7)' },
    { surah: 'المنافقون', start_ayah: 8, end_ayah: 9, points: 5, type: 'hifz', label: 'المنافقون (8-9)' },
    { surah: 'المنافقون', start_ayah: 10, end_ayah: 11, points: 5, type: 'hifz', label: 'المنافقون (10-11)' },
    // الجمعة
    { surah: 'الجمعة', start_ayah: 1, end_ayah: 3, points: 5, type: 'hifz', label: 'الجمعة (1-3)' },
    { surah: 'الجمعة', start_ayah: 4, end_ayah: 5, points: 5, type: 'hifz', label: 'الجمعة (4-5)' },
    { surah: 'الجمعة', start_ayah: 6, end_ayah: 8, points: 5, type: 'hifz', label: 'الجمعة (6-8)' },
    { surah: 'الجمعة', start_ayah: 9, end_ayah: 11, points: 5, type: 'hifz', label: 'الجمعة (9-11)' },
    // الصف
    { surah: 'الصف', start_ayah: 1, end_ayah: 4, points: 5, type: 'hifz', label: 'الصف (1-4)' },
    { surah: 'الصف', start_ayah: 5, end_ayah: 6, points: 5, type: 'hifz', label: 'الصف (5-6)' },
    { surah: 'الصف', start_ayah: 7, end_ayah: 9, points: 5, type: 'hifz', label: 'الصف (7-9)' },
    { surah: 'الصف', start_ayah: 10, end_ayah: 13, points: 5, type: 'hifz', label: 'الصف (10-13)' },
    { surah: 'الصف', start_ayah: 14, end_ayah: 14, points: 5, type: 'hifz', label: 'الصف (14-14)' },
    // الممتحنة
    { surah: 'الممتحنة', start_ayah: 1, end_ayah: 2, points: 5, type: 'hifz', label: 'الممتحنة (1-2)' },
    { surah: 'الممتحنة', start_ayah: 3, end_ayah: 4, points: 5, type: 'hifz', label: 'الممتحنة (3-4)' },
    { surah: 'الممتحنة', start_ayah: 5, end_ayah: 7, points: 5, type: 'hifz', label: 'الممتحنة (5-7)' },
    { surah: 'الممتحنة', start_ayah: 8, end_ayah: 9, points: 5, type: 'hifz', label: 'الممتحنة (8-9)' },
    { surah: 'الممتحنة', start_ayah: 10, end_ayah: 11, points: 5, type: 'hifz', label: 'الممتحنة (10-11)' },
    { surah: 'الممتحنة', start_ayah: 12, end_ayah: 13, points: 5, type: 'hifz', label: 'الممتحنة (12-13)' },
    // الحشر
    { surah: 'الحشر', start_ayah: 1, end_ayah: 3, points: 5, type: 'hifz', label: 'الحشر (1-3)' },
    { surah: 'الحشر', start_ayah: 4, end_ayah: 6, points: 5, type: 'hifz', label: 'الحشر (4-6)' },
    { surah: 'الحشر', start_ayah: 7, end_ayah: 8, points: 5, type: 'hifz', label: 'الحشر (7-8)' },
    { surah: 'الحشر', start_ayah: 9, end_ayah: 10, points: 5, type: 'hifz', label: 'الحشر (9-10)' },
    { surah: 'الحشر', start_ayah: 11, end_ayah: 12, points: 5, type: 'hifz', label: 'الحشر (11-12)' },
    { surah: 'الحشر', start_ayah: 13, end_ayah: 14, points: 5, type: 'hifz', label: 'الحشر (13-14)' },
    { surah: 'الحشر', start_ayah: 15, end_ayah: 19, points: 5, type: 'hifz', label: 'الحشر (15-19)' },
    { surah: 'الحشر', start_ayah: 20, end_ayah: 24, points: 5, type: 'hifz', label: 'الحشر (20-24)' },
    // المجادلة
    { surah: 'المجادلة', start_ayah: 1, end_ayah: 2, points: 5, type: 'hifz', label: 'المجادلة (1-2)' },
    { surah: 'المجادلة', start_ayah: 3, end_ayah: 4, points: 5, type: 'hifz', label: 'المجادلة (3-4)' },
    { surah: 'المجادلة', start_ayah: 5, end_ayah: 6, points: 5, type: 'hifz', label: 'المجادلة (5-6)' },
    { surah: 'المجادلة', start_ayah: 7, end_ayah: 8, points: 5, type: 'hifz', label: 'المجادلة (7-8)' },
    { surah: 'المجادلة', start_ayah: 9, end_ayah: 10, points: 5, type: 'hifz', label: 'المجادلة (9-10)' },
    { surah: 'المجادلة', start_ayah: 11, end_ayah: 12, points: 5, type: 'hifz', label: 'المجادلة (11-12)' },
    { surah: 'المجادلة', start_ayah: 13, end_ayah: 16, points: 5, type: 'hifz', label: 'المجادلة (13-16)' },
    { surah: 'المجادلة', start_ayah: 17, end_ayah: 19, points: 5, type: 'hifz', label: 'المجادلة (17-19)' },
    { surah: 'المجادلة', start_ayah: 4, end_ayah: 22, points: 5, type: 'hifz', label: 'المجادلة (20-22)' },
    // الحديد
    { surah: 'الحديد', start_ayah: 1, end_ayah: 6, points: 5, type: 'hifz', label: 'الحديد (1-6)' },
    { surah: 'الحديد', start_ayah: 7, end_ayah: 11, points: 5, type: 'hifz', label: 'الحديد (7-11)' },
    { surah: 'الحديد', start_ayah: 12, end_ayah: 15, points: 5, type: 'hifz', label: 'الحديد (12-15)' },
    { surah: 'الحديد', start_ayah: 16, end_ayah: 18, points: 5, type: 'hifz', label: 'الحديد (16-18)' },
    { surah: 'الحديد', start_ayah: 19, end_ayah: 20, points: 5, type: 'hifz', label: 'الحديد (19-20)' },
    { surah: 'الحديد', start_ayah: 21, end_ayah: 24, points: 5, type: 'hifz', label: 'الحديد (21-24)' },
    { surah: 'الحديد', start_ayah: 25, end_ayah: 27, points: 5, type: 'hifz', label: 'الحديد (25-27)' },
    { surah: 'الحديد', start_ayah: 28, end_ayah: 29, points: 5, type: 'hifz', label: 'الحديد (28-29)' },
    // الواقعة
    { surah: 'الواقعة', start_ayah: 1, end_ayah: 16, points: 5, type: 'hifz', label: 'الواقعة (1-16)' },
    { surah: 'الواقعة', start_ayah: 17, end_ayah: 40, points: 5, type: 'hifz', label: 'الواقعة (17-40)' },
    { surah: 'الواقعة', start_ayah: 41, end_ayah: 57, points: 5, type: 'hifz', label: 'الواقعة (41-57)' },
    { surah: 'الواقعة', start_ayah: 58, end_ayah: 74, points: 5, type: 'hifz', label: 'الواقعة (58-74)' },
    { surah: 'الواقعة', start_ayah: 75, end_ayah: 96, points: 5, type: 'hifz', label: 'الواقعة (75-96)' },
    // الرحمن
    { surah: 'الرحمن', start_ayah: 1, end_ayah: 18, points: 5, type: 'hifz', label: 'الرحمن (1-18)' },
    { surah: 'الرحمن', start_ayah: 19, end_ayah: 32, points: 5, type: 'hifz', label: 'الرحمن (19-32)' },
    { surah: 'الرحمن', start_ayah: 33, end_ayah: 45, points: 5, type: 'hifz', label: 'الرحمن (33-45)' },
    { surah: 'الرحمن', start_ayah: 46, end_ayah: 61, points: 5, type: 'hifz', label: 'الرحمن (46-61)' },
    { surah: 'الرحمن', start_ayah: 62, end_ayah: 78, points: 5, type: 'hifz', label: 'الرحمن (62-78)' },
    // القمر
    { surah: 'القمر', start_ayah: 1, end_ayah: 8, points: 5, type: 'hifz', label: 'القمر (1-8)' },
    { surah: 'القمر', start_ayah: 9, end_ayah: 22, points: 5, type: 'hifz', label: 'القمر (9-22)' },
    { surah: 'القمر', start_ayah: 23, end_ayah: 32, points: 5, type: 'hifz', label: 'القمر (23-32)' },
    { surah: 'القمر', start_ayah: 33, end_ayah: 42, points: 5, type: 'hifz', label: 'القمر (33-42)' },
    { surah: 'القمر', start_ayah: 43, end_ayah: 55, points: 5, type: 'hifz', label: 'القمر (43-55)' },
    // النجم
    { surah: 'النجم', start_ayah: 1, end_ayah: 18, points: 5, type: 'hifz', label: 'النجم (1-18)' },
    { surah: 'النجم', start_ayah: 19, end_ayah: 26, points: 5, type: 'hifz', label: 'النجم (19-26)' },
    { surah: 'النجم', start_ayah: 27, end_ayah: 32, points: 5, type: 'hifz', label: 'النجم (27-32)' },
    { surah: 'النجم', start_ayah: 33, end_ayah: 44, points: 5, type: 'hifz', label: 'النجم (33-44)' },
    { surah: 'النجم', start_ayah: 45, end_ayah: 62, points: 5, type: 'hifz', label: 'النجم (45-62)' },
    // الطور
    { surah: 'الطور', start_ayah: 1, end_ayah: 14, points: 5, type: 'hifz', label: 'الطور (1-14)' },
    { surah: 'الطور', start_ayah: 15, end_ayah: 23, points: 5, type: 'hifz', label: 'الطور (15-23)' },
    { surah: 'الطور', start_ayah: 24, end_ayah: 31, points: 5, type: 'hifz', label: 'الطور (24-31)' },
    { surah: 'الطور', start_ayah: 32, end_ayah: 43, points: 5, type: 'hifz', label: 'الطور (32-43)' },
    { surah: 'الطور', start_ayah: 44, end_ayah: 49, points: 5, type: 'hifz', label: 'الطور (44-49)' },
    // الذاريات
    { surah: 'الذاريات', start_ayah: 1, end_ayah: 23, points: 5, type: 'hifz', label: 'الذاريات (1-23)' },
    { surah: 'الذاريات', start_ayah: 24, end_ayah: 30, points: 5, type: 'hifz', label: 'الذاريات (24-30)' },
    { surah: 'الذاريات', start_ayah: 31, end_ayah: 42, points: 5, type: 'hifz', label: 'الذاريات (31-42)' },
    { surah: 'الذاريات', start_ayah: 43, end_ayah: 51, points: 5, type: 'hifz', label: 'الذاريات (43-51)' },
    { surah: 'الذاريات', start_ayah: 52, end_ayah: 60, points: 5, type: 'hifz', label: 'الذاريات (52-60)' },
    // ق
    { surah: 'ق', start_ayah: 1, end_ayah: 8, points: 5, type: 'hifz', label: 'ق (1-8)' },
    { surah: 'ق', start_ayah: 9, end_ayah: 15, points: 5, type: 'hifz', label: 'ق (9-15)' },
    { surah: 'ق', start_ayah: 16, end_ayah: 30, points: 5, type: 'hifz', label: 'ق (16-30)' },
    { surah: 'ق', start_ayah: 31, end_ayah: 38, points: 5, type: 'hifz', label: 'ق (31-38)' },
    { surah: 'ق', start_ayah: 39, end_ayah: 45, points: 5, type: 'hifz', label: 'ق (39-45)' },
    // الحجرات
    { surah: 'الحجرات', start_ayah: 1, end_ayah: 4, points: 5, type: 'hifz', label: 'الحجرات (1-4)' },
    { surah: 'الحجرات', start_ayah: 5, end_ayah: 8, points: 5, type: 'hifz', label: 'الحجرات (5-8)' },
    { surah: 'الحجرات', start_ayah: 9, end_ayah: 11, points: 5, type: 'hifz', label: 'الحجرات (9-11)' },
    { surah: 'الحجرات', start_ayah: 12, end_ayah: 14, points: 5, type: 'hifz', label: 'الحجرات (12-14)' },
    { surah: 'الحجرات', start_ayah: 15, end_ayah: 18, points: 5, type: 'hifz', label: 'الحجرات (15-18)' },
    // الفتح
    { surah: 'الفتح', start_ayah: 1, end_ayah: 5, points: 5, type: 'hifz', label: 'الفتح (1-5)' },
    { surah: 'الفتح', start_ayah: 6, end_ayah: 9, points: 5, type: 'hifz', label: 'الفتح (6-9)' },
    { surah: 'الفتح', start_ayah: 10, end_ayah: 13, points: 5, type: 'hifz', label: 'الفتح (10-13)' },
    { surah: 'الفتح', start_ayah: 14, end_ayah: 15, points: 5, type: 'hifz', label: 'الفتح (14-15)' },
    { surah: 'الفتح', start_ayah: 16, end_ayah: 19, points: 5, type: 'hifz', label: 'الفتح (16-19)' },
    { surah: 'الفتح', start_ayah: 20, end_ayah: 23, points: 5, type: 'hifz', label: 'الفتح (20-23)' },
    { surah: 'الفتح', start_ayah: 24, end_ayah: 26, points: 5, type: 'hifz', label: 'الفتح (24-26)' },
    { surah: 'الفتح', start_ayah: 27, end_ayah: 28, points: 5, type: 'hifz', label: 'الفتح (27-28)' },
    { surah: 'الفتح', start_ayah: 29, end_ayah: 29, points: 5, type: 'hifz', label: 'الفتح (29-29)' },
    // محمد
    { surah: 'محمد', start_ayah: 1, end_ayah: 6, points: 5, type: 'hifz', label: 'محمد (1-6)' },
    { surah: 'محمد', start_ayah: 7, end_ayah: 11, points: 5, type: 'hifz', label: 'محمد (7-11)' },
    { surah: 'محمد', start_ayah: 12, end_ayah: 15, points: 5, type: 'hifz', label: 'محمد (12-15)' },
    { surah: 'محمد', start_ayah: 16, end_ayah: 19, points: 5, type: 'hifz', label: 'محمد (16-19)' },
    { surah: 'محمد', start_ayah: 20, end_ayah: 24, points: 5, type: 'hifz', label: 'محمد (20-24)' },
    { surah: 'محمد', start_ayah: 25, end_ayah: 29, points: 5, type: 'hifz', label: 'محمد (25-29)' },
    { surah: 'محمد', start_ayah: 30, end_ayah: 34, points: 5, type: 'hifz', label: 'محمد (30-34)' },
    { surah: 'محمد', start_ayah: 35, end_ayah: 38, points: 5, type: 'hifz', label: 'محمد (35-38)' },
    // الأحقاف
    { surah: 'الأحقاف', start_ayah: 1, end_ayah: 5, points: 5, type: 'hifz', label: 'الأحقاف (1-5)' },
    { surah: 'الأحقاف', start_ayah: 6, end_ayah: 10, points: 5, type: 'hifz', label: 'الأحقاف (6-10)' },
    { surah: 'الأحقاف', start_ayah: 11, end_ayah: 14, points: 5, type: 'hifz', label: 'الأحقاف (11-14)' },
    { surah: 'الأحقاف', start_ayah: 15, end_ayah: 16, points: 5, type: 'hifz', label: 'الأحقاف (15-16)' },
    { surah: 'الأحقاف', start_ayah: 17, end_ayah: 20, points: 5, type: 'hifz', label: 'الأحقاف (17-20)' },
    { surah: 'الأحقاف', start_ayah: 21, end_ayah: 25, points: 5, type: 'hifz', label: 'الأحقاف (21-25)' },
    { surah: 'الأحقاف', start_ayah: 26, end_ayah: 28, points: 5, type: 'hifz', label: 'الأحقاف (26-28)' },
    { surah: 'الأحقاف', start_ayah: 29, end_ayah: 32, points: 5, type: 'hifz', label: 'الأحقاف (29-32)' },
    { surah: 'الأحقاف', start_ayah: 33, end_ayah: 35, points: 5, type: 'hifz', label: 'الأحقاف (33-35)' },
];


// منهج المراجعة
const MurajaaCurriculum = [
    // الأحقاف (مقسمة)
    { surah: 'الأحقاف', label: 'مراجعة الأحقاف (1-16)', points: 3, type: 'murajaa', hifz_start_index: 0, hifz_end_index: 4 }, // يمثل أول 5 مقاطع
    { surah: 'الأحقاف', label: 'مراجعة الأحقاف (17-35)', points: 3, type: 'murajaa', hifz_start_index: 5, hifz_end_index: 8 }, // يمثل آخر 4 مقاطع
    // محمد (مقسمة)
    { surah: 'محمد', label: 'مراجعة محمد (1-19)', points: 3, type: 'murajaa', hifz_start_index: 9, hifz_end_index: 12 }, // يمثل أول 4 مقاطع
    { surah: 'محمد', label: 'مراجعة محمد (20-38)', points: 3, type: 'murajaa', hifz_start_index: 13, hifz_end_index: 16 }, // يمثل آخر 4 مقاطع
    // الفتح (مقسمة)
    { surah: 'الفتح', label: 'مراجعة الفتح (1-15)', points: 3, type: 'murajaa', hifz_start_index: 17, hifz_end_index: 21 }, // يمثل أول 5 مقاطع
    { surah: 'الفتح', label: 'مراجعة الفتح (16-29)', points: 3, type: 'murajaa', hifz_start_index: 22, hifz_end_index: 25 }, // يمثل آخر 4 مقاطع
    // الحجرات (كاملة)
    { surah: 'الحجرات', label: 'مراجعة الحجرات (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 26, hifz_end_index: 30 }, // تمثل جميع مقاطع الحجرات
    // ق (كاملة)
    { surah: 'ق', label: 'مراجعة ق (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 31, hifz_end_index: 35 },
    // الذاريات (كاملة)
    { surah: 'الذاريات', label: 'مراجعة الذاريات (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 36, hifz_end_index: 40 },
    // الطور (كاملة)
    { surah: 'الطور', label: 'مراجعة الطور (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 41, hifz_end_index: 45 },
    // النجم (كاملة)
    { surah: 'النجم', label: 'مراجعة النجم (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 46, hifz_end_index: 50 },
    // القمر (كاملة)
    { surah: 'القمر', label: 'مراجعة القمر (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 51, hifz_end_index: 55 },
    // الرحمن (كاملة)
    { surah: 'الرحمن', label: 'مراجعة الرحمن (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 56, hifz_end_index: 60 },
    // الواقعة (كاملة)
    { surah: 'الواقعة', label: 'مراجعة الواقعة (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 61, hifz_end_index: 65 },
    // الحديد (مقسمة)
    { surah: 'الحديد', label: 'مراجعة الحديد (1-18)', points: 3, type: 'murajaa', hifz_start_index: 66, hifz_end_index: 69 },
    { surah: 'الحديد', label: 'مراجعة الحديد (19-29)', points: 3, type: 'murajaa', hifz_start_index: 70, hifz_end_index: 73 },
    // المجادلة (مقسمة)
    { surah: 'المجادلة', label: 'مراجعة المجادلة (1-12)', points: 3, type: 'murajaa', hifz_start_index: 74, hifz_end_index: 79 },
    { surah: 'المجادلة', label: 'مراجعة المجادلة (13-22)', points: 3, type: 'murajaa', hifz_start_index: 80, hifz_end_index: 82 },
    // الحشر (مقسمة)
    { surah: 'الحشر', label: 'مراجعة الحشر (1-12)', points: 3, type: 'murajaa', hifz_start_index: 83, hifz_end_index: 88 },
    { surah: 'الحشر', label: 'مراجعة الحشر (13-24)', points: 3, type: 'murajaa', hifz_start_index: 89, hifz_end_index: 90 },
    // الممتحنة (مقسمة)
    { surah: 'الممتحنة', label: 'مراجعة الممتحنة (1-7)', points: 3, type: 'murajaa', hifz_start_index: 91, hifz_end_index: 93 },
    { surah: 'الممتحنة', label: 'مراجعة الممتحنة (8-13)', points: 3, type: 'murajaa', hifz_start_index: 94, hifz_end_index: 96 },
    // الصف (كاملة)
    { surah: 'الصف', label: 'مراجعة الصف (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 97, hifz_end_index: 101 },
    // الجمعة (كاملة)
    { surah: 'الجمعة', label: 'مراجعة الجمعة (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 102, hifz_end_index: 105 },
    // المنافقون (كاملة)
    { surah: 'المنافقون', label: 'مراجعة المنافقون (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 106, hifz_end_index: 109 },
    // التغابن (كاملة)
    { surah: 'التغابن', label: 'مراجعة التغابن (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 110, hifz_end_index: 115 },
    // الطلاق (كاملة)
    { surah: 'الطلاق', label: 'مراجعة الطلاق (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 116, hifz_end_index: 120 },
    // التحريم (كاملة)
    { surah: 'التحريم', label: 'مراجعة التحريم (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 121, hifz_end_index: 125 },
    // الملك (كاملة)
    { surah: 'الملك', label: 'مراجعة الملك (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 126, hifz_end_index: 130 },
    // القلم (كاملة)
    { surah: 'القلم', label: 'مراجعة القلم (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 131, hifz_end_index: 137 },
    // الحاقة (كاملة)
    { surah: 'الحاقة', label: 'مراجعة الحاقة (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 138, hifz_end_index: 143 },
    // المعارج (كاملة)
    { surah: 'المعارج', label: 'مراجعة المعارج (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 144, hifz_end_index: 149 },
    // نوح (كاملة)
    { surah: 'نوح', label: 'مراجعة نوح (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 150, hifz_end_index: 154 },
    // الجن (كاملة)
    { surah: 'الجن', label: 'مراجعة الجن (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 155, hifz_end_index: 161 },
    // المزمل (كاملة)
    { surah: 'المزمل', label: 'مراجعة المزمل (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 162, hifz_end_index: 165 },
    // المدثر (كاملة)
    { surah: 'المدثر', label: 'مراجعة المدثر (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 166, hifz_end_index: 171 },
    // القيامة (كاملة)
    { surah: 'القيامة', label: 'مراجعة القيامة (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 172, hifz_end_index: 175 },
    // الإنسان (كاملة)
    { surah: 'الإنسان', label: 'مراجعة الإنسان (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 176, hifz_end_index: 181 },
    // المرسلات (كاملة)
    { surah: 'المرسلات', label: 'مراجعة المرسلات (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 182, hifz_end_index: 187 },
    // النبأ
    { surah: 'النبأ', label: 'مراجعة النبأ (كاملة)', points: 3, type: 'murajaa', hifz_start_index: -1, hifz_end_index: -1 }, // افتراض أنها بعد المرسلات
    // النازعات
    { surah: 'النازعات', label: 'مراجعة النازعات (كاملة)', points: 3, type: 'murajaa', hifz_start_index: -1, hifz_end_index: -1 },
    // عبس والتكوير
    { surah: 'عبس والتكوير', label: 'مراجعة عبس والتكوير', points: 3, type: 'murajaa', hifz_start_index: -1, hifz_end_index: -1 },
    // الإنفطار والمطففين
    { surah: 'الإنفطار والمطففين', label: 'مراجعة الإنفطار والمطففين', points: 3, type: 'murajaa', hifz_start_index: -1, hifz_end_index: -1 },
    // الإنشقاق والبروج
    { surah: 'الإنشقاق والبروج', label: 'مراجعة الإنشقاق والبروج', points: 3, type: 'murajaa', hifz_start_index: -1, hifz_end_index: -1 },
    // الطارق إلى الفجر
    { surah: 'الطارق إلى الفجر', label: 'مراجعة الطارق إلى الفجر', points: 3, type: 'murajaa', hifz_start_index: -1, hifz_end_index: -1 },
    // البلد إلى الناس
    { surah: 'البلد إلى الناس', label: 'مراجعة البلد إلى الناس', points: 3, type: 'murajaa', hifz_start_index: -1, hifz_end_index: -1 },
];

// Helper to generate unique IDs
function generateUniqueId() {
    return db.collection('dummy').doc().id;
}


// --- Helper Functions ---
function showMessage(element, msg, type) {
    element.textContent = msg;
    element.className = `message ${type}`;
    element.classList.remove('hidden');
    setTimeout(() => {
        element.classList.add('hidden');
    }, 5000);
}

function hideAllScreens() {
    authScreen.classList.add('hidden');
    teacherScreen.classList.add('hidden');
    studentScreen.classList.add('hidden');
}

function setActiveTab(tabId) {
    teacherTabButtons.forEach(button => {
        if (button.dataset.tab + '-tab' === tabId) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    teacherTabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    });
}

function populateCurriculumSelects() {
    // Populate Hifz Start/Progress Selects
    newStudentHifzStartSelect.innerHTML = '';
    newStudentHifzGoalStartSelect.innerHTML = '';
    newStudentHifzGoalEndSelect.innerHTML = '';
    hifzSectionSelect.innerHTML = '';

    HifzCurriculum.forEach((section, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = section.name;
        newStudentHifzStartSelect.appendChild(option.cloneNode(true));
        newStudentHifzGoalStartSelect.appendChild(option.cloneNode(true));
        newStudentHifzGoalEndSelect.appendChild(option.cloneNode(true));
        hifzSectionSelect.appendChild(option.cloneNode(true));
    });

    // Set default selected for goals to cover full range
    if (newStudentHifzGoalStartSelect.options.length > 0) {
        newStudentHifzGoalStartSelect.value = 0;
    }
    if (newStudentHifzGoalEndSelect.options.length > 0) {
        newStudentHifzGoalEndSelect.value = HifzCurriculum.length - 1;
    }

    // Populate Murajaa Start/Progress Selects
    newStudentMurajaaStartSelect.innerHTML = '';
    murajaaSectionSelect.innerHTML = '';

    MurajaaCurriculum.forEach((section, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = section.name;
        newStudentMurajaaStartSelect.appendChild(option.cloneNode(true));
        murajaaSectionSelect.appendChild(option.cloneNode(true));
    });
}

function displayCurriculumsInTeacherPanel() {
    const selectedCurriculumType = curriculumTypeSelect.value;
    const curriculumData = selectedCurriculumType === 'hifz' ? HifzCurriculum : MurajaaCurriculum;

    curriculumList.innerHTML = '';
    if (curriculumData.length === 0) {
        curriculumList.innerHTML = '<p>لا يوجد منهج محدد.</p>';
        return;
    }

    curriculumData.forEach((section, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'task-item';
        listItem.innerHTML = `
            <div class="task-description">${index + 1}. ${section.name}</div>
        `;
        curriculumList.appendChild(listItem);
    });
}


// --- Authentication & Routing ---
async function handleLogin(code) {
    if (code === TEACHER_CODE) {
        userRole = 'teacher';
        showTeacherScreen();
        return;
    }

    try {
        const studentsRef = db.collection('students');
        const querySnapshot = await studentsRef.where('code', '==', code).limit(1).get();

        if (querySnapshot.empty) {
            showMessage(authMessage, 'رمز الدخول غير صحيح. يرجى التحقق وإعادة المحاولة.', 'error');
            return;
        }

        currentUser = querySnapshot.docs[0].data();
        currentUser.id = querySnapshot.docs[0].id; // Store Firestore doc ID
        userRole = 'student';
        showStudentScreen();
    } catch (error) {
        showMessage(authMessage, `خطأ في تسجيل الدخول: ${error.message}`, 'error');
        console.error("Login error:", error);
    }
}

function logoutUser() {
    currentUser = null;
    userRole = null;
    hideAllScreens();
    authScreen.classList.remove('hidden');
    loginCodeInput.value = '';
}

// --- Screen Display Functions ---
function showTeacherScreen() {
    hideAllScreens();
    teacherScreen.classList.remove('hidden');
    setActiveTab('manage-students-tab'); // Default tab
    loadStudentsForTeacher();
    populateCurriculumSelects(); 
    displayCurriculumsInTeacherPanel();
}

async function showStudentScreen() {
    if (!currentUser || userRole !== 'student') {
        logoutUser();
        return;
    }
    hideAllScreens();
    studentScreen.classList.remove('hidden');
    displayStudentDashboard(currentUser);

    // Setup real-time listener for student's data
    db.collection('students').doc(currentUser.id).onSnapshot((docSnapshot) => {
        if (docSnapshot.exists) {
            currentUser = docSnapshot.data();
            currentUser.id = docSnapshot.id;
            displayStudentDashboard(currentUser);
        } else {
            logoutUser();
        }
    }, (error) => {
        console.error("Error listening to student data:", error);
        showMessage(studentDashboardMessage, `حدث خطأ أثناء تحديث بياناتك: ${error.message}`, 'error');
    });
}


// --- Teacher Functions ---

async function loadStudentsForTeacher() {
    studentList.innerHTML = '<li>جارٍ تحميل الطلاب...</li>';
    try {
        const studentsRef = db.collection('students');
        const querySnapshot = await studentsRef.orderBy('name', 'asc').get(); 

        studentList.innerHTML = '';
        if (querySnapshot.empty) {
            studentList.innerHTML = '<p>لا يوجد طلاب مسجلون حاليًا.</p>';
            return;
        }

        querySnapshot.forEach(doc => {
            const student = doc.data();
            const listItem = document.createElement('li');
            listItem.className = 'student-item';
            
            // Calculate progress to display
            const hifzStart = student.hifz_goal_start_index;
            const hifzEnd = student.hifz_goal_end_index;
            const goalText = (hifzStart !== undefined && hifzEnd !== undefined) 
                ? `${HifzCurriculum[hifzStart]?.name || ''} إلى ${HifzCurriculum[hifzEnd]?.name || ''}` 
                : 'لم يحدد';

            listItem.innerHTML = `
                <div class="student-details">
                    <h4>${student.name} (${student.code})</h4>
                    <p>النقاط: ${student.total_points || 0}</p>
                    <p>الحفظ: ${HifzCurriculum[student.hifz_progress]?.name || 'غير محدد'}</p>
                    <p>المراجعة: ${MurajaaCurriculum[student.murajaa_progress]?.name || 'غير محدد'}</p>
                    <p>هدف الحفظ: ${goalText}</p>
                </div>
                <div class="student-actions">
                    <button class="delete-student-btn" data-id="${doc.id}">حذف</button>
                </div>
            `;
            studentList.appendChild(listItem);
        });

        document.querySelectorAll('.delete-student-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const studentId = button.dataset.id;
                if (confirm('هل أنت متأكد من حذف هذا الطالب؟ سيتم حذف جميع بياناته.')) {
                    await db.collection('students').doc(studentId).delete();
                    showMessage(manageStudentsMessage, 'تم حذف الطالب بنجاح.', 'success');
                    loadStudentsForTeacher();
                }
            });
        });

        assignTaskStudentSelect.innerHTML = '<option value="">اختر الطالب</option>';
        querySnapshot.forEach(doc => {
            const student = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${student.name} (${student.code})`;
            assignTaskStudentSelect.appendChild(option);
        });

    } catch (error) {
        showMessage(manageStudentsMessage, `خطأ في تحميل الطلاب: ${error.message}`, 'error');
        console.error("Error loading students:", error);
    }
}

async function addStudent() {
    const name = newStudentNameInput.value.trim();
    const code = newStudentCodeInput.value.trim();
    const hifzStart = parseInt(newStudentHifzStartSelect.value);
    const murajaaStart = parseInt(newStudentMurajaaStartSelect.value);
    const hifzGoalStart = parseInt(newStudentHifzGoalStartSelect.value);
    const hifzGoalEnd = parseInt(newStudentHifzGoalEndSelect.value);

    if (!name || !code || isNaN(hifzStart) || isNaN(murajaaStart) || isNaN(hifzGoalStart) || isNaN(hifzGoalEnd) || hifzGoalStart > hifzGoalEnd) {
        showMessage(addStudentMessage, 'الرجاء تعبئة جميع الحقول بشكل صحيح. (تأكد أن بداية الهدف قبل النهاية)', 'error');
        return;
    }

    try {
        const existingStudent = await db.collection('students').where('code', '==', code).limit(1).get();
        if (!existingStudent.empty) {
            showMessage(addStudentMessage, 'رمز الطالب هذا مستخدم بالفعل.', 'error');
            return;
        }

        await db.collection('students').add({
            name: name,
            code: code,
            hifz_progress: hifzStart,
            murajaa_progress: murajaaStart,
            total_points: 0,
            tasks: [],
            hifz_goal_start_index: hifzGoalStart,
            hifz_goal_end_index: hifzGoalEnd,
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        showMessage(addStudentMessage, 'تم إضافة الطالب بنجاح!', 'success');
        newStudentNameInput.value = '';
        newStudentCodeInput.value = '';
        populateCurriculumSelects();
        loadStudentsForTeacher();
    } catch (error) {
        showMessage(addStudentMessage, `خطأ في إضافة الطالب: ${error.message}`, 'error');
        console.error("Error adding student:", error);
    }
}

async function assignTask() {
    const studentId = assignTaskStudentSelect.value;
    const taskType = assignTaskTypeSelect.value;
    let description = assignTaskDescriptionTextarea.value.trim();
    const points = parseInt(assignTaskPointsInput.value);

    if (!studentId || !taskType || !description || isNaN(points) || points <= 0) {
        showMessage(assignTasksMessage, 'الرجاء تعبئة جميع الحقول بشكل صحيح.', 'error');
        return;
    }
    
    let curriculumIndex = null;
    
    // Auto-fill description and set index
    if (taskType === 'hifz' && hifzSectionSelect.value !== '') {
        curriculumIndex = parseInt(hifzSectionSelect.value);
        description = `حفظ ${HifzCurriculum[curriculumIndex].name}`;
    } else if (taskType === 'murajaa' && murajaaSectionSelect.value !== '') {
        curriculumIndex = parseInt(murajaaSectionSelect.value);
        description = `مراجعة ${MurajaaCurriculum[curriculumIndex].name}`;
    } else if ((taskType === 'hifz' || taskType === 'murajaa') && description === '') {
         showMessage(assignTasksMessage, 'الرجاء اختيار مقطع للمهمة.', 'error');
         return;
    }


    try {
        const studentDocRef = db.collection('students').doc(studentId);
        const studentDoc = await studentDocRef.get();
        if (!studentDoc.exists) {
            showMessage(assignTasksMessage, 'الطالب غير موجود.', 'error');
            return;
        }

        const newTask = {
            id: generateUniqueId(),
            type: taskType,
            description: description,
            points: points,
            completed: false,
            assigned_at: firebase.firestore.FieldValue.serverTimestamp(),
            curriculum_index: curriculumIndex // Null for general tasks
        };

        await studentDocRef.update({
            tasks: firebase.firestore.FieldValue.arrayUnion(newTask)
        });

        showMessage(assignTasksMessage, 'تم تعيين المهمة بنجاح!', 'success');
        assignTaskDescriptionTextarea.value = '';
        assignTaskPointsInput.value = '10';
        assignTaskTypeSelect.value = '';
        hifzSectionSelectGroup.style.display = 'none';
        murajaaSectionSelectGroup.style.display = 'none';
    } catch (error) {
        showMessage(assignTasksMessage, `خطأ في تعيين المهمة: ${error.message}`, 'error');
        console.error("Error assigning task:", error);
    }
}

async function loadPendingTasks() {
    pendingTasksList.innerHTML = '<li>جارٍ البحث عن مهام قيد المراجعة...</li>';
    pendingTasksMessage.classList.add('hidden');
    
    try {
        const studentsColRef = db.collection('students');
        const snapshot = await studentsColRef.get();
        let pendingCount = 0;

        pendingTasksList.innerHTML = '';
        
        snapshot.forEach(studentDoc => {
            const student = studentDoc.data();
            const studentId = studentDoc.id;
            student.tasks.forEach(task => {
                if (task.status === 'pending') {
                    pendingCount++;
                    const listItem = document.createElement('li');
                    listItem.className = 'pending-task-item';
                    listItem.innerHTML = `
                        <div class="pending-task-details">
                            <span>**الطالب:** ${student.name} (${student.code}) | **المهمة:** ${task.description} | **النقاط:** ${task.points}</span>
                        </div>
                        <div class="pending-task-actions">
                            <button class="approve-btn" data-student-id="${studentId}" data-task-id="${task.id}" data-points="${task.points}" data-type="${task.type}" data-curriculum-index="${task.curriculum_index !== null ? task.curriculum_index : -1}">موافقة</button>
                            <button class="reject-btn" data-student-id="${studentId}" data-task-id="${task.id}">رفض</button>
                        </div>
                    `;
                    pendingTasksList.appendChild(listItem);
                }
            });
        });

        if (pendingCount === 0) {
            pendingTasksList.innerHTML = '<li style="color: green; font-weight: bold;">لا توجد مهام قيد المراجعة حاليًا.</li>';
        }

        document.querySelectorAll('.approve-btn').forEach(button => {
            button.addEventListener('click', () => approveTask(
                button.dataset.studentId, 
                button.dataset.taskId, 
                parseInt(button.dataset.points), 
                button.dataset.type,
                parseInt(button.dataset.curriculumIndex)
            ));
        });

        document.querySelectorAll('.reject-btn').forEach(button => {
            button.addEventListener('click', () => rejectTask(
                button.dataset.studentId, 
                button.dataset.taskId
            ));
        });
        
    } catch (error) {
        showMessage(pendingTasksMessage, 'خطأ في تحميل مهام المراجعة.', 'error');
        console.error("Error loading pending tasks: ", error);
    }
}

async function approveTask(studentId, taskId, points, taskType, curriculumIndex) {
    try {
        const studentDocRef = db.collection('students').doc(studentId);
        const docSnapshot = await studentDocRef.get();
        if (!docSnapshot.exists()) return;
        
        const student = docSnapshot.data();
        const taskIndex = student.tasks.findIndex(t => t.id === taskId);

        if (taskIndex !== -1 && student.tasks[taskIndex].status === 'pending') {
            student.tasks[taskIndex].status = 'approved';
            student.tasks[taskIndex].completed = true;
            student.total_points = (student.total_points || 0) + points;
            
            // Update Hifz/Murajaa Progress
            if (taskType === 'hifz' && curriculumIndex !== -1 && student.hifz_progress <= curriculumIndex) {
                student.hifz_progress = Math.min(curriculumIndex + 1, HifzCurriculum.length);
            } else if (taskType === 'murajaa' && curriculumIndex !== -1 && student.murajaa_progress <= curriculumIndex) {
                 student.murajaa_progress = Math.min(curriculumIndex + 1, MurajaaCurriculum.length);
            }

            await studentDocRef.update({
                tasks: student.tasks,
                total_points: student.total_points,
                hifz_progress: student.hifz_progress,
                murajaa_progress: student.murajaa_progress
            });

            showMessage(pendingTasksMessage, `تمت الموافقة على مهمة الطالب ${student.name} وإضافة ${points} نقطة.`, 'success');
            loadPendingTasks();
        }

    } catch (error) {
        showMessage(pendingTasksMessage, `خطأ في الموافقة: ${error.message}`, 'error');
        console.error("Error approving task: ", error);
    }
}

async function rejectTask(studentId, taskId) {
    try {
        const studentDocRef = db.collection('students').doc(studentId);
        const docSnapshot = await studentDocRef.get();
        if (!docSnapshot.exists()) return;
        
        const student = docSnapshot.data();
        const taskIndex = student.tasks.findIndex(t => t.id === taskId);

        if (taskIndex !== -1 && student.tasks[taskIndex].status === 'pending') {
            
            // Reset task status to allow re-submission
            delete student.tasks[taskIndex].status; 
            student.tasks[taskIndex].completed = false; 
            
            await studentDocRef.update({
                tasks: student.tasks,
            });

            showMessage(pendingTasksMessage, `تم رفض مهمة الطالب ${student.name}. سيتمكن من إعادة إرسالها.`, 'error');
            loadPendingTasks();
        }

    } catch (error) {
        showMessage(pendingTasksMessage, `خطأ في الرفض: ${error.message}`, 'error');
        console.error("Error rejecting task: ", error);
    }
}

async function loadLeaderboard() {
    leaderboardList.innerHTML = '<li>جارٍ تحميل الترتيب...</li>';
    leaderboardMessage.classList.add('hidden');
    try {
        const studentsRef = db.collection('students');
        // Order by total_points in descending order, then by name for tie-breaking
        const querySnapshot = await studentsRef.orderBy('total_points', 'desc').orderBy('name', 'asc').get();

        leaderboardList.innerHTML = '';
        if (querySnapshot.empty) {
            leaderboardList.innerHTML = '<li style="color: gray;">لا يوجد طلاب في الترتيب بعد.</li>';
            return;
        }

        let rank = 1;
        querySnapshot.forEach(doc => {
            const student = doc.data();
            const listItem = document.createElement('li');
            listItem.className = 'leaderboard-item';
            listItem.innerHTML = `
                <div class="leaderboard-details">
                    <span><strong>المركز ${rank}.</strong> ${student.name} (${student.code})</span>
                </div>
                <div>
                    <span>النقاط: <strong>${student.total_points || 0}</strong></span>
                </div>
            `;
            leaderboardList.appendChild(listItem);
            rank++;
        });

    } catch (error) {
        showMessage(leaderboardMessage, `خطأ في تحميل الترتيب: ${error.message}`, 'error');
        console.error("Error loading leaderboard:", error);
    }
}


// --- Student Functions ---

function calculateHifzGoalProgress(student) {
    let percentage = 0;
    let goalText = 'لم يحدد لك المعلم هدفًا بعد.';
    
    if (student.hifz_goal_start_index !== undefined && student.hifz_goal_end_index !== undefined && student.hifz_goal_start_index <= student.hifz_goal_end_index) {
        const goalStart = student.hifz_goal_start_index;
        const goalEnd = student.hifz_goal_end_index;
        
        const totalGoalSections = (goalEnd - goalStart) + 1;
        
        const completedSectionsWithinGoal = Math.max(0, Math.min(student.hifz_progress, goalEnd + 1) - goalStart);
        
        percentage = (totalGoalSections > 0) ? Math.floor((completedSectionsWithinGoal / totalGoalSections) * 100) : 0;
        
        goalText = `هدف الحفظ: من ${HifzCurriculum[goalStart]?.name || 'بداية الهدف'} إلى ${HifzCurriculum[goalEnd]?.name || 'نهاية الهدف'}`;
    }
    return { percentage, goalText };
}

async function displayStudentDashboard(student) {
    studentNameDisplay.textContent = `أهلاً بك يا ${student.name}!`;
    studentTotalPointsDisplay.textContent = student.total_points || 0;

    // Display Hifz/Murajaa Progress Names
    const currentHifzSection = HifzCurriculum[student.hifz_progress];
    studentHifzProgressDisplay.textContent = currentHifzSection ? `وصلت إلى: ${currentHifzSection.name}` : 'لم تبدأ الحفظ بعد.';
    const currentMurajaaSection = MurajaaCurriculum[student.murajaa_progress];
    studentMurajaaProgressDisplay.textContent = currentMurajaaSection ? `وصلت إلى: ${currentMurajaaSection.name}` : 'لم تبدأ المراجعة بعد.';

    // Hifz Goal Progress
    const { percentage: hifzGoalPercentage, goalText: hifzGoalText } = calculateHifzGoalProgress(student);
    studentHifzGoalDisplay.textContent = hifzGoalText;
    hifzProgressBar.style.width = `${hifzGoalPercentage}%`;
    hifzProgressBar.textContent = `${hifzGoalPercentage}%`;

    // --- Display Limited Tasks Logic ---
    studentTasksList.innerHTML = '';
    const activeTasks = student.tasks.filter(t => !t.completed && t.status !== 'pending');

    const availableHifzTasks = activeTasks.filter(t => t.type === 'hifz');
    const availableMurajaaTasks = activeTasks.filter(t => t.type === 'murajaa');
    const availableGeneralTasks = activeTasks.filter(t => t.type === 'general');

    availableHifzTasks.sort((a, b) => (a.curriculum_index || 0) - (b.curriculum_index || 0));
    availableMurajaaTasks.sort((a, b) => (a.curriculum_index || 0) - (b.curriculum_index || 0));

    let tasksToDisplay = [];

    // 1. Add up to 2 Hifz tasks relevant to current progress
    let hifzTasksAdded = 0;
    for (const task of availableHifzTasks) {
        if ((task.curriculum_index || 0) >= student.hifz_progress) {
             tasksToDisplay.push(task);
             hifzTasksAdded++;
             if (hifzTasksAdded >= 2) break;
        }
    }

    // 2. Add up to 2 Murajaa tasks relevant to current progress
    let murajaaTasksAdded = 0;
    for (const task of availableMurajaaTasks) {
         if ((task.curriculum_index || 0) >= student.murajaa_progress) {
             tasksToDisplay.push(task);
             murajaaTasksAdded++;
             if (murajaaTasksAdded >= 2) break;
        }
    }

    // 3. Add all general tasks
    tasksToDisplay = tasksToDisplay.concat(availableGeneralTasks);

    const pendingTasksCount = student.tasks.filter(t => t.status === 'pending').length;

    if (tasksToDisplay.length === 0 && pendingTasksCount === 0) {
        studentTasksList.innerHTML = '<p>لا توجد مهام حاليًا. وفقك الله.</p>';
    } else if (pendingTasksCount > 0) {
        studentTasksList.innerHTML = `<p style="color: blue;">لديك ${pendingTasksCount} مهمة قيد المراجعة. انتظر موافقة المعلم.</p>`;
    }


    tasksToDisplay.forEach(task => {
        let buttonDisabled = '';
        let buttonText = 'إنجاز';
        
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.type}`; 
        taskElement.innerHTML = `
            <div class="task-description">المهمة: ${task.description}</div>
            <div class="task-points">النقاط: ${task.points}</div>
            <div class="task-status">الحالة: <strong>قيد الإنجاز</strong></div>
            <div class="task-actions">
                <button class="complete-btn" data-task-id="${task.id}" ${buttonDisabled}>
                    ${buttonText}
                </button>
            </div>
        `;
        taskElement.querySelector('.complete-btn').addEventListener('click', () => completeTask(student.id, task.id));

        studentTasksList.appendChild(taskElement);
    });
}

async function completeTask(studentId, taskId) {
    try {
        const studentDocRef = db.collection('students').doc(studentId);
        const docSnapshot = await studentDocRef.get();
        if (!docSnapshot.exists()) return;
        
        const student = docSnapshot.data();
        const taskIndex = student.tasks.findIndex(t => t.id === taskId);

        if (taskIndex !== -1 && !student.tasks[taskIndex].completed && student.tasks[taskIndex].status !== 'pending') {
            
            student.tasks[taskIndex].status = 'pending'; 

            await studentDocRef.update({
                tasks: student.tasks,
            });

            showMessage(studentDashboardMessage, `تم إرسال المهمة للمراجعة. انتظر موافقة المعلم.`, 'success');
        }

    } catch (error) {
        console.error("Error setting task to pending: ", error);
        showMessage(studentDashboardMessage, `حدث خطأ أثناء إرسال المهمة للمراجعة: ${error.message}`, 'error');
    }
}


// --- Event Listeners ---

// Auth Screen
loginButton.addEventListener('click', () => {
    const code = loginCodeInput.value.trim();
    if (code) {
        handleLogin(code);
    } else {
        showMessage(authMessage, 'الرجاء إدخال رمز الدخول.', 'error');
    }
});

// Teacher Screen
logoutButtonTeacher.addEventListener('click', logoutUser);
logoutButtonStudent.addEventListener('click', logoutUser);

teacherTabButtons.forEach(button => {
    button.addEventListener('click', () => {
        setActiveTab(`${button.dataset.tab}-tab`);
        
        if (button.dataset.tab === 'manage-students') {
            loadStudentsForTeacher();
        } else if (button.dataset.tab === 'pending-tasks') {
            loadPendingTasks();
        } else if (button.dataset.tab === 'leaderboard') {
            loadLeaderboard();
        } else if (button.dataset.tab === 'manage-curriculum') {
            displayCurriculumsInTeacherPanel();
        }
        
        if (button.dataset.tab === 'add-student' || button.dataset.tab === 'assign-tasks') {
             populateCurriculumSelects();
        }
    });
});

addStudentButton.addEventListener('click', addStudent);

// Assign Task tab selects
assignTaskTypeSelect.addEventListener('change', () => {
    const selectedType = assignTaskTypeSelect.value;
    hifzSectionSelectGroup.style.display = 'none';
    murajaaSectionSelectGroup.style.display = 'none';
    assignTaskDescriptionTextarea.readOnly = false;
    assignTaskDescriptionTextarea.value = '';

    if (selectedType === 'hifz') {
        hifzSectionSelectGroup.style.display = 'block';
        assignTaskDescriptionTextarea.readOnly = true;
        assignTaskDescriptionTextarea.value = HifzCurriculum[parseInt(hifzSectionSelect.value)]?.name ? `حفظ ${HifzCurriculum[parseInt(hifzSectionSelect.value)].name}` : '';
    } else if (selectedType === 'murajaa') {
        murajaaSectionSelectGroup.style.display = 'block';
        assignTaskDescriptionTextarea.readOnly = true;
        assignTaskDescriptionTextarea.value = MurajaaCurriculum[parseInt(murajaaSectionSelect.value)]?.name ? `مراجعة ${MurajaaCurriculum[parseInt(murajaaSectionSelect.value)].name}` : '';
    }
});

hifzSectionSelect.addEventListener('change', () => {
    if (assignTaskTypeSelect.value === 'hifz') {
        assignTaskDescriptionTextarea.value = `حفظ ${HifzCurriculum[parseInt(hifzSectionSelect.value)].name}`;
    }
});

murajaaSectionSelect.addEventListener('change', () => {
    if (assignTaskTypeSelect.value === 'murajaa') {
        assignTaskDescriptionTextarea.value = `مراجعة ${MurajaaCurriculum[parseInt(murajaaSectionSelect.value)].name}`;
    }
});

assignTaskButton.addEventListener('click', assignTask);

curriculumTypeSelect.addEventListener('change', displayCurriculumsInTeacherPanel);

// Initial Load
hideAllScreens();
authScreen.classList.remove('hidden');
