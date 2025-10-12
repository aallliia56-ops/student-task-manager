// //////////////////////////////////////////////////////
// ملف app.js النهائي: نظام التعاقب القائم على الإنجاز - نسخة مع إدارة الطلاب
// //////////////////////////////////////////////////////

// --- 0. الإعدادات الأولية وربط Firebase ---
const firebaseConfig = {
  // *** تذكير: يجب تغيير هذا الـ Config ببيانات مشروعك الفعلية ***
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

// قائمة مهام جاهزة مؤقتة (لنموذج الإضافة الجماعية)
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


// --- 3. دالة جلب كل البيانات من مجموعة tasks ---
async function loadAllStudentsData() {
    const tasksCollection = db.collection("tasks"); 
    const querySnapshot = await tasksCollection.get();

    allStudentsData = {}; 
    
    querySnapshot.forEach((doc) => {
        allStudentsData[doc.id] = {...doc.data(), id: doc.id}; 
    });
} 

// --- دالة جلب قوائم المنهج (Curriculum) ---
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


// --- 4. دالة تحديد المهام النشطة للطالب ---
function getCurrentCurriculumTasks(studentData) {
    const activeTasks = [];
    const studentTasks = studentData.tasks || [];

    // Hifz
    const hifzIndex = studentData.hifz_progress || 0;
    const nextHifzTask = curriculumLists.Hifz[hifzIndex];
    if (nextHifzTask) {
        const isHifzActive = studentTasks.some(t => t.curriculum_id === nextHifzTask.curriculum_id && t.status === "claimed");
        if (!isHifzActive) {
            activeTasks.push({ ...nextHifzTask, is_curriculum_task: true, curriculum_type: 'Hifz' });
        }
    }

    // Murajaa
    const murajaaIndex = studentData.murajaa_progress || 0;
    const nextMurajaaTask = curriculumLists.Murajaa[murajaaIndex];
    if (nextMurajaaTask) {
         const isMurajaaActive = studentTasks.some(t => t.curriculum_id === nextMurajaaTask.curriculum_id && t.status === "claimed");
        if (!isMurajaaActive) {
            activeTasks.push({ ...nextMurajaaTask, is_curriculum_task: true, curriculum_type: 'Murajaa' });
        }
    }
    
    // دمج المهام: المهام العادية (pending/claimed) + المهام النشطة من المنهج
    const pendingAndClaimedTasks = studentTasks.filter(t => t.status === "pending" || t.status === "claimed");
    const combinedTasks = pendingAndClaimedTasks.concat(activeTasks);

    return combinedTasks;
}

// --- 5. دالة عرض واجهة الطالب ---
async function loadStudentData(studentId) {
    currentStudentId = studentId;
    const studentData = allStudentsData[studentId];
    
    const combinedTasks = getCurrentCurriculumTasks(studentData);

    document.getElementById('student-info-name').innerText = `أهلاً بك، ${studentData.student_name}`;
    document.getElementById('student-info-score').innerText = `نقاطك الحالية: ${studentData.score || 0}`;

    // إضافة عرض المرتبة
    renderStudentRank();
    
    // إضافة عرض أشرطة التقدم
    renderProgressBars(studentData); 

    renderTasks(studentData, combinedTasks); 
    
    if (typeof showTasksScreen === 'function') {
        showTasksScreen(studentId);
    }
}


// --- عرض ترتيب الطالب (Rank) ---
function renderStudentRank() {
    const rankContainer = document.getElementById('student-rank-info');
    if (!rankContainer || !currentStudentId) return;
    
    const studentsArray = Object.values(allStudentsData).map(data => ({
        id: data.id,
        score: data.score || 0
    }));

    // فرز الطلاب تنازليًا حسب النقاط
    studentsArray.sort((a, b) => b.score - a.score);

    // البحث عن ترتيب الطالب الحالي
    const studentRank = studentsArray.findIndex(student => student.id === currentStudentId) + 1;

    if (studentRank > 0) {
        rankContainer.innerHTML = `<i class="fas fa-trophy text-warning"></i> مرتبتك: ${studentRank} من ${studentsArray.length}`;
    } else {
         rankContainer.innerHTML = `جاري تحديث المرتبة...`;
    }
}


// --- عرض أشرطة التقدم (Progress Bars) ---
function renderProgressBars(studentData) {
    const progressContainer = document.getElementById('progress-container');
    if (!progressContainer) return;
    
    progressContainer.innerHTML = '';
    
    // 1. مسار الحفظ (Hifz)
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
    
    // 2. مسار المراجعة (Murajaa)
    const murajaaTotal = curriculumLists.Murajaa.length;
    const murajaaProgress = studentData.murajaa_progress || 0;
    const murajaaPercent = murajaaTotal > 0 ? Math.floor((murajaaProgress / murajaaTotal) * 100) : 0;
    const nextMurajaa = curriculumLists.Murajaa[murajaaProgress];

    if (murajaaTotal > 0) {
         progressContainer.innerHTML += `
            <div class="progress-section mb-4">
                <div class="progress-title mb-2">
                    <i class="fas fa-redo-alt text-info"></i> مسار المراجعة: ${murajaaProgress} من ${murajaaTotal} مهمة مكتملة (${murajaaPercent}%)
                </div>
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar bg-info" role="progressbar" style="width: ${murajaaPercent}%;" aria-valuenow="${murajaaPercent}" aria-valuemin="0" aria-valuemax="100">
                         ${murajaaPercent}%
                    </div>
                </div>
                <small class="text-muted mt-2 d-block">المهمة التالية: ${nextMurajaa ? nextMurajaa.description : 'تم إكمال جميع مهام المراجعة! 🎉'}</small>
            </div>
        `;
    }
}


// --- 6. منطق عرض المهام (باستخدام تصميم البطاقات الجديد) ---
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
        
        // -------------------------------------------------------------
        // 1. التعامل مع المهام التسلسلية (Hifz/Murajaa)
        // -------------------------------------------------------------
        if (task.is_curriculum_task) {
            
            if (task.curriculum_type === 'Hifz') {
                cardClass = 'hifz-card';
                iconHtml = '<i class="fas fa-quran text-success me-2"></i>';
            } else if (task.curriculum_type === 'Murajaa') {
                cardClass = 'murajaa-card';
                iconHtml = '<i class="fas fa-redo-alt text-info me-2"></i>';
            }
            
            // تحقق من الحالة الحالية للمهمة التسلسلية 
            const activeInDb = studentTasksInDb.find(t => 
                t.curriculum_id === task.curriculum_id && t.status === "claimed"
            );

            if (activeInDb) {
                // حالة: قيد مراجعة المعلم
                cardClass += ' claimed-card';
                actionButton = `<button class="btn btn-warning btn-sm" disabled><i class="fas fa-hourglass-half"></i> قيد مراجعة المعلم</button>`;
            } else {
                // حالة: جاهزة للإنجاز
                actionButton = `<button class="btn btn-primary" onclick="claimCurriculumTask('${task.curriculum_type}', ${task.curriculum_id}, ${task.points_value}, '${task.description}')"><i class="fas fa-check"></i> تم الإنجاز</button>`;
            }

        } 
        // -------------------------------------------------------------
        // 2. التعامل مع المهام الخاصة (اليدوية/Pending/Claimed)
        // -------------------------------------------------------------
        else {
             // البحث عن Index المهمة في القائمة الأصلية studentTasksInDb (لأجل وظائف التراجع processTaskUndo)
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
                cardClass = 'manual-card';
                 actionButton = `<button class="btn btn-success" onclick="processTaskClaim(${originalIndex})"><i class="fas fa-check-double"></i> تم الإنجاز</button>`;
            }
        }
        
        // بناء البطاقة
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


