// app.js
// =======================
// تهيئة Firebase + المنهج + منطق الأدوار
// =======================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  writeBatch,
  query,
  where
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

import { HIFZ_CURRICULUM, REVIEW_CURRICULUM, LEVEL_CONFIG } from "./curriculum.js";

// إعدادات المشروع (نفس الإعدادات السابقة)
const firebaseConfig = {
  apiKey: "AIzaSyCeIcmuTd72sjiu1Uyijn_J4bMS0ChtXGo",
  authDomain: "studenttasksmanager.firebaseapp.com",
  projectId: "studenttasksmanager",
  storageBucket: "studenttasksmanager.firebasestorage.app",
  messagingSenderId: "850350680089",
  appId: "1:850350680089:web:51b71a710e938754bc6288",
  measurementId: "G-7QC4FVXKZG",
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// مراجع DOM
// شاشة الدخول
const authScreen = document.getElementById("auth-screen");
const userCodeInput = document.getElementById("user-code");
const loginButton = document.getElementById("login-button");
const authMessage = document.getElementById("auth-message");

// شاشة الطالب
const studentScreen = document.getElementById("student-screen");
const welcomeStudent = document.getElementById("welcome-student");
const studentHifzProgressLabel = document.getElementById("student-hifz-progress-label");
const studentMurajaaProgressLabel = document.getElementById("student-murajaa-progress-label");
const studentHifzProgressBar = document.getElementById("student-hifz-progress-bar");
const studentMurajaaProgressBar = document.getElementById("student-murajaa-progress-bar");
const studentHifzProgressPercent = document.getElementById("student-hifz-progress-percent");
const studentMurajaaProgressPercent = document.getElementById("student-murajaa-progress-percent");
const studentMurajaaLevelLabel = document.getElementById("student-murajaa-level-label");
const studentTotalPoints = document.getElementById("student-total-points");
const studentTasksDiv = document.getElementById("student-tasks");
const logoutButtonStudent = document.getElementById("logout-button-student");
// عناصر جديدة لواجهة الطالب
const studentRankValue = document.getElementById("student-rank-value");
const studentHifzStageBadge = document.getElementById("student-hifz-stage-badge");

const refreshButtonStudent = document.getElementById("refresh-button-student");
const refreshButtonTeacher = document.getElementById("refresh-button-teacher");

// شاشة المعلم
const teacherScreen = document.getElementById("teacher-screen");
const logoutButtonTeacher = document.getElementById("logout-button-teacher");
const tabButtons = document.querySelectorAll(".tab-button");
const reviewTasksTab = document.getElementById("review-tasks-tab");
const assignTasksTab = document.getElementById("assign-tasks-tab");
const manageStudentsTab = document.getElementById("manage-students-tab");
const curriculumTab = document.getElementById("curriculum-tab");

// حقول تعيين المهام
const assignTaskStudentCode = document.getElementById("assign-task-student-code");
const assignTaskType = document.getElementById("assign-task-type");
const assignTaskDescription = document.getElementById("assign-task-description");
const assignTaskPoints = document.getElementById("assign-task-points");
const assignIndividualTaskButton = document.getElementById("assign-individual-task-button");
const assignGroupTaskButton = document.getElementById("assign-group-task-button");
const assignTaskMessage = document.getElementById("assign-task-message");

// إدارة الطلاب
const studentList = document.getElementById("student-list");
const studentFormTitle = document.getElementById("student-form-title");
const newStudentCodeInput = document.getElementById("new-student-code");
const newStudentNameInput = document.getElementById("new-student-name");
const newStudentParentCodeInput = document.getElementById("new-student-parent-code");
const newStudentHifzStart = document.getElementById("new-student-hifz-start");
const newStudentHifzLevel = document.getElementById("new-student-hifz-level");
const newStudentMurajaaLevel = document.getElementById("new-student-murajaa-level");
const registerStudentButton = document.getElementById("register-student-button");
const registerStudentMessage = document.getElementById("register-student-message");

// عرض المنهج
const hifzCurriculumDisplay = document.getElementById("hifz-curriculum-display");
const murajaaCurriculumDisplay = document.getElementById("murajaa-curriculum-display");

// مراجعة المهام (المعلم)
const pendingTasksList = document.getElementById("pending-tasks-list");

// شاشة ولي الأمر
const parentScreen = document.getElementById("parent-screen");
const welcomeParent = document.getElementById("welcome-parent");
const logoutButtonParent = document.getElementById("logout-button-parent");
const parentChildrenList = document.getElementById("parent-children-list");

// حالة المستخدم الحالي
let currentUser = null;
let editingStudentCode = null;

// =======================
// دوال مساعدة عامة
// =======================

function showMessage(element, msg, type = "info") {
  if (!element) return;
  element.textContent = msg;
  element.classList.remove("hidden", "error", "success", "info");
  element.classList.add(type);
  setTimeout(() => {
    element.classList.add("hidden");
  }, 5000);
}

function hideAllScreens() {
  authScreen.classList.add("hidden");
  studentScreen.classList.add("hidden");
  teacherScreen.classList.add("hidden");
  parentScreen.classList.add("hidden");
}

// توليد ID بسيط
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// =======================
// منطق المنهج: حفظ + مراجعة
// =======================

// إرجاع قائمة المراجعة حسب المستوى
function getReviewArrayForLevel(level) {
  return REVIEW_CURRICULUM[level] || [];
}

// مهمة الحفظ الحالية حسب مستوى الطالب (1 / 2 / 3 مقاطع)
function getCurrentHifzMission(student) {
  const all = HIFZ_CURRICULUM;
  if (!all || all.length === 0) return null;

  const startIndex = student.hifz_progress ?? student.hifz_start_id ?? 0;
  if (startIndex >= all.length) return null;

  const level = parseInt(student.hifz_level || 1, 10);
  const maxSegments = Math.max(1, Math.min(3, level));

  const segments = [];
  const firstSeg = all[startIndex];
  segments.push(firstSeg);

  let i = startIndex + 1;
  while (segments.length < maxSegments && i < all.length) {
    const seg = all[i];
    if (seg.surah_number !== firstSeg.surah_number) break; // لا نتجاوز السورة
    segments.push(seg);
    i++;
  }

  const description = segments
    .map(
      (seg) =>
        `${seg.surah_name_ar} (${seg.start_ayah}-${seg.end_ayah})`
    )
    .join(" + ");

  const points = segments.reduce((sum, seg) => sum + (seg.points || 0), 0);

  return {
    type: "hifz",
    startIndex,
    lastIndex: startIndex + segments.length - 1,
    description,
    points,
  };
}

// مهمة الحفظ القادمة (بعد إنهاء المهمة الحالية)
function getNextHifzMission(student) {
  const current = getCurrentHifzMission(student);
  if (!current) return null;

  // نحاكي أنه أنهى المهمة الحالية (خطوة واحدة للأمام)
  const virtualStudent = {
    ...student,
    hifz_progress: current.lastIndex + 1,
  };

  return getCurrentHifzMission(virtualStudent);
}


// مهمة المراجعة الحالية (خطية، مع إعادة من البداية بعد النهاية)
function getCurrentMurajaaMission(student) {
  const level = student.murajaa_level || "BUILDING";
  const arr = getReviewArrayForLevel(level);
  if (!arr || arr.length === 0) return null;

  let index = student.murajaa_progress_index ?? 0;
  if (index >= arr.length) index = 0;

  const item = arr[index];
  const description = item.name;
  const points = item.points || 3;

  return {
    type: "murajaa",
    level,
    index,
    description,
    points,
  };
}

// مهمة المراجعة القادمة (بعد إنهاء الحالية)
function getNextMurajaaMission(student) {
  const current = getCurrentMurajaaMission(student);
  if (!current) return null;

  const level = student.murajaa_level || current.level || "BUILDING";
  const arr = getReviewArrayForLevel(level);
  if (!arr || arr.length === 0) return null;

  const arrLen = arr.length;
  const nextIndex = (current.index + 1) % arrLen;

  const virtualStudent = {
    ...student,
    murajaa_level: level,
    murajaa_progress_index: nextIndex,
  };

  return getCurrentMurajaaMission(virtualStudent);
}


// نسبة التقدم في الحفظ (بسيطة: من بداية الحفظ حتى الفهرس الحالي)
function computeHifzPercent(student) {
  const all = HIFZ_CURRICULUM;
  if (!all || all.length === 0) return 0;

  const start = student.hifz_start_id ?? 0;
  const end = student.hifz_end_id ?? all.length - 1;
  const span = Math.max(1, end - start + 1);

  const progressIndex = student.hifz_progress ?? start;
  const doneSegments = Math.max(0, Math.min(progressIndex - start, span));
  return Math.round((doneSegments / span) * 100);
}

// نسبة التقدم في المراجعة داخل المستوى
function computeMurajaaPercent(student) {
  const level = student.murajaa_level || "BUILDING";
  const arr = getReviewArrayForLevel(level);
  if (!arr || arr.length === 0) return 0;

  let index = student.murajaa_progress_index ?? 0;
  if (index >= arr.length) index = arr.length - 1;
  return Math.round(((index + 1) / arr.length) * 100);
}

// =======================
// منطق الترتيب (Ranking)
// =======================

async function computeAndSetStudentRank(student) {
  if (!student || !student.code) return;

  try {
    const colRef = collection(db, "students");
    const snap = await getDocs(colRef);

    const building = [];
    const others = [];

    snap.forEach((docSnap) => {
      const s = docSnap.data();
      const total = s.total_points || 0;
      const level = s.murajaa_level || "BUILDING";

      if (level === "BUILDING") {
        building.push({ code: s.code, total });
      } else {
        others.push({ code: s.code, total });
      }
    });

    const sortDesc = (arr) =>
      arr.sort((a, b) => (b.total || 0) - (a.total || 0));

    sortDesc(building);
    sortDesc(others);

    const level = student.murajaa_level || "BUILDING";
    const targetArray = level === "BUILDING" ? building : others;

    const idx = targetArray.findIndex((s) => s.code === student.code);
    let rankText = "-";
    if (idx !== -1) {
      rankText = String(idx + 1); // فقط الرقم كما طلبت
    }

    if (studentRankValue) {
      studentRankValue.textContent = rankText;
    }
  } catch (error) {
    console.error("Error computeAndSetStudentRank:", error);
    // لا نعرض رسالة خطأ للطالب هنا حتى لا نزعجه، نكتفي بالكونسول
  }
}

// =======================
// شاشة الطالب: عرض الداشبورد
// =======================

function renderStudentTasks(student) {
  studentTasksDiv.innerHTML = "";

  const tasksContainer = document.createElement("div");

  const tasksArray = Array.isArray(student.tasks) ? student.tasks : [];

  // 1) مهمة الحفظ الحالية
   // --- بطاقة الحفظ: عرض المهمة القادمة ---
  const currentHifzMission = getCurrentHifzMission(student);
  const nextHifzMission = getNextHifzMission(student);

  if (nextHifzMission) {
    // نعرض المهمة القادمة
    studentHifzProgressLabel.textContent =
      `المهمة القادمة: ${nextHifzMission.description}`;
  } else if (currentHifzMission) {
    // لو مافي مهمة قادمة (مثلاً في آخر الخطة) نعرض الحالية
    studentHifzProgressLabel.textContent =
      `المهمة الحالية: ${currentHifzMission.description}`;
  } else {
    studentHifzProgressLabel.textContent = "لا توجد مهمة حفظ حالياً.";
  }

  // --- بطاقة المراجعة: عرض المهمة القادمة أيضاً ---
  const currentMurMission = getCurrentMurajaaMission(student);
  const nextMurMission = getNextMurajaaMission(student);

  if (nextMurMission) {
    studentMurajaaProgressLabel.textContent =
      `المهمة القادمة: ${nextMurMission.description}`;
  } else if (currentMurMission) {
    studentMurajaaProgressLabel.textContent =
      `المهمة الحالية: ${currentMurMission.description}`;
  } else {
    studentMurajaaProgressLabel.textContent = "لا توجد مهمة مراجعة حالياً.";
  }

  // نص مستوى المراجعة يبقى مبني على المستوى الحالي
  if (currentMurMission) {
    studentMurajaaLevelLabel.textContent =
      currentMurMission.level === "BUILDING"
        ? "البناء"
        : currentMurMission.level === "DEVELOPMENT"
        ? "التطوير"
        : "المتقدم";
  } else {
    studentMurajaaLevelLabel.textContent = "غير محدد";
  }


    footer.appendChild(btnDone);
    tasksContainer.appendChild(card);
  }

  // 2) مهمة المراجعة الحالية
const current = getCurrentHifzMission(student);
  if (murMission) {
    const pendingTask = tasksArray.find(
      (t) =>
        t.type === "murajaa" &&
        t.status === "pending" &&
        t.murajaa_index === murMission.index &&
        t.murajaa_level === murMission.level
    );

    const card = document.createElement("div");
    card.className = "task-card";
    card.innerHTML = `
      <div class="task-header">
        <div class="task-title">🔁 المراجعة</div>
        <span class="task-type-tag murajaa">مراجعة</span>
      </div>
      <div class="task-body">
        ${murMission.description}
      </div>
      <div class="task-footer">
        <span class="task-points-tag">النقاط: ${murMission.points}</span>
        <span class="task-status-text">${
          pendingTask
            ? "قيد المراجعة لدى المعلم..."
            : "بانتظار أن تضغط أنجزت المهمة"
        }</span>
      </div>
    `;

    const footer = card.querySelector(".task-footer");
    const btnDone = document.createElement("button");
    btnDone.className = "button success";
    btnDone.textContent = pendingTask ? "إلغاء الإرسال" : "أنجزت المهمة ✅";

    btnDone.addEventListener("click", () => {
      if (pendingTask) {
        cancelMurajaaTask(student.code, murMission);
      } else {
        submitMurajaaTask(student.code, murMission);
      }
    });

    footer.appendChild(btnDone);
    tasksContainer.appendChild(card);
  }

  // 3) المهام العامة المعينة
    // 3) المهام العامة المعينة (نستبعد المنجزة نهائيًا من واجهة الطالب)
  const generalTasks = tasksArray.filter(
    (t) => t.type === "general" && t.status !== "completed"
  );


  if (generalTasks.length > 0) {
    generalTasks.forEach((task) => {
      const card = document.createElement("div");
      card.className = "task-card";
      card.innerHTML = `
        <div class="task-header">
          <div class="task-title">🎯 مهمة عامة</div>
          <span class="task-type-tag general">عامة</span>
        </div>
        <div class="task-body">
          ${task.description}
        </div>
        <div class="task-footer">
          <span class="task-points-tag">النقاط: ${task.points}</span>
          <span class="task-status-text">${
            task.status === "pending"
              ? "قيد المراجعة لدى المعلم..."
              : task.status === "completed"
              ? "تم اعتمادها ✅"
              : "بانتظار الإنجاز"
          }</span>
        </div>
      `;

      const footer = card.querySelector(".task-footer");
      const btn = document.createElement("button");
      btn.className = "button success";

      if (task.status === "assigned") {
        btn.textContent = "أنجزت المهمة ✅";
        btn.addEventListener("click", () => {
          submitGeneralTask(student.code, task.id);
        });
      } else if (task.status === "pending") {
        btn.textContent = "إلغاء الإرسال";
        btn.addEventListener("click", () => {
          cancelGeneralTask(student.code, task.id);
        });
      } else {
        btn.textContent = "منجزة";
        btn.disabled = true;
      }

      footer.appendChild(btn);
      tasksContainer.appendChild(card);
    });
  }

  if (!hifzMission && !murMission && generalTasks.length === 0) {
    studentTasksDiv.innerHTML =
      '<p class="message info">لا توجد مهام حالياً. وفقك الله 🤍</p>';
  } else {
    studentTasksDiv.appendChild(tasksContainer);
  }

// عرض الداشبورد للطالب
// ===============================
// واجهة الطالب (عرض التقدّم والمهام)
// ===============================
async function displayStudentDashboard(student) {
  try {
    hideAllScreens();
    studentScreen.classList.remove("hidden");

    // الاسم والترحيب
    welcomeStudent.textContent = `أهلاً بك يا ${student.name}`;

    // نقاط + ترتيب
    const rank = await getStudentRank(student.code);
    studentTotalPoints.textContent = student.total_points || 0;
    studentRankText.textContent = rank ? rank : "غير متوفر";

    // ======= المهمة القادمة في الحفظ =======
    const currentHifzMission = getCurrentHifzMission(student);
    const nextHifzMission = getNextHifzMission(student);

    if (nextHifzMission) {
      studentHifzProgressLabel.textContent =
        `المهمة القادمة: ${nextHifzMission.description}`;
    } else if (currentHifzMission) {
      studentHifzProgressLabel.textContent =
        `المهمة الحالية: ${currentHifzMission.description}`;
    } else {
      studentHifzProgressLabel.textContent = "لا توجد مهمة حفظ حالياً.";
    }

    // ======= المهمة القادمة في المراجعة =======
    const currentMurajaaMission = getCurrentMurajaaMission(student);
    const nextMurajaaMission = getNextMurajaaMission(student);

    if (nextMurajaaMission) {
      studentMurajaaProgressLabel.textContent =
        `المهمة القادمة: ${nextMurajaaMission.description}`;
    } else if (currentMurajaaMission) {
      studentMurajaaProgressLabel.textContent =
        `المهمة الحالية: ${currentMurajaaMission.description}`;
    } else {
      studentMurajaaProgressLabel.textContent = "لا توجد مهمة مراجعة حالياً.";
    }

    // مستوى المراجعة
    if (currentMurajaaMission) {
      studentMurajaaLevelLabel.textContent =
        currentMurajaaMission.level === "BUILDING"
          ? "البناء"
          : currentMurajaaMission.level === "DEVELOPMENT"
          ? "التطوير"
          : "المتقدم";
    } else {
      studentMurajaaLevelLabel.textContent = "غير محدد";
    }

    // ======= التقدّم =======
    const hifzPercent = computeHifzPercent(student);
    const murajaaPercent = computeMurajaaPercent(student);

    document.getElementById("student-hifz-progress-bar").style.width =
      `${hifzPercent}%`;
    document.getElementById("student-hifz-progress-percent").textContent =
      hifzPercent;

    document.getElementById("student-murajaa-progress-bar").style.width =
      `${murajaaPercent}%`;
    document.getElementById("student-murajaa-progress-percent").textContent =
      murajaaPercent;

    // ======= مهام الطالب =======
    await renderStudentTasks(student);
  } catch (error) {
    console.error("❌ Error in displayStudentDashboard:", error);
  }
}

  // المهمة القادمة في الحفظ
  const hifzMission = getCurrentHifzMission(student);
  if (hifzMission) {
    studentHifzProgressLabel.textContent = `المهمة القادمة: ${hifzMission.description}`;
  } else {
    studentHifzProgressLabel.textContent = "لا توجد مهمة قادمة حالياً.";
  }

  // زر تحديث صفحة الطالب
if (refreshButtonStudent) {
  refreshButtonStudent.addEventListener("click", async () => {
    try {
      if (!currentUser || !currentUser.code) return;
      const studentRef = doc(db, "students", currentUser.code);
      const snap = await getDoc(studentRef);
      if (!snap.exists()) return;
      const freshStudent = { code: currentUser.code, ...snap.data() };
      displayStudentDashboard(freshStudent);
    } catch (error) {
      console.error("Error refreshing student dashboard:", error);
      showMessage(authMessage, "حدث خطأ أثناء التحديث.", "error");
    }
  });
}
  // زر تحديث لوحة المعلم
if (refreshButtonTeacher) {
  refreshButtonTeacher.addEventListener("click", () => {
    try {
      // نحدد التبويب النشط الحالي
      const activeBtn = document.querySelector(".tab-button.active");
      const tabId = activeBtn ? activeBtn.dataset.tab : "review-tasks-tab";
      activateTab(tabId); // يعيد تحميل نفس التبويب
    } catch (error) {
      console.error("Error refreshing teacher panel:", error);
      showMessage(authMessage, "حدث خطأ أثناء التحديث.", "error");
    }
  });
}


  
  
  // المهمة القادمة في المراجعة
  const murMission = getCurrentMurajaaMission(student);
  if (murMission) {
    studentMurajaaProgressLabel.textContent = `المهمة القادمة: ${murMission.description}`;
    studentMurajaaLevelLabel.textContent =
      murMission.level === "BUILDING"
        ? "البناء"
        : murMission.level === "DEVELOPMENT"
        ? "التطوير"
        : "المتقدم";
  } else {
    studentMurajaaProgressLabel.textContent = "لا توجد مهمة قادمة حالياً.";
    studentMurajaaLevelLabel.textContent = "غير محدد";
  }

  // النسب المئوية
  const hifzPercent = computeHifzPercent(student);
  const murPercent = computeMurajaaPercent(student);

  studentHifzProgressPercent.textContent = hifzPercent;
  studentMurajaaProgressPercent.textContent = murPercent;

  studentHifzProgressBar.style.width = `${hifzPercent}%`;
  studentMurajaaProgressBar.style.width = `${murPercent}%`;

  // النقاط
  studentTotalPoints.textContent = student.total_points || 0;

  // شارة الحالة حسب نسبة الحفظ
  if (studentHifzStageBadge) {
    let stageText = "🔵 في بداية الطريق";
    if (hifzPercent >= 75) {
      stageText = "🟢 قارب على إنهاء خطته";
    } else if (hifzPercent >= 30) {
      stageText = "🟡 في منتصف الخطة";
    }
    studentHifzStageBadge.textContent = stageText;
  }

  // حساب الترتيب
  computeAndSetStudentRank(student);

  // المهام
  renderStudentTasks(student);

  hideAllScreens();
  studentScreen.classList.remove("hidden");
}

