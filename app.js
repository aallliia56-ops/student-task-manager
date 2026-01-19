// app.js
// =====================================================
// 1) Firebase + المناهج (Curriculum)
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

import { HIFZ_CURRICULUM, REVIEW_CURRICULUM, FLEXIBLE_HIFZ, FLEXIBLE_POINTS } from "./curriculum.js";

const firebaseConfig = {
  apiKey: "AIzaSyCeIcmuTd72sjiu1Uyijn_J4bMS0ChtXGo",
  authDomain: "studenttasksmanager.firebaseapp.com",
  projectId: "studenttasksmanager",
  storageBucket: "studenttasksmanager.firebasestorage.app",
  messagingSenderId: "850350680089",
  appId: "1:850350680089:web:51b71a710e938754bc6288",
  measurementId: "G-7QC4FVXKZG",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =====================================================
// 2) DOM Shortcuts + عناصر الواجهة
// =====================================================

const $ = (s) => document.querySelector(s);

// شاشة الدخول
const authScreen = $("#auth-screen");
const userCodeInput = $("#user-code");
const loginButton = $("#login-button");
const authMessage = $("#auth-message");

// تبويبات المعلم
const tabButtons = document.querySelectorAll(".tab-button");

// زر نوع الحلقة
const halaqaOnsiteBtn = $("#halaqa-onsite-btn");
const halaqaOnlineBtn = $("#halaqa-online-btn");

// شاشة الطالب
const studentScreen = $("#student-screen");
const welcomeStudent = $("#welcome-student");

const studentPlanStrip = $("#student-plan-strip");
const stripPlan = $("#strip-plan");
const stripPoints = $("#strip-points");
const stripRank = $("#strip-rank");
const studentPlanLine = $("#student-plan-line"); // احتياطي إن وُجد في HTML

const studentHifzNextLabel = $("#student-hifz-next-label");
const studentMurajaaNextLabel = $("#student-murajaa-next-label");

const studentHifzProgressLabel = $("#student-hifz-progress-label");
const studentMurajaaProgressLabel = $("#student-murajaa-progress-label");
const studentHifzProgressBar = $("#student-hifz-progress-bar");
const studentMurajaaProgressBar = $("#student-murajaa-progress-bar");
const studentHifzProgressPercent = $("#student-hifz-progress-percent");
const studentMurajaaProgressPercent = $("#student-murajaa-progress-percent");
const studentMurajaaLevelLabel = $("#student-murajaa-level-label");

const studentTotalPoints = $("#student-total-points");
const studentRankText = $("#student-rank-text");
const studentTasksDiv = $("#student-tasks");
const logoutButtonStudent = $("#logout-button-student");
const refreshStudentButton = $("#refresh-student-button");
const studentWeekStrip = $("#student-week-strip");

// تبويبات الطالب (مهامي / مهام المساعد)
const studentMainTasksSection = $("#student-main-tasks");
const studentAssistantTabSection = $("#student-assistant-tab");
const studentTabButtons = document.querySelectorAll(".student-tab-button");

// حاويات مهام المساعد
const studentAssistantTasksList = $("#student-assistant-tasks");
const parentAssistantTasksList = $("#parent-assistant-tasks");

// شاشة المعلم
const teacherScreen = $("#teacher-screen");
const logoutButtonTeacher = $("#logout-button-teacher");
const refreshTeacherButton = $("#refresh-teacher-button");

// تعيين المهام
const assignTaskStudentCode = $("#assign-task-student-code");
const assignTaskType = $("#assign-task-type");
const assignTaskDescription = $("#assign-task-description");
const assignTaskPoints = $("#assign-task-points");
const assignIndividualTaskButton = $("#assign-individual-task-button");
const assignGroupTaskButton = $("#assign-group-task-button");
const assignTaskMessage = $("#assign-task-message");

// إدارة الطلاب
const studentList = $("#student-list");
const studentFormTitle = $("#student-form-title");
const newStudentCodeInput = $("#new-student-code");
const newStudentNameInput = $("#new-student-name");
const newStudentParentNameInput = $("#new-student-parent-name");
const newStudentParentCodeInput = $("#new-student-parent-code");
const newStudentHifzStart = $("#new-student-hifz-start");
const newStudentHifzEnd = $("#new-student-hifz-end");
const newStudentHifzLevel = $("#new-student-hifz-level");
const newStudentMurajaaLevel = $("#new-student-murajaa-level");
const newStudentMurajaaStart = $("#new-student-murajaa-start");
const newStudentHalaqa = $("#new-student-halaqa");
const registerStudentButton = $("#register-student-button");
const registerStudentMessage = $("#register-student-message");

const newStudentHifzType = $("#new-student-hifz-type");
const newStudentFlexibleSurah = $("#new-student-flexible-surah");
const fixedHifzGroup = $("#fixed-hifz-group");
const flexibleSurahGroup = $("#flexible-surah-group");


// ✅ IDs الجديدة حسب HTML اللي عندك
const btnOpenStudentForm = document.getElementById("open-student-form");
const btnCloseStudentForm = document.getElementById("close-student-form");
const studentFormWrapper = document.getElementById("student-form-wrapper");
const halaqaSegment = document.getElementById("halaqa-segment");


// عرض المنهج + لوحة الشرف
const hifzCurriculumDisplay = $("#hifz-curriculum-display");
const murajaaCurriculumDisplay = $("#murajaa-curriculum-display");
const pendingTasksList = $("#pending-tasks-list");
const honorBoardDiv = $("#honor-board");

// شاشة ولي الأمر
const parentScreen = $("#parent-screen");
const welcomeParent = $("#welcome-parent");
const logoutButtonParent = $("#logout-button-parent");
const parentChildrenList = $("#parent-children-list");

// شاشة كود الحلقة (شبكة الطلاب)
const halaqaScreen = $("#halaqa-screen");
const halaqaTitle = $("#halaqa-title");
const halaqaSubtitle = $("#halaqa-subtitle");
const halaqaBackButton = $("#halaqa-back-button");
const halaqaStudentsGrid = $("#halaqa-students-grid");

// =====================================================
// 3) حالة عامة / متغيرات
// =====================================================

let currentUser = null;
let editingStudentCode = null;

// =====================================================
// ✅ Student Form (Open/Close) + Halaqa Segment
// =====================================================

function openStudentForm() {
  studentFormWrapper?.classList.remove("hidden");
  btnOpenStudentForm?.classList.add("hidden");
  btnCloseStudentForm?.classList.remove("hidden");

  // افتح كل الأقسام (details)
  studentFormWrapper?.querySelectorAll("details.form-section")
    .forEach(d => d.open = true);
}

function closeStudentForm() {
  studentFormWrapper?.classList.add("hidden");
  btnOpenStudentForm?.classList.remove("hidden");
  btnCloseStudentForm?.classList.add("hidden");
}

function setHalaqaSegment(value) {
  const v = value || "ONSITE";
  if (newStudentHalaqa) newStudentHalaqa.value = v;

  halaqaSegment?.querySelectorAll(".seg-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.value === v);
  });
}

// زر + إضافة طالب
btnOpenStudentForm?.addEventListener("click", () => {
  editingStudentCode = null;
  if (studentFormTitle) studentFormTitle.textContent = "إضافة طالب";
  openStudentForm();
});

// زر إغلاق
btnCloseStudentForm?.addEventListener("click", closeStudentForm);

// اختيار نوع الحلقة (حضوري/إلكتروني)
halaqaSegment?.addEventListener("click", (e) => {
  const b = e.target.closest(".seg-btn");
  if (!b) return;

  halaqaSegment.querySelectorAll(".seg-btn").forEach(x => x.classList.remove("active"));
  b.classList.add("active");

  if (newStudentHalaqa) newStudentHalaqa.value = b.dataset.value; // ONSITE / ONLINE
});


const HALAQA_LOGIN_CODES = {
  HALAQA_ONSITE: "ONSITE",
  HALAQA_ONLINE: "ONLINE",
};

let currentHalaqa = "ONSITE";

let lastStudentEntrySource = null; // DIRECT / HALAQA / null
let lastHalaqaLoginCode = null;
let lastHalaqaType = null;

// =====================================================
// 4) أدوات مساعدة عامة (Helpers)
// =====================================================

const safeSetText = (el, t = "") => el && (el.textContent = t);
const safeSetWidth = (el, pct = 0) => el && (el.style.width = `${pct}%`);

const getStudentEls = () => ({
  welcome: welcomeStudent,
  hifzLabel: studentHifzProgressLabel,
  murLabel: studentMurajaaProgressLabel,
  hifzBar: studentHifzProgressBar,
  murBar: studentMurajaaProgressBar,
  hifzPct: studentHifzProgressPercent,
  murPct: studentMurajaaProgressPercent,
  murLevel: studentMurajaaLevelLabel,
  totalPoints: studentTotalPoints,
  rankText: studentRankText,
});

const showMessage = (el, msg, type = "info") => {
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden", "error", "success", "info");
  el.classList.add(type);
  setTimeout(() => el.classList.add("hidden"), 5000);
};

function hideAllScreens() {
  authScreen?.classList.add("hidden");
  studentScreen?.classList.add("hidden");
  teacherScreen?.classList.add("hidden");
  parentScreen?.classList.add("hidden");
  halaqaScreen?.classList.add("hidden");
}

const generateUniqueId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const getReviewArrayForLevel = (level) => REVIEW_CURRICULUM[level] || [];

// بداية الأسبوع (الأحد)
function getWeekStart(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 أحد
  d.setDate(d.getDate() - day);
  return d;
}

// شريط التزام الأسبوع (أحد-خميس) — HTML جاهز
function buildWeekStripHtml(tasks) {
  const weekStart = getWeekStart(new Date());

  const daysMeta = [
    { offset: 0, label: "احد" },
    { offset: 1, label: "اثنين" },
    { offset: 2, label: "ثلاثاء" },
    { offset: 3, label: "اربعاء" },
    { offset: 4, label: "خميس" },
  ];

  return daysMeta
    .map(({ offset, label }) => {
      const dayStart = new Date(weekStart);
      dayStart.setDate(weekStart.getDate() + offset);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const hasCompleted = (Array.isArray(tasks) ? tasks : []).some((t) => {
        if (t.status !== "completed" || !t.completed_at) return false;
        const ts = t.completed_at;
        return ts >= dayStart.getTime() && ts <= dayEnd.getTime();
      });

      const cls = hasCompleted ? "week-day done" : "week-day";
      const icon = hasCompleted ? "✔" : "•";

      return `
        <div class="${cls}">
          <span class="week-day-label">${label}</span>
          <span class="week-day-icon">${icon}</span>
        </div>
      `;
    })
    .join("");
}

// رسم شريط الأسبوع في واجهة الطالب
function renderStudentWeekStrip(student) {
  if (!studentWeekStrip) return;
  const tasks = Array.isArray(student.tasks) ? student.tasks : [];
  studentWeekStrip.innerHTML = buildWeekStripHtml(tasks);
}

