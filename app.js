// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// مراجع لمجموعات البيانات
const studentsCollection = db.collection('students');
const tasksBankCollection = db.collection('tasksBank');
const curriculumCollection = db.collection('curriculum');

let currentStudentId = null;
let currentStudentData = null;
let studentDataListener = null; // للاحتفاظ بمرجع لمستمع بيانات الطالب

// --- 1. وظائف تسجيل الدخول والخروج ---

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentIdInput = document.getElementById('student-id').value;
    await login(studentIdInput);
});

async function login(id) {
    if (id === 'teacher') {
        currentStudentId = 'teacher';
        showTeacherScreen();
        await loadTeacherDashboard();
    } else {
        const studentDoc = await studentsCollection.doc(id).get();
        if (studentDoc.exists) {
            currentStudentId = id;
            currentStudentData = studentDoc.data();
            console.log("Logged in as student:", currentStudentData); // For debugging
            showTasksScreen(id);
            setupStudentRealtimeListener(id); // بدء الاستماع للتحديثات في الوقت الفعلي
        } else {
            alert('رمز الطالب غير موجود!');
        }
    }
}

function setupStudentRealtimeListener(studentId) {
    // إلغاء الاستماع القديم إذا كان موجودًا
    if (studentDataListener) {
        studentDataListener(); 
    }

    studentDataListener = studentsCollection.doc(studentId).onSnapshot(async (doc) => {
        if (doc.exists) {
            currentStudentData = doc.data();
            console.log("Student data updated:", currentStudentData); // For debugging
            await updateStudentDashboard();
        } else {
            console.log("Student document no longer exists, logging out.");
            logout();
        }
    }, (error) => {
        console.error("Error listening to student data:", error);
        alert("حدث خطأ أثناء تحميل بيانات الطالب: " + error.message);
        logout();
    });
}


// --- 2. وظائف لوحة تحكم الطالب ---

async function updateStudentDashboard() {
    if (!currentStudentData) return;

    document.getElementById('student-info-name').textContent = `الطالب: ${currentStudentData.name}`;
    document.getElementById('student-info-score').textContent = `النقاط: ${currentStudentData.score || 0}`;

    await renderCurriculumProgress();
    await displayStudentTasks();
}

async function renderCurriculumProgress() {
    const progressContainer = document.getElementById('progress-container');
    progressContainer.innerHTML = 'جاري تحميل التقدم...';

    const hifzProgress = currentStudentData.hifz_progress || 0;
    const murajaaProgress = currentStudentData.murajaa_progress || 0;

    const hifzCurriculumDocs = await curriculumCollection.where('type', '==', 'Hifz').orderBy('id').get();
    const murajaaCurriculumDocs = await curriculumCollection.where('type', '==', 'Murajaa').orderBy('id').get();

    const hifzCurriculum = hifzCurriculumDocs.docs.map(doc => doc.data());
    const murajaaCurriculum = murajaaCurriculumDocs.docs.map(doc => doc.data());

    // تحديث لوحة التقدم هنا
    progressContainer.innerHTML = `
        <p>تقدم الحفظ: ${hifzCurriculum.filter(t => t.id <= hifzProgress).length} / ${hifzCurriculum.length}</p>
        <div class="progress mb-2" role="progressbar" aria-label="Hifz Progress" aria-valuenow="${(hifzProgress / hifzCurriculum.length) * 100}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar bg-success" style="width: ${hifzCurriculum.length > 0 ? (hifzProgress / hifzCurriculum.length) * 100 : 0}%"></div>
        </div>
        <p>تقدم المراجعة: ${murajaaCurriculum.filter(t => t.id <= murajaaProgress).length} / ${murajaaCurriculum.length}</p>
        <div class="progress" role="progressbar" aria-label="Murajaa Progress" aria-valuenow="${(murajaaProgress / murajaaCurriculum.length) * 100}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar bg-info" style="width: ${murajaaCurriculum.length > 0 ? (murajaaProgress / murajaaCurriculum.length) * 100 : 0}%"></div>
        </div>
    `;
}