// =======================
// إرسال / إلغاء مهام الطالب
// =======================

async function submitCurriculumTask(studentCode, mission) {
  try {
    const studentRef = doc(db, "students", studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    const tasks = Array.isArray(student.tasks) ? student.tasks : [];
    const existingIndex = tasks.findIndex(
      (t) =>
        t.type === "hifz" &&
        t.status === "pending" &&
        t.mission_start === mission.startIndex
    );
    if (existingIndex !== -1) {
      showMessage(authMessage, "المهمة قيد المراجعة بالفعل.", "info");
      return;
    }

    const newTask = {
      id: generateUniqueId(),
      type: "hifz",
      description: mission.description,
      points: mission.points,
      status: "pending",
      mission_start: mission.startIndex,
      mission_last: mission.lastIndex,
      created_at: Date.now(),
    };

    tasks.push(newTask);

    await updateDoc(studentRef, { tasks });

    displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage, "تم إرسال مهمة الحفظ للمراجعة.", "success");
  } catch (error) {
    console.error("Error submitCurriculumTask:", error);
    showMessage(authMessage, `حدث خطأ: ${error.message}`, "error");
  }
}

async function cancelCurriculumTask(studentCode, type, missionStartIndex) {
  try {
    const studentRef = doc(db, "students", studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    let tasks = Array.isArray(student.tasks) ? student.tasks : [];
    tasks = tasks.filter(
      (t) =>
        !(
          t.type === type &&
          t.status === "pending" &&
          t.mission_start === missionStartIndex
        )
    );

    await updateDoc(studentRef, { tasks });

    displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage, "تم إلغاء إرسال المهمة وإعادتها لك.", "success");
  } catch (error) {
    console.error("Error cancelCurriculumTask:", error);
    showMessage(authMessage, `حدث خطأ: ${error.message}`, "error");
  }
}