/** جلب جميع الطلاب مرتبين بالنقاط مع فلتر اختياري */
async function fetchAllStudentsSortedByPoints(filterFn) {
  const snap = await getDocs(collection(db, "students"));
  const arr = [];
  snap.forEach((d) => {
    const s = d.data();
    if (!filterFn || filterFn(s)) arr.push(s);
  });
  arr.sort((a, b) => (b.total_points || 0) - (a.total_points || 0));
  return arr;
}

function isInCurrentHalaqa(student) {
  const h = student.halaqa || "ONSITE";
  return h === currentHalaqa;
}

function updateHalaqaToggleUI() {
  if (!halaqaOnsiteBtn || !halaqaOnlineBtn) return;
  halaqaOnsiteBtn.classList.toggle("active", currentHalaqa === "ONSITE");
  halaqaOnlineBtn.classList.toggle("active", currentHalaqa === "ONLINE");
}

function computeRankMapForGroup(students) {
  const sorted = [...students].sort(
    (a, b) => (b.total_points || 0) - (a.total_points || 0)
  );
  const rankMap = {};
  let lastPts = null;
  let currentRank = 0;

  sorted.forEach((s, i) => {
    const pts = s.total_points || 0;
    if (lastPts === null) currentRank = 1;
    else if (pts < lastPts) currentRank = i + 1;
    rankMap[s.code] = currentRank;
    lastPts = pts;
  });

  return { sorted, rankMap };
}

function buildGroupedRanks(students) {
  const building = [];
  const devAdv = [];

  students.forEach((s) => {
    const level = s.murajaa_level || "BUILDING";
    if (level === "BUILDING") building.push(s);
    else devAdv.push(s);
  });

  const { sorted: buildingSorted, rankMap: buildingRankMap } =
    computeRankMapForGroup(building);
  const { sorted: devAdvSorted, rankMap: devAdvRankMap } =
    computeRankMapForGroup(devAdv);

  return { buildingSorted, buildingRankMap, devAdvSorted, devAdvRankMap };
}

function updatePlanStrip({ startSurah = "—", endSurah = "—", points = 0, rank = "—" }) {
  if (studentPlanLine) {
    studentPlanLine.textContent = `الخطة: من ${startSurah} إلى ${endSurah} • النقاط: ${points} • الترتيب: ${rank}`;
  }
  safeSetText(stripPlan, `الخطة: من ${startSurah} إلى ${endSurah}`);
  safeSetText(stripPoints, `النقاط: ${points}`);
  safeSetText(stripRank, `الترتيب: ${rank}`);
}

// =====================================================
// 5) منهج الحفظ والمراجعة (Missions / Percent)
// =====================================================

function getCurrentHifzMission(student) {
  const mode = student.hifz_mode || "fixed";

  // =====================================================
  // ✅ 1) المنهج المرن
  // =====================================================
  if (mode === "flexible") {
    const surahIdx = Number.isFinite(student.flex_surah_index) ? student.flex_surah_index : 0;
    const surah = FLEXIBLE_HIFZ[surahIdx];
    if (!surah) return null;

    const nextAyah = Number.isFinite(student.flex_next_ayah) ? student.flex_next_ayah : surah.start_ayah;

    // لو خلص السورة فعليًا (احتياط)
    if (nextAyah > surah.end_ayah) {
      const nextSurahIdx = surahIdx + 1;
      const nextSurah = FLEXIBLE_HIFZ[nextSurahIdx];
      if (!nextSurah) return null;
      return {
        type: "hifz_flexible",
        mode: "flexible",
        surahIdx: nextSurahIdx,
        surah_number: nextSurah.surah_number,
        surah_name_ar: nextSurah.surah_name_ar,
        startAyah: nextSurah.start_ayah,
        endAyahMax: nextSurah.end_ayah,
        points: FLEXIBLE_POINTS,
        description: `${nextSurah.surah_name_ar} (اختر من ${nextSurah.start_ayah} إلى ${nextSurah.end_ayah})`,
      };
    }

    return {
      type: "hifz_flexible",
      mode: "flexible",
      surahIdx,
      surah_number: surah.surah_number,
      surah_name_ar: surah.surah_name_ar,
      startAyah: nextAyah,          // ✅ بداية ثابتة = نقطة توقفه
      endAyahMax: surah.end_ayah,   // ✅ النهاية يختارها الطالب
      points: FLEXIBLE_POINTS,
      description: `${surah.surah_name_ar} (ابدأ من ${nextAyah} واختر النهاية حتى ${surah.end_ayah})`,
    };
  }

  // =====================================================
  // ✅ 2) المنهج الثابت (نفس كودك السابق بدون تغيير)
  // =====================================================
  const all = HIFZ_CURRICULUM;
  if (!all?.length) return null;

  const planStart = student.hifz_start_id ?? 0;
  const planEnd = student.hifz_end_id ?? all.length - 1;

  let nextIndex = student.hifz_progress ?? planStart;
  if (nextIndex < planStart) nextIndex = planStart;
  if (nextIndex > planEnd) return null;

  const tasks = Array.isArray(student.tasks) ? student.tasks : [];

  const prevIndex = nextIndex - 1;
  if (prevIndex >= planStart && prevIndex <= planEnd) {
    const prevSeg = all[prevIndex];

    let first = prevIndex;
    while (first - 1 >= planStart && all[first - 1].surah_number === prevSeg.surah_number) first--;

    let last = prevIndex;
    while (last + 1 <= planEnd && all[last + 1].surah_number === prevSeg.surah_number) last++;

    const segmentsCount = last - first + 1;

    if (segmentsCount > 1 && prevIndex === last) {
      const alreadyCompletedFull = tasks.some(
        (t) =>
          t.type === "hifz" &&
          t.mission_start === first &&
          t.mission_last === last &&
          t.status === "completed"
      );

      if (!alreadyCompletedFull) {
        const firstSeg = all[first];
        const lastSeg = all[last];

        return {
          type: "hifz",
          startIndex: first,
          lastIndex: last,
          isFullSurah: true,
          description: `${firstSeg.surah_name_ar} كاملة (${firstSeg.start_ayah}-${lastSeg.end_ayah})`,
          points: firstSeg.points || 5,
        };
      }
    }
  }

  const level = +student.hifz_level || 1;
  const maxSegments = Math.max(1, Math.min(3, level));

  const first = all[nextIndex];
  const segs = [first];

  for (let i = nextIndex + 1; i <= planEnd && segs.length < maxSegments; i++) {
    const seg = all[i];
    if (seg.surah_number !== first.surah_number) break;
    segs.push(seg);
  }

  const last = segs[segs.length - 1];

  return {
    type: "hifz",
    startIndex: nextIndex,
    lastIndex: nextIndex + segs.length - 1,
    description: `${first.surah_name_ar} (${first.start_ayah}-${last.end_ayah})`,
    points: first.points || 5,
  };
}


function getNextHifzMission(student) {
  const all = HIFZ_CURRICULUM;
  if (!all?.length) return null;

  const cur = getCurrentHifzMission(student);
  if (!cur) return null;

  const planEnd = student.hifz_end_id ?? all.length - 1;
  const candidate = cur.lastIndex + 1;
  if (candidate > planEnd || !all[candidate]) return null;

  const level = +student.hifz_level || 1;
  const maxSegments = Math.max(1, Math.min(3, level));

  const first = all[candidate];
  const segs = [first];

  for (let i = candidate + 1; i < all.length && i <= planEnd && segs.length < maxSegments; i++) {
    const seg = all[i];
    if (seg.surah_number !== first.surah_number) break;
    segs.push(seg);
  }

  const last = segs[segs.length - 1];
  return {
    type: "hifz",
    startIndex: candidate,
    lastIndex: candidate + segs.length - 1,
    description: `${first.surah_name_ar} (${first.start_ayah}-${last.end_ayah})`,
    points: first.points || 5,
  };
}

function getCurrentMurajaaMission(student) {
  const level = student.murajaa_level || "BUILDING";
  const arr = getReviewArrayForLevel(level);
  if (!arr?.length) return null;
  const len = arr.length;
  const start = ((student.murajaa_start_index ?? 0) % len + len) % len;
  let index = student.murajaa_progress_index;
  if (index == null) index = start;
  index = ((index % len) + len) % len;

  const item = arr[index];
  return {
    type: "murajaa",
    level,
    index,
    description: item.name,
    points: item.points || 3,
  };
}

function getNextMurajaaMission(student) {
  const level = student.murajaa_level || "BUILDING";
  const arr = getReviewArrayForLevel(level);
  if (!arr?.length) return null;

  const len = arr.length;
  const start = ((student.murajaa_start_index ?? 0) % len + len) % len;
  let idx = student.murajaa_progress_index ?? start;
  idx = ((idx % len) + len) % len;

  const nextIndex = (idx + 1) % len;
  const item = arr[nextIndex];
  return {
    type: "murajaa",
    level,
    index: nextIndex,
    description: item.name,
    points: item.points || 3,
  };
}

function computeHifzPercent(student) {
  const all = HIFZ_CURRICULUM;
  if (!all?.length) return 0;
  const start = student.hifz_start_id ?? 0;
  const end = student.hifz_end_id ?? all.length - 1;
  const span = Math.max(1, end - start + 1);
  const prog = student.hifz_progress ?? start;
  const done = Math.max(0, Math.min(prog - start, span));
  return Math.round((done / span) * 100);
}

function computeMurajaaPercent(student) {
  const arr = getReviewArrayForLevel(student.murajaa_level || "BUILDING");
  if (!arr?.length) return 0;
  const len = arr.length;
  const start = (student.murajaa_start_index ?? 0) % len;
  let prog = student.murajaa_progress_index ?? start;
  prog = ((prog % len) + len) % len;
  const dist = (prog - start + len) % len;
  return Math.round((dist / len) * 100);
}

function getLastFullSurahNumber(student) {
  const all = HIFZ_CURRICULUM;
  if (!all?.length) return null;

  const planStart = student.hifz_start_id ?? 0;
  const planEnd = student.hifz_end_id ?? all.length - 1;
  const progress = student.hifz_progress ?? planStart;

  if (progress <= planStart) return null;

  let i = Math.min(progress - 1, planEnd);

  while (i >= planStart) {
    const sNum = all[i].surah_number;

    let first = i;
    while (first - 1 >= planStart && all[first - 1].surah_number === sNum) first--;

    let last = i;
    while (last + 1 <= planEnd && all[last + 1].surah_number === sNum) last++;

    if (last < progress) return sNum;

    i = first - 1;
  }

  return null;
}

function chooseMurajaaStartIndexFromLastSurah(level, lastSurahNumber, fallbackStart) {
  const arr = getReviewArrayForLevel(level);
  const len = arr.length;
  if (!len) return 0;

  if (!lastSurahNumber) return ((fallbackStart % len) + len) % len;

  const surahSeg = HIFZ_CURRICULUM.find((seg) => seg.surah_number === lastSurahNumber);
  const surahName = surahSeg?.surah_name_ar;
  if (!surahName) return ((fallbackStart % len) + len) % len;

  let idx = arr.findIndex((it) => {
    const name = typeof it === "string" ? it : it?.name;
    return typeof name === "string" && name.includes(surahName);
  });

  if (idx === -1) idx = ((fallbackStart % len) + len) % len;
  return idx;
}

// =====================================================
// 6) مهام المساعد (Student/Parent Assistants)
// =====================================================

