// //////////////////////////////////////////////////////
// ملف app.js النهائي: نسخة شاملة مع نظام اللوب وتعديلات النقاط وإدارة بنك المهام.
// //////////////////////////////////////////////////////

// --- 0. الإعدادات الأولية وربط Firebase ---
const firebaseConfig = {
  // *** 🔴 تذكير: يجب تغيير هذا الـ Config ببيانات مشروعك الفعلية 🔴 ***
  apiKey: "AIzaSyCeIcmuTd72sjiu1Uyijn_J4bMS0ChtXGo",
  authDomain: "studenttasksmanager.firebaseapp.com",
  projectId: "studenttasksmanager",
  storageBucket: "studenttasksmanager.firebasestorage.app",
  messagingSenderId: "850350680089",
  appId: "1:850350680089:web:51b71a710e938754bc6288",
  measurementId: "G-7QC4FVXKZG"
};

const app = firebase.initializeApp(firebaseConfig); 
const db = firebase.firestore();


// --- 1. متغيرات الحالة العامة ---
let allStudentsData = {};          
let currentStudentId = null;       
const TEACHER_CODE = 'TEACHER2025'; 

let curriculumLists = {}; // لتخزين قوائم المنهج المركزية
let taskBank = [];        // سيتم تحميلها من Firestore
const MANUAL_TASK_POINTS = 1; // 🔴 جميع المهام الإضافية (اليدوية/البنكية) 1 نقطة


// --- 2. دالة معالجة تسجيل الدخول (الطالب والمعلم) ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputId = document.getElementById('student-id').value.trim();
        
        // 🔑 تحميل البيانات الأساسية قبل القرار
        await loadAllStudentsData(); 
        await loadCurriculumLists(); 
        await loadTaskBank(); // تحميل بنك المهام الجديد

        if (inputId === TEACHER_CODE) {
            showTeacherDashboard();
        } else if (inputId.match(/^\d+$/) && allStudentsData[inputId]) { 
            loadStudentData(inputId);
        } else {
            alert("الرجاء إدخال رمز صحيح (طالب أو معلم).");
        }
    });
}


// --- 3. دالة جلب كل البيانات من Firestore ---
async function loadAllStudentsData() {
    const tasksCollection = db.collection("tasks"); 
    const querySnapshot = await tasksCollection.get();

    allStudentsData = {}; 
    
    querySnapshot.forEach((doc) => {
        allStudentsData[doc.id] = {...doc.data(), id: doc.id}; 
    });
} 

async function loadCurriculumLists() {
    try {
        const [hifzDoc, murajaaDoc] = await Promise.all([
            db.collection("Curriculum").doc("Hifz").get(),
            db.collection("Curriculum").doc("Murajaa").get()
        ]);
        
        curriculumLists.Hifz = hifzDoc.exists ? hifzDoc.data().tasks_list || [] : [];
        curriculumLists.Murajaa = murajaaDoc.exists ? murajaaDoc.data().tasks_list || [] : [];
        
    } catch (e) {
        console.error("Error loading curriculum lists. Please ensure 'Curriculum' collection exists:", e);
    }
}

// دالة تحميل بنك المهام الجاهزة من Firestore
async function loadTaskBank() {
    try {
        // يتم تخزين بنك المهام الآن في وثيقة TaskBank ضمن مجموعة Settings
        const doc = await db.collection("Settings").doc("TaskBank").get();
        taskBank = doc.exists ? doc.data().tasks || [] : [];
    } catch (e) {
        console.error("Error loading Task Bank.", e);
        taskBank = [];
    }
}