// --- دالة إنجاز مهمة تسلسلية (Claim Curriculum Task) - مُعدَّلة لمنع التكرار ---
async function claimCurriculumTask(curriculumType, curriculumId, pointsValue, description) {
    if (!currentStudentId) return;

    const docRef = db.collection("tasks").doc(currentStudentId); 
    let studentData = allStudentsData[currentStudentId]; 

    // 1. البحث عن نسخة موجودة من هذه المهمة التسلسلية في مصفوفة مهام الطالب
    const existingTasksArray = studentData.tasks || [];
    const existingIndex = existingTasksArray.findIndex(t => 
        t.curriculum_id === curriculumId
    );

    let claimSuccessful = false;

    if (existingIndex !== -1) {
        // 2. تحديث حالة المهمة الموجودة إلى "claimed"
        studentData.tasks[existingIndex].status = "claimed";
        // تحديث تاريخ ووقت المطالبة
        studentData.tasks[existingIndex].release_date = new Date().toISOString().split('T')[0];
        studentData.tasks[existingIndex].release_time = new Date().toTimeString().split(' ')[0].substring(0, 5);
        
        try {
            await docRef.update({ tasks: studentData.tasks }); 
            claimSuccessful = true;
        } catch (e) {
            console.error("CRITICAL FAILURE: Curriculum Task Update Failed.", e); 
        }

    } else {
        // 3. إضافة المهمة لأول مرة (استخدام arrayUnion)
        const now = new Date();
        const newTask = {
            description: description,
            points_value: pointsValue,
            release_date: now.toISOString().split('T')[0], 
            release_time: now.toTimeString().split(' ')[0].substring(0, 5),
            task_type: `${curriculumType} تسلسلي`,
            curriculum_id: curriculumId, 
            status: "claimed" 
        };
        
        try {
            await docRef.update({ 
                tasks: firebase.firestore.FieldValue.arrayUnion(newTask) 
            }); 
            // تحديث البيانات المحلية
            allStudentsData[currentStudentId].tasks = allStudentsData[currentStudentId].tasks || [];
            allStudentsData[currentStudentId].tasks.push(newTask);
            claimSuccessful = true;
        } catch (e) {
             console.error("CRITICAL FAILURE: Curriculum Task Insert Failed.", e); 
        }
    }
    
    if (claimSuccessful) {
        loadStudentData(currentStudentId);
    } else {
        alert("فشل تحديث الإنجاز للمهمة التسلسلية.");
    }
}