async function displayStudentTasks() {
    const tasks = await getCurrentCurriculumTasks(currentStudentId);
    console.log("Displaying tasks:", tasks); // For debugging
    renderTasks(currentStudentData, tasks);
}

// 🔑 دالة عرض المهام المعدلة لاستخدام الـ Accordion
function renderTasks(studentData, taskList) {
    // 🔑 جلب الحاويات الجديدة بدلاً من tasks-container
    const hifzContainer = document.getElementById('hifz-tasks-list');
    const murajaaContainer = document.getElementById('murajaa-tasks-list');
    const otherContainer = document.getElementById('other-tasks-list');
    
    // تفريغ الحاويات قبل البدء في ملئها بالبيانات الجديدة
    hifzContainer.innerHTML = '';
    murajaaContainer.innerHTML = '';
    otherContainer.innerHTML = '';

    const studentTasksInDb = studentData.tasks || [];
    const noTasksMessage = document.getElementById('no-tasks-message');
    
    // حالة لا توجد مهام
    if (taskList.length === 0) {
        noTasksMessage.classList.remove('d-none');
        document.getElementById('tasks-accordion').classList.add('d-none');
        return;
    }
    noTasksMessage.classList.add('d-none');
    document.getElementById('tasks-accordion').classList.remove('d-none');

    // متغيرات لتتبع ما إذا كانت هناك مهام في كل قسم لإخفاء/إظهار الأكورديون (اختياري)
    let hifzCount = 0;
    let murajaaCount = 0;
    let otherCount = 0;

    // توزيع المهام على الحاويات المختلفة
    taskList.forEach((task) => {
        let cardClass = 'manual-card';
        let iconHtml = '<i class="fas fa fa-star text-warning me-2"></i>'; // أيقونة افتراضية
        let actionButton = '';
        let targetContainer = otherContainer; // الافتراضي: المهام اليدوية/البنكية
        let taskTypeDisplay = task.task_type;

        // 1. تحديد نوع المهمة والتنسيق والحاوية المستهدفة
        if (task.is_curriculum_task) {
            
            if (task.curriculum_type === 'Hifz') {
                cardClass = 'hifz-card';
                iconHtml = '<i class="fas fa-quran text-success me-2"></i>';
                targetContainer = hifzContainer; // تعيين حاوية الحفظ
                hifzCount++;
            } else if (task.curriculum_type === 'Murajaa') {
                cardClass = 'murajaa-card';
                iconHtml = '<i class="fas fa-redo-alt text-info me-2"></i>';
                targetContainer = murajaaContainer; // تعيين حاوية المراجعة
                murajaaCount++;
            }

            // البحث عن حالة المهمة في قائمة الطالب 
            const taskActiveInDb = studentTasksInDb.find(t =>
                t.curriculum_id === task.curriculum_id &&
                (t.task_type === "Hifz تسلسلي" && task.curriculum_type === 'Hifz' || 
                 t.task_type === "Murajaa تسلسلي" && task.curriculum_type === 'Murajaa')
            );
            
            // تحديد حالة المهمة المعروضة (للتلوين وزر الإجراء)
            const currentStatus = taskActiveInDb ? taskActiveInDb.status : 'available';

            // منطق أزرار المهام التسلسلية
            if (currentStatus === "claimed") {
                // الحفظ أو المراجعة في انتظار المراجعة (Claimed)
                cardClass += ' claimed-card';
                actionButton = `<button class="btn btn-warning btn-sm" disabled><i class="fas fa-hourglass-half"></i> قيد مراجعة المعلم</button>`;
            } 
            else {
                // زر إنجاز المهام التسلسلية (المتاحة)
                actionButton = `<button class="btn btn-primary" onclick="claimCurriculumTask('${task.curriculum_type}', ${task.curriculum_id}, ${task.points_value}, '${task.description.replace(/'/g, "\\'")}')"><i class="fas fa-check"></i> تم الإنجاز</button>`;
            }

        }
        else {
            // مهام يدوية أو من البنك (تستهدف otherContainer)
            const originalIndex = studentTasksInDb.findIndex(t =>
                t.description === task.description &&
                t.points_value === task.points_value &&
                t.status === task.status
            );
            if (originalIndex === -1) return;
            otherCount++;

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

        // 2. بناء العنصر وإضافته للحاوية المستهدفة
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
        // 🔑 إلحاق المهمة بالحاوية الصحيحة
        targetContainer.appendChild(taskElement);
    });
    
    // **تحديث العناوين لتظهر عدد المهام (اختياري)**
    // يمكن هنا إخفاء أقسام الأكورديون التي لا تحتوي على مهام إذا أردت، لكن تركها ظاهرة أفضل لتعريف الطالب بالمسارات
}


async function getCurrentCurriculumTasks(studentId) {
    const studentDoc = await studentsCollection.doc(studentId).get();
    if (!studentDoc.exists) return [];

    const studentData = studentDoc.data();
    const hifzProgress = studentData.hifz_progress || 0;
    const murajaaProgress = studentData.murajaa_progress || 0;
    const studentTasks = studentData.tasks || [];

    const curriculumDocs = await curriculumCollection.orderBy('id').get();
    const allCurriculumTasks = curriculumDocs.docs.map(doc => doc.data());

    const combinedTasks = [];

    // إضافة مهمة الحفظ التالية (إذا لم يكتمل المنهج)
    const nextHifzTask = allCurriculumTasks.find(task => task.type === 'Hifz' && task.id === hifzProgress + 1);
    if (nextHifzTask) {
        const isClaimed = studentTasks.some(t => t.curriculum_id === nextHifzTask.id && t.task_type === "Hifz تسلسلي" && t.status === "claimed");
        combinedTasks.push({
            id: `hifz-${nextHifzTask.id}`, // معرف فريد للمهمة في الواجهة
            description: `حفظ ${nextHifzTask.description}`,
            points_value: nextHifzTask.points,
            is_curriculum_task: true,
            curriculum_type: 'Hifz',
            curriculum_id: nextHifzTask.id,
            status: isClaimed ? 'claimed' : 'available', // حالة المهمة: متاحة أو قيد المراجعة
            task_type: "Hifz تسلسلي"
        });
    }

    // إضافة مهمة المراجعة التالية (إذا لم يكتمل المنهج)
    const nextMurajaaTask = allCurriculumTasks.find(task => task.type === 'Murajaa' && task.id === murajaaProgress + 1);
    if (nextMurajaaTask) {
        const isClaimed = studentTasks.some(t => t.curriculum_id === nextMurajaaTask.id && t.task_type === "Murajaa تسلسلي" && t.status === "claimed");
        combinedTasks.push({
            id: `murajaa-${nextMurajaaTask.id}`, // معرف فريد للمهمة في الواجهة
            description: `مراجعة ${nextMurajaaTask.description}`,
            points_value: nextMurajaaTask.points,
            is_curriculum_task: true,
            curriculum_type: 'Murajaa',
            curriculum_id: nextMurajaaTask.id,
            status: isClaimed ? 'claimed' : 'available', // حالة المهمة: متاحة أو قيد المراجعة
            task_type: "Murajaa تسلسلي"
        });
    }
    
    // إضافة المهام اليدوية والبنكية المعلقة أو قيد المراجعة
    const otherTasks = studentTasks.filter(task => 
        !task.is_curriculum_task && (task.status === "pending" || task.status === "claimed")
    );
    otherTasks.forEach(task => {
        combinedTasks.push({
            id: task.id || Date.now() + Math.random(), // تأكد من وجود ID فريد أو أنشئه
            description: task.description,
            points_value: task.points_value,
            is_curriculum_task: false,
            status: task.status,
            task_type: task.task_type // سيكون "Manual" أو "Bank"
        });
    });

    // إزالة التكرارات بناءً على حقل فريد إذا كانت هناك فرصة للتكرار
    const uniqueCombinedTasks = [];
    const seen = new Set();
    combinedTasks.forEach(task => {
        // استخدم معرف مركب للتمييز بين المهام المتشابهة في الوصف ولكن مختلفة في النوع أو الـ ID التسلسلي
        const identifier = task.is_curriculum_task 
            ? `${task.curriculum_type}-${task.curriculum_id}-${task.status}`
            : `${task.description}-${task.points_value}-${task.status}`;

        if (!seen.has(identifier)) {
            uniqueCombinedTasks.push(task);
            seen.add(identifier);
        }
    });

    return uniqueCombinedTasks;
}


async function claimCurriculumTask(type, curriculumId, points, description) {
    if (!currentStudentId || !currentStudentData) return;

    const studentDocRef = studentsCollection.doc(currentStudentId);
    
    // التحقق مرة أخرى لتجنب المشاكل في التزامن
    const currentStudentDoc = await studentDocRef.get();
    const studentTasks = currentStudentDoc.data().tasks || [];

    // التحقق مما إذا كانت المهمة قد تمت المطالبة بها بالفعل
    const isAlreadyClaimed = studentTasks.some(t => 
        t.curriculum_id === curriculumId && 
        ((type === 'Hifz' && t.task_type === 'Hifz تسلسلي') || (type === 'Murajaa' && t.task_type === 'Murajaa تسلسلي')) &&
        t.status === "claimed"
    );

    if (isAlreadyClaimed) {
        alert('لقد قمت بالفعل بإنجاز هذه المهمة وهي قيد مراجعة المعلم.');
        return;
    }

    // إضافة المهمة إلى قائمة مهام الطالب كـ "claimed"
    const newTask = {
        task_id: db.collection('dummy').doc().id, // لإنشاء ID فريد لكل مهمة يتم إنجازها
        description: description,
        points_value: points,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: "claimed", // تم الإنجاز بواسطة الطالب، تنتظر مراجعة المعلم
        is_curriculum_task: true,
        curriculum_type: type,
        curriculum_id: curriculumId,
        task_type: `${type} تسلسلي`
    };

    await studentDocRef.update({
        tasks: firebase.firestore.FieldValue.arrayUnion(newTask)
    });

    alert('تم إنجاز المهمة بنجاح! في انتظار مراجعة المعلم.');
    // لا حاجة لإعادة تحميل لوحة التحكم هنا لأن المستمع في الوقت الفعلي سيتولى ذلك
}


async function processTaskClaim(taskIndex) {
    if (!currentStudentId || !currentStudentData || taskIndex === undefined) return;

    const studentDocRef = studentsCollection.doc(currentStudentId);
    const currentStudentDoc = await studentDocRef.get();
    let tasks = currentStudentDoc.data().tasks || [];

    if (taskIndex >= 0 && taskIndex < tasks.length) {
        tasks[taskIndex].status = "claimed"; // الطالب ينجزها
        await studentDocRef.update({ tasks: tasks });
        alert('تم إنجاز المهمة، في انتظار مراجعة المعلم.');
    }
}

async function processTaskUndo(taskIndex) {
    if (!currentStudentId || !currentStudentData || taskIndex === undefined) return;

    const studentDocRef = studentsCollection.doc(currentStudentId);
    const currentStudentDoc = await studentDocRef.get();
    let tasks = currentStudentDoc.data().tasks || [];

    if (taskIndex >= 0 && taskIndex < tasks.length) {
        // إزالة المهمة من قائمة الطالب تمامًا
        tasks.splice(taskIndex, 1); 
        await studentDocRef.update({ tasks: tasks });
        alert('تم إلغاء المهمة.');
    }
}


// --- 3. وظائف لوحة تحكم المعلم ---

let teacherDataListeners = []; // مصفوفة لتخزين مستمعي المعلم

async function loadTeacherDashboard() {
    console.log("Loading teacher dashboard...");
    // إلغاء أي مستمعين سابقين للمعلم
    teacherDataListeners.forEach(unsubscribe => unsubscribe());
    teacherDataListeners = []; // مسح المصفوفة

    // الاستماع لمهام المراجعة
    const reviewTasksListener = studentsCollection.onSnapshot(snapshot => {
        let pendingReviews = [];
        snapshot.forEach(doc => {
            const student = doc.data();
            const studentId = doc.id;
            (student.tasks || []).forEach((task, index) => {
                if (task.status === 'claimed') {
                    pendingReviews.push({
                        studentId: studentId,
                        studentName: student.name,
                        taskDescription: task.description,
                        taskPoints: task.points_value,
                        taskIndex: index,
                        isCurriculum: task.is_curriculum_task,
                        curriculumType: task.curriculum_type,
                        curriculumId: task.curriculum_id,
                        actualTaskId: task.task_id // المعرف الفريد للمهمة
                    });
                }
            });
        });
        renderReviewTasks(pendingReviews);
    }, error => console.error("Error fetching review tasks:", error));
    teacherDataListeners.push(reviewTasksListener);

    // الاستماع لقائمة الطلاب لتعبئة قوائم الاختيار
    const studentsListener = studentsCollection.onSnapshot(snapshot => {
        const studentSelect = document.getElementById('bulk-student-select');
        studentSelect.innerHTML = ''; // تفريغ القائمة
        snapshot.forEach(doc => {
            const student = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${student.name} (${doc.id})`;
            studentSelect.appendChild(option);
        });
    }, error => console.error("Error fetching students for select:", error));
    teacherDataListeners.push(studentsListener);

    // الاستماع لبنك المهام
    const tasksBankListener = tasksBankCollection.onSnapshot(snapshot => {
        const bulkTaskSelect = document.getElementById('bulk-task-select');
        const bankTasksList = document.getElementById('bank-tasks-list');
        bulkTaskSelect.innerHTML = '<option value="">اختر مهمة جاهزة</option>'; // إضافة خيار افتراضي
        bankTasksList.innerHTML = '';

        snapshot.forEach(doc => {
            const task = doc.data();
            // لـ bulk-task-select
            const selectOption = document.createElement('option');
            selectOption.value = doc.id; // استخدام ID المستند كقيمة
            selectOption.textContent = task.description;
            bulkTaskSelect.appendChild(selectOption);

            // لـ bank-tasks-list
            const listItem = document.createElement('div');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                ${task.description}
                <button class="btn btn-danger btn-sm" onclick="deleteBankTask('${doc.id}')"><i class="fas fa-trash"></i></button>
            `;
            bankTasksList.appendChild(listItem);
        });
    }, error => console.error("Error fetching tasks bank:", error));
    teacherDataListeners.push(tasksBankListener);

    // الاستماع للمنهج المركزي
    const curriculumListener = curriculumCollection.orderBy('id').onSnapshot(snapshot => {
        const curriculumStatus = document.getElementById('curriculum-status');
        curriculumStatus.innerHTML = '';
        snapshot.forEach(doc => {
            const task = doc.data();
            const item = document.createElement('div');
            item.className = `alert alert-${task.type === 'Hifz' ? 'success' : 'info'} p-2 mb-1 d-flex justify-content-between align-items-center`;
            item.innerHTML = `
                <span>${task.id}. ${task.description} (${task.type} - ${task.points} نقاط)</span>
                <button class="btn btn-danger btn-sm" onclick="deleteCurriculumTask(${task.id}, '${task.type}')"><i class="fas fa-trash"></i></button>
            `;
            curriculumStatus.appendChild(item);
        });
        if (snapshot.empty) {
            curriculumStatus.innerHTML = '<div class="alert alert-warning">لا توجد مهام في المنهج المركزي بعد.</div>';
        }
    }, error => console.error("Error fetching curriculum:", error));
    teacherDataListeners.push(curriculumListener);
    
    // تحميل لوحة الشرف
    await renderLeaderboard();
}

function renderReviewTasks(tasks) {
    const reviewContainer = document.getElementById('review-tasks-container');
    const reviewCountSpan = document.getElementById('review-count');
    reviewContainer.innerHTML = '';
    reviewCountSpan.textContent = tasks.length;

    if (tasks.length === 0) {
        reviewContainer.innerHTML = '<div class="alert alert-light text-center"><i class="fas fa-check-circle me-2"></i> لا توجد مهام تنتظر المراجعة حاليًا.</div>';
        return;
    }

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'list-group-item d-flex justify-content-between align-items-center';
        taskElement.innerHTML = `
            <div>
                <strong>${task.studentName} (${task.studentId})</strong>: ${task.taskDescription} (${task.taskPoints} نقاط)
            </div>
            <div>
                <button class="btn btn-success btn-sm me-2" onclick="approveTask('${task.studentId}', '${task.actualTaskId}', ${task.taskPoints}, ${task.isCurriculum}, '${task.curriculumType}', ${task.curriculumId})"><i class="fas fa-check"></i> موافقة</button>
                <button class="btn btn-danger btn-sm" onclick="rejectTask('${task.studentId}', '${task.actualTaskId}')"><i class="fas fa-times"></i> رفض</button>
            </div>
        `;
        reviewContainer.appendChild(taskElement);
    });
}

