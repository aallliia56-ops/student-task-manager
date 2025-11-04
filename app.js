/**
 * ملف: app.js (النسخة النهائية والمُدمجة)
 * يعتمد على الاستيراد من ملف المنهج الخارجي (curriculum.js)
 */

// 1. استيراد بيانات المنهج من ملف curriculum.js
import { SURAH_DETAILS, CURRICULUM_LEVELS, REVIEW_METHODOLOGY } from './curriculum.js';

// ** دوال مساعدة لاستخلاص البيانات من CURRICULUM_LEVELS/REVIEW_METHODOLOGY **
function getLevelDetails(levelId) {
    return CURRICULUM_LEVELS[levelId] || CURRICULUM_LEVELS['BUILDING']; // الافتراضي
}

function getReviewKeyByLevel(levelId) {
    if (levelId === 'BUILDING') return 'قسم_البناء';
    if (levelId === 'DEVELOPMENT') return 'قسم_التطوير';
    if (levelId === 'ADVANCED') return 'قسم_المتقدم';
    return null;
}

// ----------------------------------------------------------------------------------
// ** بداية الكود الأصلي المُعدل **
// ----------------------------------------------------------------------------------

// إعدادات Firebase (تم تضمين البيانات التي أرسلتها)
const firebaseConfig = {
    apiKey: "AIzaSyCeIcmuTd72sjiu1Uyijn_J4bMS0ChtXGo",
    authDomain: "studenttasksmanager.firebaseapp.com",
    projectId: "studenttasksmanager",
    storageBucket: "studenttasksmanager.firebasestorage.app",
    messagingSenderId: "850350680089",
    appId: "1:850350680089:web:51b71a710e938754bc6288",
    measurementId: "G-7QC4FVXKZG"
};

// تهيئة Firebase باستخدام الكائن العام (ملاحظة: هذا يتطلب تضمين مكتبة Firebase مسبقًا)
const app = firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics(app);
const db = firebase.firestore(app);

// ** المتغيرات العامة **
let currentUserCode = null;


// ===============================================
// 1. الدوال المساعدة للواجهة والبيانات (مُعدلة)
// ===============================================

/**
 * دالة تعبئة خيارات نقاط الحفظ في قوائم الـ Select
 */
function fillHifzPointsSelects() {
    const hifzStartSelect = document.getElementById('new-student-hifz-start');
    
    // تأكد من وجود العنصر قبل محاولة تعبئته
    if (!hifzStartSelect) return; 

    hifzStartSelect.innerHTML = '<option value="">نقطة البداية (غير مُعين)</option>';
    // SURAH_DETAILS: هنا يتم استخدام الثابت المُستورد
    SURAH_DETAILS.forEach(item => {
        // نستخدم نقطة نهاية المقطع كنقطة بداية للطالب
        const value = `${item.surah_number}:${item.end_ayah}`; 
        const label = `${item.surah_name_ar} (آية ${item.end_ayah})`;
        const option = new Option(label, value);
        hifzStartSelect.add(option);
    });

    // تعبئة قائمة تعيين الهدف في شاشة المعلم
    const hifzGoalSelect = document.getElementById('assign-task-hifz-goal'); 
    if (hifzGoalSelect) {
        hifzGoalSelect.innerHTML = hifzStartSelect.innerHTML;
        // يجب أن نغير الـ ID هنا لتجنب التضارب إذا كان موجودًا في HTML
    }
}


/**
 * دالة: استخلاص حالة المنهج من بيانات الطالب (للعرض في لوحة التحكم)
 */
function getCurriculumLabel(studentData) {
    const levelDetails = getLevelDetails(studentData.current_level);
    
    // حالة الحفظ
    const hifzLabel = studentData.hifz_start_point 
        ? `البداية: ${studentData.hifz_start_point}` 
        : 'غير محدد';
        
    // حالة المراجعة
    const reviewKey = getReviewKeyByLevel(studentData.current_level);
    const reviewList = REVIEW_METHODOLOGY[reviewKey]; // REVIEW_METHODOLOGY: الثابت المُستورد
    const progress = studentData.murajaa_progress || 0;
    
    let murajaaLabel;
    if (!reviewList) {
        murajaaLabel = 'لا مراجعة للمستوى';
    } else if (progress >= reviewList.length) {
        murajaaLabel = `تم إكمال ${levelDetails.name} للمراجعة 🎉`;
    } else {
        murajaaLabel = `المهمة ${progress + 1} من ${reviewList.length} في ${levelDetails.name}`;
    }
    
    return { hifz: hifzLabel, murajaa: murajaaLabel, level: levelDetails.name };
}


