// //////////////////////////////////////////////////////
// ملف app.js النهائي: نظام التعاقب القائم على الإنجاز (Progression-Based)
// //////////////////////////////////////////////////////

// --- 0. الإعدادات الأولية وربط Firebase ---
const firebaseConfig = {
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

// سيتم تخزين قوائم المنهج المركزية هنا بعد تحميلها من Firestore
let curriculumLists = {};

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
        
        // تحميل بيانات الطلاب وقوائم المنهج قبل الدخول
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
        allStudentsData[doc.id] = doc.data();
    });
} 

// --- NEW FUNCTION: دالة جلب قوائم المنهج (Hifz, Murajaa) ---
async function loadCurriculumLists() {
    try {
        // نستخدم Promise.all لتحميل الوثائق بالتوازي لزيادة السرعة
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


// --- 4. دالة تحديد المهام النشطة للطالب (القائمة على التقدم) ---
function getCurrentCurriculumTasks(studentData) {
    const activeTasks = [];
    const studentTasks = studentData.tasks || [];

    // --- 4.1. تحديد مهمة الحفظ النشطة ---
    const hifzIndex = studentData.hifz_progress || 0;
    const nextHifzTask = curriculumLists.Hifz[hifzIndex];
    
    if (nextHifzTask) {
        // التحقق مما إذا كانت المهمة قيد المراجعة بالفعل (حالة claimed)
        const isHifzActive = studentTasks.some(t => 
            t.curriculum_id === nextHifzTask.curriculum_id && 
            t.status === "claimed"
        );
        
        // إذا لم تكن نشطة، أضفها إلى قائمة العرض
        if (!isHifzActive) {
            activeTasks.push({
                ...nextHifzTask, 
                is_curriculum_task: true,
                curriculum_type: 'Hifz'
            });
        }
    }

    // --- 4.2. تحديد مهمة المراجعة النشطة (نفس المنطق) ---
    const murajaaIndex = studentData.murajaa_progress || 0;
    const nextMurajaaTask = curriculumLists.Murajaa[murajaaIndex];

    if (nextMurajaaTask) {
         const isMurajaaActive = studentTasks.some(t => 
            t.curriculum_id === nextMurajaaTask.curriculum_id && 
            t.status === "claimed"
        );
        
        if (!isMurajaaActive) {
            activeTasks.push({
                ...nextMurajaaTask,
                is_curriculum_task: true,
                curriculum_type: 'Murajaa'
            });
        }
    }
    
    // دمج المهام: المهام العادية (pending/claimed) + المهام النشطة من المنهج
    // يتم تصفية المهام المنجزة (approved) حتى لا تظهر للطالب
    const pendingAndClaimedTasks = studentTasks.filter(t => t.status === "pending" || t.status === "claimed");

    // يجب إضافة المهام النشطة في النهاية
    const combinedTasks = pendingAndClaimedTasks.concat(activeTasks);

    return combinedTasks;
}

// --- 5. دالة عرض واجهة الطالب ---
async function loadStudentData(studentId) {
    currentStudentId = studentId;
    const studentData = allStudentsData[studentId];
    
    // جلب المهام النشطة (التي يجب أن تظهر له اليوم)
    const combinedTasks = getCurrentCurriculumTasks(studentData);

    document.getElementById('student-info-name').innerText = `أهلاً بك، ${studentData.student_name}`;
    document.getElementById('student-info-score').innerText = `نقاطك الحالية: ${studentData.score || 0}`;

    renderTasks(studentData, combinedTasks); 
    
    if (typeof showTasksScreen === 'function') {
        showTasksScreen(studentId);
    }
}

// --- 6. منطق عرض المهام المشروطة (الآن دون شروط زمنية) ---
function renderTasks(studentData, taskList) {
    const tasksContainer = document.getElementById('tasks-container');
    tasksContainer.innerHTML = '';
    
    const studentTasksInDb = studentData.tasks || []; // قائمة المهام الموجودة فعلياً في Firestore
    
    taskList.forEach((task) => {
        
        // -------------------------------------------------------------
        // 1. التعامل مع المهام التسلسلية (من قائمة Curriculum)
        // -------------------------------------------------------------
        if (task.is_curriculum_task) {
            
            // التحقق مما إذا كانت المهمة قيد المراجعة بالفعل (حالة claimed)
            const activeInDb = studentTasksInDb.find(t => 
                t.curriculum_id === task.curriculum_id && t.status === "claimed"
            );

            const taskElement = document.createElement('div');
            taskElement.className = 'task-item';
            
            if (activeInDb) {
                // حالة: قيد مراجعة المعلم
                taskElement.className += ' alert-warning';
                taskElement.innerHTML = `
                     <p class="task-description">
                         <span class="task-type"> [${task.task_type} - ${task.points_value} نقاط] </span>
                         ${task.description} 
                     </p>
                     <div class="task-actions">
                         <button class="btn btn-warning btn-sm" disabled>قيد مراجعة المعلم</button>
                     </div>
                 `;
            } else {
                // حالة: جاهزة للإنجاز
                taskElement.innerHTML = `
                     <p class="task-description">
                         <span class="task-type"> [${task.task_type} - ${task.points_value} نقاط] </span>
                         ${task.description} 
                     </p>
                     <div class="task-actions">
                         <button class="btn btn-primary" onclick="claimCurriculumTask('${task.curriculum_type}', ${task.curriculum_id}, ${task.points_value}, '${task.description}')">تم الإنجاز (تسلسلي)</button>
                     </div>
                 `;
            }
            tasksContainer.appendChild(taskElement);
            return;
        }

        // -------------------------------------------------------------
        // 2. التعامل مع المهام الخاصة (اليدوية) - بنفس منطق الـ Index والاعتمادية
        // -------------------------------------------------------------
        
        // البحث عن Index المهمة في القائمة الأصلية studentTasksInDb (لأجل وظائف التراجع processTaskUndo)
        const originalIndex = studentTasksInDb.findIndex(t => 
            t.description === task.description && 
            t.points_value === task.points_value && 
            t.status === task.status
        );
        if (originalIndex === -1) return;

        // المهام اليدوية القديمة لا تحتاج شروط تاريخ أو اعتمادية معقدة حالياً، لذا يتم عرضها إذا كانت pending/claimed
        
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        
        const descriptionElement = document.createElement('p');
        descriptionElement.className = 'task-description';
        descriptionElement.innerHTML = `
            <span class="task-type"> [${task.task_type} - ${task.points_value} نقاط] </span>
            ${task.description} 
        `;

        const actionContainer = document.createElement('div');
        actionContainer.className = 'task-actions'; 

        taskElement.appendChild(descriptionElement);
        taskElement.appendChild(actionContainer);
        
        if (task.status === "claimed") { 
            // زر التراجع والانتظار 
            const statusButton = document.createElement('button');
            statusButton.className = 'btn btn-warning btn-sm';
            statusButton.innerText = 'قيد مراجعة المعلم';
            statusButton.disabled = true;

            const undoButton = document.createElement('button');
            undoButton.className = 'btn btn-danger btn-sm';
            undoButton.innerText = 'إلغاء الإنجاز';
            undoButton.setAttribute('onclick', `processTaskUndo(${originalIndex})`); 
            
            actionContainer.appendChild(statusButton);
            actionContainer.appendChild(undoButton);
            
        } else if (task.status === "pending") {
            // زر الإنجاز للمهام الخاصة
            const claimButton = document.createElement('button');
            claimButton.className = 'btn btn-success';
            claimButton.innerText = 'تم الإنجاز (للمراجعة)';
            claimButton.setAttribute('onclick', `processTaskClaim(${originalIndex})`); 
            
            actionContainer.appendChild(claimButton);
        }

        tasksContainer.appendChild(taskElement);
    });
}


// --- NEW FUNCTION: دالة إنجاز مهمة تسلسلية (Claim Curriculum Task) ---
async function claimCurriculumTask(curriculumType, curriculumId, pointsValue, description) {
    if (!currentStudentId) return;

    // 1. إنشاء كائن مهمة جديد لدفعه في مصفوفة مهام الطالب (tasks)
    const now = new Date();
    const newTask = {
        description: description,
        points_value: pointsValue,
        release_date: now.toISOString().split('T')[0], 
        release_time: now.toTimeString().split(' ')[0].substring(0, 5),
        task_type: `${curriculumType} تسلسلي`, // لتمييزها في لوحة المعلم
        curriculum_id: curriculumId, 
        status: "claimed" 
    };
    
    // 2. تحديث وثيقة الطالب بإضافة المهمة الجديدة
    const docRef = db.collection("tasks").doc(currentStudentId); 
    
    try {
        await docRef.update({ 
            tasks: firebase.firestore.FieldValue.arrayUnion(newTask) 
        }); 

        // 3. تحديث البيانات المحلية وإعادة العرض
        allStudentsData[currentStudentId].tasks = allStudentsData[currentStudentId].tasks || [];
        allStudentsData[currentStudentId].tasks.push(newTask);
        
        // إعادة تحميل البيانات لعرض حالة "قيد المراجعة"
        loadStudentData(currentStudentId);
        
    } catch (e) {
        console.error("CRITICAL FAILURE: Curriculum Task Claim Failed.", e); 
        alert("فشل تحديث الإنجاز للمهمة التسلسلية.");
    }
}


// --- 7. منطق تحديث الطالب (مطالبة المراجعة للمهام الخاصة) ---
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

// --- 7.5. منطق إلغاء الإنجاز (التراجع) ---
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


// //////////////////////////////////////////////////////
// بداية كود واجهة المعلم (الأهم: دالة الموافقة)
// //////////////////////////////////////////////////////

// --- 8. دالة منح النقاط وتأكيد الموافقة (معدلة لزيادة التقدم) ---
async function approveTask(studentId, taskIndex, pointsValue) {
    const docRef = db.collection("tasks").doc(studentId);
    let studentData = allStudentsData[studentId];
    let task = studentData.tasks[taskIndex];
    
    // 1. تحديد ما إذا كانت المهمة مُنجزة من المنهج التسلسلي
    const isCurriculumTask = task.curriculum_id !== undefined;

    // 2. تحديث الحالة
    studentData.tasks[taskIndex].status = "approved";
    
    const currentScore = studentData.score || 0;
    const newScore = currentScore + pointsValue;
    
    // 3. تجميع التحديثات التي ستُرسل إلى Firestore
    const updates = {
        tasks: studentData.tasks,
        score: newScore
    };

    if (isCurriculumTask) {
        if (task.task_type === "Hifz تسلسلي") {
            // زيادة الـ Index للمهمة التالية في قائمة الحفظ
            updates.hifz_progress = firebase.firestore.FieldValue.increment(1);
        } else if (task.task_type === "Murajaa تسلسلي") {
            // زيادة الـ Index للمهمة التالية في قائمة المراجعة
            updates.murajaa_progress = firebase.firestore.FieldValue.increment(1);
        }
    }
    
    try {
        await docRef.update(updates);

        allStudentsData[studentId].score = newScore;
        
        // تحديث البيانات المحلية للتقدم ليعمل العرض بشكل صحيح
        if (isCurriculumTask) {
             if (task.task_type === "Hifz تسلسلي") {
                 allStudentsData[studentId].hifz_progress = (allStudentsData[studentId].hifz_progress || 0) + 1;
             } else if (task.task_type === "Murajaa تسلسلي") {
                 allStudentsData[studentId].murajaa_progress = (allStudentsData[studentId].murajaa_progress || 0) + 1;
             }
        }
        
        alert(`تم منح ${pointsValue} نقاط للطالب ${studentId} وتم تحميل المهمة التسلسلية التالية.`);
        
        // إعادة تحميل لوحة المعلم لعرض التحديثات
        renderTeacherReviewList();
        renderLeaderboard();
        
    } catch (e) {
        console.error("خطأ في منح النقاط وتأكيد المهمة: ", e);
    }
}


// --- 9. بقية دوال المعلم (لم تتغير) ---
function showTeacherDashboard() {
    if (typeof showTeacherScreen === 'function') showTeacherScreen(); 
    renderTeacherReviewList(); 
    renderLeaderboard(); 
    attachAddTaskFormListener(); 
    populateBulkAddForms();
}

function renderTeacherReviewList() {
    // ... (هذه الدالة لم تتغير)
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