// --- 4. دالة تحديد المهام النشطة للطالب (تفعيل اللوب) ---
function getCurrentCurriculumTasks(studentData) {
    // الكود هنا لم يتغير
    const activeTasks = [];
    const studentTasks = studentData.tasks || [];

    // Hifz
    const hifzIndex = studentData.hifz_progress || 0;
    const nextHifzTask = curriculumLists.Hifz[hifzIndex];
    if (nextHifzTask) {
        const isHifzActive = studentTasks.some(t => t.curriculum_id === nextHifzTask.curriculum_id && t.status === "claimed" && t.task_type === "Hifz تسلسلي");
        if (!isHifzActive) {
            activeTasks.push({ ...nextHifzTask, is_curriculum_task: true, curriculum_type: 'Hifz' });
        }
    }

    // Murajaa
    const murajaaList = curriculumLists.Murajaa || [];
    const murajaaTotal = murajaaList.length;
    
    if (murajaaTotal > 0) {
        const murajaaIndex = (studentData.murajaa_progress || 0) % murajaaTotal; 
        const nextMurajaaTask = murajaaList[murajaaIndex];
        
        if (nextMurajaaTask) {
            const isMurajaaActive = studentTasks.some(t => 
                t.curriculum_id === nextMurajaaTask.curriculum_id && 
                t.status === "claimed" && 
                t.task_type === "Murajaa تسلسلي" 
            );
            
            if (!isMurajaaActive) {
                const murajaaPool = studentData.murajaa_pool || [];
                const poolDescription = murajaaPool.slice(0, 5).join(', ') + (murajaaPool.length > 5 ? '... والمزيد.' : '');
                
                const taskWithPool = { ...nextMurajaaTask };
                taskWithPool.description = `${taskWithPool.description} - (راجع: ${poolDescription || 'لا يوجد سور/أجزاء محددة حاليًا.'})`;

                activeTasks.push({ ...taskWithPool, is_curriculum_task: true, curriculum_type: 'Murajaa' });
            }
        }
    }
    
    const pendingAndClaimedTasks = studentTasks.filter(t => t.status === "pending" || t.status === "claimed");
    const combinedTasks = pendingAndClaimedTasks.concat(activeTasks);

    return combinedTasks;
}


// --- 5. دوال عرض واجهة الطالب والتقارير ---
async function loadStudentData(studentId) {
    currentStudentId = studentId;
    const studentData = allStudentsData[studentId];
    
    const combinedTasks = getCurrentCurriculumTasks(studentData);

    document.getElementById('student-info-name').innerText = `أهلاً بك، ${studentData.student_name}`;
    document.getElementById('student-info-score').innerText = `نقاطك الحالية: ${studentData.score || 0}`;

    renderStudentRank();
    renderProgressBars(studentData); 
    renderTasks(studentData, combinedTasks); 
    
    if (typeof showTasksScreen === 'function') {
        showTasksScreen(studentId);
    }
}

function renderStudentRank() {
    const rankContainer = document.getElementById('student-rank-info');
    if (!rankContainer || !currentStudentId) return;
    
    const studentsArray = Object.values(allStudentsData).map(data => ({
        id: data.id,
        score: data.score || 0
    }));

    studentsArray.sort((a, b) => b.score - a.score);

    const studentRank = studentsArray.findIndex(student => student.id === currentStudentId) + 1;

    if (studentRank > 0) {
        rankContainer.innerHTML = `<i class="fas fa-trophy text-warning"></i> مرتبتك: ${studentRank} من ${studentsArray.length}`;
    } else {
         rankContainer.innerHTML = `جاري تحديث المرتبة...`;
    }
}

