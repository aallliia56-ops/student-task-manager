// //////////////////////////////////////////////////////
// ملف app.js النهائي والمُصحح: يشمل نظام اللوب وواجهة المعلم كاملة.
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

const taskBank = [
    { id: 1, description: "كتابة تقرير تلخيصي عن الدرس", points: 15, type: "تقرير" },
    { id: 2, description: "تصميم لوحة إعلانية للبرنامج", points: 20, type: "تصميم" },
    { id: 3, description: "مراجعة 5 آيات من سورة البقرة", points: 10, type: "مراجعة" },
    { id: 4, description: "مكافأة اجتهاد (تُمنح يدوياً)", points: 5, type: "مكافأة" }
];


// --- 2. دالة معالجة تسجيل الدخول (الطالب والمعلم) ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputId = document.getElementById('student-id').value.trim();
        
        // 🔑 تحميل البيانات الأساسية قبل القرار
        await loadAllStudentsData(); 
        await loadCurriculumLists(); 

        if (inputId === TEACHER_CODE) {
            showTeacherDashboard();
        } else if (inputId.match(/^\d+$/) && allStudentsData[inputId]) { 
            loadStudentData(inputId);
        } else {
            alert("الرجاء إدخال رمز صحيح (طالب أو معلم).");
        }
    });
}


// --- 3. دالة جلب كل البيانات من مجموعة tasks و Curriculum ---
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


