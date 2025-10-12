// //////////////////////////////////////////////////////
// ملف app.js النهائي: نظام التعاقب القائم على الإنجاز - نسخة الإدارة واللوب
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

// قائمة مهام جاهزة مؤقتة (لبنك المهام)
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


// --- 4. دالة تحديد المهام النشطة للطالب (تحديث لوجيك المراجعة) ---
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
        // نستخدم عامل % (Modulo) لضمان العودة إلى الفهرس 0 بعد الوصول إلى النهاية
        const murajaaIndex = (studentData.murajaa_progress || 0) % murajaaTotal; 
        const nextMurajaaTask = murajaaList[murajaaIndex];
        
        if (nextMurajaaTask) {
            // التحقق مما إذا كانت المهمة قيد المطالبة بالفعل
            const isMurajaaActive = studentTasks.some(t => 
                t.curriculum_id === nextMurajaaTask.curriculum_id && 
                t.status === "claimed" && 
                t.task_type === "Murajaa تسلسلي" 
            );
            
            if (!isMurajaaActive) {
                // إضافة قائمة المراجعة المخصصة للطالب كجزء من الوصف
                const murajaaPool = studentData.murajaa_pool || [];
                // عرض أول 5 سور فقط
                const poolDescription = murajaaPool.slice(0, 5).join(', ') + (murajaaPool.length > 5 ? '... والمزيد.' : '');
                
                nextMurajaaTask.description = `${nextMurajaaTask.description} - (راجع: ${poolDescription || 'لا يوجد سور/أجزاء محددة حاليًا.'})`;
                
                activeTasks.push({ ...nextMurajaaTask, is_curriculum_task: true, curriculum_type: 'Murajaa' });
            }
        }
    }
    
    // دمج المهام: المهام العادية (pending/claimed) + المهام النشطة من المنهج
    const pendingAndClaimedTasks = studentTasks.filter(t => t.status === "pending" || t.status === "claimed");
    const combinedTasks = pendingAndClaimedTasks.concat(activeTasks);

    return combinedTasks;
}


// --- 5. دالة عرض واجهة الطالب والتقارير ---
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
    // حساب التقدم النسبي للدورة الحالية
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


// --- 6. منطق عرض المهام (Card View) ---
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
        
        // 1. التعامل مع المهام التسلسلية (Hifz/Murajaa)
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
                t.curriculum_id === task.curriculum_id && 
                t.status === "claimed" &&
                t.task_type === `${task.curriculum_type} تسلسلي`
            );

            if (activeInDb) {
                // حالة: قيد مراجعة المعلم
                cardClass += ' claimed-card';
                actionButton = `<button class="btn btn-warning btn-sm" disabled><i class="fas fa-hourglass-half"></i> قيد مراجعة المعلم</button>`;
            } else {
                // حالة: جاهزة للإنجاز
                actionButton = `<button class="btn btn-primary" onclick="claimCurriculumTask('${task.curriculum_type}', ${task.curriculum_id}, ${task.points_value}, '${task.description.replace(/'/g, "\\'")}')"><i class="fas fa-check"></i> تم الإنجاز</button>`;
            }

        } 
        // 2. التعامل مع المهام الخاصة (اليدوية/Pending/Claimed)
        else {
             // البحث عن Index المهمة في القائمة الأصلية studentTasksInDb
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
                cardButton = `<button class="btn btn-success" onclick="processTaskClaim(${originalIndex})"><i class="fas fa-check-double"></i> تم الإنجاز</button>`;
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

    // تهيئة المهمة للمطالبة
    const now = new Date();
    const taskDetails = {
        description: description,
        points_value: pointsValue,
        release_date: now.toISOString().split('T')[0], 
        release_time: now.toTimeString().split(' ')[0].substring(0, 5),
        task_type: `${curriculumType} تسلسلي`,
        curriculum_id: curriculumId, 
        status: "claimed" 
    };
    
    // إذا كانت موجودة (للمراجعة الدورية حيث يتم إعادة استخدام الـ ID)
    if (existingIndex !== -1) {
        // نحدث المهمة في نفس الموضع مع تفاصيل المطالبة الجديدة
        studentData.tasks[existingIndex] = taskDetails;
        try {
            await docRef.update({ tasks: studentData.tasks }); 
            claimSuccessful = true;
        } catch (e) {
            console.error("CRITICAL FAILURE: Curriculum Task Update Failed.", e); 
        }

    } else {
        // إضافة المهمة لأول مرة (للحفظ التسلسلي الذي لا يُعاد استخدامه)
        try {
            await docRef.update({ 
                tasks: firebase.firestore.FieldValue.arrayUnion(taskDetails) 
            }); 
            // تحديث البيانات المحلية
            allStudentsData[currentStudentId].tasks = allStudentsData[currentStudentId].tasks || [];
            allStudentsData[currentStudentId].tasks.push(taskDetails);
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


// --- دالة منح النقاط وتأكيد الموافقة (تعديل منطق اللوب) ---
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
            
            // 🔑 المنطق الجديد: إضافة المهمة إلى قائمة المراجعة للطالب
            const newMurajaaItem = task.description; 
            updates.murajaa_pool = firebase.firestore.FieldValue.arrayUnion(newMurajaaItem); 
            
        } else if (task.task_type === "Murajaa تسلسلي") {
            updates.murajaa_progress = firebase.firestore.FieldValue.increment(1);
            
            // 🔑 منطق حذف أول عنصر من قائمة murajaa_pool بعد المراجعة
            const murajaaPool = studentData.murajaa_pool || [];
            if (murajaaPool.length > 0) {
                 // نزيل أول سورة مضافة (افتراضياً هي التي راجعها)
                 updates.murajaa_pool = murajaaPool.slice(1);
            }
        }
    }
    
    try {
        await docRef.update(updates);

        // تحديث البيانات المحلية
        allStudentsData[studentId].score = newScore;
        
        if (isCurriculumTask) {
             if (task.task_type === "Hifz تسلسلي") {
                 allStudentsData[studentId].hifz_progress = (allStudentsData[studentId].hifz_progress || 0) + 1;
                 // تحديث الـ pool محلياً
                 allStudentsData[studentId].murajaa_pool = allStudentsData[studentId].murajaa_pool || [];
                 allStudentsData[studentId].murajaa_pool.push(task.description);
                 
             } else if (task.task_type === "Murajaa تسلسلي") {
                 allStudentsData[studentId].murajaa_progress = (allStudentsData[studentId].murajaa_progress || 0) + 1;
                 // تحديث الـ pool محلياً
                 if (allStudentsData[studentId].murajaa_pool && allStudentsData[studentId].murajaa_pool.length > 0) {
                     allStudentsData[studentId].murajaa_pool.shift();
                 }
             }
        }
        
        alert(`تم منح ${pointsValue} نقاط للطالب ${studentId} وتم تحميل المهمة التسلسلية التالية.`);
        
        renderTeacherReviewList();
        renderLeaderboard();
        
    } catch (e) {
        console.error("خطأ في منح النقاط وتأكيد المهمة: ", e);
    }
}