function renderProgressBars(studentData) {
    const progressContainer = document.getElementById('progress-container');
    if (!progressContainer) return;
    
    progressContainer.innerHTML = '';
    
    const hifzTotal = curriculumLists.Hifz.length;
    const hifzProgress = studentData.hifz_progress || 0;
    const hifzPercent = hifzTotal > 0 ? Math.floor((hifzProgress / hifzTotal) * 100) : 0;
    const nextHifz = curriculumLists.Hifz[hifzProgress];

    if (hifzTotal > 0) {
        progressContainer.innerHTML += `
            <div class="progress-section mb-4">
                <div class="progress-title mb-2">
                    <i class="fas fa-book-open text-success"></i> مسار الحفظ: ${hifzProgress} من ${hifzTotal} مهمة مكتملة (${hifzPercent}%)
                </div>
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar bg-success" role="progressbar" style="width: ${hifzPercent}%;" aria-valuenow="${hifzPercent}" aria-valuemin="0" aria-valuemax="100">
                        ${hifzPercent}%
                    </div>
                </div>
                <small class="text-muted mt-2 d-block">المهمة التالية: ${nextHifz ? nextHifz.description : 'تم إكمال جميع مهام الحفظ! 🎉'}</small>
            </div>
        `;
    }
    
    const murajaaTotal = curriculumLists.Murajaa.length;
    const murajaaProgress = studentData.murajaa_progress || 0;
    const currentMurajaaProgressInLoop = murajaaProgress % murajaaTotal;
    const murajaaPercent = murajaaTotal > 0 ? Math.floor((currentMurajaaProgressInLoop / murajaaTotal) * 100) : 0;
    const nextMurajaa = curriculumLists.Murajaa[currentMurajaaProgressInLoop];

    if (murajaaTotal > 0) {
         progressContainer.innerHTML += `
            <div class="progress-section mb-4">
                <div class="progress-title mb-2">
                    <i class="fas fa-redo-alt text-info"></i> مسار المراجعة (الدورة الحالية): ${currentMurajaaProgressInLoop} من ${murajaaTotal} مهمة (${murajaaPercent}%)
                </div>
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar bg-info" role="progressbar" style="width: ${murajaaPercent}%;" aria-valuenow="${murajaaPercent}" aria-valuemin="0" aria-valuemax="100">
                         ${murajaaPercent}%
                    </div>
                </div>
                <small class="text-muted mt-2 d-block">المهمة التالية: ${nextMurajaa ? nextMurajaa.description.replace('مراجعة: ', '') : 'جاري إعداد الدورة التالية.'}</small>
            </div>
        `;
    }
}

function renderTasks(studentData, taskList) {
    const tasksContainer = document.getElementById('tasks-container');
    tasksContainer.innerHTML = '';
    const studentTasksInDb = studentData.tasks || []; 
    const noTasksMessage = document.getElementById('no-tasks-message');

    if (taskList.length === 0) {
        noTasksMessage.classList.remove('d-none');
        return;
    }
    noTasksMessage.classList.add('d-none');
    
    taskList.forEach((task) => {
        let cardClass = 'manual-card'; 
        let iconHtml = '<i class="fas fa-pencil-alt text-warning me-2"></i>';
        let actionButton = '';
        let taskTypeDisplay = task.task_type; 

        if (task.is_curriculum_task) {
            
            if (task.curriculum_type === 'Hifz') {
                cardClass = 'hifz-card';
                iconHtml = '<i class="fas fa-quran text-success me-2"></i>';
            } else if (task.curriculum_type === 'Murajaa') {
                cardClass = 'murajaa-card';
                iconHtml = '<i class="fas fa-redo-alt text-info me-2"></i>';
            }
            
            const activeInDb = studentTasksInDb.find(t => 
                t.curriculum_id === task.curriculum_id && 
                t.status === "claimed" &&
                t.task_type === `${task.curriculum_type} تسلسلي`
            );

            if (activeInDb) {
                cardClass += ' claimed-card';
                actionButton = `<button class="btn btn-warning btn-sm" disabled><i class="fas fa-hourglass-half"></i> قيد مراجعة المعلم</button>`;
            } else {
                actionButton = `<button class="btn btn-primary" onclick="claimCurriculumTask('${task.curriculum_type}', ${task.curriculum_id}, ${task.points_value}, '${task.description.replace(/'/g, "\\'")}')"><i class="fas fa-check"></i> تم الإنجاز</button>`;
            }

        } 
        else {
            const originalIndex = studentTasksInDb.findIndex(t => 
                t.description === task.description && 
                t.points_value === task.points_value && 
                t.status === task.status
            );
            if (originalIndex === -1) return;
            
            if (task.status === "claimed") {
                cardClass = 'manual-card claimed-card';
                actionButton = `
                    <button class="btn btn-warning btn-sm me-2" disabled><i class="fas fa-hourglass-half"></i> قيد مراجعة المعلم</button>
                    <button class="btn btn-danger btn-sm" onclick="processTaskUndo(${originalIndex})"><i class="fas fa-times"></i> إلغاء</button>
                `;
            } else if (task.status === "pending") {
                actionButton = `<button class="btn btn-success" onclick="processTaskClaim(${originalIndex})"><i class="fas fa-check-double"></i> تم الإنجاز</button>`;
            }
        }
        
        const taskElement = document.createElement('div');
        taskElement.className = `task-card ${cardClass}`;
        
        taskElement.innerHTML = `
            <div class="card-header-custom">
                <span class="task-title">${iconHtml} ${task.description}</span>
                <span class="task-points">${task.points_value} نقطة</span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted d-none">النوع: ${taskTypeDisplay}</small>
                <div class="task-actions">
                    ${actionButton}
                </div>
            </div>
        `;
        tasksContainer.appendChild(taskElement);
    });
}

