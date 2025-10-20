// //////////////////////////////////////////////////////
// ملف app.js (الإصدار المُعدَّل على التصميم والوضوح)
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
    measurementId: "G-7QC4FVZKZG"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// --- 1. متغيرات الحالة العامة ---
let allStudentsData = {};
let currentStudentId = null;
const TEACHER_CODE = 'TEACHER2025';

let curriculumLists = {};
let taskBank = []; 
const MANUAL_TASK_POINTS = 1; 


// --- دوال عرض الشاشة (لا تغيير) ---
function showLoginScreen() {
    document.querySelectorAll('#app-screens section').forEach(section => {
        section.classList.add('d-none');
        section.classList.remove('active-screen');
    });
    document.getElementById('login-screen').classList.remove('d-none');
    document.getElementById('login-screen').classList.add('active-screen');
    document.getElementById('logout-btn').classList.add('d-none');
    currentStudentId = null; 
}
function showTasksScreen(studentId) {
    document.querySelectorAll('#app-screens section').forEach(section => {
        section.classList.add('d-none');
        section.classList.remove('active-screen');
    });
    document.getElementById('tasks-screen').classList.remove('d-none');
    document.getElementById('tasks-screen').classList.add('active-screen');
    document.getElementById('logout-btn').classList.remove('d-none');
}
function showTeacherScreen() {
    document.querySelectorAll('#app-screens section').forEach(section => {
        section.classList.add('d-none');
        section.classList.remove('active-screen');
    });
    document.getElementById('teacher-screen').classList.remove('d-none');
    document.getElementById('teacher-screen').classList.add('active-screen');
    document.getElementById('logout-btn').classList.remove('d-none');
}

// --- 2. دالة معالجة تسجيل الدخول (الطالب والمعلم) ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputId = document.getElementById('student-id').value.trim();

        await loadAllStudentsData();
        await loadCurriculumLists();
        await loadTaskBank();

        if (inputId === TEACHER_CODE) {
            showTeacherDashboard();
        } else if (inputId.match(/^\d+$/) && allStudentsData[inputId]) {
            loadStudentData(inputId);
        } else {
            alert("الرجاء إدخال رمز صحيح.");
        }
    });
}


// --- 3. دوال جلب البيانات من Firestore (لا تغيير) ---
async function loadAllStudentsData() {
    try {
        const tasksCollection = db.collection("tasks");
        const querySnapshot = await tasksCollection.get();

        allStudentsData = {};

        querySnapshot.forEach((doc) => {
            allStudentsData[doc.id] = { ...doc.data(), id: doc.id };
        });
    } catch (error) {
        console.error("Error loading all students data. Check Firebase Rules/Connection:", error);
        alert("فشل تحميل بيانات الطلاب. تأكد من قواعد الأمان والاتصال.");
    }
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
        console.error("Error loading curriculum lists:", e);
    }
}
async function loadTaskBank() {
    try {
        const regularDoc = await db.collection("Settings").doc("TaskBank_Regular").get();
        
        taskBank = regularDoc.exists ? regularDoc.data().tasks || [] : [];
        
    } catch (e) {
        console.error("Error loading Task Bank.", e);
        taskBank = [];
    }
}


// --- 4. دالة تحديد المهام الإضافية النشطة (لا تغيير) ---
function getCurrentCurriculumTasks(studentData) {
    const studentTasks = studentData.tasks || [];
    const now = new Date();
    
    function isTaskReleased(task, now) {
        if (!task.release_date || !task.release_time) {
            return true; 
        }
        
        const releaseDateTimeString = `${task.release_date}T${task.release_time}:00`;
        const releaseDate = new Date(releaseDateTimeString);
        
        return now >= releaseDate;
    }

    const pendingAndClaimedTasks = studentTasks.filter(t => 
        (t.status === "pending" || t.status === "claimed") &&
        !t.task_type.includes('تسلسلي') && 
        isTaskReleased(t, now) 
    );
    
    return pendingAndClaimedTasks;
}