// مراجعة (submit) للمراجعة
async function submitMurajaaTask(studentCode, mission) {
  try {
    const studentRef = doc(db, "students", studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    const tasks = Array.isArray(student.tasks) ? student.tasks : [];
    const existingIndex = tasks.findIndex(
      (t) =>
        t.type === "murajaa" &&
        t.status === "pending" &&
        t.murajaa_index === mission.index &&
        t.murajaa_level === mission.level
    );
    if (existingIndex !== -1) {
      showMessage(authMessage, "مهمة المراجعة قيد المراجعة بالفعل.", "info");
      return;
    }

    const newTask = {
      id: generateUniqueId(),
      type: "murajaa",
      description: mission.description,
      points: mission.points,
      status: "pending",
      murajaa_level: mission.level,
      murajaa_index: mission.index,
      created_at: Date.now(),
    };

    tasks.push(newTask);

    await updateDoc(studentRef, { tasks });

    displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage, "تم إرسال مهمة المراجعة للمراجعة.", "success");
  } catch (error) {
    console.error("Error submitMurajaaTask:", error);
    showMessage(authMessage, `حدث خطأ: ${error.message}`, "error");
  }
}

async function cancelMurajaaTask(studentCode, mission) {
  try {
    const studentRef = doc(db, "students", studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    let tasks = Array.isArray(student.tasks) ? student.tasks : [];
    tasks = tasks.filter(
      (t) =>
        !(
          t.type === "murajaa" &&
          t.status === "pending" &&
          t.murajaa_level === mission.level &&
          t.murajaa_index === mission.index
        )
    );

    await updateDoc(studentRef, { tasks });

    displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage, "تم إلغاء إرسال مهمة المراجعة وإعادتها لك.", "success");
  } catch (error) {
    console.error("Error cancelMurajaaTask:", error);
    showMessage(authMessage, `حدث خطأ: ${error.message}`, "error");
  }
}