// ... (دوال المطالبة والإلغاء والموافقة لم تتغير وظيفتها الأساسية)


// --- 6. دوال المعلم (Teacher Dashboard) ---

function showTeacherDashboard() {
    if (typeof showTeacherScreen === 'function') showTeacherScreen(); 
    
    const newStudentForm = document.getElementById('add-new-student-form');
    if (newStudentForm) {
        newStudentForm.removeEventListener('submit', handleAddNewStudent);
        newStudentForm.addEventListener('submit', handleAddNewStudent);
    }

    const curriculumForm = document.getElementById('add-curriculum-task-form');
    if (curriculumForm) {
        curriculumForm.removeEventListener('submit', handleAddCurriculumTask);
        curriculumForm.addEventListener('submit', handleAddCurriculumTask);
    }

    const addBankTaskForm = document.getElementById('add-bank-task-form');
    if (addBankTaskForm) {
        addBankTaskForm.removeEventListener('submit', handleAddBankTask);
        addBankTaskForm.addEventListener('submit', handleAddBankTask);
    }

    renderTeacherReviewList(); 
    renderLeaderboard();
    updateCurriculumStatusDisplay(); 
    renderBankTasks(); // عرض بنك المهام
    populateBulkTaskSelect(); // تعبئة قائمة المهام الجاهزة
    populateBulkStudentSelect(); // تعبئة قائمة الطلاب
}

// ... (دوال renderTeacherReviewList و renderLeaderboard لم تتغير)

// 🔴 دالة لإضافة مهمة إلى بنك المهام الجاهزة
async function handleAddBankTask(e) {
    e.preventDefault();
    const description = document.getElementById('bank-task-description').value.trim();
    
    if (!description) {
        alert("الرجاء إدخال وصف المهمة.");
        return;
    }

    const newTask = {
        id: Date.now(), 
        description: description,
        points: MANUAL_TASK_POINTS,
        type: "إضافي"
    };

    try {
        await db.collection('Settings').doc('TaskBank').set({
            tasks: firebase.firestore.FieldValue.arrayUnion(newTask)
        }, { merge: true }); 

        alert(`تم إضافة المهمة "${description}" إلى البنك (1 نقطة).`);
        e.target.reset();
        await loadTaskBank(); 
        renderBankTasks(); 
        populateBulkTaskSelect(); 

    } catch (error) {
        console.error("خطأ في إضافة المهمة لبنك المهام:", error);
        alert("فشل إضافة المهمة لبنك المهام.");
    }
}

// 🔴 دالة لحذف مهمة من بنك المهام الجاهزة
async function deleteBankTask(taskId) {
    if (!confirm("هل أنت متأكد من حذف هذه المهمة من بنك المهام الجاهزة؟")) return;

    const taskToRemove = taskBank.find(t => t.id === taskId);
    if (!taskToRemove) return;

    try {
        await db.collection('Settings').doc('TaskBank').update({
            tasks: firebase.firestore.FieldValue.arrayRemove(taskToRemove)
        });

        alert(`تم حذف المهمة بنجاح.`);
        await loadTaskBank();
        renderBankTasks();
        populateBulkTaskSelect();
    } catch (error) {
        console.error("خطأ في حذف المهمة من بنك المهام:", error);
        alert("فشل حذف المهمة من بنك المهام.");
    }
}

