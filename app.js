// //////////////////////////////////////////////////////
// ملف app.js النهائي والمستقر (مع نظام مهام الأطفال والمقاطع الصوتية)
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
// 💡 التعديل: تهيئة Firebase Storage
const storage = firebase.storage();


// --- 1. متغيرات الحالة العامة ---
let allStudentsData = {};
let currentStudentId = null;
const TEACHER_CODE = 'TEACHER2025';

let curriculumLists = {};
let taskBankRegular = []; // بنك مهام الكبار/العاديين
let taskBankChild = [];   // بنك مهام الأطفال
const MANUAL_TASK_POINTS = 1; // نقاط المهام اليدوية/البنكية العادية
const CHILD_TASK_POINTS = 10; // 💡 التعديل: تثبيت نقاط مهام الأطفال على 10


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

// دالة رفع الملفات المساعدة (جديدة)
async function uploadAudioFile(file) {
    if (!file) return null;

    // إنشاء مسار فريد: audio/child_tasks/TIMESTAMP_FILENAME
    const storageRef = storage.ref();
    const fileName = `${Date.now()}_${file.name}`;
    const fileRef = storageRef.child(`audio/child_tasks/${fileName}`);

    try {
        const snapshot = await fileRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        return downloadURL;
    } catch (error) {
        console.error("خطأ في رفع الملف الصوتي:", error);
        alert("فشل رفع الملف الصوتي. تأكد من قواعد أمان Firebase Storage.");
        return null;
    }
}

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

// دالة تحميل بنوك المهام (مُعدّلة لدعم بنكين)
async function loadTaskBank() {
    try {
        const [regularDoc, childDoc] = await Promise.all([
            db.collection("Settings").doc("TaskBank_Regular").get(), // بنك مهام الكبار/العادي
            db.collection("Settings").doc("TaskBank_Child").get()    // بنك مهام الأطفال
        ]);
        
        taskBankRegular = regularDoc.exists ? regularDoc.data().tasks || [] : [];
        taskBankChild = childDoc.exists ? childDoc.data().tasks || [] : [];
        
    } catch (e) {
        console.error("Error loading Task Banks.", e);
        taskBankRegular = [];
        taskBankChild = [];
    }
}


// --- 4. دالة تحديد المهام النشطة للطالب (تفعيل نظام التقدم التسلسلي) ---