// --- 5. دوال عرض واجهة الطالب والتقارير ---

async function loadStudentData(studentId) {
    currentStudentId = studentId;
    const studentData = allStudentsData[studentId];

    const activeTasks = getCurrentCurriculumTasks(studentData); 

    document.getElementById('student-info-name').innerText = `أهلاً بك، ${studentData.student_name}`;
    document.getElementById('student-info-score').innerText = `${studentData.score || 0}`;

    renderStudentRank();
    renderProgressBars(studentData); 
    renderTasks(studentData, activeTasks); 

    if (typeof showTasksScreen === 'function') {
        showTasksScreen(studentId);
    }
}

// دالة عرض الترتيب (مُعدَّلة لاستخدام حاوية الـ index الجديدة)
function renderStudentRank() {
    const rankContainer = document.getElementById('student-rank-info');
    if (!rankContainer || !currentStudentId) return;

    const studentsArray = Object.values(allStudentsData)
        .map(data => ({ id: data.id, score: data.score || 0 }));

    studentsArray.sort((a, b) => b.score - a.score);

    const studentRank = studentsArray.findIndex(student => student.id === currentStudentId) + 1;

    if (studentRank > 0) {
        rankContainer.innerHTML = `#${studentRank} من ${studentsArray.length}`;
    } else {
         rankContainer.innerHTML = ` - `;
    }
    
    // إعادة عرض لوحة الشرف المصغرة في نفس الـ Card
    renderLeaderboard(true); 
}

