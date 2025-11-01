// Firebase Configuration (Replace with your actual config)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = app.firestore();
const auth = app.auth();

// --- DOM Elements ---
const authScreen = document.getElementById('auth-screen');
const studentScreen = document.getElementById('student-screen');
const teacherScreen = document.getElementById('teacher-screen');

const userCodeInput = document.getElementById('user-code');
const loginButton = document.getElementById('login-button');
const authMessage = document.getElementById('auth-message');

const welcomeStudent = document.getElementById('welcome-student');
const studentHifzProgress = document.getElementById('student-hifz-progress');
const studentMurajaaProgress = document.getElementById('student-murajaa-progress');
const studentTotalPoints = document.getElementById('student-total-points');
const studentTasksDiv = document.getElementById('student-tasks');
const logoutButtonStudent = document.getElementById('logout-button-student');
const logoutButtonTeacher = document.getElementById('logout-button-teacher');

const manageStudentsTab = document.getElementById('manage-students-tab');
const addStudentTab = document.getElementById('add-student-tab');
const manageCurriculumTab = document.getElementById('manage-curriculum-tab');
const assignTasksTab = document.getElementById('assign-tasks-tab');
const tabButtons = document.querySelectorAll('.tab-button');

const studentList = document.getElementById('student-list');
const newStudentCodeInput = document.getElementById('new-student-code');
const newStudentNameInput = document.getElementById('new-student-name');

// --- عناصر الـ DOM الجديدة للتعديل ---
const newStudentHifzSurah = document.getElementById('new-student-hifz-surah');
const newStudentHifzAyah = document.getElementById('new-student-hifz-ayah');
const newStudentMurajaaUnit = document.getElementById('new-student-murajaa-unit');
// ------------------------------------

const registerStudentButton = document.getElementById('register-student-button');
const registerStudentMessage = document.getElementById('register-student-message');

const assignTaskStudentCode = document.getElementById('assign-task-student-code');
const assignTaskType = document.getElementById('assign-task-type');
const assignTaskDescription = document.getElementById('assign-task-description');
const assignTaskPoints = document.getElementById('assign-task-points');
const assignIndividualTaskButton = document.getElementById('assign-individual-task-button');
const assignGroupTaskButton = document.getElementById('assign-group-task-button');
const assignTaskMessage = document.getElementById('assign-task-message');

const hifzCurriculumDisplay = document.getElementById('hifz-curriculum-display');
const murajaaCurriculumDisplay = document.getElementById('murajaa-curriculum-display');


let currentUser = null; // Stores current logged-in user data

// --- STATIC CURRICULUM DATA (الفكرة الأولى: منهج الحفظ والمراجعة) ---

// منهج الحفظ الأصلي: من المرسلات إلى الأحقاف
// كل عنصر هو مقطع حفظ واحد
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
    { surah: 'المجادلة', start_ayah: 20, end_ayah: 22, points: 5, type: 'hifz', label: 'المجادلة (20-22)' },
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

// منهج المراجعة المتكامل: من الأحقاف إلى الناس (ترتيب تنازلي في المصحف)
// كل عنصر هو وحدة مراجعة قد تكون سورة كاملة أو مجموعة مقسمة/مجمعة
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
    studentScreen.classList.add('hidden');
    teacherScreen.classList.add('hidden');
}

function setActiveTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(tabId).classList.remove('hidden');

    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`.tab-button[data-tab="${tabId.replace('-tab', '')}"]`).classList.add('active');
}

// Function to generate a simple unique ID for local tasks
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// -------------------------------------------------------------
// --- الدوال المضافة لتحويل السورة والآية إلى رقم مقطع تسلسلي ---
// -------------------------------------------------------------

/**
 * تحول اسم السورة ورقم الآية إلى رقم مقطع الحفظ التسلسلي في HifzCurriculum
 * @param {string} surahName - اسم السورة (مثلاً 'الأحقاف')
 * @param {number} ayahNumber - رقم الآية (مثلاً 17)
 * @returns {number} رقم المقطع التسلسلي (مضافاً إليه 1 ليصبح من 1 إلى 195)، أو 1 إذا لم يتم العثور
 */
