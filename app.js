// ///////////////////////////////////////////////////////////////////////////////
// هذا الملف يستخدم Firebase Modular SDK (الإصدار 9) مع عبارات import/export.
// ///////////////////////////////////////////////////////////////////////////////

// 💥 الحل النهائي: استيراد مباشر لروابط CDN الكاملة
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


// هذا الجزء هو نفسه الذي زودتني به سابقاً:
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
const db = getFirestore(app); // تهيئة Firestore بالطريقة الجديدة
const auth = getAuth(app);    // تهيئة Auth بالطريقة الجديدة

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
const reviewTasksTab = document.getElementById('review-tasks-tab'); // ⭐⭐ NEW ⭐⭐
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

const pendingTasksList = document.getElementById('pending-tasks-list'); // ⭐⭐ NEW ⭐⭐


let currentUser = null; // Stores current logged-in user data


// --- NEW CURRICULUM STATE ---
let globalHifzCurriculum = []; // سيتم تخزين منهج الحفظ هنا من Firestore
let globalMurajaaCurriculum = []; // سيتم تخزين منهج المراجعة هنا من Firestore

// ====== دالة ترحيل المنهج إلى Firestore (تشغيل مرة واحدة فقط) ======
// **ملاحظة: لقد تم حذف دالة migrateCurriculumToFirestore() هنا لأنها لم تعد لازمة**
// =================================================================


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

// --- Core App Functions (Firebase Operations) ---

/**
 * تجلب منهج الحفظ والمراجعة من Firestore وتخزنهما محليًا.
 */
async function loadCurriculumFromFirestore() {
    console.log("Loading curriculum from Firestore...");
    try {
        const curriculumColRef = collection(db, 'curriculumItems');
        // جلب جميع الوثائق وترتيبها حسب حقل 'order'
        // ملاحظة: يتطلب إضافة فهرس (Index) في Firebase Console لهذا الاستعلام
        const snapshot = await getDocs(curriculumColRef);

        const allItems = [];
        snapshot.forEach(doc => {
            allItems.push(doc.data());
        });

        // فرز البيانات محليًا للتأكد من الترتيب (يفضل الترتيب عبر Firestore باستخدام Index)
        allItems.sort((a, b) => a.order - b.order);

        // تقسيم البيانات إلى حفظ ومراجعة بناءً على حقل 'type'
        globalHifzCurriculum = allItems.filter(item => item.type === 'hifz');
        globalMurajaaCurriculum = allItems.filter(item => item.type === 'murajaa');

        console.log(`Curriculum loaded. Hifz items: ${globalHifzCurriculum.length}, Murajaa items: ${globalMurajaaCurriculum.length}`);
    } catch (error) {
        console.error("Error loading curriculum from Firestore:", error);
    }
}


// --- NEW FUNCTION: Populate Curriculum Selects ---
function populateCurriculumSelects() {
    // Populate Hifz Select (using index as value)
    const hifzOptions = globalHifzCurriculum.map((item, index) =>
        `<option value="${index}">${item.label} (الدليل: ${index})</option>`
    ).join('');
    newStudentHifzStart.innerHTML = hifzOptions;

    // Populate Murajaa Select (using index as value)
    const murajaaOptions = globalMurajaaCurriculum.map((item, index) =>
        `<option value="${index}">${item.label} (الدليل: ${index})</option>`
    ).join('');
    newStudentMurajaaStart.innerHTML = murajaaOptions;
}

/**
 * دالة لعرض المهام الموكلة إلى الطالب الحالي.
 * المُنطق المُعدل: يتم عرض المهام بحالتي "assigned" و "pending" فقط.
 * يتم إخفاء المهام التي حالتها "completed" (تم قبولها وتصديقها من المعلم).
 */
