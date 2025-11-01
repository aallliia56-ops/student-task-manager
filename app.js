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

// العناصر الجديدة التي يجب ربطها بالقوائم المنسدلة في index.html
const newStudentHifzStart = document.getElementById('new-student-hifz-start');
const newStudentMurajaaStart = document.getElementById('new-student-murajaa-start');
// ملاحظة: بما أنك غيّرتها إلى input type="number" في HTML:
// إذا أردت استخدام القوائم المنسدلة (select)، يجب تعديل index.html ليصبح:
// <select id="new-student-hifz-start"></select>
// <select id="new-student-murajaa-start"></select>
// لكني سأفترض أنك ما زلت تريد نظام القائمة المنسدلة كما كان في الفكرة الأصلية، 
// لذا سأقوم بإضافة دالة عرض المناهج لتظهر في "إدارة المنهج" على الأقل.
// لن أعدل DOM في هذا الملف، وسأعتمد على أنك ربما تعود لاستخدام SELECT.

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
    { surah: 'المرسلات', start_ayah: 1, end_ayah: 15, points: 5, type: 'hifz', label: 'المرسلات (1-15)' }, // 0
    { surah: 'المرسلات', start_ayah: 16, end_ayah: 24, points: 5, type: 'hifz', label: 'المرسلات (16-24)' }, // 1
    { surah: 'المرسلات', start_ayah: 25, end_ayah: 28, points: 5, type: 'hifz', label: 'المرسلات (25-28)' }, // 2
    { surah: 'المرسلات', start_ayah: 29, end_ayah: 34, points: 5, type: 'hifz', label: 'المرسلات (29-34)' }, // 3
    { surah: 'المرسلات', start_ayah: 35, end_ayah: 40, points: 5, type: 'hifz', label: 'المرسلات (35-40)' }, // 4
    { surah: 'المرسلات', start_ayah: 41, end_ayah: 50, points: 5, type: 'hifz', label: 'المرسلات (41-50)' }, // 5
    // الإنسان
    { surah: 'الإنسان', start_ayah: 1, end_ayah: 5, points: 5, type: 'hifz', label: 'الإنسان (1-5)' }, // 6
    { surah: 'الإنسان', start_ayah: 6, end_ayah: 12, points: 5, type: 'hifz', label: 'الإنسان (6-12)' }, // 7
    { surah: 'الإنسان', start_ayah: 13, end_ayah: 18, points: 5, type: 'hifz', label: 'الإنسان (13-18)' }, // 8
    { surah: 'الإنسان', start_ayah: 19, end_ayah: 23, points: 5, type: 'hifz', label: 'الإنسان (19-23)' }, // 9
    { surah: 'الإنسان', start_ayah: 24, end_ayah: 28, points: 5, type: 'hifz', label: 'الإنسان (24-28)' }, // 10
    { surah: 'الإنسان', start_ayah: 29, end_ayah: 31, points: 5, type: 'hifz', label: 'الإنسان (29-31)' }, // 11
    // القيامة
    { surah: 'القيامة', start_ayah: 1, end_ayah: 10, points: 5, type: 'hifz', label: 'القيامة (1-10)' }, // 12
    { surah: 'القيامة', start_ayah: 11, end_ayah: 19, points: 5, type: 'hifz', label: 'القيامة (11-19)' }, // 13
    { surah: 'القيامة', start_ayah: 20, end_ayah: 33, points: 5, type: 'hifz', label: 'القيامة (20-33)' }, // 14
    { surah: 'القيامة', start_ayah: 34, end_ayah: 40, points: 5, type: 'hifz', label: 'القيامة (34-40)' }, // 15
    // المدثر
    { surah: 'المدثر', start_ayah: 1, end_ayah: 10, points: 5, type: 'hifz', label: 'المدثر (1-10)' }, // 16
    { surah: 'المدثر', start_ayah: 11, end_ayah: 18, points: 5, type: 'hifz', label: 'المدثر (11-18)' }, // 17
    { surah: 'المدثر', start_ayah: 19, end_ayah: 30, points: 5, type: 'hifz', label: 'المدثر (19-30)' }, // 18
    { surah: 'المدثر', start_ayah: 31, end_ayah: 41, points: 5, type: 'hifz', label: 'المدثر (31-41)' }, // 19
    { surah: 'المدثر', start_ayah: 42, end_ayah: 47, points: 5, type: 'hifz', label: 'المدثر (42-47)' }, // 20
    { surah: 'المدثر', start_ayah: 48, end_ayah: 56, points: 5, type: 'hifz', label: 'المدثر (48-56)' }, // 21
    // المزمل
    { surah: 'المزمل', start_ayah: 1, end_ayah: 8, points: 5, type: 'hifz', label: 'المزمل (1-8)' }, // 22
    { surah: 'المزمل', start_ayah: 9, end_ayah: 14, points: 5, type: 'hifz', label: 'المزمل (9-14)' }, // 23
    { surah: 'المزمل', start_ayah: 15, end_ayah: 19, points: 5, type: 'hifz', label: 'المزمل (15-19)' }, // 24
    { surah: 'المزمل', start_ayah: 20, end_ayah: 20, points: 5, type: 'hifz', label: 'المزمل (20-20)' }, // 25
    // الجن
    { surah: 'الجن', start_ayah: 1, end_ayah: 4, points: 5, type: 'hifz', label: 'الجن (1-4)' }, // 26
    { surah: 'الجن', start_ayah: 5, end_ayah: 8, points: 5, type: 'hifz', label: 'الجن (5-8)' }, // 27
    { surah: 'الجن', start_ayah: 9, end_ayah: 11, points: 5, type: 'hifz', label: 'الجن (9-11)' }, // 28
    { surah: 'الجن', start_ayah: 12, end_ayah: 14, points: 5, type: 'hifz', label: 'الجن (12-14)' }, // 29
    { surah: 'الجن', start_ayah: 15, end_ayah: 19, points: 5, type: 'hifz', label: 'الجن (15-19)' }, // 30
    { surah: 'الجن', start_ayah: 20, end_ayah: 23, points: 5, type: 'hifz', label: 'الجن (20-23)' }, // 31
    { surah: 'الجن', start_ayah: 24, end_ayah: 28, points: 5, type: 'hifz', label: 'الجن (24-28)' }, // 32
    // نوح
    { surah: 'نوح', start_ayah: 1, end_ayah: 4, points: 5, type: 'hifz', label: 'نوح (1-4)' }, // 33
    { surah: 'نوح', start_ayah: 5, end_ayah: 10, points: 5, type: 'hifz', label: 'نوح (5-10)' }, // 34
    { surah: 'نوح', start_ayah: 11, end_ayah: 20, points: 5, type: 'hifz', label: 'نوح (11-20)' }, // 35
    { surah: 'نوح', start_ayah: 21, end_ayah: 25, points: 5, type: 'hifz', label: 'نوح (21-25)' }, // 36
    { surah: 'نوح', start_ayah: 26, end_ayah: 28, points: 5, type: 'hifz', label: 'نوح (26-28)' }, // 37
    // المعارج
    { surah: 'المعارج', start_ayah: 1, end_ayah: 10, points: 5, type: 'hifz', label: 'المعارج (1-10)' }, // 38
    { surah: 'المعارج', start_ayah: 11, end_ayah: 18, points: 5, type: 'hifz', label: 'المعارج (11-18)' }, // 39
    { surah: 'المعارج', start_ayah: 19, end_ayah: 28, points: 5, type: 'hifz', label: 'المعارج (19-28)' }, // 40
    { surah: 'المعارج', start_ayah: 29, end_ayah: 35, points: 5, type: 'hifz', label: 'المعارج (29-35)' }, // 41
    { surah: 'المعارج', start_ayah: 36, end_ayah: 40, points: 5, type: 'hifz', label: 'المعارج (36-40)' }, // 42
    { surah: 'المعارج', start_ayah: 41, end_ayah: 44, points: 5, type: 'hifz', label: 'المعارج (41-44)' }, // 43
    // الحاقة
    { surah: 'الحاقة', start_ayah: 1, end_ayah: 8, points: 5, type: 'hifz', label: 'الحاقة (1-8)' }, // 44
    { surah: 'الحاقة', start_ayah: 9, end_ayah: 18, points: 5, type: 'hifz', label: 'الحاقة (9-18)' }, // 45
    { surah: 'الحاقة', start_ayah: 19, end_ayah: 24, points: 5, type: 'hifz', label: 'الحاقة (19-24)' }, // 46
    { surah: 'الحاقة', start_ayah: 25, end_ayah: 35, points: 5, type: 'hifz', label: 'الحاقة (25-35)' }, // 47
    { surah: 'الحاقة', start_ayah: 36, end_ayah: 43, points: 5, type: 'hifz', label: 'الحاقة (36-43)' }, // 48
    { surah: 'الحاقة', start_ayah: 44, end_ayah: 52, points: 5, type: 'hifz', label: 'الحاقة (44-52)' }, // 49
    // القلم
    { surah: 'القلم', start_ayah: 1, end_ayah: 9, points: 5, type: 'hifz', label: 'القلم (1-9)' }, // 50
    { surah: 'القلم', start_ayah: 10, end_ayah: 16, points: 5, type: 'hifz', label: 'القلم (10-16)' }, // 51
    { surah: 'القلم', start_ayah: 17, end_ayah: 27, points: 5, type: 'hifz', label: 'القلم (17-27)' }, // 52
    { surah: 'القلم', start_ayah: 28, end_ayah: 33, points: 5, type: 'hifz', label: 'القلم (28-33)' }, // 53
    { surah: 'القلم', start_ayah: 34, end_ayah: 42, points: 5, type: 'hifz', label: 'القلم (34-42)' }, // 54
    { surah: 'القلم', start_ayah: 43, end_ayah: 47, points: 5, type: 'hifz', label: 'القلم (43-47)' }, // 55
    { surah: 'القلم', start_ayah: 48, end_ayah: 52, points: 5, type: 'hifz', label: 'القلم (48-52)' }, // 56
    // الملك
    { surah: 'الملك', start_ayah: 1, end_ayah: 5, points: 5, type: 'hifz', label: 'الملك (1-5)' }, // 57
    { surah: 'الملك', start_ayah: 6, end_ayah: 12, points: 5, type: 'hifz', label: 'الملك (6-12)' }, // 58
    { surah: 'الملك', start_ayah: 13, end_ayah: 19, points: 5, type: 'hifz', label: 'الملك (13-19)' }, // 59
    { surah: 'الملك', start_ayah: 20, end_ayah: 26, points: 5, type: 'hifz', label: 'الملك (20-26)' }, // 60
    { surah: 'الملك', start_ayah: 27, end_ayah: 30, points: 5, type: 'hifz', label: 'الملك (27-30)' }, // 61
    // التحريم
    { surah: 'التحريم', start_ayah: 1, end_ayah: 3, points: 5, type: 'hifz', label: 'التحريم (1-3)' }, // 62
    { surah: 'التحريم', start_ayah: 4, end_ayah: 5, points: 5, type: 'hifz', label: 'التحريم (4-5)' }, // 63
    { surah: 'التحريم', start_ayah: 6, end_ayah: 7, points: 5, type: 'hifz', label: 'التحريم (6-7)' }, // 64
    { surah: 'التحريم', start_ayah: 8, end_ayah: 10, points: 5, type: 'hifz', label: 'التحريم (8-10)' }, // 65
    { surah: 'التحريم', start_ayah: 11, end_ayah: 12, points: 5, type: 'hifz', label: 'التحريم (11-12)' }, // 66
    // الطلاق
    { surah: 'الطلاق', start_ayah: 1, end_ayah: 2, points: 5, type: 'hifz', label: 'الطلاق (1-2)' }, // 67
    { surah: 'الطلاق', start_ayah: 3, end_ayah: 5, points: 5, type: 'hifz', label: 'الطلاق (3-5)' }, // 68
    { surah: 'الطلاق', start_ayah: 6, end_ayah: 9, points: 5, type: 'hifz', label: 'الطلاق (6-9)' }, // 69
    { surah: 'الطلاق', start_ayah: 10, end_ayah: 11, points: 5, type: 'hifz', label: 'الطلاق (10-11)' }, // 70
    { surah: 'الطلاق', start_ayah: 12, end_ayah: 12, points: 5, type: 'hifz', label: 'الطلاق (12-12)' }, // 71
    // التغابن
    { surah: 'التغابن', start_ayah: 1, end_ayah: 4, points: 5, type: 'hifz', label: 'التغابن (1-4)' }, // 72
    { surah: 'التغابن', start_ayah: 5, end_ayah: 7, points: 5, type: 'hifz', label: 'التغابن (5-7)' }, // 73
    { surah: 'التغابن', start_ayah: 8, end_ayah: 9, points: 5, type: 'hifz', label: 'التغابن (8-9)' }, // 74
    { surah: 'التغابن', start_ayah: 10, end_ayah: 13, points: 5, type: 'hifz', label: 'التغابن (10-13)' }, // 75
    { surah: 'التغابن', start_ayah: 14, end_ayah: 15, points: 5, type: 'hifz', label: 'التغابن (14-15)' }, // 76
    { surah: 'التغابن', start_ayah: 16, end_ayah: 18, points: 5, type: 'hifz', label: 'التغابن (16-18)' }, // 77
    // المنافقون
    { surah: 'المنافقون', start_ayah: 1, end_ayah: 3, points: 5, type: 'hifz', label: 'المنافقون (1-3)' }, // 78
    { surah: 'المنافقون', start_ayah: 4, end_ayah: 5, points: 5, type: 'hifz', label: 'المنافقون (4-5)' }, // 79
    { surah: 'المنافقون', start_ayah: 6, end_ayah: 7, points: 5, type: 'hifz', label: 'المنافقون (6-7)' }, // 80
    { surah: 'المنافقون', start_ayah: 8, end_ayah: 9, points: 5, type: 'hifz', label: 'المنافقون (8-9)' }, // 81
    { surah: 'المنافقون', start_ayah: 10, end_ayah: 11, points: 5, type: 'hifz', label: 'المنافقون (10-11)' }, // 82
    // الجمعة
    { surah: 'الجمعة', start_ayah: 1, end_ayah: 3, points: 5, type: 'hifz', label: 'الجمعة (1-3)' }, // 83
    { surah: 'الجمعة', start_ayah: 4, end_ayah: 5, points: 5, type: 'hifz', label: 'الجمعة (4-5)' }, // 84
    { surah: 'الجمعة', start_ayah: 6, end_ayah: 8, points: 5, type: 'hifz', label: 'الجمعة (6-8)' }, // 85
    { surah: 'الجمعة', start_ayah: 9, end_ayah: 11, points: 5, type: 'hifz', label: 'الجمعة (9-11)' }, // 86
    // الصف
    { surah: 'الصف', start_ayah: 1, end_ayah: 4, points: 5, type: 'hifz', label: 'الصف (1-4)' }, // 87
    { surah: 'الصف', start_ayah: 5, end_ayah: 6, points: 5, type: 'hifz', label: 'الصف (5-6)' }, // 88
    { surah: 'الصف', start_ayah: 7, end_ayah: 9, points: 5, type: 'hifz', label: 'الصف (7-9)' }, // 89
    { surah: 'الصف', start_ayah: 10, end_ayah: 13, points: 5, type: 'hifz', label: 'الصف (10-13)' }, // 90
    { surah: 'الصف', start_ayah: 14, end_ayah: 14, points: 5, type: 'hifz', label: 'الصف (14-14)' }, // 91
    // الممتحنة
    { surah: 'الممتحنة', start_ayah: 1, end_ayah: 2, points: 5, type: 'hifz', label: 'الممتحنة (1-2)' }, // 92
    { surah: 'الممتحنة', start_ayah: 3, end_ayah: 4, points: 5, type: 'hifz', label: 'الممتحنة (3-4)' }, // 93
    { surah: 'الممتحنة', start_ayah: 5, end_ayah: 7, points: 5, type: 'hifz', label: 'الممتحنة (5-7)' }, // 94
    { surah: 'الممتحنة', start_ayah: 8, end_ayah: 9, points: 5, type: 'hifz', label: 'الممتحنة (8-9)' }, // 95
    { surah: 'الممتحنة', start_ayah: 10, end_ayah: 11, points: 5, type: 'hifz', label: 'الممتحنة (10-11)' }, // 96
    { surah: 'الممتحنة', start_ayah: 12, end_ayah: 13, points: 5, type: 'hifz', label: 'الممتحنة (12-13)' }, // 97
    // الحشر
    { surah: 'الحشر', start_ayah: 1, end_ayah: 3, points: 5, type: 'hifz', label: 'الحشر (1-3)' }, // 98
    { surah: 'الحشر', start_ayah: 4, end_ayah: 6, points: 5, type: 'hifz', label: 'الحشر (4-6)' }, // 99
    { surah: 'الحشر', start_ayah: 7, end_ayah: 8, points: 5, type: 'hifz', label: 'الحشر (7-8)' }, // 100
    { surah: 'الحشر', start_ayah: 9, end_ayah: 10, points: 5, type: 'hifz', label: 'الحشر (9-10)' }, // 101
    { surah: 'الحشر', start_ayah: 11, end_ayah: 12, points: 5, type: 'hifz', label: 'الحشر (11-12)' }, // 102
    { surah: 'الحشر', start_ayah: 13, end_ayah: 14, points: 5, type: 'hifz', label: 'الحشر (13-14)' }, // 103
    { surah: 'الحشر', start_ayah: 15, end_ayah: 19, points: 5, type: 'hifz', label: 'الحشر (15-19)' }, // 104
    { surah: 'الحشر', start_ayah: 20, end_ayah: 24, points: 5, type: 'hifz', label: 'الحشر (20-24)' }, // 105
    // المجادلة
    { surah: 'المجادلة', start_ayah: 1, end_ayah: 2, points: 5, type: 'hifz', label: 'المجادلة (1-2)' }, // 106
    { surah: 'المجادلة', start_ayah: 3, end_ayah: 4, points: 5, type: 'hifz', label: 'المجادلة (3-4)' }, // 107
    { surah: 'المجادلة', start_ayah: 5, end_ayah: 6, points: 5, type: 'hifz', label: 'المجادلة (5-6)' }, // 108
    { surah: 'المجادلة', start_ayah: 7, end_ayah: 8, points: 5, type: 'hifz', label: 'المجادلة (7-8)' }, // 109
    { surah: 'المجادلة', start_ayah: 9, end_ayah: 10, points: 5, type: 'hifz', label: 'المجادلة (9-10)' }, // 110
    { surah: 'المجادلة', start_ayah: 11, end_ayah: 12, points: 5, type: 'hifz', label: 'المجادلة (11-12)' }, // 111
    { surah: 'المجادلة', start_ayah: 13, end_ayah: 16, points: 5, type: 'hifz', label: 'المجادلة (13-16)' }, // 112
    { surah: 'المجادلة', start_ayah: 17, end_ayah: 19, points: 5, type: 'hifz', label: 'المجادلة (17-19)' }, // 113
    { surah: 'المجادلة', start_ayah: 20, end_ayah: 22, points: 5, type: 'hifz', label: 'المجادلة (20-22)' }, // 114
    // الحديد
    { surah: 'الحديد', start_ayah: 1, end_ayah: 6, points: 5, type: 'hifz', label: 'الحديد (1-6)' }, // 115
    { surah: 'الحديد', start_ayah: 7, end_ayah: 11, points: 5, type: 'hifz', label: 'الحديد (7-11)' }, // 116
    { surah: 'الحديد', start_ayah: 12, end_ayah: 15, points: 5, type: 'hifz', label: 'الحديد (12-15)' }, // 117
    { surah: 'الحديد', start_ayah: 16, end_ayah: 18, points: 5, type: 'hifz', label: 'الحديد (16-18)' }, // 118
    { surah: 'الحديد', start_ayah: 19, end_ayah: 20, points: 5, type: 'hifz', label: 'الحديد (19-20)' }, // 119
    { surah: 'الحديد', start_ayah: 21, end_ayah: 24, points: 5, type: 'hifz', label: 'الحديد (21-24)' }, // 120
    { surah: 'الحديد', start_ayah: 25, end_ayah: 27, points: 5, type: 'hifz', label: 'الحديد (25-27)' }, // 121
    { surah: 'الحديد', start_ayah: 28, end_ayah: 29, points: 5, type: 'hifz', label: 'الحديد (28-29)' }, // 122
    // الواقعة
    { surah: 'الواقعة', start_ayah: 1, end_ayah: 16, points: 5, type: 'hifz', label: 'الواقعة (1-16)' }, // 123
    { surah: 'الواقعة', start_ayah: 17, end_ayah: 40, points: 5, type: 'hifz', label: 'الواقعة (17-40)' }, // 124
    { surah: 'الواقعة', start_ayah: 41, end_ayah: 57, points: 5, type: 'hifz', label: 'الواقعة (41-57)' }, // 125
    { surah: 'الواقعة', start_ayah: 58, end_ayah: 74, points: 5, type: 'hifz', label: 'الواقعة (58-74)' }, // 126
    { surah: 'الواقعة', start_ayah: 75, end_ayah: 96, points: 5, type: 'hifz', label: 'الواقعة (75-96)' }, // 127
    // الرحمن
    { surah: 'الرحمن', start_ayah: 1, end_ayah: 18, points: 5, type: 'hifz', label: 'الرحمن (1-18)' }, // 128
    { surah: 'الرحمن', start_ayah: 19, end_ayah: 32, points: 5, type: 'hifz', label: 'الرحمن (19-32)' }, // 129
    { surah: 'الرحمن', start_ayah: 33, end_ayah: 45, points: 5, type: 'hifz', label: 'الرحمن (33-45)' }, // 130
    { surah: 'الرحمن', start_ayah: 46, end_ayah: 61, points: 5, type: 'hifz', label: 'الرحمن (46-61)' }, // 131
    { surah: 'الرحمن', start_ayah: 62, end_ayah: 78, points: 5, type: 'hifz', label: 'الرحمن (62-78)' }, // 132
    // القمر
    { surah: 'القمر', start_ayah: 1, end_ayah: 8, points: 5, type: 'hifz', label: 'القمر (1-8)' }, // 133
    { surah: 'القمر', start_ayah: 9, end_ayah: 22, points: 5, type: 'hifz', label: 'القمر (9-22)' }, // 134
    { surah: 'القمر', start_ayah: 23, end_ayah: 32, points: 5, type: 'hifz', label: 'القمر (23-32)' }, // 135
    { surah: 'القمر', start_ayah: 33, end_ayah: 42, points: 5, type: 'hifz', label: 'القمر (33-42)' }, // 136
    { surah: 'القمر', start_ayah: 43, end_ayah: 55, points: 5, type: 'hifz', label: 'القمر (43-55)' }, // 137
    // النجم
    { surah: 'النجم', start_ayah: 1, end_ayah: 18, points: 5, type: 'hifz', label: 'النجم (1-18)' }, // 138
    { surah: 'النجم', start_ayah: 19, end_ayah: 26, points: 5, type: 'hifz', label: 'النجم (19-26)' }, // 139
    { surah: 'النجم', start_ayah: 27, end_ayah: 32, points: 5, type: 'hifz', label: 'النجم (27-32)' }, // 140
    { surah: 'النجم', start_ayah: 33, end_ayah: 44, points: 5, type: 'hifz', label: 'النجم (33-44)' }, // 141
    { surah: 'النجم', start_ayah: 45, end_ayah: 62, points: 5, type: 'hifz', label: 'النجم (45-62)' }, // 142
    // الطور
    { surah: 'الطور', start_ayah: 1, end_ayah: 14, points: 5, type: 'hifz', label: 'الطور (1-14)' }, // 143
    { surah: 'الطور', start_ayah: 15, end_ayah: 23, points: 5, type: 'hifz', label: 'الطور (15-23)' }, // 144
    { surah: 'الطور', start_ayah: 24, end_ayah: 31, points: 5, type: 'hifz', label: 'الطور (24-31)' }, // 145
    { surah: 'الطور', start_ayah: 32, end_ayah: 43, points: 5, type: 'hifz', label: 'الطور (32-43)' }, // 146
    { surah: 'الطور', start_ayah: 44, end_ayah: 49, points: 5, type: 'hifz', label: 'الطور (44-49)' }, // 147
    // الذاريات
    { surah: 'الذاريات', start_ayah: 1, end_ayah: 23, points: 5, type: 'hifz', label: 'الذاريات (1-23)' }, // 148
    { surah: 'الذاريات', start_ayah: 24, end_ayah: 30, points: 5, type: 'hifz', label: 'الذاريات (24-30)' }, // 149
    { surah: 'الذاريات', start_ayah: 31, end_ayah: 42, points: 5, type: 'hifz', label: 'الذاريات (31-42)' }, // 150
    { surah: 'الذاريات', start_ayah: 43, end_ayah: 51, points: 5, type: 'hifz', label: 'الذاريات (43-51)' }, // 151
    { surah: 'الذاريات', start_ayah: 52, end_ayah: 60, points: 5, type: 'hifz', label: 'الذاريات (52-60)' }, // 152
    // ق
    { surah: 'ق', start_ayah: 1, end_ayah: 8, points: 5, type: 'hifz', label: 'ق (1-8)' }, // 153
    { surah: 'ق', start_ayah: 9, end_ayah: 15, points: 5, type: 'hifz', label: 'ق (9-15)' }, // 154
    { surah: 'ق', start_ayah: 16, end_ayah: 30, points: 5, type: 'hifz', label: 'ق (16-30)' }, // 155
    { surah: 'ق', start_ayah: 31, end_ayah: 38, points: 5, type: 'hifz', label: 'ق (31-38)' }, // 156
    { surah: 'ق', start_ayah: 39, end_ayah: 45, points: 5, type: 'hifz', label: 'ق (39-45)' }, // 157
    // الحجرات
    { surah: 'الحجرات', start_ayah: 1, end_ayah: 4, points: 5, type: 'hifz', label: 'الحجرات (1-4)' }, // 158
    { surah: 'الحجرات', start_ayah: 5, end_ayah: 8, points: 5, type: 'hifz', label: 'الحجرات (5-8)' }, // 159
    { surah: 'الحجرات', start_ayah: 9, end_ayah: 11, points: 5, type: 'hifz', label: 'الحجرات (9-11)' }, // 160
    { surah: 'الحجرات', start_ayah: 12, end_ayah: 14, points: 5, type: 'hifz', label: 'الحجرات (12-14)' }, // 161
    { surah: 'الحجرات', start_ayah: 15, end_ayah: 18, points: 5, type: 'hifz', label: 'الحجرات (15-18)' }, // 162
    // الفتح
    { surah: 'الفتح', start_ayah: 1, end_ayah: 5, points: 5, type: 'hifz', label: 'الفتح (1-5)' }, // 163
    { surah: 'الفتح', start_ayah: 6, end_ayah: 9, points: 5, type: 'hifz', label: 'الفتح (6-9)' }, // 164
    { surah: 'الفتح', start_ayah: 10, end_ayah: 13, points: 5, type: 'hifz', label: 'الفتح (10-13)' }, // 165
    { surah: 'الفتح', start_ayah: 14, end_ayah: 15, points: 5, type: 'hifz', label: 'الفتح (14-15)' }, // 166
    { surah: 'الفتح', start_ayah: 16, end_ayah: 19, points: 5, type: 'hifz', label: 'الفتح (16-19)' }, // 167
    { surah: 'الفتح', start_ayah: 20, end_ayah: 23, points: 5, type: 'hifz', label: 'الفتح (20-23)' }, // 168
    { surah: 'الفتح', start_ayah: 24, end_ayah: 26, points: 5, type: 'hifz', label: 'الفتح (24-26)' }, // 169
    { surah: 'الفتح', start_ayah: 27, end_ayah: 28, points: 5, type: 'hifz', label: 'الفتح (27-28)' }, // 170
    { surah: 'الفتح', start_ayah: 29, end_ayah: 29, points: 5, type: 'hifz', label: 'الفتح (29-29)' }, // 171
    // محمد
    { surah: 'محمد', start_ayah: 1, end_ayah: 6, points: 5, type: 'hifz', label: 'محمد (1-6)' }, // 172
    { surah: 'محمد', start_ayah: 7, end_ayah: 11, points: 5, type: 'hifz', label: 'محمد (7-11)' }, // 173
    { surah: 'محمد', start_ayah: 12, end_ayah: 15, points: 5, type: 'hifz', label: 'محمد (12-15)' }, // 174
    { surah: 'محمد', start_ayah: 16, end_ayah: 19, points: 5, type: 'hifz', label: 'محمد (16-19)' }, // 175
    { surah: 'محمد', start_ayah: 20, end_ayah: 24, points: 5, type: 'hifz', label: 'محمد (20-24)' }, // 176
    { surah: 'محمد', start_ayah: 25, end_ayah: 29, points: 5, type: 'hifz', label: 'محمد (25-29)' }, // 177
    { surah: 'محمد', start_ayah: 30, end_ayah: 34, points: 5, type: 'hifz', label: 'محمد (30-34)' }, // 178
    { surah: 'محمد', start_ayah: 35, end_ayah: 38, points: 5, type: 'hifz', label: 'محمد (35-38)' }, // 179
    // الأحقاف
    { surah: 'الأحقاف', start_ayah: 1, end_ayah: 5, points: 5, type: 'hifz', label: 'الأحقاف (1-5)' }, // 180
    { surah: 'الأحقاف', start_ayah: 6, end_ayah: 10, points: 5, type: 'hifz', label: 'الأحقاف (6-10)' }, // 181
    { surah: 'الأحقاف', start_ayah: 11, end_ayah: 14, points: 5, type: 'hifz', label: 'الأحقاف (11-14)' }, // 182
    { surah: 'الأحقاف', start_ayah: 15, end_ayah: 16, points: 5, type: 'hifz', label: 'الأحقاف (15-16)' }, // 183
    { surah: 'الأحقاف', start_ayah: 17, end_ayah: 20, points: 5, type: 'hifz', label: 'الأحقاف (17-20)' }, // 184
    { surah: 'الأحقاف', start_ayah: 21, end_ayah: 25, points: 5, type: 'hifz', label: 'الأحقاف (21-25)' }, // 185
    { surah: 'الأحقاف', start_ayah: 26, end_ayah: 28, points: 5, type: 'hifz', label: 'الأحقاف (26-28)' }, // 186
    { surah: 'الأحقاف', start_ayah: 29, end_ayah: 32, points: 5, type: 'hifz', label: 'الأحقاف (29-32)' }, // 187
    { surah: 'الأحقاف', start_ayah: 33, end_ayah: 35, points: 5, type: 'hifz', label: 'الأحقاف (33-35)' }, // 188
];