// دالة التقدم (مُحسَّنة: تصميم أوضح للمهمة التالية)
function renderProgressBars(studentData) {
    const progressContainer = document.getElementById('progress-container');
    if (!progressContainer) return;

    progressContainer.innerHTML = '';
    const studentTasks = studentData.tasks || []; 

    // --- 1. مسار الحفظ (Hifz) ---
    const hifzTotal = curriculumLists.Hifz.length;
    const hifzProgress = studentData.hifz_progress || 0;
    const hifzPercent = hifzTotal > 0 ? Math.floor((hifzProgress / hifzTotal) * 100) : 0;
    const nextHifzIndex = hifzProgress;
    const nextHifz = curriculumLists.Hifz[nextHifzIndex]; 

    if (hifzTotal > 0) {
        let hifzStatusHtml = '';
        if (nextHifz) {
            const isHifzClaimed = studentTasks.some(t =>
                t.curriculum_id === nextHifz.curriculum_id &&
                t.status === "claimed" &&
                t.task_type === "Hifz تسلسلي"
            );

            if (isHifzClaimed) {
                 hifzStatusHtml = `
                    <div class="alert alert-warning mt-2 p-3 d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fas fa-hourglass-half me-2"></i> 
                            <strong>المهمة التالية:</strong> ${nextHifz.description}
                        </div>
                        <button class="btn btn-sm btn-warning" disabled>قيد المراجعة</button>
                    </div>`;
            } else {
                 hifzStatusHtml = `
                    <div class="alert alert-success mt-2 p-3 d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fas fa-arrow-left me-2"></i> 
                            <strong>المهمة التالية:</strong> ${nextHifz.description}
                            <span class="badge bg-success ms-2">+${nextHifz.points_value} نقاط</span>
                        </div>
                        <button class="btn btn-sm btn-success" 
                                onclick="claimCurriculumTask('Hifz', ${nextHifz.curriculum_id}, ${nextHifz.points_value}, '${nextHifz.description.replace(/'/g, "\\'")}')">
                            <i class="fas fa-check"></i> تم الإنجاز
                        </button>
                    </div>`;
            }
        } else {
            hifzStatusHtml = `<div class="alert alert-info mt-2 p-2"><i class="fas fa-check-double me-2"></i> تم إكمال جميع مهام الحفظ! 🎉</div>`;
        }


        progressContainer.innerHTML += `
            <div class="progress-section mb-4">
                <div class="progress-title mb-2 d-flex justify-content-between">
                    <span class="text-success"><i class="fas fa-quran me-1"></i> مسار الحفظ</span>
                    <small class="text-muted">${hifzProgress} من ${hifzTotal}</small>
                </div>
                <div class="progress" style="height: 25px;">
                    <div class="progress-bar bg-success" role="progressbar" style="width: ${hifzPercent}%;" aria-valuenow="${hifzPercent}" aria-valuemin="0" aria-valuemax="100">
                        ${hifzPercent}%
                    </div>
                </div>
                ${hifzStatusHtml}
            </div>
        `;
    }

    // --- 2. مسار المراجعة (Murajaa) ---
    const murajaaTotal = curriculumLists.Murajaa.length;
    const murajaaProgress = studentData.murajaa_progress || 0;
    const murajaaIndex = murajaaProgress; 
    const murajaaPercent = murajaaTotal > 0 ? Math.floor((murajaaProgress / murajaaTotal) * 100) : 0;
    const nextMurajaa = curriculumLists.Murajaa[murajaaIndex]; 

    if (murajaaTotal > 0) {
        let murajaaStatusHtml = '';
        if (nextMurajaa) {
            const isMurajaaClaimed = studentTasks.some(t =>
                t.curriculum_id === nextMurajaa.curriculum_id &&
                t.status === "claimed" &&
                t.task_type === "Murajaa تسلسلي"
            );
            const murajaaDesc = nextMurajaa.description.replace('مراجعة: ', '');

            if (isMurajaaClaimed) {
                murajaaStatusHtml = `
                    <div class="alert alert-warning mt-2 p-3 d-flex justify-content-between align-items-center">
                         <div>
                            <i class="fas fa-hourglass-half me-2"></i> 
                            <strong>المهمة التالية:</strong> ${murajaaDesc}
                        </div>
                        <button class="btn btn-sm btn-warning" disabled>قيد المراجعة</button>
                    </div>`;
            } else {
                 murajaaStatusHtml = `
                    <div class="alert alert-info mt-2 p-3 d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fas fa-arrow-left me-2"></i> 
                            <strong>المهمة التالية:</strong> ${murajaaDesc}
                            <span class="badge bg-info ms-2">+${nextMurajaa.points_value} نقاط</span>
                        </div>
                        <button class="btn btn-sm btn-info text-white" 
                                onclick="claimCurriculumTask('Murajaa', ${nextMurajaa.curriculum_id}, ${nextMurajaa.points_value}, '${nextMurajaa.description.replace(/'/g, "\\'")}')">
                            <i class="fas fa-check"></i> تم الإنجاز
                        </button>
                    </div>`;
            }
        } else {
            murajaaStatusHtml = `<div class="alert alert-info mt-2 p-2"><i class="fas fa-check-double me-2"></i> تم الانتهاء من دورة المراجعة الحالية.</div>`;
        }

        progressContainer.innerHTML += `
            <div class="progress-section mb-4">
                <div class="progress-title mb-2 d-flex justify-content-between">
                    <span class="text-info"><i class="fas fa-redo-alt me-1"></i> مسار المراجعة</span>
                    <small class="text-muted">${murajaaProgress} من ${murajaaTotal}</small>
                </div>
                <div class="progress" style="height: 25px;">
                    <div class="progress-bar bg-info" role="progressbar" style="width: ${murajaaPercent}%;" aria-valuenow="${murajaaPercent}" aria-valuemin="0" aria-valuemax="100">
                        ${murajaaPercent}%
                    </div>
                </div>
                ${murajaaStatusHtml}
            </div>
        `;
    }
}