// 🔴 دالة عرض بنك المهام
function renderBankTasks() {
    const listContainer = document.getElementById('bank-tasks-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (taskBank.length === 0) {
        listContainer.innerHTML = '<div class="alert alert-info m-0">لا توجد مهام إضافية جاهزة حالياً.</div>';
        return;
    }

    taskBank.forEach(task => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <span>${task.description} (${task.points} نقطة)</span>
            <button class="btn btn-sm btn-danger" onclick="deleteBankTask(${task.id})">
                <i class="fas fa-trash"></i> حذف
            </button>
        `;
        listContainer.appendChild(item);
    });
}

function populateBulkTaskSelect() {
    const select = document.getElementById('bulk-task-select');
    select.innerHTML = '<option value="">اختر المهمة...</option>';

    taskBank.forEach((task) => {
        const option = document.createElement('option');
        // نستخدم JSON.stringify لتمرير التفاصيل بالكامل
        option.value = JSON.stringify({ description: task.description, points: task.points, type: task.type }); 
        option.textContent = `${task.description} (${task.points} نقطة)`;
        select.appendChild(option);
    });
}

function populateBulkStudentSelect() {
    const select = document.getElementById('bulk-student-select');
    select.innerHTML = '';
    
    Object.values(allStudentsData).forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.student_name} (${student.id})`;
        select.appendChild(option);
    });
}

// دالة إضافة مهمة فردية (اليدوية)
const addTaskForm = document.getElementById('add-task-form');
if (addTaskForm) {
    addTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const studentId = document.getElementById('new-task-student-id').value.trim();
        const description = document.getElementById('new-task-description').value.trim();
        const points = MANUAL_TASK_POINTS; // 🔴 نقاط ثابتة 1
        const date = document.getElementById('new-task-date').value;
        const time = document.getElementById('new-task-time').value;

        if (!allStudentsData[studentId]) {
             alert("رمز الطالب غير صحيح أو غير موجود.");
             return;
        }
        
        const taskDetails = {
            description: description,
            points_value: points,
            release_date: date,
            release_time: time,
            task_type: "يدوي",
            status: "pending"
        };
         try {
            await db.collection('tasks').doc(studentId).update({
                tasks: firebase.firestore.FieldValue.arrayUnion(taskDetails)
            });
            alert(`تم إضافة المهمة اليدوية للطالب ${studentId} بنجاح (1 نقطة).`);
            e.target.reset();
            await loadAllStudentsData();
        } catch (error) {
            console.error("خطأ في إضافة المهمة اليدوية:", error);
            alert("فشل إضافة المهمة اليدوية.");
        }
    });
}

// دالة إضافة مهمة جماعية (من البنك الجديد)
const addBulkTaskForm = document.getElementById('add-bulk-task-form');
if (addBulkTaskForm) {
    addBulkTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const selectedTaskJson = document.getElementById('bulk-task-select').value;
        const selectedStudents = Array.from(document.getElementById('bulk-student-select').selectedOptions).map(option => option.value);
        const date = document.getElementById('bulk-task-date').value;
        const time = document.getElementById('bulk-task-time').value;

        if (!selectedTaskJson || selectedStudents.length === 0) {
            alert("الرجاء اختيار مهمة واحدة على الأقل وطالب واحد على الأقل.");
            return;
        }

        const taskTemplate = JSON.parse(selectedTaskJson);
        const taskDetails = {
            description: taskTemplate.description,
            points_value: taskTemplate.points,
            release_date: date,
            release_time: time,
            task_type: taskTemplate.type,
            status: "pending"
        };
        
        let successCount = 0;
        let failCount = 0;

        for (const studentId of selectedStudents) {
            try {
                await db.collection('tasks').doc(studentId).update({
                    tasks: firebase.firestore.FieldValue.arrayUnion(taskDetails)
                });
                successCount++;
            } catch (error) {
                console.error(`فشل إضافة المهمة للطالب ${studentId}:`, error);
                failCount++;
            }
        }

        alert(`تم إضافة المهمة بنجاح إلى ${successCount} طالب. فشل: ${failCount}.`);
        e.target.reset();
        await loadAllStudentsData();
    });
}


// --- 7. دوال إدارة المنهج المركزي (التسلسلي) ---