// منهج المراجعة المتكامل: من الأحقاف إلى الناس (ترتيب تنازلي في المصحف)
// كل عنصر هو وحدة مراجعة قد تكون سورة كاملة أو مجموعة مقسمة/مجمعة
const MurajaaCurriculum = [
    // الأحقاف (مقسمة)
    { surah: 'الأحقاف', label: 'مراجعة الأحقاف (1-16)', points: 3, type: 'murajaa', hifz_start_index: 180, hifz_end_index: 183 },
    { surah: 'الأحقاف', label: 'مراجعة الأحقاف (17-35)', points: 3, type: 'murajaa', hifz_start_index: 184, hifz_end_index: 188 },
    // محمد (مقسمة)
    { surah: 'محمد', label: 'مراجعة محمد (1-19)', points: 3, type: 'murajaa', hifz_start_index: 172, hifz_end_index: 175 },
    { surah: 'محمد', label: 'مراجعة محمد (20-38)', points: 3, type: 'murajaa', hifz_start_index: 176, hifz_end_index: 179 },
    // الفتح (مقسمة)
    { surah: 'الفتح', label: 'مراجعة الفتح (1-15)', points: 3, type: 'murajaa', hifz_start_index: 163, hifz_end_index: 166 },
    { surah: 'الفتح', label: 'مراجعة الفتح (16-29)', points: 3, type: 'murajaa', hifz_start_index: 167, hifz_end_index: 171 },
    // الحجرات (كاملة)
    { surah: 'الحجرات', label: 'مراجعة الحجرات (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 158, hifz_end_index: 162 },
    // ق (كاملة)
    { surah: 'ق', label: 'مراجعة ق (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 153, hifz_end_index: 157 },
    // الذاريات (كاملة)
    { surah: 'الذاريات', label: 'مراجعة الذاريات (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 148, hifz_end_index: 152 },
    // الطور (كاملة)
    { surah: 'الطور', label: 'مراجعة الطور (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 143, hifz_end_index: 147 },
    // النجم (كاملة)
    { surah: 'النجم', label: 'مراجعة النجم (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 138, hifz_end_index: 142 },
    // القمر (كاملة)
    { surah: 'القمر', label: 'مراجعة القمر (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 133, hifz_end_index: 137 },
    // الرحمن (كاملة)
    { surah: 'الرحمن', label: 'مراجعة الرحمن (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 128, hifz_end_index: 132 },
    // الواقعة (كاملة)
    { surah: 'الواقعة', label: 'مراجعة الواقعة (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 123, hifz_end_index: 127 },
    // الحديد (مقسمة)
    { surah: 'الحديد', label: 'مراجعة الحديد (1-18)', points: 3, type: 'murajaa', hifz_start_index: 115, hifz_end_index: 118 },
    { surah: 'الحديد', label: 'مراجعة الحديد (19-29)', points: 3, type: 'murajaa', hifz_start_index: 119, hifz_end_index: 122 },
    // المجادلة (مقسمة)
    { surah: 'المجادلة', label: 'مراجعة المجادلة (1-12)', points: 3, type: 'murajaa', hifz_start_index: 106, hifz_end_index: 111 },
    { surah: 'المجادلة', label: 'مراجعة المجادلة (13-22)', points: 3, type: 'murajaa', hifz_start_index: 112, hifz_end_index: 114 },
    // الحشر (مقسمة)
    { surah: 'الحشر', label: 'مراجعة الحشر (1-12)', points: 3, type: 'murajaa', hifz_start_index: 98, hifz_end_index: 102 },
    { surah: 'الحشر', label: 'مراجعة الحشر (13-24)', points: 3, type: 'murajaa', hifz_start_index: 103, hifz_end_index: 105 },
    // الممتحنة (مقسمة)
    { surah: 'الممتحنة', label: 'مراجعة الممتحنة (1-7)', points: 3, type: 'murajaa', hifz_start_index: 92, hifz_end_index: 94 },
    { surah: 'الممتحنة', label: 'مراجعة الممتحنة (8-13)', points: 3, type: 'murajaa', hifz_start_index: 95, hifz_end_index: 97 },
    // الصف (كاملة)
    { surah: 'الصف', label: 'مراجعة الصف (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 87, hifz_end_index: 91 },
    // الجمعة (كاملة)
    { surah: 'الجمعة', label: 'مراجعة الجمعة (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 83, hifz_end_index: 86 },
    // المنافقون (كاملة)
    { surah: 'المنافقون', label: 'مراجعة المنافقون (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 78, hifz_end_index: 82 },
    // التغابن (كاملة)
    { surah: 'التغابن', label: 'مراجعة التغابن (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 72, hifz_end_index: 77 },
    // الطلاق (كاملة)
    { surah: 'الطلاق', label: 'مراجعة الطلاق (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 67, hifz_end_index: 71 },
    // التحريم (كاملة)
    { surah: 'التحريم', label: 'مراجعة التحريم (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 62, hifz_end_index: 66 },
    // الملك (كاملة)
    { surah: 'الملك', label: 'مراجعة الملك (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 57, hifz_end_index: 61 },
    // القلم (كاملة)
    { surah: 'القلم', label: 'مراجعة القلم (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 50, hifz_end_index: 56 },
    // الحاقة (كاملة)
    { surah: 'الحاقة', label: 'مراجعة الحاقة (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 44, hifz_end_index: 49 },
    // المعارج (كاملة)
    { surah: 'المعارج', label: 'مراجعة المعارج (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 38, hifz_end_index: 43 },
    // نوح (كاملة)
    { surah: 'نوح', label: 'مراجعة نوح (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 33, hifz_end_index: 37 },
    // الجن (كاملة)
    { surah: 'الجن', label: 'مراجعة الجن (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 26, hifz_end_index: 32 },
    // المزمل (كاملة)
    { surah: 'المزمل', label: 'مراجعة المزمل (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 22, hifz_end_index: 25 },
    // المدثر (كاملة)
    { surah: 'المدثر', label: 'مراجعة المدثر (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 16, hifz_end_index: 21 },
    // القيامة (كاملة)
    { surah: 'القيامة', label: 'مراجعة القيامة (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 12, hifz_end_index: 15 },
    // الإنسان (كاملة)
    { surah: 'الإنسان', label: 'مراجعة الإنسان (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 6, hifz_end_index: 11 },
    // المرسلات (كاملة)
    { surah: 'المرسلات', label: 'مراجعة المرسلات (كاملة)', points: 3, type: 'murajaa', hifz_start_index: 0, hifz_end_index: 5 },
    // باقي جزء عم (قيم -1 لتمثيل أن هذه المقاطع ليست في HifzCurriculum الحالي)
    { surah: 'النبأ', label: 'مراجعة النبأ (كاملة)', points: 3, type: 'murajaa', hifz_start_index: -1, hifz_end_index: -1 },
    { surah: 'النازعات', label: 'مراجعة النازعات (كاملة)', points: 3, type: 'murajaa', hifz_start_index: -1, hifz_end_index: -1 },
    { surah: 'عبس والتكوير', label: 'مراجعة عبس والتكوير', points: 3, type: 'murajaa', hifz_start_index: -1, hifz_end_index: -1 },
    { surah: 'الإنفطار والمطففين', label: 'مراجعة الإنفطار والمطففين', points: 3, type: 'murajaa', hifz_start_index: -1, hifz_end_index: -1 },
    { surah: 'الإنشقاق والبروج', label: 'مراجعة الإنشقاق والبروج', points: 3, type: 'murajaa', hifz_start_index: -1, hifz_end_index: -1 },
    { surah: 'الطارق إلى الفجر', label: 'مراجعة الطارق إلى الفجر', points: 3, type: 'murajaa', hifz_start_index: -1, hifz_end_index: -1 },
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

// 🔑 دالة عرض المناهج في لوحة المعلم (إدارة المناهج)
function displayCurriculumsInTeacherPanel() {
    hifzCurriculumDisplay.innerHTML = '';
    murajaaCurriculumDisplay.innerHTML = '';

    // عرض منهج الحفظ
    HifzCurriculum.forEach((item, index) => {
        const div = document.createElement('div');
        // يتم استخدام (index + 1) ليكون الرقم التسلسلي مطابقًا للرقم المدخل في حقل الإضافة.
        div.innerHTML = `<span>**${index + 1}.** ${item.label}</span> <small>(${item.points} نقطة)</small>`;
        hifzCurriculumDisplay.appendChild(div);
    });

    // عرض منهج المراجعة
    MurajaaCurriculum.forEach((item, index) => {
        const div = document.createElement('div');
        // يتم استخدام (index + 1) ليكون الرقم التسلسلي مطابقًا للرقم المدخل في حقل الإضافة.
        div.innerHTML = `<span>**${index + 1}.** ${item.label}</span> <small>(${item.points} نقطة)</small>`;
        murajaaCurriculumDisplay.appendChild(div);
    });
}

// 📝 دالة إحضار بيانات الطالب
async function loadStudentData(userCode) {
    try {
        const doc = await db.collection('students').doc(userCode).get();
        if (doc.exists) {
            return doc.data();
        }
        return null;
    } catch (error) {
        console.error("Error loading student data:", error);
        return null;
    }
}

// 📊 دالة عرض المهام للطالب
async function displayStudentTasks(studentCode, hifzProgressIndex, murajaaProgressIndex) {
    studentTasksDiv.innerHTML = '<p>جارٍ تحميل المهام...</p>';
    
    // 1. المهمة التلقائية للحفظ (المقطع التالي)
    if (hifzProgressIndex < HifzCurriculum.length) {
        const nextHifz = HifzCurriculum[hifzProgressIndex];
        // إنشاء مهمة مؤقتة للعرض
        const hifzTask = {
            id: 'auto-hifz',
            type: 'hifz',
            description: `حفظ جديد: ${nextHifz.label}`,
            points: nextHifz.points,
            status: 'Pending',
            isAutomatic: true,
            curriculumIndex: hifzProgressIndex
        };
        renderTask(hifzTask, studentCode, studentTasksDiv);
    } else {
        const p = document.createElement('p');
        p.textContent = 'أتممت حفظ المنهج الأساسي بنجاح! بارك الله فيك.';
        studentTasksDiv.appendChild(p);
    }

    // 2. المهمة التلقائية للمراجعة (الوحدة التالية)
    if (murajaaProgressIndex < MurajaaCurriculum.length) {
        const nextMurajaa = MurajaaCurriculum[murajaaProgressIndex];
        const murajaaTask = {
            id: 'auto-murajaa',
            type: 'murajaa',
            description: `مراجعة: ${nextMurajaa.label}`,
            points: nextMurajaa.points,
            status: 'Pending',
            isAutomatic: true,
            curriculumIndex: murajaaProgressIndex
        };
        renderTask(murajaaTask, studentCode, studentTasksDiv);
    }

    // 3. المهام الإضافية (من البنك أو الفردية) من Firestore
    const tasksRef = db.collection('tasks').where('studentCode', 'in', [studentCode, 'GROUP']).where('status', '==', 'Pending');
    const snapshot = await tasksRef.get();
    
    if (!snapshot.empty) {
        snapshot.docs.forEach(doc => {
            const task = { id: doc.id, ...doc.data() };
            // تأكد أن المهام الجماعية لم تُنجز من قبل هذا الطالب
            if (task.studentCode === 'GROUP' && task.completedBy && task.completedBy.includes(studentCode)) {
                return; // تخطي المهمة إذا كان الطالب قد أتمها بالفعل
            }
            renderTask(task, studentCode, studentTasksDiv, doc.id);
        });
    }

    if (studentTasksDiv.childElementCount === 0) {
         studentTasksDiv.innerHTML = '<p>لا توجد مهام حالية. بانتظار تعيين مهام جديدة.</p>';
    }
}

// 🎨 دالة رسم المهمة في DOM
function renderTask(task, studentCode, container, taskId = task.id) {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item ${task.type}`;
    taskItem.setAttribute('data-task-id', taskId);

    taskItem.innerHTML = `
        <div class="task-description">${task.description}</div>
        <div class="task-status">النوع: <strong>${task.type === 'hifz' ? 'حفظ' : task.type === 'murajaa' ? 'مراجعة' : 'إضافية'}</strong></div>
        <div class="task-points">النقاط المكتسبة: **${task.points}**</div>
        <div class="task-actions">
            <button class="complete-btn" data-task-id="${taskId}" data-task-type="${task.type}" 
                    data-hifz-index="${task.curriculumIndex !== undefined ? task.curriculumIndex : -1}"
                    data-murajaa-index="${task.curriculumIndex !== undefined ? task.curriculumIndex : -1}">
                تم الإنجاز (للمعلم)
            </button>
        </div>
    `;

    // إذا كانت مهمة تلقائية، يتم إضافة مؤشر لها
    if (task.isAutomatic) {
        taskItem.innerHTML += `<small class="auto-task-note"> (مهمة تقدم تلقائية) </small>`;
    }

    container.appendChild(taskItem);
    
    // ربط زر الإنجاز بحدث
    const completeButton = taskItem.querySelector('.complete-btn');
    completeButton.addEventListener('click', () => {
        handleTaskCompletion(
            studentCode, 
            completeButton.getAttribute('data-task-id'), 
            completeButton.getAttribute('data-task-type'), 
            parseInt(completeButton.getAttribute('data-hifz-index')),
            parseInt(completeButton.getAttribute('data-murajaa-index')),
            task.points,
            task.description,
            task.isAutomatic,
            task.studentCode // استخدم هذا لتحديد ما إذا كانت جماعية
        );
    });
}


// 🏆 دالة التعامل مع إنجاز المهمة (يجب أن ينفذها المعلم عند التحقق)
async function handleTaskCompletion(studentCode, taskId, type, hifzIndex, murajaaIndex, points, description, isAutomatic, assignedTo) {
    if (currentUser.role !== 'teacher') {
        alert('يجب أن يكون المعلم هو من يؤكد إنجاز المهمة.');
        return;
    }

    const confirmCompletion = confirm(`هل أنت متأكد من تأكيد إنجاز المهمة: "${description}" للطالب ${studentCode}؟ سيتم إضافة ${points} نقطة.`);

    if (!confirmCompletion) return;

    try {
        const studentRef = db.collection('students').doc(studentCode);
        await db.runTransaction(async (transaction) => {
            const studentDoc = await transaction.get(studentRef);
            if (!studentDoc.exists) {
                throw "Student not found!";
            }
            
            const studentData = studentDoc.data();
            let newHifzIndex = studentData.hifzProgressIndex;
            let newMurajaaIndex = studentData.murajaaProgressIndex;

            // 1. تحديث تقدم الطالب
            if (isAutomatic) {
                if (type === 'hifz' && hifzIndex === studentData.hifzProgressIndex) {
                    newHifzIndex += 1;
                } else if (type === 'murajaa' && murajaaIndex === studentData.murajaaProgressIndex) {
                    newMurajaaIndex += 1;
                }
            }
            
            // 2. تحديث بيانات الطالب (النقاط والتقدم)
            transaction.update(studentRef, {
                totalPoints: studentData.totalPoints + points,
                hifzProgressIndex: newHifzIndex,
                murajaaProgressIndex: newMurajaaIndex
            });

            // 3. تحديث حالة المهمة
            if (!isAutomatic) {
                 if (assignedTo === 'GROUP') {
                    // للمهام الجماعية، لا نحذفها، بل نضيف الطالب لقائمة المنجزين
                    const taskRef = db.collection('tasks').doc(taskId);
                    transaction.update(taskRef, {
                        completedBy: firebase.firestore.FieldValue.arrayUnion(studentCode)
                    });
                } else {
                    // للمهام الفردية أو مهام البنك، يتم حذفها أو نقلها
                    transaction.delete(db.collection('tasks').doc(taskId));
                }
            }
        });

        showMessage(studentTasksDiv, 'تم تأكيد الإنجاز بنجاح وإضافة النقاط والتقدم.', 'success');
        
        // إعادة تحميل البيانات بعد الإنجاز
        loadStudentInfo(studentCode);

    } catch (error) {
        console.error("Transaction failed: ", error);
        showMessage(studentTasksDiv, 'حدث خطأ أثناء تأكيد الإنجاز: ' + (error.message || error), 'error');
    }
}


// --- Teacher Panel Functions ---

// 🧑‍🏫 تحميل قائمة الطلاب
async function loadStudentsForTeacher() {
    studentList.innerHTML = '<li>جارٍ تحميل الطلاب...</li>';
    try {
        const snapshot = await db.collection('students').get();
        studentList.innerHTML = '';
        if (snapshot.empty) {
            studentList.innerHTML = '<li>لا يوجد طلاب مسجلون بعد.</li>';
            return;
        }

        snapshot.docs.forEach(doc => {
            const student = doc.data();
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    **${student.name}** (**${student.id}**) <br>
                    <small>الحفظ: ${HifzCurriculum[student.hifzProgressIndex]?.label || 'أتم الحفظ'} | المراجعة: ${MurajaaCurriculum[student.murajaaProgressIndex]?.label || 'أتم المراجعة'}</small>
                </div>
                <div class="student-actions">
                    <button data-code="${student.id}" class="btn primary view-btn">عرض المهام</button>
                    <button data-code="${student.id}" class="btn danger delete-btn">حذف</button>
                </div>
            `;
            studentList.appendChild(li);
        });
        
        // ربط أزرار عرض وحذف
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', () => {
                viewStudentTasks(button.getAttribute('data-code'));
            });
        });
        // ربط أزرار الحذف (يمكن تطويرها لاحقاً لتعمل)
        document.querySelectorAll('.delete-btn').forEach(button => {
             button.addEventListener('click', () => {
                deleteStudent(button.getAttribute('data-code'));
            });
        });

    } catch (error) {
        console.error("Error loading students:", error);
        studentList.innerHTML = '<li>حدث خطأ في تحميل بيانات الطلاب.</li>';
    }
}

// 🧐 عرض مهام طالب معين (من طرف المعلم)
async function viewStudentTasks(studentCode) {
    const student = await loadStudentData(studentCode);
    if (student) {
        hideAllScreens();
        // عرض شاشة الطالب لكن مع إمكانية تعديل المهام (هذا للتطوير المستقبلي)
        teacherScreen.classList.remove('hidden');
        setActiveTab('assign-tasks-tab');
        assignTaskStudentCode.value = studentCode;
        // هنا يمكنك عرض لوحة خاصة لمتابعة مهام هذا الطالب
        
        // يمكننا استخدام نفس دالة عرض المهام لكن يجب أن نخصص مكان لعرضها
        // حالياً، سنبقيها بسيطة ونطلب من المعلم استخدام قسم 'تعيين المهام'
        showMessage(assignTaskMessage, `تم تحديد الطالب: **${student.name}** (${studentCode}) لتعيين مهمة جديدة.`, 'success');
    } else {
        showMessage(assignTaskMessage, 'لم يتم العثور على الطالب.', 'error');
    }
}


// ➕ تسجيل طالب جديد
registerStudentButton.addEventListener('click', async () => {
    const id = newStudentCodeInput.value.trim();
    const name = newStudentNameInput.value.trim();
    const hifzStart = parseInt(newStudentHifzStart.value.trim()); // index + 1
    const murajaaStart = parseInt(newStudentMurajaaStart.value.trim()); // index + 1

    if (!id || !name || isNaN(hifzStart) || isNaN(murajaaStart)) {
        showMessage(registerStudentMessage, 'الرجاء ملء جميع الحقول بشكل صحيح.', 'error');
        return;
    }

    if (hifzStart < 1 || hifzStart > HifzCurriculum.length || murajaaStart < 1 || murajaaStart > MurajaaCurriculum.length) {
        showMessage(registerStudentMessage, `يجب أن يكون رقم بداية الحفظ بين 1 و ${HifzCurriculum.length} ورقم المراجعة بين 1 و ${MurajaaCurriculum.length}.`, 'error');
        return;
    }

    try {
        await db.collection('students').doc(id).set({
            id: id,
            name: name,
            role: 'student',
            // المنهج يبدأ من الفهرس (الرقم - 1)
            hifzProgressIndex: hifzStart - 1, 
            murajaaProgressIndex: murajaaStart - 1, 
            totalPoints: 0,
            registrationDate: firebase.firestore.FieldValue.serverTimestamp()
        });
        showMessage(registerStudentMessage, `تم تسجيل الطالب ${name} بنجاح.`, 'success');
        newStudentCodeInput.value = '';
        newStudentNameInput.value = '';
        newStudentHifzStart.value = 1;
        newStudentMurajaaStart.value = 1;
        loadStudentsForTeacher(); // تحديث قائمة الطلاب
    } catch (error) {
        console.error("Error registering student:", error);
        showMessage(registerStudentMessage, 'حدث خطأ: قد يكون الرمز مستخدمًا أو هناك مشكلة في الاتصال.', 'error');
    }
});


// 🎯 تعيين المهام (فردية/جماعية)
async function assignTask(isGroup) {
    const studentCode = assignTaskStudentCode.value.trim();
    const type = assignTaskType.value;
    const description = assignTaskDescription.value.trim();
    const points = parseInt(assignTaskPoints.value);
    const assignedTo = isGroup ? 'GROUP' : studentCode;

    if (!isGroup && !studentCode) {
        showMessage(assignTaskMessage, 'الرجاء إدخال رمز الطالب للمهمة الفردية.', 'error');
        return;
    }

    if (isNaN(points) || points < 1) {
        showMessage(assignTaskMessage, 'الرجاء إدخال عدد نقاط صحيح.', 'error');
        return;
    }
    
    // المهام التلقائية للحفظ والمراجعة لا يتم تعيينها من هنا
    if (type === 'hifz' || type === 'murajaa') {
        showMessage(assignTaskMessage, 'مهام الحفظ والمراجعة العادية يتم إنشاؤها تلقائياً حسب تقدم الطالب. يمكنك تعيين مهمة "من بنك المهام" أو "مهمة إضافية".', 'error');
        return;
    }

    if (!description) {
        showMessage(assignTaskMessage, 'الرجاء إدخال وصف للمهمة.', 'error');
        return;
    }


    try {
        await db.collection('tasks').add({
            studentCode: assignedTo,
            type: type, // يجب أن يكون 'bank' هنا
            description: description,
            points: points,
            status: 'Pending',
            assignedBy: currentUser.id,
            assignedDate: firebase.firestore.FieldValue.serverTimestamp(),
            completedBy: assignedTo === 'GROUP' ? [] : null // لقائمة الطلاب المنجزين في المهام الجماعية
        });

        const msg = isGroup ? 'تم تعيين المهمة الجماعية بنجاح.' : `تم تعيين المهمة الفردية للطالب ${studentCode} بنجاح.`;
        showMessage(assignTaskMessage, msg, 'success');
        assignTaskStudentCode.value = '';
        assignTaskDescription.value = '';
        assignTaskPoints.value = 5;

    } catch (error) {
        console.error("Error assigning task:", error);
        showMessage(assignTaskMessage, 'حدث خطأ أثناء تعيين المهمة.', 'error');
    }
}

assignIndividualTaskButton.addEventListener('click', () => assignTask(false));
assignGroupTaskButton.addEventListener('click', () => assignTask(true));


// ➡️ دالة عرض شاشة الطالب (تُستدعى بعد نجاح تسجيل الدخول)
async function loadStudentInfo(userCode) {
    const student = await loadStudentData(userCode);
    
    if (student) {
        currentUser = { id: student.id, name: student.name, role: student.role };
        
        hideAllScreens();
        studentScreen.classList.remove('hidden');
        
        welcomeStudent.textContent = `مرحباً بك يا ${student.name}!`;
        studentTotalPoints.textContent = student.totalPoints;
        
        // عرض تقدم الحفظ
        const currentHifzItem = HifzCurriculum[student.hifzProgressIndex];
        studentHifzProgress.textContent = currentHifzItem ? currentHifzItem.label : 'أتممت حفظ المنهج!';
        
        // عرض تقدم المراجعة
        const currentMurajaaItem = MurajaaCurriculum[student.murajaaProgressIndex];
        studentMurajaaProgress.textContent = currentMurajaaItem ? currentMurajaaItem.label : 'أتممت مراجعة المنهج!';

        // عرض المهام المعلقة (التلقائية + اليدوية)
        await displayStudentTasks(student.id, student.hifzProgressIndex, student.murajaaProgressIndex);
        
    } else {
         showMessage(authMessage, 'لم يتم العثور على طالب بهذا الرمز.', 'error');
    }
}


// --- Authentication Logic Continuation ---
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
        
        // 🔑 الأجزاء المُعدَّلة والمضافة هنا
        loadStudentsForTeacher();
        displayCurriculumsInTeacherPanel(); // <--- عرض المناهج في لوحة المعلم
        setActiveTab('manage-students-tab');
        
    } else {
        // محاولة تسجيل دخول الطالب
        await loadStudentInfo(userCode);
    }
});


// --- Initial Setup and Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // إعداد أزرار التبويبات للمعلم
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            setActiveTab(button.getAttribute('data-tab') + '-tab');
        });
    });

    // أزرار تسجيل الخروج
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
});
