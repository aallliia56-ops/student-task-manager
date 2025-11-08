// ///////////////////////////////////////////////////////////////////////////////
// هذا الملف يستخدم Firebase Modular SDK (الإصدار 9) مع عبارات import/export.
// ///////////////////////////////////////////////////////////////////////////////

// 💥 استيراد Firebase من CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    arrayUnion,
    writeBatch
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

// ⭐ استيراد المنهج من ملف خارجي
import { HIFZ_CURRICULUM, REVIEW_CURRICULUM, LEVEL_CONFIG } from './curriculum.js';


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCeIcmuTd72sjiu1Uyijn_J4bMS0ChtXGo",
    authDomain: "studenttasksmanager.firebaseapp.com",
    projectId: "studenttasksmanager",
    storageBucket: "studenttasksmanager.firebasestorage.app",
    messagingSenderId: "850350680089",
    appId: "1:850350680089:web:51b71a710e938754bc6288",
    measurementId: "G-7QC4FVXKZG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- DOM Elements ---
// --- DOM Elements ---
const authScreen      = document.getElementById('auth-screen');
const studentScreen   = document.getElementById('student-screen');
const teacherScreen   = document.getElementById('teacher-screen');

const userCodeInput   = document.getElementById('user-code');
const loginButton     = document.getElementById('login-button');
const authMessage     = document.getElementById('auth-message');

const welcomeStudent = document.getElementById('welcome-student');
const studentHifzProgress = document.getElementById('student-hifz-progress');

// ⭐ جديد: سبانات عرض مستوى المراجعة وتقدمها
const studentMurajaaLevelSpan = document.getElementById('student-murajaa-level');
const studentMurajaaProgressIndexSpan = document.getElementById('student-murajaa-progress-index');

const studentTotalPoints = document.getElementById('student-total-points');
const studentTasksDiv = document.getElementById('student-tasks');


const logoutButtonStudent = document.getElementById('logout-button-student');
const logoutButtonTeacher = document.getElementById('logout-button-teacher');


const manageStudentsTab = document.getElementById('manage-students-tab');
const addStudentTab = document.getElementById('add-student-tab');
const manageCurriculumTab = document.getElementById('manage-curriculum-tab');
const assignTasksTab = document.getElementById('assign-tasks-tab');
const reviewTasksTab = document.getElementById('review-tasks-tab');
const tabButtons = document.querySelectorAll('.tab-button');

const studentList = document.getElementById('student-list');
const newStudentCodeInput = document.getElementById('new-student-code');
const newStudentNameInput = document.getElementById('new-student-name');
const newStudentHifzStart = document.getElementById('new-student-hifz-start');
const newStudentMurajaaLevel = document.getElementById('new-student-murajaa-level');

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

const pendingTasksList = document.getElementById('pending-tasks-list');

let currentUser = null; // Stores current logged-in user data

// =======================================================
// ⭐ تجهيز المنهج من curriculum.js بشكل مناسب للتطبيق
// =======================================================

// 1) منهج الحفظ: نضيف label جاهز للعرض
const globalHifzCurriculum = HIFZ_CURRICULUM.map(item => ({
    ...item,
    label: `${item.surah_name_ar} (${item.start_ayah}-${item.end_ayah})`
}));

// 2) منهج المراجعة: نضيف label لكل عنصر حسب name
const globalReviewCurriculumLevels = {};
Object.entries(REVIEW_CURRICULUM).forEach(([level, items]) => {
    globalReviewCurriculumLevels[level] = items.map((item, index) => ({
        ...item,
        label: item.name
    }));
});

// قائمة المراجعة النشطة للطالب الحالي
let studentMurajaaCurriculum = [];

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
    if (authScreen)    authScreen.classList.add('hidden');
    if (studentScreen) studentScreen.classList.add('hidden');
    if (teacherScreen) teacherScreen.classList.add('hidden');
}

function setActiveTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(tabId).classList.remove('hidden');

    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    document
        .querySelector(`.tab-button[data-tab="${tabId.replace('-tab', '')}"]`)
        .classList.add('active');
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * تجهز قائمة المراجعة للطالب بناءً على مستوى المراجعة المخزن في وثيقته.
 * @param {string} level مستوى المراجعة الثابت للطالب.
 */
function setStudentMurajaaCurriculum(level) {
    if (globalReviewCurriculumLevels[level]) {
        studentMurajaaCurriculum = globalReviewCurriculumLevels[level];
    } else {
        console.warn(`Murajaa level ${level} not found. Defaulting to empty.`);
        studentMurajaaCurriculum = [];
    }
}


// --- NEW FUNCTION: Populate Curriculum Selects (للوحة المعلم) ---
function populateCurriculumSelects() {
    // Populate Hifz Select (using index as value)
    const hifzOptions = globalHifzCurriculum.map((item, index) =>
        `<option value="${index}">${item.label} (الدليل: ${index})</option>`
    ).join('');
    newStudentHifzStart.innerHTML = hifzOptions;

    // Populate Murajaa Level Select (using level name as value)
    const levelKeys = Object.keys(globalReviewCurriculumLevels);
    const murajaaOptions = levelKeys.map(key =>
        `<option value="${key}">${key}</option>`
    ).join('');
    newStudentMurajaaLevel.innerHTML = murajaaOptions;
}

