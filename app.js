// =================================================================
// 1. إعدادات وتهيئة Firebase
// =================================================================

// **⚠️ عُدّل هذه الإعدادات ببيانات مشروعك الخاصة من وحدة تحكم Firebase ⚠️**
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", 
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// المتغيرات العالمية والثوابت
let currentStudentId = null;
const TEACHER_ID = 'teacher'; // رمز الدخول الخاص بالمعلم
let unsubscribeTasks, unsubscribeReview, unsubscribeLeaderboard; // لـ Live Listeners

// =================================================================
// 2. دوال مساعدة عامة وتحويل الشاشات
// (دالة showScreen موجودة في index.html)
// =================================================================

/**
 * دالة لتسجيل الخروج
 */
function logout() {
    currentStudentId = null;
    showScreen('login-screen');
    document.getElementById('student-id').value = '';
    
    // إيقاف الاستماعات الفورية لـ Firestore عند تسجيل الخروج
    if (typeof unsubscribeTasks === 'function') unsubscribeTasks();
    if (typeof unsubscribeReview === 'function') unsubscribeReview();
    if (typeof unsubscribeLeaderboard === 'function') unsubscribeLeaderboard();
}

/**
 * دالة لتهيئة شاشة المعلم (تفعيل الاستماعات الفورية)
 */
function initializeTeacherDashboard() {
    // 1. المهام التي تنتظر المراجعة
    unsubscribeReview = db.collectionGroup('tasks')
        .where('status', '==', 'claimed')
        .onSnapshot(snapshot => {
            renderReviewTasks(snapshot.docs);
        });
        
    // 2. لوحة الشرف
    unsubscribeLeaderboard = db.collection('students')
        .orderBy('score', 'desc')
        .limit(5)
        .onSnapshot(snapshot => {
            renderLeaderboard(snapshot.docs);
            populateStudentSelects(snapshot.docs); // لملء قوائم الطلاب في لوحة التحكم
        });

    // 3. بنك المهام الجاهزة
    db.collection('bankTasks').onSnapshot(snapshot => {
        renderBankTasks(snapshot.docs);
        populateBulkTaskSelect(snapshot.docs);
    });
    
    // 4. حالة المنهج
    db.collection('curriculum').orderBy('sequence').onSnapshot(snapshot => {
        renderCurriculumStatus(snapshot.docs);
    });
}

/**
 * دالة لتهيئة شاشة الطالب (تفعيل الاستماعات الفورية)
 */
function initializeStudentScreen(studentId) {
    // الاستماع الفوري لبيانات الطالب (الاسم، النقاط، التقدم)
    db.collection('students').doc(studentId).onSnapshot(doc => {
        if (doc.exists) {
            renderStudentInfo(doc.data());
        } else {
            alert('خطأ: لا يمكن العثور على بيانات الطالب.');
            logout();
        }
    });

    // الاستماع الفوري لمهام الطالب النشطة (Active و Claimed)
    unsubscribeTasks = db.collection('students').doc(studentId).collection('tasks')
        .where('status', 'in', ['active', 'claimed'])
        .orderBy('available_at', 'asc')
        .onSnapshot(snapshot => {
            renderStudentTasks(snapshot.docs);
        });
        
    // تحديث ترتيب الطالب بشكل دوري (يتم تنفيذه لمرة واحدة عند الدخول)
    updateStudentRank(studentId);
}

// =================================================================
// 3. منطق تسجيل الدخول
// =================================================================

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentIdInput = document.getElementById('student-id').value.trim();

    if (studentIdInput === TEACHER_ID) {
        showScreen('teacher-screen');
        initializeTeacherDashboard();
    } else {
        const studentDoc = await db.collection('students').doc(studentIdInput).get();
        if (studentDoc.exists) {
            currentStudentId = studentIdInput;
            initializeStudentScreen(currentStudentId);
            showScreen('tasks-screen');
        } else {
            alert('رمز الدخول غير صحيح أو غير موجود.');
        }
    }
});

// =================================================================
// 4. دوال عرض شاشة الطالب (Student Rendering)
// =================================================================

function renderStudentInfo(studentData) {
    document.getElementById('student-info-name').textContent = `مرحباً بك، ${studentData.name}`;
    document.getElementById('student-info-score').textContent = `رصيد النقاط: ${studentData.score || 0} 🥇`;
    renderProgressBars(studentData);
}