// مهام عامة
async function submitGeneralTask(studentCode, taskId) {
  try {
    const studentRef = doc(db, "students", studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    const tasks = Array.isArray(student.tasks) ? student.tasks : [];
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return;

    if (tasks[idx].status === "pending") {
      showMessage(authMessage, "المهمة قيد المراجعة بالفعل.", "info");
      return;
    }

    tasks[idx].status = "pending";

    await updateDoc(studentRef, { tasks });

    displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage, "تم إرسال المهمة العامة للمراجعة.", "success");
  } catch (error) {
    console.error("Error submitGeneralTask:", error);
    showMessage(authMessage, `حدث خطأ: ${error.message}`, "error");
  }
}

async function cancelGeneralTask(studentCode, taskId) {
  try {
    const studentRef = doc(db, "students", studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    const tasks = Array.isArray(student.tasks) ? student.tasks : [];
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return;

    if (tasks[idx].status === "pending") {
      tasks[idx].status = "assigned";
    }

    await updateDoc(studentRef, { tasks });

    displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage, "تم إلغاء إرسال المهمة العامة.", "success");
  } catch (error) {
    console.error("Error cancelGeneralTask:", error);
    showMessage(authMessage, `حدث خطأ: ${error.message}`, "error");
  }
}

// =======================
// شاشة المعلم: مراجعة المهام
// =======================

