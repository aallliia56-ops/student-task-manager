// //////////////////////////////////////////////////////
// بداية ملف app.js الموحد والنهائي
// //////////////////////////////////////////////////////

// --- 0. الإعدادات الأولية وربط Firebase ---

// تم نقل استيراد الدوال إلى ملف index.html لحل خطأ المتصفح

const firebaseConfig = {
  apiKey: "AIzaSyCeIcmuTd72sjiu1Uyijn_J4bMS0ChtXGo",
  authDomain: "studenttasksmanager.firebaseapp.com",
  projectId: "studenttasksmanager",
  storageBucket: "studenttasksmanager.firebasestorage.app",
  messagingSenderId: "850350680089",
  appId: "1:850350680089:web:51b71a710e938754bc6288",
  measurementId: "G-7QC4FVXKZG"
};

// هنا يتم استخدام الدوال التي تم تحميلها عبر index.html (Compat Mode)
const app = firebase.initializeApp(firebaseConfig); 
const db = firebase.firestore();


// --- 1. متغيرات الحالة العامة ---
let allStudentsData = {};          
let currentStudentId = null;       
const TEACHER_CODE = 'TEACHER2025'; 

// --- 2. دالة معالجة تسجيل الدخول (الطالب والمعلم) ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
    console.log("SUCCESS: 'login-form' element was found."); // NEW DIAGNOSTIC
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
    console.error("ERROR: 'login-form' element NOT found. Check index.html."); // NEW DIAGNOSTIC
}
});

// --- 3. دالة جلب كل البيانات من مجموعة tasks ---
async function loadAllStudentsData() {
    // استخدام طريقة الـ Compat Mode
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

    renderTasks(studentData); 
    // يتم استدعاء دالة عرض الشاشة الموجودة في index.html
    if (typeof showTasksScreen === 'function') showTasksScreen(studentId); 
}

// --- 5. منطق عرض المهام المشروطة (القلب النابض) ---
function renderTasks(studentData) {
    const tasksContainer = document.getElementById('tasks-container');
    tasksContainer.innerHTML = '';
    
    const tasks = studentData.tasks || [];
    const now = new Date();
    let canRenderNextTask = true; 

    tasks.forEach((task, index) => {
        if (task.approved_by_teacher) return;
        
        // 1. التحقق من شرط الاعتمادية (depends_on)
        const isDependent = task.depends_on !== -1 && task.depends_on !== null;
        let isPrerequisiteApproved = true;

        if (isDependent) {
            const prerequisiteTask = tasks[task.depends_on];
            isPrerequisiteApproved = prerequisiteTask && prerequisiteTask.approved_by_teacher;
        }
        
        // 2. التحقق من شرط التاريخ والوقت
        const releaseDateTime = new Date(`${task.release_date}T${task.release_time}:00`);
        const isReleased = now >= releaseDateTime;

        // --- منطق إخفاء/عرض المهام ---

        if (!isPrerequisiteApproved || !isReleased) {
            
            if(isDependent && !isPrerequisiteApproved && canRenderNextTask) {
                 tasksContainer.innerHTML += `<div class="task-item alert-info">المهمة التالية: الرجاء انتظار موافقة المعلم على مهمة: **${tasks[task.depends_on].description}**.</div>`;
            } else if (!isReleased && canRenderNextTask) {
                 tasksContainer.innerHTML += `<div class="task-item alert-info">المهمة ستتاح في: **${task.release_date} الساعة ${task.release_time}**.</div>`;
            }
            canRenderNextTask = false;
            return; 
        }
        
        // إنشاء زر المهمة وعرضها
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <p class="task-description">
                <span class="task-type"> [${task.task_type} - ${task.points_value} نقاط] </span>
                ${task.description} 
            </p>
        `;
        
        const actionButton = document.createElement('button');
        
        if (task.claimed_by_student) {
            actionButton.className = 'btn btn-warning';
            actionButton.innerText = 'قيد مراجعة المعلم';
            actionButton.disabled = true;
        } else {
            actionButton.className = 'btn btn-success';
            actionButton.innerText = 'تم الإنجاز (للمراجعة)';
            
            // الحل الأقوى: استخدام data attribute لتمرير الـ index بشكل آمن وموثوق
            actionButton.setAttribute('data-task-index', index);
            actionButton.addEventListener('click', function() {
                const taskIndex = this.getAttribute('data-task-index');
                claimTaskCompletion(parseInt(taskIndex));
            });
        }

        taskElement.appendChild(actionButton);
        tasksContainer.appendChild(taskElement);

        if (isDependent) {
            canRenderNextTask = true; 
        }
    });
}

// --- 6. منطق تحديث الطالب (مطالبة المراجعة) ---
async function claimTaskCompletion(taskIndex) {
    // سطر التشخيص: إذا ظهر هذا، فالمشكلة ليست في ربط الزر
    console.log("Button Click Registered. Attempting Firestore Update..."); 

    if (!currentStudentId) {
        console.error("No current student ID found.");
        return;
    }

    const docRef = db.collection("tasks").doc(currentStudentId); 
    let studentData = allStudentsData[currentStudentId];

    studentData.tasks[taskIndex].claimed_by_student = true;

    try {
        // استخدام طريقة الـ Compat Mode
        await docRef.update({
            tasks: studentData.tasks 
        });
        
        // تحديث الواجهة بعد النجاح
        allStudentsData[currentStudentId].tasks[taskIndex].claimed_by_student = true;
        renderTasks(allStudentsData[currentStudentId]);
        
    } catch (e) {
        console.error("خطأ في تحديث المطالبة: ", e);
        // التنبيه مهم لتشخيص مشكلة الأمان
        alert("فشل تحديث الإنجاز. الرجاء التأكد من قواعد الأمان (Security Rules) في Firebase.");
    }
}


// //////////////////////////////////////////////////////
// بداية كود واجهة المعلم الجديدة
// //////////////////////////////////////////////////////

// --- 7. دالة عرض لوحة المعلم ---
function showTeacherDashboard() {
    // يتم استدعاء دالة عرض الشاشة الموجودة في index.html
    if (typeof showTeacherScreen === 'function') showTeacherScreen(); 

    renderTeacherReviewList(); 
    renderLeaderboard();       
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
            if (task.claimed_by_student && !task.approved_by_teacher) {
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
    // استخدام طريقة الـ Compat Mode
    const docRef = db.collection("tasks").doc(studentId);
    let studentData = allStudentsData[studentId];
    
    studentData.tasks[taskIndex].approved_by_teacher = true;
    
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

