// //////////////////////////////////////////////////////
// ملف app.js النهائي والمستقر (مع التعديلات المطلوبة)
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
const MANUAL_TASK_POINTS = 1; // نقاط ثابتة: 1 للمهام اليدوية/البنكية


// --- 2. دالة معالجة تسجيل الدخول (الطالب والمعلم) ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputId = document.getElementById('student-id').value.trim();

        // تحميل البيانات الأساسية قبل القرار لضمان وجودها
        await loadAllStudentsData();
        await loadCurriculumLists();
        await loadTaskBank();

        if (inputId === TEACHER_CODE) {
            showTeacherDashboard();
        } else if (inputId.match(/^\d+$/) && allStudentsData[inputId]) {
            loadStudentData(inputId);
        } else {
            alert("الرجاء إدخال رمز صحيح (طالب أو معلم).");
        }
    });
}


// --- 3. دوال جلب البيانات من Firestore ---
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
        const doc = await db.collection("Settings").doc("TaskBank").get();
        taskBank = doc.exists ? doc.data().tasks || [] : [];
    } catch (e) {
        console.error("Error loading Task Bank.", e);
        taskBank = [];
    }
}


// --- 4. دالة تحديد المهام النشطة للطالب (تفعيل نظام التقدم التسلسلي) ---
function getCurrentCurriculumTasks(studentData) {
    const activeTasks = [];
    const studentTasks = studentData.tasks || [];

    // Hifz (يبقى كما هو: مهمة واحدة صارمة)
    const hifzIndex = studentData.hifz_progress || 0;
    const nextHifzTask = curriculumLists.Hifz[hifzIndex];
    if (nextHifzTask) {
        const isHifzActive = studentTasks.some(t =>
            t.curriculum_id === nextHifzTask.curriculum_id &&
            (t.status === "claimed" || t.status === "approved") && // تم تعديل الشرط ليشمل approved (لضمان عدم تكرار ظهورها)
            t.task_type === "Hifz تسلسلي"
        );
        if (!isHifzActive) {
            activeTasks.push({ ...nextHifzTask, is_curriculum_task: true, curriculum_type: 'Hifz' });
        }
    }

    // Murajaa (نظام عرض 3 مهام متتالية)
    // ✨ تعديل: منطق المراجعة الجديدة ✨
    const murajaaList = curriculumLists.Murajaa || [];
    const murajaaTotal = murajaaList.length;

    if (murajaaTotal > 0) {
        const startIndex = studentData.murajaa_progress || 0;
        const endIndex = Math.min(startIndex + 3, murajaaTotal); // الحد الأقصى 3 مهام

        for (let i = startIndex; i < endIndex; i++) {
            const nextMurajaaTask = murajaaList[i];
            
            // التحقق مما إذا تم إرسال (claimed) أو الموافقة (approved) على المهمة بالفعل
            const isMurajaaActive = studentTasks.some(t =>
                t.curriculum_id === i &&
                (t.status === "claimed" || t.status === "approved") &&
                t.task_type === "Murajaa تسلسلي"
            );

            if (!isMurajaaActive) {
                // إذا لم يتم المطالبة بها أو الموافقة عليها، أضفها كنشطة
                activeTasks.push({ ...nextMurajaaTask, is_curriculum_task: true, curriculum_type: 'Murajaa' });
            }
        }
    }
    // نهاية منطق المراجعة الجديد

    // فلترة المهام اليدوية والبنكية التي لم يتم الانتهاء منها (pending/claimed)
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

// 🔑 دالة التقدم مع حل مشكلة "المهمة التالية" وإلغاء لوب المراجعة
function renderProgressBars(studentData) {
    const progressContainer = document.getElementById('progress-container');
    if (!progressContainer) return;

    progressContainer.innerHTML = '';

    // --- 1. مسار الحفظ (Hifz) ---
    const hifzTotal = curriculumLists.Hifz.length;
    const hifzProgress = studentData.hifz_progress || 0;
    const hifzPercent = hifzTotal > 0 ? Math.floor((hifzProgress / hifzTotal) * 100) : 0;

    // حساب المهمة التالية (N) - المهمة التي يجب على الطالب العمل عليها
    const nextHifzIndex = hifzProgress; // كانت hifzProgress + 1
    const nextHifz = curriculumLists.Hifz[nextHifzIndex];

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

    // --- 2. مسار المراجعة (Murajaa) ---
    const murajaaTotal = curriculumLists.Murajaa.length;
    const murajaaProgress = studentData.murajaa_progress || 0;

    // 💡 التعديل هنا: المهمة التالية هي التقدم الحالي (N)
    const nextMurajaaIndex = murajaaProgress;

    const currentMurajaaProgress = murajaaProgress; // هذا هو التقدم المكتمل

    const murajaaPercent = murajaaTotal > 0 ? Math.floor((currentMurajaaProgress / murajaaTotal) * 100) : 0;

    const nextMurajaa = curriculumLists.Murajaa[nextMurajaaIndex]; // استخدام القائمة المباشرة

    if (murajaaTotal > 0) {
        progressContainer.innerHTML += `
            <div class="progress-section mb-4">
                <div class="progress-title mb-2">
                    <i class="fas fa-redo-alt text-info"></i> مسار المراجعة: ${currentMurajaaProgress} من ${murajaaTotal} مهمة (${murajaaPercent}%)
                </div>
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar bg-info" role="progressbar" style="width: ${murajaaPercent}%;" aria-valuenow="${murajaaPercent}" aria-valuemin="0" aria-valuemax="100">
                        ${murajaaPercent}%
                    </div>
                </div>
                <small class="text-muted mt-2 d-block">المهمة التالية: ${nextMurajaa ? nextMurajaa.description.replace('مراجعة: ', '') : 'تم الانتهاء من دورة المراجعة الحالية.'}</small>
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

    // 🔑 ملاحظة: سيتم الآن عرض المهام الثلاث المتاحة للمراجعة والمهام اليدوية والبنكية
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

            // البحث عن حالة المهمة في قائمة الطالب (Claimed/Approved)
            const activeInDb = studentTasksInDb.find(t =>
                t.curriculum_id === task.curriculum_id &&
                (t.status === "claimed" || t.status === "approved") &&
                t.task_type === `${task.curriculum_type} تسلسلي`
            );

            if (activeInDb && activeInDb.status === "claimed") {
                cardClass += ' claimed-card';
                actionButton = `<button class="btn btn-warning btn-sm" disabled><i class="fas fa-hourglass-half"></i> قيد مراجعة المعلم</button>`;
            } else if (activeInDb && activeInDb.status === "approved") {
                // المهمة معتمدة لكنها ما زالت تظهر في نطاق الثلاثة. يجب أن لا يظهر لها زر
                cardClass += ' approved-card'; 
                actionButton = `<button class="btn btn-success btn-sm" disabled><i class="fas fa-check-circle"></i> تم القبول</button>`; 
            } else {
                // زر إنجاز المهام التسلسلية (متاحة الآن 3 للمراجعة)
                actionButton = `<button class="btn btn-primary" onclick="claimCurriculumTask('${task.curriculum_type}', ${task.curriculum_id}, ${task.points_value}, '${task.description.replace(/'/g, "\\'")}')"><i class="fas fa-check"></i> تم الإنجاز</button>`;
            }

        }
        else {
            // مهام يدوية أو من البنك
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
                // زر إنجاز المهام اليدوية
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

// دالة المطالبة بإنجاز مهمة تسلسلية (الحفظ/المراجعة)
async function claimCurriculumTask(type, curriculumId, points, description) {
    if (!currentStudentId) return alert("خطأ: لا يوجد رمز طالب نشط.");

    const studentData = allStudentsData[currentStudentId];

    // ✨ تعديل: منطق المطالبة بالتسلسل ✨
    if (type === 'Hifz') {
        const expectedId = studentData.hifz_progress || 0;
        if (curriculumId !== expectedId) {
            alert("هذه ليست مهمة الحفظ التالية المطلوبة. يرجى إكمال المهمة السابقة.");
            return;
        }
    } else if (type === 'Murajaa') {
        // لا يوجد تحقق صارم على الـ ID في المراجعة (للسماح بالثلاث مهام)
        const startIndex = studentData.murajaa_progress || 0;
        const endIndex = Math.min(startIndex + 3, curriculumLists.Murajaa.length);
        
        if (curriculumId < startIndex || curriculumId >= endIndex) {
            alert("المهمة المطلوبة ليست ضمن المهام المتاحة حاليًا.");
            return;
        }
    }
    // نهاية تعديل المطالبة بالتسلسل

    const taskDetails = {
        description: description,
        points_value: points,
        task_type: `${type} تسلسلي`,
        curriculum_id: curriculumId,
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

// دالة المطالبة بإنجاز مهمة يدوية/من البنك (pending -> claimed)
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

// دالة إلغاء المطالبة بمهمة يدوية/من البنك (claimed -> delete)
// ملاحظة: هذا التعديل يجعل عملية "الإلغاء" تقوم بحذف المهمة بالكامل من قائمة الطالب.
async function processTaskUndo(taskIndex) {
    if (!currentStudentId) return;
    const studentData = allStudentsData[currentStudentId];
    if (!studentData || !studentData.tasks || taskIndex >= studentData.tasks.length) return;
    
    // تأكيد من المستخدم لحذف المهمة
    if (!confirm("هل أنت متأكد من إلغاء هذه المهمة؟ سيتم حذفها من قائمة مهامك.")) {
        return;
    }

    let updatedTasks = [...studentData.tasks];
    const removedTask = updatedTasks.splice(taskIndex, 1); // حذف المهمة من المصفوفة تمامًا

    try {
        await db.collection('tasks').doc(currentStudentId).update({
            tasks: updatedTasks
        });
        
        await loadAllStudentsData(); // إعادة تحميل بيانات الطلاب
        loadStudentData(currentStudentId); // إعادة عرض واجهة الطالب
        if (removedTask.length > 0) {
            alert(`تم حذف المهمة "${removedTask[0].description}" بنجاح.`); // تأكيد الحذف
        } else {
            alert("تم حذف المهمة بنجاح.");
        }
        
    } catch (error) {
        console.error("خطأ في حذف المهمة عند الإلغاء:", error);
        alert("فشل حذف المهمة.");
    }
}


// ✨ تعديل: منطق المراجعة الجديدة ✨
// دالة مساعدة لفحص التسلسل المكتمل والموافقة عليه في المراجعة (يجب وضعها قبل approveTask)
function checkAndUpdateMurajaaProgress(studentTasks) {
    const murajaaTotal = curriculumLists.Murajaa.length;
    let newProgress = 0;

    // نبدأ من المؤشر 0 ونبحث عن أطول سلسلة متتالية معتمدة
    for (let i = 0; i < murajaaTotal; i++) {
        const taskApproved = studentTasks.some(t =>
            t.curriculum_id === i &&
            t.status === "approved" &&
            t.task_type === "Murajaa تسلسلي"
        );

        if (taskApproved) {
            newProgress = i + 1; // المهمة i اكتملت، التقدم التالي هو i+1
        } else {
            // وجدنا فجوة: التوقف عند أول مهمة غير مكتملة
            break; 
        }
    }
    return newProgress;
}


// دالة الموافقة على المهمة (المعلم)
async function approveTask(studentId, taskIndex) {
    const studentData = allStudentsData[studentId];
    if (!studentData || !studentData.tasks || taskIndex >= studentData.tasks.length) return;
    
    const task = studentData.tasks[taskIndex];
    if (task.status !== "claimed") return;

    // 1. تحديث قائمة المهام
    let updatedTasks = [...studentData.tasks];
    updatedTasks[taskIndex].status = "approved";
    updatedTasks[taskIndex].approved_date = new Date().toISOString();

    // 2. تحديث بيانات الطالب
    let scoreIncrease = task.points_value;
    let newScore = (studentData.score || 0) + scoreIncrease;
    let hifz_progress = studentData.hifz_progress || 0;
    // murajaa_progress سيتم حسابه لاحقًا لضمان التسلسل

    // المنطق التسلسلي (Hifz) - يبقى كما هو صارم
    if (task.task_type === "Hifz تسلسلي") {
        hifz_progress++;
    } 

    // 3. تطبيق الفحص النهائي لتقدم المراجعة بعد التعديل
    let finalMurajaaProgress = studentData.murajaa_progress || 0;

    if (task.task_type === "Murajaa تسلسلي") {
        // *** 🔑 الخطوة الحاسمة: تحديث البيانات مؤقتاً لإجراء الفحص ***
        finalMurajaaProgress = checkAndUpdateMurajaaProgress(updatedTasks);
    }
    // نهاية تعديل الموافقة

    try {
        const batch = db.batch();
        
        // تحديث وثيقة الطالب
        const studentRef = db.collection('tasks').doc(studentId);
        batch.update(studentRef, {
            score: newScore,
            tasks: updatedTasks,
            hifz_progress: hifz_progress,
            // 🔑 نستخدم القيمة التي تم فحصها تسلسلياً
            murajaa_progress: finalMurajaaProgress, 
        });
        
        await batch.commit();

        await loadAllStudentsData();
        showTeacherDashboard();
        
    } catch (error) {
        console.error("خطأ في الموافقة على المهمة:", error);
        alert("فشل في الموافقة على المهمة.");
    }
}

// دالة رفض المهمة (المعلم)
async function rejectTask(studentId, taskIndex) {
    if (!confirm("هل أنت متأكد من رفض المهمة؟ سيتم حذفها من قائمة الطالب.")) return;

    const studentData = allStudentsData[studentId];
    if (!studentData || !studentData.tasks || taskIndex >= studentData.tasks.length) return;

    // 1. استبعاد المهمة المرفوضة من قائمة المهام
    let updatedTasks = studentData.tasks.filter((_, index) => index !== taskIndex);
    
    try {
        await db.collection('tasks').doc(studentId).update({
            tasks: updatedTasks
        });

        await loadAllStudentsData();
        showTeacherDashboard();
        alert("تم رفض وحذف المهمة بنجاح.");
        
    } catch (error) {
        console.error("خطأ في رفض المهمة:", error);
        alert("فشل في رفض المهمة.");
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
    renderLeaderboard();
    updateCurriculumStatusDisplay();
    renderBankTasks();
    populateBulkTaskSelect();
    populateBulkStudentSelect();
}

// دالة عرض المهام التي تنتظر المراجعة
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
                item.innerHTML = `
                    <div>
                        <p class="mb-1 fw-bold">${task.description} (${task.points_value} نقطة)</p>
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

// دالة عرض لوحة الشرف
function renderLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    container.innerHTML = '';
    
    const studentsArray = Object.values(allStudentsData).map(data => ({
        name: data.student_name,
        score: data.score || 0
    }));

    studentsArray.sort((a, b) => b.score - a.score);

    const topStudents = studentsArray.slice(0, 5);

    if (topStudents.length === 0) {
        container.innerHTML = '<div class="alert alert-warning m-0">لا توجد بيانات طلاب لعرض لوحة الشرف.</div>';
        return;
    }

    topStudents.forEach((student, index) => {
        const item = document.createElement('div');
        let icon = '';
        if (index === 0) icon = '<i class="fas fa-medal text-warning me-2"></i>';
        else if (index === 1) icon = '<i class="fas fa-medal text-secondary me-2"></i>';
        else if (index === 2) icon = '<i class="fas fa-medal text-danger me-2"></i>';
        else icon = '<i class="fas fa-trophy text-info me-2"></i>';

        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <span>${icon} ${index + 1}. ${student.name}</span>
            <span class="badge bg-primary rounded-pill">${student.score} نقطة</span>
        `;
        container.appendChild(item);
    });
}


// دالة إضافة طالب جديد
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
        tasks: []
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

// دالة إضافة مهمة منهج جديدة
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


// دوال إدارة بنك المهام (1 نقطة)

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
    if (!select) return; // التأكد من وجود العنصر
    select.innerHTML = '<option value="">اختر المهمة...</option>';

    taskBank.forEach((task) => {
        const option = document.createElement('option');
        option.value = JSON.stringify({ description: task.description, points: task.points, type: task.type });
        option.textContent = `${task.description} (${task.points} نقطة)`;
        select.appendChild(option);
    });
}

function populateBulkStudentSelect() {
    const select = document.getElementById('bulk-student-select');
    if (!select) return; // التأكد من وجود العنصر
    select.innerHTML = '';
    
    Object.values(allStudentsData).forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.student_name} (${student.id})`;
        select.appendChild(option);
    });
}

// دالة إضافة مهمة فردية (اليدوية)
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

// دالة إضافة مهمة جماعية (من البنك الجاهز)
async function handleAddBulkTask(e) {
    e.preventDefault();

// تم حذف الكود الخاص بهذه الدالة لانتهاء الإدخال من المستخدم، لكن يجب أن يكون موجودًا في ملفك الأصلي
// أو يُستكمل إذا أردت استكماله.
}