async function loadPendingTasksForReview() {
  pendingTasksList.innerHTML =
    '<p class="message info">جارٍ تحميل المهام...</p>';

  try {
    const colRef = collection(db, "students");
    const snap = await getDocs(colRef);

    pendingTasksList.innerHTML = "";
    let anyPending = false;

    snap.forEach((docSnap) => {
      const student = docSnap.data();
      const tasks = Array.isArray(student.tasks) ? student.tasks : [];
      const pending = tasks.filter((t) => t.status === "pending");

      if (pending.length === 0) return;

      anyPending = true;

      const block = document.createElement("div");
      block.className = "review-student-block";

      const title = document.createElement("div");
      title.className = "review-student-title";
      title.textContent = `الطالب: ${student.name} (${student.code})`;
      block.appendChild(title);

      pending.forEach((task) => {
        const item = document.createElement("div");
        item.className = "review-task-item";

        item.innerHTML = `
          <div class="review-task-header">
            <span>${
              task.type === "hifz"
                ? "مهمة حفظ"
                : task.type === "murajaa"
                ? "مهمة مراجعة"
                : "مهمة عامة"
            }</span>
            <span>النقاط: ${task.points}</span>
          </div>
          <div class="review-task-body">
            ${task.description}
          </div>
        `;

        const footer = document.createElement("div");
        footer.className = "review-task-footer";

        const btnApprove = document.createElement("button");
        btnApprove.className = "button success";
        btnApprove.textContent = "قبول ✅";
        btnApprove.addEventListener("click", () => {
          reviewTask(student.code, task.id, "approve");
        });

        const btnReject = document.createElement("button");
        btnReject.className = "button danger";
        btnReject.textContent = "رفض ❌";
        btnReject.addEventListener("click", () => {
          reviewTask(student.code, task.id, "reject");
        });

        footer.appendChild(btnApprove);
        footer.appendChild(btnReject);
        item.appendChild(footer);
        block.appendChild(item);
      });

      pendingTasksList.appendChild(block);
    });

    if (!anyPending) {
      pendingTasksList.innerHTML =
        '<p class="message success">لا توجد مهام بانتظار المراجعة حالياً 🎉</p>';
    }
  } catch (error) {
    console.error("Error loadPendingTasksForReview:", error);
    pendingTasksList.innerHTML = `<p class="message error">خطأ في تحميل المهام: ${error.message}</p>`;
  }
}