async function loadAssistantTasksForCurrentUser() {
  if (!currentUser) return;

  const snap = await getDocs(collection(db, "students"));
  const assigned = [];

  snap.forEach((docSnap) => {
    const s = docSnap.data();
    const tasks = Array.isArray(s.tasks) ? s.tasks : [];
    tasks.forEach((t) => {
      if (t.status !== "pending_assistant") return;

      if (
        currentUser.role === "student" &&
        t.assistant_type === "student" &&
        t.assistant_code === currentUser.code
      ) {
        assigned.push({ student: s, task: t });
      } else if (
        currentUser.role === "parent" &&
        t.assistant_type === "parent" &&
        String(t.assistant_code || "") === String(currentUser.code)
      ) {
        assigned.push({ student: s, task: t });
      }
    });
  });

  if (currentUser.role === "student") {
    if (!studentAssistantTasksList) return;
    renderAssistantTasksList(assigned, studentAssistantTasksList, "طالب");
  } else if (currentUser.role === "parent") {
    if (!parentAssistantTasksList) return;
    renderAssistantTasksList(assigned, parentAssistantTasksList, "ولي الأمر");
  }
}

function renderAssistantTasksList(list, container, roleLabel) {
  if (!container) return;
  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = '<p class="message info">لا توجد مهام مسندة لك حاليًا.</p>';
    return;
  }

  list.forEach(({ student, task }) => {
    const block = document.createElement("div");
    block.className = "review-student-block";

    const title = document.createElement("div");
    title.className = "review-student-title";
    title.textContent = `الطالب: ${student.name} (${student.code})`;
    block.appendChild(title);

    const item = document.createElement("div");
    item.className = `review-task-item ${task.type}`;
    item.innerHTML = `
      <div class="review-task-body" style="
        font-size:1.05rem;
        font-weight:800;
        line-height:1.8;
        color:#2c3e50;
      ">
        ${task.description || ""}
      </div>

      <div class="review-task-header" style="
        margin-top:4px;
        font-size:.8rem;
        font-weight:700;
        color:#6b7280;
      ">
        مسندة لمساعد ${roleLabel}
      </div>
    `;

    const footer = document.createElement("div");
    footer.className = "review-task-footer";

    const pts = document.createElement("span");
    pts.className = "review-points-badge";
    pts.textContent = `${task.points || 0}`;

    const ok = document.createElement("button");
    ok.className = "button success";
    ok.textContent = "☑";
    ok.title = "قبول";
    ok.addEventListener("click", async () => {
      await reviewTask(student.code, task.id, "approve");
      await loadAssistantTasksForCurrentUser();
    });

    const no = document.createElement("button");
    no.className = "button danger";
    no.textContent = "✕";
    no.title = "رفض";
    no.addEventListener("click", async () => {
      await reviewTask(student.code, task.id, "reject");
      await loadAssistantTasksForCurrentUser();
    });

    footer.append(pts, ok, no);
    item.appendChild(footer);
    block.appendChild(item);
    container.appendChild(block);
  });
}