async function renderProgressBars(studentData) {
    const curriculumSnap = await db.collection('curriculum').get();
    const totalHifz = curriculumSnap.docs.filter(doc => doc.data().type === 'Hifz').length;
    const totalMurajaa = curriculumSnap.docs.filter(doc => doc.data().type === 'Murajaa').length;
    
    const hifzProgress = studentData.hifz_progress || 0;
    const murajaaProgress = studentData.murajaa_progress || 0;
    
    // منع القسمة على صفر
    const hifzPercent = totalHifz > 0 ? (hifzProgress / totalHifz) * 100 : 0;
    const murajaaPercent = totalMurajaa > 0 ? (murajaaProgress / totalMurajaa) * 100 : 0;

    const progressHtml = `
        <div class="progress-section">
            <p class="progress-title">تقدم الحفظ: ${hifzProgress} من ${totalHifz} مهمة</p>
            <div class="progress mb-3" role="progressbar" aria-valuenow="${hifzPercent}" aria-valuemin="0" aria-valuemax="100" style="height: 20px;">
                <div class="progress-bar bg-success" style="width: ${hifzPercent}%; direction: ltr;">${Math.round(hifzPercent)}%</div>
            </div>
            <p class="progress-title">تقدم المراجعة: ${murajaaProgress} من ${totalMurajaa} مهمة</p>
            <div class="progress" role="progressbar" aria-valuenow="${murajaaPercent}" aria-valuemin="0" aria-valuemax="100" style="height: 20px;">
                <div class="progress-bar bg-info" style="width: ${murajaaPercent}%; direction: ltr;">${Math.round(murajaaPercent)}%</div>
            </div>
        </div>
    `;
    document.getElementById('progress-container').innerHTML = progressHtml;
}

function renderStudentTasks(taskDocs) {
    const tasksContainer = document.getElementById('tasks-container');
    tasksContainer.innerHTML = '';
    let hasActiveTasks = false;
    
    const now = new Date();

    taskDocs.forEach(doc => {
        const task = doc.data();
        const taskId = doc.id;
        // التأكد من أن available_at هو Timestamp قبل تحويله
        const availableAt = task.available_at && typeof task.available_at.toDate === 'function' ? task.available_at.toDate() : now;
        
        // إظهار المهام التي أصبحت متاحة فقط
        if (availableAt <= now && task.status !== 'completed' && task.status !== 'rejected') { 
            hasActiveTasks = true;
            
            let cardClass = '';
            let buttonHtml = '';
            let statusText = '';
            
            if (task.type === 'Hifz') cardClass = 'hifz-card';
            else if (task.type === 'Murajaa') cardClass = 'murajaa-card';
            else cardClass = 'manual-card';

            if (task.status === 'active') {
                buttonHtml = `<button class="btn btn-primary btn-sm w-100" onclick="claimTask('${currentStudentId}', '${taskId}')"><i class="fas fa-check"></i> إنجاز المهمة</button>`;
            } else if (task.status === 'claimed') {
                cardClass = 'claimed-card';
                buttonHtml = `<button class="btn btn-secondary btn-sm w-100" disabled><i class="fas fa-hourglass-half"></i> بانتظار مراجعة المعلم</button>`;
                // عرض وقت التقديم إذا كان موجوداً
                const claimedTime = task.claimed_at && typeof task.claimed_at.toDate === 'function' ? task.claimed_at.toDate().toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}) : '';
                statusText = `<p class="text-secondary small mb-0">تم تقديمها في: ${claimedTime}</p>`;
            }
            
            const taskHtml = `
                <div class="task-card ${cardClass}">
                    <div class="card-header-custom">
                        <span class="task-title">${task.description}</span>
                        <span class="task-points">${task.points}</span>
                    </div>
                    <p class="text-muted small mb-2">النوع: ${task.type === 'Hifz' ? 'حفظ' : task.type === 'Murajaa' ? 'مراجعة' : 'إضافي/يدوي'}</p>
                    ${statusText}
                    <div class="mt-3">
                        ${buttonHtml}
                    </div>
                </div>
            `;
            tasksContainer.innerHTML += taskHtml;
        }
    });

    // إدارة رسالة عدم وجود مهام
    const noTasksMessage = document.getElementById('no-tasks-message');
    if (hasActiveTasks) {
        noTasksMessage.classList.add('d-none');
    } else {
        noTasksMessage.classList.remove('d-none');
    }
}

