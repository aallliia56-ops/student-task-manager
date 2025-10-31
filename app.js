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
const logoutButtonTeacher = document.getElementById('logout-button-teacher'); // أضف هذا السطر هنا

const manageStudentsTab = document.getElementById('manage-students-tab');
const addStudentTab = document.getElementById('add-student-tab');
const manageCurriculumTab = document.getElementById('manage-curriculum-tab');
const assignTasksTab = document.getElementById('assign-tasks-tab');
const tabButtons = document.querySelectorAll('.tab-button');

const studentList = document.getElementById('student-list');
const newStudentCodeInput = document.getElementById('new-student-code');
const newStudentNameInput = document.getElementById('new-student-name');
const newStudentHifzStart = document.getElementById('new-student-hifz-start');
const newStudentMurajaaStart = document.getElementById('new-student-murajaa-start');
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
        setActiveTab('manage-students-tab'); // Default tab for teacher
    } else {
        try {
            const studentDoc = await db.collection('students').doc(userCode).get();
            if (studentDoc.exists) {
                const studentData = studentDoc.data();
                hideAllScreens();
                studentScreen.classList.remove('hidden');
                welcomeStudent.textContent = `أهلاً بك يا ${studentData.name}!`;
                currentUser = { id: userCode, name: studentData.name, role: 'student', ...studentData };
                
                // Set up real-time listener for student's data and tasks
                db.collection('students').doc(userCode).onSnapshot(docSnapshot => {
                    if (docSnapshot.exists) {
                        const updatedStudentData = docSnapshot.data();
                        currentUser = { ...currentUser, ...updatedStudentData }; // Update current user data
                        displayStudentProgress(updatedStudentData);
                        displayStudentTasks(updatedStudentData);
                    } else {
                        // Student doc might have been deleted
                        logoutUser();
                    }
                });
            } else {
                showMessage(authMessage, 'رمز الطالب غير صحيح.', 'error');
            }
        } catch (error) {
            console.error('Error logging in as student:', error);
            showMessage(authMessage, 'حدث خطأ أثناء تسجيل الدخول.', 'error');
        }
    }
});

logoutButtonStudent.addEventListener('click', logoutUser);
logoutButtonTeacher.addEventListener('click', logoutUser);

function logoutUser() {
    currentUser = null;
    userCodeInput.value = '';
    hideAllScreens();
    authScreen.classList.remove('hidden');
    authMessage.classList.add('hidden'); // Hide any previous messages
}

// --- Teacher Functions ---
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        setActiveTab(button.dataset.tab + '-tab');
        // Specific reloads if needed
        if (button.dataset.tab === 'manage-students') {
            loadStudentsForTeacher();
        } else if (button.dataset.tab === 'manage-curriculum') {
            displayCurriculumsInTeacherPanel();
        }
    });
});

