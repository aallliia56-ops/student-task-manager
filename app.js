// لم نعد بحاجة إلى عبارات الـ import هنا لأننا سنستخدم Firebase من الكائنات العامة
// التي تم تحميلها عبر CDN في index.html.
// يجب أن يكون الكود داخل app.js قادرًا على الوصول إلى firebase.initializeApp,
// firebase.firestore, وما إلى ذلك.

// تهيئة Firebase لمشروعك (هذه هي البيانات التي أرسلتها أنت)
const firebaseConfig = {
    apiKey: "AIzaSyCeIcmuTd72sjiu1Uyijn_J4bMS0ChtXGo",
    authDomain: "studenttasksmanager.firebaseapp.com",
    projectId: "studenttasksmanager",
    storageBucket: "studenttasksmanager.firebasestorage.app",
    messagingSenderId: "850350680089",
    appId: "1:850350680089:web:51b71a710e938754bc6288",
    measurementId: "G-7QC4FVXKZG"
};

// تهيئة تطبيق Firebase
// استخدام firebase.initializeApp المتاح عالميًا بعد تحميل "firebase-app-compat.js"
const app = firebase.initializeApp(firebaseConfig);
// استخدام firebase.analytics المتاح عالميًا بعد تحميل "firebase-analytics-compat.js"
const analytics = firebase.analytics(); // إذا كنت تستخدم Analytics

// تهيئة Firestore
// استخدام firebase.firestore المتاح عالميًا بعد تحميل "firebase-firestore-compat.js"
const db = firebase.firestore(app);

// مراجع لمجموعات البيانات
// لا نستخدم collection, doc, getDoc, updateDoc, setDoc, deleteDoc, query, where, orderBy, limit, addDoc, serverTimestamp, arrayUnion, runTransaction, onSnapshot
// مباشرة من الاستيرادات، بل من كائن db الذي تم تهيئته.
const studentsCollection = db.collection('students');
const tasksBankCollection = db.collection('tasksBank');
const curriculumCollection = db.collection('curriculum');

let currentStudentId = null;
let currentStudentData = null;
let studentDataListener = null; // للاحتفاظ بمرجع لمستمع بيانات الطالب
let teacherDataListeners = []; // مصفوفة لتخزين مستمعي المعلم


// --- 1. وظائف تسجيل الدخول والخروج ---

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentIdInput = document.getElementById('student-id').value;
    await login(studentIdInput);
});

async function login(id) {
    if (id === 'teacher') {
        currentStudentId = 'teacher';
        window.showTeacherScreen(); // استدعاء دالة العرض من index.html
        await loadTeacherDashboard();
    } else {
        const studentDocRef = studentsCollection.doc(id); // استخدام db.collection(...).doc(...)
        const studentDoc = await studentDocRef.get(); // استخدام .get()
        
        if (studentDoc.exists) { // استخدام .exists
            currentStudentId = id;
            currentStudentData = studentDoc.data();
            console.log("Logged in as student:", currentStudentData);
            window.showTasksScreen(id); // استدعاء دالة العرض من index.html
            setupStudentRealtimeListener(id);
        } else {
            alert('رمز الطالب غير موجود!');
        }
    }
}

// دالة logout عامة يمكن استدعاؤها من index.html
window.appLogout = function() {
    currentStudentId = null;
    currentStudentData = null;
    if (studentDataListener) {
        studentDataListener(); // إلغاء مستمع الطالب
        studentDataListener = null;
    }
    teacherDataListeners.forEach(unsubscribe => unsubscribe()); // إلغاء مستمعي المعلم
    teacherDataListeners = [];
    window.showLoginScreen(); // استدعاء دالة العرض من index.html
};