function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');

    if (screenId === 'teacher-screen') {
        loadStudentsForTeacher();
        loadPendingTasksForReview();
        displayLeaderboardForTeacher();
        document.querySelector('.tab-button[data-tab="dashboard"]').click();
    }
}


// ===============================================
// 2. دوال شاشة الطالب (Student Screen)
// ===============================================

/**
 * دالة لضمان وجود المهام الشخصية الحالية (حفظ/مراجعة)
 * (تم تعديلها لاستخدام نظام المنهج الجديد القائم على المستوى والنقاط)
 */
async function ensureCurriculumTasks(studentData) {
    const studentRef = db.collection("students").doc(studentData.code);
    let shouldUpdate = false;
    let tasks = studentData.tasks || [];
    const levelDetails = getLevelDetails(studentData.current_level);
    const hifzStart = studentData.hifz_start_point;
    const hifzGoal = studentData.hifz_goal_point;

    // 1. مهمة الحفظ الشخصية (Hifz)
    if (hifzStart && hifzGoal) {
        const expectedDescription = `حفظ: من ${hifzStart} إلى ${hifzGoal}`;
        const hifzTaskExists = tasks.some(t => t.description === expectedDescription && t.status !== 'completed');

        if (!hifzTaskExists) {
            tasks.push({
                id: db.collection('_').doc().id,
                type: 'hifz',
                description: expectedDescription,
                points: levelDetails.hifz_points,
                status: 'assigned',
                created_at: new Date()
            });
            shouldUpdate = true;
        }
    } else if (hifzStart && !hifzGoal) {
        // حالة انتظار تعيين الهدف من المعلم
        const waitingTaskExists = tasks.some(t => t.type === 'hifz' && t.status === 'assigned' && t.description.includes('بانتظار تحديد الهدف'));
        if (!waitingTaskExists) {
             tasks.push({
                id: db.collection('_').doc().id,
                type: 'hifz',
                description: `حفظ: بانتظار تحديد الهدف الجديد من المعلم (المرجع: ${hifzStart})`,
                points: 0,
                status: 'assigned',
                created_at: new Date()
            });
            shouldUpdate = true;
        }
    }


    // 2. مهمة المراجعة المتسلسلة (Murajaa)
    const reviewKey = getReviewKeyByLevel(studentData.current_level);
    const reviewList = REVIEW_METHODOLOGY[reviewKey];
    const nextReviewIndex = studentData.murajaa_progress || 0; 

    if (reviewList && nextReviewIndex < reviewList.length) {
        const nextReviewTaskLabel = reviewList[nextReviewIndex];
        const expectedDescription = `مراجعة: ${nextReviewTaskLabel}`;
        const murajaaTaskExists = tasks.some(t => t.description === expectedDescription && t.status !== 'completed');

        if (!murajaaTaskExists) {
            tasks.push({
                id: db.collection('_').doc().id,
                type: 'murajaa',
                description: expectedDescription,
                points: levelDetails.murajaa_points,
                status: 'assigned',
                created_at: new Date()
            });
            shouldUpdate = true;
        }
    }

    // 3. تحديث قاعدة البيانات
    if (shouldUpdate) {
        await studentRef.update({ tasks: tasks });
        studentData.tasks = tasks; 
    }

    return studentData;
}

/**
 * دالة عرض واجهة الطالب
 */
