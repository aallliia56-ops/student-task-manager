
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

// =======================================================
// ⭐⭐ دوال لوحة قيادة الطالب (Student Dashboard Functions) - مُعدّل ⭐⭐
// =======================================================

/**
 * دالة لمعالجة إظهار أو إخفاء المهام الإضافية وتحديث Firestore.
 * @param {string} type نوع المنهج ('hifz' أو 'murajaa').
 * @param {number} index دليل المقطع في المنهج.
 * @param {('add'|'remove')} action الإجراء المطلوب.
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

        // تحديث Firestore و currentUser
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
 * @param {string} studentCode رمز الطالب.
 * @param {string} type نوع المهمة (يجب أن يكون 'hifz' أو 'murajaa').
 */
async function completeCurriculumTask(studentCode, type) {
    try {
        const studentDocRef = doc(db, 'students', studentCode);
        const docSnapshot = await getDoc(studentDocRef);
        if (!docSnapshot.exists()) return;

        const student = docSnapshot.data();
        let progressIndex, curriculumArray;
        
        if (type === 'hifz') {
            progressIndex = student.hifz_progress;
            curriculumArray = globalHifzCurriculum;
        } else if (type === 'murajaa') {
            progressIndex = student.murajaa_progress;
            curriculumArray = globalMurajaaCurriculum;
        } else {
             showMessage(authMessage, 'نوع مهمة غير مدعوم في هذا الإجراء.', 'error');
             return;
        }

        const taskItem = curriculumArray[progressIndex];
        
        // 1. التحقق من عدم وجود مهمة رئيسية أخرى (Hifz/Murajaa) في حالة 'pending'
        const isMainTaskPending = student.tasks.some(t => 
            t.type === type && 
            t.description.includes(taskItem.label) && 
            t.status === 'pending'
        );

        if (isMainTaskPending) {
            showMessage(authMessage, `المهمة الرئيسية (${taskItem.label}) قيد مراجعة المعلم بالفعل.`, 'info');
            return;
        }
        
        // 2. إيجاد المهمة في مصفوفة tasks أو إضافتها لـ tasks لتكون قابلة للمراجعة
        let taskIndex = student.tasks.findIndex(t => 
            t.type === type && 
            t.description.includes(taskItem.label) && 
            (t.status === 'assigned' || t.status === 'rejected') // إذا كانت مُعينة أو مرفوضة مسبقاً
        );

        const taskDescription = `${type === 'hifz' ? 'حفظ' : 'مراجعة'}: ${taskItem.label}`;

        if (taskIndex === -1) {
             // المهمة غير موجودة، يتم إضافتها الآن (يحدث هذا إذا كانت المهمة الأصلية قد نُظفت)
             const newTask = {
                 id: generateUniqueId(),
                 description: taskDescription,
                 type: type,
                 points: taskItem.points,
                 completed: false, 
                 status: 'pending' // مباشرة إلى Pending
             };
             student.tasks.push(newTask);
        } else {
             // المهمة موجودة، نغير حالتها إلى Pending
             student.tasks[taskIndex].status = 'pending';
        }

        // Update Firestore
        await updateDoc(studentDocRef, {
             tasks: student.tasks
        });

        // Re-render dashboard
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
 * هي بديل لدالة completeTask القديمة، لكنها الآن تُستخدم فقط للمهام العامة
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

            // Re-render dashboard
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
 * تعرض المهمة الرئيسية (progress) ومهام إضافية (displayed_bonus_tasks).
 */
function renderCurriculumTasks(student) {
    const tasksContainer = document.getElementById('student-tasks');
    tasksContainer.innerHTML = '<h2>مهامك الحالية</h2>'; 

    // دالة مساعدة لإنشاء عنصر المهمة
    const createTaskElement = (task, isMain, isPending, index) => {
        const statusText = isPending ? 'قيد المراجعة...' : 'بانتظار الإنجاز';
        const statusClass = isPending ? 'pending' : 'assigned';
        
        let buttonHTML = '';
        if (isPending) {
            // إذا كانت الرئيسية قيد المراجعة، يتم تعطيل جميع الأزرار
            buttonHTML = `<button class="complete-btn" disabled>قيد المراجعة</button>`;
        } else if (isMain) {
            // زر الإنجاز متاح للمهمة الرئيسية فقط
            buttonHTML = `<button class="complete-btn curriculum-btn" data-task-type="${task.type}">أنجزت المهمة ✅</button>`;
        } else {
            // المهام الإضافية معطلة حتى يتم إنجاز الرئيسية
            buttonHTML = `<button class="complete-btn" disabled>مغلقة (أنجز المهمة الرئيسية)</button>`;
        }

        // زر إخفاء المهمة الإضافية
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
                 <div class="task-actions">
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
    // 1. معالجة مهام الحفظ (HIFZ)
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
    
    // أ. المهمة الرئيسية (الحالية)
    if (hifzProgress < hifzCap && mainHifzItem) {
        const taskItem = createTaskElement(
            mainHifzItem, 
            true, 
            isHifzMainPending, 
            hifzProgress 
        );
        hifzContainer.appendChild(taskItem);
    } else if (hifzProgress >= hifzCap) {
        hifzContainer.innerHTML += '<p class="message success">✅ تم إكمال منهج الحفظ. تهانينا!</p>';
    }

    // ب. المهام الإضافية المعروضة
    hifzBonus.sort((a, b) => a - b).forEach(index => {
        if (index > hifzProgress && index < hifzCap) {
            const bonusItem = globalHifzCurriculum[index];
            const taskItem = createTaskElement(
                bonusItem, 
                false, 
                isHifzMainPending, // تعطيل الإضافية إذا كانت الرئيسية قيد المراجعة
                index 
            );
            hifzContainer.appendChild(taskItem);
        }
    });

    // ج. زر "إظهار مهمة إضافية"
    if (hifzProgress < hifzCap && hifzBonus.length < 2) {
        // تحديد أول مهمة تالية غير موجودة حالياً
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
    // 2. معالجة مهام المراجعة (MURAJAA)
    // ----------------------------------------------------
    const murajaaContainer = document.createElement('div');
    murajaaContainer.id = 'murajaa-tasks-list';
    murajaaContainer.innerHTML = '<h3>مهام المراجعة</h3>';
    tasksContainer.appendChild(murajaaContainer);

    const murajaaProgress = student.murajaa_progress || 0;
    const murajaaBonus = student.displayed_murajaa_bonus_tasks || [];
    const murajaaCap = globalMurajaaCurriculum.length;

    const mainMurajaaItem = globalMurajaaCurriculum[murajaaProgress];
    const isMurajaaMainPending = student.tasks.some(t => 
        t.type === 'murajaa' && 
        t.description.includes(mainMurajaaItem?.label || '') &&
        t.status === 'pending'
    );
    
    // أ. المهمة الرئيسية (الحالية)
    if (murajaaProgress < murajaaCap && mainMurajaaItem) {
        const taskItem = createTaskElement(
            mainMurajaaItem, 
            true, 
            isMurajaaMainPending, 
            murajaaProgress 
        );
        murajaaContainer.appendChild(taskItem);
    } else if (murajaaProgress >= murajaaCap) {
        murajaaContainer.innerHTML += '<p class="message success">✅ تم إكمال منهج المراجعة. تهانينا!</p>';
    }

    // ب. المهام الإضافية المعروضة
     murajaaBonus.sort((a, b) => a - b).forEach(index => {
        if (index > murajaaProgress && index < murajaaCap) {
            const bonusItem = globalMurajaaCurriculum[index];
            const taskItem = createTaskElement(
                bonusItem, 
                false, 
                isMurajaaMainPending, 
                index 
            );
            murajaaContainer.appendChild(taskItem);
        }
    });

    // ج. زر "إظهار مهمة إضافية"
    if (murajaaProgress < murajaaCap && murajaaBonus.length < 2) {
         let nextIndex = murajaaProgress + 1;
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
    // 3. معالجة المهام العامة (General Tasks)
    // ----------------------------------------------------
    const generalTasksContainer = document.createElement('div');
    generalTasksContainer.id = 'general-tasks-list';
    generalTasksContainer.innerHTML = '<h3>مهام عامة مُعينة</h3>';
    tasksContainer.appendChild(generalTasksContainer);

    const generalTasks = student.tasks.filter(t => t.type === 'general' && t.status !== 'completed');

    if (generalTasks.length > 0) {
        generalTasks.forEach(task => {
            // نعرض المهام العامة باستخدام منطق قديم مشابه لـ renderStudentTasks
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
    
    // ربط أزرار الإظهار
    document.getElementById('show-hifz-bonus-btn')?.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        toggleBonusTask('hifz', index, 'add');
    });
     document.getElementById('show-murajaa-bonus-btn')?.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        toggleBonusTask('murajaa', index, 'add');
    });
    
    // ربط أزرار الإخفاء
    tasksContainer.querySelectorAll('.toggle-bonus-btn.hide-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            const type = e.target.dataset.type;
            toggleBonusTask(type, index, 'remove');
        });
    });

    // ربط زر الإنجاز للمهام التسلسلية (المتاحة فقط للمهمة الرئيسية)
    tasksContainer.querySelectorAll('.complete-btn.curriculum-btn:not(:disabled)').forEach(button => {
        button.addEventListener('click', (e) => {
            const type = e.target.dataset.taskType;
            completeCurriculumTask(student.code, type); 
        });
    });
    
    // ربط زر الإنجاز للمهام العامة
     tasksContainer.querySelectorAll('.complete-btn.general-btn:not(:disabled)').forEach(button => {
        button.addEventListener('click', (e) => {
            const taskId = e.target.dataset.taskId;
            completeGeneralTask(student.code, taskId); 
        });
    });
}


// Function to display student progress (Used in login and update)
async function displayStudentDashboard(student) {
    welcomeStudent.textContent = `أهلاً بك يا ${student.name}`;

    // تهيئة حقول المهام الإضافية في حال كانت غير موجودة (لأول مرة)
    if (!student.displayed_hifz_bonus_tasks) student.displayed_hifz_bonus_tasks = [];
    if (!student.displayed_murajaa_bonus_tasks) student.displayed_murajaa_bonus_tasks = [];
    
    currentUser = student; // تحديث الكائن العام بآخر البيانات

    // Get the actual curriculum items based on saved indices
    const currentHifzItem = globalHifzCurriculum[student.hifz_progress]; 
    const currentMurajaaItem = globalMurajaaCurriculum[student.murajaa_progress];

    studentHifzProgress.textContent = currentHifzItem ? currentHifzItem.label : 'المنهج غير مُعين';
    studentMurajaaProgress.textContent = currentMurajaaItem ? currentMurajaaItem.label : 'المنهج غير مُعين';
    studentTotalPoints.textContent = student.total_points;

    // Display tasks using the new curriculum-based function
    renderCurriculumTasks(student); 

    hideAllScreens();
    studentScreen.classList.remove('hidden');
}

// =======================================================
// ⭐⭐ دوال لوحة المعلم (Teacher Panel Functions) - مُعدّل ⭐⭐
// =======================================================

/**
 * دالة لتعديل إجمالي نقاط الطالب مباشرة من لوحة المعلم.
 * @param {string} studentCode رمز الطالب.
 * @param {number} newPoints القيمة الجديدة لإجمالي النقاط.
 */
async function updateStudentPoints(studentCode, newPoints) {
    try {
        const studentDocRef = doc(db, 'students', studentCode);
        
        await updateDoc(studentDocRef, {
            total_points: newPoints,
        });

        // تحديث العرض في لوحة المعلم فوراً
        document.getElementById(`points-display-${studentCode}`).textContent = newPoints;
        showMessage(authMessage, `تم تحديث نقاط الطالب ${studentCode} إلى ${newPoints} بنجاح!`, 'success');

    } catch (error) {
        console.error("Error updating student points:", error);
        showMessage(authMessage, `خطأ في تحديث النقاط للطالب ${studentCode}: ${error.message}`, 'error');
    }
}


// Function for loading students for the teacher panel - مُعدّل لإضافة تعديل النقاط
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
            const hifzLabel = globalHifzCurriculum[student.hifz_progress] ? globalHifzCurriculum[student.hifz_progress].label : 'غير محدد';
            
            // إنشاء عنصر القائمة
            const listItem = document.createElement('li');
            
            // ⭐⭐ التعديل الرئيسي هنا: إضافة حقل تعديل النقاط وزر الحفظ ⭐⭐
            listItem.innerHTML = `
                <div style="flex-grow: 1;">
                    <span><strong>${student.name}</strong> (${student.code}) - الحفظ: ${hifzLabel} | النقاط الحالية: 
                        <strong id="points-display-${student.code}">${student.total_points}</strong>
                    </span>
                </div>
                <div class="student-actions" style="display:flex; align-items:center; gap: 10px;">
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
        
        // ⭐⭐ NEW: ربط مستمعي الأحداث لأزرار حفظ النقاط ⭐⭐
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
    // Display Hifz Curriculum
    hifzCurriculumDisplay.innerHTML = globalHifzCurriculum.map((item, index) => 
        `<div>(${index}) ${item.label} (${item.points} نقاط)</div>`
    ).join('');

    // Display Murajaa Curriculum
    murajaaCurriculumDisplay.innerHTML = globalMurajaaCurriculum.map((item, index) => 
        `<div>(${index}) ${item.label} (${item.points} نقاط)</div>`
    ).join('');
}


// Function for task completion (Student marks task as PENDING) - تم استبدالها بدوال متخصصة
// تم حذف دالة completeTask القديمة هنا واستبدالها بالوظائف الجديدة:
// completeCurriculumTask و completeGeneralTask

// =======================================================
// ⭐⭐ دوال مراجعة المهام (المعلم) - مُعدّل بشكل كبير ⭐⭐
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
 * دالة لمعالجة قبول أو رفض المهمة من قبل المعلم. (مُعدّل لدعم التسلسل الصارم والمهام الإضافية)
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
            loadPendingTasksForReview();
            return;
        }

        const task = student.tasks[taskIndex];
        let message = '';
        let successType = 'success';
        
        if (action === 'approve') {
            // 1. تغيير حالة المهمة إلى 'completed' ومنح النقاط
            task.status = 'completed';
            task.completed = true; 
            student.total_points = (student.total_points || 0) + task.points; // تأمين ضد القيمة الفارغة
            
            // 2. تحديث تقدم المنهج إذا كانت المهمة حفظ أو مراجعة
            if (task.type === 'hifz' || task.type === 'murajaa') {
                 
                 let progressField = task.type === 'hifz' ? 'hifz_progress' : 'murajaa_progress';
                 let bonusField = task.type === 'hifz' ? 'displayed_hifz_bonus_tasks' : 'displayed_murajaa_bonus_tasks';
                 let curriculumArray = task.type === 'hifz' ? globalHifzCurriculum : globalMurajaaCurriculum;

                 const expectedProgressItem = curriculumArray[student[progressField]];
                 // التحقق من أن المهمة التي تمت الموافقة عليها هي المهمة الرئيسية الحالية (منع القفزات)
                 const isExpectedTask = expectedProgressItem && task.description.includes(expectedProgressItem.label);

                 if (isExpectedTask) {
                      // 🌟🌟 المنطق الجديد للتسلسل: زيادة التقدم
                      const nextIndex = student[progressField] + 1;
                      if (nextIndex < curriculumArray.length) {
                            student[progressField] = nextIndex;
                            message += ' (تمت زيادة التقدم تلقائياً).';
                            
                            // 🌟🌟 تنظيف المهام الإضافية المعروضة
                            student[bonusField] = (student[bonusField] || []).filter(index => index >= nextIndex);
                            
                            // 🌟🌟 لا نقوم بإنشاء مهمة جديدة هنا، بل نعتمد على العرض في displayStudentDashboard
                            
                      } else {
                            // تم إكمال المنهج
                            student[progressField] = curriculumArray.length;
                            message += ' (تم إكمال المنهج).';
                      }
                 } else {
                     // المهمة المنجزة ليست هي المهمة الرئيسية الحالية
                      message += ' (ملاحظة: تم قبول مهمة غير تسلسلية/عامة. لم يتم تحديث التقدم).';
                 }
                 
            } 
            
            message = `تم قبول مهمة ${task.description} للطالب ${student.name}. أضيفت ${task.points} نقطة${message}`;
            
        } else if (action === 'reject') {
            // تغيير الحالة إلى 'assigned' لإعطاء الطالب فرصة لإعادة الإرسال
            task.status = 'assigned';
            message = `تم رفض مهمة ${task.description} للطالب ${student.name}. وتم إعادتها إلى قائمة مهامه المعينة.`;
            successType = 'error';
        }
student.displayed_hifz_bonus_tasks = student.displayed_hifz_bonus_tasks || [];
student.displayed_murajaa_bonus_tasks = student.displayed_murajaa_bonus_tasks || [];
        // 3. حفظ التغييرات في Firestore (tasks, total_points, progress, bonus fields)
        await updateDoc(studentDocRef, {
            tasks: student.tasks,
            total_points: student.total_points,
            hifz_progress: student.hifz_progress,
            murajaa_progress: student.murajaa_progress,
            displayed_hifz_bonus_tasks: student.displayed_hifz_bonus_tasks,
            displayed_murajaa_bonus_tasks: student.displayed_murajaa_bonus_tasks,
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
        displayCurriculumsInTeacherPanel();
        setActiveTab('manage-students-tab'); // Default tab for teacher
    } else {
        try {
            // Student Login Logic
            const studentDocRef = doc(db, 'students', userCode);
            const docSnapshot = await getDoc(studentDocRef);
            if (docSnapshot.exists()) {
                // دمج بيانات الطالب مع الرمز والدور
                currentUser = { code: userCode, role: 'student', ...docSnapshot.data() };
                displayStudentDashboard(currentUser); // 💥💥 يتم تحديثها الآن بشكل صحيح
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

// Tab switching
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
    const murajaaStartIndex = parseInt(newStudentMurajaaStart.value);

    if (!newStudentCode || !newStudentName) {
        showMessage(registerStudentMessage, 'الرجاء ملء جميع الحقول المطلوبة.', 'error');
        return;
    }

    if (hifzStartIndex < 0 || hifzStartIndex >= globalHifzCurriculum.length || isNaN(hifzStartIndex)) {
        showMessage(registerStudentMessage, 'نقطة بداية الحفظ غير صالحة. الرجاء اختيار من القائمة.', 'error');
        return;
    }

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
        
        // المهام التسلسلية لم تعد تضاف إلى الـ tasks هنا. سنعتمد على progress
        // لكن نحتاج لإضافة أول مهمة إلى tasks لجعلها قابلة للمراجعة
        if (globalHifzCurriculum[hifzStartIndex]) {
             // 💥 إضافة أول مهمة حفظ لتكون قابلة للمراجعة (بما أنها المهمة الرئيسية)
             initialTasks.push({ 
                 id: generateUniqueId(), 
                 description: `حفظ: ${globalHifzCurriculum[hifzStartIndex].label}`, 
                 type: 'hifz', 
                 points: globalHifzCurriculum[hifzStartIndex].points, 
                 completed: false, 
                 status: 'assigned' 
             });
        }
        if (globalMurajaaCurriculum[murajaaStartIndex]) {
             // 💥 إضافة أول مهمة مراجعة لتكون قابلة للمراجعة
             initialTasks.push({ 
                 id: generateUniqueId(), 
                 description: `مراجعة: ${globalMurajaaCurriculum[murajaaStartIndex].label}`, 
                 type: 'murajaa', 
                 points: globalMurajaaCurriculum[murajaaStartIndex].points, 
                 completed: false,
                 status: 'assigned' 
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
            tasks: initialTasks,
            displayed_hifz_bonus_tasks: [], // 🆕 حقل جديد
            displayed_murajaa_bonus_tasks: [], // 🆕 حقل جديد
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

    // Logic to assign task to all students (Batch Write recommended for real app)
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