// --- 4. دالة تحديد المهام النشطة للطالب (تفعيل اللوب) ---
function getCurrentCurriculumTasks(studentData) {
    const activeTasks = [];
    const studentTasks = studentData.tasks || [];

    // Hifz (المنطق التسلسلي العادي)
    const hifzIndex = studentData.hifz_progress || 0;
    const nextHifzTask = curriculumLists.Hifz[hifzIndex];
    if (nextHifzTask) {
        const isHifzActive = studentTasks.some(t => t.curriculum_id === nextHifzTask.curriculum_id && t.status === "claimed" && t.task_type === "Hifz تسلسلي");
        if (!isHifzActive) {
            activeTasks.push({ ...nextHifzTask, is_curriculum_task: true, curriculum_type: 'Hifz' });
        }
    }

    // Murajaa (النظام الدوري/اللوب)
    const murajaaList = curriculumLists.Murajaa || [];
    const murajaaTotal = murajaaList.length;
    
    if (murajaaTotal > 0) {
        // نستخدم عامل % (Modulo) لضمان العودة إلى الفهرس 0
        const murajaaIndex = (studentData.murajaa_progress || 0) % murajaaTotal; 
        const nextMurajaaTask = murajaaList[murajaaIndex];
        
        if (nextMurajaaTask) {
            const isMurajaaActive = studentTasks.some(t => 
                t.curriculum_id === nextMurajaaTask.curriculum_id && 
                t.status === "claimed" && 
                t.task_type === "Murajaa تسلسلي" 
            );
            
            if (!isMurajaaActive) {
                // إضافة قائمة المراجعة المخصصة للطالب كجزء من الوصف
                const murajaaPool = studentData.murajaa_pool || [];
                const poolDescription = murajaaPool.slice(0, 5).join(', ') + (murajaaPool.length > 5 ? '... والمزيد.' : '');
                
                // تعديل: لا نغير الوصف الأصلي في القائمة المركزية
                const taskWithPool = { ...nextMurajaaTask };
                taskWithPool.description = `${taskWithPool.description} - (راجع: ${poolDescription || 'لا يوجد سور/أجزاء محددة حاليًا.'})`;

                activeTasks.push({ ...taskWithPool, is_curriculum_task: true, curriculum_type: 'Murajaa' });
            }
        }
    }
    
    // دمج المهام
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
                <small class="text-muted">النوع: ${task.task_type}</small>
                <div class="task-actions">
                    ${actionButton}
                </div>
            </div>
        `;
        tasksContainer.appendChild(taskElement);
    });
}

// دالة المطالبة بالإنجاز لمهمة يدوية (Pending -> Claimed)
async function processTaskClaim(taskIndex) {
    if (!currentStudentId) return;

    const docRef = db.collection("tasks").doc(currentStudentId); 
    let studentData = allStudentsData[currentStudentId]; 
    studentData.tasks[taskIndex].status = "claimed";
    
    try {
        await docRef.update({ tasks: studentData.tasks }); 
        alert("تم إرسال المهمة للمراجعة!");
        await loadAllStudentsData();
        loadStudentData(currentStudentId); 
    } catch (e) {
        console.error("فشل المطالبة بالمهمة اليدوية.", e); 
    }
}

// دالة إلغاء المطالبة بمهمة يدوية (Claimed -> Pending)
async function processTaskUndo(taskIndex) {
    if (!currentStudentId) return;

    const docRef = db.collection("tasks").doc(currentStudentId); 
    let studentData = allStudentsData[currentStudentId]; 
    studentData.tasks[taskIndex].status = "pending";
    
    try {
        await docRef.update({ tasks: studentData.tasks }); 
        alert("تم إلغاء المطالبة بالرجوع للمهمة.");
        await loadAllStudentsData();
        loadStudentData(currentStudentId); 
    } catch (e) {
        console.error("فشل إلغاء المطالبة بالمهمة اليدوية.", e); 
    }
}

// --- دالة إنجاز مهمة تسلسلية (Claim Curriculum Task) ---
async function claimCurriculumTask(curriculumType, curriculumId, pointsValue, description) {
    if (!currentStudentId) return;

    const docRef = db.collection("tasks").doc(currentStudentId); 
    let studentData = allStudentsData[currentStudentId]; 

    const existingTasksArray = studentData.tasks || [];
    const existingIndex = existingTasksArray.findIndex(t => 
        t.curriculum_id === curriculumId && 
        t.task_type === `${curriculumType} تسلسلي`
    );

    let claimSuccessful = false;

    const now = new Date();
    const taskDetails = {
        description: description.replace(/ - \(راجع:.+\)/, ''), // إزالة جزء الـ pool من الوصف قبل الحفظ
        points_value: pointsValue,
        release_date: now.toISOString().split('T')[0], 
        release_time: now.toTimeString().split(' ')[0].substring(0, 5),
        task_type: `${curriculumType} تسلسلي`,
        curriculum_id: curriculumId, 
        status: "claimed" 
    };
    
    // إذا كانت موجودة (للمراجعة الدورية حيث يتم إعادة استخدام الـ ID)
    if (existingIndex !== -1) {
        // تأكد من تحديث المهمة الحالية في سجل الطالب
        studentData.tasks[existingIndex] = taskDetails; 
        try {
            await docRef.update({ tasks: studentData.tasks }); 
            claimSuccessful = true;
        } catch (e) {
            console.error("CRITICAL FAILURE: Curriculum Task Update Failed.", e); 
        }

    } else {
        // إضافة المهمة لأول مرة (للحفظ التسلسلي)
        try {
            await docRef.update({ 
                tasks: firebase.firestore.FieldValue.arrayUnion(taskDetails) 
            }); 
            // تحديث محلي سريع (لضمان عمل loadStudentData التالي)
            allStudentsData[currentStudentId].tasks = allStudentsData[currentStudentId].tasks || [];
            allStudentsData[currentStudentId].tasks.push(taskDetails);
            claimSuccessful = true;
        } catch (e) {
             console.error("CRITICAL FAILURE: Curriculum Task Insert Failed.", e); 
        }
    }
    
    if (claimSuccessful) {
        alert("تم إرسال المهمة للمراجعة!");
        loadStudentData(currentStudentId);
    } else {
        alert("فشل تحديث الإنجاز للمهمة التسلسلية.");
    }
}


// --- دالة منح النقاط وتأكيد الموافقة (مع منطق اللوب وتحديث الـ pool) ---
async function approveTask(studentId, taskIndex, pointsValue) {
    const docRef = db.collection("tasks").doc(studentId);
    let studentData = allStudentsData[studentId];
    let task = studentData.tasks[taskIndex];
    
    const isCurriculumTask = task.curriculum_id !== undefined;
    studentData.tasks[taskIndex].status = "approved";
    
    const currentScore = studentData.score || 0;
    const newScore = currentScore + pointsValue;
    
    const updates = {
        tasks: studentData.tasks,
        score: newScore
    };

    if (isCurriculumTask) {
        if (task.task_type === "Hifz تسلسلي") {
            updates.hifz_progress = firebase.firestore.FieldValue.increment(1);
            
            // 🔑 إضافة المهمة المنجزة إلى قائمة المراجعة للطالب
            const newMurajaaItem = task.description; 
            updates.murajaa_pool = firebase.firestore.FieldValue.arrayUnion(newMurajaaItem); 
            
        } else if (task.task_type === "Murajaa تسلسلي") {
            updates.murajaa_progress = firebase.firestore.FieldValue.increment(1);
            
            // 🔑 حذف أول عنصر من قائمة murajaa_pool بعد المراجعة
            const murajaaPool = studentData.murajaa_pool || [];
            if (murajaaPool.length > 0) {
                 // استخدام slice(1) للحصول على القائمة بدون العنصر الأول
                 updates.murajaa_pool = murajaaPool.slice(1);
            }
        }
    }
    
    try {
        await docRef.update(updates);

        // تحديث البيانات المحلية (مهم جداً للوحة المعلم)
        await loadAllStudentsData();
        await loadCurriculumLists(); 
        
        alert(`تم منح ${pointsValue} نقاط للطالب ${studentId} وتم تحميل المهمة التسلسلية التالية.`);
        
        renderTeacherReviewList();
        renderLeaderboard();
        
    } catch (e) {
        console.error("خطأ في منح النقاط وتأكيد المهمة: ", e);
    }
}


// --- 6. دوال المعلم (Teacher Dashboard) ---

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

    // عرض اللوحات
    renderTeacherReviewList(); 
    renderLeaderboard();
    updateCurriculumStatusDisplay(); 
    populateBulkTaskSelect(); // تعبئة قائمة المهام الجاهزة
    populateBulkStudentSelect(); // تعبئة قائمة الطلاب
}

// دالة عرض المهام التي تنتظر المراجعة
function renderTeacherReviewList() {
    const reviewContainer = document.getElementById('review-tasks-container');
    const reviewCountBadge = document.getElementById('review-count');
    if (!reviewContainer || !reviewCountBadge) return;

    reviewContainer.innerHTML = '';
    let pendingCount = 0;

    Object.values(allStudentsData).forEach(student => {
        const studentId = student.id;
        const studentName = student.student_name;
        
        student.tasks.forEach((task, index) => {
            if (task.status === "claimed") {
                pendingCount++;
                const taskElement = document.createElement('div');
                taskElement.className = 'list-group-item d-flex justify-content-between align-items-center';
                
                taskElement.innerHTML = `
                    <div>
                        <span class="fw-bold text-danger">${studentName} (${studentId})</span>
                        <br>
                        <small>${task.description} (${task.points_value} نقطة)</small>
                    </div>
                    <div>
                        <button class="btn btn-success btn-sm me-2" onclick="approveTask('${studentId}', ${index}, ${task.points_value})">
                            <i class="fas fa-check"></i> قبول
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="rejectTask('${studentId}', ${index})">
                            <i class="fas fa-times"></i> رفض
                        </button>
                    </div>
                `;
                reviewContainer.appendChild(taskElement);
            }
        });
    });

    reviewCountBadge.innerText = pendingCount;

    if (pendingCount === 0) {
        reviewContainer.innerHTML = '<div class="alert alert-light text-center m-0">لا توجد مهام تنتظر المراجعة حاليًا.</div>';
    }
}

// دالة رفض المهمة وإعادتها إلى pending
async function rejectTask(studentId, taskIndex) {
    if (!confirm("هل أنت متأكد من رفض المهمة؟ سيتم إعادتها للطالب ليقوم بإنجازها مرة أخرى.")) return;

    const docRef = db.collection("tasks").doc(studentId);
    let studentData = allStudentsData[studentId];
    
    // إعادة الحالة إلى pending
    studentData.tasks[taskIndex].status = "pending";
    
    try {
        await docRef.update({ tasks: studentData.tasks });
        
        // تحديث البيانات المحلية وإعادة العرض
        await loadAllStudentsData();
        renderTeacherReviewList();
        
        alert(`تم رفض المهمة وإعادتها للطالب ${studentId}.`);
    } catch (e) {
        console.error("خطأ في رفض المهمة: ", e);
    }
}

// دالة عرض لوحة الشرف
function renderLeaderboard() {
    const leaderboardContainer = document.getElementById('leaderboard-container');
    if (!leaderboardContainer) return;
    
    leaderboardContainer.innerHTML = '';
    
    const studentsArray = Object.values(allStudentsData).map(data => ({
        id: data.id,
        name: data.student_name,
        score: data.score || 0
    }));

    // فرز الطلاب تنازليًا حسب النقاط
    studentsArray.sort((a, b) => b.score - a.score);

    // عرض أعلى 5
    studentsArray.slice(0, 5).forEach((student, index) => {
        const rank = index + 1;
        let rankIcon = '';
        // يمكن تعديل الأيقونات والألوان حسب الرغبة
        if (rank === 1) rankIcon = '<i class="fas fa-medal text-warning me-2"></i>';
        else if (rank === 2) rankIcon = '<i class="fas fa-medal text-secondary me-2"></i>';
        else if (rank === 3) rankIcon = '<i class="fas fa-medal me-2" style="color:#cd7f32;"></i>'; // برونزي
        else rankIcon = `<span class="me-2">${rank}.</span>`;

        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <div>${rankIcon} ${student.name}</div>
            <span class="badge bg-primary rounded-pill">${student.score} نقطة</span>
        `;
        leaderboardContainer.appendChild(item);
    });
}