async function reviewTask(studentCode, taskId, action) {
  try {
    const studentRef = doc(db, "students", studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;

    const student = snap.data();
    const tasks = Array.isArray(student.tasks) ? student.tasks : [];
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) {
      showMessage(authMessage, "المهمة غير موجودة.", "error");
      return;
    }

    const task = tasks[idx];

    if (task.status !== "pending") {
      showMessage(authMessage, "المهمة ليست في حالة بانتظار المراجعة.", "error");
      return;
    }

    if (action === "approve") {
      // 1) نقاط
      const points = task.points || 0;
      student.total_points = (student.total_points || 0) + points;

      // 2) تعديل التقدم حسب نوع المهمة
      if (task.type === "hifz") {
        const last = task.mission_last ?? task.mission_start ?? 0;
        student.hifz_progress = last + 1;
      } else if (task.type === "murajaa") {
        const level = student.murajaa_level || task.murajaa_level || "BUILDING";
        const arr = getReviewArrayForLevel(level);
        let curIndex = student.murajaa_progress_index ?? task.murajaa_index ?? 0;
        let nextIndex = arr.length > 0 ? (curIndex + 1) % arr.length : 0;
        student.murajaa_level = level;
        student.murajaa_progress_index = nextIndex;
      }

      tasks[idx].status = "completed";

      await updateDoc(studentRef, {
        tasks,
        total_points: student.total_points,
        hifz_progress: student.hifz_progress ?? 0,
        murajaa_level: student.murajaa_level || "BUILDING",
        murajaa_progress_index: student.murajaa_progress_index ?? 0,
      });

      showMessage(
        authMessage,
        `تم قبول المهمة وإضافة ${task.points} نقطة للطالب ${student.name}.`,
        "success"
      );
    } else if (action === "reject") {
      // رفض: حذف مهام الحفظ/المراجعة من قائمة المهام، وإرجاع المهام العامة إلى assigned
      if (task.type === "general") {
        tasks[idx].status = "assigned";
      } else {
        tasks.splice(idx, 1);
      }

      await updateDoc(studentRef, { tasks });
      showMessage(
        authMessage,
        `تم رفض المهمة وإعادتها للطالب ${student.name}.`,
        "info"
      );
    }

    loadPendingTasksForReview();
  } catch (error) {
    console.error("Error reviewTask:", error);
    showMessage(authMessage, `خطأ في مراجعة المهمة: ${error.message}`, "error");
  }
}

// =======================
// تعيين مهام (معلم)
// =======================

assignIndividualTaskButton.addEventListener("click", async () => {
  const code = assignTaskStudentCode.value.trim();
  const type = assignTaskType.value;
  const description = assignTaskDescription.value.trim();
  const points = parseInt(assignTaskPoints.value, 10);

  if (!code || !description || isNaN(points) || points <= 0) {
    showMessage(
      assignTaskMessage,
      "الرجاء تعبئة رمز الطالب والوصف والنقاط بشكل صحيح.",
      "error"
    );
    return;
  }

  const task = {
    id: generateUniqueId(),
    type,
    description,
    points,
    status: "assigned",
    created_at: Date.now(),
  };

  try {
    const studentRef = doc(db, "students", code);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) {
      showMessage(assignTaskMessage, "الطالب غير موجود.", "error");
      return;
    }

    const tasks = Array.isArray(snap.data().tasks) ? snap.data().tasks : [];
    tasks.push(task);

    await updateDoc(studentRef, { tasks });
    showMessage(assignTaskMessage, "تم تعيين المهمة للطالب.", "success");
  } catch (error) {
    console.error("Error assignIndividualTask:", error);
    showMessage(
      assignTaskMessage,
      `حدث خطأ في تعيين المهمة: ${error.message}`,
      "error"
    );
  }
});

assignGroupTaskButton.addEventListener("click", async () => {
  const type = assignTaskType.value;
  const description = assignTaskDescription.value.trim();
  const points = parseInt(assignTaskPoints.value, 10);

  if (!description || isNaN(points) || points <= 0) {
    showMessage(
      assignTaskMessage,
      "الرجاء تعبئة الوصف والنقاط بشكل صحيح.",
      "error"
    );
    return;
  }

  const task = {
    id: generateUniqueId(),
    type,
    description,
    points,
    status: "assigned",
    created_at: Date.now(),
  };

  try {
    const colRef = collection(db, "students");
    const snap = await getDocs(colRef);
    const batch = writeBatch(db);

    snap.forEach((docSnap) => {
      const studentRef = doc(db, "students", docSnap.id);
      batch.update(studentRef, {
        tasks: arrayUnion(task),
      });
    });

    await batch.commit();
    showMessage(assignTaskMessage, "تم تعيين المهمة لجميع الطلاب.", "success");
  } catch (error) {
    console.error("Error assignGroupTask:", error);
    showMessage(
      assignTaskMessage,
      `حدث خطأ في تعيين المهمة الجماعية: ${error.message}`,
      "error"
    );
  }
});

// =======================
// إدارة الطلاب (معلم)
// =======================

function populateHifzStartSelect() {
  newStudentHifzStart.innerHTML = HIFZ_CURRICULUM.map(
    (item, index) =>
      `<option value="${index}">(${index}) ${item.surah_name_ar} (${item.start_ayah}-${item.end_ayah})</option>`
  ).join("");
}

