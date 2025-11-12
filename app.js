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
  where,
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

import { HIFZ_CURRICULUM, REVIEW_CURRICULUM } from "./curriculum.js";

// إعدادات المشروع
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

// =======================
// مراجع DOM
// =======================

// شاشة الدخول
const authScreen = document.getElementById("auth-screen");
const userCodeInput = document.getElementById("user-code");
const loginButton = document.getElementById("login-button");
const authMessage = document.getElementById("auth-message");

// شاشة الطالب
const studentScreen = document.getElementById("student-screen");
const welcomeStudent = document.getElementById("welcome-student");
// شريط الخطة تحت اسم الطالب
const studentPlanStrip = document.getElementById("student-plan-strip");
const stripPlan = document.getElementById("strip-plan");
const stripPoints = document.getElementById("strip-points");
const stripRank = document.getElementById("strip-rank");

// المهمة القادمة
const nextHifzMissionSpan = document.getElementById("next-hifz-mission");
const nextMurajaaMissionSpan = document.getElementById("next-murajaa-mission");

const studentHifzProgressLabel = document.getElementById("student-hifz-progress-label");
const studentMurajaaProgressLabel = document.getElementById("student-murajaa-progress-label");
const studentHifzProgressBar = document.getElementById("student-hifz-progress-bar");
const studentMurajaaProgressBar = document.getElementById("student-murajaa-progress-bar");
const studentHifzProgressPercent = document.getElementById("student-hifz-progress-percent");
const studentMurajaaProgressPercent = document.getElementById("student-murajaa-progress-percent");
const studentMurajaaLevelLabel = document.getElementById("student-murajaa-level-label");
const studentTotalPoints = document.getElementById("student-total-points");
const studentRankText = document.getElementById("student-rank-text");
const studentTasksDiv = document.getElementById("student-tasks");
const logoutButtonStudent = document.getElementById("logout-button-student");

// شاشة المعلم
const teacherScreen = document.getElementById("teacher-screen");
const logoutButtonTeacher = document.getElementById("logout-button-teacher");
const tabButtons = document.querySelectorAll(".tab-button");

// أزرار التحديث
const refreshStudentButton = document.getElementById("refresh-student-button");
const refreshTeacherButton = document.getElementById("refresh-teacher-button");

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
const newStudentParentNameInput = document.getElementById("new-student-parent-name");
const newStudentParentCodeInput = document.getElementById("new-student-parent-code");
const newStudentHifzStart = document.getElementById("new-student-hifz-start");
const newStudentHifzEnd = document.getElementById("new-student-hifz-end");
const newStudentHifzLevel = document.getElementById("new-student-hifz-level");
const newStudentMurajaaLevel = document.getElementById("new-student-murajaa-level");
const newStudentMurajaaStart = document.getElementById("new-student-murajaa-start");
const registerStudentButton = document.getElementById("register-student-button");
const registerStudentMessage = document.getElementById("register-student-message");

// عرض المنهج
const hifzCurriculumDisplay = document.getElementById("hifz-curriculum-display");
const murajaaCurriculumDisplay = document.getElementById("murajaa-curriculum-display");

// مراجعة المهام (المعلم)
const pendingTasksList = document.getElementById("pending-tasks-list");
const honorBoardDiv = document.getElementById("honor-board");

// شاشة ولي الأمر
const parentScreen = document.getElementById("parent-screen");
const welcomeParent = document.getElementById("welcome-parent");
const logoutButtonParent = document.getElementById("logout-button-parent");
const parentChildrenList = document.getElementById("parent-children-list");

// حالة المستخدم الحالي
let currentUser = null;
let editingStudentCode = null;

// =======================
// أزرار التحديث (طالب / معلم)
// =======================

// تحديث واجهة الطالب من Firestore
async function refreshStudentView() {
  // نتأكد أن المستخدم طالب وله كود
  if (!currentUser || !currentUser.code) return;

  try {
    const studentRef = doc(db, "students", currentUser.code);
    const snap = await getDoc(studentRef);

    if (!snap.exists()) {
      showMessage(authMessage, "تعذر العثور على بيانات الطالب.", "error");
      return;
    }

    const student = { code: currentUser.code, ...snap.data() };
    displayStudentDashboard(student);
  } catch (error) {
    console.error("Error refreshStudentView:", error);
    showMessage(
      authMessage,
      `خطأ في تحديث بيانات الطالب: ${error.message}`,
      "error"
    );
  }
}