function getHifzIndexFromSurahAndAyah(surahName, ayahNumber) {
    ayahNumber = parseInt(ayahNumber);
    
    const index = HifzCurriculum.findIndex(item => {
        // التحقق من اسم السورة
        if (item.surah !== surahName) {
            return false;
        }
        // التحقق من أن رقم الآية يقع ضمن نطاق المقطع
        if (ayahNumber >= item.start_ayah && ayahNumber <= item.end_ayah) {
            return true;
        }
        return false;
    });

    // إذا لم يتم العثور، يُعاد رقم المقطع 1 (المرسلات 1-15) كقيمة افتراضية
    return index !== -1 ? index + 1 : 1;
}

/**
 * تحول اسم وحدة المراجعة إلى رقم المقطع التسلسلي في MurajaaCurriculum
 * @param {string} murajaaLabel - وصف وحدة المراجعة (مثلاً 'مراجعة الملك (كاملة)')
 * @returns {number} رقم الوحدة التسلسلي (مضافاً إليه 1 ليصبح من 1 إلى 46)، أو 1 إذا لم يتم العثور
 */
function getMurajaaIndexFromLabel(murajaaLabel) {
    const index = MurajaaCurriculum.findIndex(item => item.label === murajaaLabel);
    // إذا لم يتم العثور، يُعاد رقم الوحدة 1 كقيمة افتراضية
    return index !== -1 ? index + 1 : 1;
}

// -------------------------------------------------------------
// --- وظائف تعبئة القوائم المنسدلة في لوحة المعلم ---
// -------------------------------------------------------------

function populateTeacherSelects() {
    // 1. تعبئة قائمة سور الحفظ
    newStudentHifzSurah.innerHTML = '<option value="">-- اختر سورة بداية الحفظ --</option>';
    const hifzSurahs = [...new Set(HifzCurriculum.map(item => item.surah))];
    hifzSurahs.forEach(surah => {
        const option = document.createElement('option');
        option.value = surah;
        option.textContent = surah;
        newStudentHifzSurah.appendChild(option);
    });

    // 2. تعبئة قائمة وحدات المراجعة
    newStudentMurajaaUnit.innerHTML = '<option value="">-- اختر وحدة بداية المراجعة --</option>';
    MurajaaCurriculum.forEach( (unit, index) => {
        const option = document.createElement('option');
        // سنستخدم الـ label كقيمة لإيجاد رقم الوحدة لاحقاً
        option.value = unit.label;
        option.textContent = unit.label;
        newStudentMurajaaUnit.appendChild(option);
    });

    // يمكن تعيين قيم افتراضية بعد التعبئة
    if (newStudentHifzSurah.options.length > 1) {
        newStudentHifzSurah.value = HifzCurriculum[0].surah; // المرسلات
    }
    if (newStudentMurajaaUnit.options.length > 1) {
        newStudentMurajaaUnit.value = MurajaaCurriculum[0].label; // مراجعة الأحقاف (1-16)
    }
}


// --- Authentication ---
loginButton.addEventListener('click', async () => {
    const userCode = userCodeInput.value.trim();
    if (!userCode) {
        showMessage(authMessage, 'الرجاء إدخال رمز الطالب أو المعلم.', 'error');
        return;
    }

    if (userCode === 'teacher') {
        hideAllScreens();
        teacherScreen.classList.remove('hidden');
        currentUser = { id: 'teacher', name: 'المعلم', role: 'teacher' };
        loadStudentsForTeacher();
        displayCurriculumsInTeacherPanel();
        populateTeacherSelects(); // تعبئة القوائم المنسدلة بعد الدخول كمعلم
        setActiveTab('manage-students-tab'); // Default tab for teacher
    } else {
        try {
            // باقي منطق تسجيل دخول الطالب (لم يتم تضمينه هنا كاملاً ولكن افتراضاً أنه موجود)

            // مثال لمنطق تسجيل دخول الطالب (يجب أن تستخدم Firestore للتحقق)
            const studentDoc = await db.collection('students').doc(userCode).get();
            if (studentDoc.exists) {
                currentUser = { id: userCode, ...studentDoc.data(), role: 'student' };
                hideAllScreens();
                studentScreen.classList.remove('hidden');
                displayStudentData(currentUser);
                loadStudentTasks(currentUser.id);
                showMessage(authMessage, `مرحباً بك يا ${currentUser.name}!`, 'success');
            } else {
                showMessage(authMessage, 'رمز غير صحيح. الرجاء التحقق من الرمز.', 'error');
            }
        } catch (error) {
            console.error("Authentication Error:", error);
            showMessage(authMessage, `حدث خطأ: ${error.message}`, 'error');
        }
    }
});