// دالة عرض المهام الإضافية (مُحسَّنة: شكل البطاقات)
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

    const getTaskDbIndex = (task) => {
        return studentTasksInDb.findIndex(t =>
            t.description === task.description &&
            t.points_value === (task.points || task.points_value) &&
            t.status === task.status &&
            !t.task_type.includes('تسلسلي')
        );
    };

    taskList.forEach((task) => {
        let cardClass = 'manual-card';
        let iconHtml = '';
        let actionButton = '';
        const displayPoints = task.points || task.points_value; 
        const dbIndex = getTaskDbIndex(task);

        if (dbIndex === -1) return; 

        if (task.task_type === "يدوي") {
            iconHtml = '<i class="fas fa-medal text-warning me-2"></i>';
        } else if (task.task_type === "من البنك") {
            iconHtml = '<i class="fas fa-layer-group text-primary me-2"></i>';
        }

        if (task.status === "claimed") {
            cardClass += ' claimed-card';
            actionButton = `
                <button class="btn btn-sm btn-warning me-2" disabled><i class="fas fa-hourglass-half"></i> قيد المراجعة</button>
                <button class="btn btn-sm btn-danger" onclick="processTaskUndo(${dbIndex})"><i class="fas fa-times"></i> إلغاء المطالبة</button>
            `;
        } else if (task.status === "pending") {
            // زر إنجاز المهام اليدوية
            actionButton = `<button class="btn btn-sm btn-success" onclick="processTaskClaim(${dbIndex})"><i class="fas fa-check-double"></i> أرسل للإنجاز</button>`;
        }
        
        let releaseInfo = '';
        if (task.release_date || task.release_time) {
            const date = task.release_date || 'غير محدد';
            const time = task.release_time || 'غير محدد';
            releaseInfo = `<small class="text-secondary ms-3"><i class="far fa-clock"></i> الظهور: ${date} ${time}</small>`;
        }


        const taskElement = document.createElement('div');
        taskElement.className = `task-card ${cardClass}`;

        taskElement.innerHTML = `
            <div class="card-header-custom">
                <span class="task-title">${iconHtml} ${task.description}</span>
                <span class="task-points badge bg-dark text-white">+${displayPoints} نقطة</span>
            </div>
            <div class="d-flex justify-content-between align-items-center flex-wrap">
                <div class="task-details">
                    <small class="text-muted"><i class="fas fa-tag"></i> النوع: ${task.task_type}</small>
                    ${releaseInfo}
                </div>
                <div class="task-actions mt-2 mt-sm-0">
                    ${actionButton}
                </div>
            </div>
        `;
        tasksContainer.appendChild(taskElement);
    });
}


// دالة عرض لوحة الشرف (مُعدَّلة لاستخدام حاوية الـ index الجديدة)
function renderLeaderboard(isMini = false) {
    const container = document.getElementById('leaderboard-container'); // للمعلم
    const miniContainer = document.getElementById('leaderboard-container-mini'); // للطالب
    
    // تحديد الحاويات المستهدفة
    const targets = [];
    if (!isMini && container) targets.push(container);
    if (isMini && miniContainer) targets.push(miniContainer);
    if (targets.length === 0) return;

    // تجهيز البيانات
    const studentsArray = Object.values(allStudentsData)
        .map(data => ({
            name: data.student_name,
            score: data.score || 0
        }));

    studentsArray.sort((a, b) => b.score - a.score);

    const studentsToShow = isMini ? studentsArray.slice(0, 3) : studentsArray; // عرض أفضل 3 للطالب
    
    targets.forEach(target => {
        target.innerHTML = '';
        
        if (studentsToShow.length === 0) {
            target.innerHTML = `<div class="alert alert-warning m-0">لا توجد بيانات طلاب.</div>`;
            return;
        }

        studentsToShow.forEach((student, index) => {
            const rank = isMini ? index + 1 : studentsArray.findIndex(s => s.name === student.name && s.score === student.score) + 1;
            
            let icon = '';
            if (rank === 1) icon = '<i class="fas fa-trophy text-warning me-2"></i>';
            else if (rank === 2) icon = '<i class="fas fa-trophy text-secondary me-2"></i>';
            else if (rank === 3) icon = '<i class="fas fa-trophy text-danger me-2"></i>';
            else icon = `<span class="badge bg-light text-secondary me-2">${rank}</span>`;

            const item = document.createElement('div');
            item.className = 'list-group-item d-flex justify-content-between align-items-center';
            item.innerHTML = `
                <span>${icon} ${student.name}</span>
                <span class="badge bg-primary rounded-pill">${student.score} نقطة</span>
            `;
            target.appendChild(item);
        });
    });
}


