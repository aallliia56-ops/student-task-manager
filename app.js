// استيراد دوال Firebase اللازمة
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc, orderBy, limit, runTransaction } from "firebase/firestore";

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

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// ** المتغيرات العامة للمنهج (تحمل البيانات من Firestore) **
let globalHifzCurriculum = [];
let globalMurajaaCurriculum = [];
let currentUserCode = null;

// ===============================================
// 1. الدوال المساعدة للواجهة والبيانات
// ===============================================

/**
 * دالة تحميل بيانات المنهج من Firestore
 * يتم فرز البيانات حسب حقل 'order'
 */
async function loadCurriculumFromFirestore() {
    try {
        const curriculumRef = collection(db, "curriculumItems");
        // جلب جميع الوثائق وفرزها حسب حقل 'order'
        const q = query(curriculumRef, orderBy("order", "asc"));
        const snapshot = await getDocs(q);

        globalHifzCurriculum = [];
        globalMurajaaCurriculum = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            // إضافة معرّف الوثيقة كحقل 'id' لاستخدامه كـ Value في الـ Select
            const item = { ...data, id: doc.id }; 
            if (data.type === 'hifz') {
                globalHifzCurriculum.push(item);
            } else if (data.type === 'murajaa') {
                globalMurajaaCurriculum.push(item);
            }
        });

        // عند التحميل، املأ قوائم الـ Select للمعلم
        fillCurriculumSelects();
    } catch (error) {
        console.error("Error loading curriculum:", error);
        alert("فشل في تحميل بيانات المنهج. يرجى مراجعة إعدادات Firestore.");
    }
}

/**
 * دالة لملء قوائم الـ Select في شاشة إضافة طالب
 */
function fillCurriculumSelects() {
    const hifzSelect = document.getElementById('new-student-hifz-start');
    const murajaaSelect = document.getElementById('new-student-murajaa-start');

    // مسح الخيارات الحالية
    hifzSelect.innerHTML = '<option value="0">نقطة البداية (غير مُعين)</option>';
    murajaaSelect.innerHTML = '<option value="0">نقطة البداية (غير مُعين)</option>';

    // ملء خيارات الحفظ
    globalHifzCurriculum.forEach((item, index) => {
        // نستخدم index + 1 كقيمة للتقدم (hifz_progress)
        const option = new Option(item.label, index + 1);
        hifzSelect.add(option);
    });

    // ملء خيارات المراجعة
    globalMurajaaCurriculum.forEach((item, index) => {
        const option = new Option(item.label, index + 1);
        murajaaSelect.add(option);
    });
}

/**
 * دالة لاستخراج اسم المستوى الحالي للطالب
 */
function getCurriculumLabel(progressIndex, type) {
    const curriculum = type === 'hifz' ? globalHifzCurriculum : globalMurajaaCurriculum;
    
    // إذا كان التقدم صفر، يعني لم يبدأ بعد أو غير معين
    if (progressIndex <= 0) return "المنهج غير مُعين";
    
    // index - 1 للحصول على العنصر الصحيح من المصفوفة (المصفوفة تبدأ بـ 0)
    if (progressIndex <= curriculum.length) {
        return curriculum[progressIndex - 1].label;
    }
    
    // في حالة تجاوز التقدم لحجم المنهج
    return "تم إكمال المنهج بالكامل 🎉";
}

/**
 * دالة لإظهار الشاشة المطلوبة وإخفاء البقية
 */
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');

    // إجراءات خاصة بتحميل لوحة المعلم
    if (screenId === 'teacher-screen') {
        loadStudentsForTeacher(); // تحميل قائمة الطلاب
        loadPendingTasksForReview(); // تحميل المهام المعلقة
        displayLeaderboardForTeacher(); // تحميل لوحة الشرف (جديد)
        
        // تفعيل تبويب لوحة التحكم افتراضياً
        document.querySelector('.tab-button[data-tab="dashboard"]').click(); 
    }
}


// ===============================================
// 2. دوال شاشة الطالب (Student Screen)
// ===============================================

/**
 * ⭐⭐⭐ الدالة المعدلة لتطبيق تصميم البطاقات الأنيقة و المهام ⭐⭐⭐
 * @param {object} studentData - بيانات الطالب الحالية
 */