// --- Teacher Panel Logic - Register Student (تم التعديل) ---
registerStudentButton.addEventListener('click', async () => {
    const code = newStudentCodeInput.value.trim();
    const name = newStudentNameInput.value.trim();
    const hifzSurah = newStudentHifzSurah.value;
    const hifzAyah = newStudentHifzAyah.value;
    const murajaaUnitLabel = newStudentMurajaaUnit.value;
    
    // التحقق من الإدخالات
    if (!code || !name || !hifzSurah || !hifzAyah || !murajaaUnitLabel) {
        showMessage(registerStudentMessage, 'الرجاء إدخال جميع الحقول المطلوبة (الرمز، الاسم، بداية الحفظ والمراجعة).', 'error');
        return;
    }

    // 1. تحويل الإدخالات إلى أرقام المقاطع التسلسلية (التعديل الأساسي هنا)
    const hifzStartIndex = getHifzIndexFromSurahAndAyah(hifzSurah, hifzAyah);
    const murajaaStartIndex = getMurajaaIndexFromLabel(murajaaUnitLabel);

    // 2. التحقق من وجود الطالب
    const studentRef = db.collection('students').doc(code);
    const doc = await studentRef.get();

    if (doc.exists) {
        showMessage(registerStudentMessage, `الطالب بالرمز ${code} موجود بالفعل.`, 'error');
        return;
    }

    // 3. إضافة الطالب
    try {
        await studentRef.set({
            code: code,
            name: name,
            hifz_progress_index: hifzStartIndex, 
            murajaa_progress_index: murajaaStartIndex, 
            total_points: 0,
            role: 'student'
        });

        showMessage(registerStudentMessage, `تم تسجيل الطالب ${name} بنجاح!`, 'success');
        // تنظيف الحقول
        newStudentCodeInput.value = '';
        newStudentNameInput.value = '';
        newStudentHifzAyah.value = 1;
        populateTeacherSelects(); // إعادة تعيين القوائم للافتراضي
        loadStudentsForTeacher(); // تحديث قائمة الطلاب
    } catch (error) {
        console.error("Error adding document: ", error);
        showMessage(registerStudentMessage, 'فشل التسجيل: ' + error.message, 'error');
    }
});


// --------------------------------------------------------------------------------------
// ملاحظة: باقي الدوال (loadStudentsForTeacher, displayCurriculumsInTeacherPanel, displayStudentData, loadStudentTasks, taskCompletion, etc.)
// تحتاج إلى أن تكون موجودة هنا ليعمل البرنامج كاملاً.
// سأفترض أنك قمت بنسخ الدوال الأخرى التي لم تتأثر بالتعديل مباشرةً.
// --------------------------------------------------------------------------------------


// --- Placeholder Functions (يجب أن يتم تفعيلها من الكود الأصلي) ---

// Placeholder for tab switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        setActiveTab(button.getAttribute('data-tab') + '-tab');
    });
});

// Placeholder for logout
logoutButtonStudent.addEventListener('click', () => {
    currentUser = null;
    hideAllScreens();
    authScreen.classList.remove('hidden');
    userCodeInput.value = '';
    showMessage(authMessage, 'تم تسجيل الخروج بنجاح.', 'success');
});
logoutButtonTeacher.addEventListener('click', () => {
    currentUser = null;
    hideAllScreens();
    authScreen.classList.remove('hidden');
    userCodeInput.value = '';
    showMessage(authMessage, 'تم تسجيل الخروج بنجاح.', 'success');
});