async function loadStudentsForTeacher() {
  studentList.innerHTML = "<li>جارٍ تحميل الطلاب...</li>";

  try {
    const colRef = collection(db, "students");
    const snap = await getDocs(colRef);

    studentList.innerHTML = "";

    snap.forEach((docSnap) => {
      const s = docSnap.data();
      const li = document.createElement("li");

      const hifzPercent = computeHifzPercent(s);
      const murPercent = computeMurajaaPercent(s);

      li.innerHTML = `
        <div class="student-line">
          <div class="student-main">${s.name} (${s.code})</div>
          <div class="student-sub">
            حفظ: ${hifzPercent}% | مراجعة: ${murPercent}% | نقاط: ${
        s.total_points || 0
      }
          </div>
          <div class="student-sub">
            ولي الأمر: ${s.parent_code || "غير محدد"}
          </div>
          <div class="student-actions">
            <button class="button primary btn-edit-student" data-code="${
              s.code
            }">تعديل</button>
          </div>
        </div>
      `;

      studentList.appendChild(li);
    });

    // أزرار تعديل
    document.querySelectorAll(".btn-edit-student").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const code = e.target.dataset.code;
        await loadStudentIntoForm(code);
      });
    });
  } catch (error) {
    console.error("Error loadStudentsForTeacher:", error);
    studentList.innerHTML =
      "<li>حدث خطأ أثناء تحميل قائمة الطلاب.</li>";
  }
}

async function loadStudentIntoForm(code) {
  try {
    const studentRef = doc(db, "students", code);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const s = snap.data();

    editingStudentCode = s.code;
    studentFormTitle.textContent = `تعديل بيانات الطالب: ${s.name}`;

    newStudentCodeInput.value = s.code;
    newStudentNameInput.value = s.name;
    newStudentParentCodeInput.value = s.parent_code || "";
    newStudentHifzStart.value = s.hifz_start_id ?? s.hifz_progress ?? 0;
    newStudentHifzLevel.value = s.hifz_level || 1;
    newStudentMurajaaLevel.value = s.murajaa_level || "BUILDING";

    // فتح تبويب إدارة الطلاب
    activateTab("manage-students-tab");
  } catch (error) {
    console.error("Error loadStudentIntoForm:", error);
  }
}

registerStudentButton.addEventListener("click", async () => {
  const code = newStudentCodeInput.value.trim();
  const name = newStudentNameInput.value.trim();
  const parentCode = newStudentParentCodeInput.value.trim() || null;
  const hifzStartIndex = parseInt(newStudentHifzStart.value, 10);
  const hifzLevel = parseInt(newStudentHifzLevel.value, 10);
  const murajaaLevel = newStudentMurajaaLevel.value;

  if (!code || !name || isNaN(hifzStartIndex)) {
    showMessage(
      registerStudentMessage,
      "الرجاء تعبئة جميع الحقول الأساسية.",
      "error"
    );
    return;
  }

  try {
    const studentRef = doc(db, "students", code);
    const snap = await getDoc(studentRef);

    const baseData = {
      code,
      name,
      role: "student",
      parent_code: parentCode,
      hifz_start_id: hifzStartIndex,
      hifz_end_id: HIFZ_CURRICULUM.length - 1,
      hifz_progress: snap.exists()
        ? snap.data().hifz_progress ?? hifzStartIndex
        : hifzStartIndex,
      hifz_level: hifzLevel,
      murajaa_level: murajaaLevel,
      murajaa_progress_index: snap.exists()
        ? snap.data().murajaa_progress_index ?? 0
        : 0,
      total_points: snap.exists() ? snap.data().total_points || 0 : 0,
      tasks: snap.exists() ? snap.data().tasks || [] : [],
    };

    await setDoc(studentRef, baseData, { merge: true });

    showMessage(registerStudentMessage, "تم حفظ بيانات الطالب.", "success");
    editingStudentCode = null;
    studentFormTitle.textContent = "إضافة / تعديل طالب";

    loadStudentsForTeacher();
  } catch (error) {
    console.error("Error registerStudent:", error);
    showMessage(
      registerStudentMessage,
      `حدث خطأ في حفظ بيانات الطالب: ${error.message}`,
      "error"
    );
  }
});

// =======================
// عرض المنهج في لوحة المعلم
// =======================

function displayCurriculumsInTeacherPanel() {
  // الحفظ
  hifzCurriculumDisplay.innerHTML = HIFZ_CURRICULUM.map(
    (item, index) =>
      `<div class="curriculum-item">(${index}) ${item.surah_name_ar} (${item.start_ayah}-${item.end_ayah}) – نقاط: ${
        item.points || 0
      }</div>`
  ).join("");

  // المراجعة
  murajaaCurriculumDisplay.innerHTML = Object.entries(REVIEW_CURRICULUM)
    .map(([level, items]) => {
      const title =
        level === "BUILDING"
          ? "البناء"
          : level === "DEVELOPMENT"
          ? "التطوير"
          : "المتقدم";
      const list = items
        .map(
          (item, index) =>
            `<div class="curriculum-item">(${index}) ${item.name} – نقاط: ${
              item.points || 0
            }</div>`
        )
        .join("");
      return `<h4>${title}</h4>${list}`;
    })
    .join("<hr />");
}

// =======================
// شاشة ولي الأمر
// =======================