async function approveTask(studentId, taskId, points, isCurriculum, curriculumType, curriculumId) {
    const studentDocRef = studentsCollection.doc(studentId);
    await db.runTransaction(async (transaction) => {
        const studentDoc = await transaction.get(studentDocRef);
        if (!studentDoc.exists) {
            throw "Student does not exist!";
        }

        let studentData = studentDoc.data();
        let tasks = studentData.tasks || [];
        let score = studentData.score || 0;
        let hifzProgress = studentData.hifz_progress || 0;
        let murajaaProgress = studentData.murajaa_progress || 0;

        const taskIndex = tasks.findIndex(t => t.task_id === taskId && t.status === "claimed");

        if (taskIndex > -1) {
            // المهمة التسلسلية (حفظ/مراجعة)
            if (isCurriculum) {
                if (curriculumType === 'Hifz' && curriculumId === hifzProgress + 1) {
                    hifzProgress++;
                } else if (curriculumType === 'Murajaa' && curriculumId === murajaaProgress + 1) {
                    murajaaProgress++;
                } else {
                    // إذا كان هناك عدم تطابق، قد يعني ذلك أن المعلم وافق على مهمة غير متسلسلة أو تم تغيير التقدم.
                    // يمكن التعامل مع هذا بخيارات أكثر تعقيدًا أو تنبيه المعلم.
                    console.warn(`Attempted to approve curriculum task ${curriculumType}-${curriculumId} out of sequence for student ${studentId}.`);
                }
            }
            
            // إزالة المهمة من قائمة المهام الحالية بعد الموافقة
            tasks.splice(taskIndex, 1);
            score += points; // إضافة النقاط

            transaction.update(studentDocRef, {
                tasks: tasks,
                score: score,
                hifz_progress: hifzProgress,
                murajaa_progress: murajaaProgress
            });
            alert('تمت الموافقة على المهمة بنجاح وخصمها من قائمة المراجعة!');
        } else {
            alert('المهمة غير موجودة أو لم تعد بحالة "قيد المراجعة". قد تكون تمت معالجتها بالفعل.');
        }
    }).catch((error) => {
        console.error("Transaction failed: ", error);
        alert("حدث خطأ أثناء معالجة المهمة: " + error.message);
    });
}