// --- دالة إضافة طالب جديد (تعبئة الـ pool وسجل الإنجاز) ---
async function handleAddNewStudent(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('new-student-id').value.trim();
    const studentName = document.getElementById('new-student-name').value.trim();
    const hifzProgress = parseInt(document.getElementById('initial-hifz-progress').value.trim());
    const murajaaProgress = parseInt(document.getElementById('initial-murajaa-progress').value.trim());
    
    if (!studentId || !studentName || isNaN(hifzProgress) || isNaN(murajaaProgress)) {
        alert("الرجاء ملء جميع الحقول بشكل صحيح.");
        return;
    }
    
    if (allStudentsData[studentId]) {
        alert(`رمز الطالب ${studentId} مستخدم بالفعل.`);
        return;
    }
    
    // 🔑 التحقق من أن القوائم تم تحميلها
    if (curriculumLists.Hifz.length === 0 || curriculumLists.Murajaa.length === 0) {
        alert("فشل في تحميل المنهج المركزي. يرجى التأكد من تشغيل الدوال التنفيذية في الـ Console أولاً (seedHifzCurriculum() و updateAndReverseMurajaaCurriculum()).");
        return;
    }
    
    if (hifzProgress > curriculumLists.Hifz.length) {
         alert("خطأ: مؤشر تقدم الحفظ يتجاوز عدد المهام المتاحة في المنهج المركزي.");
         return;
    }
    
    let completedTasks = [];
    let initialScore = 0;
    let initialMurajaaPool = [];
    
    // أ. بناء سجل مهام الحفظ المنجزة
    for (let i = 0; i < hifzProgress; i++) {
        const task = curriculumLists.Hifz[i];
        if (task) {
            initialScore += task.points_value;
            initialMurajaaPool.push(task.description); 
            completedTasks.push({
                description: task.description, 
                points_value: task.points_value, 
                task_type: "Hifz تسلسلي",
                curriculum_id: task.curriculum_id,
                status: "approved" 
            });
        }
    }
    
    // ب. بناء سجل مهام المراجعة المنجزة 
    for (let i = 0; i < murajaaProgress; i++) {
        const task = curriculumLists.Murajaa[i];
        if (task) {
            initialScore += task.points_value;
            completedTasks.push({
                description: task.description, 
                points_value: task.points_value, 
                task_type: "Murajaa تسلسلي",
                curriculum_id: task.curriculum_id,
                status: "approved"
            });
        }
    }
    
    // 2. بناء وثيقة الطالب
    const newStudentData = {
        id: studentId,
        student_name: studentName,
        score: initialScore, 
        tasks: completedTasks,
        hifz_progress: hifzProgress,
        murajaa_progress: murajaaProgress,
        murajaa_pool: initialMurajaaPool 
    };
    
    // 3. إرسال إلى Firebase
    try {
        await db.collection('tasks').doc(studentId).set(newStudentData);
        
        allStudentsData[studentId] = newStudentData;
        
        alert(`تم إضافة الطالب "${studentName}" بنجاح.`);
        
        e.target.reset(); 
        showTeacherDashboard(); 
        
    } catch (error) {
        console.error("خطأ في إضافة الطالب الجديد:", error);
        alert(`فشل إضافة الطالب إلى Firebase!`);
    }
}