// =======================================================
// ⭐⭐ دوال لوحة قيادة الطالب (Student Dashboard Functions) ⭐⭐
// =======================================================

/**
 * دالة لمعالجة إظهار أو إخفاء المهام الإضافية وتحديث Firestore.
 */
async function toggleBonusTask(type, index, action) {
    if (!currentUser || currentUser.role !== 'student') return;

    try {
        const studentDocRef = doc(db, 'students', currentUser.code);
        let bonusField;

        if (type === 'hifz') {
            bonusField = 'displayed_hifz_bonus_tasks';
        } else if (type === 'murajaa') {
            bonusField = 'displayed_murajaa_bonus_tasks';
        } else {
            return;
        }

        let newBonusArray = currentUser[bonusField] || [];

        if (action === 'add') {
            // قيد الحد الأقصى (2)
            if (newBonusArray.length < 2 && !newBonusArray.includes(index)) {
                newBonusArray.push(index);
                showMessage(authMessage, `تم إظهار مهمة إضافية.`, 'info');
            } else {
                showMessage(authMessage, `لا يمكن إظهار المزيد من المهام الإضافية.`, 'error');
                return;
            }
        } else if (action === 'remove') {
            newBonusArray = newBonusArray.filter(i => i !== index);
            showMessage(authMessage, `تم إخفاء المهمة الإضافية.`, 'info');
        }

        await updateDoc(studentDocRef, {
            [bonusField]: newBonusArray
        });
        currentUser[bonusField] = newBonusArray;

        // إعادة عرض لوحة الطالب لتحديث الواجهة
        displayStudentDashboard(currentUser);

    } catch (error) {
        console.error(`Error toggling bonus task (${action}):`, error);
        showMessage(authMessage, `حدث خطأ في تحديث المهام الإضافية: ${error.message}`, 'error');
    }
}

/**
 * دالة لإنجاز المهام التي تعتمد على تقدم المنهج (Hifz/Murajaa) - إرسال للمراجعة.
 */
async function completeCurriculumTask(studentCode, type) {
    try {
        const studentDocRef = doc(db, 'students', studentCode);
        const docSnapshot = await getDoc(studentDocRef);
        if (!docSnapshot.exists()) return;

        const student = docSnapshot.data();
        let progressField, curriculumArray;

        if (type === 'murajaa') {
            setStudentMurajaaCurriculum(student.murajaa_level);
        }

        if (type === 'hifz') {
            progressField = 'hifz_progress';
            curriculumArray = globalHifzCurriculum;
        } else if (type === 'murajaa') {
            progressField = 'murajaa_progress_index';
            curriculumArray = studentMurajaaCurriculum;
        } else {
            showMessage(authMessage, 'نوع مهمة غير مدعوم في هذا الإجراء.', 'error');
            return;
        }

        const progressIndex = student[progressField] || 0;
        const taskItem = curriculumArray[progressIndex];

        if (!taskItem) {
            showMessage(authMessage, `لا توجد مهمة حالية لهذا النوع.`, 'error');
            return;
        }

        const isMainTaskPending = student.tasks.some(t =>
            t.type === type &&
            t.description.includes(taskItem.label) &&
            t.status === 'pending'
        );

        if (isMainTaskPending) {
            showMessage(authMessage, `المهمة الرئيسية (${taskItem.label}) قيد مراجعة المعلم بالفعل.`, 'info');
            return;
        }

        let taskIndex = student.tasks.findIndex(t =>
            t.type === type &&
            t.description.includes(taskItem.label) &&
            (t.status === 'assigned' || t.status === 'rejected')
        );

        const taskDescription = `${type === 'hifz' ? 'حفظ' : 'مراجعة'}: ${taskItem.label}`;
        const points = (type === 'hifz')
            ? taskItem.points * (student.hifz_level_multiplier || 1)
            : taskItem.points;

        if (taskIndex === -1) {
            const newTask = {
                id: generateUniqueId(),
                description: taskDescription,
                type: type,
                points: points,
                completed: false,
                status: 'pending'
            };
            student.tasks.push(newTask);
        } else {
            student.tasks[taskIndex].status = 'pending';
            student.tasks[taskIndex].points = points;
        }

        await updateDoc(studentDocRef, {
            tasks: student.tasks
        });

        currentUser = student;
        displayStudentDashboard(currentUser);

        showMessage(authMessage, `تم إرسال مهمة ${taskItem.label} للمراجعة.`, 'success');

    } catch (error) {
        console.error("Error setting curriculum task to pending: ", error);
        showMessage(authMessage, `حدث خطأ أثناء إرسال المهمة: ${error.message}`, 'error');
    }
}


/**
 * دالة لإنجاز المهام العامة (غير التسلسلية)
 */
async function completeGeneralTask(studentCode, taskId) {
    try {
        const studentDocRef = doc(db, 'students', studentCode);
        const docSnapshot = await getDoc(studentDocRef);
        if (!docSnapshot.exists()) return;

        const student = docSnapshot.data();
        const taskIndex = student.tasks.findIndex(t => t.id === taskId);

        if (taskIndex !== -1 && student.tasks[taskIndex].status === 'assigned') {
            student.tasks[taskIndex].status = 'pending';

            await updateDoc(studentDocRef, {
                tasks: student.tasks,
            });

            currentUser = student;
            displayStudentDashboard(currentUser);

            showMessage(authMessage, `تم إرسال المهمة للمراجعة. عند قبول المعلم، ستُضاف النقاط.`, 'success');

        } else if (taskIndex !== -1 && student.tasks[taskIndex].status === 'pending') {
            showMessage(authMessage, `هذه المهمة قيد مراجعة المعلم بالفعل. ننتظر القبول.`, 'info');
        }

    } catch (error) {
        console.error("Error setting task to pending: ", error);
        showMessage(authMessage, `حدث خطأ أثناء إرسال المهمة: ${error.message}`, 'error');
    }
}