// --- منطق تحديث الطالب (مطالبة المراجعة للمهام الخاصة) ---
async function processTaskClaim(taskIndex) {
    if (!currentStudentId) return;

    const docRef = db.collection("tasks").doc(currentStudentId); 
    let studentData = allStudentsData[currentStudentId];

    studentData.tasks[taskIndex].status = "claimed"; 

    try {
        await docRef.update({ tasks: studentData.tasks }); 
        allStudentsData[currentStudentId].tasks[taskIndex].status = "claimed";
        loadStudentData(currentStudentId);
    } catch (e) {
        console.error("CRITICAL FAILURE: Firestore Write Failed.", e); 
        alert("فشل تحديث الإنجاز.");
    }
}

// --- منطق إلغاء الإنجاز (التراجع) ---
async function processTaskUndo(taskIndex) {
    if (!currentStudentId) return;
    
    if (!confirm("هل أنت متأكد من إلغاء إنجاز هذه المهمة؟ ستختفي من مراجعة المعلم.")) {
        return;
    }

    const docRef = db.collection("tasks").doc(currentStudentId); 
    let studentData = allStudentsData[currentStudentId];

    studentData.tasks[taskIndex].status = "pending"; 

    try {
        await docRef.update({ tasks: studentData.tasks }); 

        allStudentsData[currentStudentId].tasks[taskIndex].status = "pending";
        
        loadStudentData(currentStudentId);
        
    } catch (e) {
        console.error("CRITICAL FAILURE: Firestore Undo Failed.", e); 
        alert("فشل إلغاء الإنجاز.");
    }
}