// --- دالة إدارة المنهج المركزي (Curriculum Management) ---
async function handleAddCurriculumTask(e) {
    e.preventDefault();
    
    const description = document.getElementById('curriculum-description').value.trim();
    const pointsValue = parseInt(document.getElementById('curriculum-points').value.trim());
    const type = document.getElementById('curriculum-type-select').value.trim();
    
    if (!description || isNaN(pointsValue) || !type) {
        alert("الرجاء ملء جميع حقول المنهج بشكل صحيح.");
        return;
    }
    
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
        
        // استخدام arrayUnion لإضافة العنصر للقائمة الموجودة
        await curriculumDocRef.update({
            tasks_list: firebase.firestore.FieldValue.arrayUnion(newTask)
        });
        
        // التحديث المحلي
        currentList.push(newTask);
        alert(`تم إضافة المهمة بنجاح إلى مسار ${type}. أصبحت المهمة رقم ${nextCurriculumId}.`);
        
        e.target.reset(); 
        await loadCurriculumLists(); 
        updateCurriculumStatusDisplay(); 
        
    } catch (error) {
        // إذا لم يكن الوثيقة موجودة (code 'not-found' أو رسالة "No document to update")، نقوم بإنشائها
        if (error.code === 'not-found' || error.message.includes('No document to update')) {
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
        } else {
            console.error("خطأ في إضافة مهمة المنهج:", error);
            alert(`فشل إضافة المهمة إلى Firebase!`);
        }
    }
}