// (بقية الدوال: claimCurriculumTask, processTaskClaim, processTaskUndo, approveTask, rejectTask, 
// showTeacherDashboard, handleAddNewStudent, handleAddCurriculumTask, updateCurriculumStatusDisplay, 
// handleAddBankTask, deleteBankTask, renderBankTasks, populateBulkTaskSelect, 
// populateBulkStudentSelect, handleAddTask, handleAddBulkTask)

// ... (تُوضع هنا باقي دوال المعلم من الكود السابق، لا تغيير عليها) ...
function showTeacherDashboard() {
    if (typeof showTeacherScreen === 'function') showTeacherScreen();
    
    // ربط النماذج بـ Handlers
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
    
    const addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
        addTaskForm.removeEventListener('submit', handleAddTask);
        addTaskForm.addEventListener('submit', handleAddTask);
    }
    const addBulkTaskForm = document.getElementById('add-bulk-task-form');
    if (addBulkTaskForm) {
        addBulkTaskForm.removeEventListener('submit', handleAddBulkTask);
        addBulkTaskForm.addEventListener('submit', handleAddBulkTask);
    }


    renderTeacherReviewList();
    renderLeaderboard(false); // لوحة المعلم الكاملة
    updateCurriculumStatusDisplay();
    renderBankTasks(); 
    populateBulkTaskSelect();
    populateBulkStudentSelect();
}

function renderTeacherReviewList() {
    const container = document.getElementById('review-tasks-container');
    const countSpan = document.getElementById('review-count');
    container.innerHTML = '';
    let reviewCount = 0;
    
    Object.values(allStudentsData).forEach(student => {
        const tasks = student.tasks || [];
        tasks.forEach((task, index) => {
            if (task.status === 'claimed') {
                reviewCount++;
                const item = document.createElement('div');
                item.className = 'list-group-item d-flex justify-content-between align-items-center mb-2';
                
                const displayPoints = task.points_value || task.points;

                item.innerHTML = `
                    <div>
                        <p class="mb-1 fw-bold">${task.description} (${displayPoints} نقطة)</p>
                        <small class="text-primary">الطالب: ${student.student_name} (${student.id})</small>
                        <small class="d-block text-muted">النوع: ${task.task_type}</small>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-success btn-sm" onclick="approveTask('${student.id}', ${index})">
                            <i class="fas fa-check"></i> قبول
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="rejectTask('${student.id}', ${index})">
                            <i class="fas fa-times"></i> رفض
                        </button>
                    </div>
                `;
                container.appendChild(item);
            }
        });
    });

    countSpan.innerText = reviewCount;
    if (reviewCount === 0) {
        container.innerHTML = '<div class="alert alert-success m-0">لا توجد مهام تنتظر المراجعة.</div>';
    }
}