// --- دالة منح النقاط وتأكيد الموافقة ---
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
        } else if (task.task_type === "Murajaa تسلسلي") {
            updates.murajaa_progress = firebase.firestore.FieldValue.increment(1);
        }
    }
    
    try {
        await docRef.update(updates);

        allStudentsData[studentId].score = newScore;
        
        if (isCurriculumTask) {
             if (task.task_type === "Hifz تسلسلي") {
                 allStudentsData[studentId].hifz_progress = (allStudentsData[studentId].hifz_progress || 0) + 1;
             } else if (task.task_type === "Murajaa تسلسلي") {
                 allStudentsData[studentId].murajaa_progress = (allStudentsData[studentId].murajaa_progress || 0) + 1;
             }
        }
        
        alert(`تم منح ${pointsValue} نقاط للطالب ${studentId} وتم تحميل المهمة التسلسلية التالية.`);
        
        renderTeacherReviewList();
        renderLeaderboard();
        
    } catch (e) {
        console.error("خطأ في منح النقاط وتأكيد المهمة: ", e);
    }
}


// --- دوال المعلم ---
function showTeacherDashboard() {
    if (typeof showTeacherScreen === 'function') showTeacherScreen(); 
    renderTeacherReviewList(); 
    renderLeaderboard(); 
    attachAddTaskFormListener(); 
    populateBulkAddForms();
    
    // ربط نموذج إضافة طالب جديد
    const newStudentForm = document.getElementById('add-new-student-form');
    if (newStudentForm) {
        newStudentForm.removeEventListener('submit', handleAddNewStudent);
        newStudentForm.addEventListener('submit', handleAddNewStudent);
    }
}