// دالة إضافة مهمة منهج جديدة (تستخدم النقاط الثابتة 5 أو 3)
async function handleAddCurriculumTask(e) {
    e.preventDefault();
    
    const description = document.getElementById('curriculum-description').value.trim();
    const type = document.getElementById('curriculum-type-select').value.trim();
    
    if (!description || !type) {
        alert("الرجاء ملء جميع حقول المنهج بشكل صحيح.");
        return;
    }
    
    // 🔴 تعيين النقاط بناءً على النوع
    const pointsValue = (type === 'Hifz') ? 5 : 3; 
    
    const currentList = curriculumLists[type] || [];
    const nextCurriculumId = currentList.length;
    
    const newTask = {
        description: description,
        points_value: pointsValue,
        task_type: `${type} تسلسلي`,
        curriculum_id: nextCurriculumId
    };
    
    try {
        const curriculumDocRef = db.collection('Curriculum').doc(type);
        
        await curriculumDocRef.update({
            tasks_list: firebase.firestore.FieldValue.arrayUnion(newTask)
        });
        
        currentList.push(newTask);
        alert(`تم إضافة المهمة بنجاح إلى مسار ${type}. أصبحت المهمة رقم ${nextCurriculumId}.`);
        
        e.target.reset(); 
        await loadCurriculumLists(); 
        updateCurriculumStatusDisplay(); 
        
    } catch (error) {
        // إذا لم يكن الوثيقة موجودة، نقوم بإنشائها
         try {
            const curriculumDocRef = db.collection('Curriculum').doc(type);
            await curriculumDocRef.set({ tasks_list: [newTask] });

            currentList.push(newTask);
            alert(`تم إنشاء مسار ${type} وإضافة المهمة بنجاح. أصبحت المهمة رقم ${nextCurriculumId}.`);

            e.target.reset();
            await loadCurriculumLists(); 
            updateCurriculumStatusDisplay();
        } catch (e) {
            console.error("خطأ حاسم في إدارة المنهج:", e);
            alert("فشل في إضافة/إنشاء وثيقة المنهج المركزي.");
        }
    }
}

function updateCurriculumStatusDisplay() {
    const statusElement = document.getElementById('curriculum-status');
    if (statusElement) {
        const hifzCount = curriculumLists.Hifz ? curriculumLists.Hifz.length : 0;
        const murajaaCount = curriculumLists.Murajaa ? curriculumLists.Murajaa.length : 0;
        
        statusElement.innerHTML = `
            <i class="fas fa-book-open text-success"></i> الحفظ: ${hifzCount} مهمة (5 نقاط). 
            <i class="fas fa-redo-alt text-info"></i> المراجعة: ${murajaaCount} مهمة (3 نقاط).
        `;
    }
}


// //////////////////////////////////////////////////////
// 🔴 الدوال التنفيذية لملء قاعدة البيانات (Seed Scripts) 🔴
// تم تعديل النقاط هنا لـ 5 للحفظ و 3 للمراجعة
// //////////////////////////////////////////////////////