async function rejectTask(studentId, taskId) {
    const studentDocRef = studentsCollection.doc(studentId);
    await db.runTransaction(async (transaction) => {
        const studentDoc = await transaction.get(studentDocRef);
        if (!studentDoc.exists) {
            throw "Student does not exist!";
        }

        let studentData = studentDoc.data();
        let tasks = studentData.tasks || [];

        const taskIndex = tasks.findIndex(t => t.task_id === taskId && t.status === "claimed");

        if (taskIndex > -1) {
            tasks.splice(taskIndex, 1); // إزالة المهمة بالكامل
            transaction.update(studentDocRef, { tasks: tasks });
            alert('تم رفض المهمة وإزالتها من قائمة الطالب.');
        } else {
            alert('المهمة غير موجودة أو لم تعد بحالة "قيد المراجعة". قد تكون تمت معالجتها بالفعل.');
        }
    }).catch((error) => {
        console.error("Transaction failed: ", error);
        alert("حدث خطأ أثناء رفض المهمة: " + error.message);
    });
}


// --- 4. إدارة المهام (يدوية، بنكية، منهج) ---

// إضافة مهمة يدوية فردية
document.getElementById('add-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('new-task-student-id').value;
    const description = document.getElementById('new-task-description').value;
    const date = document.getElementById('new-task-date').value;
    const time = document.getElementById('new-task-time').value;

    const studentDocRef = studentsCollection.doc(studentId);
    const studentDoc = await studentDocRef.get();

    if (!studentDoc.exists) {
        alert('الطالب بهذا الرمز غير موجود!');
        return;
    }

    const newTask = {
        task_id: db.collection('dummy').doc().id, // معرف فريد لكل مهمة يدوية
        description: description,
        points_value: 1, // المهام اليدوية والبنكية 1 نقطة
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: "pending", // في انتظار إنجاز الطالب
        is_curriculum_task: false,
        task_type: "Manual",
        due_date: date ? new Date(`${date}T${time || '23:59:59'}`) : null
    };

    await studentDocRef.update({
        tasks: firebase.firestore.FieldValue.arrayUnion(newTask)
    });

    alert('تم تعيين المهمة للطالب بنجاح!');
    document.getElementById('add-task-form').reset();
});