// Placeholder functions for display/loading (يجب ملؤها بالمنطق الكامل)
async function loadStudentsForTeacher() {
    studentList.innerHTML = '<li>جاري تحميل بيانات الطلاب...</li>';
    try {
        const snapshot = await db.collection('students').get();
        studentList.innerHTML = '';
        snapshot.forEach(doc => {
            const student = doc.data();
            const li = document.createElement('li');
            // عرض اسم الطالب والمقاطع الحالية
            li.innerHTML = `
                <span>
                    <strong>${student.name} (${student.code})</strong> - 
                    الحفظ: مقطع ${student.hifz_progress_index}، 
                    المراجعة: وحدة ${student.murajaa_progress_index} 
                    (النقاط: ${student.total_points})
                </span>
                <span class="student-actions">
                    <button class="update-btn" data-code="${student.code}">تحديث تقدم</button>
                    <button class="delete-btn" data-code="${student.code}">حذف</button>
                </span>
            `;
            studentList.appendChild(li);
        });

        // إضافة مستمعي الأحداث لأزرار التحديث والحذف (تحتاج إلى منطق إضافي في المستقبل)
        document.querySelectorAll('.student-actions button').forEach(button => {
            button.addEventListener('click', (e) => {
                const code = e.target.getAttribute('data-code');
                const action = e.target.classList.contains('delete-btn') ? 'حذف' : 'تحديث';
                console.log(`${action} الطالب: ${code}`);
                // هنا يمكن إضافة منطق معقد لتحديث/حذف الطالب عبر Firestore
            });
        });

    } catch (error) {
        console.error("Error loading students: ", error);
        studentList.innerHTML = '<li>فشل تحميل الطلاب.</li>';
    }
}

function displayCurriculumsInTeacherPanel() {
    hifzCurriculumDisplay.innerHTML = '';
    HifzCurriculum.forEach((item, index) => {
        const div = document.createElement('div');
        div.innerHTML = `<strong>(${index + 1})</strong> ${item.label} (${item.start_ayah}-${item.end_ayah}) - ${item.surah}`;
        hifzCurriculumDisplay.appendChild(div);
    });

    murajaaCurriculumDisplay.innerHTML = '';
    MurajaaCurriculum.forEach((item, index) => {
        const div = document.createElement('div');
        div.innerHTML = `<strong>(${index + 1})</strong> ${item.label}`;
        murajaaCurriculumDisplay.appendChild(div);
    });
}

function displayStudentData(student) {
    welcomeStudent.textContent = `أهلاً بك يا ${student.name}!`;

    // عرض تقدم الحفظ الحالي
    const currentHifzIndex = student.hifz_progress_index - 1;
    const currentHifzUnit = HifzCurriculum[currentHifzIndex];
    studentHifzProgress.textContent = currentHifzUnit ? `${currentHifzUnit.label}` : 'مقطع 1 (المرسلات 1-15)';

    // عرض تقدم المراجعة الحالي
    const currentMurajaaIndex = student.murajaa_progress_index - 1;
    const currentMurajaaUnit = MurajaaCurriculum[currentMurajaaIndex];
    studentMurajaaProgress.textContent = currentMurajaaUnit ? `${currentMurajaaUnit.label}` : 'وحدة 1 (مراجعة الأحقاف)';

    studentTotalPoints.textContent = student.total_points || 0;
}