// معرفة التبويب النشط للمعلم
function getActiveTeacherTabId() {
  const activeTab = document.querySelector(".tab-content:not(.hidden)");
  return activeTab ? activeTab.id : null;
}

// تحديث واجهة المعلم حسب التبويب المفتوح
function refreshTeacherView() {
  const activeId = getActiveTeacherTabId();
  if (!activeId) return;

  if (activeId === "review-tasks-tab") {
    loadPendingTasksForReview();
  } else if (activeId === "manage-students-tab") {
    loadStudentsForTeacher();
  } else if (activeId === "curriculum-tab") {
    displayCurriculumsInTeacherPanel();
  }
}

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

// جلب مصفوفة المراجعة حسب المستوى
function getReviewArrayForLevel(level) {
  return REVIEW_CURRICULUM[level] || [];
}

// جلب جميع الطلاب مرتبين حسب النقاط (تنازلياً)
async function fetchAllStudentsSortedByPoints() {
  const colRef = collection(db, "students");
  const snap = await getDocs(colRef);
  const students = [];
  snap.forEach((docSnap) => {
    const s = docSnap.data();
    students.push(s);
  });
  students.sort((a, b) => (b.total_points || 0) - (a.total_points || 0));
  return students;
}

// =======================
// منطق المنهج: حفظ + مراجعة
// =======================

// مهمة الحفظ الحالية حسب مستوى الطالب (1 / 2 / 3 مقاطع)
function getCurrentHifzMission(student) {
  const all = HIFZ_CURRICULUM;
  if (!all || all.length === 0) return null;

  const startIndex = student.hifz_progress ?? student.hifz_start_id ?? 0;
  if (startIndex >= all.length) return null;

  const level = parseInt(student.hifz_level || 1, 10);
  const maxSegments = Math.max(1, Math.min(3, level)); // 1x أو 2x أو 3x

  const segments = [];
  const firstSeg = all[startIndex];
  segments.push(firstSeg);

  // نجمع حتى 3 مقاطع من نفس السورة فقط
  let i = startIndex + 1;
  while (segments.length < maxSegments && i < all.length) {
    const seg = all[i];
    if (seg.surah_number !== firstSeg.surah_number) break; // لا نتجاوز السورة
    segments.push(seg);
    i++;
  }

  function getNextHifzMission(student) {
  const all = HIFZ_CURRICULUM;
  if (!all || all.length === 0) return null;

  // حدود الخطة
  const planStart = student.hifz_start_id ?? 0;
  const planEnd = student.hifz_end_id ?? (all.length - 1);

  // اعتمد المهمة الحالية كنقطة انطلاق
  const cur = getCurrentHifzMission(student);
  if (!cur) return null;

  const candidateStart = cur.lastIndex + 1;
  if (candidateStart > planEnd) return null;

  const level = parseInt(student.hifz_level || 1, 10);
  const maxSegments = Math.max(1, Math.min(3, level));

  const segments = [];
  const firstSeg = all[candidateStart];
  if (!firstSeg) return null;
  segments.push(firstSeg);

  // نجمع حتى 3 مقاطع لاحقة بشرط نفس السورة وعدم تخطي planEnd
  let i = candidateStart + 1;
  while (segments.length < maxSegments && i <= planEnd && i < all.length) {
    const seg = all[i];
    if (seg.surah_number !== firstSeg.surah_number) break;
    segments.push(seg);
    i++;
  }

  const lastSeg = segments[segments.length - 1];
  const description = `${firstSeg.surah_name_ar} (${firstSeg.start_ayah}-${lastSeg.end_ayah})`;
  const pointsPerMission = firstSeg.points || 5;

  return {
    type: "hifz",
    startIndex: candidateStart,
    lastIndex: candidateStart + segments.length - 1,
    description,
    points: pointsPerMission,
  };
}

  
  // ✅ دمج الوصف: من أول آية إلى آخر آية في المقاطع المدموجة
  const lastSeg = segments[segments.length - 1];
  const description = `${firstSeg.surah_name_ar} (${firstSeg.start_ayah}-${lastSeg.end_ayah})`;

  // ✅ نقاط المهمة: ثابتة (٥ نقاط) بغض النظر عن عدد المقاطع
  const pointsPerMission = firstSeg.points || 5;

  return {
    type: "hifz",
    startIndex,
    lastIndex: startIndex + segments.length - 1,
    description,
    points: pointsPerMission,
  };
}