// إضافة مهمة جماعية من البنك
document.getElementById('add-bulk-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const selectedTaskDocId = document.getElementById('bulk-task-select').value;
    const selectedStudentIds = Array.from(document.getElementById('bulk-student-select').selectedOptions).map(option => option.value);
    const date = document.getElementById('bulk-task-date').value;
    const time = document.getElementById('bulk-task-time').value;

    if (!selectedTaskDocId || selectedStudentIds.length === 0) {
        alert('يرجى اختيار مهمة وطلاب!');
        return;
    }

    const taskDoc = await tasksBankCollection.doc(selectedTaskDocId).get();
    if (!taskDoc.exists) {
        alert('المهمة المختارة غير موجودة في البنك!');
        return;
    }
    const taskDescription = taskDoc.data().description;

    for (const studentId of selectedStudentIds) {
        const studentDocRef = studentsCollection.doc(studentId);
        const newTask = {
            task_id: db.collection('dummy').doc().id, // معرف فريد لكل مهمة بنكية
            description: taskDescription,
            points_value: 1,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: "pending", // في انتظار إنجاز الطالب
            is_curriculum_task: false,
            task_type: "Bank",
            due_date: date ? new Date(`${date}T${time || '23:59:59'}`) : null
        };
        await studentDocRef.update({
            tasks: firebase.firestore.FieldValue.arrayUnion(newTask)
        });
    }

    alert(`تم تعيين المهمة "${taskDescription}" لـ ${selectedStudentIds.length} طلاب بنجاح!`);
    document.getElementById('add-bulk-task-form').reset();
});