async function handleAddNewStudent(e) {
    e.preventDefault();

    const studentId = document.getElementById('new-student-id').value.trim();
    const studentName = document.getElementById('new-student-name').value.trim();
    const initialHifz = parseInt(document.getElementById('initial-hifz-progress').value) || 0;
    const initialMurajaa = parseInt(document.getElementById('initial-murajaa-progress').value) || 0;
    
    if (!studentId || !studentName) {
        alert("الرجاء إدخال الرمز والاسم.");
        return;
    }
    if (allStudentsData[studentId]) {
        alert("هذا الرمز موجود بالفعل.");
        return;
    }

    const newStudentData = {
        student_name: studentName,
        score: 0,
        hifz_progress: initialHifz,
        murajaa_progress: initialMurajaa,
        tasks: [],
    };

    try {
        await db.collection('tasks').doc(studentId).set(newStudentData);

        alert(`🎉 تم إضافة الطالب ${studentName} (${studentId}) بنجاح!`);
        e.target.reset();

        await loadAllStudentsData();
        populateBulkStudentSelect();

    } catch (error) {
        console.error("خطأ في إضافة الطالب:", error);
        alert("فشل إضافة الطالب. تأكد من أن قواعد الأمان تسمح بالكتابة.");
    }
}

async function handleAddCurriculumTask(e) {
    e.preventDefault();
    
    const description = document.getElementById('curriculum-description').value.trim();
    const type = document.getElementById('curriculum-type-select').value.trim();
    
    if (!description || !type) {
        alert("الرجاء ملء جميع حقول المنهج بشكل صحيح.");
        return;
    }
    
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
            try {
                // إذا لم تكن الوثيقة موجودة، قم بإنشائها
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
        await db.collection('Settings').doc('TaskBank_Regular').set({
            tasks: firebase.firestore.FieldValue.arrayUnion(newTask)
        }, { merge: true });

        alert(`تم إضافة المهمة "${description}" إلى البنك العادي (1 نقطة).`);
        e.target.reset();
        await loadTaskBank();
        renderBankTasks();
        populateBulkTaskSelect();

    } catch (error) {
        console.error("خطأ في إضافة المهمة لبنك المهام العادي:", error);
        alert("فشل إضافة المهمة لبنك المهام العادي.");
    }
}

async function deleteBankTask(taskId) {
    if (!confirm("هل أنت متأكد من حذف هذه المهمة من بنك المهام الجاهزة؟")) return;

    const taskToRemove = taskBank.find(t => t.id === taskId);
    if (!taskToRemove) return;

    try {
        await db.collection('Settings').doc('TaskBank_Regular').update({
            tasks: firebase.firestore.FieldValue.arrayRemove(taskToRemove)
        });

        alert(`تم حذف المهمة بنجاح.`);
        await loadTaskBank();
        renderBankTasks();
        populateBulkTaskSelect();
    } catch (error) {
        console.error("خطأ في حذف المهمة من بنك المهام العادي:", error);
        alert("فشل حذف المهمة من بنك المهام العادي.");
    }
}

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
    if (!select) return; 
    select.innerHTML = '<option value="">اختر المهمة...</option>';

    taskBank.forEach((task) => { 
        const option = document.createElement('option');
        option.value = JSON.stringify({ description: task.description, points: task.points, type: "من البنك" });
        option.textContent = `${task.description} (${task.points} نقطة)`;
        select.appendChild(option);
    });
}