// مهمة المراجعة الحالية (مع نقطة بداية مخصصة لكل طالب)
function getCurrentMurajaaMission(student) {
  const level = student.murajaa_level || "BUILDING";
  const arr = getReviewArrayForLevel(level);
  if (!arr || arr.length === 0) return null;

  const arrLen = arr.length;
  let startIndex = student.murajaa_start_index ?? 0;
  if (arrLen > 0) {
    startIndex = ((startIndex % arrLen) + arrLen) % arrLen;
  }

  let index = student.murajaa_progress_index;
  if (index == null) {
    index = startIndex;
  } else if (arrLen > 0) {
    index = ((index % arrLen) + arrLen) % arrLen;
  }

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


function getNextMurajaaMission(student) {
  const level = student.murajaa_level || "BUILDING";
  const arr = getReviewArrayForLevel(level);
  if (!arr || arr.length === 0) return null;

  const arrLen = arr.length;
  const startIndex = ((student.murajaa_start_index ?? 0) % arrLen + arrLen) % arrLen;

  let currentIndex = student.murajaa_progress_index;
  if (currentIndex == null) currentIndex = startIndex;
  currentIndex = ((currentIndex % arrLen) + arrLen) % arrLen;

  const nextIndex = (currentIndex + 1) % arrLen;
  const item = arr[nextIndex];

  return {
    type: "murajaa",
    level,
    index: nextIndex,
    description: item.name,
    points: item.points || 3,
  };
}

// نسبة التقدم في الحفظ داخل الخطة (من–إلى)
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

// نسبة التقدم في المراجعة ضمن الدورة الحالية (من نقطة البداية)
function computeMurajaaPercent(student) {
  const level = student.murajaa_level || "BUILDING";
  const arr = getReviewArrayForLevel(level);
  if (!arr || arr.length === 0) return 0;

  const arrLen = arr.length;
  const start = (student.murajaa_start_index ?? 0) % arrLen;

  let progressIndex = student.murajaa_progress_index;
  if (progressIndex == null) {
    progressIndex = start;
  }
  progressIndex = ((progressIndex % arrLen) + arrLen) % arrLen;

  const distance = (progressIndex - start + arrLen) % arrLen; // عدد المهام المنجزة في الدورة الحالية
  return Math.round((distance / arrLen) * 100);
}

function buildPlanText(student) {
  const all = HIFZ_CURRICULUM || [];
  const startIndex = typeof student.hifz_start_id === "number" ? student.hifz_start_id : 0;
  const endIndex = typeof student.hifz_end_id === "number" ? student.hifz_end_id : (all.length - 1);

  const startItem = all[startIndex] || null;
  const endItem = all[endIndex] || null;

  const startSurah = startItem ? startItem.surah_name_ar : "غير محددة";
  const endSurah = endItem ? endItem.surah_name_ar : "غير محددة";

  return `الخطة: من سورة ${startSurah} إلى سورة ${endSurah}`;
}


// =======================
// شاشة الطالب: عرض الداشبورد
// =======================

function renderStudentTasks(student) {
  studentTasksDiv.innerHTML = "";

  const tasksContainer = document.createElement("div");

  const tasksArray = Array.isArray(student.tasks) ? student.tasks : [];

  // 1) مهمة الحفظ الحالية
  const hifzMission = getCurrentHifzMission(student);
  if (hifzMission) {
    const pendingTask = tasksArray.find(
      (t) =>
        t.type === "hifz" &&
        t.status === "pending" &&
        t.mission_start === hifzMission.startIndex
    );

    const card = document.createElement("div");
    card.className = "task-card";
  card.innerHTML = `
    <div class="task-header">
      <div class="task-title">🎯 الحفظ </div>
      <span class="task-type-tag hifz">حفظ</span>
    </div>
    <div class="task-body mission-text">
      ${hifzMission.description}
    </div>
    <div class="task-footer">
      <span class="task-points-tag">النقاط: ${hifzMission.points}</span>
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
        cancelCurriculumTask(student.code, "hifz", hifzMission.startIndex);
      } else {
        submitCurriculumTask(student.code, hifzMission);
      }
    });

    footer.appendChild(btnDone);
    tasksContainer.appendChild(card);
  }

  // 2) مهمة المراجعة الحالية
  const murMission = getCurrentMurajaaMission(student);
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
      <div class="task-title">📖 المراجعة </div>
      <span class="task-type-tag murajaa">مراجعة</span>
    </div>
    <div class="task-body mission-text">
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

  // 3) المهام العامة
  const generalTasks = tasksArray.filter((t) => t.type === "general");

  if (generalTasks.length > 0) {
    generalTasks.forEach((task) => {
      const card = document.createElement("div");
      card.className = "task-card";
      card.innerHTML = `
        <div class="task-header">
          <div class="task-title">${task.description}</div>
          <span class="task-type-tag general">عامة</span>
        </div>
        <div class="task-body">
          مهمة عامة من المعلم.
        </div>
        <div class="task-footer">
          <span class="task-points-tag">النقاط: ${task.points}</span>
          <span class="task-status-text">
            ${
              task.status === "pending"
                ? "قيد المراجعة لدى المعلم..."
                : task.status === "completed"
                ? "تم اعتمادها ✅"
                : "بانتظار الإنجاز"
            }
          </span>
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
}

// عرض الداشبورد للطالب (مع الترتيب)

async function displayStudentDashboard(student) {
  currentUser = student;

  // اسم الطالب
  welcomeStudent.textContent = `أهلاً بك يا ${student.name || "طالب"}`;

  // شريط الخطة + النقاط + الترتيب
  if (stripPlan) stripPlan.textContent = buildPlanText(student);
  if (stripPoints) stripPoints.textContent = `النقاط: ${student.total_points || 0}`;

  // ترتيب الطالب (رقم فقط)
  try {
    const allStudents = await fetchAllStudentsSortedByPoints();
    const total = allStudents.length;
    const index = allStudents.findIndex((s) => s.code === student.code);
    if (index !== -1) {
      const rank = index + 1;
      if (stripRank) stripRank.textContent = `الترتيب: ${rank}`;
      if (studentRankText) studentRankText.textContent = `${rank}`; // إبقاءه رقم فقط لو احتجناه لاحقاً
    } else {
      if (stripRank) stripRank.textContent = `الترتيب: —`;
      if (studentRankText) studentRankText.textContent = `—`;
    }
  } catch (e) {
    if (stripRank) stripRank.textContent = `الترتيب: —`;
    if (studentRankText) studentRankText.textContent = `—`;
  }

  // الحفظ: الحالية في الملصق العلوي، القادمة تحت الشريط
  const hifzMission = getCurrentHifzMission(student);
  if (hifzMission) {
    studentHifzProgressLabel.textContent = hifzMission.description;
  } else {
    studentHifzProgressLabel.textContent = "لا توجد مهمة حفظ حالياً.";
  }
  const nextHifz = getNextHifzMission(student);
  if (nextHifzMissionSpan) nextHifzMissionSpan.textContent = nextHifz ? nextHifz.description : "—";

  // المراجعة: الحالية في الملصق العلوي، القادمة تحت الشريط
  const murMission = getCurrentMurajaaMission(student);
  if (murMission) {
    studentMurajaaProgressLabel.textContent = murMission.description;
    studentMurajaaLevelLabel.textContent =
      murMission.level === "BUILDING" ? "البناء"
      : murMission.level === "DEVELOPMENT" ? "التطوير" : "المتقدم";
  } else {
    studentMurajaaProgressLabel.textContent = "لا توجد مهمة مراجعة حالياً.";
    studentMurajaaLevelLabel.textContent = "غير محدد";
  }
  const nextMur = getNextMurajaaMission(student);
  if (nextMurajaaMissionSpan) nextMurajaaMissionSpan.textContent = nextMur ? nextMur.description : "—";

  // نسب التقدّم
  const hifzPercent = computeHifzPercent(student);
  const murPercent = computeMurajaaPercent(student);
  studentHifzProgressPercent.textContent = hifzPercent;
  studentMurajaaProgressPercent.textContent = murPercent;
  studentHifzProgressBar.style.width = `${hifzPercent}%`;
  studentMurajaaProgressBar.style.width = `${murPercent}%`;

  // النقاط (موجودة في الشريط الآن)
  studentTotalPoints.textContent = student.total_points || 0;


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

    await displayStudentDashboard({ code: studentCode, ...student, tasks });
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

    await displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage, "تم إلغاء إرسال المهمة وإعادتها لك.", "success");
  } catch (error) {
    console.error("Error cancelCurriculumTask:", error);
    showMessage(authMessage, `حدث خطأ: ${error.message}`, "error");
  }
}

