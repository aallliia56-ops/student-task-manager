// *** 1. الإعدادات الأولية وتعديل الدوال الأساسية ***

// --- متغيرات الحالة العامة ---
let allStudentsData = {};          // لتخزين بيانات جميع الطلاب (للمعلم)
let currentStudentId = null;       // رمز الطالب الحالي (119)
const TEACHER_CODE = 'TEACHER2025'; // الرمز السري للمعلم

// --- دالة معالجة تسجيل الدخول (الطالب والمعلم) ---
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputId = document.getElementById('student-id').value.trim();
    
    // محاولة تحميل كل البيانات (لضمان وجود بيانات المعلم)
    await loadAllStudentsData();

    if (inputId === TEACHER_CODE) {
        // إذا كان المعلم، نذهب إلى لوحة القيادة
        showTeacherDashboard();
    } else if (inputId.match(/^\d+$/)) { 
        // إذا كان رقم (طالب)، نقوم بتحميل بياناته
        const studentId = inputId;
        loadStudentData(studentId);
    } else {
        alert("الرجاء إدخال رمز طالب رقمي (مثل 119) أو الرمز السري للمعلم.");
    }
});

// --- دالة لجلب كل البيانات من مجموعة tasks ---
async function loadAllStudentsData() {
    const tasksCollection = collection(db, "tasks"); 
    const querySnapshot = await getDocs(tasksCollection);

    allStudentsData = {}; 
    
    querySnapshot.forEach((doc) => {
        allStudentsData[doc.id] = doc.data();
    });
}

// --- دالة لمعالجة تسجيل دخول الطالب (وعرض معلوماته) ---
async function loadStudentData(studentId) {
    currentStudentId = studentId;

    if (Object.keys(allStudentsData).length === 0) {
        await loadAllStudentsData(); // إذا لم تكن البيانات قد تم تحميلها
    }

    const studentData = allStudentsData[studentId];

    if (studentData && studentData.tasks) {
        // عرض الاسم والنقاط أولاً
        document.getElementById('student-info-name').innerText = `أهلاً بك، ${studentData.student_name}`;
        document.getElementById('student-info-score').innerText = `نقاطك الحالية: ${studentData.score || 0}`;

        renderTasks(studentData); 
        // هذه دالة افتراضية يجب أن تكون موجودة في index.html لإخفاء شاشة الدخول
        showTasksScreen(studentId); 
    } else {
        document.getElementById('tasks-container').innerHTML = `<p class="alert alert-danger">لم يتم العثور على مهام للرمز: ${studentId}</p>`;
        showTasksScreen(studentId);
    }
}
// *** 2. منطق عرض المهام المشروطة ***

function renderTasks(studentData) {
    const tasksContainer = document.getElementById('tasks-container');
    tasksContainer.innerHTML = '';
    
    const tasks = studentData.tasks || [];
    const now = new Date(); // التاريخ والوقت الحالي
    let canRenderNextTask = true; // مفتاح للتحكم في ظهور المهام المتسلسلة

    tasks.forEach((task, index) => {
        // تخطي المهام التي وافق عليها المعلم بشكل نهائي
        if (task.approved_by_teacher) {
            return;
        }
        
        // 1. التحقق من شرط الاعتمادية (depends_on)
        const isDependent = task.depends_on !== -1 && task.depends_on !== null;
        let isPrerequisiteApproved = true;

        if (isDependent) {
            const prerequisiteTask = tasks[task.depends_on];
            // المهمة السابقة يجب أن تكون معتمدة من المعلم (approved_by_teacher)
            isPrerequisiteApproved = prerequisiteTask && prerequisiteTask.approved_by_teacher;
        }
        
        // 2. التحقق من شرط التاريخ والوقت (release_date/time)
        const releaseDateTime = new Date(`${task.release_date}T${task.release_time}:00`);
        const isReleased = now >= releaseDateTime;

        // --- منطق عرض المهمة للطالب ---

        // إذا كانت المهمة تعتمد على مهمة سابقة لم تتم الموافقة عليها، أو لم يأتِ وقتها
        if (!isPrerequisiteApproved || !isReleased) {
            
            // إذا كانت هذه هي أول مهمة في السلسلة لا تتحقق شروطها، نعرض رسالة
            if(isDependent && !isPrerequisiteApproved && canRenderNextTask) {
                 tasksContainer.innerHTML += `<div class="task-item alert-info">المهمة التالية: الرجاء انتظار موافقة المعلم على مهمة: **${tasks[task.depends_on].description}**.</div>`;
            } else if (!isReleased && canRenderNextTask) {
                 tasksContainer.innerHTML += `<div class="task-item alert-info">المهمة ستتاح في: **${task.release_date} الساعة ${task.release_time}**.</div>`;
            }
            // إيقاف عرض باقي المهام في السلسلة
            canRenderNextTask = false;
            return; 
        }
        
        // إذا تم تلبية كل الشروط، قم بإنشاء العنصر:
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
            // حالة: قيد مراجعة المعلم
            actionButton.className = 'btn btn-warning';
            actionButton.innerText = 'قيد مراجعة المعلم';
            actionButton.disabled = true;
            taskElement.className += ' claimed';
        } else {
            // زر الإنجاز (Student claims completion)
            actionButton.className = 'btn btn-success';
            actionButton.innerText = 'تم الإنجاز (للمراجعة)';
            actionButton.onclick = () => claimTaskCompletion(index);
        }

        taskElement.appendChild(actionButton);
        tasksContainer.appendChild(taskElement);

        // إذا كانت المهمة في سلسلة (isDependent)، نجعل canRenderNextTask = true
        // وإلا (مهمة مستقلة)، لا نغير حالة canRenderNextTask للسلسلة.
        if (isDependent) {
            canRenderNextTask = true; 
        }
    });
}
// *** 3. منطق تحديث الطالب (مطالبة المراجعة) ***

async function claimTaskCompletion(taskIndex) {
    if (!currentStudentId) return;

    const docRef = doc(db, "tasks", currentStudentId);
    
    // تحديث الحالة في الذاكرة المحلية أولاً
    let studentData = allStudentsData[currentStudentId];
    if (!studentData || !studentData.tasks[taskIndex]) return;

    // تحديث الحقل: الطالب يطالب بالإنجاز
    studentData.tasks[taskIndex].claimed_by_student = true;

    // تحديث البيانات في Firebase
    try {
        await updateDoc(docRef, {
            tasks: studentData.tasks 
        });
        console.log(`المهمة ${taskIndex} تم المطالبة بإنجازها بواسطة ${currentStudentId}`);
        
        // إعادة عرض المهام بعد التحديث (لتظهر كـ "قيد المراجعة")
        renderTasks(studentData);
    } catch (e) {
        console.error("خطأ في تحديث المطالبة: ", e);
    }
}
