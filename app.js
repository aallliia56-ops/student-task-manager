// ************************************
// 1. إعدادات وتهيئة FIREBASE
// ************************************

// تأكد أن هذه المفاتيح هي مفاتيح مشروعك الذي أنشأته
const firebaseConfig = {
    apiKey: "AIzaSyCeIcmuTd72sjiu1Uyijn_J4bMS0ChtXGo",
    authDomain: "studenttasksmanager.firebaseapp.com",
    projectId: "studenttasksmanager",
    storageBucket: "studenttasksmanager.firebasestorage.app",
    messagingSenderId: "850350680089",
    appId: "1:850350680089:web:51b71a710e938754bc6288",
    measurementId: "G-7QC4FVXKZG"
};

// تهيئة تطبيق Firebase وقاعدة البيانات
const app = firebase.initializeApp(firebaseConfig);
const db = app.firestore();

// ************************************
// 2. منطق واجهة المستخدم الأساسي
// ************************************

const loginSection = document.getElementById('login-section');
const tasksSection = document.getElementById('tasks-section');
const studentIdInput = document.getElementById('studentId');
const studentNameDisplay = document.getElementById('studentNameDisplay');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const tasksList = document.getElementById('tasks-list');

let currentStudentId = localStorage.getItem('currentStudentId');

// دالة لمعالجة تسجيل الدخول
const handleLogin = () => {
    const studentId = studentIdInput.value.trim().toUpperCase(); // تحويل للتوحيد

    if (studentId) {
        currentStudentId = studentId;
        localStorage.setItem('currentStudentId', studentId);
        
        studentNameDisplay.textContent = studentId;

        loginSection.classList.add('hidden');
        tasksSection.classList.remove('hidden');

        // الآن، استدعي دالة تحميل المهام
        loadTasks(studentId); 

    } else {
        alert("الرجاء إدخال رمز الدخول.");
    }
};

// دالة لتسجيل الخروج
const handleLogout = () => {
    currentStudentId = null;
    localStorage.removeItem('currentStudentId');
    studentIdInput.value = '';

    tasksSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    tasksList.innerHTML = '<p>جارٍ تحميل المهام...</p>';
};

// ************************************
// 3. الدوال الرئيسية لـ FIREBASE
// ************************************

let currentStudentTasks = []; // مصفوفة لحفظ المهام الحالية محلياً

// دالة تحميل المهام
const loadTasks = async (studentId) => {
    tasksList.innerHTML = '<p>جاري الاتصال بقاعدة البيانات وتحميل المهام...</p>';
    
    try {
        const docRef = db.collection('tasks').doc(studentId);
        const doc = await docRef.get(); // طلب البيانات مرة واحدة

        if (doc.exists) {
            const data = doc.data();
            currentStudentTasks = data.tasks || []; // حفظ المهام في المتغير المحلي
            renderTasks(currentStudentTasks);
        } else {
            tasksList.innerHTML = `<p style="color: red;">لم يتم العثور على مهام لرمز الدخول: ${studentId}</p>`;
        }
    } catch (error) {
        // إذا ظهر خطأ هنا، فعادةً يكون بسبب قواعد الأمان أو خطأ في الربط
        console.error("خطأ في جلب المهام:", error);
        tasksList.innerHTML = `<p style="color: red;">حدث خطأ في الاتصال. تأكد من قواعد Firebase (allow read, write: if true).</p>`;
    }
};

// دالة تحديث حالة الإنجاز (Toggle Complete)
window.toggleComplete = async (taskIndex) => {
    // 1. تحديث الحالة محلياً
    const taskToUpdate = currentStudentTasks[taskIndex];
    taskToUpdate.completed = !taskToUpdate.completed; // عكس الحالة (صحيح -> خطأ / خطأ -> صحيح)

    // 2. تحديث قائمة المهام على الواجهة فوراً
    renderTasks(currentStudentTasks);

    // 3. إرسال المصفوفة المُحدّثة بالكامل إلى Firebase
    try {
        const docRef = db.collection('tasks').doc(currentStudentId);
        
        // نُرسل المصفوفة المُعدَّلة كاملةً لتحديث حقل 'tasks'
        await docRef.update({
            tasks: currentStudentTasks 
        });
        
        console.log("تم تحديث المهمة بنجاح في Firebase!");

    } catch (error) {
        alert("فشل في تحديث المهمة على الإنترنت. تحقق من الاتصال.");
        console.error("خطأ في تحديث المهمة:", error);
        // إعادة المهمة لحالتها الأصلية في حال فشل التحديث
        taskToUpdate.completed = !taskToUpdate.completed;
        renderTasks(currentStudentTasks);
    }
};

// ************************************
// 4. دالة عرض المهام على الواجهة
// ************************************

const renderTasks = (tasks) => {
    if (tasks.length === 0) {
        tasksList.innerHTML = '<p>لا توجد مهام حالية مسندة إليك.</p>';
        return;
    }

    const tasksHTML = tasks.map((task, index) => {
        const statusText = task.completed ? 'أُنجزت ✔️' : 'في الانتظار ⏳';
        const buttonText = task.completed ? 'إلغاء الإنجاز' : 'تم الإنجاز';
        const itemClass = task.completed ? 'completed-task' : '';

        return `
            <div class="task-item ${itemClass}">
                <span class="task-description" style="text-decoration: ${task.completed ? 'line-through' : 'none'};">
                    ${task.description}
                </span>
                <div>
                    <span class="task-status">${statusText}</span>
                    <button 
                        data-index="${index}" 
                        onclick="toggleComplete(${index})">
                        ${buttonText}
                    </button>
                </div>
            </div>
        `;
    }).join(''); 

    tasksList.innerHTML = tasksHTML;
};

// ************************************
// 5. ربط الدوال بأزرار الواجهة والتحقق عند التحميل
// ************************************
loginBtn.addEventListener('click', handleLogin);
logoutBtn.addEventListener('click', handleLogout);

if (currentStudentId) {
    studentIdInput.value = currentStudentId;
    handleLogin(); 
}