async function forwardTaskToAssistant(studentCode, taskId, assistantType, assistantId) {
  try {
    if (!assistantType || !assistantId) {
      alert("الرجاء اختيار مساعد صحيح.");
      return;
    }

    const studentRef = doc(db, "students", studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;

    const student = snap.data();
    const tasks = Array.isArray(student.tasks) ? student.tasks : [];
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return;

    const task = tasks[idx];
    if (task.status !== "pending") {
      showMessage(authMessage, "لا يمكن توجيه مهمة ليست بانتظار المراجعة لدى المعلم.", "error");
      return;
    }

    tasks[idx] = {
      ...task,
      status: "pending_assistant",
      assistant_type: assistantType,
      assistant_code: assistantId,
    };

    await updateDoc(studentRef, { tasks });
    await loadPendingTasksForReview();
    showMessage(authMessage, "تم توجيه المهمة للمساعد.", "success");
  } catch (e) {
    console.error("Error forwardTaskToAssistant:", e);
    showMessage(authMessage, `خطأ في توجيه المهمة: ${e.message}`, "error");
  }
}

async function showAssistantSelector(studentCode, taskId, containerEl) {
  try {
    const existing = containerEl.querySelector(".assistant-picker");
    if (existing) {
      existing.remove();
      return;
    }

    const snapAll = await getDocs(collection(db, "students"));
    const assistants = [];

    snapAll.forEach((d) => {
      const s = d.data();
      const h = s.halaqa || "ONSITE";
      if (h !== currentHalaqa) return;

      if (s.is_student_assistant) {
        assistants.push({
          type: "student",
          id: s.code,
          label: `طالب: ${s.name || s.code} (${s.code})`,
        });
      }

      if (s.is_parent_assistant && s.parent_code) {
        assistants.push({
          type: "parent",
          id: String(s.parent_code),
          label: `ولي: ${s.parent_name || s.parent_code} (${s.parent_code})`,
        });
      }
    });

    if (!assistants.length) {
      alert("لا يوجد مساعدين مفعّلين في هذه الحلقة.");
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "assistant-picker";
    wrapper.style.marginTop = "6px";
    wrapper.style.display = "flex";
    wrapper.style.flexWrap = "wrap";
    wrapper.style.gap = "6px";

    const select = document.createElement("select");
    select.style.flex = "1";
    assistants.forEach((a, idx) => {
      const opt = document.createElement("option");
      opt.value = `${a.type}|${a.id}`;
      opt.textContent = a.label;
      if (idx === 0) opt.selected = true;
      select.appendChild(opt);
    });

    const sendBtn = document.createElement("button");
    sendBtn.className = "button success";
    sendBtn.textContent = "تأكيد التوجيه ✅";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "button";
    cancelBtn.textContent = "إلغاء";

    sendBtn.addEventListener("click", async () => {
      const [assistantType, assistantId] = select.value.split("|");
      await forwardTaskToAssistant(studentCode, taskId, assistantType, assistantId);
      wrapper.remove();
    });

    cancelBtn.addEventListener("click", () => wrapper.remove());

    wrapper.append(select, sendBtn, cancelBtn);
    containerEl.appendChild(wrapper);
  } catch (e) {
    console.error("Error showAssistantSelector:", e);
    showMessage(authMessage, `خطأ في تحميل قائمة المساعدين: ${e.message}`, "error");
  }
}

// =====================================================
// 7) بناء كروت الطالب (Student Tasks Cards)
// =====================================================

function buildMissionCard({
  title,
  tagClass,
  description,
  points,
  pendingText,
  buttonText,
  onClick,
  disabled = false,
}) {
  const card = document.createElement("div");
  card.className = "task-card";
  card.innerHTML = `
    <div class="task-header">
      <div class="task-title">${title}</div>
      <span class="task-type-tag ${tagClass}">${tagClass === "hifz" ? "حفظ" : "مراجعة"}</span>
    </div>
    <div class="task-body mission-text">${description}</div>
    <div class="task-footer">
      <span class="task-points-tag">النقاط: ${points}</span>
      <span class="task-status-text">${pendingText}</span>
    </div>
  `;

  const footer = card.querySelector(".task-footer");
  const btn = document.createElement("button");
  btn.className = "button success";
  btn.textContent = buttonText;

  if (disabled) btn.disabled = true;
  else btn.addEventListener("click", onClick);

  footer.appendChild(btn);
  return card;
}

function renderStudentTasks(student) {
  studentTasksDiv.innerHTML = "";
  const tasksArray = Array.isArray(student.tasks) ? student.tasks : [];
  const wrap = document.createElement("div");

  const hifzPaused = !!student.pause_hifz;
  const murajaaPaused = !!student.pause_murajaa;

  // مهمة الحفظ
  const hifzMission = !hifzPaused ? getCurrentHifzMission(student) : null;

  if (hifzMission) {
    // ✅ المنهج المرن
    if (hifzMission.mode === "flexible") {
      const pendingFlex = tasksArray.find(
        (t) =>
          t.type === "hifz_flexible" &&
          (t.status === "pending" || t.status === "pending_assistant") &&
          t.flex_surah_index === hifzMission.surahIdx &&
          t.flex_start_ayah === hifzMission.startAyah
      );

      const isAssistantPending = pendingFlex && pendingFlex.status === "pending_assistant";

      const card = document.createElement("div");
      card.className = "task-card";
      card.innerHTML = `
        <div class="task-header">
          <div class="task-title">🎯 الحفظ (منهج مرن)</div>
          <span class="task-type-tag hifz">حفظ</span>
        </div>

        <div class="task-body mission-text" style="line-height:1.9">
          <div style="font-weight:800">${hifzMission.surah_name_ar}</div>
          <div>من آية: <strong>${hifzMission.startAyah}</strong></div>
          <div style="margin-top:6px">
            إلى آية:
            <select id="flex-end-ayah" style="padding:6px;border-radius:10px">
              ${Array.from(
                { length: hifzMission.endAyahMax - hifzMission.startAyah + 1 },
                (_, k) => {
                  const v = hifzMission.startAyah + k;
                  return `<option value="${v}">${v}</option>`;
                }
              ).join("")}
            </select>
          </div>
        </div>

        <div class="task-footer">
          <span class="task-points-tag">النقاط: ${hifzMission.points}</span>
          <span class="task-status-text">${
            pendingFlex
              ? isAssistantPending
                ? "قيد المراجعة لدى المساعد..."
                : "قيد المراجعة لدى المعلم..."
              : ""
          }</span>
        </div>
      `;

      const footer = card.querySelector(".task-footer");
      const btn = document.createElement("button");
      btn.className = "button success";

      if (pendingFlex) {
        btn.textContent = isAssistantPending ? "قيد المراجعة" : "إلغاء الإرسال";
        btn.disabled = !!isAssistantPending;

        if (!isAssistantPending) {
          btn.addEventListener("click", () =>
            cancelCurriculumTask(student.code, "hifz_flexible", pendingFlex.id)
          );
        }
      } else {
        btn.textContent = "أنجزت المهمة ✅";
        btn.addEventListener("click", () => {
          const endAyah = parseInt(card.querySelector("#flex-end-ayah").value, 10);
          submitFlexibleHifzTask(student.code, hifzMission, endAyah);
        });
      }

      footer.appendChild(btn);
      wrap.appendChild(card);
    } else {
      // ✅ المنهج الثابت
      const pendingCurriculumTask = tasksArray.find(
        (t) =>
          t.type === "hifz" &&
          (t.status === "pending" || t.status === "pending_assistant") &&
          t.mission_start === hifzMission.startIndex
      );

      const isAssistantPending =
        pendingCurriculumTask && pendingCurriculumTask.status === "pending_assistant";

      wrap.appendChild(
        buildMissionCard({
          title: "🎯 الحفظ",
          tagClass: "hifz",
          description: hifzMission.description,
          points: hifzMission.points,
          pendingText: pendingCurriculumTask
            ? isAssistantPending
              ? "قيد المراجعة لدى المساعد..."
              : "قيد المراجعة لدى المعلم..."
            : "",
          buttonText: pendingCurriculumTask
            ? isAssistantPending
              ? "قيد المراجعة"
              : "إلغاء الإرسال"
            : "أنجزت المهمة ✅",
          disabled: !!pendingCurriculumTask && isAssistantPending,
          onClick: () =>
            pendingCurriculumTask
              ? !isAssistantPending &&
                cancelCurriculumTask(student.code, "hifz", hifzMission.startIndex)
              : submitCurriculumTask(student.code, hifzMission),
        })
      );
    }
  }

  // مهمة المراجعة
  const murMission = !murajaaPaused ? getCurrentMurajaaMission(student) : null;

  if (murMission) {
    const pendingMurTask = tasksArray.find(
      (t) =>
        t.type === "murajaa" &&
        (t.status === "pending" || t.status === "pending_assistant") &&
        t.murajaa_index === murMission.index &&
        t.murajaa_level === murMission.level
    );

    const isAssistantPending = pendingMurTask && pendingMurTask.status === "pending_assistant";

    wrap.appendChild(
      buildMissionCard({
        title: "📖 المراجعة",
        tagClass: "murajaa",
        description: murMission.description,
        points: murMission.points,
        pendingText: pendingMurTask
          ? isAssistantPending
            ? "قيد المراجعة لدى المساعد..."
            : "قيد المراجعة لدى المعلم..."
          : "",
        buttonText: pendingMurTask
          ? isAssistantPending
            ? "قيد المراجعة"
            : "إلغاء الإرسال"
          : "أنجزت المهمة ✅",
        disabled: !!pendingMurTask && isAssistantPending,
        onClick: () =>
          pendingMurTask
            ? !isAssistantPending && cancelMurajaaTask(student.code, murMission)
            : submitMurajaaTask(student.code, murMission),
      })
    );
  }

  // المهام العامة
  const generalTasks = tasksArray.filter((t) => t.type === "general" && t.status !== "completed");

  for (const task of generalTasks) {
    const card = document.createElement("div");
    card.className = "task-card";
    card.innerHTML = `
      <div class="task-header">
        <div class="task-title">${task.description}</div>
        <span class="task-type-tag general">عامة</span>
      </div>
      <div class="task-body">مهمة عامة من المعلم.</div>
      <div class="task-footer">
        <span class="task-points-tag">النقاط: ${task.points}</span>
        <span class="task-status-text">${
          task.status === "pending"
            ? "قيد المراجعة لدى المعلم..."
            : task.status === "pending_assistant"
            ? "قيد المراجعة لدى المساعد..."
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
      btn.addEventListener("click", () => submitGeneralTask(student.code, task.id));
    } else if (task.status === "pending") {
      btn.textContent = "إلغاء الإرسال";
      btn.addEventListener("click", () => cancelGeneralTask(student.code, task.id));
    } else if (task.status === "pending_assistant") {
      btn.textContent = "قيد المراجعة";
      btn.disabled = true;
    } else {
      btn.textContent = "منجزة";
      btn.disabled = true;
    }

    footer.appendChild(btn);
    wrap.appendChild(card);
  }

  if (!hifzMission && !murMission && !hifzPaused && !murajaaPaused && generalTasks.length === 0) {
    studentTasksDiv.innerHTML = '<p class="message info">لا توجد مهام حالياً. وفقك الله 🤍</p>';
  } else {
    studentTasksDiv.appendChild(wrap);
  }
}

// =====================================================
// 8) لوحات الطالب / ولي الأمر / الحلقة
// =====================================================

async function displayStudentDashboard(student) {
  try {
    const els = getStudentEls();
    safeSetText(els.welcome, `أهلاً بك يا ${student.name || "طالب"}`);

    const startIdx = student.hifz_start_id ?? 0;
    const endIdx = student.hifz_end_id ?? HIFZ_CURRICULUM.length - 1;
    const startItem = HIFZ_CURRICULUM[startIdx];
    const endItem = HIFZ_CURRICULUM[endIdx];
    const startSurah = startItem ? startItem.surah_name_ar : "—";
    const endSurah = endItem ? endItem.surah_name_ar : "—";
    const points = student.total_points || 0;

    const studentHalaqa = student.halaqa || "ONSITE";
    const allStudents = await fetchAllStudentsSortedByPoints();
    const sameHalaqa = allStudents.filter((s) => (s.halaqa || "ONSITE") === studentHalaqa);

    const level = student.murajaa_level || "BUILDING";
    let rankOnly = "—";

    if (level === "BUILDING") {
      const buildingGroup = sameHalaqa.filter((s) => (s.murajaa_level || "BUILDING") === "BUILDING");
      const idx = buildingGroup.findIndex((s) => s.code === student.code);
      if (idx !== -1) rankOnly = String(idx + 1);
    } else {
      const devAdvGroup = sameHalaqa.filter((s) => {
        const lv = s.murajaa_level || "BUILDING";
        return lv === "DEVELOPMENT" || lv === "ADVANCED";
      });
      const idx = devAdvGroup.findIndex((s) => s.code === student.code);
      if (idx !== -1) rankOnly = String(idx + 1);
    }

    updatePlanStrip({ startSurah, endSurah, points, rank: rankOnly });

    const hifzMission = getCurrentHifzMission(student);
    const murMission = getCurrentMurajaaMission(student);

    safeSetText(els.hifzLabel, hifzMission ? hifzMission.description : "لا توجد مهمة حفظ حالياً.");
    safeSetText(els.murLabel, murMission ? murMission.description : "لا توجد مهمة مراجعة حالياً.");

    if (els.murLevel) {
      safeSetText(
        els.murLevel,
        murMission
          ? murMission.level === "BUILDING"
            ? "البناء"
            : murMission.level === "DEVELOPMENT"
            ? "التطوير"
            : "المتقدم"
          : "غير محدد"
      );
    }

    const nextH = getNextHifzMission(student);
    const nextM = getNextMurajaaMission(student);
    safeSetText(studentHifzNextLabel, `المهمة القادمة: ${nextH ? nextH.description : "—"}`);
    safeSetText(studentMurajaaNextLabel, `المهمة القادمة: ${nextM ? nextM.description : "—"}`);

    const hifzPct = computeHifzPercent(student);
    const murPct = computeMurajaaPercent(student);
    safeSetText(els.hifzPct, hifzPct);
    safeSetText(els.murPct, murPct);
    safeSetWidth(els.hifzBar, hifzPct);
    safeSetWidth(els.murBar, murPct);

    safeSetText(els.totalPoints, points);
    safeSetText(els.rankText, rankOnly);

    renderStudentTasks(student);
    renderStudentWeekStrip(student);

    hideAllScreens();
    studentScreen.classList.remove("hidden");

    if (student.is_student_assistant) {
      await loadAssistantTasksForCurrentUser();
    } else if (studentAssistantTasksList) {
      studentAssistantTasksList.innerHTML = "";
    }
  } catch (err) {
    console.error("displayStudentDashboard error:", err);
    showMessage(authMessage, `خطأ في عرض واجهة الطالب: ${err.message}`, "error");
  }
}

async function displayParentDashboard(parentCode) {
  try {
    const snap = await getDocs(collection(db, "students"));
    const all = [];
    snap.forEach((d) => all.push(d.data()));

    const parentKey = String(parentCode || "");
    const children = all.filter((s) => String(s.parent_code || "") === parentKey);

    const halaqaBuckets = { ONSITE: [], ONLINE: [] };
    all.forEach((s) => {
      const h = s.halaqa || "ONSITE";
      if (!halaqaBuckets[h]) halaqaBuckets[h] = [];
      halaqaBuckets[h].push(s);
    });

    const ranksByHalaqa = {};
    Object.keys(halaqaBuckets).forEach((h) => {
      const arr = halaqaBuckets[h];
      if (!arr.length) return;
      ranksByHalaqa[h] = buildGroupedRanks(arr);
    });

    welcomeParent.textContent = `مرحبًا بك يا ولي الأمر (${parentKey})`;
    parentChildrenList.innerHTML = "";

    if (!children.length) {
      parentChildrenList.innerHTML = '<p class="message info">لا يوجد أبناء مربوطون بهذا الرمز.</p>';
    } else {
      children.forEach((s) => {
        const h = s.halaqa || "ONSITE";
        const { buildingRankMap = {}, devAdvRankMap = {} } = ranksByHalaqa[h] || {};

        const level = s.murajaa_level || "BUILDING";
        let groupTitle;
        let childRank = "-";

        if (level === "BUILDING") {
          groupTitle = "مجموعة البناء (نفس الحلقة)";
          if (buildingRankMap[s.code] != null) childRank = String(buildingRankMap[s.code]);
        } else {
          groupTitle = "مجموعة التطوير/المتقدم (نفس الحلقة)";
          if (devAdvRankMap[s.code] != null) childRank = String(devAdvRankMap[s.code]);
        }

        const startIndex = Number.isFinite(s.hifz_start_id) ? s.hifz_start_id : 0;
        const endIndex = Number.isFinite(s.hifz_end_id) ? s.hifz_end_id : HIFZ_CURRICULUM.length - 1;
        const startItem = HIFZ_CURRICULUM[startIndex] || null;
        const endItem = HIFZ_CURRICULUM[endIndex] || null;
        const startSurah = startItem ? startItem.surah_name_ar : "غير محددة";
        const endSurah = endItem ? endItem.surah_name_ar : "غير محددة";

        const hifzPercent = computeHifzPercent(s);
        let motivation = "🔵 في بداية الطريق";
        if (hifzPercent >= 75) motivation = "🟢 قارب على إنهاء خطته";
        else if (hifzPercent >= 30) motivation = "🟡 في منتصف الخطة";

        const hifzMission = getCurrentHifzMission(s);
        const murMission = getCurrentMurajaaMission(s);

        const halaqaLabel = h === "ONLINE" ? "حلقة إلكترونية" : "حلقة حضوري";

        const el = document.createElement("div");
        el.className = "child-card";
        el.innerHTML = `
          <div class="child-name">${s.name} (${s.code})</div>
          <div class="child-line"><strong>${halaqaLabel}</strong></div>
          <div class="child-line">خطة الحفظ: من سورة <strong>${startSurah}</strong> إلى سورة <strong>${endSurah}</strong></div>
          <div class="child-line">إنجاز الحفظ: <strong>${hifzPercent}%</strong></div>
          <div class="progress-bar"><div class="progress-fill" style="width:${hifzPercent}%"></div></div>
          <div class="child-line">${motivation}</div>
          <div class="child-line">مجموع النقاط: <strong>${s.total_points || 0}</strong></div>
          <div class="child-line">الترتيب داخل ${groupTitle}: <strong>${childRank}</strong></div>
          <div class="child-line">مهمة الحفظ الحالية: <span>${hifzMission ? hifzMission.description : "لا توجد"}</span></div>
          <div class="child-line">مهمة المراجعة الحالية: <span>${murMission ? murMission.description : "لا توجد"}</span></div>
          <div class="week-strip"></div>
        `;

        const weekDiv = el.querySelector(".week-strip");
        weekDiv.innerHTML = buildWeekStripHtml(Array.isArray(s.tasks) ? s.tasks : []);
        parentChildrenList.appendChild(el);
      });
    }

    hideAllScreens();
    parentScreen.classList.remove("hidden");

    const isParentAssistant = all.some(
      (s) =>
        s.is_parent_assistant &&
        String(s.parent_code || "") === parentKey &&
        s.halaqa === currentHalaqa
    );

    if (isParentAssistant) {
      await loadAssistantTasksForCurrentUser();
    } else if (parentAssistantTasksList) {
      parentAssistantTasksList.innerHTML = "";
    }
  } catch (e) {
    console.error("Error displayParentDashboard:", e);
    parentChildrenList.innerHTML = `<p class="message error">خطأ في تحميل بيانات الأبناء: ${e.message}</p>`;
  }
}

async function displayHalaqaScreen(loginCode, halaqaType) {
  try {
    hideAllScreens();
    halaqaScreen.classList.remove("hidden");

    const halaqaLabel = halaqaType === "ONLINE" ? "الحلقة الإلكترونية" : "الحلقة الحضورية";
    safeSetText(halaqaTitle, `حسابات ${halaqaLabel}`);
    safeSetText(halaqaSubtitle, `: ${loginCode}`);

    const snap = await getDocs(collection(db, "students"));
    const allStudents = [];
    snap.forEach((docSnap) => {
      const s = docSnap.data();
      const h = s.halaqa || "ONSITE";
      if (h !== halaqaType) return;
      allStudents.push(s);
    });

    if (!allStudents.length) {
      halaqaStudentsGrid.innerHTML = `<p class="message info">لا يوجد طلاب مسجلون في هذه الحلقة.</p>`;
      return;
    }

    allStudents.sort((a, b) => {
      const aCode = a.code || "";
      const bCode = b.code || "";
      const aNum = parseInt(aCode, 10);
      const bNum = parseInt(bCode, 10);
      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
      return String(aCode).localeCompare(String(bCode), "ar");
    });

    halaqaStudentsGrid.innerHTML = "";
    allStudents.forEach((s) => {
      const tile = document.createElement("div");
      tile.className = "halaqa-tile";
      tile.dataset.code = s.code;
      tile.innerHTML = `
        <div class="halaqa-tile-code">${s.code}</div>
        <div class="halaqa-tile-line">${s.name}</div>
      `;
      halaqaStudentsGrid.appendChild(tile);
    });
  } catch (e) {
    console.error("displayHalaqaScreen error:", e);
    halaqaStudentsGrid.innerHTML = `<p class="message error">حدث خطأ في تحميل طلاب الحلقة: ${e.message}</p>`;
  }
}

// =====================================================
// 9) لوحة الشرف (Honor Board)
// =====================================================

async function loadHonorBoard() {
  if (!honorBoardDiv) return;

  honorBoardDiv.innerHTML = '<p class="message info">جارٍ تحميل لوحة الشرف...</p>';

  try {
    const snap = await getDocs(collection(db, "students"));
    const all = [];

    snap.forEach((docSnap) => {
      const s = docSnap.data();
      if (!isInCurrentHalaqa(s)) return;
      all.push(s);
    });

    if (!all.length) {
      honorBoardDiv.innerHTML = '<p class="message info">لا يوجد طلاب في هذه الحلقة حتى الآن.</p>';
      return;
    }

    const { buildingSorted, devAdvSorted } = buildGroupedRanks(all);
    const topBuilding = buildingSorted.slice(0, 5);
    const topDevAdv = devAdvSorted.slice(0, 5);

    const container = document.createElement("div");

    const makeSection = (title, studentsList) => {
      const section = document.createElement("div");
      const h = document.createElement("h4");
      h.textContent = title;
      section.appendChild(h);

      if (!studentsList.length) {
        const p = document.createElement("p");
        p.className = "info-text";
        p.textContent = "لا يوجد طلاب في هذا المستوى حتى الآن.";
        section.appendChild(p);
        return section;
      }

      const ul = document.createElement("ul");
      ul.className = "honor-list";

      studentsList.forEach((s, idx) => {
        const li = document.createElement("li");
        const rank = idx + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : "rank-other";
        li.className = `honor-item ${rankClass}`;

        const level = s.murajaa_level || "BUILDING";
        let levelName = "البناء";
        if (level === "DEVELOPMENT") levelName = "التطوير";
        else if (level === "ADVANCED") levelName = "المتقدم";

        li.innerHTML = `
          <span>#${rank} - ${s.name || "طالب"} (${s.code})</span>
          <span>${s.total_points || 0} نقطة – ${levelName}</span>
        `;
        ul.appendChild(li);
      });

      section.appendChild(ul);
      return section;
    };

    container.appendChild(makeSection("مستوى البناء", topBuilding));
    container.appendChild(makeSection("مستوى التطوير / المتقدم", topDevAdv));

    honorBoardDiv.innerHTML = "";
    honorBoardDiv.appendChild(container);
  } catch (e) {
    console.error("Error loadHonorBoard:", e);
    honorBoardDiv.innerHTML = `<p class="message error">خطأ في تحميل لوحة الشرف: ${e.message}</p>`;
  }
}

// =====================================================
// 10) العمليات على المهام (Submit/Cancel/Review)
// =====================================================

async function submitCurriculumTask(studentCode, mission) {
  try {
    const studentRef = doc(db, "students", studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    const tasks = Array.isArray(student.tasks) ? student.tasks : [];
    if (
      tasks.some(
        (t) =>
          t.type === "hifz" &&
          (t.status === "pending" || t.status === "pending_assistant") &&
          t.mission_start === mission.startIndex
      )
    ) {
      showMessage(authMessage, "المهمة قيد المراجعة بالفعل.", "info");
      return;
    }

    tasks.push({
      id: generateUniqueId(),
      type: "hifz",
      description: mission.description,
      points: mission.points,
      status: "pending",
      mission_start: mission.startIndex,
      mission_last: mission.lastIndex,
      created_at: Date.now(),
    });

    await updateDoc(studentRef, { tasks });
    await displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage, "تم إرسال مهمة الحفظ للمراجعة.", "success");
  } catch (e) {
    console.error("Error submitCurriculumTask:", e);
    showMessage(authMessage, `حدث خطأ: ${e.message}`, "error");
  }
}
async function submitFlexibleHifzTask(studentCode, mission, endAyah) {
  try {
    const studentRef = doc(db, "students", studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    const tasks = Array.isArray(student.tasks) ? student.tasks : [];

    tasks.push({
      id: generateUniqueId(),
      type: "hifz_flexible",
      status: "pending",
      points: mission.points || FLEXIBLE_POINTS,
      created_at: Date.now(),

      flex_surah_index: mission.surahIdx,
      flex_surah_number: mission.surah_number,
      flex_surah_name_ar: mission.surah_name_ar,
      flex_start_ayah: mission.startAyah,
      flex_end_ayah: endAyah,

      description: `${mission.surah_name_ar} (${mission.startAyah}-${endAyah})`,
    });

    await updateDoc(studentRef, { tasks });
    await displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage, "تم إرسال مهمة الحفظ (المنهج المرن) للمراجعة.", "success");
  } catch (e) {
    console.error("Error submitFlexibleHifzTask:", e);
    showMessage(authMessage, `حدث خطأ: ${e.message}`, "error");
  }
}


async function cancelCurriculumTask(studentCode, type, key) {
  try {
    const studentRef = doc(db, "students", studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    let tasks = Array.isArray(student.tasks) ? student.tasks : [];

    // type = "hifz" => key = mission_start
    // type = "hifz_flexible" => key = task.id
    if (type === "hifz") {
      tasks = tasks.filter(
        (t) => !(t.type === "hifz" && t.status === "pending" && t.mission_start === key)
      );
    } else if (type === "hifz_flexible") {
      tasks = tasks.filter((t) => !(t.type === "hifz_flexible" && t.status === "pending" && t.id === key));
    }

    await updateDoc(studentRef, { tasks });
    await displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage, "تم إلغاء إرسال المهمة وإعادتها لك.", "success");
  } catch (e) {
    console.error("Error cancelCurriculumTask:", e);
    showMessage(authMessage, `حدث خطأ: ${e.message}`, "error");
  }
}


async function submitMurajaaTask(studentCode, mission) {
  try {
    const studentRef = doc(db, "students", studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    const tasks = Array.isArray(student.tasks) ? student.tasks : [];
    if (
      tasks.some(
        (t) =>
          t.type === "murajaa" &&
          (t.status === "pending" || t.status === "pending_assistant") &&
          t.murajaa_index === mission.index &&
          t.murajaa_level === mission.level
      )
    ) {
      showMessage(authMessage, "مهمة المراجعة قيد المراجعة بالفعل.", "info");
      return;
    }

    tasks.push({
      id: generateUniqueId(),
      type: "murajaa",
      description: mission.description,
      points: mission.points,
      status: "pending",
      murajaa_level: mission.level,
      murajaa_index: mission.index,
      created_at: Date.now(),
    });

    await updateDoc(studentRef, { tasks });
    await displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage, "تم إرسال مهمة المراجعة للمراجعة.", "success");
  } catch (e) {
    console.error("Error submitMurajaaTask:", e);
    showMessage(authMessage, `حدث خطأ: ${e.message}`, "error");
  }
}

async function cancelMurajaaTask(studentCode, mission) {
  try {
    const studentRef = doc(db, "students", studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    const tasks = (Array.isArray(student.tasks) ? student.tasks : []).filter(
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
  } catch (e) {
    console.error("Error cancelMurajaaTask:", e);
    showMessage(authMessage, `حدث خطأ: ${e.message}`, "error");
  }
}

async function submitGeneralTask(studentCode, taskId) {
  try {
    const studentRef = doc(db, "students", studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    const tasks = Array.isArray(student.tasks) ? student.tasks : [];
    const i = tasks.findIndex((t) => t.id === taskId);
    if (i === -1) return;

    if (tasks[i].status === "pending" || tasks[i].status === "pending_assistant") {
      showMessage(authMessage, "المهمة قيد المراجعة بالفعل.", "info");
      return;
    }

    tasks[i].status = "pending";
    await updateDoc(studentRef, { tasks });
    await displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage, "تم إرسال المهمة العامة للمراجعة.", "success");
  } catch (e) {
    console.error("Error submitGeneralTask:", e);
    showMessage(authMessage, `حدث خطأ: ${e.message}`, "error");
  }
}

async function cancelGeneralTask(studentCode, taskId) {
  try {
    const studentRef = doc(db, "students", studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    const tasks = Array.isArray(student.tasks) ? student.tasks : [];
    const i = tasks.findIndex((t) => t.id === taskId);
    if (i === -1) return;

    if (tasks[i].status === "pending") tasks[i].status = "assigned";
    await updateDoc(studentRef, { tasks });
    await displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage, "تم إلغاء إرسال المهمة العامة.", "success");
  } catch (e) {
    console.error("Error cancelGeneralTask:", e);
    showMessage(authMessage, `حدث خطأ: ${e.message}`, "error");
  }
}

async function reviewTask(studentCode, taskId, action) {
  try {
    const studentRef = doc(db, "students", studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;

    const student = snap.data();
    const tasks = Array.isArray(student.tasks) ? student.tasks : [];
    const i = tasks.findIndex((t) => t.id === taskId);

    if (i === -1) {
      showMessage(authMessage, "المهمة غير موجودة.", "error");
      return;
    }

    const task = tasks[i];
    if (task.status !== "pending" && task.status !== "pending_assistant") {
      showMessage(authMessage, "المهمة ليست بانتظار المراجعة.", "error");
      return;
    }

    if (action === "approve") {
      // 1) نقاط
      student.total_points = (student.total_points || 0) + (task.points || 0);

      // 2) تحديث التقدم حسب نوع المهمة
      if (task.type === "hifz_flexible") {
        const surahIdx = Number.isFinite(task.flex_surah_index) ? task.flex_surah_index : 0;
        const surah = FLEXIBLE_HIFZ[surahIdx];

        if (!surah) {
          showMessage(authMessage, "بيانات السورة غير موجودة في FLEXIBLE_HIFZ", "error");
          return;
        }

        const endAyah = Number.isFinite(task.flex_end_ayah)
          ? task.flex_end_ayah
          : (surah.start_ayah || 1);

        let nextAyah = endAyah + 1;
        let nextSurahIdx = surahIdx;

        // إذا وصل آخر السورة -> انتقل للسورة التالية
        if (nextAyah > surah.end_ayah) {
          nextSurahIdx = surahIdx + 1;
          const nextSurah = FLEXIBLE_HIFZ[nextSurahIdx];
          if (nextSurah) nextAyah = nextSurah.start_ayah;
        }

        student.hifz_mode = "flexible";
        student.flex_surah_index = nextSurahIdx;
        student.flex_next_ayah = nextAyah;

      } else if (task.type === "hifz") {
        const last = task.mission_last ?? task.mission_start ?? 0;
        student.hifz_progress = last + 1;

      } else if (task.type === "murajaa") {
        const level = student.murajaa_level || task.murajaa_level || "BUILDING";
        const arr = getReviewArrayForLevel(level);
        const len = arr.length;

        let start = student.murajaa_start_index ?? task.murajaa_index ?? 0;
        start = len ? ((start % len) + len) % len : 0;

        let cur = student.murajaa_progress_index ?? task.murajaa_index ?? start;
        cur = len ? ((cur % len) + len) % len : start;

        let next = len ? (cur + 1) % len : start;
        let cycles = student.murajaa_cycles || 0;

        if (len && next === start) {
          cycles += 1;

          const lastFullSurahNumber = getLastFullSurahNumber(student);
          const dynamicStart = chooseMurajaaStartIndexFromLastSurah(
            level,
            lastFullSurahNumber,
            start
          );

          start = dynamicStart;
          next = dynamicStart;
        }

        student.murajaa_level = level;
        student.murajaa_start_index = start;
        student.murajaa_progress_index = next;
        student.murajaa_cycles = cycles;
      }

      // 3) اعتماد المهمة
      tasks[i].status = "completed";
      tasks[i].completed_at = Date.now();
      delete tasks[i].assistant_type;
      delete tasks[i].assistant_code;

      // 4) حفظ
      await updateDoc(studentRef, {
        tasks,
        total_points: student.total_points,

        // الثابت
        hifz_start_id: student.hifz_start_id ?? 0,
        hifz_end_id: student.hifz_end_id ?? HIFZ_CURRICULUM.length - 1,
        hifz_progress: student.hifz_progress ?? 0,
        hifz_level: student.hifz_level ?? 1,

        // المرن (النظام الجديد)
        hifz_mode: student.hifz_mode || "fixed",
        flex_surah_index: student.flex_surah_index ?? 0,
        flex_next_ayah: student.flex_next_ayah ?? 1,

        // المراجعة
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

    } else {
      // رفض
      if (task.type === "general") {
        tasks[i].status = "assigned";
        delete tasks[i].assistant_type;
        delete tasks[i].assistant_code;
      } else {
        tasks.splice(i, 1);
      }

      await updateDoc(studentRef, { tasks });
      showMessage(authMessage, `تم رفض المهمة وإعادتها للطالب ${student.name}.`, "info");
    }

    await loadPendingTasksForReview();
    await loadHonorBoard();

    const manageTab = $("#manage-students-tab");
    if (manageTab && !manageTab.classList.contains("hidden")) {
      await loadStudentsForTeacher();
    }
  } catch (e) {
    console.error("Error reviewTask:", e);
    showMessage(authMessage, `خطأ في مراجعة المهمة: ${e.message}`, "error");
  }
}

// =====================================================
// 11) قائمة المراجعة + قائمة الطلاب (Teacher Panels)
// =====================================================

async function loadPendingTasksForReview() {
  pendingTasksList.innerHTML = '<p class="message info">جارٍ تحميل المهام...</p>';

  try {
    const snap = await getDocs(collection(db, "students"));

    const pendingHifz = [];
    const pendingMurajaa = [];
    const pendingGeneral = [];

    snap.forEach((docSnap) => {
      const student = docSnap.data();
      if (!isInCurrentHalaqa(student)) return;

      const tasks = Array.isArray(student.tasks) ? student.tasks : [];
      tasks.forEach((t) => {
        if (t.status !== "pending") return;
        if (t.type === "hifz" || t.type === "hifz_flexible") pendingHifz.push({ student, task: t });
        else if (t.type === "murajaa") pendingMurajaa.push({ student, task: t });
        else pendingGeneral.push({ student, task: t });
      });
    });

    const byCreatedAt = (a, b) => (a.task.created_at || 0) - (b.task.created_at || 0);
    pendingHifz.sort(byCreatedAt);
    pendingMurajaa.sort(byCreatedAt);
    pendingGeneral.sort(byCreatedAt);

    pendingTasksList.innerHTML = "";
    let any = false;

    function renderGroup(list, titleText) {
      if (!list.length) return;
      any = true;

      const groupTitle = document.createElement("h4");
      groupTitle.textContent = titleText;
      groupTitle.className = "review-group-title";
      pendingTasksList.appendChild(groupTitle);

      list.forEach(({ student, task }) => {
        const block = document.createElement("div");
        block.className = "review-student-block";

        const title = document.createElement("div");
        title.className = "review-student-title";
        title.textContent = `الطالب: ${student.name} (${student.code})`;
        block.appendChild(title);

        const item = document.createElement("div");
        item.className = `review-task-item ${task.type}`;
        item.innerHTML = `
          <div class="review-task-body" style="
            font-size:1.05rem;
            font-weight:800;
            line-height:1.8;
            color:#2c3e50;
          ">
            ${task.description || ""}
          </div>
        `;

        const footer = document.createElement("div");
        footer.className = "review-task-footer";

        const pts = document.createElement("span");
        pts.className = "review-points-badge";
        pts.textContent = `${task.points || 0}`;

        const ok = document.createElement("button");
        ok.className = "button success";
        ok.textContent = "☑";
        ok.title = "قبول";
        ok.addEventListener("click", () => reviewTask(student.code, task.id, "approve"));

        const no = document.createElement("button");
        no.className = "button danger";
        no.textContent = "✕";
        no.title = "رفض";
        no.addEventListener("click", () => reviewTask(student.code, task.id, "reject"));

        const forward = document.createElement("button");
        forward.className = "button";
        forward.textContent = "➜";
        forward.title = "تحويل للمساعد";
        forward.addEventListener("click", () => showAssistantSelector(student.code, task.id, block));

        footer.append(pts, ok, no, forward);
        item.appendChild(footer);
        block.appendChild(item);

        pendingTasksList.appendChild(block);
      });
    }

    renderGroup(pendingHifz, "مهام الحفظ");
    renderGroup(pendingMurajaa, "مهام المراجعة");
    renderGroup(pendingGeneral, "مهام عامة ");

    if (!any) {
      pendingTasksList.innerHTML = '<p class="message success">لا توجد مهام بانتظار المراجعة حالياً 🎉</p>';
    }
  } catch (e) {
    console.error("Error loadPendingTasksForReview:", e);
    pendingTasksList.innerHTML = `<p class="message error">خطأ في تحميل المهام: ${e.message}</p>`;
  }
}

async function loadStudentsForTeacher() {
  studentList.innerHTML = "<li>جارٍ تحميل الطلاب...</li>";

  try {
    const students = await fetchAllStudentsSortedByPoints(isInCurrentHalaqa);

    if (!students.length) {
      studentList.innerHTML = "<li>لا يوجد طلاب مسجلون بعد.</li>";
      return;
    }

    studentList.innerHTML = "";

    students.forEach((s, i) => {
      const hifzPercent = computeHifzPercent(s);
      const murPercent  = computeMurajaaPercent(s);

      const hifzPaused = !!s.pause_hifz;
      const murPaused  = !!s.pause_murajaa;

      const isStudentAssistant = !!s.is_student_assistant;
      const isParentAssistant  = !!s.is_parent_assistant && !!s.parent_code;

      const li = document.createElement("li");

      li.innerHTML = `
        <div class="student-card">
          <div class="student-top">
            <div class="student-name">#${i + 1} - ${s.name} (${s.code})</div>
          </div>

          <div class="student-week week-strip"></div>

          <div class="student-actions">
            <button class="button primary btn-edit-student" data-code="${s.code}">تعديل</button>

            <button type="button"
              class="chip-toggle ${hifzPaused ? "" : "on"} btn-toggle-hifz"
              data-code="${s.code}"
              aria-pressed="${hifzPaused ? "false" : "true"}"
              title="${hifzPaused ? "الحفظ: موقوف" : "الحفظ: شغال"}">
              <span class="ico">حفظ</span>
            </button>

            <button type="button"
              class="chip-toggle ${murPaused ? "" : "on"} btn-toggle-murajaa"
              data-code="${s.code}"
              aria-pressed="${murPaused ? "false" : "true"}"
              title="${murPaused ? "المراجعة: موقوفة" : "المراجعة: شغالة"}">
              <span class="ico">مراجعة</span>
            </button>

            <button type="button"
              class="chip-toggle ${isStudentAssistant ? "on" : ""} btn-toggle-student-assistant"
              data-code="${s.code}"
              aria-pressed="${isStudentAssistant ? "true" : "false"}"
              title="${isStudentAssistant ? "مساعد طالب: مفعّل" : "مساعد طالب: غير مفعّل"}">
              <span class="ico">طالب</span>
            </button>

            <button type="button"
              class="chip-toggle ${isParentAssistant ? "on" : ""} btn-toggle-parent-assistant"
              data-code="${s.code}"
              aria-pressed="${isParentAssistant ? "true" : "false"}"
              title="${isParentAssistant ? "مساعد ولي: مفعّل" : "مساعد ولي: غير مفعّل"}">
              <span class="ico">ولي</span>
            </button>
          </div>

          <div class="card-notch toggle-details" aria-expanded="false">
            <span class="chev">▾</span>
          </div>

          <div class="student-details hidden">
            <div class="student-sub">
              حفظ: ${hifzPercent}% ${hifzPaused ? " (موقوف)" : ""} |
              مراجعة: ${murPercent}% ${murPaused ? " (موقوف)" : ""} |
              نقاط: ${s.total_points || 0}
            </div>

            <div class="student-sub">
              ولي الأمر: ${s.parent_name || "غير مسجل"} (${s.parent_code || "—"})
            </div>

            <div class="student-sub">
              مساعد طالب: ${isStudentAssistant ? "✅ مفعّل" : "❌ غير مفعّل"} |
              مساعد ولي أمر: ${isParentAssistant ? "✅ مفعّل" : "❌ غير مفعّل"}
            </div>
          </div>
        </div>
      `;

      const weekDiv = li.querySelector(".week-strip");
      weekDiv.innerHTML = buildWeekStripHtml(Array.isArray(s.tasks) ? s.tasks : []);

      li.dataset.search = `${s.code || ""} ${s.name || ""} ${s.parent_name || ""} ${s.parent_code || ""}`.toLowerCase();
      studentList.appendChild(li);
    });

    // Bind actions
    document.querySelectorAll(".btn-edit-student").forEach((btn) => {
      btn.addEventListener("click", (e) => loadStudentIntoForm(e.currentTarget.dataset.code));
    });

    document.querySelectorAll(".btn-toggle-hifz").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleStudentFlag(e.currentTarget.dataset.code, "pause_hifz");
      });
    });

    document.querySelectorAll(".btn-toggle-murajaa").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleStudentFlag(e.currentTarget.dataset.code, "pause_murajaa");
      });
    });

    document.querySelectorAll(".btn-toggle-student-assistant").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleStudentFlag(e.currentTarget.dataset.code, "is_student_assistant");
      });
    });

    document.querySelectorAll(".btn-toggle-parent-assistant").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleStudentFlag(e.currentTarget.dataset.code, "is_parent_assistant");
      });
    });

  } catch (e) {
    console.error("Error loadStudentsForTeacher:", e);
    studentList.innerHTML = "<li>حدث خطأ أثناء تحميل قائمة الطلاب.</li>";
  }
}

async function toggleStudentFlag(code, fieldName) {
  try {
    const studentRef = doc(db, "students", code);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;

    const s = snap.data();
    const current = !!s[fieldName];

    await updateDoc(studentRef, { [fieldName]: !current });
    await loadStudentsForTeacher();

    let msg = "";
    if (fieldName === "pause_hifz") {
      msg = !current ? "تم إيقاف مهام الحفظ لهذا الطالب." : "تم تشغيل مهام الحفظ لهذا الطالب.";
    } else if (fieldName === "pause_murajaa") {
      msg = !current ? "تم إيقاف مهام المراجعة لهذا الطالب." : "تم تشغيل مهام المراجعة لهذا الطالب.";
    } else if (fieldName === "is_student_assistant") {
      msg = !current ? "تم تفعيل هذا الطالب كمساعد." : "تم إلغاء تفعيل هذا الطالب كمساعد.";
    } else if (fieldName === "is_parent_assistant") {
      msg = !current
        ? "تم تفعيل ولي الأمر كمساعد في هذه الحلقة."
        : "تم إلغاء تفعيل ولي الأمر كمساعد في هذه الحلقة.";
    }

    if (msg) showMessage(registerStudentMessage, msg, "success");
  } catch (e) {
    console.error("Error toggleStudentFlag:", e);
    showMessage(registerStudentMessage, `خطأ في تحديث حالة الطالب: ${e.message}`, "error");
  }
}

async function loadStudentIntoForm(code) {
  try {
    const snap = await getDoc(doc(db, "students", code));
    if (!snap.exists()) return;
    const s = snap.data();

    editingStudentCode = s.code;
    studentFormTitle.textContent = `تعديل بيانات الطالب: ${s.name}`;

    if (!newStudentHifzStart.options.length || !newStudentHifzEnd.options.length) populateHifzSelects();

    newStudentCodeInput.value = s.code;
    newStudentNameInput.value = s.name;
    newStudentParentNameInput.value = s.parent_name || "";
    newStudentParentCodeInput.value = s.parent_code || "";

    newStudentHifzStart.value = s.hifz_start_id ?? s.hifz_progress ?? 0;
    newStudentHifzEnd.value = s.hifz_end_id ?? HIFZ_CURRICULUM.length - 1;
    newStudentHifzLevel.value = s.hifz_level || 1;

    newStudentMurajaaLevel.value = s.murajaa_level || "BUILDING";
    populateMurajaaStartSelect();
        // ✅ ضبط نوع المنهج
    const mode = s.hifz_mode || "fixed";
    if (newStudentHifzType) newStudentHifzType.value = mode;

    populateFlexibleSurahSelect();
    if (newStudentFlexibleSurah) newStudentFlexibleSurah.value = String(s.flex_surah_index ?? 0);

    syncHifzTypeUI();

    const arr = getReviewArrayForLevel(newStudentMurajaaLevel.value);
    const def = s.murajaa_start_index ?? s.murajaa_progress_index ?? 0;

    newStudentMurajaaStart.value = (arr?.length ? Math.min(def, arr.length - 1) : 0).toString();
    if (newStudentHalaqa) newStudentHalaqa.value = s.halaqa || "ONSITE";

    activateTab("manage-students-tab");
  } catch (e) {
    console.error("Error loadStudentIntoForm:", e);
  }
}

function displayCurriculumsInTeacherPanel() {
  hifzCurriculumDisplay.innerHTML = HIFZ_CURRICULUM.map(
    (it, i) =>
      `<div class="curriculum-item">(${i}) ${it.surah_name_ar} (${it.start_ayah}-${it.end_ayah}) – نقاط: ${it.points || 0}</div>`
  ).join("");

  murajaaCurriculumDisplay.innerHTML = Object.entries(REVIEW_CURRICULUM)
    .map(([level, items]) => {
      const title =
        level === "BUILDING"
          ? "البناء"
          : level === "DEVELOPMENT"
          ? "التطوير"
          : "المتقدم";
      const list = items
        .map((it, i) => `<div class="curriculum-item">(${i}) ${it.name} – نقاط: ${it.points || 0}</div>`)
        .join("");
      return `<h4>${title}</h4>${list}`;
    })
    .join("<hr />");
}

// =====================================================
// 12) إضافة / تعديل طالب (Register/Update)
// =====================================================

function populateHifzSelects() {
  if (!newStudentHifzStart || !newStudentHifzEnd) return;
  const options = HIFZ_CURRICULUM.map(
    (item, i) =>
      `<option value="${i}">(${i}) ${item.surah_name_ar} (${item.start_ayah}-${item.end_ayah})</option>`
  ).join("");
  newStudentHifzStart.innerHTML = options;
  newStudentHifzEnd.innerHTML = options;
}
function populateFlexibleSurahSelect() {
  if (!newStudentFlexibleSurah) return;
  newStudentFlexibleSurah.innerHTML = FLEXIBLE_HIFZ.map((s, i) =>
    `<option value="${i}">${s.surah_name_ar} (${s.start_ayah}-${s.end_ayah})</option>`
  ).join("");
}

function syncHifzTypeUI() {
  const mode = newStudentHifzType?.value || "fixed";
  const isFlex = mode === "flexible";
  fixedHifzGroup?.classList.toggle("hidden", isFlex);
  flexibleSurahGroup?.classList.toggle("hidden", !isFlex);
}

newStudentHifzType?.addEventListener("change", syncHifzTypeUI);

function populateMurajaaStartSelect() {
  if (!newStudentMurajaaLevel || !newStudentMurajaaStart) return;
  const arr = getReviewArrayForLevel(newStudentMurajaaLevel.value || "BUILDING");
  if (!arr?.length) {
    newStudentMurajaaStart.innerHTML = '<option value="0">لا توجد مهام لهذا المستوى</option>';
    return;
  }
  newStudentMurajaaStart.innerHTML = arr.map((it, i) => `<option value="${i}">(${i}) ${it.name}</option>`).join("");
}

newStudentMurajaaLevel?.addEventListener("change", populateMurajaaStartSelect);

registerStudentButton?.addEventListener("click", async () => {
  const code = newStudentCodeInput.value.trim();
  const name = newStudentNameInput.value.trim();
  const parentName = newStudentParentNameInput.value.trim() || null;
  const parentCode = newStudentParentCodeInput.value.trim() || null;

  const hifzStartIndex = parseInt(newStudentHifzStart.value, 10);
  const hifzEndIndex = parseInt(newStudentHifzEnd.value, 10);
  const hifzLevel = parseInt(newStudentHifzLevel.value, 10);
  const murajaaLevel = newStudentMurajaaLevel.value;
  const murajaaStartIndex = parseInt(newStudentMurajaaStart.value, 10) || 0;
  const halaqaValue = newStudentHalaqa?.value || "ONSITE";

  const hifzModeNow = newStudentHifzType?.value || "fixed";
  const flexSurahIndex = parseInt(newStudentFlexibleSurah?.value || "0", 10) || 0; // ✅ لازم هنا

  if (!code || !name) {
    showMessage(registerStudentMessage, "الرجاء تعبئة رمز الطالب والاسم.", "error");
    return;
  }

  if (hifzModeNow === "fixed") {
    if (isNaN(hifzStartIndex) || isNaN(hifzEndIndex)) {
      showMessage(registerStudentMessage, "الرجاء اختيار بداية ونهاية الحفظ للمنهج الثابت.", "error");
      return;
    }
    if (hifzEndIndex < hifzStartIndex) {
      showMessage(registerStudentMessage, "نقطة نهاية الحفظ يجب أن تكون بعد نقطة البداية.", "error");
      return;
    }
  } else {
    if (!Number.isFinite(flexSurahIndex) || !FLEXIBLE_HIFZ[flexSurahIndex]) {
      showMessage(registerStudentMessage, "الرجاء اختيار سورة بداية صحيحة للمنهج المرن.", "error");
      return;
    }
  }

  try {
    const studentRef = doc(db, "students", code);
    const snap = await getDoc(studentRef);
    const existing = snap.exists() ? snap.data() : null;

    const hifzMode = hifzModeNow;
    const flexSurah = FLEXIBLE_HIFZ[flexSurahIndex] || FLEXIBLE_HIFZ[0];

    const baseData = {
      code,
      name,
      role: "student",
      halaqa: halaqaValue,
      parent_name: parentName,
      parent_code: parentCode,

      hifz_mode: hifzMode,

      // ✅ المرن (نظام جديد)
      flex_surah_index: existing ? (existing.flex_surah_index ?? flexSurahIndex) : flexSurahIndex,
      flex_next_ayah: existing
        ? (existing.flex_next_ayah ?? (flexSurah?.start_ayah || 1))
        : (flexSurah?.start_ayah || 1),

      // ✅ الثابت
      hifz_start_id: hifzStartIndex,
      hifz_end_id: hifzEndIndex,
      hifz_progress: existing ? (existing.hifz_progress ?? hifzStartIndex) : hifzStartIndex,
      hifz_level: hifzLevel,

      // المراجعة
      murajaa_level: murajaaLevel,
      murajaa_start_index: murajaaStartIndex,
      murajaa_progress_index: murajaaStartIndex,
      murajaa_cycles: existing ? existing.murajaa_cycles || 0 : 0,

      total_points: existing ? existing.total_points || 0 : 0,
      tasks: existing ? existing.tasks || [] : [],

      pause_hifz: existing ? !!existing.pause_hifz : false,
      pause_murajaa: existing ? !!existing.pause_murajaa : false,
      is_student_assistant: existing ? !!existing.is_student_assistant : false,
      is_parent_assistant: existing ? !!existing.is_parent_assistant : false,
    };

    await setDoc(studentRef, baseData, { merge: true });

    showMessage(registerStudentMessage, "تم حفظ بيانات الطالب.", "success");
    editingStudentCode = null;
    studentFormTitle.textContent = "إضافة / تعديل طالب";

    await loadStudentsForTeacher();
    await loadHonorBoard();
  } catch (e) {
    console.error("Error registerStudent:", e);
    showMessage(registerStudentMessage, `حدث خطأ في حفظ بيانات الطالب: ${e.message}`, "error");
  }
});


// =====================================================
// 13) تبويبات المعلم + نوع الحلقة + التحديث
// =====================================================

function activateTab(tabId) {
  document.querySelectorAll(".tab-content").forEach((el) => el.classList.add("hidden"));
  document.querySelectorAll(".tab-button").forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.tab === tabId)
  );

  const target = document.getElementById(tabId);
  target?.classList.remove("hidden");

  if (tabId === "review-tasks-tab") loadPendingTasksForReview();
  else if (tabId === "manage-students-tab") loadStudentsForTeacher();
  else if (tabId === "curriculum-tab") {
    displayCurriculumsInTeacherPanel();
    loadHonorBoard();
  }
}

tabButtons.forEach((btn) => btn.addEventListener("click", () => activateTab(btn.dataset.tab)));

halaqaOnsiteBtn?.addEventListener("click", () => {
  currentHalaqa = "ONSITE";
  updateHalaqaToggleUI();
  refreshTeacherView();
});

halaqaOnlineBtn?.addEventListener("click", () => {
  currentHalaqa = "ONLINE";
  updateHalaqaToggleUI();
  refreshTeacherView();
});

// شبكة الحلقة (tiles)
halaqaStudentsGrid?.addEventListener("click", async (e) => {
  const tile = e.target.closest(".halaqa-tile");
  if (!tile) return;

  const code = tile.dataset.code;
  if (!code) return;

  try {
    const student = await fetchStudentByCode(code);
    if (!student) {
      alert("لم يتم العثور على بيانات هذا الطالب.");
      return;
    }
    currentUser = { role: "student", code: student.code };
    lastStudentEntrySource = "HALAQA";
    await displayStudentDashboard(student);
  } catch (err) {
    console.error("login from halaqa tile error:", err);
    alert("حدث خطأ أثناء فتح حساب الطالب.");
  }
});

halaqaBackButton?.addEventListener("click", () => {
  currentUser = null;
  lastStudentEntrySource = null;
  hideAllScreens();
  authScreen.classList.remove("hidden");
  userCodeInput.value = "";
});

// =====================================================
// 14) تسجيل الدخول / الخروج
// =====================================================

async function fetchStudentByCode(code) {
  const studentRef = doc(db, "students", code);
  const snap = await getDoc(studentRef);
  if (!snap.exists()) return null;
  return snap.data();
}

loginButton.addEventListener("click", async () => {
  const rawCode = userCodeInput.value.trim();
  const codeUpper = rawCode.toUpperCase();

  if (!rawCode) {
    showMessage(authMessage, "الرجاء إدخال رمز الدخول", "error");
    return;
  }

  try {
    // كود الحلقة
    if (HALAQA_LOGIN_CODES[codeUpper]) {
      currentHalaqa = HALAQA_LOGIN_CODES[codeUpper];
      lastHalaqaLoginCode = codeUpper;
      lastHalaqaType = currentHalaqa;
      lastStudentEntrySource = null;
      await displayHalaqaScreen(codeUpper, currentHalaqa);
      return;
    }

    // المعلم
    if (rawCode === "teacher1") {
      currentUser = { role: "teacher", code: rawCode };
      lastStudentEntrySource = null;
      hideAllScreens();
      teacherScreen.classList.remove("hidden");
      await refreshTeacherView?.();
      return;
    }

    // ولي الأمر
    const parentSnap = await getDocs(collection(db, "students"));
    let parentHasChildren = false;
    parentSnap.forEach((d) => {
      const s = d.data();
      if (String(s.parent_code || "") === String(rawCode)) parentHasChildren = true;
    });

    if (parentHasChildren) {
      currentUser = { role: "parent", code: String(rawCode) };
      lastStudentEntrySource = null;
      await displayParentDashboard(rawCode);
      return;
    }

    // الطالب
    const student = await fetchStudentByCode(rawCode);
    if (!student) {
      showMessage(authMessage, "لم يتم العثور على طالب بهذا الرمز", "error");
      return;
    }
    currentUser = { role: "student", code: student.code };
    lastStudentEntrySource = "DIRECT";
    await displayStudentDashboard(student);
  } catch (e) {
    console.error("login error:", e);
    showMessage(authMessage, "حدث خطأ أثناء تسجيل الدخول", "error");
  }
});

function logout() {
  if (
    currentUser?.role === "student" &&
    lastStudentEntrySource === "HALAQA" &&
    lastHalaqaLoginCode &&
    lastHalaqaType
  ) {
    currentUser = null;
    hideAllScreens();
    displayHalaqaScreen(lastHalaqaLoginCode, lastHalaqaType);
    return;
  }

  currentUser = null;
  lastStudentEntrySource = null;
  hideAllScreens();
  authScreen.classList.remove("hidden");
  userCodeInput.value = "";
  showMessage(authMessage, "تم تسجيل الخروج بنجاح.", "success");
}

logoutButtonStudent?.addEventListener("click", logout);
logoutButtonTeacher?.addEventListener("click", logout);
logoutButtonParent?.addEventListener("click", logout);

// =====================================================
// 15) التحديث (Refresh)
// =====================================================

async function refreshStudentView() {
  if (!currentUser?.code) {
    console.warn("No currentUser/code at refresh:", currentUser);
    return;
  }
  try {
    const snap = await getDoc(doc(db, "students", currentUser.code));
    if (!snap.exists()) {
      showMessage(authMessage, "تعذر العثور على بيانات الطالب.", "error");
      return;
    }
    await displayStudentDashboard({ code: currentUser.code, ...snap.data() });
  } catch (e) {
    console.error("Error refreshStudentView:", e);
    showMessage(authMessage, `خطأ في تحديث بيانات الطالب: ${e.message}`, "error");
  }
}

function getActiveTeacherTabId() {
  const active = document.querySelector(".tab-content:not(.hidden)");
  return active ? active.id : null;
}

function refreshTeacherView() {
  const id = getActiveTeacherTabId();
  if (!id) return;
  if (id === "review-tasks-tab") loadPendingTasksForReview();
  else if (id === "manage-students-tab") loadStudentsForTeacher();
  else if (id === "curriculum-tab") displayCurriculumsInTeacherPanel();
}

refreshStudentButton?.addEventListener("click", refreshStudentView);
refreshTeacherButton?.addEventListener("click", refreshTeacherView);

// =====================================================
// 16) تعيين مهام (Teacher Assign Buttons)
// =====================================================

assignIndividualTaskButton?.addEventListener("click", async () => {
  const code = assignTaskStudentCode.value.trim();
  const type = assignTaskType.value;
  const description = assignTaskDescription.value.trim();
  const points = parseInt(assignTaskPoints.value, 10);

  if (!code || !description || isNaN(points) || points <= 0) {
    showMessage(assignTaskMessage, "الرجاء تعبئة رمز الطالب والوصف والنقاط بشكل صحيح.", "error");
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
  } catch (e) {
    console.error("Error assignIndividualTask:", e);
    showMessage(assignTaskMessage, `حدث خطأ في تعيين المهمة: ${e.message}`, "error");
  }
});

assignGroupTaskButton?.addEventListener("click", async () => {
  const type = assignTaskType.value;
  const description = assignTaskDescription.value.trim();
  const points = parseInt(assignTaskPoints.value, 10);

  if (!description || isNaN(points) || points <= 0) {
    showMessage(assignTaskMessage, "الرجاء تعبئة الوصف والنقاط بشكل صحيح.", "error");
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
    const snap = await getDocs(collection(db, "students"));
    const batch = writeBatch(db);

    snap.forEach((d) => {
      const s = d.data();
      const h = s.halaqa || "ONSITE";
      if (h !== currentHalaqa) return;
      batch.update(doc(db, "students", d.id), { tasks: arrayUnion(task) });
    });

    await batch.commit();
    showMessage(assignTaskMessage, "تم تعيين المهمة لجميع الطلاب.", "success");
  } catch (e) {
    console.error("Error assignGroupTask:", e);
    showMessage(assignTaskMessage, `حدث خطأ في تعيين المهمة الجماعية: ${e.message}`, "error");
  }
});

// =====================================================
// 17) تبويبات الطالب (مهامي / مهام المساعد)
// =====================================================

function activateStudentTab(tabId) {
  if (!studentMainTasksSection || !studentAssistantTabSection) return;

  studentMainTasksSection.classList.toggle("hidden", tabId !== "student-main-tasks");
  studentAssistantTabSection.classList.toggle("hidden", tabId !== "student-assistant-tab");

  studentTabButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tabId));

  const progressSection = document.querySelector(".progress-section");
  if (progressSection) {
    progressSection.classList.toggle("hidden", tabId === "student-assistant-tab");
  }

  if (tabId === "student-assistant-tab") {
    loadAssistantTasksForCurrentUser();
  }
}

studentTabButtons.forEach((btn) => {
  btn.addEventListener("click", () => activateStudentTab(btn.dataset.tab));
});

// =====================================================
// 18) البحث في قائمة الطلاب (Teacher Search)
// =====================================================

let teacherSearchBound = false;

function bindTeacherStudentSearch() {
  const input = document.getElementById("student-search");
  if (!input || teacherSearchBound) return;

  const applyFilter = () => {
    const q = (input.value || "").trim().toLowerCase();
    document.querySelectorAll("#student-list li").forEach((li) => {
      const hay = li.dataset.search || li.textContent.toLowerCase();
      li.style.display = !q || hay.includes(q) ? "" : "none";
    });
  };

  input.addEventListener("input", applyFilter);
  input.addEventListener("keyup", (e) => {
    if (e.key === "Escape") {
      input.value = "";
      applyFilter();
    }
  });

  teacherSearchBound = true;
}

const _oldLoadStudentsForTeacher = loadStudentsForTeacher;
loadStudentsForTeacher = async function () {
  await _oldLoadStudentsForTeacher();
  bindTeacherStudentSearch();
};

// =====================================================
// 19) تفاعل بطاقة الطالب (السهم السفلي) + قلب chip-toggle بصرياً
// =====================================================

// فتح/إغلاق التفاصيل
document.addEventListener("click", (e) => {
  const notch = e.target.closest(".toggle-details");
  if (!notch) return;

  const card = notch.closest(".student-card");
  const details = card.querySelector(".student-details");
  const open = !details.classList.contains("hidden");

  details.classList.toggle("hidden", open);
  card.classList.toggle("details-open", !open);
  notch.setAttribute("aria-expanded", String(!open));
});


// =====================================================
// 20) تهيئة أولية
// =====================================================

populateHifzSelects();
populateMurajaaStartSelect();
updateHalaqaToggleUI();
populateFlexibleSurahSelect();
syncHifzTypeUI();


console.log("App ready. Curriculum loaded from external file with assistants & pause flags.");