function renderStudentTasks(student) {
    const tasksContainer = document.getElementById('student-tasks');
    tasksContainer.innerHTML = ''; 
    
    // 💥💥 التعديل الرئيسي: تصفية المهام المكتملة 
    // عرض المهام التي ليست 'completed' (أي: 'assigned' أو 'pending')
    const activeTasks = student.tasks.filter(task => task.status !== 'completed');

    if (!student || student.tasks.length === 0) {
        tasksContainer.innerHTML = '<p class="message info">لا توجد مهام موكلة إليك حاليًا. وفقك الله.</p>';
        return;
    }
    
    if (activeTasks.length === 0) {
        tasksContainer.innerHTML = '<p class="message success">جميع مهامك الحالية مُنجزة أو قيد المراجعة. أحسنت!</p>';
        return;
    }

    activeTasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.type} ${task.status}`;

        let statusText = '';
        let buttonHTML = '';

        if (task.status === 'assigned') {
            // المهمة مُعينة وبانتظار الإنجاز
            statusText = 'بانتظار الإنجاز';
            buttonHTML = `<button class="complete-btn" data-task-id="${task.id}">أنجزت المهمة ✅</button>`;
        } else if (task.status === 'pending') {
            // المهمة قيد المراجعة بعد إنجازها من قبل الطالب
            statusText = 'قيد المراجعة (بانتظار تصديق المعلم)';
            buttonHTML = `<button class="complete-btn" disabled>قيد المراجعة...</button>`;
        } 
        
        // المهام ذات حالة 'completed' لا تصل إلى هنا بسبب التصفية أعلاه

        taskItem.innerHTML = `
            <div class="task-description">${task.description}</div>
            <div class="task-type">${task.type === 'hifz' ? 'حفظ' : task.type === 'murajaa' ? 'مراجعة' : 'عامة'}</div>
            <div class="task-points">النقاط: <strong>${task.points}</strong></div>
            <div class="task-status">الحالة: <strong>${statusText}</strong></div>
            <div class="task-actions">${buttonHTML}</div>
        `;

        tasksContainer.appendChild(taskItem);
    });

    // إضافة مستمعي الأحداث لزر الإنجاز
    tasksContainer.querySelectorAll('.complete-btn:not(:disabled)').forEach(button => {
        button.addEventListener('click', (e) => {
            const taskId = e.target.getAttribute('data-task-id');
            // نستخدم completeTask التي تحول المهمة إلى pending
            completeTask(student.code, taskId); 
        });
    });
}


// Function to display student progress (Used in login and update)
async function displayStudentDashboard(student) {
    welcomeStudent.textContent = `أهلاً بك يا ${student.name}`;

    // Get the actual curriculum items based on saved indices
    const currentHifzItem = globalHifzCurriculum[student.hifz_progress]; 
    const currentMurajaaItem = globalMurajaaCurriculum[student.murajaa_progress];

    studentHifzProgress.textContent = currentHifzItem ? currentHifzItem.label : 'المنهج غير مُعين';
    studentMurajaaProgress.textContent = currentMurajaaItem ? currentMurajaaItem.label : 'المنهج غير مُعين';
    studentTotalPoints.textContent = student.total_points;

    // Display tasks using the new filtered function
    renderStudentTasks(student); // 💥💥 تم استخدام الدالة المعدلة

    hideAllScreens();
    studentScreen.classList.remove('hidden');
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
            const hifzLabel = globalHifzCurriculum[student.hifz_progress] ? globalHifzCurriculum[student.hifz_progress].label : 'غير محدد'; // <--- تم التعديل
            
            // إنشاء عنصر القائمة
            const listItem = document.createElement('li');
            
            listItem.innerHTML = `
                <span><strong>${student.name}</strong> (${student.code}) - الحفظ: ${hifzLabel} | النقاط: ${student.total_points}</span>
                <div class="student-actions">
                    <button class="delete-btn" data-code="${student.code}">حذف</button>
                </div>
            `;
            studentList.appendChild(listItem);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const code = e.target.dataset.code;
                if (confirm(`هل أنت متأكد من حذف الطالب ذي الرمز ${code}؟`)) {
                    try {
                        const studentDocRef = doc(db, 'students', code);
                        await deleteDoc(studentDocRef);
                        showMessage(authMessage, `تم حذف الطالب ${code} بنجاح.`, 'success');
                        loadStudentsForTeacher(); // Reload list
                    } catch (error) {
                        showMessage(authMessage, `خطأ في الحذف: ${error.message}`, 'error');
                        console.error("Error deleting student: ", error);
                    }
                }
            });
        });

    } catch (error) {
        studentList.innerHTML = '<li>حدث خطأ في تحميل بيانات الطلاب.</li>';
        console.error("Error loading students: ", error);
    }
}

// Function to display the curriculum in the teacher panel
function displayCurriculumsInTeacherPanel() {
    // Display Hifz Curriculum
    hifzCurriculumDisplay.innerHTML = globalHifzCurriculum.map((item, index) => 
        `<div>(${index}) ${item.label} (${item.points} نقاط)</div>`
    ).join('');

    // Display Murajaa Curriculum
    murajaaCurriculumDisplay.innerHTML = globalMurajaaCurriculum.map((item, index) => 
        `<div>(${index}) ${item.label} (${item.points} نقاط)</div>`
    ).join('');
}


// Function for task completion (Student marks task as PENDING)
async function completeTask(studentCode, taskId) { // تمت إزالة (points) لأنه لم يعد ضرورياً
    try {
        const studentDocRef = doc(db, 'students', studentCode);
        const docSnapshot = await getDoc(studentDocRef);
        if (!docSnapshot.exists()) return;

        const student = docSnapshot.data();
        const taskIndex = student.tasks.findIndex(t => t.id === taskId);

        // الشرط: يجب أن تكون المهمة موجودة وحالتها 'assigned'
        if (taskIndex !== -1 && student.tasks[taskIndex].status === 'assigned') {
            
            // سنغير الحالة فقط إلى 'pending'
            student.tasks[taskIndex].status = 'pending';

            // Update Firestore
            await updateDoc(studentDocRef, {
                tasks: student.tasks,
                // لا نغير total_points أو hifz_progress أو murajaa_progress
            });

            // Re-render dashboard
            currentUser = student;
            displayStudentDashboard(currentUser); // 💥💥 تحديث لوحة الطالب

            // تغيير رسالة النجاح
            showMessage(authMessage, `تم إرسال المهمة للمراجعة. عند قبول المعلم، ستُضاف النقاط.`, 'success');
        
        } else if (taskIndex !== -1 && student.tasks[taskIndex].status === 'pending') {
             // رسالة تنبيه إذا كانت المهمة قيد المراجعة بالفعل
             showMessage(authMessage, `هذه المهمة قيد مراجعة المعلم بالفعل. ننتظر القبول.`, 'info');
        } else if (taskIndex !== -1 && student.tasks[taskIndex].status === 'completed') {
             // رسالة تنبيه إذا كانت المهمة مكتملة بالفعل
             showMessage(authMessage, `هذه المهمة مُنجزة ومقبولة بالفعل.`, 'info');
        }


    } catch (error) {
        console.error("Error setting task to pending: ", error);
        showMessage(authMessage, `حدث خطأ أثناء إرسال المهمة: ${error.message}`, 'error');
    }
}


// =======================================================
// ⭐⭐ دوال مراجعة المهام (المعلم) - لم يتم تعديلها لأنها صحيحة ⭐⭐
// =======================================================

/**
 * دالة لجلب وعرض جميع المهام التي حالتها 'pending' لجميع الطلاب.
 */
async function loadPendingTasksForReview() {
    pendingTasksList.innerHTML = '<p class="message info">جارٍ البحث عن مهام بانتظار المراجعة...</p>';
    try {
        const studentsColRef = collection(db, 'students');
        const snapshot = await getDocs(studentsColRef);
        
        let pendingTasksExist = false;
        pendingTasksList.innerHTML = ''; // تفريغ القائمة قبل البناء

        snapshot.forEach(documentSnapshot => {
            const student = documentSnapshot.data();
            const studentCode = student.code;
            
            // تصفية مهام الطالب: نريد فقط المهام التي حالتها 'pending'
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
        
        // ربط مستمعي الأحداث بأزرار القبول والرفض
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

/**
 * دالة لمعالجة قبول أو رفض المهمة من قبل المعلم.
 * @param {string} studentCode رمز الطالب.
 * @param {string} taskId معرف المهمة الفريد.
 * @param {('approve'|'reject')} action الإجراء المطلوب (قبول أو رفض).
 */
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
            loadPendingTasksForReview(); // تحديث القائمة
            return;
        }

        const task = student.tasks[taskIndex];
        let message = '';
        let successType = 'success';
        
        if (action === 'approve') {
            // 1. تغيير حالة المهمة إلى 'completed' ومنح النقاط
            task.status = 'completed'; // 💥 يتم إخفاؤها الآن من شاشة الطالب
            task.completed = true; 
            student.total_points += task.points;
            
            // 2. تحديث تقدم المنهج إذا كانت المهمة حفظ أو مراجعة
            if (task.type === 'hifz') {
                const nextIndex = student.hifz_progress + 1;
                // التأكد من أن التقدم الجديد ضمن حدود المنهج
                if (nextIndex < globalHifzCurriculum.length) {
                    student.hifz_progress = nextIndex;
                    // تعيين مهمة الحفظ التالية تلقائياً
                    const nextHifzItem = globalHifzCurriculum[nextIndex];
                    student.tasks.push({
                        id: generateUniqueId(),
                        description: `حفظ جديد: ${nextHifzItem.label}`,
                        type: 'hifz',
                        points: nextHifzItem.points,
                        completed: false,
                        status: 'assigned'
                    });
                } else {
                    message += ' (تم إكمال منهج الحفظ).';
                }
            } else if (task.type === 'murajaa') {
                const nextIndex = student.murajaa_progress + 1;
                if (nextIndex < globalMurajaaCurriculum.length) {
                    student.murajaa_progress = nextIndex;
                    // تعيين مهمة المراجعة التالية تلقائياً
                    const nextMurajaaItem = globalMurajaaCurriculum[nextIndex];
                    student.tasks.push({
                        id: generateUniqueId(),
                        description: `مراجعة جديدة: ${nextMurajaaItem.label}`,
                        type: 'murajaa',
                        points: nextMurajaaItem.points,
                        completed: false,
                        status: 'assigned'
                    });
                } else {
                    message += ' (تم إكمال منهج المراجعة).';
                }
            }
            
            message = `تم قبول مهمة ${task.description} للطالب ${student.name}. أضيفت ${task.points} نقطة${message}`;
            
        } else if (action === 'reject') {
            // تغيير الحالة إلى 'assigned' لإعطاء الطالب فرصة لإعادة الإرسال
            task.status = 'assigned';
            message = `تم رفض مهمة ${task.description} للطالب ${student.name}. وتم إعادتها إلى قائمة مهامه المعينة.`;
            successType = 'error'; // استخدام كلاس الخطأ لتغيير لون الرسالة لـ "الرفض"
        }

        // 3. حفظ التغييرات في Firestore (tasks, total_points, progress)
        await updateDoc(studentDocRef, {
            tasks: student.tasks,
            total_points: student.total_points,
            hifz_progress: student.hifz_progress,
            murajaa_progress: student.murajaa_progress,
        });

        showMessage(authMessage, message, successType);
        loadPendingTasksForReview(); // إعادة تحميل القائمة بعد التحديث
        
    } catch (error) {
        console.error(`Error reviewing task (${action}):`, error);
        showMessage(authMessage, `خطأ في مراجعة المهمة: ${error.message}`, 'error');
    }
}


// =======================================================
// ⭐⭐ نهاية دوال مراجعة المهام (المعلم) ⭐⭐
// =======================================================


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
        displayCurriculumsInTeacherPanel(); // <--- NEW: Display curriculums when teacher logs in
        setActiveTab('manage-students-tab'); // Default tab for teacher
    } else {
        try {
            // Student Login Logic
            const studentDocRef = doc(db, 'students', userCode);
            const docSnapshot = await getDoc(studentDocRef);
            if (docSnapshot.exists()) {
                currentUser = docSnapshot.data();
                displayStudentDashboard(currentUser); // 💥💥 يتم تحديثها الآن بشكل صحيح
            } else {
                showMessage(authMessage, 'رمز الطالب غير صحيح. حاول مجدداً.', 'error');
                // لا نحتاج لرسالة خطأ ثانية هنا
            }
        } catch (error) {
            console.error("Login error: ", error);
            showMessage(authMessage, 'حدث خطأ أثناء الاتصال بالخادم. تحقق من الاتصال وقواعد Firebase.', 'error');
        }
    }
});

// --- Teacher Panel Logic ---

// Tab switching
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        setActiveTab(`${button.dataset.tab}-tab`);
        if (button.dataset.tab === 'manage-students') {
            loadStudentsForTeacher();
        } else if (button.dataset.tab === 'add-student') { // <--- Populate selects when "Add Student" tab is opened
            populateCurriculumSelects();
        }
        // If curriculum tab, make sure it's displayed
        if (button.dataset.tab === 'manage-curriculum') {
            displayCurriculumsInTeacherPanel();
        }
        // ⭐⭐ NEW: Load pending tasks when "Review Tasks" tab is opened
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
    const murajaaStartIndex = parseInt(newStudentMurajaaStart.value);

    if (!newStudentCode || !newStudentName) {
        showMessage(registerStudentMessage, 'الرجاء ملء جميع الحقول المطلوبة.', 'error');
        return;
    }

    // <--- تم التعديل: التحقق من globalHifzCurriculum
    if (hifzStartIndex < 0 || hifzStartIndex >= globalHifzCurriculum.length || isNaN(hifzStartIndex)) {
        showMessage(registerStudentMessage, 'نقطة بداية الحفظ غير صالحة. الرجاء اختيار من القائمة.', 'error');
        return;
    }

    // <--- تم التعديل: التحقق من globalMurajaaCurriculum
    if (murajaaStartIndex < 0 || murajaaStartIndex >= globalMurajaaCurriculum.length || isNaN(murajaaStartIndex)) {
        showMessage(registerStudentMessage, 'نقطة بداية المراجعة غير صالحة. الرجاء اختيار من القائمة.', 'error');
        return;
    }

    try {
        const studentDocRef = doc(db, 'students', newStudentCode);
        const docSnapshot = await getDoc(studentDocRef);

        if (docSnapshot.exists()) {
            showMessage(registerStudentMessage, `الرمز ${newStudentCode} مُسجل لطالب آخر. اختر رمزًا فريدًا.`, 'error');
            return;
        }

        // Assign first tasks automatically
        const initialTasks = [];
        // <--- التعديل: إضافة status: 'assigned'
        if (globalHifzCurriculum[hifzStartIndex]) {
            initialTasks.push({ 
                id: generateUniqueId(), 
                description: `حفظ جديد: ${globalHifzCurriculum[hifzStartIndex].label}`, 
                type: 'hifz', 
                points: globalHifzCurriculum[hifzStartIndex].points, 
                completed: false, 
                status: 'assigned' // ⭐⭐ تم الإضافة
            });
        }
        // <--- التعديل: إضافة status: 'assigned'
        if (globalMurajaaCurriculum[murajaaStartIndex]) {
            initialTasks.push({ 
                id: generateUniqueId(), 
                description: `مراجعة جديدة: ${globalMurajaaCurriculum[murajaaStartIndex].label}`, 
                type: 'murajaa', 
                points: globalMurajaaCurriculum[murajaaStartIndex].points, 
                completed: false,
                status: 'assigned' // ⭐⭐ تم الإضافة
            });
        }


        // Add new student
        await setDoc(studentDocRef, {
            code: newStudentCode,
            name: newStudentName,
            role: 'student',
            hifz_progress: hifzStartIndex,
            murajaa_progress: murajaaStartIndex,
            total_points: 0,
            tasks: initialTasks, // Using the new initialTasks array
        });

        showMessage(registerStudentMessage, `تم تسجيل الطالب ${newStudentName} بنجاح!`, 'success');

        // Clear inputs after successful registration
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

    // Logic to assign task to a single student (using Firestore Update)
    // التعديل: إضافة status: 'assigned'
    const task = { 
        id: generateUniqueId(), 
        description, 
        type, 
        points, 
        completed: false,
        status: 'assigned' // ⭐⭐ تم الإضافة
    }; 
    try {
        const studentDocRef = doc(db, 'students', code);
        await updateDoc(studentDocRef, {
            tasks: arrayUnion(task) // استخدام arrayUnion لإضافة عنصر إلى مصفوفة
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

    // Logic to assign task to all students (Batch Write recommended for real app)
    // التعديل: إضافة status: 'assigned'
    const task = { 
        id: generateUniqueId(), 
        description, 
        type, 
        points, 
        completed: false,
        status: 'assigned' // ⭐⭐ تم الإضافة
    }; 
    try {
        const studentsColRef = collection(db, 'students');
        const studentsSnapshot = await getDocs(studentsColRef);
        const batch = writeBatch(db); // استخدام writeBatch
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

logoutButtonStudent.addEventListener('click', logout);
logoutButtonTeacher.addEventListener('click', logout);


// --- Initialization on load ---
// 💥 التشغيل الأولي: جلب المنهج قبل أي عملية أخرى
loadCurriculumFromFirestore().then(() => {
    // بعد تحميل المنهج، يمكن للمستخدمين البدء في التفاعل
    console.log("App ready. Curriculum loaded.");
});

// =======================================================
// ⭐⭐ اجعل دالة الترحيل متاحة في الـ Console ⭐⭐
// ========