function setupStudentRealtimeListener(studentId) {
    if (studentDataListener) {
        studentDataListener(); 
    }

    const studentDocRef = studentsCollection.doc(studentId); // استخدام db.collection(...).doc(...)
    studentDataListener = studentDocRef.onSnapshot(async (doc) => { // استخدام .onSnapshot
        if (doc.exists) {
            currentStudentData = doc.data();
            console.log("Student data updated:", currentStudentData);
            await updateStudentDashboard();
        } else {
            console.log("Student document no longer exists, logging out.");
            window.appLogout();
        }
    }, (error) => {
        console.error("Error listening to student data:", error);
        alert("حدث خطأ أثناء تحميل بيانات الطالب: " + error.message);
        window.appLogout();
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

    const hifzCurriculumQuery = curriculumCollection.where('type', '==', 'Hifz').orderBy('id'); // استخدام .where و .orderBy
    const murajaaCurriculumQuery = curriculumCollection.where('type', '==', 'Murajaa').orderBy('id'); // استخدام .where و .orderBy

    const hifzCurriculumSnapshot = await hifzCurriculumQuery.get(); // استخدام .get()
    const murajaaCurriculumSnapshot = await murajaaCurriculumQuery.get(); // استخدام .get()

    const hifzCurriculum = hifzCurriculumSnapshot.docs.map(d => d.data());
    const murajaaCurriculum = murajaaCurriculumSnapshot.docs.map(d => d.data());

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
    console.log("Displaying tasks:", tasks);
    renderTasks(currentStudentData, tasks);
}

function renderTasks(studentData, taskList) {
    const hifzContainer = document.getElementById('hifz-tasks-list');
    const murajaaContainer = document.getElementById('murajaa-tasks-list');
    const otherContainer = document.getElementById('other-tasks-list');
    
    hifzContainer.innerHTML = '';
    murajaaContainer.innerHTML = '';
    otherContainer.innerHTML = '';

    const studentTasksInDb = studentData.tasks || [];
    const noTasksMessage = document.getElementById('no-tasks-message');
    
    if (taskList.length === 0) {
        noTasksMessage.classList.remove('d-none');
        document.getElementById('tasks-accordion').classList.add('d-none');
        return;
    }
    noTasksMessage.classList.add('d-none');
    document.getElementById('tasks-accordion').classList.remove('d-none');

    taskList.forEach((task) => {
        let cardClass = 'manual-card';
        let iconHtml = '<i class="fas fa fa-star text-warning me-2"></i>';
        let actionButton = '';
        let targetContainer = otherContainer;
        let taskTypeDisplay = task.task_type;

        if (task.is_curriculum_task) {
            
            if (task.curriculum_type === 'Hifz') {
                cardClass = 'hifz-card';
                iconHtml = '<i class="fas fa-quran text-success me-2"></i>';
                targetContainer = hifzContainer;
            } else if (task.curriculum_type === 'Murajaa') {
                cardClass = 'murajaa-card';
                iconHtml = '<i class="fas fa-redo-alt text-info me-2"></i>';
                targetContainer = murajaaContainer;
            }

            const taskActiveInDb = studentTasksInDb.find(t =>
                t.curriculum_id === task.curriculum_id &&
                (t.task_type === "Hifz تسلسلي" && task.curriculum_type === 'Hifz' || 
                 t.task_type === "Murajaa تسلسلي" && task.curriculum_type === 'Murajaa')
            );
            
            const currentStatus = taskActiveInDb ? taskActiveInDb.status : 'available';

            if (currentStatus === "claimed") {
                cardClass += ' claimed-card';
                actionButton = `<button class="btn btn-warning btn-sm" disabled><i class="fas fa-hourglass-half"></i> قيد مراجعة المعلم</button>`;
            } 
            else {
                actionButton = `<button class="btn btn-primary" onclick="claimCurriculumTask('${task.curriculum_type}', ${task.curriculum_id}, ${task.points_value}, '${task.description.replace(/'/g, "\\'")}')"><i class="fas fa-check"></i> تم الإنجاز</button>`;
            }

        }
        else {
            // المهام اليدوية والبنكية تحتاج إلى تحديد موقعها في المصفوفة الأصلية للطالب بشكل فريد
            const taskInStudentData = studentTasksInDb.find(t => 
                t.task_id === task.task_id && t.status === task.status && t.task_type === task.task_type
            );
            if (!taskInStudentData) return; // هذه المهمة ليست للطالب أو حالتها مختلفة
            const originalIndex = studentTasksInDb.indexOf(taskInStudentData);

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
        targetContainer.appendChild(taskElement);
    });
}


async function getCurrentCurriculumTasks(studentId) {
    const studentDocRef = studentsCollection.doc(studentId); // استخدام db.collection(...).doc(...)
    const studentDoc = await studentDocRef.get(); // استخدام .get()

    if (!studentDoc.exists) return [];

    const studentData = studentDoc.data();
    const hifzProgress = studentData.hifz_progress || 0;
    const murajaaProgress = studentData.murajaa_progress || 0;
    const studentTasks = studentData.tasks || [];

    const curriculumQuery = curriculumCollection.orderBy('id'); // استخدام .orderBy
    const curriculumSnapshot = await curriculumQuery.get(); // استخدام .get()
    const allCurriculumTasks = curriculumSnapshot.docs.map(d => d.data());

    const combinedTasks = [];

    // إضافة مهمة الحفظ التالية
    const nextHifzTask = allCurriculumTasks.find(task => task.type === 'Hifz' && task.id === hifzProgress + 1);
    if (nextHifzTask) {
        const isClaimed = studentTasks.some(t => t.curriculum_id === nextHifzTask.id && t.task_type === "Hifz تسلسلي" && t.status === "claimed");
        combinedTasks.push({
            id: `hifz-${nextHifzTask.id}`,
            description: `حفظ ${nextHifzTask.description}`,
            points_value: nextHifzTask.points,
            is_curriculum_task: true,
            curriculum_type: 'Hifz',
            curriculum_id: nextHifzTask.id,
            status: isClaimed ? 'claimed' : 'available',
            task_type: "Hifz تسلسلي"
        });
    }

    // إضافة مهمة المراجعة التالية
    const nextMurajaaTask = allCurriculumTasks.find(task => task.type === 'Murajaa' && task.id === murajaaProgress + 1);
    if (nextMurajaaTask) {
        const isClaimed = studentTasks.some(t => t.curriculum_id === nextMurajaaTask.id && t.task_type === "Murajaa تسلسلي" && t.status === "claimed");
        combinedTasks.push({
            id: `murajaa-${nextMurajaaTask.id}`,
            description: `مراجعة ${nextMurajaaTask.description}`,
            points_value: nextMurajaaTask.points,
            is_curriculum_task: true,
            curriculum_type: 'Murajaa',
            curriculum_id: nextMurajaaTask.id,
            status: isClaimed ? 'claimed' : 'available',
            task_type: "Murajaa تسلسلي"
        });
    }
    
    // إضافة المهام اليدوية والبنكية المعلقة أو قيد المراجعة
    const otherTasks = studentTasks.filter(task => 
        !task.is_curriculum_task && (task.status === "pending" || task.status === "claimed")
    );
    otherTasks.forEach(task => {
        // يجب أن يكون لكل مهمة يدوية/بنكية task_id فريد عند إنشائها
        combinedTasks.push({
            id: task.task_id, 
            description: task.description,
            points_value: task.points_value,
            is_curriculum_task: false,
            status: task.status,
            task_type: task.task_type
        });
    });

    const uniqueCombinedTasks = [];
    const seen = new Set();
    combinedTasks.forEach(task => {
        // استخدم معرف مركب للتمييز بين المهام المتشابهة في الوصف ولكن مختلفة في النوع أو الـ ID التسلسلي أو الـ ID الفريد
        const identifier = task.is_curriculum_task 
            ? `${task.curriculum_type}-${task.curriculum_id}-${task.status}`
            : `${task.id}-${task.status}`; // استخدام task.id الفريد للمهام غير التسلسلية

        if (!seen.has(identifier)) {
            uniqueCombinedTasks.push(task);
            seen.add(identifier);
        }
    });

    return uniqueCombinedTasks;
}


window.claimCurriculumTask = async function(type, curriculumId, points, description) {
    if (!currentStudentId || !currentStudentData) return;

    const studentDocRef = studentsCollection.doc(currentStudentId); // استخدام db.collection(...).doc(...)
    
    const currentStudentDoc = await studentDocRef.get(); // استخدام .get()
    const studentTasks = currentStudentDoc.data().tasks || [];

    const isAlreadyClaimed = studentTasks.some(t => 
        t.curriculum_id === curriculumId && 
        ((type === 'Hifz' && t.task_type === 'Hifz تسلسلي') || (type === 'Murajaa' && t.task_type === 'Murajaa تسلسلي')) &&
        t.status === "claimed"
    );

    if (isAlreadyClaimed) {
        alert('لقد قمت بالفعل بإنجاز هذه المهمة وهي قيد مراجعة المعلم.');
        return;
    }

    const newTask = {
        task_id: studentsCollection.doc().id, // لإنشاء ID فريد
        description: description,
        points_value: points,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(), // استخدام firebase.firestore.FieldValue.serverTimestamp()
        status: "claimed",
        is_curriculum_task: true,
        curriculum_type: type,
        curriculum_id: curriculumId,
        task_type: `${type} تسلسلي`
    };

    await studentDocRef.update({ // استخدام .update()
        tasks: firebase.firestore.FieldValue.arrayUnion(newTask) // استخدام firebase.firestore.FieldValue.arrayUnion()
    });

    alert('تم إنجاز المهمة بنجاح! في انتظار مراجعة المعلم.');
};


window.processTaskClaim = async function(taskIndex) {
    if (!currentStudentId || !currentStudentData || taskIndex === undefined) return;

    const studentDocRef = studentsCollection.doc(currentStudentId);
    const currentStudentDoc = await studentDocRef.get();
    let tasks = currentStudentDoc.data().tasks || [];

    if (taskIndex >= 0 && taskIndex < tasks.length) {
        // إنشاء نسخة من المهمة وتغيير حالتها
        let updatedTasks = [...tasks];
        updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: "claimed" }; 
        await studentDocRef.update({ tasks: updatedTasks }); // استخدام .update()
        alert('تم إنجاز المهمة، في انتظار مراجعة المعلم.');
    }
};

window.processTaskUndo = async function(taskIndex) {
    if (!currentStudentId || !currentStudentData || taskIndex === undefined) return;

    const studentDocRef = studentsCollection.doc(currentStudentId);
    const currentStudentDoc = await studentDocRef.get();
    let tasks = currentStudentDoc.data().tasks || [];

    if (taskIndex >= 0 && taskIndex < tasks.length) {
        let updatedTasks = [...tasks];
        updatedTasks.splice(taskIndex, 1); 
        await studentDocRef.update({ tasks: updatedTasks }); // استخدام .update()
        alert('تم إلغاء المهمة.');
    }
};


// --- 3. وظائف لوحة تحكم المعلم ---

// جعل هذه الدالة متاحة عالميًا ليتم استدعاؤها من index.html
window.loadTeacherDashboard = async function() {
    console.log("Loading teacher dashboard...");
    teacherDataListeners.forEach(unsubscribe => unsubscribe());
    teacherDataListeners = [];

    const studentsQuery = studentsCollection; // استعلام لجلب جميع الطلاب
    const reviewTasksListener = studentsQuery.onSnapshot(snapshot => { // استخدام .onSnapshot
        let pendingReviews = [];
        snapshot.forEach(d => {
            const student = d.data();
            const studentId = d.id;
            (student.tasks || []).forEach((task, index) => {
                if (task.status === 'claimed') {
                    pendingReviews.push({
                        studentId: studentId,
                        studentName: student.name,
                        taskDescription: task.description,
                        taskPoints: task.points_value,
                        taskIndex: index, // هذا الـ index قد يصبح غير دقيق مع التحديثات، الأفضل استخدام task.task_id
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

    const studentsListener = studentsCollection.onSnapshot(snapshot => { // استخدام .onSnapshot
        const studentSelect = document.getElementById('bulk-student-select');
        studentSelect.innerHTML = '';
        snapshot.forEach(d => {
            const student = d.data();
            const option = document.createElement('option');
            option.value = d.id;
            option.textContent = `${student.name} (${d.id})`;
            studentSelect.appendChild(option);
        });
    }, error => console.error("Error fetching students for select:", error));
    teacherDataListeners.push(studentsListener);

    const tasksBankListener = tasksBankCollection.onSnapshot(snapshot => { // استخدام .onSnapshot
        const bulkTaskSelect = document.getElementById('bulk-task-select');
        const bankTasksList = document.getElementById('bank-tasks-list');
        bulkTaskSelect.innerHTML = '<option value="">اختر مهمة جاهزة</option>';
        bankTasksList.innerHTML = '';

        snapshot.forEach(d => {
            const task = d.data();
            // لـ bulk-task-select
            const selectOption = document.createElement('option');
            selectOption.value = d.id;
            selectOption.textContent = task.description;
            bulkTaskSelect.appendChild(selectOption);

            // لـ bank-tasks-list
            const listItem = document.createElement('div');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                ${task.description}
                <button class="btn btn-danger btn-sm" onclick="deleteBankTask('${d.id}')"><i class="fas fa-trash"></i></button>
            `;
            bankTasksList.appendChild(listItem);
        });
    }, error => console.error("Error fetching tasks bank:", error));
    teacherDataListeners.push(tasksBankListener);

    const curriculumQuery = curriculumCollection.orderBy('id'); // استخدام .orderBy
    const curriculumListener = curriculumQuery.onSnapshot(snapshot => { // استخدام .onSnapshot
        const curriculumStatus = document.getElementById('curriculum-status');
        curriculumStatus.innerHTML = '';
        snapshot.forEach(d => {
            const task = d.data();
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
    
    await renderLeaderboard();
};

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

window.approveTask = async function(studentId, taskId, points, isCurriculum, curriculumType, curriculumId) {
    const studentDocRef = studentsCollection.doc(studentId);
    await db.runTransaction(async (transaction) => { // استخدام db.runTransaction
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
            if (isCurriculum) {
                if (curriculumType === 'Hifz' && curriculumId === hifzProgress + 1) {
                    hifzProgress++;
                } else if (curriculumType === 'Murajaa' && curriculumId === murajaaProgress + 1) {
                    murajaaProgress++;
                } else {
                    console.warn(`Attempted to approve curriculum task ${curriculumType}-${curriculumId} out of sequence for student ${studentId}.`);
                }
            }
            
            // إزالة المهمة من قائمة المهام الحالية بعد الموافقة
            tasks.splice(taskIndex, 1);
            score += points;

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
};

window.rejectTask = async function(studentId, taskId) {
    const studentDocRef = studentsCollection.doc(studentId);
    await db.runTransaction(async (transaction) => { // استخدام db.runTransaction
        const studentDoc = await transaction.get(studentDocRef);
        if (!studentDoc.exists) {
            throw "Student does not exist!";
        }

        let studentData = studentDoc.data();
        let tasks = studentData.tasks || [];

        const taskIndex = tasks.findIndex(t => t.task_id === taskId && t.status === "claimed");

        if (taskIndex > -1) {
            tasks.splice(taskIndex, 1);
            transaction.update(studentDocRef, { tasks: tasks });
            alert('تم رفض المهمة وإزالتها من قائمة الطالب.');
        } else {
            alert('المهمة غير موجودة أو لم تعد بحالة "قيد المراجعة". قد تكون تمت معالجتها بالفعل.');
        }
    }).catch((error) => {
        console.error("Transaction failed: ", error);
        alert("حدث خطأ أثناء رفض المهمة: " + error.message);
    });
};


// --- 4. إدارة المهام (يدوية، بنكية، منهج) ---

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
        task_id: studentsCollection.doc().id, // معرف فريد
        description: description,
        points_value: 1,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: "pending",
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

    const taskDocRef = tasksBankCollection.doc(selectedTaskDocId);
    const taskDoc = await taskDocRef.get();
    if (!taskDoc.exists) {
        alert('المهمة المختارة غير موجودة في البنك!');
        return;
    }
    const taskDescription = taskDoc.data().description;

    for (const studentId of selectedStudentIds) {
        const studentDocRef = studentsCollection.doc(studentId);
        const newTask = {
            task_id: studentsCollection.doc().id, // معرف فريد
            description: taskDescription,
            points_value: 1,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: "pending",
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

document.getElementById('add-curriculum-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.getElementById('curriculum-type-select').value;
    const description = document.getElementById('curriculum-description').value;

    const lastCurriculumTaskQuery = curriculumCollection.where('type', '==', type).orderBy('id', 'desc').limit(1);
    const lastCurriculumTaskSnapshot = await lastCurriculumTaskQuery.get();
    const newId = lastCurriculumTaskSnapshot.empty ? 1 : lastCurriculumTaskSnapshot.docs[0].data().id + 1;
    const points = (type === 'Hifz') ? 5 : 3;

    await curriculumCollection.doc(`${type}-${newId}`).set({ // استخدام .doc().set()
        id: newId,
        type: type,
        description: description,
        points: points
    });

    alert(`تمت إضافة مهمة ${type} تسلسلية رقم ${newId} بنجاح!`);
    document.getElementById('add-curriculum-task-form').reset();
});

window.deleteCurriculumTask = async function(id, type) {
    if (confirm(`هل أنت متأكد من حذف مهمة ${type} رقم ${id}؟ هذا سيؤثر على تقدم الطلاب!`)) {
        await curriculumCollection.doc(`${type}-${id}`).delete(); // استخدام .doc().delete()
        alert('تم حذف المهمة من المنهج المركزي.');
    }
};

document.getElementById('add-bank-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('bank-task-description').value;
    
    await tasksBankCollection.add({ // استخدام .add()
        description: description,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert('تمت إضافة المهمة لبنك المهام.');
    document.getElementById('bank-task-description').value = '';
});

window.deleteBankTask = async function(taskId) {
    if (confirm('هل أنت متأكد من حذف هذه المهمة من البنك؟')) {
        await tasksBankCollection.doc(taskId).delete(); // استخدام .doc().delete()
        alert('تم حذف المهمة من بنك المهام.');
    }
};

document.getElementById('add-new-student-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newStudentId = document.getElementById('new-student-id').value;
    const newStudentName = document.getElementById('new-student-name').value;
    const initialHifzProgress = parseInt(document.getElementById('initial-hifz-progress').value);
    const initialMurajaaProgress = parseInt(document.getElementById('initial-murajaa-progress').value);

    const studentDocRef = studentsCollection.doc(newStudentId); // استخدام .doc()
    const studentDoc = await studentDocRef.get(); // استخدام .get()
    if (studentDoc.exists) {
        alert('رمز الطالب هذا موجود بالفعل. يرجى اختيار رمز آخر.');
        return;
    }

    await studentDocRef.set({ // استخدام .set()
        name: newStudentName,
        score: 0,
        tasks: [],
        hifz_progress: initialHifzProgress,
        murajaa_progress: initialMurajaaProgress,
        created_at: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert(`تم تسجيل الطالب ${newStudentName} برمز ${newStudentId} بنجاح!`);
    document.getElementById('add-new-student-form').reset();
});


// --- 5. لوحة الشرف (Leaderboard) ---

window.renderLeaderboard = async function() {
    const leaderboardContainer = document.getElementById('leaderboard-container');
    leaderboardContainer.innerHTML = 'جاري تحميل لوحة الشرف...';

    const leaderboardQuery = studentsCollection.orderBy('score', 'desc').limit(5); // استخدام .orderBy و .limit
    const querySnapshot = await leaderboardQuery.get();

    leaderboardContainer.innerHTML = '';
    if (querySnapshot.empty) {
        leaderboardContainer.innerHTML = '<div class="alert alert-info text-center">لا توجد بيانات لعرض لوحة الشرف بعد.</div>';
        return;
    }

    let rank = 1;
    querySnapshot.forEach(d => {
        const student = d.data();
        const item = document.createElement('div');
        item.className = `list-group-item d-flex justify-content-between align-items-center ${rank <= 3 ? 'bg-light fw-bold' : ''}`;
        item.innerHTML = `
            <span>${rank}. ${student.name}</span>
            <span class="badge bg-primary rounded-pill">${student.score || 0} نقطة</span>
        `;
        leaderboardContainer.appendChild(item);
        rank++;
    });
};
