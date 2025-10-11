// //////////////////////////////////////////////////////
// بداية ملف app.js النهائي (مع إضافة وظيفة "إلغاء الإنجاز" المُحسّنة)
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

// --- 2. دالة معالجة تسجيل الدخول (الطالب والمعلم) ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
    console.log("SUCCESS: 'login-form' element was found."); 
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputId = document.getElementById('student-id').value.trim();
        
        await loadAllStudentsData(); 

        if (inputId === TEACHER_CODE) {
            showTeacherDashboard();
        } else if (inputId.match(/^\d+$/) && allStudentsData[inputId]) { 
            loadStudentData(inputId);
        } else {
            alert("الرجاء إدخال رمز صحيح (طالب أو معلم).");
        }
    });
} else {
    console.error("ERROR: 'login-form' element NOT found. Check index.html."); 
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

// --- 4. دالة عرض واجهة الطالب ---
async function loadStudentData(studentId) {
    currentStudentId = studentId;
    const studentData = allStudentsData[studentId];

    document.getElementById('student-info-name').innerText = `أهلاً بك، ${studentData.student_name}`;
    document.getElementById('student-info-score').innerText = `نقاطك الحالية: ${studentData.score || 0}`;

    console.log("Attempting to render tasks..."); 
    
    renderTasks(studentData); 
    
    // يتم استدعاء دالة عرض الشاشة الموجودة في index.html
    if (typeof showTasksScreen === 'function') {
        console.log("showTasksScreen function found and called.");
        showTasksScreen(studentId);
    } else {
        console.error("ERROR: showTasksScreen is not defined in index.html. Cannot show task screen.");
    }
}

// --- 5. منطق عرض المهام المشروطة (القلب النابض) ---
function renderTasks(studentData) {
    const tasksContainer = document.getElementById('tasks-container');
    tasksContainer.innerHTML = '';
    
    const tasks = studentData.tasks || [];
    const now = new Date();
    let canRenderNextTask = true; 

    tasks.forEach((task, index) => {
        // إيقاف العرض إذا كانت الحالة 'approved'
        if (task.status === "approved") return; 
        
        // التحقق من شرط الاعتمادية والتاريخ
        const isDependent = task.depends_on !== -1 && task.depends_on !== null;
        let isPrerequisiteApproved = true;

        if (isDependent) {
            const prerequisiteTask = tasks[task.depends_on];
            isPrerequisiteApproved = prerequisiteTask && (prerequisiteTask.status === "approved"); 
        }
        
        const releaseDateTime = new Date(`${task.release_date}T${task.release_time}:00`);
        const isReleased = now >= releaseDateTime;

        if (!isPrerequisiteApproved || !isReleased) {
            
            if(isDependent && !isPrerequisiteApproved && canRenderNextTask) {
                 tasksContainer.innerHTML += `<div class="task-item alert-info">المهمة التالية: الرجاء انتظار موافقة المعلم على مهمة: **${tasks[task.depends_on].description}**.</div>`;
            } else if (!isReleased && canRenderNextTask) {
                 tasksContainer.innerHTML += `<div class="task-item alert-info">المهمة ستتاح في: **${task.release_date} الساعة ${task.release_time}**.</div>`;
            }
            canRenderNextTask = false;
            return; 
        }
        
        // إنشاء عنصر المهمة الرئيسي
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        
        // إنشاء حاوية للنص
        const descriptionElement = document.createElement('p');
        descriptionElement.className = 'task-description';
        descriptionElement.innerHTML = `
            <span class="task-type"> [${task.task_type} - ${task.points_value} نقاط] </span>
            ${task.description} 
        `;

        // إنشاء حاوية الأزرار
        const actionContainer = document.createElement('div');
        actionContainer.className = 'task-actions'; 

        // إضافة النص وحاوية الأزرار إلى عنصر المهمة
        taskElement.appendChild(descriptionElement);
        taskElement.appendChild(actionContainer);
        
        // --- منطق عرض الأزرار بناءً على حالة المهمة ---
        
        if (task.status === "claimed") { 
            
            // 1. زر الحالة (معطل)
            const statusButton = document.createElement('button');
            statusButton.className = 'btn btn-warning btn-sm';
            statusButton.innerText = 'قيد مراجعة المعلم';
            statusButton.disabled = true;

            // 2. زر إلغاء الإنجاز (مفعل)
            const undoButton = document.createElement('button');
            undoButton.className = 'btn btn-danger btn-sm';
            undoButton.innerText = 'إلغاء الإنجاز';
            undoButton.setAttribute('onclick', `processTaskUndo(${index})`); 
            
            actionContainer.appendChild(statusButton);
            actionContainer.appendChild(undoButton);
            
        } else {
            // الحالة الافتراضية 'pending' (جاهز للإنجاز)
            const claimButton = document.createElement('button');
            claimButton.className = 'btn btn-success';
            claimButton.innerText = 'تم الإنجاز (للمراجعة)';
            claimButton.setAttribute('onclick', `processTaskClaim(${index})`); 
            
            actionContainer.appendChild(claimButton);
        }

        tasksContainer.appendChild(taskElement);

        if (isDependent) {
            canRenderNextTask = true; 
        }
    });
}

// --- 6. منطق تحديث الطالب (مطالبة المراجعة) ---
async function processTaskClaim(taskIndex) {
    console.log("Button Click Registered. Attempting Firestore Update..."); 

    if (!currentStudentId) {
        console.error("No current student ID found.");
        return;
    }

    const docRef = db.collection("tasks").doc(currentStudentId); 
    let studentData = allStudentsData[currentStudentId];

    // تغيير الحالة إلى 'claimed'
    studentData.tasks[taskIndex].status = "claimed"; 

    try {
        await docRef.update({ 
            tasks: studentData.tasks 
        }); 

        console.log("SUCCESS: Task claimed and Firestore updated."); 

        // تحديث الواجهة بعد النجاح
        allStudentsData[currentStudentId].tasks[taskIndex].status = "claimed";
        renderTasks(allStudentsData[currentStudentId]);
        
    } catch (e) {
        console.error("CRITICAL FAILURE: Firestore Write Failed.", e); 
        alert("فشل تحديث الإنجاز. الرجاء مراجعة الـ Console لمعرفة سبب الرفض.");
    }
}

// --- 6.5. منطق إلغاء الإنجاز (التراجع) ---
async function processTaskUndo(taskIndex) {
    console.log("Undo Button Click Registered. Attempting Firestore Undo..."); 

    if (!currentStudentId) {
        console.error("No current student ID found for undo operation.");
        return;
    }
    
    if (!confirm("هل أنت متأكد من إلغاء إنجاز هذه المهمة؟ ستختفي من مراجعة المعلم.")) {
        return;
    }

    const docRef = db.collection("tasks").doc(currentStudentId); 
    let studentData = allStudentsData[currentStudentId];

    // تغيير الحالة إلى 'pending'
    studentData.tasks[taskIndex].status = "pending"; 

    try {
        await docRef.update({ 
            tasks: studentData.tasks 
        }); 

        console.log("SUCCESS: Task claim reverted to pending."); 

        // تحديث الواجهة بعد النجاح
        allStudentsData[currentStudentId].tasks[taskIndex].status = "pending";
        renderTasks(allStudentsData[currentStudentId]);
        
    } catch (e) {
        console.error("CRITICAL FAILURE: Firestore Undo Failed.", e); 
        alert("فشل إلغاء الإنجاز. الرجاء مراجعة الـ Console.");
    }
}


// //////////////////////////////////////////////////////
// بداية كود واجهة المعلم (لم يتغير)
// //////////////////////////////////////////////////////

// --- 7. دالة عرض لوحة المعلم ---
function showTeacherDashboard() {
    if (typeof showTeacherScreen === 'function') showTeacherScreen(); 

    renderTeacherReviewList(); 
    renderLeaderboard(); 
    attachAddTaskFormListener(); 
}

// --- 8. دالة عرض المهام التي تحتاج مراجعة ---
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

// --- 9. دالة منح النقاط وتأكيد الموافقة ---
async function approveTask(studentId, taskIndex, pointsValue) {
    const docRef = db.collection("tasks").doc(studentId);
    let studentData = allStudentsData[studentId];
    
    studentData.tasks[taskIndex].status = "approved";
    
    const currentScore = studentData.score || 0;
    const newScore = currentScore + pointsValue;
    
    try {
        await docRef.update({
            tasks: studentData.tasks,
            score: newScore
        });

        allStudentsData[studentId].score = newScore;
        
        alert(`تم منح ${pointsValue} نقاط للطالب ${studentId}.`);
        
        renderTeacherReviewList();
        renderLeaderboard();
    } catch (e) {
        console.error("خطأ في منح النقاط وتأكيد المهمة: ", e);
    }
}

// --- 10. دالة عرض لوحة الشرف (Leaderboard) ---
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


// --- 11. وظائف إضافة مهمة جديدة (واجهة المعلم) ---

// أ. ربط النموذج الجديد (يتم استدعاؤها في showTeacherDashboard)
function attachAddTaskFormListener() {
    const form = document.getElementById('add-task-form');
    if (form) {
        form.removeEventListener('submit', handleAddTaskFormSubmit); 
        form.addEventListener('submit', handleAddTaskFormSubmit);
    }
}

// ب. دالة معالجة إرسال النموذج وإضافة المهمة
async function handleAddTaskFormSubmit(e) {
    e.preventDefault(); 

    const studentId = document.getElementById('new-task-student-id').value.trim();
    const description = document.getElementById('new-task-description').value.trim();
    const points = parseInt(document.getElementById('new-task-points').value.trim());
    const date = document.getElementById('new-task-date').value.trim();
    const time = document.getElementById('new-task-time').value.trim();

    if (typeof firebase === 'undefined' || !firebase.firestore || !firebase.firestore.FieldValue) {
         alert("خطأ داخلي: فشل تحميل مكتبة Firebase. الرجاء مراجعة الـ Console.");
         return; 
    }

    if (!studentId || !description || isNaN(points) || !date || !time) {
        alert("الرجاء ملء جميع الحقول بشكل صحيح.");
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
        console.error("خطأ حاسم في إضافة المهمة: ", error);
        alert(`فشل إضافة المهمة إلى Firebase! السبب: تأكد من أن قواعد أمان Firestore تسمح بـ 'write' على مجموعة tasks.`);
    }
}