async function loadStudentsForTeacher() {
    studentList.innerHTML = '';
    const snapshot = await db.collection('students').get();
    if (snapshot.empty) {
        studentList.innerHTML = '<p>لا يوجد طلاب مسجلون بعد.</p>';
        return;
    }
    snapshot.forEach(doc => {
        const student = doc.data();
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${student.name}</strong> (${student.id})<br>
                <span>النقاط: ${student.totalPoints || 0}</span><br>
                <span>الحفظ: المقطع ${student.hifz_progress || 0} من ${HifzCurriculum.length}</span><br>
                <span>المراجعة: الوحدة ${student.murajaa_progress || 0} من ${MurajaaCurriculum.length}</span>
            </div>
            <div class="student-actions">
                <button class="edit-btn" data-id="${student.id}">تعديل</button>
                <button class="delete-btn" data-id="${student.id}">حذف</button>
            </div>
        `;
        studentList.appendChild(li);
    });

    // Add event listeners for edit and delete buttons
    studentList.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => editStudent(e.target.dataset.id));
    });
    studentList.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => deleteStudent(e.target.dataset.id));
    });
}

async function editStudent(studentId) {
    // For simplicity, we'll prompt for new hifz/murajaa start.
    // In a real app, this would be a dedicated form.
    const studentDoc = await db.collection('students').doc(studentId).get();
    if (!studentDoc.exists) {
        alert('الطالب غير موجود.');
        return;
    }
    const studentData = studentDoc.data();
    const newHifzStart = prompt(`أدخل نقطة بداية الحفظ الجديدة للطالب ${studentData.name} (المقطع الحالي: ${studentData.hifz_progress || 0}):`);
    const newMurajaaStart = prompt(`أدخل نقطة بداية المراجعة الجديدة للطالب ${studentData.name} (الوحدة الحالية: ${studentData.murajaa_progress || 0}):`);

    if (newHifzStart !== null && newMurajaaStart !== null) {
        const hifzVal = parseInt(newHifzStart);
        const murajaaVal = parseInt(newMurajaaStart);

        if (isNaN(hifzVal) || hifzVal < 0 || hifzVal > HifzCurriculum.length ||
            isNaN(murajaaVal) || murajaaVal < 0 || murajaaVal > MurajaaCurriculum.length) {
            alert('قيم غير صالحة. الرجاء إدخال أرقام صحيحة ضمن النطاق المسموح به.');
            return;
        }

        try {
            await db.collection('students').doc(studentId).update({
                hifz_progress: hifzVal,
                murajaa_progress: murajaaVal
            });
            alert('تم تحديث تقدم الطالب بنجاح.');
            loadStudentsForTeacher(); // Refresh list
        } catch (error) {
            console.error('Error updating student progress:', error);
            alert('حدث خطأ أثناء تحديث تقدم الطالب.');
        }
    }
}


async function deleteStudent(studentId) {
    if (confirm(`هل أنت متأكد من حذف الطالب ${studentId}؟`)) {
        try {
            await db.collection('students').doc(studentId).delete();
            showMessage(registerStudentMessage, 'تم حذف الطالب بنجاح.', 'success');
            loadStudentsForTeacher(); // Refresh list
        } catch (error) {
            console.error('Error deleting student:', error);
            showMessage(registerStudentMessage, 'حدث خطأ أثناء حذف الطالب.', 'error');
        }
    }
}

registerStudentButton.addEventListener('click', async () => {
    const studentId = newStudentCodeInput.value.trim();
    const studentName = newStudentNameInput.value.trim();
    const hifzStart = parseInt(newStudentHifzStart.value);
    const murajaaStart = parseInt(newStudentMurajaaStart.value);

    if (!studentId || !studentName) {
        showMessage(registerStudentMessage, 'الرجاء إدخال رمز واسم الطالب.', 'error');
        return;
    }
    if (isNaN(hifzStart) || hifzStart < 0 || hifzStart > HifzCurriculum.length) {
        showMessage(registerStudentMessage, `نقطة بداية الحفظ غير صحيحة. يجب أن تكون بين 0 و ${HifzCurriculum.length}.`, 'error');
        return;
    }
    if (isNaN(murajaaStart) || murajaaStart < 0 || murajaaStart > MurajaaCurriculum.length) {
        showMessage(registerStudentMessage, `نقطة بداية المراجعة غير صحيحة. يجب أن تكون بين 0 و ${MurajaaCurriculum.length}.`, 'error');
        return;
    }

    try {
        const studentRef = db.collection('students').doc(studentId);
        const doc = await studentRef.get();
        if (doc.exists) {
            showMessage(registerStudentMessage, 'هذا الرمز مستخدم بالفعل. الرجاء اختيار رمز آخر.', 'error');
            return;
        }

        await studentRef.set({
            id: studentId,
            name: studentName,
            role: 'student',
            totalPoints: 0,
            hifz_progress: hifzStart, // Progress is the index of the LAST COMPLETED hifz task
            murajaa_progress: murajaaStart, // Progress is the index of the LAST COMPLETED murajaa task
            tasks: [] // Array for custom/assigned tasks
        });
        showMessage(registerStudentMessage, 'تم تسجيل الطالب بنجاح!', 'success');
        newStudentCodeInput.value = '';
        newStudentNameInput.value = '';
        newStudentHifzStart.value = 1; // Reset to default
        newStudentMurajaaStart.value = 1; // Reset to default
    } catch (error) {
        console.error('Error registering student:', error);
        showMessage(registerStudentMessage, 'حدث خطأ أثناء تسجيل الطالب.', 'error');
    }
});

function displayCurriculumsInTeacherPanel() {
    hifzCurriculumDisplay.innerHTML = '';
    MurajaaCurriculum.forEach((task, index) => {
        const div = document.createElement('div');
        div.innerHTML = `<span>${index + 1}. ${task.label} (مراجعة - ${task.points} نقاط)</span>`;
        murajaaCurriculumDisplay.appendChild(div);
    });

    // Display Hifz curriculum in reverse order as per new progression (but still show from المرسلات to الأحقاف)
    // The visual display can be in logical order for clarity, even if internal progression is reverse.
    // For now, let's just display all hifz tasks in their defined array order.
    hifzCurriculumDisplay.innerHTML = '';
    HifzCurriculum.forEach((task, index) => {
        const div = document.createElement('div');
        div.innerHTML = `<span>${index + 1}. ${task.label} (حفظ - ${task.points} نقاط)</span>`;
        hifzCurriculumDisplay.appendChild(div);
    });
}


assignIndividualTaskButton.addEventListener('click', async () => {
    await assignTask(false); // Assign to individual student
});

assignGroupTaskButton.addEventListener('click', async () => {
    await assignTask(true); // Assign to all students (group)
});

async function assignTask(isGroupTask) {
    const studentId = assignTaskStudentCode.value.trim();
    const taskType = assignTaskType.value;
    const taskDescription = assignTaskDescription.value.trim();
    const taskPoints = parseInt(assignTaskPoints.value);

    if (!isGroupTask && !studentId) {
        showMessage(assignTaskMessage, 'الرجاء إدخال رمز الطالب للمهمة الفردية.', 'error');
        return;
    }
    if (!taskDescription || isNaN(taskPoints) || taskPoints <= 0) {
        showMessage(assignTaskMessage, 'الرجاء إدخال وصف وعدد نقاط صحيح للمهمة.', 'error');
        return;
    }

    const task = {
        id: generateUniqueId(),
        description: taskDescription,
        type: taskType,
        points: taskPoints,
        assignedDate: firebase.firestore.FieldValue.serverTimestamp(),
        completed: false
    };

    try {
        if (isGroupTask) {
            const studentsSnapshot = await db.collection('students').get();
            const batch = db.batch();
            studentsSnapshot.forEach(doc => {
                const studentRef = db.collection('students').doc(doc.id);
                // Atomically add task to the tasks array
                batch.update(studentRef, {
                    tasks: firebase.firestore.FieldValue.arrayUnion(task)
                });
            });
            await batch.commit();
            showMessage(assignTaskMessage, 'تم تعيين المهمة جماعيًا بنجاح!', 'success');
        } else {
            const studentRef = db.collection('students').doc(studentId);
            const studentDoc = await studentRef.get();
            if (!studentDoc.exists) {
                showMessage(assignTaskMessage, 'رمز الطالب غير صحيح.', 'error');
                return;
            }
            await studentRef.update({
                tasks: firebase.firestore.FieldValue.arrayUnion(task)
            });
            showMessage(assignTaskMessage, 'تم تعيين المهمة فرديًا بنجاح!', 'success');
        }

        assignTaskStudentCode.value = '';
        assignTaskDescription.value = '';
        assignTaskPoints.value = '5'; // Reset points
    } catch (error) {
        console.error('Error assigning task:', error);
        showMessage(assignTaskMessage, 'حدث خطأ أثناء تعيين المهمة.', 'error');
    }
}


// --- Student Functions ---
function displayStudentProgress(studentData) {
    const hifzLabel = HifzCurriculum[studentData.hifz_progress - 1] ? HifzCurriculum[studentData.hifz_progress - 1].label : 'لم تبدأ بعد';
    const murajaaLabel = MurajaaCurriculum[studentData.murajaa_progress - 1] ? MurajaaCurriculum[studentData.murajaa_progress - 1].label : 'لم تبدأ بعد';

    studentHifzProgress.textContent = hifzLabel;
    studentMurajaaProgress.textContent = murajaaLabel;
    studentTotalPoints.textContent = studentData.totalPoints || 0;
}


async function displayStudentTasks(studentData) {
    studentTasksDiv.innerHTML = '';
    const hifzProgressIndex = studentData.hifz_progress || 0; // Index of the LAST completed hifz task
    const murajaaProgressIndex = studentData.murajaa_progress || 0; // Index of the LAST completed murajaa task

    const tasksToDisplay = [];

    // --- (الفكرة الثالثة: مهام الحفظ) ---
    // الحفظ يبدأ من المرسلات (index 0) ويتجه للأحقاف (index 194)
    // مهمتا حفظ تظهر للطالب، يجب إنجاز الأولى قبل الثانية

    // المهمة الأولى للحفظ (يجب أن تكون المقطع التالي للحفظ)
    if (hifzProgressIndex < HifzCurriculum.length) {
        const nextHifzTask = HifzCurriculum[hifzProgressIndex]; // The next task to complete
        if (nextHifzTask) {
             tasksToDisplay.push({
                type: 'hifz',
                id: `hifz-${hifzProgressIndex + 1}`, // Unique ID for this specific curriculum task instance
                description: `حفظ: ${nextHifzTask.label}`,
                points: nextHifzTask.points,
                index: hifzProgressIndex + 1, // Store its index for completion logic
                isNextSequential: true // Indicates it's the very next required Hifz task
            });
        }
    }

    // المهمة الثانية للحفظ (إذا كانت متاحة)
    if ((hifzProgressIndex + 1) < HifzCurriculum.length) {
        const nextHifzTask2 = HifzCurriculum[hifzProgressIndex + 1];
        if (nextHifzTask2) {
             tasksToDisplay.push({
                type: 'hifz',
                id: `hifz-${hifzProgressIndex + 2}`,
                description: `حفظ: ${nextHifzTask2.label}`,
                points: nextHifzTask2.points,
                index: hifzProgressIndex + 2,
                isNextSequential: false // Not the immediate next, depends on the first one
            });
        }
    }


    // --- (الفكرة الثالثة: مهام المراجعة) ---
    // المراجعة تبدأ من الأحقاف (index 0) وتتجه للناس (index 45) بشكل تنازلي في المصحف
    // المهمتان الأنسب للمراجعة تظهر للطالب، بلا تسلسل إجباري بينهما

    // IMPORTANT: The logic for selecting "most appropriate" murajaa tasks is complex
    // and depends on factors like last reviewed date, review frequency, etc.
    // For simplicity in this base code, we'll offer the next two *available* murajaa tasks
    // in the defined MurajaaCurriculum order (which is already reversed by surah order for us).

    // Important: murajaa_progress is the INDEX of the LAST COMPLETED murajaa task in the MurajaaCurriculum array
    // To get the NEXT tasks, we look *forward* from this index.
    // However, since murajaa should be *flexible*, we need a different approach.
    // Let's offer the two tasks that have NOT been completed yet.
    // This is a placeholder for a more sophisticated "smart" murajaa selection.

    const completedMurajaaTasks = studentData.completedMurajaaIndices || []; // array of indices of completed murajaa units

    // Find the first two *uncompleted* murajaa tasks
    let murajaaCount = 0;
    for (let i = 0; i < MurajaaCurriculum.length && murajaaCount < 2; i++) {
        // Only offer tasks that haven't been completed yet by the student
        // And tasks that are "behind" the current hifz progress (optional, but good for context)
        // For simplicity for now, offer any uncompleted task starting from the murajaa_progress
        if (!completedMurajaaTasks.includes(i) && i >= murajaaProgressIndex) {
            const murajaaTask = MurajaaCurriculum[i];
            tasksToDisplay.push({
                type: 'murajaa',
                id: `murajaa-${i + 1}`,
                description: murajaaTask.label,
                points: murajaaTask.points,
                index: i + 1, // Store its index for completion logic
                isNextSequential: false // Murajaa is not strictly sequential, but we offer next available
            });
            murajaaCount++;
        }
    }
    
    // --- (المهام الإضافية المعينة يدوياً) ---
    studentData.tasks.filter(task => !task.completed).forEach(task => {
        tasksToDisplay.push({
            type: task.type,
            id: task.id,
            description: task.description,
            points: task.points,
            isAssigned: true // Flag to distinguish from curriculum tasks
        });
    });

    if (tasksToDisplay.length === 0) {
        studentTasksDiv.innerHTML = '<p>لا توجد مهام متاحة حاليًا. يرجى التواصل مع المعلم.</p>';
        return;
    }

    tasksToDisplay.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task-item', task.type);
        let completeButton = `<button class="complete-btn" data-id="${task.id}" data-type="${task.type}" data-index="${task.index || ''}">إنجاز</button>`;
        
        // Disable Hifz tasks that are not the immediate next sequential one
        // (This applies to the second Hifz task shown if the first one is not completed)
        if (task.type === 'hifz' && !task.isNextSequential) {
            completeButton = `<button class="complete-btn" data-id="${task.id}" data-type="${task.type}" data-index="${task.index || ''}" disabled>إنجاز (أكمل المهمة السابقة)</button>`;
        }
        // If the *first* Hifz task is NOT `isNextSequential`, this means hifz_progress is at the end.
        // But if hifz_progress == 0, the first task should be `isNextSequential`.
        // We need to disable the second hifz task until the first is done.
        if (task.type === 'hifz' && tasksToDisplay[0].type === 'hifz' && tasksToDisplay[0].id !== task.id && !tasksToDisplay[0].completed) {
            // This is a simplification: assuming tasksToDisplay[0] is always the *first* hifz task
            // More robust check needed if task order changes
            if (!tasksToDisplay[0].isNextSequential) { // If the actual first one is NOT the next sequential (meaning student is past it)
                 // This condition likely needs refinement for edge cases, but for simple 2 Hifz tasks it should work.
            } else if (tasksToDisplay[0].isNextSequential && task.id === `hifz-${hifzProgressIndex + 2}`) {
                 // If this is the second hifz task and the first one is still pending: disable it.
                 completeButton = `<button class="complete-btn" data-id="${task.id}" data-type="${task.type}" data-index="${task.index || ''}" disabled>إنجاز (أكمل المقطع السابق أولاً)</button>`;
            }
        }


        taskElement.innerHTML = `
            <div class="task-description">${task.description}</div>
            <div class="task-status">النوع: ${task.type === 'hifz' ? 'حفظ' : task.type === 'murajaa' ? 'مراجعة' : 'مهمة إضافية'}</div>
            <div class="task-points">النقاط: ${task.points}</div>
            <div class="task-actions">
                ${completeButton}
            </div>
        `;
        studentTasksDiv.appendChild(taskElement);
    });

    // Add event listeners for complete buttons
    studentTasksDiv.querySelectorAll('.complete-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const taskId = e.target.dataset.id;
            const taskType = e.target.dataset.type;
            const taskIndex = parseInt(e.target.dataset.index); // For curriculum tasks
            
            // Disable the button immediately to prevent double clicks
            e.target.disabled = true;
            e.target.textContent = 'جاري الإنجاز...';

            await completeTask(studentData.id, taskId, taskType, taskIndex);
        });
    });
}

async function completeTask(studentId, taskId, taskType, taskIndex = -1) {
    const studentRef = db.collection('students').doc(studentId);
    let studentData = (await studentRef.get()).data();
    let updatedPoints = studentData.totalPoints || 0;
    
    try {
        if (taskType === 'hifz') {
            const hifzProgress = studentData.hifz_progress || 0;
            // Ensure the student is completing the correct sequential task
            if (taskIndex !== (hifzProgress + 1)) {
                alert('خطأ: يجب إنجاز مهام الحفظ بالتسلسل الصحيح.');
                 // Re-enable button (if it was from the UI) and exit
                 displayStudentTasks(studentData); // Refresh UI to re-enable/show correct state
                return;
            }

            const hifzTask = HifzCurriculum[taskIndex - 1]; // Get task details from static curriculum
            updatedPoints += hifzTask.points;

            await studentRef.update({
                hifz_progress: taskIndex, // Update progress to the completed index
                totalPoints: updatedPoints,
                // Add an entry to a history of completed tasks if needed, for now just progress update
            });
             alert(`أحسنت! تم إنجاز مهمة الحفظ: ${hifzTask.label}.`);

        } else if (taskType === 'murajaa') {
            const murajaaTask = MurajaaCurriculum[taskIndex - 1]; // Get task details from static curriculum

            // Add murajaa task to a list of completed murajaa indices for the student
            // This allows tracking which specific murajaa units have been completed
            const completedMurajaaIndices = studentData.completedMurajaaIndices || [];
            if (!completedMurajaaIndices.includes(taskIndex - 1)) { // Only add if not already completed
                completedMurajaaIndices.push(taskIndex - 1);
                updatedPoints += murajaaTask.points;

                await studentRef.update({
                    // No single murajaa_progress index, but a list of completed units
                    completedMurajaaIndices: completedMurajaaIndices,
                    totalPoints: updatedPoints,
                    // Optionally update murajaa_progress to the highest index completed for display purposes if desired
                    murajaa_progress: Math.max(...completedMurajaaIndices) + 1 || 0 // For display purposes, points to the "last" completed
                });
                alert(`ممتاز! تم إنجاز مهمة المراجعة: ${murajaaTask.label}.`);
            } else {
                alert('لقد قمت بإنجاز هذه المهمة بالفعل.');
            }
        } else { // Custom/Assigned tasks
            const task = studentData.tasks.find(t => t.id === taskId);
            if (task && !task.completed) {
                updatedPoints += task.points;
                // Update the specific task in the array
                const updatedTasks = studentData.tasks.map(t => 
                    t.id === taskId ? { ...t, completed: true, completedDate: firebase.firestore.FieldValue.serverTimestamp() } : t
                );
                await studentRef.update({
                    tasks: updatedTasks,
                    totalPoints: updatedPoints
                });
                alert(`رائع! تم إنجاز المهمة الإضافية: ${task.description}.`);
            }
        }
        // No need to call displayStudentTasks directly here because the onSnapshot listener will handle it
    } catch (error) {
        console.error('Error completing task:', error);
        alert('حدث خطأ أثناء إنجاز المهمة.');
        // If an error occurs, re-enable the button
        e.target.disabled = false;
        e.target.textContent = 'إنجاز';
    }
}


// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    // Optionally auto-login teacher for testing
    // userCodeInput.value = 'teacher';
    // loginButton.click();

    // Or keep auth screen visible
    hideAllScreens();
    authScreen.classList.remove('hidden');
});

// Display curriculums on teacher screen load for the first time
displayCurriculumsInTeacherPanel();