// --- دوال المعلم (Teacher Dashboard) ---

function showTeacherDashboard() {
    if (typeof showTeacherScreen === 'function') showTeacherScreen(); 
    renderTeacherReviewList(); 
    renderLeaderboard(); 
    attachAddTaskFormListener(); 
    populateBulkAddForms();
    
    // ربط نماذج الإدارة
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
    updateCurriculumStatusDisplay(); 
}

// --- دالة إضافة طالب جديد (تبني سجل الإنجاز وتضيف murajaa_pool) ---
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
        alert(`رمز الطالب ${studentId} مستخدم بالفعل. الرجاء اختيار رمز آخر.`);
        return;
    }

    if (hifzProgress > curriculumLists.Hifz.length || murajaaProgress > curriculumLists.Murajaa.length) {
         alert("خطأ: مؤشر التقدم يتجاوز عدد المهام المتاحة في المنهج المركزي.");
         return;
    }
    
    // 1. بناء سجل المهام المنجزة (Tasks Array) والنقاط وقائمة المراجعة
    let completedTasks = [];
    let initialScore = 0;
    let initialMurajaaPool = [];
    
    // أ. بناء سجل مهام الحفظ المنجزة
    for (let i = 0; i < hifzProgress; i++) {
        const task = curriculumLists.Hifz[i];
        if (task) {
            initialScore += task.points_value;
            initialMurajaaPool.push(task.description); // إضافة المهمة المنجزة إلى قائمة المراجعة
            completedTasks.push({
                description: task.description, 
                points_value: task.points_value, 
                task_type: "Hifz تسلسلي",
                curriculum_id: task.curriculum_id,
                status: "approved" 
            });
        }
    }
    
    // ب. بناء سجل مهام المراجعة المنجزة (لأي تقدم أولي في المراجعة)
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
        
        alert(`تم إضافة الطالب "${studentName}" بنجاح. نقطة الانطلاق للحفظ: ${hifzProgress}.`);
        
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
        
        await curriculumDocRef.update({
            tasks_list: firebase.firestore.FieldValue.arrayUnion(newTask)
        });
        
        currentList.push(newTask);
        alert(`تم إضافة المهمة بنجاح إلى مسار ${type}. أصبحت المهمة رقم ${nextCurriculumId}.`);
        
        e.target.reset(); 
        await loadCurriculumLists(); 
        updateCurriculumStatusDisplay(); 
        
    } catch (error) {
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

// ... (بقية دوال المعلم مثل renderTeacherReviewList و renderLeaderboard و handleAddTaskFormSubmit وغيرها تبقى كما هي من الكود السابق) ...


// //////////////////////////////////////////////////////
// دالة تنفيذية: تحديث وعكس مهام المراجعة بالكامل
// //////////////////////////////////////////////////////
// *ملاحظة: يمكنك إزالة هذه الدالة بعد تشغيلها مرة واحدة لتنظيف الكود.*
async function updateAndReverseMurajaaCurriculum() {
    if (!confirm("تحذير حاسم: هل أنت متأكد من عكس قائمة المراجعة وإعادة كتابتها؟ هذا سيؤثر على نقاط انطلاق الطلاب الحاليين.")) {
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

// //////////////////////////////////////////////////////
// يمكنك ترك الدوال التنفيذية الأخرى (مثل seedHifzCurriculum) هنا أيضاً إذا لم يتم تشغيلها بعد.
// //////////////////////////////////////////////////////