// إضافة مهمة للمنهج المركزي (حفظ/مراجعة)
document.getElementById('add-curriculum-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.getElementById('curriculum-type-select').value;
    const description = document.getElementById('curriculum-description').value;

    const lastCurriculumTask = await curriculumCollection.where('type', '==', type).orderBy('id', 'desc').limit(1).get();
    const newId = lastCurriculumTask.empty ? 1 : lastCurriculumTask.docs[0].data().id + 1;
    const points = (type === 'Hifz') ? 5 : 3;

    await curriculumCollection.doc(`${type}-${newId}`).set({
        id: newId,
        type: type,
        description: description,
        points: points
    });

    alert(`تمت إضافة مهمة ${type} تسلسلية رقم ${newId} بنجاح!`);
    document.getElementById('add-curriculum-task-form').reset();
});

// حذف مهمة من المنهج المركزي
async function deleteCurriculumTask(id, type) {
    if (confirm(`هل أنت متأكد من حذف مهمة ${type} رقم ${id}؟ هذا سيؤثر على تقدم الطلاب!`)) {
        await curriculumCollection.doc(`${type}-${id}`).delete();
        alert('تم حذف المهمة من المنهج المركزي.');
    }
}

// إضافة مهمة لبنك المهام الجاهزة
document.getElementById('add-bank-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('bank-task-description').value;
    
    // استخدام add() لإنشاء مستند بـ ID تلقائي
    await tasksBankCollection.add({
        description: description,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert('تمت إضافة المهمة لبنك المهام.');
    document.getElementById('bank-task-description').value = '';
});

// حذف مهمة من بنك المهام
async function deleteBankTask(taskId) {
    if (confirm('هل أنت متأكد من حذف هذه المهمة من البنك؟')) {
        await tasksBankCollection.doc(taskId).delete();
        alert('تم حذف المهمة من بنك المهام.');
    }
}

// إضافة طالب جديد
document.getElementById('add-new-student-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newStudentId = document.getElementById('new-student-id').value;
    const newStudentName = document.getElementById('new-student-name').value;
    const initialHifzProgress = parseInt(document.getElementById('initial-hifz-progress').value);
    const initialMurajaaProgress = parseInt(document.getElementById('initial-murajaa-progress').value);

    const studentDoc = await studentsCollection.doc(newStudentId).get();
    if (studentDoc.exists) {
        alert('رمز الطالب هذا موجود بالفعل. يرجى اختيار رمز آخر.');
        return;
    }

    await studentsCollection.doc(newStudentId).set({
        name: newStudentName,
        score: 0,
        tasks: [],
        hifz_progress: initialHifzProgress,
        murajaa_progress: initialMurajaaProgress,
        created_at: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert(`تم تسجيل الطالب ${newStudentName} بنجاح!`);
    document.getElementById('add-new-student-form').reset();
});

// --- 5. لوحة الشرف ---
async function renderLeaderboard() {
    const leaderboardContainer = document.getElementById('leaderboard-container');
    leaderboardContainer.innerHTML = 'جاري تحميل لوحة الشرف...';

    const studentsSnapshot = await studentsCollection.orderBy('score', 'desc').limit(5).get();
    leaderboardContainer.innerHTML = ''; // تفريغ
    
    if (studentsSnapshot.empty) {
        leaderboardContainer.innerHTML = '<div class="alert alert-info text-center">لا يوجد طلاب بعد في لوحة الشرف.</div>';
        return;
    }

    let rank = 1;
    studentsSnapshot.forEach(doc => {
        const student = doc.data();
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <div>
                <span class="badge bg-primary rounded-pill me-2">${rank}</span>
                <strong>${student.name}</strong> (${doc.id})
            </div>
            <span class="badge bg-success rounded-pill">${student.score || 0} نقطة</span>
        `;
        leaderboardContainer.appendChild(item);
        rank++;
    });
}

// تحديث لوحة الشرف تلقائياً (يمكن ربطها بمستمع على collection الطلاب)
// للحفاظ على البساطة، سنقوم بتحديثها عند دخول المعلم فقط أو عند الحاجة.

// عند تبديل الأقسام في لوحة المعلم
document.querySelectorAll('.teacher-nav .nav-link').forEach(link => {
    link.addEventListener('click', async (e) => {
        const sectionId = e.target.id.replace('-tab', '');
        showTeacherSection(sectionId);
        if (sectionId === 'leaderboard') {
            await renderLeaderboard();
        }
    });
});