// =======================
// شاشة ولي الأمر (مُحدّثة)
// =======================
async function displayParentDashboard(parentCode) {
  try {
    const colRef = collection(db, "students");
    const snap = await getDocs(colRef);

    const allStudents = [];
    snap.forEach((docSnap) => allStudents.push(docSnap.data()));

    // أبناؤه فقط
    const children = allStudents.filter(
      (s) => s.parent_code === parentCode
    );

    // ترتيب عام لكل الطلاب حسب النقاط (لإظهار رتبة الابن)
    const sortedByPoints = [...allStudents].sort(
      (a, b) => (b.total_points || 0) - (a.total_points || 0)
    );

    const rankMap = {};
    let lastPoints = null;
    let currentRank = 0;

    sortedByPoints.forEach((s, index) => {
      const pts = s.total_points || 0;
      if (lastPoints === null) {
        currentRank = 1;
      } else if (pts < lastPoints) {
        // إذا قلّت النقاط، يتغيّر ترتيب الرقم
        currentRank = index + 1;
      }
      rankMap[s.code] = currentRank;
      lastPoints = pts;
    });

    welcomeParent.textContent = `مرحبًا بك يا ولي الأمر (${parentCode})`;

    parentChildrenList.innerHTML = "";

    if (children.length === 0) {
      parentChildrenList.innerHTML =
        '<p class="message info">لا يوجد أبناء مربوطون بهذا الرمز.</p>';
    } else {
      children.forEach((s) => {
        const card = document.createElement("div");
        card.className = "child-card";

        // خطة الحفظ من–إلى (بالسور)
        const startIndex =
          typeof s.hifz_start_id === "number" ? s.hifz_start_id : 0;
        const endIndex =
          typeof s.hifz_end_id === "number"
            ? s.hifz_end_id
            : HIFZ_CURRICULUM.length - 1;

        const startItem = HIFZ_CURRICULUM[startIndex] || null;
        const endItem = HIFZ_CURRICULUM[endIndex] || null;

        const startSurah = startItem ? startItem.surah_name_ar : "غير محددة";
        const endSurah = endItem ? endItem.surah_name_ar : "غير محددة";

        // نسبة الحفظ + الشارة التحفيزية
        const hifzPercent = computeHifzPercent(s);

        let motivationLabel = "🔵 في بداية الطريق";
        if (hifzPercent >= 75) {
          motivationLabel = "🟢 قارب على إنهاء خطته";
        } else if (hifzPercent >= 30) {
          motivationLabel = "🟡 في منتصف الخطة";
        }

        // مهمة الحفظ الحالية
        const hifzMission = getCurrentHifzMission(s);
        const hifzMissionText = hifzMission
          ? hifzMission.description
          : "لا توجد مهمة حفظ حالياً.";

        // مهمة المراجعة الحالية
        const murajaaMission = getCurrentMurajaaMission(s);
        const murajaaMissionText = murajaaMission
          ? murajaaMission.description
          : "لا توجد مهمة مراجعة حالياً.";

        // ترتيب الطالب (رقم فقط)
        const rank = rankMap[s.code] || "-";

        // بناء بطاقة الابن
        card.innerHTML = `
          <div class="child-name">${s.name} (${s.code})</div>

          <div class="child-line">
            خطة الحفظ: من سورة <strong>${startSurah}</strong>
            إلى سورة <strong>${endSurah}</strong>
          </div>

          <div class="child-line">
            إنجاز الحفظ: <strong>${hifzPercent}%</strong>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${hifzPercent}%;"></div>
          </div>

          <div class="child-line">
            ${motivationLabel}
          </div>

          <div class="child-line">
            مجموع النقاط: <strong>${s.total_points || 0}</strong>
          </div>

          <div class="child-line">
            الترتيب: <strong>${rank}</strong>
          </div>

          <div class="child-line">
            مهمة الحفظ الحالية:
            <span>${hifzMissionText}</span>
          </div>

          <div class="child-line">
            مهمة المراجعة الحالية:
            <span>${murajaaMissionText}</span>
          </div>
        `;

        parentChildrenList.appendChild(card);
      });
    }

    hideAllScreens();
    parentScreen.classList.remove("hidden");
  } catch (error) {
    console.error("Error displayParentDashboard:", error);
    parentChildrenList.innerHTML = `<p class="message error">خطأ في تحميل بيانات الأبناء: ${error.message}</p>`;
  }
}


// =======================
// تبويبات المعلم
// =======================

function activateTab(tabId) {
  document.querySelectorAll(".tab-content").forEach((el) => {
    el.classList.add("hidden");
  });
  const target = document.getElementById(tabId);
  if (target) target.classList.remove("hidden");

  tabButtons.forEach((btn) => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  if (tabId === "review-tasks-tab") {
    loadPendingTasksForReview();
  } else if (tabId === "manage-students-tab") {
    loadStudentsForTeacher();
  } else if (tabId === "curriculum-tab") {
    displayCurriculumsInTeacherPanel();
  }
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabId = btn.dataset.tab;
    activateTab(tabId);
  });
});

// =======================
// تسجيل الدخول + الخروج
// =======================

loginButton.addEventListener("click", async () => {
  const code = userCodeInput.value.trim();
  if (!code) {
    showMessage(authMessage, "الرجاء إدخال رمز الدخول.", "error");
    return;
  }

  try {
    if (code === "teacher") {
      currentUser = { role: "teacher", name: "المعلم" };
      hideAllScreens();
      teacherScreen.classList.remove("hidden");
      activateTab("review-tasks-tab"); // أول واجهة: مراجعة المهام
      return;
    }

    // تجربة كطالب
    const studentRef = doc(db, "students", code);
    const studentSnap = await getDoc(studentRef);
    if (studentSnap.exists()) {
      const student = { code, ...studentSnap.data() };
      displayStudentDashboard(student);
      return;
    }

    // تجربة كولي أمر (عن طريق البحث عن طلاب parent_code = code)
    const colRef = collection(db, "students");
    const q = query(colRef, where("parent_code", "==", code));
    const snap = await getDocs(q);

    if (!snap.empty) {
      currentUser = { role: "parent", code };
      displayParentDashboard(code);
      return;
    }

    showMessage(authMessage, "رمز الدخول غير صحيح.", "error");
  } catch (error) {
    console.error("Login error:", error);
    showMessage(authMessage, `خطأ في الاتصال بالخادم: ${error.message}`, "error");
  }
});

function logout() {
  currentUser = null;
  userCodeInput.value = "";
  hideAllScreens();
  authScreen.classList.remove("hidden");
  showMessage(authMessage, "تم تسجيل الخروج بنجاح.", "success");
}

logoutButtonStudent.addEventListener("click", logout);
logoutButtonTeacher.addEventListener("click", logout);
logoutButtonParent.addEventListener("click", logout);

// =======================
// تهيئة أولية
// =======================
populateHifzStartSelect();
console.log("App ready. Curriculum loaded from external file.");