// دالة تحديد المهام النشطة للطالب (مُعدّلة لدعم مهام الأطفال التسلسلية)
function getCurrentCurriculumTasks(studentData) {
    const activeTasks = [];
    const studentTasks = studentData.tasks || [];

    // Hifz
    const hifzIndex = studentData.hifz_progress || 0;
    const nextHifzTask = curriculumLists.Hifz[hifzIndex];
    if (nextHifzTask) {
        const isHifzActive = studentTasks.some(t =>
            t.curriculum_id === nextHifzTask.curriculum_id &&
            t.status === "claimed" &&
            t.task_type === "Hifz تسلسلي"
        );
        if (!isHifzActive) {
            activeTasks.push({ ...nextHifzTask, is_curriculum_task: true, curriculum_type: 'Hifz' });
        }
    }

    // Murajaa
    const murajaaList = curriculumLists.Murajaa || [];
    const murajaaTotal = murajaaList.length;

    if (murajaaTotal > 0) {
        const murajaaIndex = studentData.murajaa_progress || 0;

        if (murajaaIndex < murajaaTotal) {
            const nextMurajaaTask = murajaaList[murajaaIndex];

            if (nextMurajaaTask) {
                const isMurajaaActive = studentTasks.some(t =>
                    t.curriculum_id === nextMurajaaTask.curriculum_id &&
                    t.status === "claimed" &&
                    t.task_type === "Murajaa تسلسلي"
                );

                if (!isMurajaaActive) {
                    activeTasks.push({ ...nextMurajaaTask, is_curriculum_task: true, curriculum_type: 'Murajaa' });
                }
            }
        }
    }

    // 💡 التعديل: منطق المهام التسلسلية للأطفال
    if (studentData.student_category === 'child') {
        const childProgress = studentData.child_tasks_progress || 0;
        const nextChildTask = taskBankChild[childProgress];

        if (nextChildTask) {
            const isChildTaskActive = studentTasks.some(t =>
                t.bank_id === nextChildTask.id &&
                t.status === "claimed" &&
                t.task_type === "Child تسلسلي"
            );
            if (!isChildTaskActive) {
                activeTasks.push({ 
                    ...nextChildTask, 
                    is_curriculum_task: true, 
                    curriculum_type: 'Child',
                    audio_url: nextChildTask.audio_url 
                });
            }
        }
    }


    // فلترة المهام اليدوية والبنكية العادية (pending/claimed)
    // 💡 نستخدم is_curriculum_task لتجنب تداخل مهام الأطفال التسلسلية
    const pendingAndClaimedTasks = studentTasks.filter(t => 
        (t.status === "pending" || t.status === "claimed") && 
        !t.is_curriculum_task 
    );
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

// 💡 دالة التقدم المُعدّلة لإضافة تقدم الأطفال
function renderProgressBars(studentData) {
    const progressContainer = document.getElementById('progress-container');
    if (!progressContainer) return;

    progressContainer.innerHTML = '';

    // --- 1. مسار الحفظ (Hifz) ---
    const hifzTotal = curriculumLists.Hifz.length;
    const hifzProgress = studentData.hifz_progress || 0;
    const hifzPercent = hifzTotal > 0 ? Math.floor((hifzProgress / hifzTotal) * 100) : 0;
    const nextHifzIndex = hifzProgress + 1;
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
    const nextMurajaaIndex = murajaaProgress + 1;
    const murajaaPercent = murajaaTotal > 0 ? Math.floor((murajaaProgress / murajaaTotal) * 100) : 0;
    const nextMurajaa = curriculumLists.Murajaa[nextMurajaaIndex]; 

    if (murajaaTotal > 0) {
        progressContainer.innerHTML += `
            <div class="progress-section mb-4">
                <div class="progress-title mb-2">
                    <i class="fas fa-redo-alt text-info"></i> مسار المراجعة: ${murajaaProgress} من ${murajaaTotal} مهمة (${murajaaPercent}%)
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

    // --- 3. مسار مهام الأطفال (Child Tasks) 💡 جديد ---
    if (studentData.student_category === 'child') {
        const childTotal = taskBankChild.length;
        const childProgress = studentData.child_tasks_progress || 0;
        const nextChildIndex = childProgress; 
        const nextChild = taskBankChild[nextChildIndex];

        const childPercent = childTotal > 0 ? Math.floor((childProgress / childTotal) * 100) : 0;
        
        progressContainer.innerHTML += `
            <div class="progress-section mb-4">
                <div class="progress-title mb-2">
                    <i class="fas fa-child text-danger"></i> مهام الأطفال: ${childProgress} من ${childTotal} مهمة (${childPercent}%)
                </div>
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar bg-danger" role="progressbar" style="width: ${childPercent}%;" aria-valuenow="${childPercent}" aria-valuemin="0" aria-valuemax="100">
                        ${childPercent}%
                    </div>
                </div>
                <small class="text-muted mt-2 d-block">المهمة التالية: ${nextChild ? nextChild.description : 'تم الانتهاء من جميع مهام الأطفال.'}</small>
            </div>
        `;
    }
}


// 💡 دالة عرض المهام المُعدّلة لعرض مشغل الصوت ومهام الأطفال
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
        let audioPlayerHtml = '';
        
        // 💡 مشغل الصوت (يظهر فقط إذا كان الرابط موجودًا)
        if (task.audio_url) {
            audioPlayerHtml = `<audio controls preload="none" class="d-block w-100 my-2"><source src="${task.audio_url}" type="audio/mp3">متصفحك لا يدعم مشغل الصوت.</audio>`;
        }


        if (task.is_curriculum_task) {
            
            // 💡 منطق مهام الأطفال التسلسلية
            if (task.curriculum_type === 'Child') {
                cardClass = 'child-task-card'; // استخدم كلاس CSS مختلف
                iconHtml = '<i class="fas fa-child text-danger me-2"></i>';
                
                // البحث في studentTasks للتأكد من حالة claimed 
                const activeInDb = studentTasksInDb.find(t =>
                    t.bank_id === task.id && // نستخدم ID البنك هنا
                    t.status === "claimed" &&
                    t.task_type === "Child تسلسلي"
                );

                if (activeInDb) {
                    cardClass += ' claimed-card';
                    actionButton = `<button class="btn btn-warning btn-sm" disabled><i class="fas fa-hourglass-half"></i> قيد مراجعة المعلم</button>`;
                } else {
                    // زر إنجاز مهام الأطفال التسلسلية (نمرر id المهمة من البنك)
                    actionButton = `<button class="btn btn-danger" onclick="claimCurriculumTask('Child', ${task.id}, ${task.points_value}, '${task.description.replace(/'/g, "\\'")}', '${task.audio_url}')"><i class="fas fa-check"></i> تم الإنجاز</button>`;
                }
            }
            // منطق Hifz و Murajaa 
            else {
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
                    // زر إنجاز المهام التسلسلية
                    actionButton = `<button class="btn btn-primary" onclick="claimCurriculumTask('${task.curriculum_type}', ${task.curriculum_id}, ${task.points_value}, '${task.description.replace(/'/g, "\\'")}')"><i class="fas fa-check"></i> تم الإنجاز</button>`;
                }
            }
        }
        else {
            // مهام يدوية أو من البنك (الكلاسيكي)
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
            ${audioPlayerHtml} <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted d-none">النوع: ${taskTypeDisplay}</small>
                <div class="task-actions">
                    ${actionButton}
                </div>
            </div>
        `;
        tasksContainer.appendChild(taskElement);
    });
}

// 💡 دالة المطالبة بإنجاز مهمة تسلسلية (مُعدّلة لدعم الأطفال)
async function claimCurriculumTask(type, taskIdentifier, points, description, audioUrl = null) {
    if (!currentStudentId) return alert("خطأ: لا يوجد رمز طالب نشط.");

    const studentData = allStudentsData[currentStudentId];

    // تحديد التقدم المتوقع (expectedId)
    let expectedIndex = 0;
    if (type === 'Hifz') {
        expectedIndex = studentData.hifz_progress || 0;
    } else if (type === 'Murajaa') {
        expectedIndex = studentData.murajaa_progress || 0;
    } else if (type === 'Child') {
        expectedIndex = studentData.child_tasks_progress || 0;
    }

    // التحقق من أن الطالب يطالب بالمهمة الصحيحة (التقدم الحالي)
    if (type === 'Child' && taskIdentifier !== taskBankChild[expectedIndex]?.id) {
         alert("هذه ليست المهمة التسلسلية التالية المطلوبة. يرجى إكمال المهمة السابقة.");
         return;
    } 

    const taskDetails = {
        description: description,
        points_value: points,
        task_type: `${type} تسلسلي`,
        // إضافة الحقل المناسب (curriculum_id للمناهج، bank_id للأطفال)
        curriculum_id: (type !== 'Child' ? taskIdentifier : undefined), 
        bank_id: (type === 'Child' ? taskIdentifier : undefined), 
        audio_url: audioUrl, // إضافة رابط الصوت
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
    let murajaa_progress = studentData.murajaa_progress || 0;
    let child_tasks_progress = studentData.child_tasks_progress || 0; // 💡 التعديل

    // المنطق التسلسلي (Hifz/Murajaa/Child)
    if (task.task_type === "Hifz تسلسلي") {
        hifz_progress++;
    } else if (task.task_type === "Murajaa تسلسلي") {
        murajaa_progress++;
    } else if (task.task_type === "Child تسلسلي") { // 💡 التعديل
        child_tasks_progress++;
    }

    try {
        const batch = db.batch();
        
        // تحديث وثيقة الطالب
        const studentRef = db.collection('tasks').doc(studentId);
        batch.update(studentRef, {
            score: newScore,
            tasks: updatedTasks,
            hifz_progress: hifz_progress,
            murajaa_progress: murajaa_progress,
            child_tasks_progress: child_tasks_progress // 💡 التعديل
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

    const addChildBankTaskForm = document.getElementById('add-child-bank-task-form');
    if (addChildBankTaskForm) {
        addChildBankTaskForm.removeEventListener('submit', handleAddChildBankTask);
        addChildBankTaskForm.addEventListener('submit', handleAddChildBankTask);
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
    renderBankTasks(); // الآن يعرض بنك المهام العادي
    renderChildBankTasks(); // 💡 دالة جديدة لعرض بنك مهام الأطفال
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
                
                // 💡 إذا كانت المهمة تحتوي على رابط صوتي، أضف رمزاً
                let audioIcon = task.audio_url ? '<i class="fas fa-volume-up text-danger me-2"></i>' : '';
                
                item.innerHTML = `
                    <div>
                        <p class="mb-1 fw-bold">${audioIcon}${task.description} (${task.points_value} نقطة)</p>
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


// 💡 دالة إضافة طالب جديد (مُعدّلة لإضافة فئة الطالب والتقدم)
async function handleAddNewStudent(e) {
    e.preventDefault();

    const studentId = document.getElementById('new-student-id').value.trim();
    const studentName = document.getElementById('new-student-name').value.trim();
    const initialHifz = parseInt(document.getElementById('initial-hifz-progress').value) || 0;
    const initialMurajaa = parseInt(document.getElementById('initial-murajaa-progress').value) || 0;
    
    // 💡 التعديل الجديد: الحصول على فئة الطالب
    const studentCategory = document.getElementById('new-student-category').value; 

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
        student_category: studentCategory, // 💡 إضافة الفئة
        child_tasks_progress: 0 // 💡 إضافة تقدم مهام الأطفال
    };

    try {
        await db.collection('tasks').doc(studentId).set(newStudentData);

        alert(`🎉 تم إضافة الطالب ${studentName} (${studentId}) بنجاح! الفئة: ${studentCategory}`);
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


// دوال إدارة بنك المهام العادي (1 نقطة)

// 💡 تعديل الدالة لتستخدم TaskBank_Regular
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

// 💡 تعديل الدالة لتستخدم TaskBank_Regular
async function deleteBankTask(taskId) {
    if (!confirm("هل أنت متأكد من حذف هذه المهمة من بنك المهام الجاهزة؟")) return;

    const taskToRemove = taskBankRegular.find(t => t.id === taskId);
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

// 💡 تعديل الدالة لعرض بنك المهام العادي
function renderBankTasks() {
    const listContainer = document.getElementById('bank-tasks-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (taskBankRegular.length === 0) {
        listContainer.innerHTML = '<div class="alert alert-info m-0">لا توجد مهام إضافية جاهزة حالياً (عادي).</div>';
        return;
    }

    taskBankRegular.forEach(task => {
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


// دوال إدارة بنك مهام الأطفال (10 نقاط + مقطع صوتي) 💡 جديدة

// دالة إضافة مهمة لبنك مهام الأطفال (مُعدّلة لدعم الرفع الصوتي)
async function handleAddChildBankTask(e) {
    e.preventDefault();
    const description = document.getElementById('child-bank-task-description').value.trim();
    // 💡 التعديل: جلب الملف الصوتي من حقل الإدخال
    const audioFile = document.getElementById('child-bank-audio-file').files[0]; 
    
    if (!description) {
        alert("الرجاء إدخال وصف المهمة.");
        return;
    }

    if (!audioFile) {
        alert("الرجاء تحديد مقطع صوتي للمهمة.");
        return;
    }
    
    // 1. رفع الملف الصوتي والحصول على الرابط
    const audioUrl = await uploadAudioFile(audioFile);
    if (!audioUrl) return; // توقف إذا فشل الرفع

    const newTask = {
        id: Date.now(),
        description: description,
        points: CHILD_TASK_POINTS, // النقاط ثابتة على 10
        type: "طفل",
        audio_url: audioUrl // تخزين رابط المقطع الصوتي
    };

    try {
        await db.collection('Settings').doc('TaskBank_Child').set({
            tasks: firebase.firestore.FieldValue.arrayUnion(newTask)
        }, { merge: true });

        alert(`تم إضافة المهمة "${description}" إلى بنك مهام الأطفال (10 نقاط) مع مقطع صوتي.`);
        e.target.reset();
        await loadTaskBank();
        renderChildBankTasks(); 
        populateBulkTaskSelect(); 
    } catch (error) {
        console.error("خطأ في إضافة المهمة لبنك مهام الأطفال:", error);
        alert("فشل إضافة المهمة لبنك مهام الأطفال.");
    }
}

// دالة حذف مهمة من بنك مهام الأطفال
async function deleteChildBankTask(taskId) {
    if (!confirm("هل أنت متأكد من حذف هذه المهمة من بنك مهام الأطفال؟")) return;

    const taskToRemove = taskBankChild.find(t => t.id === taskId);
    if (!taskToRemove) return;

    try {
        await db.collection('Settings').doc('TaskBank_Child').update({
            tasks: firebase.firestore.FieldValue.arrayRemove(taskToRemove)
        });

        alert(`تم حذف المهمة بنجاح.`);
        await loadTaskBank();
        renderChildBankTasks();
        populateBulkTaskSelect();
    } catch (error) {
        console.error("خطأ في حذف المهمة من بنك مهام الأطفال:", error);
        alert("فشل حذف المهمة من بنك مهام الأطفال.");
    }
}

// دالة عرض مهام بنك الأطفال
function renderChildBankTasks() {
    const listContainer = document.getElementById('child-bank-tasks-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (taskBankChild.length === 0) {
        listContainer.innerHTML = '<div class="alert alert-info m-0">لا توجد مهام إضافية للأطفال حالياً.</div>';
        return;
    }

    taskBankChild.forEach(task => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        let audioIcon = task.audio_url ? '<i class="fas fa-volume-up text-danger me-2"></i>' : '';
        
        item.innerHTML = `
            <span>${audioIcon}${task.description} (${task.points} نقطة)</span>
            <button class="btn btn-sm btn-danger" onclick="deleteChildBankTask(${task.id})">
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

    // دمج المهام من البنكين مع إشارة للنوع
    
    // بنك العادي (Regular)
    taskBankRegular.forEach((task) => { 
        const option = document.createElement('option');
        option.value = JSON.stringify({ description: task.description, points: task.points, type: "من البنك العادي" });
        option.textContent = `[عادي] ${task.description} (${task.points} نقطة)`;
        select.appendChild(option);
    });

    // بنك الأطفال (Child)
    taskBankChild.forEach((task) => { 
        const option = document.createElement('option');
        // هنا يجب أن نحذر: لا يمكننا تعيين مهام الأطفال التسلسلية باستخدام الإضافة الجماعية العادية.
        // يجب إضافة المهام اليدوية من البنك العادي فقط، أو يجب أن يتم الإضافة من خلال واجهة منفصلة.
        // سنسمح بإضافة مهام بنك الأطفال هنا فقط إذا كانت ستُعامل كمهام يدوية إضافية وليست تسلسلية.
        // للحفاظ على منطق التسلسل، **سنقوم بفلترة مهام الأطفال التسلسلية من هذا الحقل**
        // حتى لا يحدث تداخل، المعلم يجب أن يستخدم واجهة الأطفال المنفصلة.
        // 💡 بما أن مهام الأطفال أصبحت تسلسلية، نترك القائمة كما هي (بمهام البنك العادي فقط)
        // إذا أردت إضافة مهام يدوية عشوائية من بنك الأطفال، يجب أن نغير نوع المهمة هنا.
        
        // 🚨 لتجنب تداخل المنطق: لن نسمح بإضافة مهام الأطفال التسلسلية عبر الإضافة الجماعية العامة.
    });
}

function populateBulkStudentSelect() {
    const select = document.getElementById('bulk-student-select');
    if (!select) return; 
    select.innerHTML = '';
    
    Object.values(allStudentsData).forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.student_name} (${student.id}) - الفئة: ${student.student_category || 'غير محدد'}`;
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
        points_value: taskData.points, // النقاط من البنك
        release_date: date,
        release_time: time,
        task_type: "من البنك",
        status: "pending"
    };

    try {
        const batch = db.batch();
        let successfulAdds = 0;

        for (const studentId of selectedStudentIds) {
            if (allStudentsData[studentId]) { // التأكد من أن الطالب موجود
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
            await loadAllStudentsData(); // إعادة تحميل بيانات الطلاب لتحديث الواجهة
            renderTeacherReviewList(); // تحديث لوحة المعلم بعد الإضافة
            // إذا كان الطالب النشط الحالي من ضمن الذين تم إضافة المهام لهم
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