/**
 * تحديث ترتيب الطالب (يتم استدعاؤه عند تحديث بيانات الطالب)
 */
async function updateStudentRank(studentId) {
    // يجب أن تكون هذه العملية سريعة لأنها تستدعى عند دخول الطالب
    const leaderboardSnap = await db.collection('students').orderBy('score', 'desc').get();
    let rank = 1;
    let rankFound = false;
    
    for (const doc of leaderboardSnap.docs) {
        if (doc.id === studentId) {
            rankFound = true;
            document.getElementById('student-rank-info').innerHTML = `<i class="fas fa-trophy text-warning"></i> ترتيبك: ${rank}`;
            break;
        }
        rank++;
    }
}

/**
 * منطق الطالب: يغير حالة المهمة إلى 'claimed' (بانتظار المراجعة)
 */
async function claimTask(studentId, taskId) {
    try {
        await db.collection('students').doc(studentId).collection('tasks').doc(taskId).update({
            status: 'claimed',
            claimed_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert('✅ تم إرسال المهمة للمراجعة بنجاح! سيتم إضافة النقاط بعد قبول المعلم.');
    } catch (error) {
        console.error("خطأ في إنجاز المهمة: ", error);
        alert('❌ حدث خطأ أثناء إرسال المهمة للمراجعة.');
    }
}

// =================================================================
// 5. منطق المعلم (Teacher Logic)
// =================================================================

/**
 * دالة مراجعة مهمة (قبول أو رفض)
 */
async function reviewTask(studentId, taskId, action, points, type) {
    const taskRef = db.collection('students').doc(studentId).collection('tasks').doc(taskId);
    const studentRef = db.collection('students').doc(studentId);

    if (action === 'approve') {
        try {
            await db.runTransaction(async (transaction) => {
                // 1. تحديث بيانات الطالب والتقدم والنقاط في معاملة واحدة
                const studentDoc = await transaction.get(studentRef);
                if (!studentDoc.exists) {
                    throw "Student does not exist!";
                }
                
                const studentData = studentDoc.data();
                const newScore = (studentData.score || 0) + points;
                let hifzProgress = studentData.hifz_progress || 0;
                let murajaaProgress = studentData.murajaa_progress || 0;

                if (type === 'Hifz') {
                    hifzProgress += 1;
                } else if (type === 'Murajaa') {
                    murajaaProgress += 1;
                }
                
                transaction.update(studentRef, { 
                    score: newScore,
                    hifz_progress: hifzProgress,
                    murajaa_progress: murajaaProgress
                });
                
                // 2. تحديث حالة المهمة
                transaction.update(taskRef, {
                    status: 'completed',
                    reviewed_at: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // 3. تعيين المهمة التالية (خارج نطاق المعاملة لتحسين الأداء)
                if (type === 'Hifz' || type === 'Murajaa') {
                    // نستخدم القيمة المحدثة للتقدم لطلب المهمة التالية
                    await assignNextCurriculumTask(studentRef, type, type === 'Hifz' ? hifzProgress : murajaaProgress);
                }
            });
            alert(`✅ تم قبول المهمة وإضافة ${points} نقاط للطالب ${studentId}.`);
        } catch (error) {
             console.error("خطأ في قبول المهمة (Transaction): ", error);
             alert('❌ حدث خطأ أثناء قبول المهمة.');
        }

    } else if (action === 'reject') {
        // إعادة المهمة إلى حالة نشطة
        await taskRef.update({
            status: 'active',
            claimed_at: firebase.firestore.FieldValue.delete() // حذف وقت التقديم
        });
        alert(`❌ تم رفض المهمة وإعادتها للطالب ${studentId} لتعديلها.`);
    }
}

/**
 * تعيين المهمة التسلسلية التالية للطالب بعد إكمال مهمة من المنهج
 */
async function assignNextCurriculumTask(studentRef, type, nextSequence) {
    // جلب المهمة التالية من المنهج
    const curriculumSnap = await db.collection('curriculum')
        .where('type', '==', type)
        .where('sequence', '==', nextSequence)
        .limit(1)
        .get();

    if (!curriculumSnap.empty) {
        const taskData = curriculumSnap.docs[0].data();
        
        const studentDoc = await studentRef.get();
        const studentName = studentDoc.data().name;

        // إضافة المهمة الجديدة إلى مجموعة مهام الطالب
        await studentRef.collection('tasks').add({
            description: taskData.description,
            points: taskData.points,
            type: taskData.type,
            status: 'active',
            available_at: new Date(Date.now()), // متاحة فوراً
            is_curriculum: true,
            studentName: studentName 
        });
        console.log(`تم تعيين مهمة ${taskData.type} تسلسل ${nextSequence} للطالب.`);
    }
}

// =================================================================
// 6. دوال عرض لوحة المعلم (Teacher Dashboard Rendering)
// =================================================================

function renderReviewTasks(taskDocs) {
    const container = document.getElementById('review-tasks-container');
    container.innerHTML = '';
    document.getElementById('review-count').textContent = taskDocs.length;
    
    if (taskDocs.length === 0) {
        document.getElementById('no-review-tasks').classList.remove('d-none');
        return;
    }
    document.getElementById('no-review-tasks').classList.add('d-none');

    taskDocs.forEach(doc => {
        const task = doc.data();
        const taskId = doc.id;
        const studentId = doc.ref.parent.parent.id;
        const claimedDate = task.claimed_at && typeof task.claimed_at.toDate === 'function' ? task.claimed_at.toDate().toLocaleDateString('ar-EG') : 'غير محدد';
        
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center flex-wrap';
        listItem.innerHTML = `
            <div>
                <strong>${task.studentName} (${studentId})</strong> - ${task.description} 
                <span class="badge bg-primary me-2">${task.points} نقاط</span>
                <span class="badge bg-secondary">${task.type === 'Hifz' ? 'حفظ' : task.type === 'Murajaa' ? 'مراجعة' : 'يدوي'}</span>
                <small class="text-muted d-block mt-1">وقت التقديم: ${claimedDate}</small>
            </div>
            <div class="mt-2 mt-sm-0">
                <button class="btn btn-sm btn-success me-2" onclick="reviewTask('${studentId}', '${taskId}', 'approve', ${task.points}, '${task.type}')"><i class="fas fa-check"></i> قبول</button>
                <button class="btn btn-sm btn-danger" onclick="reviewTask('${studentId}', '${taskId}', 'reject')"><i class="fas fa-times"></i> رفض</button>
            </div>
        `;
        container.appendChild(listItem);
    });
}

function renderLeaderboard(studentDocs) {
    const container = document.getElementById('leaderboard-container');
    container.innerHTML = '';
    let rank = 1;

    studentDocs.forEach(doc => {
        const student = doc.data();
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.innerHTML = `
            <div>
                <span class="badge bg-warning me-2">${rank++}</span>
                ${student.name} (${doc.id})
            </div>
            <span class="badge bg-primary rounded-pill">${student.score || 0} نقطة</span>
        `;
        container.appendChild(listItem);
    });
}

function renderBankTasks(bankDocs) {
    const container = document.getElementById('bank-tasks-list');
    container.innerHTML = '';

    bankDocs.forEach(doc => {
        const task = doc.data();
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.innerHTML = `
            <div>${task.description} <span class="badge bg-warning text-dark">1 نقطة</span></div>
            <button class="btn btn-sm btn-danger" onclick="deleteBankTask('${doc.id}')"><i class="fas fa-trash"></i></button>
        `;
        container.appendChild(listItem);
    });
}

function populateStudentSelects(studentDocs) {
    const bulkSelect = document.getElementById('bulk-student-select');
    // حفظ القائمة الحالية لاحقاً لتجنب فقدانها عند إعادة الرندر
    const selectedOptions = Array.from(bulkSelect.selectedOptions).map(option => option.value);
    bulkSelect.innerHTML = '';
    
    studentDocs.forEach(doc => {
        const student = doc.data();
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = `${student.name} (${doc.id})`;
        // إعادة تحديد الخيارات التي كانت محددة
        if (selectedOptions.includes(doc.id)) {
             option.selected = true;
        }
        bulkSelect.appendChild(option);
    });
}

function populateBulkTaskSelect(bankDocs) {
    const select = document.getElementById('bulk-task-select');
    select.innerHTML = '<option value="">اختر المهمة...</option>';
    bankDocs.forEach(doc => {
        const task = doc.data();
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = task.description;
        option.dataset.description = task.description;
        select.appendChild(option);
    });
}

function renderCurriculumStatus(curriculumDocs) {
    const totalHifz = curriculumDocs.filter(doc => doc.data().type === 'Hifz').length;
    const totalMurajaa = curriculumDocs.filter(doc => doc.data().type === 'Murajaa').length;
    
    document.getElementById('curriculum-status').innerHTML = `
        حالة المنهج:
        <span class="badge bg-success">حفظ: ${totalHifz} مهمة</span>
        <span class="badge bg-info">مراجعة: ${totalMurajaa} مهمة</span>
    `;

    // عرض قائمة المهام في المنهج
    const listContainer = document.getElementById('curriculum-list');
    listContainer.innerHTML = '<h6>المنهج الحالي:</h6>';
    curriculumDocs.forEach(doc => {
        const item = doc.data();
        const color = item.type === 'Hifz' ? 'success' : 'info';
        listContainer.innerHTML += `
            <div class="d-flex justify-content-between border-bottom p-1">
                <span class="badge bg-${color} me-2">${item.type === 'Hifz' ? 'حفظ' : 'مراجعة'} #${item.sequence}</span>
                <span>${item.description}</span>
                <button class="btn btn-sm btn-link text-danger p-0" onclick="deleteCurriculumTask('${doc.id}')"><i class="fas fa-trash"></i></button>
            </div>
        `;
    });
}


// =================================================================
// 7. منطق إدارة المهام (Forms and CRUD)
// =================================================================

// إضافة مهمة فردية (يدوية)
document.getElementById('add-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('new-task-student-id').value.trim();
    const description = document.getElementById('new-task-description').value.trim();
    const date = document.getElementById('new-task-date').value;
    const time = document.getElementById('new-task-time').value;
    const points = parseInt(document.getElementById('new-task-points').value);

    const studentDoc = await db.collection('students').doc(studentId).get();
    if (!studentDoc.exists) {
        alert('❌ رمز الطالب غير موجود.');
        return;
    }
    const studentName = studentDoc.data().name;
    
    const availableAt = new Date(`${date}T${time}:00`);
    
    try {
        await db.collection('students').doc(studentId).collection('tasks').add({
            description: description,
            points: points,
            type: 'Manual',
            status: 'active',
            available_at: availableAt,
            studentName: studentName 
        });
        alert('✅ تمت إضافة المهمة الفردية بنجاح.');
        e.target.reset();
    } catch (error) {
        console.error("خطأ في إضافة المهمة الفردية: ", error);
        alert('❌ حدث خطأ أثناء إضافة المهمة.');
    }
});

// إضافة مهمة جماعية (من بنك المهام)
document.getElementById('add-bulk-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskSelect = document.getElementById('bulk-task-select');
    const taskId = taskSelect.value;
    const selectedOption = taskSelect.options[taskSelect.selectedIndex];
    const description = selectedOption.dataset.description || selectedOption.textContent;
    const studentIds = Array.from(document.getElementById('bulk-student-select').selectedOptions).map(option => option.value);
    const date = document.getElementById('bulk-task-date').value;
    const time = document.getElementById('bulk-task-time').value;

    if (studentIds.length === 0) {
        alert('❌ الرجاء اختيار طالب واحد على الأقل.');
        return;
    }
    if (!taskId) {
        alert('❌ الرجاء اختيار مهمة من البنك.');
        return;
    }

    const availableAt = new Date(`${date}T${time}:00`);
    const points = 1; 

    try {
        const batch = db.batch();
        
        for (const studentId of studentIds) {
            const studentDoc = await db.collection('students').doc(studentId).get();
            const studentName = studentDoc.data().name;

            const taskRef = db.collection('students').doc(studentId).collection('tasks').doc();
            batch.set(taskRef, {
                description: description,
                points: points,
                type: 'Bank',
                status: 'active',
                available_at: availableAt,
                studentName: studentName
            });
        }
        
        await batch.commit();
        alert(`✅ تمت إضافة المهمة الجماعية (${description}) لـ ${studentIds.length} طلاب بنجاح.`);
        e.target.reset();
    } catch (error) {
        console.error("خطأ في إضافة المهمة الجماعية: ", error);
        alert('❌ حدث خطأ أثناء إضافة المهام الجماعية.');
    }
});


// إضافة مهمة لبنك المهام الجاهزة
document.getElementById('add-bank-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('bank-task-description').value.trim();
    
    try {
        await db.collection('bankTasks').add({
            description: description,
            points: 1,
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert('✅ تمّت إضافة المهمة بنجاح إلى البنك.');
        e.target.reset();
    } catch (error) {
        console.error("خطأ في إضافة مهمة البنك: ", error);
        alert('❌ حدث خطأ أثناء إضافة المهمة للبنك.');
    }
});

// حذف مهمة من بنك المهام
async function deleteBankTask(taskId) {
    if (confirm('هل أنت متأكد من حذف هذه المهمة من البنك؟ لن يؤثر هذا على المهام التي تم تعيينها مسبقاً للطلاب.')) {
        try {
            await db.collection('bankTasks').doc(taskId).delete();
            alert('✅ تم حذف المهمة من البنك بنجاح.');
        } catch (error) {
            console.error("خطأ في حذف مهمة البنك: ", error);
            alert('❌ حدث خطأ أثناء حذف المهمة.');
        }
    }
}

// إضافة طالب جديد وتعيين نقطة الانطلاق
document.getElementById('add-new-student-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('new-student-id').value.trim();
    const name = document.getElementById('new-student-name').value.trim();
    const hifzProgress = parseInt(document.getElementById('initial-hifz-progress').value);
    const murajaaProgress = parseInt(document.getElementById('initial-murajaa-progress').value);

    const docRef = db.collection('students').doc(studentId);
    const doc = await docRef.get();
    if (doc.exists || studentId === TEACHER_ID) {
        alert('❌ رمز الطالب مستخدم بالفعل أو محجوز للمعلم.');
        return;
    }
    
    try {
        await db.runTransaction(async (transaction) => {
             // 1. إنشاء حساب الطالب
            transaction.set(docRef, {
                name: name,
                score: 0,
                hifz_progress: hifzProgress,
                murajaa_progress: murajaaProgress,
                created_at: firebase.firestore.FieldValue.serverTimestamp()
            });

            // 2. تعيين أول مهمة (إذا كانت نقطة الانطلاق 0، سيتم تعيين مهمة التسلسل 0)
            await assignNextCurriculumTask(docRef, 'Hifz', hifzProgress);
            await assignNextCurriculumTask(docRef, 'Murajaa', murajaaProgress);
        });

        alert(`✅ تم إنشاء حساب الطالب (${name}) بنجاح.`);
        e.target.reset();
        
    } catch (error) {
        console.error("خطأ في إضافة الطالب: ", error);
        alert('❌ حدث خطأ أثناء إضافة الطالب.');
    }
});

// إضافة مهمة للمنهج المركزي (تسلسلي)
document.getElementById('add-curriculum-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('curriculum-description').value.trim();
    const type = document.getElementById('curriculum-type-select').value;
    
    const points = type === 'Hifz' ? 5 : 3;
    const curriculumCollection = db.collection('curriculum');
    
    try {
        // تحديد التسلسل (الرقم) التالي بناءً على آخر مهمة من نفس النوع
        const lastTaskSnap = await curriculumCollection.where('type', '==', type).orderBy('sequence', 'desc').limit(1).get();
        const nextSequence = lastTaskSnap.empty ? 0 : lastTaskSnap.docs[0].data().sequence + 1;

        await curriculumCollection.add({
            description: description,
            type: type,
            points: points,
            sequence: nextSequence,
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert(`✅ تم إضافة مهمة ${type} التسلسل ${nextSequence} بنجاح للمنهج.`);
        e.target.reset();
    } catch (error) {
        console.error("خطأ في إضافة مهمة المنهج: ", error);
        alert('❌ حدث خطأ أثناء إضافة مهمة المنهج.');
    }
});

// دالة حذف مهمة من المنهج
async function deleteCurriculumTask(taskId) {
    if (confirm('⚠️ تحذير: حذف مهمة من المنهج قد يسبب مشاكل في تتبع تقدم الطلاب (قد تتغير أرقام التسلسل لديهم). هل أنت متأكد تماماً؟')) {
        try {
            await db.collection('curriculum').doc(taskId).delete();
            alert('✅ تم حذف مهمة المنهج بنجاح.');
        } catch (error) {
            console.error("خطأ في حذف مهمة المنهج: ", error);
            alert('❌ حدث خطأ أثناء حذف مهمة المنهج.');
        }
    }
}

// =================================================================
// 8. تشغيل التطبيق عند التحميل
// =================================================================

// عند تحميل الصفحة، عرض شاشة تسجيل الدخول افتراضياً
document.addEventListener('DOMContentLoaded', () => {
    // هذه الدالة موجودة في index.html
    showScreen('login-screen'); 
});
