// ** تم حذف جميع عبارات import واستبدالها بالوصول المباشر عبر الكائن العام (firebase) **

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

// تهيئة Firebase باستخدام الكائن العام
const app = firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics(app);
const db = firebase.firestore(app);

// ** المتغيرات العامة للمنهج **
let globalHifzCurriculum = [];
let globalMurajaaCurriculum = [];
let currentUserCode = null;


// ===============================================
// 1. الدوال المساعدة للواجهة والبيانات
// ===============================================

async function loadCurriculumFromFirestore() {
    try {
        const curriculumRef = db.collection("curriculumItems");
        const snapshot = await curriculumRef.orderBy("order", "asc").get();

        globalHifzCurriculum = [];
        globalMurajaaCurriculum = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            const item = { ...data, id: doc.id }; 
            if (data.type === 'hifz') {
                globalHifzCurriculum.push(item);
            } else if (data.type === 'murajaa') {
                globalMurajaaCurriculum.push(item);
            }
        });

        fillCurriculumSelects();
        displayCurriculumForTeacher(); 

    } catch (error) {
        console.error("Error loading curriculum:", error);
    }
}

function fillCurriculumSelects() {
    const hifzSelect = document.getElementById('new-student-hifz-start');
    const murajaaSelect = document.getElementById('new-student-murajaa-start');

    hifzSelect.innerHTML = '<option value="0">نقطة البداية (غير مُعين)</option>';
    murajaaSelect.innerHTML = '<option value="0">نقطة البداية (غير مُعين)</option>';

    globalHifzCurriculum.forEach((item, index) => {
        const option = new Option(item.label, index + 1);
        hifzSelect.add(option);
    });

    globalMurajaaCurriculum.forEach((item, index) => {
        const option = new Option(item.label, index + 1);
        murajaaSelect.add(option);
    });
}

function getCurriculumLabel(progressIndex, type) {
    const curriculum = type === 'hifz' ? globalHifzCurriculum : globalMurajaaCurriculum;
    
    if (progressIndex <= 0) return "المنهج غير مُعين";
    
    if (progressIndex <= curriculum.length) {
        return curriculum[progressIndex - 1].label;
    }
    
    return "تم إكمال المنهج بالكامل 🎉";
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
        displayCurriculumForTeacher(); 
        
        document.querySelector('.tab-button[data-tab="dashboard"]').click(); 
    }
}


// ===============================================
// 2. دوال شاشة الطالب (Student Screen)
// ===============================================

/**
 * دالة لضمان وجود المهام التسلسلية الحالية في قائمة مهام الطالب.
 * يتم استدعاؤها عند تسجيل الدخول أو بعد مراجعة المهمة.
 *
 * (هذه الدالة المضافة لحل مشكلة عدم ظهور المهام)
 * * @param {object} studentData كائن بيانات الطالب الحالي
 * @returns {Promise<object>} بيانات الطالب المحدثة (محتملة الإضافة)
 */
/**
 * دالة لضمان وجود المهام التسلسلية الحالية في قائمة مهام الطالب.
 * (تم تعديل حقل created_at لحل مشكلة الخطأ FirebaseError: FieldValue.serverTimestamp() is not currently supported inside arrays)
 */
async function ensureCurriculumTasks(studentData) {
    const studentRef = db.collection("students").doc(studentData.code);
    let shouldUpdate = false;
    let tasks = studentData.tasks || [];

    // 1. تحديد المهمة الرئيسية للحفظ
    const hifzIndex = studentData.hifz_progress || 0;
    const currentHifzItem = globalHifzCurriculum[hifzIndex - 1]; 

    if (currentHifzItem) {
        const expectedDescription = `حفظ: ${currentHifzItem.label}`;
        const hifzTaskExists = tasks.some(t => t.description === expectedDescription && t.status !== 'completed');
        
        if (!hifzTaskExists) {
            tasks.push({
                id: db.collection('_').doc().id,
                type: 'hifz',
                description: expectedDescription,
                points: currentHifzItem.points,
                status: 'assigned',
                // ⭐⭐ التعديل: استخدام التاريخ المحلي (مقارنة بـ serverTimestamp() الذي يسبب الخطأ) ⭐⭐
                created_at: new Date() 
            });
            shouldUpdate = true;
        }
    }

    // 2. تحديد المهمة الرئيسية للمراجعة
    const murajaaIndex = studentData.murajaa_progress || 0;
    const currentMurajaaItem = globalMurajaaCurriculum[murajaaIndex - 1];

    if (currentMurajaaItem) {
        const expectedDescription = `مراجعة: ${currentMurajaaItem.label}`;
        const murajaaTaskExists = tasks.some(t => t.description === expectedDescription && t.status !== 'completed');
        
        if (!murajaaTaskExists) {
            tasks.push({
                id: db.collection('_').doc().id,
                type: 'murajaa',
                description: expectedDescription,
                points: currentMurajaaItem.points,
                status: 'assigned',
                // ⭐⭐ التعديل: استخدام التاريخ المحلي (مقارنة بـ serverTimestamp() الذي يسبب الخطأ) ⭐⭐
                created_at: new Date() 
            });
            shouldUpdate = true;
        }
    }

    // 3. تحديث قاعدة البيانات إذا كانت هناك مهام جديدة
    if (shouldUpdate) {
        await studentRef.update({ tasks: tasks });
        studentData.tasks = tasks; // تحديث الكائن المحلي
    }

    return studentData;
}