// --- دالة معالجة إضافة طالب جديد (التي تبني سجل المهام المنجزة تلقائياً) ---
async function handleAddNewStudent(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('new-student-id').value.trim();
    const studentName = document.getElementById('new-student-name').value.trim();
    const hifzProgress = parseInt(document.getElementById('initial-hifz-progress').value.trim());
    const murajaaProgress = parseInt(document.getElementById('initial-murajaa-progress').value.trim());
    
    // التحقق الأساسي
    if (!studentId || !studentName || isNaN(hifzProgress) || isNaN(murajaaProgress)) {
        alert("الرجاء ملء جميع الحقول بشكل صحيح.");
        return;
    }
    
    if (allStudentsData[studentId]) {
        alert(`رمز الطالب ${studentId} مستخدم بالفعل. الرجاء اختيار رمز آخر.`);
        return;
    }

    // التحقق من أن مؤشرات التقدم لا تتجاوز طول المنهج المتاح
    if (hifzProgress > curriculumLists.Hifz.length || murajaaProgress > curriculumLists.Murajaa.length) {
         alert("خطأ: مؤشر التقدم يتجاوز عدد المهام المتاحة في المنهج المركزي.");
         return;
    }
    
    // 1. بناء سجل المهام المنجزة (Tasks Array)
    let completedTasks = [];
    let initialScore = 0;
    
    // أ. بناء سجل مهام الحفظ المنجزة (من 0 إلى hifzProgress - 1)
    for (let i = 0; i < hifzProgress; i++) {
        const task = curriculumLists.Hifz[i];
        if (task) {
            initialScore += task.points_value;
            completedTasks.push({
                description: task.description, 
                points_value: task.points_value, 
                task_type: "Hifz تسلسلي",
                curriculum_id: task.curriculum_id,
                status: "approved" // تحديد الحالة كـ 'approved' لتسجيل الإنجاز
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
        murajaa_progress: murajaaProgress
    };
    
    // 3. إرسال إلى Firebase
    try {
        await db.collection('tasks').doc(studentId).set(newStudentData);
        
        // تحديث البيانات المحلية
        allStudentsData[studentId] = newStudentData;
        
        alert(`تم إضافة الطالب "${studentName}" بنجاح. نقطة الانطلاق للحفظ: ${hifzProgress}.`);
        
        e.target.reset(); 
        showTeacherDashboard(); 
        
    } catch (error) {
        console.error("خطأ في إضافة الطالب الجديد:", error);
        alert(`فشل إضافة الطالب إلى Firebase!`);
    }
}
// --- نهاية دالة إضافة الطالب الجديد ---


function renderTeacherReviewList() {
    const reviewContainer = document.getElementById('review-tasks-container');
    if (!reviewContainer) return;
    reviewContainer.innerHTML = '';
    let pendingReviewCount = 0;

    for (const studentId in allStudentsData) {
        const student = allStudentsData[studentId];
        const tasks = student.tasks || [];

        tasks.forEach((task, taskIndex) => {
            if (task.status === "claimed") { 
                pendingReviewCount++;
                
                const reviewItem = document.createElement('div');
                reviewItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                reviewItem.innerHTML = `
                    <div style="flex-grow: 1;">
                        <span class="badge bg-info">${student.student_name} (${studentId})</span>
                        <p class="mb-0 mt-1">${task.description}</p>
                        <small class="text-muted">النوع: ${task.task_type} (+${task.points_value} نقاط)</small>
                    </div>
                `;

                const approveButton = document.createElement('button');
                approveButton.className = 'btn btn-success btn-sm ms-3';
                approveButton.innerText = 'تأكيد الإنجاز';
                approveButton.onclick = () => approveTask(studentId, taskIndex, task.points_value);
                
                reviewItem.appendChild(approveButton);
                reviewContainer.appendChild(reviewItem);
            }
        });
    }

    if (document.getElementById('review-count')) {
        document.getElementById('review-count').innerText = pendingReviewCount;
    }

    if (pendingReviewCount === 0) {
        reviewContainer.innerHTML = '<p class="text-success mt-3">لا توجد مهام تنتظر المراجعة حاليًا.</p>';
    }
}
function renderLeaderboard() { 
    const leaderboardContainer = document.getElementById('leaderboard-container');
    if (!leaderboardContainer) return;

    leaderboardContainer.innerHTML = '';
    
    const studentsArray = Object.values(allStudentsData).map(data => ({
        name: data.student_name,
        score: data.score || 0
    }));

    studentsArray.sort((a, b) => b.score - a.score);

    studentsArray.slice(0, 5).forEach((student, index) => {
        const rank = index + 1;
        const rankItem = document.createElement('div');
        rankItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        rankItem.innerHTML = `
            <div>
                <span class="badge bg-success me-2">#${rank}</span>
                ${student.name}
            </div>
            <strong>${student.score} نقاط</strong>
        `;
        leaderboardContainer.appendChild(rankItem);
    });
}
function attachAddTaskFormListener() { 
    const manualForm = document.getElementById('add-task-form');
    if (manualForm) {
        manualForm.removeEventListener('submit', handleAddTaskFormSubmit); 
        manualForm.addEventListener('submit', handleAddTaskFormSubmit);
    }

    const bulkForm = document.getElementById('add-bulk-task-form');
    if (bulkForm) {
        bulkForm.removeEventListener('submit', handleBulkAddTaskFormSubmit); 
        bulkForm.addEventListener('submit', handleBulkAddTaskFormSubmit);
    }
}
function populateBulkAddForms() { 
    const taskSelect = document.getElementById('bulk-task-select');
    if (taskSelect) {
        while (taskSelect.options.length > 1) {
            taskSelect.remove(1);
        }
        taskBank.forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.innerText = `${task.description} (+${task.points} نقاط)`;
            option.setAttribute('data-points', task.points);
            option.setAttribute('data-type', task.type);
            option.setAttribute('data-description', task.description);
            taskSelect.appendChild(option);
        });
    }

    const studentSelect = document.getElementById('bulk-student-select');
    if (studentSelect) {
        studentSelect.innerHTML = ''; 
        for (const studentId in allStudentsData) {
            const student = allStudentsData[studentId];
            const option = document.createElement('option');
            option.value = studentId;
            option.innerText = `${student.student_name} (${studentId})`;
            studentSelect.appendChild(option);
        }
    }
    
    const bulkDateInput = document.getElementById('bulk-task-date');
    if (bulkDateInput) {
        bulkDateInput.valueAsDate = new Date();
    }
}
async function handleAddTaskFormSubmit(e) {
    e.preventDefault(); 
    
    const studentId = document.getElementById('new-task-student-id').value.trim();
    const description = document.getElementById('new-task-description').value.trim();
    const points = parseInt(document.getElementById('new-task-points').value.trim());
    const date = document.getElementById('new-task-date').value.trim();
    const time = document.getElementById('new-task-time').value.trim();

    if (!studentId || !description || isNaN(points) || !date || !time) {
        alert("الرجاء ملء جميع حقول النموذج اليدوي بشكل صحيح.");
        return;
    }

    if (!allStudentsData[studentId]) {
        alert(`لا يوجد طالب مسجل بالرمز: ${studentId}.`);
        return;
    }

    const newTask = {
        description: description,
        points_value: points,
        release_date: date,
        release_time: time,
        task_type: "مضافة يدوياً", 
        depends_on: -1, 
        status: "pending" 
    };

    try {
        const studentDocRef = db.collection('tasks').doc(studentId);
        
        await studentDocRef.update({
            tasks: firebase.firestore.FieldValue.arrayUnion(newTask)
        });

        allStudentsData[studentId].tasks = allStudentsData[studentId].tasks || [];
        allStudentsData[studentId].tasks.push(newTask);


        alert(`تم إضافة المهمة بنجاح للطالب: ${allStudentsData[studentId].student_name}.`);
        
        e.target.reset();
        
    } catch (error) {
        console.error("خطأ حاسم في إضافة المهمة اليدوية: ", error);
        alert(`فشل إضافة المهمة إلى Firebase!`);
    }
}
async function handleBulkAddTaskFormSubmit(e) {
    e.preventDefault();

    const taskSelect = document.getElementById('bulk-task-select');
    const studentSelect = document.getElementById('bulk-student-select');
    const date = document.getElementById('bulk-task-date').value.trim();
    const time = document.getElementById('bulk-task-time').value.trim();
    
    const selectedTaskOption = taskSelect.options[taskSelect.selectedIndex];
    if (!selectedTaskOption || !selectedTaskOption.value) {
        alert("الرجاء اختيار مهمة من القائمة.");
        return;
    }

    const description = selectedTaskOption.getAttribute('data-description');
    const points = parseInt(selectedTaskOption.getAttribute('data-points'));
    const type = selectedTaskOption.getAttribute('data-type');

    const selectedStudentIds = Array.from(studentSelect.options)
                                    .filter(option => option.selected)
                                    .map(option => option.value);

    if (selectedStudentIds.length === 0) {
        alert("الرجاء اختيار طالب واحد على الأقل.");
        return;
    }

    if (!date || !time) {
        alert("الرجاء تحديد تاريخ ووقت إتاحة المهمة.");
        return;
    }

    const newTask = {
        description: description,
        points_value: points,
        release_date: date,
        release_time: time,
        task_type: type, 
        depends_on: -1, 
        status: "pending" 
    };
    
    let successCount = 0;
    
    for (const studentId of selectedStudentIds) {
        try {
            const studentDocRef = db.collection('tasks').doc(studentId);
            
            await studentDocRef.update({
                tasks: firebase.firestore.FieldValue.arrayUnion(newTask)
            });

            allStudentsData[studentId].tasks = allStudentsData[studentId].tasks || [];
            allStudentsData[studentId].tasks.push(newTask);
            successCount++;

        } catch (error) {
            console.error(`خطأ في إضافة المهمة للطالب ${studentId}:`, error);
        }
    }

    alert(`تم إضافة المهمة بنجاح إلى ${successCount} طلاب من أصل ${selectedStudentIds.length} طالب مختار.`);
    e.target.reset();
}