async function displayStudentDashboard(studentData) {
    const welcomeElement = document.getElementById('welcome-student');
    welcomeElement.textContent = `أهلاً بك يا ${studentData.name}`;

    const { hifz, murajaa, level } = getCurriculumLabel(studentData);
    
    // 1. عرض بيانات البطاقات الإحصائية
    const pointsElement = document.getElementById('student-total-points');
    const levelElement = document.getElementById('student-level'); 
    const hifzProgressElement = document.getElementById('student-hifz-progress');
    const murajaaProgressElement = document.getElementById('student-murajaa-progress');

    pointsElement.textContent = studentData.total_points || 0;
    // تأكد من وجود حقل levelElement في HTML
    if (levelElement) levelElement.textContent = level; 
    hifzProgressElement.textContent = hifz;
    murajaaProgressElement.textContent = murajaa;

    // 2. عرض المهام النشطة
    const tasksListElement = document.getElementById('student-tasks');
    tasksListElement.innerHTML = '<h2>مهامك الحالية</h2>';
    
    const activeTasks = studentData.tasks ? studentData.tasks.filter(t => t.status !== 'completed') : [];

    if (activeTasks.length === 0) {
        tasksListElement.innerHTML += '<p class="message info">لا توجد لديك مهام حالياً. بالتوفيق!</p>';
        return;
    }

    activeTasks.forEach(task => {
        let taskClass = 'general-task';
        if (task.type === 'hifz') taskClass = 'hifz-task';
        if (task.type === 'murajaa') taskClass = 'murajaa-task';
        
        const isPending = task.status === 'pending';

        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${taskClass}`;
        taskItem.innerHTML = `
            <div class="task-details">
                <div class="task-description">${task.description}</div>
                <div class="task-points">نقاط المهمة: ${task.points} 🌟</div>
            </div>
            <div class="task-actions">
                ${isPending
                    ? '<button class="action-btn secondary-btn" disabled>قيد المراجعة ⏳</button>'
                    : `<button
                        class="action-btn primary-btn"
                        ${task.points === 0 ? 'disabled' : ''} 
                        onclick="sendTaskToReview('${studentData.code}', '${task.id}')">
                        أنجزت المهمة ✅
                    </button>`
                }
            </div>
        `;
        tasksListElement.appendChild(taskItem);
    });
}

/**
 * دالة لتغيير حالة المهمة إلى 'pending' (قيد المراجعة)
 */
async function sendTaskToReview(studentCode, taskId) {
    try {
        const studentRef = db.collection("students").doc(studentCode);

        await db.runTransaction(async (transaction) => {
            const studentDoc = await transaction.get(studentRef);
            if (!studentDoc.exists) {
                throw "Student document does not exist!";
            }
            
            const studentData = studentDoc.data();
            const taskIndex = studentData.tasks.findIndex(t => t.id === taskId);

            if (taskIndex !== -1 && studentData.tasks[taskIndex].status === 'assigned') {
                studentData.tasks[taskIndex].status = 'pending';
                studentData.tasks[taskIndex].submission_date = new Date(); 
                transaction.update(studentRef, { tasks: studentData.tasks });
            } else {
                throw "Task not found or already submitted!";
            }
        });

        const updatedStudentSnap = await studentRef.get();
        displayStudentDashboard(updatedStudentSnap.data());

        alert("تم إرسال المهمة للمراجعة بنجاح!");
    } catch (error) {
        console.error("Error sending task to review:", error);
        alert("فشل إرسال المهمة للمراجعة. حاول مرة أخرى.");
    }
}


// ===============================================
// 3. دوال شاشة المعلم (Teacher Screen)
// ===============================================

/**
 * دالة مراجعة المهمة (قبول/رفض)
 */
async function reviewTask(studentCode, taskId, action) {
    try {
        const studentRef = db.collection("students").doc(studentCode);

        await db.runTransaction(async (transaction) => {
            const studentDoc = await transaction.get(studentRef);
            if (!studentDoc.exists) throw "Student document does not exist!";
            
            const studentData = studentDoc.data();
            const taskIndex = studentData.tasks.findIndex(t => t.id === taskId);
            
            if (taskIndex === -1) throw "Task not found!";

            const task = studentData.tasks[taskIndex];
            
            if (action === 'accepted') {
                const currentPoints = studentData.total_points || 0;
                studentData.total_points = currentPoints + task.points;
                
                if (task.type === 'hifz' && studentData.hifz_goal_point) {
                    // 1. عند قبول مهمة الحفظ، نجعل نقطة البداية الجديدة هي الهدف القديم
                    studentData.hifz_start_point = studentData.hifz_goal_point;
                    // 2. يتم حذف الهدف لإجبار المعلم على تعيين هدف جديد
                    studentData.hifz_goal_point = null; 
                    
                } else if (task.type === 'murajaa') {
                    // 1. نزيد مؤشر تقدم المراجعة
                    studentData.murajaa_progress = (studentData.murajaa_progress || 0) + 1;
                }

                studentData.tasks[taskIndex].status = 'completed';

            } else if (action === 'rejected') {
                // إعادة المهمة إلى حالة 'assigned'
                studentData.tasks[taskIndex].status = 'assigned';
                delete studentData.tasks[taskIndex].submission_date;
            }
            
            transaction.update(studentRef, {
                total_points: studentData.total_points,
                hifz_start_point: studentData.hifz_start_point, 
                hifz_goal_point: studentData.hifz_goal_point,   
                murajaa_progress: studentData.murajaa_progress,
                tasks: studentData.tasks
            });
        });

        alert(`تم ${action === 'accepted' ? 'قبول' : 'رفض'} المهمة بنجاح.`);
        
        // ضمان إنشاء المهمة التالية بعد قبول المهمة الحالية
        const updatedStudentDoc = await studentRef.get();
        await ensureCurriculumTasks(updatedStudentDoc.data());

        loadPendingTasksForReview();
        displayLeaderboardForTeacher();

    } catch (error) {
        console.error("Error reviewing task:", error);
        alert("فشل في مراجعة المهمة. حاول مرة أخرى.");
    }
}


/**
 * دالة عرض المنهج في شاشة المعلم
 */
function displayCurriculumForTeacher() {
    const curriculumDisplay = document.getElementById('curriculum-display-content'); 
    if (!curriculumDisplay) return;
    
    let html = '<h2>مستويات المنهج المعتمدة</h2>';
    html += '<ol class="curriculum-levels-list">';
    
    // CURRICULUM_LEVELS: الثابت المُستورد
    Object.keys(CURRICULUM_LEVELS).forEach(key => {
        const level = CURRICULUM_LEVELS[key];
        const reviewKey = getReviewKeyByLevel(key);
        const reviewList = REVIEW_METHODOLOGY[reviewKey] || []; // REVIEW_METHODOLOGY: الثابت المُستورد
        
        html += `
            <li>
                <strong>${level.name}</strong> (${key})
                <ul>
                    <li>نقاط الحفظ: ${level.hifz_points}</li>
                    <li>نقاط المراجعة: ${level.murajaa_points}</li>
                    <li>مهمة المراجعة: ${reviewList.length} مهمة متسلسلة</li>
                    <li style="font-size: 0.8em; color: #6c757d;">مثال للمراجعة: ${reviewList.slice(0, 3).join(', ')}${reviewList.length > 3 ? '...' : ''}</li>
                </ul>
            </li>
        `;
    });
    html += '</ol>';
    curriculumDisplay.innerHTML = html;
}

/**
 * دالة تحميل قائمة الطلاب
 */
async function loadStudentsForTeacher() {
    const studentList = document.getElementById('student-list');
    studentList.innerHTML = '<li>جارٍ تحميل بيانات الطلاب...</li>';

    // تهيئة واجهة تعيين الهدف (يجب أن يتم استدعاء fillHifzPointsSelects() هنا)
    const assignHifzGoalContainer = document.getElementById('assign-hifz-goal-container');
    if (assignHifzGoalContainer && assignHifzGoalContainer.innerHTML.trim() === '') {
        fillHifzPointsSelects(); // تعبئة قائمة اختيار الهدف
        assignHifzGoalContainer.innerHTML = `
             <div class="input-group">
                <label for="assign-hifz-student-code">رمز الطالب</label>
                <input type="text" id="assign-hifz-student-code" placeholder="رمز الطالب">
            </div>
            <div class="input-group">
                <label for="assign-task-hifz-goal">تعيين نقطة الهدف الجديدة</label>
                <select id="new-student-hifz-start"></select> 
            </div>
            <button class="action-btn primary-btn" onclick="assignHifzGoal()">تعيين الهدف</button>
            <p id="assign-hifz-message" class="message hidden"></p>
        `;
        // إعادة تعبئة القائمة بعد إنشاء الـ Select
        fillHifzPointsSelects(); 
    }

    try {
        const studentsRef = db.collection("students");
        const q = studentsRef.where("role", "==", "student");
        const snapshot = await q.get();

        studentList.innerHTML = '';

        snapshot.forEach(doc => {
            const student = doc.data();
            const listItem = document.createElement('li');
            
            const { hifz, murajaa, level } = getCurriculumLabel(student);

            listItem.innerHTML = `
                <div>
                    <strong>${student.name} (${student.code})</strong>
                    <div style="font-size: 0.9em; color: #6c757d;">
                        المستوى: ${level} | الحفظ: ${hifz} | المراجعة: ${murajaa}
                    </div>
                </div>
                
                <div class="student-actions">
                    <input type="number" id="points-input-${student.code}" value="${student.total_points || 0}" style="width: 80px; text-align: center;">
                    <button class="action-btn primary-btn"
                        onclick="updateStudentPoints('${student.code}')">
                        حفظ النقاط
                    </button>
                </div>
            `;
            studentList.appendChild(listItem);
        });

    } catch (error) {
        console.error("Error loading students for teacher:", error);
        studentList.innerHTML = '<li class="message error">فشل في تحميل قائمة الطلاب.</li>';
    }
}


/**
 * دالة: لتعيين نقطة الهدف الجديدة للحفظ
 */
async function assignHifzGoal() {
    const studentCode = document.getElementById('assign-hifz-student-code').value.trim();
    // نستخدم الـ ID الذي تم تعبئته (new-student-hifz-start)
    const newGoalPoint = document.getElementById('new-student-hifz-start').value.trim(); 
    const messageElement = document.getElementById('assign-hifz-message');
    
    if (!studentCode || !newGoalPoint) {
        messageElement.textContent = 'الرجاء ملء حقل رمز الطالب ونقطة الهدف.';
        messageElement.className = 'message error';
        messageElement.classList.remove('hidden');
        return;
    }

    try {
        const studentRef = db.collection("students").doc(studentCode);
        const studentSnap = await studentRef.get();
        
        if (!studentSnap.exists || studentSnap.data().role !== 'student') {
            messageElement.textContent = 'رمز الطالب غير صحيح.';
            messageElement.className = 'message error';
            messageElement.classList.remove('hidden');
            return;
        }
        
        // 1. تحديث حقل الهدف الجديد
        await studentRef.update({ hifz_goal_point: newGoalPoint });
        
        // 2. إعادة إنشاء المهام لضمان ظهور مهمة الحفظ الجديدة
        const updatedStudentSnap = await studentRef.get();
        await ensureCurriculumTasks(updatedStudentSnap.data());

        messageElement.textContent = `تم تعيين هدف الحفظ للطالب ${studentCode} بنجاح إلى ${newGoalPoint}!`;
        messageElement.className = 'message success';
        messageElement.classList.remove('hidden');
        
        document.getElementById('assign-hifz-student-code').value = '';
        loadStudentsForTeacher();
        
    } catch (e) {
        console.error("Error assigning hifz goal: ", e);
        messageElement.textContent = 'فشل في تعيين الهدف. حاول مرة أخرى.';
        messageElement.className = 'message error';
        messageElement.classList.remove('hidden');
    }
}

// ... [ displayLeaderboardForTeacher, loadPendingTasksForReview, updateStudentPoints ]
// تم الإبقاء على الدوال كما هي في الكود الأصلي


// ===============================================
// 4. دوال تعيين وتسجيل الطلاب (Assign & Register)
// ===============================================

// دالة تسجيل طالب جديد (مُعدلة لحقول المنهج الجديدة)
document.getElementById('register-student-button').addEventListener('click', async () => {
    const code = document.getElementById('new-student-code').value.trim();
    const name = document.getElementById('new-student-name').value.trim();
    // حقل اختيار المستوى الجديد (يجب أن يكون موجوداً في HTML)
    const level = document.getElementById('new-student-level').value; 
    const hifzStart = document.getElementById('new-student-hifz-start').value.trim();
    const messageElement = document.getElementById('register-student-message');

    if (!code || !name || !level) {
        messageElement.textContent = 'الرجاء ملء جميع الحقول المطلوبة (الرمز، الاسم، المستوى).';
        messageElement.className = 'message error';
        messageElement.classList.remove('hidden');
        return;
    }

    try {
        const studentRef = db.collection("students").doc(code);
        const studentSnap = await studentRef.get();

        if (studentSnap.exists) {
            messageElement.textContent = 'هذا الرمز موجود بالفعل. يرجى اختيار رمز آخر.';
            messageElement.className = 'message error';
            messageElement.classList.remove('hidden');
            return;
        }
        
        const initialHifzStart = hifzStart || null; // إذا لم يحدد، نتركها فارغة
        const initialMurajaaProgress = 0;

        await studentRef.set({
            code: code,
            name: name,
            role: 'student',
            total_points: 0,
            current_level: level, 
            hifz_start_point: initialHifzStart, 
            hifz_goal_point: null, 
            murajaa_progress: initialMurajaaProgress, 
            tasks: [],
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        const newStudentData = (await studentRef.get()).data();
        await ensureCurriculumTasks(newStudentData);

        messageElement.textContent = `تم تسجيل الطالب ${name} بنجاح!`;
        messageElement.className = 'message success';
        messageElement.classList.remove('hidden');

        document.getElementById('new-student-code').value = '';
        document.getElementById('new-student-name').value = '';

        loadStudentsForTeacher();

    } catch (e) {
        console.error("Error adding document: ", e);
        messageElement.textContent = 'فشل في عملية التسجيل. حاول مرة أخرى.';
        messageElement.className = 'message error';
        messageElement.classList.remove('hidden');
    }
});

// ... [ باقي الدوال في القسم 4 و 5 كما هي في الكود الأصلي ]


// ===============================================
// 5. التحكم في الشاشات والتسجيل
// ===============================================

// دوال التسجيل والخروج (تم الإبقاء عليها مع تعديل بسيط في الدخول)
document.getElementById('login-button').addEventListener('click', async () => {
    const userCode = document.getElementById('user-code').value.trim();
    // ... (باقي كود الدخول كما هو)
    if (!userCode) {
        document.getElementById('auth-message').textContent = 'الرجاء إدخال الرمز.';
        document.getElementById('auth-message').classList.remove('hidden');
        return;
    }
    document.getElementById('auth-message').classList.add('hidden');
    currentUserCode = userCode;

    if (userCode === 'teacher') {
        showScreen('teacher-screen');
    } else {
        try {
            const studentRef = db.collection("students").doc(userCode);
            const studentSnap = await studentRef.get();

            if (studentSnap.exists && studentSnap.data().role === 'student') {
                const studentData = studentSnap.data();
                const updatedStudentData = await ensureCurriculumTasks(studentData);
                displayStudentDashboard(updatedStudentData);
                showScreen('student-screen');
            } else {
                document.getElementById('auth-message').textContent = 'رمز الطالب غير صحيح.';
                document.getElementById('auth-message').classList.remove('hidden');
                currentUserCode = null;
            }
        } catch (e) {
            console.error("Login error:", e);
            document.getElementById('auth-message').textContent = 'حدث خطأ في الاتصال. حاول لاحقاً.';
            document.getElementById('auth-message').classList.remove('hidden');
        }
    }
});

document.querySelectorAll('.logout-btn').forEach(button => {
    button.addEventListener('click', () => {
        currentUserCode = null;
        document.getElementById('user-code').value = '';
        showScreen('auth-screen');
    });
});

// التحكم في تبويبات شاشة المعلم
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));

        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(`${tabId}-tab`).classList.remove('hidden');
        
        if (tabId === 'review-tasks') {
            loadPendingTasksForReview();
        } else if (tabId === 'manage-students') {
            loadStudentsForTeacher();
        } else if (tabId === 'dashboard') {
            displayLeaderboardForTeacher();
        } else if (tabId === 'manage-curriculum') {
            displayCurriculumForTeacher(); 
        }
    });
});

// عند تحميل الصفحة، ابدأ بتهيئة الواجهة وإظهار شاشة الدخول
window.onload = () => {
    fillHifzPointsSelects();
    showScreen('auth-screen');
};


// ** جعل الدوال قابلة للوصول من HTML (ضروري لـ onclick) **
window.sendTaskToReview = sendTaskToReview;
window.reviewTask = reviewTask;
window.updateStudentPoints = updateStudentPoints;
window.assignHifzGoal = assignHifzGoal; 
// ...