/**
 * ⭐⭐ الدالة الأصلية المعدلة لعرض واجهة الطالب ⭐⭐
 */
async function displayStudentDashboard(studentData) {
    const welcomeElement = document.getElementById('welcome-student');
    welcomeElement.textContent = `أهلاً بك يا ${studentData.name}`;

    // 1. عرض بيانات البطاقات الإحصائية
    const pointsElement = document.getElementById('student-total-points');
    const hifzProgressElement = document.getElementById('student-hifz-progress');
    const murajaaProgressElement = document.getElementById('student-murajaa-progress');

    pointsElement.textContent = studentData.total_points || 0;
    
    const hifzLabel = getCurriculumLabel(studentData.hifz_progress || 0, 'hifz');
    const murajaaLabel = getCurriculumLabel(studentData.murajaa_progress || 0, 'murajaa');
    
    hifzProgressElement.textContent = hifzLabel;
    murajaaProgressElement.textContent = murajaaLabel;

    // 2. عرض المهام النشطة
    const tasksListElement = document.getElementById('student-tasks');
    tasksListElement.innerHTML = '<h2>مهامك الحالية</h2>';
    
    // فلترة المهام التي ليست 'completed' (مكتملة)
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
 * دالة عرض المنهج في تبويب "عرض المنهج"
 */
/**
 * دالة عرض المنهج في تبويب "عرض المنهج"
 * (تم تعديل التنسيق لاستخدام وسم <strong> بدلاً من **)
 */
function displayCurriculumForTeacher() {
    const hifzDisplay = document.getElementById('hifz-curriculum-display');
    const murajaaDisplay = document.getElementById('murajaa-curriculum-display');

    // عرض منهج الحفظ
    let hifzHtml = '<ol>';
    globalHifzCurriculum.forEach((item, index) => {
        // ⭐ التعديل هنا ⭐
        hifzHtml += `<li><strong>المستوى ${index + 1}</strong>: ${item.label} (النقاط: ${item.points})</li>`;
    });
    hifzHtml += '</ol>';
    hifzDisplay.innerHTML = hifzHtml;

    // عرض منهج المراجعة
    let murajaaHtml = '<ol>';
    globalMurajaaCurriculum.forEach((item, index) => {
        // ⭐ التعديل هنا ⭐
        murajaaHtml += `<li><strong>المستوى ${index + 1}</strong>: ${item.label} (النقاط: ${item.points})</li>`;
    });
    murajaaHtml += '</ol>';
    murajaaDisplay.innerHTML = murajaaHtml;

    if (globalHifzCurriculum.length === 0 && globalMurajaaCurriculum.length === 0) {
        hifzDisplay.innerHTML = '<p class="message info">لم يتم تحميل بيانات المنهج بعد.</p>';
        murajaaDisplay.innerHTML = '';
    }
}


/**
 * دالة تحميل وعرض لوحة الشرف (أفضل 10)
 */
async function displayLeaderboardForTeacher() {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '<li>جارٍ تحميل لوحة الشرف...</li>';

    try {
        const studentsRef = db.collection("students");
        const snapshot = await studentsRef.orderBy("total_points", "desc").limit(10).get();

        leaderboardList.innerHTML = '';
        let rank = 1;

        snapshot.forEach(doc => {
            const student = doc.data();
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div>#${rank} - ${student.name} (${student.code})</div>
                <div>**${student.total_points || 0} نقطة** 🌟</div>
            `;
            leaderboardList.appendChild(listItem);
            rank++;
        });

        if (rank === 1) {
            leaderboardList.innerHTML = '<li class="message info">لا توجد بيانات طلاب حالياً.</li>';
        }

    } catch (error) {
        console.error("Error loading leaderboard:", error);
        leaderboardList.innerHTML = '<li class="message error">فشل في تحميل لوحة الشرف.</li>';
    }
}

/**
 * الدالة المعدلة: تحميل قائمة الطلاب مع دعم تعديل النقاط المباشر
 */
async function loadStudentsForTeacher() {
    const studentList = document.getElementById('student-list');
    studentList.innerHTML = '<li>جارٍ تحميل بيانات الطلاب...</li>';

    try {
        const studentsRef = db.collection("students");
        const q = studentsRef.where("role", "==", "student");
        const snapshot = await q.get();

        studentList.innerHTML = '';

        snapshot.forEach(doc => {
            const student = doc.data();
            const listItem = document.createElement('li');
            
            const hifzStatus = getCurriculumLabel(student.hifz_progress, 'hifz');
            const murajaaStatus = getCurriculumLabel(student.murajaa_progress, 'murajaa');

            listItem.innerHTML = `
                <div>
                    <strong>${student.name} (${student.code})</strong>
                    <div style="font-size: 0.9em; color: #6c757d;">
                        حفظ: ${hifzStatus} | مراجعة: ${murajaaStatus}
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
 * دالة لتحديث نقاط الطالب بشكل مباشر
 */
async function updateStudentPoints(studentCode) {
    const inputElement = document.getElementById(`points-input-${studentCode}`);
    const newPoints = parseInt(inputElement.value);

    if (isNaN(newPoints) || newPoints < 0) {
        alert("يرجى إدخال قيمة نقاط صحيحة.");
        return;
    }

    try {
        const studentRef = db.collection("students").doc(studentCode);
        await studentRef.update({ total_points: newPoints });

        alert(`تم تحديث نقاط الطالب ${studentCode} بنجاح إلى ${newPoints}.`);
        
        loadStudentsForTeacher();
        displayLeaderboardForTeacher(); 

    } catch (error) {
        console.error("Error updating points:", error);
        alert("فشل في تحديث النقاط.");
    }
}


/**
 * دالة تحميل المهام بانتظار المراجعة (حالة 'pending')
 */
async function loadPendingTasksForReview() {
    const pendingTasksList = document.getElementById('pending-tasks-list');
    pendingTasksList.innerHTML = '';
    let hasPendingTasks = false;

    try {
        const studentsRef = db.collection("students");
        const studentsSnapshot = await studentsRef.get();

        studentsSnapshot.forEach(studentDoc => {
            const student = studentDoc.data();
            const pendingTasks = student.tasks ? student.tasks.filter(t => t.status === 'pending') : [];

            if (pendingTasks.length > 0) {
                hasPendingTasks = true;
                
                const studentHeader = document.createElement('h4');
                studentHeader.textContent = `مهام الطالب: ${student.name} (${student.code})`;
                pendingTasksList.appendChild(studentHeader);

                pendingTasks.forEach(task => {
                    const taskItem = document.createElement('div');
                    taskItem.className = 'task-review-item';
                    taskItem.innerHTML = `
                        <div class="task-details">
                            <div class="task-description">${task.description} (${task.type})</div>
                            <div class="task-points">نقاط المهمة: ${task.points} 🌟</div>
                        </div>
                        <div class="review-actions">
                            <button class="action-btn success-btn" 
                                onclick="reviewTask('${student.code}', '${task.id}', 'accepted')">
                                قبول ✅
                            </button>
                            <button class="action-btn error-btn" 
                                onclick="reviewTask('${student.code}', '${task.id}', 'rejected')">
                                رفض ❌
                            </button>
                        </div>
                    `;
                    pendingTasksList.appendChild(taskItem);
                });
            }
        });
        
        if (!hasPendingTasks) {
            pendingTasksList.innerHTML = '<p class="message info">لا توجد مهام بانتظار المراجعة حالياً.</p>';
        }

    } catch (error) {
        console.error("Error loading pending tasks:", error);
        pendingTasksList.innerHTML = '<p class="message error">فشل في تحميل المهام المعلقة.</p>';
    }
}

/**
 * الدالة الأصلية: مراجعة المهمة (قبول/رفض)
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
                
                if (task.type === 'hifz') {
                    studentData.hifz_progress = (studentData.hifz_progress || 0) + 1; 
                } else if (task.type === 'murajaa') {
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
                hifz_progress: studentData.hifz_progress,
                murajaa_progress: studentData.murajaa_progress,
                tasks: studentData.tasks 
            });
        });

        alert(`تم ${action === 'accepted' ? 'قبول' : 'رفض'} المهمة بنجاح.`);
        
        // ⭐⭐ تعديل: ضمان إنشاء المهمة التالية بعد قبول المهمة الحالية ⭐⭐
        const updatedStudentDoc = await studentRef.get();
        await ensureCurriculumTasks(updatedStudentDoc.data());

        loadPendingTasksForReview();
        displayLeaderboardForTeacher();

    } catch (error) {
        console.error("Error reviewing task:", error);
        alert("فشل في مراجعة المهمة. حاول مرة أخرى.");
    }
}


// ===============================================
// 4. دوال تعيين وتسجيل الطلاب (Assign & Register)
// ===============================================

// ربط أزرار تعيين المهام بالدالة (Assign Task)
document.getElementById('assign-individual-task-button').addEventListener('click', () => assignTask(false));
document.getElementById('assign-group-task-button').addEventListener('click', () => assignTask(true));

async function assignTask(isGroup) {
    const type = document.getElementById('assign-task-type').value;
    const description = document.getElementById('assign-task-description').value.trim();
    const points = parseInt(document.getElementById('assign-task-points').value);
    const studentCode = document.getElementById('assign-task-student-code').value.trim();
    const messageElement = document.getElementById('assign-task-message');

    if (!description || isNaN(points) || points <= 0 || (!isGroup && !studentCode)) {
        messageElement.textContent = 'الرجاء ملء جميع الحقول المطلوبة بشكل صحيح.';
        messageElement.className = 'message error';
        messageElement.classList.remove('hidden');
        return;
    }
    
    const newTask = {
        // نستخدم ID فريد لسهولة التتبع والمراجعة
        id: db.collection('_').doc().id, 
        type: type,
        description: description,
        points: points,
        status: 'assigned',
        created_at: firebase.firestore.FieldValue.serverTimestamp() 
    };

    try {
        if (isGroup) {
            const studentsRef = db.collection("students");
            const studentsSnapshot = await studentsRef.where("role", "==", "student").get();
            
            const batch = db.batch();
            studentsSnapshot.forEach(doc => {
                const studentRef = studentsRef.doc(doc.id);
                const currentTasks = doc.data().tasks || [];
                const isTaskExist = currentTasks.some(t => t.description === description && t.status !== 'completed');
                if (!isTaskExist) {
                    batch.update(studentRef, { tasks: firebase.firestore.FieldValue.arrayUnion(newTask) });
                }
            });
            await batch.commit();

            messageElement.textContent = 'تم تعيين المهمة لجميع الطلاب بنجاح!';
            messageElement.className = 'message success';
        } else {
            const studentRef = db.collection("students").doc(studentCode);
            const studentSnap = await studentRef.get();
            
            if (!studentSnap.exists || studentSnap.data().role !== 'student') {
                messageElement.textContent = 'رمز الطالب غير صحيح.';
                messageElement.className = 'message error';
                messageElement.classList.remove('hidden');
                return;
            }

            await studentRef.update({
                tasks: firebase.firestore.FieldValue.arrayUnion(newTask)
            });

            messageElement.textContent = `تم تعيين المهمة للطالب ${studentCode} بنجاح!`;
            messageElement.className = 'message success';
        }

        messageElement.classList.remove('hidden');
        document.getElementById('assign-task-description').value = '';
        document.getElementById('assign-task-points').value = '';
        document.getElementById('assign-task-student-code').value = '';

    } catch (e) {
        console.error("Error assigning task: ", e);
        messageElement.textContent = 'فشل في تعيين المهمة. حاول مرة أخرى.';
        messageElement.className = 'message error';
        messageElement.classList.remove('hidden');
    }
}


/**
 * دالة تسجيل طالب جديد
 */
document.getElementById('register-student-button').addEventListener('click', async () => {
    const code = document.getElementById('new-student-code').value.trim();
    const name = document.getElementById('new-student-name').value.trim();
    const hifzStart = parseInt(document.getElementById('new-student-hifz-start').value);
    const murajaaStart = parseInt(document.getElementById('new-student-murajaa-start').value);
    const messageElement = document.getElementById('register-student-message');

    if (!code || !name) {
        messageElement.textContent = 'الرجاء ملء جميع الحقول المطلوبة.';
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

        await studentRef.set({
            code: code,
            name: name,
            role: 'student',
            total_points: 0,
            hifz_progress: hifzStart,
            murajaa_progress: murajaaStart,
            tasks: [],
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        
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


// ===============================================
// 5. التحكم في الشاشات والتسجيل
// ===============================================

// دوال التسجيل والخروج
document.getElementById('login-button').addEventListener('click', async () => {
    const userCode = document.getElementById('user-code').value.trim();
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
                // ⭐⭐ تعديل: ضمان إنشاء المهام قبل عرضها ⭐⭐
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


// عند تحميل الصفحة، ابدأ بتحميل المنهج وإظهار شاشة الدخول
window.onload = () => {
    loadCurriculumFromFirestore();
    showScreen('auth-screen');
};

// ** جعل الدوال قابلة للوصول من HTML (ضروري لـ onclick) **
window.sendTaskToReview = sendTaskToReview;
window.reviewTask = reviewTask;
window.updateStudentPoints = updateStudentPoints;