// مراجعة: إرسال مهمة المراجعة
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

    await displayStudentDashboard({ code: studentCode, ...student, tasks });
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

    await displayStudentDashboard({ code: studentCode, ...student, tasks });
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

    await displayStudentDashboard({ code: studentCode, ...student, tasks });
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

    await displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage, "تم إلغاء إرسال المهمة العامة.", "success");
  } catch (error) {
    console.error("Error cancelGeneralTask:", error);
    showMessage(authMessage, `حدث خطأ: ${error.message}`, "error");
  }
}

// =======================
// شاشة المعلم: مراجعة المهام + لوحة الشرف
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
            <span>
              ${
                task.type === "hifz"
                  ? "مهمة حفظ"
                  : task.type === "murajaa"
                  ? "مهمة مراجعة"
                  : "مهمة عامة"
              }
            </span>
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

async function loadHonorBoard() {
  if (!honorBoardDiv) return;
  honorBoardDiv.innerHTML =
    '<p class="message info">جارٍ تحديث لوحة الشرف...</p>';

  try {
    const students = await fetchAllStudentsSortedByPoints();
    if (students.length === 0) {
      honorBoardDiv.innerHTML =
        '<p class="message info">لا يوجد طلاب مسجلون بعد.</p>';
      return;
    }

    const top = students.slice(0, 5);
    const list = document.createElement("ol");
    top.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = `${s.name} (${s.code}) – ${s.total_points || 0} نقطة`;
      list.appendChild(li);
    });

    honorBoardDiv.innerHTML = "";
    const title = document.createElement("p");
    title.className = "small-text";
    title.textContent = "أعلى الطلاب نقاطاً:";
    honorBoardDiv.appendChild(title);
    honorBoardDiv.appendChild(list);
  } catch (error) {
    console.error("Error loadHonorBoard:", error);
    honorBoardDiv.innerHTML = `<p class="message error">خطأ في تحميل لوحة الشرف: ${error.message}</p>`;
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
        const arrLen = arr.length;

        let startIndex = student.murajaa_start_index ?? task.murajaa_index ?? 0;
        if (arrLen > 0) {
          startIndex = ((startIndex % arrLen) + arrLen) % arrLen;
        } else {
          startIndex = 0;
        }

        let curIndex = student.murajaa_progress_index ?? task.murajaa_index ?? startIndex;
        if (arrLen > 0) {
          curIndex = ((curIndex % arrLen) + arrLen) % arrLen;
        } else {
          curIndex = startIndex;
        }

        const nextIndex = arrLen > 0 ? (curIndex + 1) % arrLen : startIndex;

        let murCycles = student.murajaa_cycles || 0;
        if (arrLen > 0 && nextIndex === startIndex) {
          murCycles += 1; // أنهى دورة كاملة
        }

        student.murajaa_level = level;
        student.murajaa_start_index = startIndex;
        student.murajaa_progress_index = nextIndex;
        student.murajaa_cycles = murCycles;
      }

      tasks[idx].status = "completed";

      await updateDoc(studentRef, {
        tasks,
        total_points: student.total_points,
        hifz_start_id: student.hifz_start_id ?? 0,
        hifz_end_id: student.hifz_end_id ?? (HIFZ_CURRICULUM.length - 1),
        hifz_progress: student.hifz_progress ?? 0,
        murajaa_level: student.murajaa_level || "BUILDING",
        murajaa_start_index: student.murajaa_start_index ?? 0,
        murajaa_progress_index: student.murajaa_progress_index ?? 0,
        murajaa_cycles: student.murajaa_cycles || 0,
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

    // تحديث واجهة المعلم لحظياً
    await loadPendingTasksForReview();
    await loadHonorBoard();
    // لو المعلم فاتح تبويب إدارة الطلاب، نحدّث القائمة أيضاً
    if (!document.getElementById("manage-students-tab").classList.contains("hidden")) {
      await loadStudentsForTeacher();
    }
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

function populateHifzSelects() {
  if (!newStudentHifzStart || !newStudentHifzEnd) return;

  const optionsHtml = HIFZ_CURRICULUM.map(
    (item, index) =>
      `<option value="${index}">(${index}) ${item.surah_name_ar} (${item.start_ayah}-${item.end_ayah})</option>`
  ).join("");

  newStudentHifzStart.innerHTML = optionsHtml;
  newStudentHifzEnd.innerHTML = optionsHtml;
}

function populateMurajaaStartSelect() {
  if (!newStudentMurajaaLevel || !newStudentMurajaaStart) return;
  const level = newStudentMurajaaLevel.value || "BUILDING";
  const arr = getReviewArrayForLevel(level);

  if (!arr || arr.length === 0) {
    newStudentMurajaaStart.innerHTML =
      '<option value="0">لا توجد مهام لهذا المستوى</option>';
    return;
  }

  newStudentMurajaaStart.innerHTML = arr
    .map(
      (item, index) =>
        `<option value="${index}">(${index}) ${item.name}</option>`
    )
    .join("");
}

newStudentMurajaaLevel.addEventListener("change", populateMurajaaStartSelect);

async function loadStudentsForTeacher() {
  studentList.innerHTML = "<li>جارٍ تحميل الطلاب...</li>";

  try {
    const students = await fetchAllStudentsSortedByPoints();
    studentList.innerHTML = "";

    if (students.length === 0) {
      studentList.innerHTML = "<li>لا يوجد طلاب مسجلون بعد.</li>";
      return;
    }

    students.forEach((s, index) => {
      const rank = index + 1;
      const hifzPercent = computeHifzPercent(s);
      const murPercent = computeMurajaaPercent(s);

      const li = document.createElement("li");
      li.innerHTML = `
        <div class="student-line">
          <div class="student-main">
            #${rank} - ${s.name} (${s.code})
          </div>
          <div class="student-sub">
            حفظ: ${hifzPercent}% | مراجعة: ${murPercent}% | نقاط: ${
        s.total_points || 0
      }
          </div>
          <div class="student-sub">
            ولي الأمر: ${s.parent_name || "غير مسجل"} (${s.parent_code || "—"})
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

    if (!newStudentHifzStart.options.length || !newStudentHifzEnd.options.length) {
      populateHifzSelects();
    }

    newStudentCodeInput.value = s.code;
    newStudentNameInput.value = s.name;
    newStudentParentNameInput.value = s.parent_name || "";
    newStudentParentCodeInput.value = s.parent_code || "";

    newStudentHifzStart.value = s.hifz_start_id ?? s.hifz_progress ?? 0;
    newStudentHifzEnd.value =
      s.hifz_end_id ?? HIFZ_CURRICULUM.length - 1;
    newStudentHifzLevel.value = s.hifz_level || 1;

    newStudentMurajaaLevel.value = s.murajaa_level || "BUILDING";
    populateMurajaaStartSelect();
    const arr = getReviewArrayForLevel(newStudentMurajaaLevel.value);
    const defaultStart =
      s.murajaa_start_index ?? s.murajaa_progress_index ?? 0;
    const clamped =
      arr && arr.length > 0
        ? Math.min(defaultStart, arr.length - 1)
        : 0;
    newStudentMurajaaStart.value = clamped.toString();

    // فتح تبويب إدارة الطلاب
    activateTab("manage-students-tab");
  } catch (error) {
    console.error("Error loadStudentIntoForm:", error);
  }
}

registerStudentButton.addEventListener("click", async () => {
  const code = newStudentCodeInput.value.trim();
  const name = newStudentNameInput.value.trim();
  const parentName = newStudentParentNameInput.value.trim() || null;
  const parentCode = newStudentParentCodeInput.value.trim() || null;

  const hifzStartIndex = parseInt(newStudentHifzStart.value, 10);
  const hifzEndIndex = parseInt(newStudentHifzEnd.value, 10);
  const hifzLevel = parseInt(newStudentHifzLevel.value, 10);
  const murajaaLevel = newStudentMurajaaLevel.value;
  const murajaaStartIndex = parseInt(newStudentMurajaaStart.value, 10) || 0;

  if (!code || !name || isNaN(hifzStartIndex) || isNaN(hifzEndIndex)) {
    showMessage(
      registerStudentMessage,
      "الرجاء تعبئة جميع الحقول الأساسية بشكل صحيح.",
      "error"
    );
    return;
  }

  if (hifzEndIndex < hifzStartIndex) {
    showMessage(
      registerStudentMessage,
      "نقطة نهاية الحفظ يجب أن تكون بعد نقطة البداية.",
      "error"
    );
    return;
  }

  try {
    const studentRef = doc(db, "students", code);
    const snap = await getDoc(studentRef);
    const existing = snap.exists() ? snap.data() : null;

    const baseData = {
      code,
      name,
      role: "student",
      parent_name: parentName,
      parent_code: parentCode,
      hifz_start_id: hifzStartIndex,
      hifz_end_id: hifzEndIndex,
      hifz_progress: existing
        ? existing.hifz_progress ?? hifzStartIndex
        : hifzStartIndex,
      hifz_level: hifzLevel,
      murajaa_level: murajaaLevel,
      murajaa_start_index: murajaaStartIndex,
      murajaa_progress_index: murajaaStartIndex,
      murajaa_cycles: existing ? existing.murajaa_cycles || 0 : 0,
      total_points: existing ? existing.total_points || 0 : 0,
      tasks: existing ? existing.tasks || [] : [],
    };

    await setDoc(studentRef, baseData, { merge: true });

    showMessage(registerStudentMessage, "تم حفظ بيانات الطالب.", "success");
    editingStudentCode = null;
    studentFormTitle.textContent = "إضافة / تعديل طالب";

    await loadStudentsForTeacher();
    await loadHonorBoard();
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
    loadHonorBoard();
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
    if (code === "teacher1") {
      currentUser = { role: "teacher", name: "المعلم" };
      hideAllScreens();
      teacherScreen.classList.remove("hidden");
      activateTab("review-tasks-tab"); // أول واجهة: مراجعة المهام + لوحة الشرف
      return;
    }

    // تجربة كطالب
    const studentRef = doc(db, "students", code);
    const studentSnap = await getDoc(studentRef);
    if (studentSnap.exists()) {
      const student = { code, ...studentSnap.data() };
      await displayStudentDashboard(student);
      return;
    }

    // تجربة كولي أمر (عن طريق البحث عن طلاب parent_code = code)
    const colRef = collection(db, "students");
    const q = query(colRef, where("parent_code", "==", code));
    const snap = await getDocs(q);

    if (!snap.empty) {
      currentUser = { role: "parent", code };
      await displayParentDashboard(code);
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
// ربط أزرار التحديث
if (refreshStudentButton) {
  refreshStudentButton.addEventListener("click", () => {
    refreshStudentView();
  });
}

if (refreshTeacherButton) {
  refreshTeacherButton.addEventListener("click", () => {
    refreshTeacherView();
  });
}

// =======================
// تهيئة أولية
// =======================

populateHifzSelects();
populateMurajaaStartSelect();
console.log("App ready. Curriculum loaded from external file.");