function populateBulkStudentSelect() {
    const select = document.getElementById('bulk-student-select');
    if (!select) return; 
    select.innerHTML = '';
    
    Object.values(allStudentsData).forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.student_name} (${student.id})`;
        select.appendChild(option);
    });
}

async function handleAddTask(e) {
    e.preventDefault();
    const studentId = document.getElementById('new-task-student-id').value.trim();
    const description = document.getElementById('new-task-description').value.trim();
    const points = MANUAL_TASK_POINTS;
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
}

async function handleAddBulkTask(e) {
    e.preventDefault();

    const selectedTaskValue = document.getElementById('bulk-task-select').value;
    const selectedStudentIds = Array.from(document.getElementById('bulk-student-select').selectedOptions).map(option => option.value);
    const date = document.getElementById('bulk-task-date').value;
    const time = document.getElementById('bulk-task-time').value;

    if (!selectedTaskValue || selectedStudentIds.length === 0) {
        alert("الرجاء اختيار مهمة واحدة على الأقل وطالب واحد على الأقل.");
        return;
    }

    let taskData;
    try {
        taskData = JSON.parse(selectedTaskValue);
    } catch (e) {
        console.error("خطأ في تحليل بيانات المهمة من البنك:", e);
        alert("حدث خطأ عند اختيار المهمة من البنك.");
        return;
    }

    const taskDetails = {
        description: taskData.description,
        points_value: taskData.points, 
        release_date: date,
        release_time: time,
        task_type: "من البنك",
        status: "pending"
    };

    try {
        const batch = db.batch();
        let successfulAdds = 0;

        for (const studentId of selectedStudentIds) {
            if (allStudentsData[studentId]) { 
                const studentRef = db.collection('tasks').doc(studentId);
                batch.update(studentRef, {
                    tasks: firebase.firestore.FieldValue.arrayUnion(taskDetails)
                });
                successfulAdds++;
            } else {
                console.warn(`تجاهل الطالب ${studentId}: غير موجود.`);
            }
        }

        if (successfulAdds > 0) {
            await batch.commit();
            alert(`تم إضافة المهمة "${taskData.description}" لـ ${successfulAdds} طلاب بنجاح.`);
            e.target.reset();
            await loadAllStudentsData(); 
            renderTeacherReviewList(); 
            if (currentStudentId && selectedStudentIds.includes(currentStudentId)) {
                loadStudentData(currentStudentId);
            }
        } else {
            alert("لم يتم إضافة المهمة لأي طالب. تأكد من أن الطلاب المختارين موجودون.");
        }

    } catch (error) {
        console.error("خطأ في إضافة المهمة الجماعية:", error);
        alert("فشل إضافة المهام الجماعية. تحقق من قواعد الأمان (Security Rules) ووجود الطلاب.");
    }
}


// دوال تعديل حالة المهمة (لا تغيير)
async function claimCurriculumTask(type, taskIdentifier, points, description) {
    if (!currentStudentId) return alert("خطأ: لا يوجد رمز طالب نشط.");

    const studentData = allStudentsData[currentStudentId];

    let expectedIndex = 0;
    if (type === 'Hifz') {
        expectedIndex = studentData.hifz_progress || 0;
    } else if (type === 'Murajaa') {
        expectedIndex = studentData.murajaa_progress || 0;
    }

    if (taskIdentifier !== expectedIndex) {
         alert("هذه ليست المهمة التسلسلية التالية المطلوبة. يرجى إكمال المهمة السابقة.");
         return;
    } 
    const isClaimed = studentData.tasks.some(t =>
        t.curriculum_id === taskIdentifier &&
        t.status === "claimed" &&
        t.task_type === `${type} تسلسلي`
    );
     if (isClaimed) {
         alert("هذه المهمة قيد المراجعة بالفعل.");
         return;
    }


    const taskDetails = {
        description: description,
        points_value: points,
        task_type: `${type} تسلسلي`,
        curriculum_id: taskIdentifier, 
        status: "claimed",
        claimed_date: new Date().toISOString()
    };

    try {
        await db.collection('tasks').doc(currentStudentId).update({
            tasks: firebase.firestore.FieldValue.arrayUnion(taskDetails)
        });

        await loadAllStudentsData();
        await loadCurriculumLists();
        loadStudentData(currentStudentId);
        alert("تم إرسال المهمة للمراجعة!");

    } catch (error) {
        console.error("خطأ في المطالبة بالمهمة التسلسلية:", error);
        alert("فشل إرسال المهمة. تحقق من قواعد الأمان (Security Rules).");
    }
}
async function processTaskClaim(taskIndex) {
    if (!currentStudentId) return;
    const studentData = allStudentsData[currentStudentId];
    if (!studentData || !studentData.tasks || taskIndex >= studentData.tasks.length) return;

    let updatedTasks = [...studentData.tasks];
    updatedTasks[taskIndex].status = "claimed";
    updatedTasks[taskIndex].claimed_date = new Date().toISOString();

    try {
        await db.collection('tasks').doc(currentStudentId).update({
            tasks: updatedTasks
        });

        await loadAllStudentsData();
        loadStudentData(currentStudentId);
        alert("تم إرسال المهمة للمراجعة!");

    } catch (error) {
        console.error("خطأ في المطالبة بالمهمة اليدوية:", error);
        alert("فشل إرسال المهمة. تأكد من إعداد Firestore.");
    }
}
async function processTaskUndo(taskIndex) {
    if (!currentStudentId) return;
    const studentData = allStudentsData[currentStudentId];
    if (!studentData || !studentData.tasks || taskIndex >= studentData.tasks.length) return;
    
    if (!confirm("هل أنت متأكد من إلغاء هذه المهمة؟ سيتم حذفها من قائمة مهامك.")) {
        return;
    }

    const removedTaskDescription = studentData.tasks[taskIndex].description;
    
    let updatedTasks = studentData.tasks.filter((_, index) => index !== taskIndex); 

    try {
        await db.collection('tasks').doc(currentStudentId).update({
            tasks: updatedTasks
        });
        
        await loadAllStudentsData(); 
        loadStudentData(currentStudentId); 
        alert(`تم حذف المهمة "${removedTaskDescription}" بنجاح.`);
        
    } catch (error) {
        console.error("خطأ في حذف المهمة عند الإلغاء:", error);
        alert("فشل حذف المهمة.");
    }
}
async function approveTask(studentId, taskIndex) {
    const studentData = allStudentsData[studentId];
    if (!studentData || !studentData.tasks || taskIndex >= studentData.tasks.length) return;
    
    const task = studentData.tasks[taskIndex];
    if (task.status !== "claimed") return;

    let updatedTasks = [...studentData.tasks];
    updatedTasks[taskIndex].status = "approved";
    updatedTasks[taskIndex].approved_date = new Date().toISOString();

    let scoreIncrease = task.points_value || task.points; 
    let newScore = (studentData.score || 0) + scoreIncrease;
    let hifz_progress = studentData.hifz_progress || 0;
    let murajaa_progress = studentData.murajaa_progress || 0;
    
    if (task.task_type === "Hifz تسلسلي") {
        hifz_progress++;
    } else if (task.task_type === "Murajaa تسلسلي") {
        murajaa_progress++;
    }

    try {
        const batch = db.batch();
        
        const studentRef = db.collection('tasks').doc(studentId);
        batch.update(studentRef, {
            score: newScore,
            tasks: updatedTasks,
            hifz_progress: hifz_progress,
            murajaa_progress: murajaa_progress
        });
        
        await batch.commit();

        await loadAllStudentsData();
        showTeacherDashboard();
        
    } catch (error) {
        console.error("خطأ في الموافقة على المهمة:", error);
        alert("فشل في الموافقة على المهمة.");
    }
}
async function rejectTask(studentId, taskIndex) {
    if (!confirm("هل أنت متأكد من رفض المهمة؟ سيتم حذفها من قائمة الطالب.")) return;

    const studentData = allStudentsData[studentId];
    if (!studentData || !studentData.tasks || taskIndex >= studentData.tasks.length) return;

    const rejectedTaskDescription = studentData.tasks[taskIndex].description;
    let updatedTasks = studentData.tasks.filter((_, index) => index !== taskIndex);
    
    try {
        await db.collection('tasks').doc(studentId).update({
            tasks: updatedTasks
        });

        await loadAllStudentsData();
        showTeacherDashboard();
        alert(`تم رفض وحذف المهمة "${rejectedTaskDescription}" بنجاح.`);
        
    } catch (error) {
        console.error("خطأ في رفض المهمة:", error);
        alert("فشل في رفض المهمة.");
    }
}