async function displayStudentDashboard(studentData) {
    const welcomeElement = document.getElementById('welcome-student');
    welcomeElement.textContent = `أهلاً بك يا ${studentData.name}`;

    // 1. عرض بيانات البطاقات الإحصائية (مطابق للتصميم)
    
    const pointsElement = document.getElementById('student-total-points');
    const hifzProgressElement = document.getElementById('student-hifz-progress');
    const murajaaProgressElement = document.getElementById('student-murajaa-progress');

    // النقاط (قيمة رقمية)
    pointsElement.textContent = studentData.total_points || 0;
    
    // التقدم (اسم المستوى)
    const hifzLabel = getCurriculumLabel(studentData.hifz_progress || 0, 'hifz');
    const murajaaLabel = getCurriculumLabel(studentData.murajaa_progress || 0, 'murajaa');
    
    hifzProgressElement.textContent = hifzLabel;
    murajaaProgressElement.textContent = murajaaLabel;

    // 2. عرض المهام النشطة
    const tasksListElement = document.getElementById('student-tasks');
    tasksListElement.innerHTML = '<h2>مهامك الحالية</h2>';
    
    const activeTasks = studentData.tasks ? studentData.tasks.filter(t => t.status === 'assigned') : [];

    if (activeTasks.length === 0) {
        tasksListElement.innerHTML += '<p class="message info">لا توجد لديك مهام حالياً. بالتوفيق!</p>';
        return;
    }

    activeTasks.forEach(task => {
        // تحديد فئة اللون للشريط الجانبي
        let taskClass = 'general-task';
        if (task.type === 'hifz') taskClass = 'hifz-task';
        if (task.type === 'murajaa') taskClass = 'murajaa-task';
        
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${taskClass}`;
        taskItem.innerHTML = `
            <div class="task-details">
                <div class="task-description">${task.description}</div>
                <div class="task-points">نقاط المهمة: ${task.points} 🌟</div>
            </div>
            <div class="task-actions">
                <button 
                    class="action-btn primary-btn" 
                    onclick="sendTaskToReview('${studentData.code}', '${task.id}')">
                    أنجزت المهمة ✅
                </button>
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
        const studentRef = doc(db, "students", studentCode);

        await runTransaction(db, async (transaction) => {
            const studentDoc = await transaction.get(studentRef);
            if (!studentDoc.exists()) {
                throw "Student document does not exist!";
            }
            
            const studentData = studentDoc.data();
            const taskIndex = studentData.tasks.findIndex(t => t.id === taskId);

            if (taskIndex !== -1) {
                // تغيير الحالة إلى قيد المراجعة
                studentData.tasks[taskIndex].status = 'pending'; 
                transaction.update(studentRef, { tasks: studentData.tasks });
            } else {
                throw "Task not found!";
            }
        });

        // إعادة تحميل الواجهة لعرض التحديث
        const updatedStudentSnap = await getDoc(studentRef);
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
 * ⭐⭐ دالة جديدة: تحميل وعرض لوحة الشرف (أفضل 10) ⭐⭐
 */
async function displayLeaderboardForTeacher() {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '<li>جارٍ تحميل لوحة الشرف...</li>';

    try {
        const studentsRef = collection(db, "students");
        // جلب أفضل 10 طلاب مرتبين تنازليًا حسب النقاط
        const q = query(studentsRef, orderBy("total_points", "desc"), limit(10));
        const snapshot = await getDocs(q);

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
 * ⭐⭐ الدالة المعدلة: تحميل قائمة الطلاب مع دعم تعديل النقاط المباشر ⭐⭐
 */
async function loadStudentsForTeacher() {
    const studentList = document.getElementById('student-list');
    studentList.innerHTML = '<li>جارٍ تحميل بيانات الطلاب...</li>';

    try {
        const studentsRef = collection(db, "students");
        const q = query(studentsRef, where("role", "==", "student"));
        const snapshot = await getDocs(q);

        studentList.innerHTML = '';

        snapshot.forEach(doc => {
            const student = doc.data();
            const listItem = document.createElement('li');
            
            // عرض حالة التقدم
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
 * ⭐⭐ دالة جديدة: لتحديث نقاط الطالب بشكل مباشر من حقل الإدخال ⭐⭐
 */
async function updateStudentPoints(studentCode) {
    const inputElement = document.getElementById(`points-input-${studentCode}`);
    const newPoints = parseInt(inputElement.value);

    if (isNaN(newPoints) || newPoints < 0) {
        alert("يرجى إدخال قيمة نقاط صحيحة.");
        return;
    }

    try {
        const studentRef = doc(db, "students", studentCode);
        await updateDoc(studentRef, { total_points: newPoints });

        alert(`تم تحديث نقاط الطالب ${studentCode} بنجاح إلى ${newPoints}.`);
        // إعادة تحميل القائمة ولوحة الشرف
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
        const studentsRef = collection(db, "students");
        const studentsSnapshot = await getDocs(studentsRef);

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
 * ⭐⭐ الدالة المعدلة: مراجعة المهمة (قبول/رفض) ⭐⭐
 * - القبول: يضيف النقاط ويزيد التقدم للحفظ/المراجعة.
 * - الرفض: يعيد الحالة إلى 'assigned' (مُعينة) لإعادة إنجازها.
 */
async function reviewTask(studentCode, taskId, action) {
    try {
        const studentRef = doc(db, "students", studentCode);

        await runTransaction(db, async (transaction) => {
            const studentDoc = await transaction.get(studentRef);
            if (!studentDoc.exists()) throw "Student document does not exist!";
            
            const studentData = studentDoc.data();
            const taskIndex = studentData.tasks.findIndex(t => t.id === taskId);
            
            if (taskIndex === -1) throw "Task not found!";

            const task = studentData.tasks[taskIndex];
            
            if (action === 'accepted') {
                // 1. إضافة النقاط بالكامل
                const currentPoints = studentData.total_points || 0;
                studentData.total_points = currentPoints + task.points;
                
                // 2. تحديث التقدم إذا كانت مهمة تسلسلية
                if (task.type === 'hifz') {
                    // الانتقال إلى المستوى التالي
                    studentData.hifz_progress = (studentData.hifz_progress || 0) + 1; 
                } else if (task.type === 'murajaa') {
                    studentData.murajaa_progress = (studentData.murajaa_progress || 0) + 1; 
                }

                // 3. تحديد حالة المهمة كمكتملة (completed)
                studentData.tasks[taskIndex].status = 'completed';

            } else if (action === 'rejected') {
                // 1. إعادة المهمة إلى حالة 'assigned'
                studentData.tasks[taskIndex].status = 'assigned'; 
                // 2. إزالة أي بيانات قد تكون أضيفت (مثل تاريخ الإنجاز)
                delete studentData.tasks[taskIndex].submission_date;
            }
            
            // تحديث الوثيقة في Firestore
            transaction.update(studentRef, { 
                total_points: studentData.total_points,
                hifz_progress: studentData.hifz_progress,
                murajaa_progress: studentData.murajaa_progress,
                tasks: studentData.tasks 
            });
        });

        alert(`تم ${action === 'accepted' ? 'قبول' : 'رفض'} المهمة بنجاح.`);
        
        // إعادة تحميل المهام المعلقة ولوحة الشرف
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
        const studentRef = doc(db, "students", code);
        const studentSnap = await getDoc(studentRef);

        if (studentSnap.exists()) {
            messageElement.textContent = 'هذا الرمز موجود بالفعل. يرجى اختيار رمز آخر.';
            messageElement.className = 'message error';
            messageElement.classList.remove('hidden');
            return;
        }

        await setDoc(studentRef, {
            code: code,
            name: name,
            role: 'student',
            total_points: 0,
            hifz_progress: hifzStart,
            murajaa_progress: murajaaStart,
            tasks: [],
            created_at: new Date()
        });
        
        messageElement.textContent = `تم تسجيل الطالب ${name} بنجاح!`;
        messageElement.className = 'message success';
        messageElement.classList.remove('hidden');

        // تنظيف الحقول
        document.getElementById('new-student-code').value = '';
        document.getElementById('new-student-name').value = '';
        document.getElementById('new-student-hifz-start').value = '0';
        document.getElementById('new-student-murajaa-start').value = '0';

        // تحديث قائمة الطلاب في لوحة المعلم
        loadStudentsForTeacher();

    } catch (e) {
        console.error("Error adding document: ", e);
        messageElement.textContent = 'فشل في عملية التسجيل. حاول مرة أخرى.';
        messageElement.className = 'message error';
        messageElement.classList.remove('hidden');
    }
});

// ... (تُضاف دوال تعيين المهام Assign Task - الفردي والجماعي هنا بناءً على الكود الأصلي لديك) ...

// ===============================================
// 5. التحكم في الشاشات والتسجيل
// ===============================================

// دوال التسجيل والخروج (كما كانت في الكود الأصلي)
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
            const studentRef = doc(db, "students", userCode);
            const studentSnap = await getDoc(studentRef);

            if (studentSnap.exists() && studentSnap.data().role === 'student') {
                displayStudentDashboard(studentSnap.data());
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
        // إزالة حالة النشاط من الكل
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));

        // إضافة حالة النشاط للزر والمحتوى المحدد
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(`${tabId}-tab`).classList.remove('hidden');
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