// --- الدالة 1: لإضافة مهام الحفظ بالكامل (5 نقاط) ---
async function seedHifzCurriculum() {
    if (!confirm("تحذير: هل أنت متأكد من إضافة 87 مهمة حفظ جديدة إلى قائمة المنهج المركزي؟")) {
        return;
    }

    const hifzTasksList = [
        "النازعات 1-14", "النازعات 15-33", "النازعات 34-46",
        "النبأ 1-16", "النبأ 17-30", "النبأ 31-40",
        "المرسلات 1-14", "المرسلات 15-28", "المرسلات 29-40", "المرسلات 41-50",
        "الإنسان 1-12", "الإنسان 13-21", "الإنسان 22-31",
        "القيامة 1-19", "القيامة 20-40",
        "المدثر 1-17", "المدثر 18-31", "المدثر 32-47", "المدثر 48-56",
        "المزمل 1-13", "المزمل 14-19", "المزمل 20",
        "الجن 1-5", "الجن 6-10", "الجن 11-15", "الجن 16-23", "الجن 24-28",
        "نوح 1-10", "نوح 11-20", "نوح 21-25", "نوح 26-28",
        "المعارج 1-14", "المعارج 15-28", "المعارج 29-39", "المعارج 40-44",
        "الحاقة 1-12", "الحاقة 13-24", "الحاقة 25-37", "الحاقة 38-52",
        "القلم 1-15", "القلم 16-33", "القلم 34-43", "القلم 44-52",
        "الملك 1-5", "الملك 6-12", "الملك 13-18", "الملك 19-24", "الملك 25-30",
        "التحريم 1-5", "التحريم 6-8", "التحريم 9-12",
        "الطلاق 1-3", "الطلاق 4-5", "الطلاق 6-10", "الطلاق 11-12",
        "التغابن 1-6", "التغابن 7-9", "التغابن 10-13", "التغابن 14-18",
        "المنافقون 1-4", "المنافقون 5-8", "المنافقون 9-11",
        "الجمعة 1-5", "الجمعة 6-8", "الجمعة 9-11",
        "الصف 1-5", "الصف 6-9", "الصف 10-14",
        "الممتحنة 1", "الممتحنة 2-3", "الممتحنة 4", "الممتحنة 5-7", "الممتحنة 7-9", "الممتحنة 10-11", "الممتحنة 12-13",
        "الحشر 1-3", "الحشر 4-7", "الحشر 7-10", "الحشر 11-14", "الحشر 15-20", "الحشر 21-24",
        "المجادلة 1-3", "المجادلة 4-6", "المجادلة 7-8", "المجادلة 9-11", "المجادلة 12-15", "المجادلة 16-21", "المجادلة 22"
    ];

    const finalHifzArray = hifzTasksList.map((description, index) => ({
        description: description,
        points_value: 5, // 🔴 5 نقاط للحفظ
        task_type: "Hifz تسلسلي",
        curriculum_id: index
    }));

    try {
        await db.collection('Curriculum').doc('Hifz').set({
            tasks_list: finalHifzArray
        });
        
        curriculumLists.Hifz = finalHifzArray; 
        
        alert(`🎉 تم إضافة ${finalHifzArray.length} مهمة حفظ بنجاح إلى المنهج المركزي! (5 نقاط للمهمة).`);
        
    } catch (e) {
        console.error("خطأ حاسم في إضافة المنهج المركزي للحفظ:", e);
        alert("فشل إضافة المنهج. تحقق من اتصال Firebase.");
    }
}


// --- الدالة 2: لتحديث وعكس مهام المراجعة (3 نقاط) ---
async function updateAndReverseMurajaaCurriculum() {
    if (!confirm("تحذير حاسم: هل أنت متأكد من عكس قائمة المراجعة وإعادة كتابتها؟ هذا ضروري لنظام اللوب الجديد.")) {
        return;
    }

    const reversedMurajaaTasksList = [
        "الناس إلى البلد", "الفجر - الطارق", "الانشقاق والبروج", 
        "الانفطار والمطففين", "عبس والتكوير", "النازعات",
        "النبأ", "المرسلات", "الإنسان", "القيامة", 
        "المدثر", "المزمل", "الجن", "نوح", 
        "المعارج", "الحاقة", "القلم", "الملك", 
        "التحريم", "الطلاق", "التغابن", "المنافقون", 
        "الجمعة", "الصف", "الممتحنة 1-2", "الحشر 1-2"
    ];

    const finalMurajaaArray = reversedMurajaaTasksList.map((description, index) => ({
        description: `مراجعة: ${description}`, 
        points_value: 3, // 🔴 3 نقاط للمراجعة
        task_type: "Murajaa تسلسلي",
        curriculum_id: index 
    }));
    
    try {
        await db.collection('Curriculum').doc('Murajaa').set({
            tasks_list: finalMurajaaArray
        });
        
        curriculumLists.Murajaa = finalMurajaaArray; 
        
        alert(`🎉 تم تحديث وعكس قائمة المراجعة بنجاح! الترتيب يبدأ الآن من: "الناس إلى البلد" كـ (ID: 0). (3 نقاط للمهمة).`);
        
    } catch (e) {
        console.error("خطأ حاسم في تحديث المنهج المركزي للمراجعة:", e);
        alert("فشل تحديث المنهج. تحقق من اتصال Firebase.");
    }
}