async function loadStudentTasks(studentId) {
    studentTasksDiv.innerHTML = 'جاري تحميل المهام...';
    try {
        // يتم جلب المهام التلقائية (الحفظ والمراجعة التالية) + المهام المضافة يدوياً
        const studentDoc = await db.collection('students').doc(studentId).get();
        if (!studentDoc.exists) return;

        const student = studentDoc.data();
        const nextHifzIndex = student.hifz_progress_index;
        const nextMurajaaIndex = student.murajaa_progress_index;

        studentTasksDiv.innerHTML = '';

        // 1. المهمة التلقائية: الحفظ التالي
        if (nextHifzIndex <= HifzCurriculum.length) {
            const hifzTaskData = HifzCurriculum[nextHifzIndex - 1];
            displayTask(studentTasksDiv, {
                id: 'auto-hifz',
                type: 'hifz',
                description: `حفظ جديد: ${hifzTaskData.label} (${hifzTaskData.surah})`,
                points: hifzTaskData.points,
                completed: false,
                is_auto: true
            }, studentId);
        }

        // 2. المهمة التلقائية: المراجعة التالية
        if (nextMurajaaIndex <= MurajaaCurriculum.length) {
            const murajaaTaskData = MurajaaCurriculum[nextMurajaaIndex - 1];
            displayTask(studentTasksDiv, {
                id: 'auto-murajaa',
                type: 'murajaa',
                description: `${murajaaTaskData.label}`,
                points: murajaaTaskData.points,
                completed: false,
                is_auto: true
            }, studentId);
        }
        
        // 3. المهام اليدوية (نفترض تخزينها في مجموعة tasks لكل طالب)
        const tasksSnapshot = await db.collection('students').doc(studentId).collection('tasks')
                                    .where('completed', '==', false)
                                    .get();

        if (tasksSnapshot.empty && nextHifzIndex > HifzCurriculum.length) {
            studentTasksDiv.innerHTML += '<p style="text-align: center; color: #888;">لا توجد مهام حالية. ممتاز! جميع المهام تمت.</p>';
        }

        tasksSnapshot.forEach(doc => {
            displayTask(studentTasksDiv, { id: doc.id, ...doc.data() }, studentId);
        });

    } catch (error) {
        console.error("Error loading tasks: ", error);
        studentTasksDiv.innerHTML = 'فشل تحميل المهام.';
    }
}

function displayTask(container, task, studentId) {
    const div = document.createElement('div');
    div.classList.add('task-item', task.type);
    
    // المهام التلقائية لا يمكن إكمالها إلا من خلال المعلم
    const isTeacherActionRequired = task.is_auto;
    const buttonText = isTeacherActionRequired ? 'في انتظار المعلم' : 'تم الإنجاز (غير مفعل)';
    const isDisabled = isTeacherActionRequired;

    div.innerHTML = `
        <div class="task-description">${task.description}</div>
        <div class="task-status">النوع: <strong>${task.type === 'hifz' ? 'حفظ' : (task.type === 'murajaa' ? 'مراجعة' : 'إضافي')}</strong></div>
        <div class="task-points">النقاط المتوقعة: ${task.points}</div>
        <div class="task-actions">
            <button class="complete-btn" data-id="${task.id}" ${isDisabled ? 'disabled' : ''}>${buttonText}</button>
        </div>
    `;
    container.appendChild(div);

    // إضافة مستمع الحدث (للمهام اليدوية التي يتم إكمالها من الطالب محلياً - لم يتم تفعيلها هنا بشكل كامل)
    if (!isDisabled) {
        div.querySelector('.complete-btn').addEventListener('click', () => {
             // منطق إكمال المهام اليدوية (تحديث الحالة في Firestore وإضافة النقاط)
             alert('هذه الميزة غير مفعلة حالياً. يجب أن يكمل المعلم مهام الحفظ والمراجعة.');
        });
    }
}

// Placeholder for teacher assignment (لم يتم التعديل عليه)
assignIndividualTaskButton.addEventListener('click', async () => {
    const studentCode = assignTaskStudentCode.value.trim();
    const taskType = assignTaskType.value;
    const description = assignTaskDescription.value.trim();
    const points = parseInt(assignTaskPoints.value);

    if (!studentCode || !description || isNaN(points)) {
        showMessage(assignTaskMessage, 'الرجاء إدخال رمز الطالب والوصف والنقاط بشكل صحيح.', 'error');
        return;
    }

    try {
        const studentRef = db.collection('students').doc(studentCode);
        const studentDoc = await studentRef.get();

        if (!studentDoc.exists) {
            showMessage(assignTaskMessage, `الطالب بالرمز ${studentCode} غير موجود.`, 'error');
            return;
        }

        await studentRef.collection('tasks').add({
            type: taskType,
            description: description,
            points: points,
            completed: false,
            assigned_date: firebase.firestore.FieldValue.serverTimestamp()
        });

        showMessage(assignTaskMessage, `تم تعيين مهمة فردية للطالب ${studentCode} بنجاح!`, 'success');
    } catch (error) {
        console.error("Error assigning task: ", error);
        showMessage(assignTaskMessage, 'فشل تعيين المهمة: ' + error.message, 'error');
    }
});