function updateCurriculumStatusDisplay() {
    const statusElement = document.getElementById('curriculum-status');
    if (statusElement) {
        const hifzCount = curriculumLists.Hifz ? curriculumLists.Hifz.length : 0;
        const murajaaCount = curriculumLists.Murajaa ? curriculumLists.Murajaa.length : 0;
        
        statusElement.innerHTML = `
            <i class="fas fa-book-open text-success"></i> الحفظ: ${hifzCount} مهمة. 
            <i class="fas fa-redo-alt text-info"></i> المراجعة: ${murajaaCount} مهمة.
        `;
    }
}

function populateBulkTaskSelect() {
    const select = document.getElementById('bulk-task-select');
    select.innerHTML = '<option value="">اختر المهمة...</option>';

    taskBank.forEach((task, index) => {
        const option = document.createElement('option');
        option.value = index;
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

// ربط نموذج إضافة مهمة فردية
const addTaskForm = document.getElementById('add-task-form');
if (addTaskForm) {
    addTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const studentId = document.getElementById('new-task-student-id').value.trim();
        const description = document.getElementById('new-task-description').value.trim();
        const points = parseInt(document.getElementById('new-task-points').value.trim());
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
            alert(`تم إضافة المهمة اليدوية للطالب ${studentId} بنجاح.`);
            e.target.reset();
            // تحديث البيانات المحلية لإظهارها في لوحة المعلم
            await loadAllStudentsData();
        } catch (error) {
            console.error("خطأ في إضافة المهمة اليدوية:", error);
            alert("فشل إضافة المهمة اليدوية.");
        }
    });
}

// ربط نموذج إضافة مهمة جماعية (من بنك المهام)
const addBulkTaskForm = document.getElementById('add-bulk-task-form');
if (addBulkTaskForm) {
    addBulkTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const taskIndex = parseInt(document.getElementById('bulk-task-select').value);
        const selectedStudents = Array.from(document.getElementById('bulk-student-select').selectedOptions).map(option => option.value);
        const date = document.getElementById('bulk-task-date').value;
        const time = document.getElementById('bulk-task-time').value;

        if (isNaN(taskIndex) || selectedStudents.length === 0) {
            alert("الرجاء اختيار مهمة واحدة على الأقل وطالب واحد على الأقل.");
            return;
        }

        const taskTemplate = taskBank[taskIndex];
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

// //////////////////////////////////////////////////////
// 🔴 الدوال التنفيذية لملء قاعدة البيانات (Seed Scripts) 🔴
// *يجب تشغيل هاتين الدالتين في الـ Console بعد Hard Reload إذا كانت مجموعة Curriculum محذوفة.*
// //////////////////////////////////////////////////////

// --- الدالة 1: لإضافة مهام الحفظ بالكامل ---
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
        points_value: 10,
        task_type: "Hifz تسلسلي",
        curriculum_id: index
    }));

    try {
        await db.collection('Curriculum').doc('Hifz').set({
            tasks_list: finalHifzArray
        });
        
        curriculumLists.Hifz = finalHifzArray; 
        
        alert(`🎉 تم إضافة ${finalHifzArray.length} مهمة حفظ بنجاح إلى المنهج المركزي!`);
        
    } catch (e) {
        console.error("خطأ حاسم في إضافة المنهج المركزي للحفظ:", e);
        alert("فشل إضافة المنهج. تحقق من اتصال Firebase.");
    }
}


// --- الدالة 2: لتحديث وعكس مهام المراجعة ---
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
        points_value: 5, 
        task_type: "Murajaa تسلسلي",
        curriculum_id: index 
    }));
    
    try {
        await db.collection('Curriculum').doc('Murajaa').set({
            tasks_list: finalMurajaaArray
        });
        
        curriculumLists.Murajaa = finalMurajaaArray; 
        
        alert(`🎉 تم تحديث وعكس قائمة المراجعة بنجاح! الترتيب يبدأ الآن من: "الناس إلى البلد" كـ (ID: 0).`);
        
    } catch (e) {
        console.error("خطأ حاسم في تحديث المنهج المركزي للمراجعة:", e);
        alert("فشل تحديث المنهج. تحقق من اتصال Firebase.");
    }
}