/**
 * دالة لعرض المهام الموكلة إلى الطالب بناءً على تقدمه في المنهج (Hifz/Murajaa).
 */
function renderCurriculumTasks(student) {
    const tasksContainer = document.getElementById('student-tasks');
    tasksContainer.innerHTML = '<h2>مهامك الحالية</h2>';

    const createTaskElement = (task, isMain, isPending, index) => {
        const statusText = isPending ? 'قيد المراجعة...' : 'بانتظار الإنجاز';
        const statusClass = isPending ? 'pending' : 'assigned';

        let buttonHTML = '';
        if (isPending) {
            buttonHTML = `<button class="complete-btn" disabled>قيد المراجعة</button>`;
        } else if (isMain) {
            buttonHTML = `<button class="complete-btn curriculum-btn" data-task-type="${task.type}">أنجزت المهمة ✅</button>`;
        } else {
            buttonHTML = `<button class="complete-btn" disabled>مغلقة (أنجز المهمة الرئيسية)</button>`;
        }

        let hideButton = '';
        if (!isMain) {
            hideButton = `<button class="toggle-bonus-btn hide-btn" data-index="${index}" data-type="${task.type}">إخفاء ➖</button>`;
        }

        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.type} ${statusClass} ${isMain ? 'main-task' : 'bonus-task'}`;
        taskItem.innerHTML = `
            <div class="task-header">
                <span class="task-title">
                    ${isMain ? '🎯 المهمة الحالية:' : '✨ مهمة إضافية (قادمة):'}
                    ${task.label}
                </span>
                <div class="task-meta">
                    <span class="task-points">النقاط: <strong>${task.points}</strong></span>
                    <span class="task-status">${statusText}</span>
                    ${!isMain ? hideButton : ''}
                </div>
            </div>
            <div class="task-controls">
                ${buttonHTML}
            </div>
        `;
        return taskItem;
    };


    // ----------------------------------------------------
    // 1. مهام الحفظ (HIFZ)
    // ----------------------------------------------------
    const hifzContainer = document.createElement('div');
    hifzContainer.id = 'hifz-tasks-list';
    hifzContainer.innerHTML = '<h3>مهام الحفظ</h3>';
    tasksContainer.appendChild(hifzContainer);

    const hifzProgress = student.hifz_progress || 0;
    const hifzBonus = student.displayed_hifz_bonus_tasks || [];
    const hifzCap = globalHifzCurriculum.length;

    const mainHifzItem = globalHifzCurriculum[hifzProgress];
    const isHifzMainPending = student.tasks.some(t =>
        t.type === 'hifz' &&
        t.description.includes(mainHifzItem?.label || '') &&
        t.status === 'pending'
    );

    if (hifzProgress < hifzCap && mainHifzItem) {
        const taskItem = createTaskElement(
            { ...mainHifzItem, type: 'hifz' },
            true,
            isHifzMainPending,
            hifzProgress
        );
        hifzContainer.appendChild(taskItem);
    } else if (hifzProgress >= hifzCap) {
        hifzContainer.innerHTML += '<p class="message success">✅ تم إكمال منهج الحفظ. تهانينا!</p>';
    }

    hifzBonus.sort((a, b) => a - b).forEach(index => {
        if (index > hifzProgress && index < hifzCap) {
            const bonusItem = globalHifzCurriculum[index];
            const taskItem = createTaskElement(
                { ...bonusItem, type: 'hifz' },
                false,
                isHifzMainPending,
                index
            );
            hifzContainer.appendChild(taskItem);
        }
    });

    if (hifzProgress < hifzCap && hifzBonus.length < 2) {
        let nextIndex = hifzProgress + 1;
        while (hifzBonus.includes(nextIndex) && nextIndex < hifzCap) {
            nextIndex++;
        }

        if (nextIndex < hifzCap) {
            const showButtonDiv = document.createElement('div');
            showButtonDiv.className = 'toggle-button-wrapper';
            showButtonDiv.innerHTML = `<button id="show-hifz-bonus-btn" data-index="${nextIndex}" data-type="hifz" ${isHifzMainPending ? 'disabled' : ''}>إظهار مهمة حفظ إضافية ➕</button>`;
            hifzContainer.appendChild(showButtonDiv);
        }
    }

    // ----------------------------------------------------
    // 2. مهام المراجعة (MURAJAA)
    // ----------------------------------------------------
    const murajaaContainer = document.createElement('div');
    murajaaContainer.id = 'murajaa-tasks-list';
    murajaaContainer.innerHTML = '<h3>مهام المراجعة</h3>';
    tasksContainer.appendChild(murajaaContainer);

    const murajaaProgressIndex = student.murajaa_progress_index || 0;
    const murajaaBonus = student.displayed_murajaa_bonus_tasks || [];
    const murajaaCap = studentMurajaaCurriculum.length;

    const mainMurajaaItem = studentMurajaaCurriculum[murajaaProgressIndex];
    const isMurajaaMainPending = student.tasks.some(t =>
        t.type === 'murajaa' &&
        t.description.includes(mainMurajaaItem?.label || '') &&
        t.status === 'pending'
    );

    if (murajaaProgressIndex < murajaaCap && mainMurajaaItem) {
        const taskItem = createTaskElement(
            { ...mainMurajaaItem, type: 'murajaa' },
            true,
            isMurajaaMainPending,
            murajaaProgressIndex
        );
        murajaaContainer.appendChild(taskItem);
    } else if (murajaaProgressIndex >= murajaaCap && murajaaCap > 0) {
        murajaaContainer.innerHTML += '<p class="message success">✅ تم إكمال الدورة الحالية للمراجعة بنجاح. سيتم إعادة الدورة من البداية بعد قبول المهمة القادمة.</p>';
    } else if (murajaaCap === 0) {
        murajaaContainer.innerHTML += '<p class="message info">لا يوجد منهج مراجعة مُعين لمستواك الحالي.</p>';
    }

    murajaaBonus.sort((a, b) => a - b).forEach(index => {
        if (index > murajaaProgressIndex && index < murajaaCap) {
            const bonusItem = studentMurajaaCurriculum[index];
            const taskItem = createTaskElement(
                { ...bonusItem, type: 'murajaa' },
                false,
                isMurajaaMainPending,
                index
            );
            murajaaContainer.appendChild(taskItem);
        }
    });

    if (murajaaProgressIndex < murajaaCap && murajaaBonus.length < 2) {
        let nextIndex = murajaaProgressIndex + 1;
        while (murajaaBonus.includes(nextIndex) && nextIndex < murajaaCap) {
            nextIndex++;
        }

        if (nextIndex < murajaaCap) {
            const showButtonDiv = document.createElement('div');
            showButtonDiv.className = 'toggle-button-wrapper';
            showButtonDiv.innerHTML = `<button id="show-murajaa-bonus-btn" data-index="${nextIndex}" data-type="murajaa" ${isMurajaaMainPending ? 'disabled' : ''}>إظهار مهمة مراجعة إضافية ➕</button>`;
            murajaaContainer.appendChild(showButtonDiv);
        }
    }

    // ----------------------------------------------------
    // 3. المهام العامة (General Tasks)
    // ----------------------------------------------------
    const generalTasksContainer = document.createElement('div');
    generalTasksContainer.id = 'general-tasks-list';
    generalTasksContainer.innerHTML = '<h3>مهام عامة مُعينة</h3>';
    tasksContainer.appendChild(generalTasksContainer);

    const generalTasks = student.tasks.filter(t => t.type === 'general' && t.status !== 'completed');

    if (generalTasks.length > 0) {
        generalTasks.forEach(task => {
            const statusText = task.status === 'pending' ? 'قيد المراجعة...' : 'بانتظار الإنجاز';
            const statusClass = task.status === 'pending' ? 'pending' : 'assigned';

            const buttonHTML = task.status === 'pending'
                ? `<button class="complete-btn" disabled>قيد المراجعة...</button>`
                : `<button class="complete-btn general-btn" data-task-id="${task.id}">أنجزت المهمة ✅</button>`;

            const taskItem = document.createElement('div');
            taskItem.className = `task-item general ${statusClass}`;
            taskItem.innerHTML = `
                <div class="task-description">${task.description}</div>
                <div class="task-points">النقاط: <strong>${task.points}</strong></div>
                <div class="task-status">الحالة: <strong>${statusText}</strong></div>
                <div class="task-actions">${buttonHTML}</div>
            `;
            generalTasksContainer.appendChild(taskItem);
        });
    } else {
        generalTasksContainer.innerHTML += '<p class="message info">لا توجد مهام عامة مُعينة حالياً.</p>';
    }

    // ----------------------------------------------------
    // 4. ربط مستمعي الأحداث
    // ----------------------------------------------------
    document.getElementById('show-hifz-bonus-btn')?.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        toggleBonusTask('hifz', index, 'add');
    });
    document.getElementById('show-murajaa-bonus-btn')?.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        toggleBonusTask('murajaa', index, 'add');
    });

    tasksContainer.querySelectorAll('.toggle-bonus-btn.hide-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            const type = e.target.dataset.type;
            toggleBonusTask(type, index, 'remove');
        });
    });

    tasksContainer.querySelectorAll('.complete-btn.curriculum-btn:not(:disabled)').forEach(button => {
        button.addEventListener('click', (e) => {
            const type = e.target.dataset.taskType;
            completeCurriculumTask(student.code, type);
        });
    });

    tasksContainer.querySelectorAll('.complete-btn.general-btn:not(:disabled)').forEach(button => {
        button.addEventListener('click', (e) => {
            const taskId = e.target.dataset.taskId;
            completeGeneralTask(student.code, taskId);
        });
    });
}


// Function to display student progress (Used in login and update)
// Function to display student progress (Used in login and update)
async function displayStudentDashboard(student) {
    welcomeStudent.textContent = `أهلاً بك يا ${student.name}`;

    // ⭐ ضمان أن للطالب مستوى مراجعة، وإلا نضبطه افتراضيًا
    if (!student.murajaa_level) {
        student.murajaa_level = 'BUILDING'; // تقدر تغيّرها للمستوى اللي يناسبك
        try {
            const studentDocRef = doc(db, 'students', student.code);
            await updateDoc(studentDocRef, {
                murajaa_level: student.murajaa_level
            });
        } catch (e) {
            console.warn('لم أستطع تحديث murajaa_level في Firestore، لكن ستعمل الواجهة على أي حال.', e);
        }
    }

    // ⭐ تهيئة قائمة المراجعة للطالب بناءً على مستواه
    setStudentMurajaaCurriculum(student.murajaa_level);

    // تهيئة حقول المهام الإضافية في حال كانت غير موجودة (لأول مرة)
    if (!student.displayed_hifz_bonus_tasks) student.displayed_hifz_bonus_tasks = [];
    if (!student.displayed_murajaa_bonus_tasks) student.displayed_murajaa_bonus_tasks = [];

    currentUser = student; // تحديث الكائن العام بآخر البيانات

    // Get the actual curriculum items based on saved indices
    const currentHifzItem = globalHifzCurriculum[student.hifz_progress];
    const currentMurajaaItem = studentMurajaaCurriculum[student.murajaa_progress_index];

    // 🔹 عرض تحفظ الحفظ
    studentHifzProgress.textContent = currentHifzItem
        ? (currentHifzItem.label || `${currentHifzItem.surah_name_ar} (${currentHifzItem.start_ayah}-${currentHifzItem.end_ayah})`)
        : 'المنهج غير مُعين';

    // 🔹 عرض مستوى المراجعة (القيمة الخام مثل BUILDING/DEVELOPMENT/ADVANCED)
    studentMurajaaLevelSpan.textContent = student.murajaa_level || 'غير محدد';

    // 🔹 عرض المقطع الحالي من المراجعة
    studentMurajaaProgressIndexSpan.textContent = currentMurajaaItem
        ? (currentMurajaaItem.label || currentMurajaaItem.name || 'مقطع مراجعة')
        : 'المنهج غير مُعين';

    // 🔹 عرض مجموع النقاط
    studentTotalPoints.textContent = student.total_points || 0;

    // Display tasks using the new curriculum-based function
    renderCurriculumTasks(student);

    hideAllScreens();
    studentScreen.classList.remove('hidden');
}

// =======================================================
// ⭐⭐ دوال لوحة المعلم (Teacher Panel Functions) ⭐⭐
// =======================================================

async function updateStudentPoints(studentCode, newPoints) {
    try {
        const studentDocRef = doc(db, 'students', studentCode);

        await updateDoc(studentDocRef, {
            total_points: newPoints,
        });

        document.getElementById(`points-display-${studentCode}`).textContent = newPoints;
        showMessage(authMessage, `تم تحديث نقاط الطالب ${studentCode} إلى ${newPoints} بنجاح!`, 'success');

    } catch (error) {
        console.error("Error updating student points:", error);
        showMessage(authMessage, `خطأ في تحديث النقاط للطالب ${studentCode}: ${error.message}`, 'error');
    }
}


// Function for loading students for the teacher panel
async function loadStudentsForTeacher() {
    studentList.innerHTML = '<li>جارٍ تحميل بيانات الطلاب...</li>';
    try {
        const studentsColRef = collection(db, 'students');
        const snapshot = await getDocs(studentsColRef);
        if (snapshot.empty) {
            studentList.innerHTML = '<li>لا يوجد طلاب مسجلين بعد.</li>';
            return;
        }

        studentList.innerHTML = '';
        snapshot.forEach(documentSnapshot => {
            const student = documentSnapshot.data();
            const hifzLabel = globalHifzCurriculum[student.hifz_progress]
                ? globalHifzCurriculum[student.hifz_progress].label
                : 'غير محدد';
            const murajaaLabel = student.murajaa_level || 'غير محدد';

            const listItem = document.createElement('li');

            listItem.innerHTML = `
                <div style="flex-grow: 1;">
                    <span class="student-name-code">
                        <strong>${student.name}</strong> (${student.code})
                    </span>
                    <div class="student-progress-summary">
                        الحفظ: ${hifzLabel} |
                        المراجعة: ${murajaaLabel} |
                        النقاط الحالية:
                        <strong id="points-display-${student.code}">${student.total_points}</strong>
                    </div>
                </div>
                <div class="student-actions">
                    <input type="number"
                        id="edit-points-${student.code}"
                        value="${student.total_points}"
                        min="0"
                        style="width: 80px; text-align: center; padding: 5px;"
                        placeholder="نقاط">
                    <button class="save-points-btn action-btn" data-code="${student.code}">حفظ النقاط</button>
                    <button class="delete-btn" data-code="${student.code}">حذف</button>
                </div>
            `;
            studentList.appendChild(listItem);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const code = e.target.dataset.code;
                if (confirm(`هل أنت متأكد من حذف الطالب ذي الرمز ${code}؟`)) {
                    try {
                        const studentDocRef = doc(db, 'students', code);
                        await deleteDoc(studentDocRef);
                        showMessage(authMessage, `تم حذف الطالب ${code} بنجاح.`, 'success');
                        loadStudentsForTeacher();
                    } catch (error) {
                        showMessage(authMessage, `خطأ في الحذف: ${error.message}`, 'error');
                        console.error("Error deleting student: ", error);
                    }
                }
            });
        });

        document.querySelectorAll('.save-points-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const code = e.target.dataset.code;
                const newPointsInput = document.getElementById(`edit-points-${code}`);
                const newPoints = parseInt(newPointsInput.value);

                if (isNaN(newPoints) || newPoints < 0) {
                    showMessage(authMessage, `الرجاء إدخال رقم صحيح للنقاط للطالب ${code}.`, 'error');
                    return;
                }

                await updateStudentPoints(code, newPoints);
            });
        });

    } catch (error) {
        studentList.innerHTML = '<li>حدث خطأ في تحميل بيانات الطلاب.</li>';
        console.error("Error loading students: ", error);
    }
}


// Function to display the curriculum in the teacher panel
function displayCurriculumsInTeacherPanel() {
    // Hifz
    hifzCurriculumDisplay.innerHTML = globalHifzCurriculum.map((item, index) =>
        `<div><span>(${index}) ${item.label}</span><span>${item.points} نقاط</span></div>`
    ).join('');

    // Murajaa
    murajaaCurriculumDisplay.innerHTML = Object.entries(globalReviewCurriculumLevels).map(([level, items]) => {
        const levelHeader = `<h4>${level} (${items.length} مهام)</h4>`;
        const itemList = items.map((item, index) =>
            `<div><span>(${index}) ${item.label}</span><span>${item.points} نقاط</span></div>`
        ).join('');
        return `<div>${levelHeader}${itemList}</div>`;
    }).join('<hr>');
}


// =======================================================
// ⭐⭐ دوال مراجعة المهام (المعلم) ⭐⭐
// =======================================================

async function reviewTask(studentCode, taskId, action) {
    try {
        const studentDocRef = doc(db, 'students', studentCode);
        const docSnapshot = await getDoc(studentDocRef);

        if (!docSnapshot.exists()) {
            throw new Error(`الطالب ذو الرمز ${studentCode} غير موجود.`);
        }

        const student = docSnapshot.data();
        const taskIndex = student.tasks.findIndex(t => t.id === taskId);

        if (taskIndex === -1 || student.tasks[taskIndex].status !== 'pending') {
            showMessage(authMessage, `المهمة لم تعد قيد المراجعة أو غير موجودة. (Task ID: ${taskId})`, 'error');
            loadPendingTasksForReview();
            return;
        }

        const task = student.tasks[taskIndex];
        let message = '';
        let successType = 'success';
        const updates = {};

        if (action === 'approve') {
            // 1) انهاء المهمة وإضافة النقاط
            task.status = 'completed';
            task.completed = true;
            student.total_points = (student.total_points || 0) + task.points;
            updates.total_points = student.total_points;
            updates.tasks = student.tasks;

            // 2) تحديث التقدم في المنهج إذا كانت المهمة رئيسية
            if (task.type === 'hifz' || task.type === 'murajaa') {
                const progressField = task.type === 'hifz' ? 'hifz_progress' : 'murajaa_progress_index';

                if (task.type === 'murajaa') {
                    setStudentMurajaaCurriculum(student.murajaa_level);
                }

                const curriculumArray = task.type === 'hifz'
                    ? globalHifzCurriculum
                    : studentMurajaaCurriculum;

                const currentIndex = student[progressField] || 0;
                const expectedProgressItem = curriculumArray[currentIndex];

                const isExpectedTask = expectedProgressItem && task.description.includes(expectedProgressItem.label);

                if (isExpectedTask) {
                    const nextIndex = currentIndex + 1;

                    if (task.type === 'hifz') {
                        // تقدم خطي في الحفظ
                        if (nextIndex < curriculumArray.length) {
                            updates.hifz_progress = nextIndex;
                            message += ' (تمت زيادة تقدم الحفظ).';
                        } else {
                            updates.hifz_progress = curriculumArray.length;
                            message += ' (تم إكمال منهج الحفظ).';
                        }

                        updates.displayed_hifz_bonus_tasks =
                            (student.displayed_hifz_bonus_tasks || []).filter(index => index >= (updates.hifz_progress || 0));

                    } else if (task.type === 'murajaa') {
                        // مراجعة: دورة مغلقة (Loop)
                        if (nextIndex < curriculumArray.length) {
                            updates.murajaa_progress_index = nextIndex;
                            message += ' (تمت زيادة تقدم المراجعة في الدورة).';
                        } else {
                            updates.murajaa_progress_index = 0;
                            message += ' (اكتملت دورة المراجعة وتم البدء من جديد).';
                        }

                        // تفريغ المهام الإضافية للمراجعة (للبداية النظيفة)
                        updates.displayed_murajaa_bonus_tasks = [];
                    }
                } else {
                    message += ' (تم قبول مهمة غير تسلسلية/عامة. لم يتم تحديث التقدم).';
                }
            }

            message = `تم قبول مهمة ${task.description} للطالب ${student.name}. أضيفت ${task.points} نقطة${message}`;

        } else if (action === 'reject') {
            task.status = 'assigned';
            updates.tasks = student.tasks;
            message = `تم رفض مهمة ${task.description} للطالب ${student.name}. وتم إعادتها إلى قائمة مهامه المعينة.`;
            successType = 'error';
        }

        await updateDoc(studentDocRef, updates);

        showMessage(authMessage, message, successType);
        loadPendingTasksForReview();

    } catch (error) {
        console.error(`Error reviewing task (${action}):`, error);
        showMessage(authMessage, `خطأ في مراجعة المهمة: ${error.message}`, 'error');
    }
}

async function loadPendingTasksForReview() {
    pendingTasksList.innerHTML = '<p class="message info">جارٍ البحث عن مهام بانتظار المراجعة...</p>';
    try {
        const studentsColRef = collection(db, 'students');
        const snapshot = await getDocs(studentsColRef);

        let pendingTasksExist = false;
        pendingTasksList.innerHTML = '';

        snapshot.forEach(documentSnapshot => {
            const student = documentSnapshot.data();
            const studentCode = student.code;

            const pendingTasks = student.tasks.filter(t => t.status === 'pending');

            if (pendingTasks.length > 0) {
                pendingTasksExist = true;

                const studentSection = document.createElement('div');
                studentSection.className = 'review-student-section';
                studentSection.innerHTML = `<h4>الطالب: ${student.name} (${studentCode}) - ${pendingTasks.length} مهمة معلّقة</h4>`;

                pendingTasks.forEach(task => {
                    const taskItem = document.createElement('div');
                    taskItem.className = 'task-review-item';

                    const taskDescription = `
                        <p><strong>النوع:</strong> ${task.type === 'hifz' ? 'حفظ' : task.type === 'murajaa' ? 'مراجعة' : 'عامة'}</p>
                        <p><strong>الوصف:</strong> ${task.description}</p>
                        <p><strong>النقاط:</strong> ${task.points}</p>
                    `;

                    const reviewActions = `
                        <div class="review-actions">
                            <button class="approve-btn" data-student-code="${studentCode}" data-task-id="${task.id}" data-action="approve">قبول ✅</button>
                            <button class="reject-btn" data-student-code="${studentCode}" data-task-id="${task.id}" data-action="reject">رفض ❌</button>
                        </div>
                    `;

                    taskItem.innerHTML = taskDescription + reviewActions;
                    studentSection.appendChild(taskItem);
                });

                pendingTasksList.appendChild(studentSection);
            }
        });

        if (!pendingTasksExist) {
            pendingTasksList.innerHTML = '<p class="message success">لا توجد مهام بانتظار المراجعة حالياً. أحسنت!</p>';
        }

        document.querySelectorAll('.approve-btn, .reject-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const { studentCode, taskId, action } = e.target.dataset;
                reviewTask(studentCode, taskId, action);
            });
        });

    } catch (error) {
        console.error("Error loading pending tasks:", error);
        pendingTasksList.innerHTML = `<p class="message error">حدث خطأ أثناء تحميل المهام: ${error.message}</p>`;
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
        setActiveTab('manage-students-tab');
    } else {
        try {
            // Student Login Logic
            const studentDocRef = doc(db, 'students', userCode);
            const docSnapshot = await getDoc(studentDocRef);
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();

                // ⭐ لو الطالب قديم وما عنده murajaa_level نضبطه افتراضي:
                if (!data.murajaa_level) {
                    data.murajaa_level = 'BUILDING';
                    try {
                        await updateDoc(studentDocRef, { murajaa_level: data.murajaa_level });
                    } catch (e) {
                        console.warn('لم أستطع تحديث murajaa_level للطالب القديم.', e);
                    }
                }

                currentUser = { code: userCode, role: 'student', ...data };
                displayStudentDashboard(currentUser);
            } else {
                showMessage(authMessage, 'رمز الطالب غير صحيح. حاول مجدداً.', 'error');
            }
        } catch (error) {
            console.error("Login error: ", error);
            showMessage(authMessage, 'حدث خطأ أثناء الاتصال بالخادم. تحقق من الاتصال وقواعد Firebase.', 'error');
        }
    }

});

// --- Teacher Panel Logic ---

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        setActiveTab(`${button.dataset.tab}-tab`);
        if (button.dataset.tab === 'manage-students') {
            loadStudentsForTeacher();
        } else if (button.dataset.tab === 'add-student') {
            populateCurriculumSelects();
        }
        if (button.dataset.tab === 'manage-curriculum') {
            displayCurriculumsInTeacherPanel();
        }
        if (button.dataset.tab === 'review-tasks') {
            loadPendingTasksForReview();
        }
    });
});

// Register Student Logic
registerStudentButton.addEventListener('click', async () => {
    const newStudentCode = newStudentCodeInput.value.trim();
    const newStudentName = newStudentNameInput.value.trim();
    const hifzStartIndex = parseInt(newStudentHifzStart.value);
    const murajaaLevel = newStudentMurajaaLevel.value;

    if (!newStudentCode || !newStudentName || !murajaaLevel) {
        showMessage(registerStudentMessage, 'الرجاء ملء جميع الحقول المطلوبة.', 'error');
        return;
    }

    if (hifzStartIndex < 0 || hifzStartIndex >= globalHifzCurriculum.length || isNaN(hifzStartIndex)) {
        showMessage(registerStudentMessage, 'نقطة بداية الحفظ غير صالحة. الرجاء اختيار من القائمة.', 'error');
        return;
    }

    setStudentMurajaaCurriculum(murajaaLevel);
    const initialMurajaaCurriculum = studentMurajaaCurriculum;

    if (initialMurajaaCurriculum.length === 0) {
        showMessage(registerStudentMessage, 'مستوى المراجعة المختار غير صالح أو فارغ. الرجاء اختيار مستوى آخر.', 'error');
        return;
    }

    try {
        const studentDocRef = doc(db, 'students', newStudentCode);
        const docSnapshot = await getDoc(studentDocRef);

        if (docSnapshot.exists()) {
            showMessage(registerStudentMessage, `الرمز ${newStudentCode} مُسجل لطالب آخر. اختر رمزًا فريدًا.`, 'error');
            return;
        }

        // نقطة بدء المراجعة: حالياً نبدأ من أول مهمة في المستوى
        const initialMurajaaIndex = 0;

        const initialTasks = [];

        if (globalHifzCurriculum[hifzStartIndex]) {
            initialTasks.push({
                id: generateUniqueId(),
                description: `حفظ: ${globalHifzCurriculum[hifzStartIndex].label}`,
                type: 'hifz',
                points: globalHifzCurriculum[hifzStartIndex].points,
                completed: false,
                status: 'assigned'
            });
        }

        if (initialMurajaaCurriculum[initialMurajaaIndex]) {
            initialTasks.push({
                id: generateUniqueId(),
                description: `مراجعة: ${initialMurajaaCurriculum[initialMurajaaIndex].label}`,
                type: 'murajaa',
                points: initialMurajaaCurriculum[initialMurajaaIndex].points,
                completed: false,
                status: 'assigned'
            });
        }

        await setDoc(studentDocRef, {
            code: newStudentCode,
            name: newStudentName,
            role: 'student',
            hifz_progress: hifzStartIndex,
            murajaa_level: murajaaLevel,
            murajaa_progress_index: initialMurajaaIndex,
            hifz_level_multiplier: 1,
            total_points: 0,
            tasks: initialTasks,
            displayed_hifz_bonus_tasks: [],
            displayed_murajaa_bonus_tasks: [],
        });

        showMessage(registerStudentMessage, `تم تسجيل الطالب ${newStudentName} بنجاح!`, 'success');

        newStudentCodeInput.value = '';
        newStudentNameInput.value = '';

    } catch (error) {
        console.error("Registration error: ", error);
        showMessage(registerStudentMessage, `خطأ في تسجيل الطالب: ${error.message}`, 'error');
    }
});


// Assign Task Logic (Individual/Group)
assignIndividualTaskButton.addEventListener('click', async () => {
    const code = assignTaskStudentCode.value.trim();
    const type = assignTaskType.value;
    const description = assignTaskDescription.value.trim();
    const points = parseInt(assignTaskPoints.value);

    if (!code || !description || isNaN(points) || points <= 0) {
        showMessage(assignTaskMessage, 'الرجاء ملء رمز الطالب والوصف والنقاط بشكل صحيح.', 'error');
        return;
    }

    const task = {
        id: generateUniqueId(),
        description,
        type,
        points,
        completed: false,
        status: 'assigned'
    };
    try {
        const studentDocRef = doc(db, 'students', code);
        await updateDoc(studentDocRef, {
            tasks: arrayUnion(task)
        });
        showMessage(assignTaskMessage, `تم تعيين مهمة فردية للطالب ${code} بنجاح.`, 'success');
    } catch (error) {
        showMessage(assignTaskMessage, `خطأ: الطالب ${code} غير موجود أو خطأ في الاتصال. ${error.message}`, 'error');
        console.error("Error assigning individual task: ", error);
    }
});

assignGroupTaskButton.addEventListener('click', async () => {
    const type = assignTaskType.value;
    const description = assignTaskDescription.value.trim();
    const points = parseInt(assignTaskPoints.value);

    if (!description || isNaN(points) || points <= 0) {
        showMessage(assignTaskMessage, 'الرجاء ملء الوصف والنقاط بشكل صحيح.', 'error');
        return;
    }

    const task = {
        id: generateUniqueId(),
        description,
        type,
        points,
        completed: false,
        status: 'assigned'
    };
    try {
        const studentsColRef = collection(db, 'students');
        const studentsSnapshot = await getDocs(studentsColRef);
        const batch = writeBatch(db);
        studentsSnapshot.forEach(documentSnapshot => {
            const studentDocRef = doc(db, 'students', documentSnapshot.id);
            batch.update(studentDocRef, {
                tasks: arrayUnion(task)
            });
        });
        await batch.commit();
        showMessage(assignTaskMessage, 'تم تعيين مهمة جماعية لجميع الطلاب بنجاح.', 'success');
    } catch (error) {
        showMessage(assignTaskMessage, `خطأ في تعيين المهمة الجماعية: ${error.message}`, 'error');
        console.error("Error assigning group task: ", error);
    }
});

// --- Logout ---
function logout() {
    currentUser = null;
    hideAllScreens();
    authScreen.classList.remove('hidden');
    userCodeInput.value = '';
    showMessage(authMessage, 'تم تسجيل الخروج بنجاح.', 'success');
}

if (logoutButtonStudent) {
    logoutButtonStudent.addEventListener('click', logout);
}
if (logoutButtonTeacher) {
    logoutButtonTeacher.addEventListener('click', logout);
}

// --- Initialization on load ---
console.log("App ready. Curriculum loaded from external file.");


