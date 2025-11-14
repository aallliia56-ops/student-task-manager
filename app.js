// app.js
// =======================
// تهيئة Firebase + المنهج + منطق الأدوار (تنظيف بدون تغيير سلوك)
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
const app   = initializeApp(firebaseConfig);
const db    = getFirestore(app);
const auth  = getAuth(app);

// =======================
// DOM
// =======================
const $ = (s) => document.querySelector(s);

// شاشة الدخول
const authScreen   = $("#auth-screen");
const userCodeInput= $("#user-code");
const loginButton  = $("#login-button");
const authMessage  = $("#auth-message");

// شاشة الطالب
const studentScreen= $("#student-screen");
const welcomeStudent= $("#welcome-student");

// شريط الخطة
const studentPlanStrip = $("#student-plan-strip");
const stripPlan   = $("#strip-plan");
const stripPoints = $("#strip-points");
const stripRank   = $("#strip-rank");

// سطر الخطة النحيف (إن وُجد في HTML)
const studentPlanLine = $("#student-plan-line");

// “المهمة القادمة” تحت كل شريط
const studentHifzNextLabel     = $("#student-hifz-next-label");
const studentMurajaaNextLabel  = $("#student-murajaa-next-label");

// عناصر التقدّم
const studentHifzProgressLabel = $("#student-hifz-progress-label");
const studentMurajaaProgressLabel = $("#student-murajaa-progress-label");
const studentHifzProgressBar   = $("#student-hifz-progress-bar");
const studentMurajaaProgressBar= $("#student-murajaa-progress-bar");
const studentHifzProgressPercent = $("#student-hifz-progress-percent");
const studentMurajaaProgressPercent = $("#student-murajaa-progress-percent");
const studentMurajaaLevelLabel = $("#student-murajaa-level-label");
const studentTotalPoints       = $("#student-total-points");
const studentRankText          = $("#student-rank-text");
const studentTasksDiv          = $("#student-tasks");
const logoutButtonStudent      = $("#logout-button-student");

// شاشة المعلم
const teacherScreen            = $("#teacher-screen");
const logoutButtonTeacher      = $("#logout-button-teacher");
const teacherHalaqaFilter      = $("#teacher-halaqa-filter");
const tabButtons               = document.querySelectorAll(".tab-button");

// أزرار التحديث
const refreshStudentButton     = $("#refresh-student-button");
const refreshTeacherButton     = $("#refresh-teacher-button");

// تعيين المهام
const assignTaskStudentCode    = $("#assign-task-student-code");
const assignTaskType           = $("#assign-task-type");
const assignTaskDescription    = $("#assign-task-description");
const assignTaskPoints         = $("#assign-task-points");
const assignIndividualTaskButton = $("#assign-individual-task-button");
const assignGroupTaskButton    = $("#assign-group-task-button");
const assignTaskMessage        = $("#assign-task-message");

// إدارة الطلاب
const studentList              = $("#student-list");
const studentFormTitle         = $("#student-form-title");
const newStudentCodeInput      = $("#new-student-code");
const newStudentNameInput      = $("#new-student-name");
const newStudentParentNameInput= $("#new-student-parent-name");
const newStudentParentCodeInput= $("#new-student-parent-code");
const newStudentHifzStart      = $("#new-student-hifz-start");
const newStudentHifzEnd        = $("#new-student-hifz-end");
const newStudentHifzLevel      = $("#new-student-hifz-level");
const newStudentMurajaaLevel   = $("#new-student-murajaa-level");
const newStudentMurajaaStart   = $("#new-student-murajaa-start");
const newStudentHalaqa         = $("#new-student-halaqa");
const registerStudentButton    = $("#register-student-button");
const registerStudentMessage   = $("#register-student-message");

// عرض المنهج
const hifzCurriculumDisplay    = $("#hifz-curriculum-display");
const murajaaCurriculumDisplay = $("#murajaa-curriculum-display");

// مراجعة المهام
const pendingTasksList         = $("#pending-tasks-list");
const honorBoardDiv            = $("#honor-board");

// شاشة ولي الأمر
const parentScreen             = $("#parent-screen");
const welcomeParent            = $("#welcome-parent");
const logoutButtonParent       = $("#logout-button-parent");
const parentChildrenList       = $("#parent-children-list");

// حالة المستخدم
let currentUser = null;
let editingStudentCode = null;
let currentTeacherHalaqa = "ALL"; // ALL | ONSITE | ONLINE

function isInCurrentHalaqa(student){
  // لو فلتر المعلم على "كل الحلقات" رجّع كل الطلاب
  if (!currentTeacherHalaqa || currentTeacherHalaqa === "ALL") return true;

  // الحلقة المخزنة مع الطالب (افتراضيًا حضوري لو ما فيه قيمة)
  const h = student.halaqa || "ONSITE";
  return h === currentTeacherHalaqa;
}

// ربط قائمة اختيار الحلقة في صفحة المعلم
teacherHalaqaFilter?.addEventListener("change", ()=>{
  currentTeacherHalaqa = teacherHalaqaFilter.value || "ALL";
  refreshTeacherView();
});


// =======================
// Helpers
// =======================
const safeSetText  = (el, t="") => el && (el.textContent = t);
const safeSetWidth = (el, pct=0) => el && (el.style.width = `${pct}%`);

const getStudentEls = () => ({
  welcome : welcomeStudent,
  hifzLabel: studentHifzProgressLabel,
  murLabel : studentMurajaaProgressLabel,
  hifzBar  : studentHifzProgressBar,
  murBar   : studentMurajaaProgressBar,
  hifzPct  : studentHifzProgressPercent,
  murPct   : studentMurajaaProgressPercent,
  murLevel : studentMurajaaLevelLabel,
  totalPoints: studentTotalPoints,
  rankText: studentRankText,
});

const showMessage = (el, msg, type="info") => {
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden","error","success","info");
  el.classList.add(type);
  setTimeout(()=> el.classList.add("hidden"), 5000);
};

const hideAllScreens = () => {
  authScreen.classList.add("hidden");
  studentScreen.classList.add("hidden");
  teacherScreen.classList.add("hidden");
  parentScreen.classList.add("hidden");
};

const generateUniqueId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2,8);

const getReviewArrayForLevel = (level) => REVIEW_CURRICULUM[level] || [];

async function fetchAllStudentsSortedByPoints(filterFn){
  const colRef = collection(db,"students");
  const snap   = await getDocs(colRef);
  const arr    = [];
  snap.forEach(d=>{
    const s = d.data();
    if (!filterFn || filterFn(s)) arr.push(s);
  });
  arr.sort((a,b)=>(b.total_points||0)-(a.total_points||0));
  return arr;
}


// ترتيب مجموعات المستويات:
// - مجموعة البناء (BUILDING) لوحدها
// - مجموعة التطوير + المتقدم معًا
function computeRankMapForGroup(students){
  const sorted = [...students].sort((a,b)=>(b.total_points||0)-(a.total_points||0));
  const rankMap = {};
  let lastPts = null;
  let currentRank = 0;

  sorted.forEach((s,i)=>{
    const pts = s.total_points || 0;
    if (lastPts === null){
      currentRank = 1;
    } else if (pts < lastPts){
      currentRank = i + 1;
    }
    rankMap[s.code] = currentRank;
    lastPts = pts;
  });

  return { sorted, rankMap };
}

function buildGroupedRanks(students){
  const building = [];
  const devAdv   = [];

  students.forEach((s)=>{
    const level = s.murajaa_level || "BUILDING";
    if (level === "BUILDING"){
      building.push(s);
    } else if (level === "DEVELOPMENT" || level === "ADVANCED"){
      devAdv.push(s);
    } else {
      // أي قيمة غير معروفة نلحقها بمجموعة التطوير/المتقدم
      devAdv.push(s);
    }
  });

  function isInCurrentHalaqa(student){
  if (!currentTeacherHalaqa || currentTeacherHalaqa === "ALL") return true;
  const h = student.halaqa || "ONSITE";
  return h === currentTeacherHalaqa;
}

teacherHalaqaFilter?.addEventListener("change", ()=>{
  currentTeacherHalaqa = teacherHalaqaFilter.value || "ALL";
  refreshTeacherView();
});


  const { sorted: buildingSorted, rankMap: buildingRankMap } = computeRankMapForGroup(building);
  const { sorted: devAdvSorted,   rankMap: devAdvRankMap   } = computeRankMapForGroup(devAdv);

  return { buildingSorted, buildingRankMap, devAdvSorted, devAdvRankMap };
}


// سطر الخطة/النقاط/الترتيب (يوحّد التحديث في مكان واحد)
function updatePlanStrip({startSurah="—", endSurah="—", points=0, rank="—"}) {
  // السطر النحيف (إن وُجد)
  if (studentPlanLine) {
    studentPlanLine.textContent =
      `الخطة: من ${startSurah} إلى ${endSurah} • النقاط: ${points} • الترتيب: ${rank}`;
  }
  // الشريط
  safeSetText(stripPlan,   `الخطة: من ${startSurah} إلى ${endSurah}`);
  safeSetText(stripPoints, `النقاط: ${points}`);
  safeSetText(stripRank,   `الترتيب: ${rank}`);
}

// =======================
// منطق المنهج
// =======================
function getCurrentHifzMission(student){
  const all = HIFZ_CURRICULUM;
  if (!all?.length) return null;

  const startIndex = student.hifz_progress ?? student.hifz_start_id ?? 0;
  if (startIndex >= all.length) return null;

  const level = +student.hifz_level || 1;
  const maxSegments = Math.max(1, Math.min(3, level));

  const first = all[startIndex];
  const segs = [first];

  for (let i=startIndex+1; i<all.length && segs.length<maxSegments; i++){
    const seg = all[i];
    if (seg.surah_number !== first.surah_number) break;
    segs.push(seg);
  }

  const last = segs[segs.length-1];
  return {
    type: "hifz",
    startIndex,
    lastIndex: startIndex + segs.length - 1,
    description: `${first.surah_name_ar} (${first.start_ayah}-${last.end_ayah})`,
    points: first.points || 5,
  };
}

function getNextHifzMission(student){
  const all = HIFZ_CURRICULUM;
  if (!all?.length) return null;

  const cur = getCurrentHifzMission(student);
  if (!cur) return null;

  const planEnd = student.hifz_end_id ?? (all.length-1);
  const candidate = cur.lastIndex + 1;
  if (candidate > planEnd || !all[candidate]) return null;

  const level = +student.hifz_level || 1;
  const maxSegments = Math.max(1, Math.min(3, level));

  const first = all[candidate];
  const segs = [first];
  for (let i=candidate+1; i<all.length && i<=planEnd && segs.length<maxSegments; i++){
    const seg = all[i];
    if (seg.surah_number !== first.surah_number) break;
    segs.push(seg);
  }

  const last = segs[segs.length-1];
  return {
    type: "hifz",
    startIndex: candidate,
    lastIndex: candidate + segs.length - 1,
    description: `${first.surah_name_ar} (${first.start_ayah}-${last.end_ayah})`,
    points: first.points || 5,
  };
}

function getCurrentMurajaaMission(student){
  const level = student.murajaa_level || "BUILDING";
  const arr = getReviewArrayForLevel(level);
  if (!arr?.length) return null;

  const len   = arr.length;
  const start = ((student.murajaa_start_index ?? 0) % len + len) % len;
  let index   = student.murajaa_progress_index;
  if (index == null) index = start;
  index = ((index % len) + len) % len;

  const item = arr[index];
  return { type:"murajaa", level, index, description:item.name, points:item.points||3 };
}

function getNextMurajaaMission(student){
  const level = student.murajaa_level || "BUILDING";
  const arr = getReviewArrayForLevel(level);
  if (!arr?.length) return null;

  const len   = arr.length;
  const start = ((student.murajaa_start_index ?? 0) % len + len) % len;
  let idx     = student.murajaa_progress_index ?? start;
  idx = ((idx % len) + len) % len;

  const nextIndex = (idx + 1) % len;
  const item = arr[nextIndex];
  return { type:"murajaa", level, index:nextIndex, description:item.name, points:item.points||3 };
}

function computeHifzPercent(student){
  const all = HIFZ_CURRICULUM;
  if (!all?.length) return 0;
  const start = student.hifz_start_id ?? 0;
  const end   = student.hifz_end_id ?? (all.length-1);
  const span  = Math.max(1, end - start + 1);
  const prog  = student.hifz_progress ?? start;
  const done  = Math.max(0, Math.min(prog - start, span));
  return Math.round((done/span)*100);
}

function computeMurajaaPercent(student){
  const arr = getReviewArrayForLevel(student.murajaa_level || "BUILDING");
  if (!arr?.length) return 0;
  const len   = arr.length;
  const start = (student.murajaa_start_index ?? 0) % len;
  let prog    = student.murajaa_progress_index ?? start;
  prog        = ((prog % len)+len)%len;
  const dist  = (prog - start + len) % len;
  return Math.round((dist/len)*100);
}

// =======================
// واجهة الطالب
// =======================
async function displayStudentDashboard(student){
  try{
    const els = getStudentEls();

    // ترحيب
    safeSetText(els.welcome, `أهلاً بك يا ${student.name || "طالب"}`);

    // بيانات الخطة/النقاط/الترتيب
    const startIdx = student.hifz_start_id ?? 0;
    const endIdx   = student.hifz_end_id ?? (HIFZ_CURRICULUM.length - 1);
    const startItem= HIFZ_CURRICULUM[startIdx];
    const endItem  = HIFZ_CURRICULUM[endIdx];
    const startSurah = startItem ? startItem.surah_name_ar : "—";
    const endSurah   = endItem   ? endItem.surah_name_ar   : "—";
    const points     = student.total_points || 0;

        // ===== الترتيب =====
    // الحلقة الحالية (حضوري / إلكتروني) – افتراضيًا حضوري لو ما فيه حقل
    const studentHalaqa = student.halaqa || "ONSITE";

    // جميع الطلاب مرتّبين بالنقاط
    const all = await fetchAllStudentsSortedByPoints();

    // نفس الحلقة فقط
    const sameHalaqa = all.filter(s => (s.halaqa || "ONSITE") === studentHalaqa);

    // مستوى المراجعة: البناء لو ما فيه قيمة
    const level = student.murajaa_level || "BUILDING";
    let rankOnly = "—";

    if (level === "BUILDING"){
      // مجموعة البناء فقط
      const buildingGroup = sameHalaqa.filter(
        s => (s.murajaa_level || "BUILDING") === "BUILDING"
      );
      const idx = buildingGroup.findIndex(s => s.code === student.code);
      if (idx !== -1) rankOnly = String(idx + 1);
    } else {
      // التطوير + المتقدم معًا
      const devAdvGroup = sameHalaqa.filter(s => {
        const lv = s.murajaa_level || "BUILDING";
        return lv === "DEVELOPMENT" || lv === "ADVANCED";
      });
      const idx = devAdvGroup.findIndex(s => s.code === student.code);
      if (idx !== -1) rankOnly = String(idx + 1);
    }


    



    
    updatePlanStrip({ startSurah, endSurah, points, rank: rankOnly });

    // مهام حالية
    const hifzMission = getCurrentHifzMission(student);
    const murMission  = getCurrentMurajaaMission(student);

    safeSetText(els.hifzLabel, hifzMission ? hifzMission.description : "لا توجد مهمة حفظ حالياً.");
    safeSetText(els.murLabel , murMission  ? murMission.description  : "لا توجد مهمة مراجعة حالياً.");

    // مستوى المراجعة (يبقى ظاهرًا إذا موجود في الـ HTML)
    if (els.murLevel){
      safeSetText(
        els.murLevel,
        murMission
          ? (murMission.level==="BUILDING" ? "البناء" : murMission.level==="DEVELOPMENT" ? "التطوير" : "المتقدم")
          : "غير محدد"
      );
    }

    // المهمة القادمة تحت الأشرطة
    const nextH = getNextHifzMission(student);
    const nextM = getNextMurajaaMission(student);
    safeSetText(studentHifzNextLabel,    `المهمة القادمة: ${nextH ? nextH.description : "—"}`);
    safeSetText(studentMurajaaNextLabel, `المهمة القادمة: ${nextM ? nextM.description : "—"}`);

    // أشرطة التقدم
    const hifzPct = computeHifzPercent(student);
    const murPct  = computeMurajaaPercent(student);
    safeSetText(els.hifzPct, hifzPct);
    safeSetText(els.murPct , murPct);
    safeSetWidth(els.hifzBar, hifzPct);
    safeSetWidth(els.murBar , murPct);

    // نقاط/ترتيب (لو عندك عناصر منفصلة)
    safeSetText(els.totalPoints, points);
    safeSetText(els.rankText, rankOnly);

    // بطاقات “مهامي”
    renderStudentTasks(student);

    hideAllScreens();
    studentScreen.classList.remove("hidden");
  }catch(err){
    console.error("displayStudentDashboard error:", err);
    showMessage(authMessage, `خطأ في عرض واجهة الطالب: ${err.message}`, "error");
  }
}

function renderStudentTasks(student){
  studentTasksDiv.innerHTML = "";
  const tasksArray = Array.isArray(student.tasks) ? student.tasks : [];
  const wrap = document.createElement("div");

  // حفظ
  const hifzMission = getCurrentHifzMission(student);
  if (hifzMission){
    const pendingTask = tasksArray.find(t =>
      t.type==="hifz" && t.status==="pending" && t.mission_start===hifzMission.startIndex
    );
    wrap.appendChild(buildMissionCard({
      title:"🎯 الحفظ",
      tagClass:"hifz",
      description:hifzMission.description,
      points:hifzMission.points,
      pendingText: pendingTask ? "قيد المراجعة لدى المعلم..." : "",
      buttonText: pendingTask ? "إلغاء الإرسال" : "أنجزت المهمة ✅",
      onClick: ()=> pendingTask
        ? cancelCurriculumTask(student.code, "hifz", hifzMission.startIndex)
        : submitCurriculumTask(student.code, hifzMission)
    }));
  }

  // مراجعة
  const murMission = getCurrentMurajaaMission(student);
  if (murMission){
    const pendingTask = tasksArray.find(t =>
      t.type==="murajaa" && t.status==="pending" &&
      t.murajaa_index===murMission.index && t.murajaa_level===murMission.level
    );
    wrap.appendChild(buildMissionCard({
      title:"📖 المراجعة",
      tagClass:"murajaa",
      description:murMission.description,
      points:murMission.points,
      pendingText: pendingTask ? "قيد المراجعة لدى المعلم..." : "",
      buttonText: pendingTask ? "إلغاء الإرسال" : "أنجزت المهمة ✅",
      onClick: ()=> pendingTask
        ? cancelMurajaaTask(student.code, murMission)
        : submitMurajaaTask(student.code, murMission)
    }));
  }

  // مهام عامة
  const generalTasks = tasksArray.filter(t=> t.type==="general");
  for (const task of generalTasks){
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
          task.status==="pending" ? "قيد المراجعة لدى المعلم..." :
          task.status==="completed" ? "تم اعتمادها ✅" : "بانتظار الإنجاز"
        }</span>
      </div>
    `;
    const footer = card.querySelector(".task-footer");
    const btn = document.createElement("button");
    btn.className = "button success";
    if (task.status==="assigned"){
      btn.textContent = "أنجزت المهمة ✅";
      btn.addEventListener("click", ()=> submitGeneralTask(student.code, task.id));
    } else if (task.status==="pending"){
      btn.textContent = "إلغاء الإرسال";
      btn.addEventListener("click", ()=> cancelGeneralTask(student.code, task.id));
    } else {
      btn.textContent = "منجزة"; btn.disabled = true;
    }
    footer.appendChild(btn);
    wrap.appendChild(card);
  }

  if (!hifzMission && !murMission && generalTasks.length===0){
    studentTasksDiv.innerHTML = '<p class="message info">لا توجد مهام حالياً. وفقك الله 🤍</p>';
  }else{
    studentTasksDiv.appendChild(wrap);
  }
}

function buildMissionCard({title, tagClass, description, points, pendingText, buttonText, onClick}){
  const card = document.createElement("div");
  card.className = "task-card";
  card.innerHTML = `
    <div class="task-header">
      <div class="task-title">${title}</div>
      <span class="task-type-tag ${tagClass}">${tagClass==="hifz"?"حفظ":"مراجعة"}</span>
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
  btn.addEventListener("click", onClick);
  footer.appendChild(btn);
  return card;
}

// =======================
// إرسال/إلغاء المهام
// =======================
async function submitCurriculumTask(studentCode, mission){
  try{
    const studentRef = doc(db,"students",studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    const tasks = Array.isArray(student.tasks)? student.tasks : [];
    if (tasks.some(t=> t.type==="hifz" && t.status==="pending" && t.mission_start===mission.startIndex)){
      showMessage(authMessage,"المهمة قيد المراجعة بالفعل.","info"); return;
    }

    tasks.push({
      id: generateUniqueId(),
      type:"hifz",
      description: mission.description,
      points: mission.points,
      status:"pending",
      mission_start: mission.startIndex,
      mission_last : mission.lastIndex,
      created_at: Date.now(),
    });

    await updateDoc(studentRef, { tasks });
    await displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage,"تم إرسال مهمة الحفظ للمراجعة.","success");
  }catch(e){
    console.error("Error submitCurriculumTask:", e);
    showMessage(authMessage, `حدث خطأ: ${e.message}`, "error");
  }
}

async function cancelCurriculumTask(studentCode, type, missionStartIndex){
  try{
    const studentRef = doc(db,"students",studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    const tasks = (Array.isArray(student.tasks)? student.tasks : [])
      .filter(t=> !(t.type===type && t.status==="pending" && t.mission_start===missionStartIndex));

    await updateDoc(studentRef,{ tasks });
    await displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage,"تم إلغاء إرسال المهمة وإعادتها لك.","success");
  }catch(e){
    console.error("Error cancelCurriculumTask:", e);
    showMessage(authMessage, `حدث خطأ: ${e.message}`, "error");
  }
}

async function submitMurajaaTask(studentCode, mission){
  try{
    const studentRef = doc(db,"students",studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    const tasks = Array.isArray(student.tasks)? student.tasks : [];
    if (tasks.some(t=> t.type==="murajaa" && t.status==="pending" && t.murajaa_index===mission.index && t.murajaa_level===mission.level)){
      showMessage(authMessage,"مهمة المراجعة قيد المراجعة بالفعل.","info"); return;
    }

    tasks.push({
      id: generateUniqueId(),
      type:"murajaa",
      description: mission.description,
      points: mission.points,
      status:"pending",
      murajaa_level: mission.level,
      murajaa_index: mission.index,
      created_at: Date.now(),
    });

    await updateDoc(studentRef, { tasks });
    await displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage,"تم إرسال مهمة المراجعة للمراجعة.","success");
  }catch(e){
    console.error("Error submitMurajaaTask:", e);
    showMessage(authMessage, `حدث خطأ: ${e.message}`, "error");
  }
}

async function cancelMurajaaTask(studentCode, mission){
  try{
    const studentRef = doc(db,"students",studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    const tasks = (Array.isArray(student.tasks)? student.tasks : [])
      .filter(t=> !(t.type==="murajaa" && t.status==="pending" && t.murajaa_level===mission.level && t.murajaa_index===mission.index));

    await updateDoc(studentRef,{ tasks });
    await displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage,"تم إلغاء إرسال مهمة المراجعة وإعادتها لك.","success");
  }catch(e){
    console.error("Error cancelMurajaaTask:", e);
    showMessage(authMessage, `حدث خطأ: ${e.message}`, "error");
  }
}

// مهام عامة
async function submitGeneralTask(studentCode, taskId){
  try{
    const studentRef = doc(db,"students",studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    const tasks = Array.isArray(student.tasks)? student.tasks : [];
    const i = tasks.findIndex(t=> t.id===taskId);
    if (i===-1) return;
    if (tasks[i].status==="pending"){ showMessage(authMessage,"المهمة قيد المراجعة بالفعل.","info"); return; }

    tasks[i].status = "pending";
    await updateDoc(studentRef, { tasks });
    await displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage,"تم إرسال المهمة العامة للمراجعة.","success");
  }catch(e){
    console.error("Error submitGeneralTask:", e);
    showMessage(authMessage, `حدث خطأ: ${e.message}`, "error");
  }
}

async function cancelGeneralTask(studentCode, taskId){
  try{
    const studentRef = doc(db,"students",studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;
    const student = snap.data();

    const tasks = Array.isArray(student.tasks)? student.tasks : [];
    const i = tasks.findIndex(t=> t.id===taskId);
    if (i===-1) return;

    if (tasks[i].status==="pending") tasks[i].status = "assigned";
    await updateDoc(studentRef,{ tasks });
    await displayStudentDashboard({ code: studentCode, ...student, tasks });
    showMessage(authMessage,"تم إلغاء إرسال المهمة العامة.","success");
  }catch(e){
    console.error("Error cancelGeneralTask:", e);
    showMessage(authMessage, `حدث خطأ: ${e.message}`, "error");
  }
}

// =======================
// شاشة المعلم: مراجعة + لوحة الشرف
// =======================

// شاشة المعلم: مراجعة + لوحة الشرف (نسخة جديدة من loadPendingTasksForReview)
async function loadPendingTasksForReview(){
  pendingTasksList.innerHTML = '<p class="message info">جارٍ تحميل المهام...</p>';
  try{
    const colRef = collection(db,"students");
    const snap   = await getDocs(colRef);

    // مصفوفات منفصلة حسب نوع المهمة
    const pendingHifz     = [];
    const pendingMurajaa  = [];
    const pendingGeneral  = [];

    snap.forEach(docSnap=>{
  const student = docSnap.data();
  if (!isInCurrentHalaqa(student)) return;

  const pending = (student.tasks||[]).filter(t=> t.status==="pending");
  if (!pending.length) return;


        const entry = {
          studentCode: student.code,
          studentName: student.name,
          task,
        };

        if (task.type === "hifz") {
          pendingHifz.push(entry);
        } else if (task.type === "murajaa") {
          pendingMurajaa.push(entry);
        } else {
          // general أو أي نوع آخر
          pendingGeneral.push(entry);
        }
      });

    // ترتيب حسب الأقدم أولاً (created_at تصاعدي)
    const sortByCreatedAt = (arr) => {
      arr.sort((a,b)=> (a.task.created_at || 0) - (b.task.created_at || 0));
    };
    sortByCreatedAt(pendingHifz);
    sortByCreatedAt(pendingMurajaa);
    sortByCreatedAt(pendingGeneral);

    const totalCount = pendingHifz.length + pendingMurajaa.length + pendingGeneral.length;
    if (!totalCount){
      pendingTasksList.innerHTML = '<p class="message success">لا توجد مهام بانتظار المراجعة حالياً 🎉</p>';
      return;
    }

    // دالة مساعدة لبناء قسم لكل نوع مهمة
    const buildSection = (titleText, arr) => {
      if (!arr.length) return;

      const section = document.createElement("div");
      // كلاس إضافي اختياري، ما يحتاج يكون له ستايل في CSS
      section.className = "review-section-by-type";

      const h4 = document.createElement("h4");
      h4.textContent = titleText;
      section.appendChild(h4);

      let lastStudentCode = null;
      let block = null;

      arr.forEach(({ studentCode, studentName, task }) => {
        // إذا تغيّر الطالب، نبدأ بلوك جديد
        if (studentCode !== lastStudentCode) {
          block = document.createElement("div");
          block.className = "review-student-block";

          const title = document.createElement("div");
          title.className  = "review-student-title";
          title.textContent= `الطالب: ${studentName} (${studentCode})`;
          block.appendChild(title);

          section.appendChild(block);
          lastStudentCode = studentCode;
        }

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
          <div class="review-task-body">${task.description}</div>
        `;

        const footer = document.createElement("div");
        footer.className = "review-task-footer";

        const ok = document.createElement("button");
        ok.className = "button success";
        ok.textContent = "قبول ✅";
        ok.addEventListener("click", () => reviewTask(studentCode, task.id, "approve"));

        const no = document.createElement("button");
        no.className = "button danger";
        no.textContent = "رفض ❌";
        no.addEventListener("click", () => reviewTask(studentCode, task.id, "reject"));

        footer.append(ok, no);
        item.appendChild(footer);
        block.appendChild(item);
      });

      pendingTasksList.appendChild(section);
    };

    // تفريغ القائمة وبناء الأقسام الثلاثة
    pendingTasksList.innerHTML = "";
    buildSection("مهام الحفظ بانتظار المراجعة", pendingHifz);
    buildSection("مهام المراجعة بانتظار المراجعة", pendingMurajaa);
    buildSection("مهام عامة بانتظار المراجعة", pendingGeneral);

  }catch(e){
    console.error("Error loadPendingTasksForReview:", e);
    pendingTasksList.innerHTML = `<p class="message error">خطأ في تحميل المهام: ${e.message}</p>`;
  }
}


async function loadHonorBoard(){
  if (!honorBoardDiv) return;
  honorBoardDiv.innerHTML = '<p class="message info">جارٍ تحديث لوحة الشرف...</p>';
  try{
    const students = await fetchAllStudentsSortedByPoints(isInCurrentHalaqa);
    if (!students.length){
      honorBoardDiv.innerHTML = '<p class="message info">لا يوجد طلاب مسجلون بعد في هذه الحلقة.</p>';
      return;
    }
    const top = students.slice(0,5);
    const list = document.createElement("ol");
    top.forEach(s=>{
      const li = document.createElement("li");
      li.textContent = `${s.name} (${s.code}) – ${s.total_points||0} نقطة`;
      list.appendChild(li);
    });
    honorBoardDiv.innerHTML = "";
    const title = document.createElement("p");
    title.className = "small-text";
    title.textContent = "أعلى الطلاب نقاطاً في هذه الحلقة:";
    honorBoardDiv.append(title, list);
  }catch(e){
    console.error("Error loadHonorBoard:", e);
    honorBoardDiv.innerHTML = `<p class="message error">خطأ في تحميل لوحة الشرف: ${e.message}</p>`;
  }
}


async function reviewTask(studentCode, taskId, action){
  try{
    const studentRef = doc(db,"students",studentCode);
    const snap = await getDoc(studentRef);
    if (!snap.exists()) return;

    const student = snap.data();
    const tasks = Array.isArray(student.tasks)? student.tasks : [];
    const i = tasks.findIndex(t=> t.id===taskId);
    if (i===-1){ showMessage(authMessage,"المهمة غير موجودة.","error"); return; }
    const task = tasks[i];
    if (task.status!=="pending"){ showMessage(authMessage,"المهمة ليست بانتظار المراجعة.","error"); return; }

    if (action==="approve"){
      student.total_points = (student.total_points||0) + (task.points||0);

      if (task.type==="hifz"){
        const last = task.mission_last ?? task.mission_start ?? 0;
        student.hifz_progress = last + 1;
      } else if (task.type==="murajaa"){
        const level = student.murajaa_level || task.murajaa_level || "BUILDING";
        const arr = getReviewArrayForLevel(level);
        const len = arr.length;

        let start = student.murajaa_start_index ?? task.murajaa_index ?? 0;
        start = len ? ((start%len)+len)%len : 0;

        let cur = student.murajaa_progress_index ?? task.murajaa_index ?? start;
        cur = len ? ((cur%len)+len)%len : start;

        const next = len ? (cur+1)%len : start;
        let cycles = student.murajaa_cycles || 0;
        if (len && next===start) cycles += 1;

        student.murajaa_level = level;
        student.murajaa_start_index = start;
        student.murajaa_progress_index = next;
        student.murajaa_cycles = cycles;
      }

      tasks[i].status = "completed";

      await updateDoc(studentRef,{
        tasks,
        total_points: student.total_points,
        hifz_start_id: student.hifz_start_id ?? 0,
        hifz_end_id  : student.hifz_end_id ?? (HIFZ_CURRICULUM.length-1),
        hifz_progress: student.hifz_progress ?? 0,
        murajaa_level: student.murajaa_level || "BUILDING",
        murajaa_start_index: student.murajaa_start_index ?? 0,
        murajaa_progress_index: student.murajaa_progress_index ?? 0,
        murajaa_cycles: student.murajaa_cycles || 0,
      });

      showMessage(authMessage, `تم قبول المهمة وإضافة ${task.points} نقطة للطالب ${student.name}.`, "success");
    } else {
      // reject
      if (task.type==="general"){
        tasks[i].status = "assigned";
      } else {
        tasks.splice(i,1);
      }
      await updateDoc(studentRef,{ tasks });
      showMessage(authMessage, `تم رفض المهمة وإعادتها للطالب ${student.name}.`, "info");
    }

    await loadPendingTasksForReview();
    await loadHonorBoard();
    const manageTab = $("#manage-students-tab");
    if (manageTab && !manageTab.classList.contains("hidden")) await loadStudentsForTeacher();

  }catch(e){
    console.error("Error reviewTask:", e);
    showMessage(authMessage, `خطأ في مراجعة المهمة: ${e.message}`, "error");
  }
}

// =======================
// تعيين مهام (معلم)
// =======================
assignIndividualTaskButton?.addEventListener("click", async ()=>{
  const code = assignTaskStudentCode.value.trim();
  const type = assignTaskType.value;
  const description = assignTaskDescription.value.trim();
  const points = parseInt(assignTaskPoints.value,10);

  if (!code || !description || isNaN(points) || points<=0){
    showMessage(assignTaskMessage,"الرجاء تعبئة رمز الطالب والوصف والنقاط بشكل صحيح.","error"); return;
  }

  const task = { id:generateUniqueId(), type, description, points, status:"assigned", created_at:Date.now() };

  try{
    const studentRef = doc(db,"students",code);
    const snap = await getDoc(studentRef);
    if (!snap.exists()){ showMessage(assignTaskMessage,"الطالب غير موجود.","error"); return; }

    const tasks = Array.isArray(snap.data().tasks)? snap.data().tasks : [];
    tasks.push(task);
    await updateDoc(studentRef,{ tasks });
    showMessage(assignTaskMessage,"تم تعيين المهمة للطالب.","success");
  }catch(e){
    console.error("Error assignIndividualTask:", e);
    showMessage(assignTaskMessage, `حدث خطأ في تعيين المهمة: ${e.message}`, "error");
  }
});

assignGroupTaskButton?.addEventListener("click", async ()=>{
  const type = assignTaskType.value;
  const description = assignTaskDescription.value.trim();
  const points = parseInt(assignTaskPoints.value,10);

  if (!description || isNaN(points) || points<=0){
    showMessage(assignTaskMessage,"الرجاء تعبئة الوصف والنقاط بشكل صحيح.","error"); return;
  }

  const task = { id:generateUniqueId(), type, description, points, status:"assigned", created_at:Date.now() };

  try{
    const colRef = collection(db,"students");
    const snap = await getDocs(colRef);
    const batch = writeBatch(db);
   snap.forEach(d=>{
     const s = d.data();
     if (currentTeacherHalaqa && currentTeacherHalaqa !== "ALL"){
       const h = s.halaqa || "ONSITE";
       if (h !== currentTeacherHalaqa) return;
     }
     batch.update(doc(db,"students",d.id), { tasks: arrayUnion(task) });
   });

    await batch.commit();
    showMessage(assignTaskMessage,"تم تعيين المهمة لجميع الطلاب.","success");
  }catch(e){
    console.error("Error assignGroupTask:", e);
    showMessage(assignTaskMessage, `حدث خطأ في تعيين المهمة الجماعية: ${e.message}`, "error");
  }
});

// =======================
// إدارة الطلاب
// =======================
function populateHifzSelects(){
  if (!newStudentHifzStart || !newStudentHifzEnd) return;
  const options = HIFZ_CURRICULUM.map((item, i)=> `<option value="${i}">(${i}) ${item.surah_name_ar} (${item.start_ayah}-${item.end_ayah})</option>`).join("");
  newStudentHifzStart.innerHTML = options;
  newStudentHifzEnd.innerHTML   = options;
}

function populateMurajaaStartSelect(){
  if (!newStudentMurajaaLevel || !newStudentMurajaaStart) return;
  const arr = getReviewArrayForLevel(newStudentMurajaaLevel.value || "BUILDING");
  if (!arr?.length){ newStudentMurajaaStart.innerHTML = '<option value="0">لا توجد مهام لهذا المستوى</option>'; return; }
  newStudentMurajaaStart.innerHTML = arr.map((it,i)=> `<option value="${i}">(${i}) ${it.name}</option>`).join("");
}

newStudentMurajaaLevel?.addEventListener("change", populateMurajaaStartSelect);

async function loadStudentsForTeacher(){
  studentList.innerHTML = "<li>جارٍ تحميل الطلاب...</li>";
  try{
    const students = await fetchAllStudentsSortedByPoints(isInCurrentHalaqa);
    if (!students.length){ studentList.innerHTML = "<li>لا يوجد طلاب مسجلون بعد.</li>"; return; }

    studentList.innerHTML = "";
    students.forEach((s, i)=>{
      const hifzPercent = computeHifzPercent(s);
      const murPercent  = computeMurajaaPercent(s);
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="student-line">
          <div class="student-main">#${i+1} - ${s.name} (${s.code})</div>
          <div class="student-sub">حفظ: ${hifzPercent}% | مراجعة: ${murPercent}% | نقاط: ${s.total_points||0}</div>
          <div class="student-sub">ولي الأمر: ${s.parent_name||"غير مسجل"} (${s.parent_code||"—"})</div>
          <div class="student-actions"><button class="button primary btn-edit-student" data-code="${s.code}">تعديل</button></div>
        </div>
      `;
      studentList.appendChild(li);
    });

    document.querySelectorAll(".btn-edit-student").forEach(btn=>{
      btn.addEventListener("click", (e)=> loadStudentIntoForm(e.target.dataset.code));
    });
  }catch(e){
    console.error("Error loadStudentsForTeacher:", e);
    studentList.innerHTML = "<li>حدث خطأ أثناء تحميل قائمة الطلاب.</li>";
  }
}

async function loadStudentIntoForm(code){
  try{
    const snap = await getDoc(doc(db,"students",code));
    if (!snap.exists()) return;
    const s = snap.data();

    editingStudentCode = s.code;
    studentFormTitle.textContent = `تعديل بيانات الطالب: ${s.name}`;

    if (!newStudentHifzStart.options.length || !newStudentHifzEnd.options.length) populateHifzSelects();

    newStudentCodeInput.value        = s.code;
    newStudentNameInput.value        = s.name;
    newStudentParentNameInput.value  = s.parent_name || "";
    newStudentParentCodeInput.value  = s.parent_code || "";

    newStudentHifzStart.value        = s.hifz_start_id ?? s.hifz_progress ?? 0;
    newStudentHifzEnd.value          = s.hifz_end_id ?? (HIFZ_CURRICULUM.length-1);
    newStudentHifzLevel.value        = s.hifz_level || 1;

    newStudentMurajaaLevel.value     = s.murajaa_level || "BUILDING";
    populateMurajaaStartSelect();
    const arr = getReviewArrayForLevel(newStudentMurajaaLevel.value);
    const def = s.murajaa_start_index ?? s.murajaa_progress_index ?? 0;
    newStudentMurajaaStart.value     = (arr?.length ? Math.min(def, arr.length-1) : 0).toString();
    if (newStudentHalaqa) newStudentHalaqa.value = s.halaqa || "ONSITE";

    activateTab("manage-students-tab");
  }catch(e){
    console.error("Error loadStudentIntoForm:", e);
  }
}

registerStudentButton?.addEventListener("click", async ()=>{
  const code = newStudentCodeInput.value.trim();
  const name = newStudentNameInput.value.trim();
  const parentName = newStudentParentNameInput.value.trim() || null;
  const parentCode = newStudentParentCodeInput.value.trim() || null;

  const hifzStartIndex = parseInt(newStudentHifzStart.value,10);
  const hifzEndIndex   = parseInt(newStudentHifzEnd.value,10);
  const hifzLevel      = parseInt(newStudentHifzLevel.value,10);
  const murajaaLevel   = newStudentMurajaaLevel.value;
  const murajaaStartIndex = parseInt(newStudentMurajaaStart.value,10) || 0;
  const halaqaValue    = newStudentHalaqa?.value || "ONSITE";


  if (!code || !name || isNaN(hifzStartIndex) || isNaN(hifzEndIndex)){
    showMessage(registerStudentMessage,"الرجاء تعبئة جميع الحقول الأساسية بشكل صحيح.","error"); return;
  }
  if (hifzEndIndex < hifzStartIndex){
    showMessage(registerStudentMessage,"نقطة نهاية الحفظ يجب أن تكون بعد نقطة البداية.","error"); return;
  }

  try{
    const studentRef = doc(db,"students",code);
    const snap = await getDoc(studentRef);
    const existing = snap.exists()? snap.data() : null;

    const baseData = {
      code, name, role:"student",
      halaqa: halaqaValue,
      parent_name: parentName, parent_code: parentCode,
      hifz_start_id: hifzStartIndex,
      hifz_end_id  : hifzEndIndex,
      hifz_progress: existing ? (existing.hifz_progress ?? hifzStartIndex) : hifzStartIndex,
      hifz_level   : hifzLevel,
      murajaa_level: murajaaLevel,
      murajaa_start_index  : murajaaStartIndex,
      murajaa_progress_index: murajaaStartIndex,
      murajaa_cycles: existing ? (existing.murajaa_cycles||0) : 0,
      total_points : existing ? (existing.total_points||0) : 0,
      tasks        : existing ? (existing.tasks||[]) : [],
    };

    await setDoc(studentRef, baseData, { merge:true });
    showMessage(registerStudentMessage,"تم حفظ بيانات الطالب.","success");
    editingStudentCode = null;
    studentFormTitle.textContent = "إضافة / تعديل طالب";

    await loadStudentsForTeacher();
    await loadHonorBoard();
  }catch(e){
    console.error("Error registerStudent:", e);
    showMessage(registerStudentMessage, `حدث خطأ في حفظ بيانات الطالب: ${e.message}`, "error");
  }
});

// =======================
// عرض المنهج (لوحة المعلم)
// =======================
function displayCurriculumsInTeacherPanel(){
  hifzCurriculumDisplay.innerHTML = HIFZ_CURRICULUM.map((it,i)=>
    `<div class="curriculum-item">(${i}) ${it.surah_name_ar} (${it.start_ayah}-${it.end_ayah}) – نقاط: ${it.points||0}</div>`
  ).join("");

  murajaaCurriculumDisplay.innerHTML = Object.entries(REVIEW_CURRICULUM)
    .map(([level, items])=>{
      const title = level==="BUILDING"?"البناء": level==="DEVELOPMENT"?"التطوير":"المتقدم";
      const list  = items.map((it,i)=> `<div class="curriculum-item">(${i}) ${it.name} – نقاط: ${it.points||0}</div>`).join("");
      return `<h4>${title}</h4>${list}`;
    })
    .join("<hr />");
}

// =======================
// ولي الأمر
// =======================
async function displayParentDashboard(parentCode){
  try{
    const snap = await getDocs(collection(db,"students"));
    const all = []; snap.forEach(d=> all.push(d.data()));
    const children = all.filter(s=> s.parent_code===parentCode);

        const {
      buildingSorted,
      buildingRankMap,
      devAdvSorted,
      devAdvRankMap,
    } = buildGroupedRanks(all);


    welcomeParent.textContent = `مرحبًا بك يا ولي الأمر (${parentCode})`;
    parentChildrenList.innerHTML = "";

    if (!children.length){
      parentChildrenList.innerHTML = '<p class="message info">لا يوجد أبناء مربوطون بهذا الرمز.</p>';
    } else {
      children.forEach(s=>{
        const startIndex = Number.isFinite(s.hifz_start_id)? s.hifz_start_id : 0;
        const endIndex   = Number.isFinite(s.hifz_end_id)? s.hifz_end_id : (HIFZ_CURRICULUM.length-1);
        const startItem  = HIFZ_CURRICULUM[startIndex] || null;
        const endItem    = HIFZ_CURRICULUM[endIndex]   || null;
        const startSurah = startItem ? startItem.surah_name_ar : "غير محددة";
        const endSurah   = endItem   ? endItem.surah_name_ar   : "غير محددة";

        const hifzPercent = computeHifzPercent(s);
        let motivation = "🔵 في بداية الطريق";
        if (hifzPercent>=75) motivation = "🟢 قارب على إنهاء خطته";
        else if (hifzPercent>=30) motivation = "🟡 في منتصف الخطة";

        const hifzMission = getCurrentHifzMission(s);
        const murMission  = getCurrentMurajaaMission(s);

        const el = document.createElement("div");
        el.className = "child-card";
        el.innerHTML = `
          <div class="child-name">${s.name} (${s.code})</div>
          <div class="child-line">خطة الحفظ: من سورة <strong>${startSurah}</strong> إلى سورة <strong>${endSurah}</strong></div>
          <div class="child-line">إنجاز الحفظ: <strong>${hifzPercent}%</strong></div>
          <div class="progress-bar"><div class="progress-fill" style="width:${hifzPercent}%"></div></div>
          <div class="child-line">${motivation}</div>
          <div class="child-line">مجموع النقاط: <strong>${s.total_points||0}</strong></div>
          <div class="child-line">الترتيب داخل ${groupTitle}: <strong>${childRank}</strong></div>
          <div class="child-line">مهمة الحفظ الحالية: <span>${hifzMission? hifzMission.description : "لا توجد"}</span></div>
          <div class="child-line">مهمة المراجعة الحالية: <span>${murMission? murMission.description : "لا توجد"}</span></div>
        `;
        parentChildrenList.appendChild(el);
      });
    }

    hideAllScreens();
    parentScreen.classList.remove("hidden");
  }catch(e){
    console.error("Error displayParentDashboard:", e);
    parentChildrenList.innerHTML = `<p class="message error">خطأ في تحميل بيانات الأبناء: ${e.message}</p>`;
  }
}

// =======================
// تبويبات المعلم
// =======================
function activateTab(tabId){
  document.querySelectorAll(".tab-content").forEach(el=> el.classList.add("hidden"));
  document.querySelectorAll(".tab-button").forEach(btn=> btn.classList.toggle("active", btn.dataset.tab===tabId));
  const target = document.getElementById(tabId);
  target?.classList.remove("hidden");

  if (tabId==="review-tasks-tab"){ loadPendingTasksForReview(); loadHonorBoard(); }
  else if (tabId==="manage-students-tab"){ loadStudentsForTeacher(); }
  else if (tabId==="curriculum-tab"){ displayCurriculumsInTeacherPanel(); }
}

tabButtons.forEach(btn=> btn.addEventListener("click", ()=> activateTab(btn.dataset.tab)));

// =======================
// تسجيل الدخول + الخروج
// =======================
loginButton.addEventListener("click", async ()=>{
  const code = userCodeInput.value.trim();
  if (!code){ showMessage(authMessage, "الرجاء إدخال رمز الدخول.", "error"); return; }

  try{
    if (code==="teacher1"){
      currentUser = { role:"teacher", name:"المعلم" };
      hideAllScreens();
      teacherScreen.classList.remove("hidden");
      activateTab("review-tasks-tab");
      return;
    }

    // طالب
    const studentRef  = doc(db,"students",code);
    const studentSnap = await getDoc(studentRef);
    if (studentSnap.exists()){
      const data = studentSnap.data();
      currentUser = { role:"student", code, name: data.name || "طالب" }; // تثبيت حالة الطالب
      await displayStudentDashboard({ code, ...data });
      return;
    }

    // ولي أمر
    const qRef = query(collection(db,"students"), where("parent_code","==",code));
    const qSnap= await getDocs(qRef);
    if (!qSnap.empty){
      currentUser = { role:"parent", code };
      await displayParentDashboard(code);
      return;
    }

    showMessage(authMessage,"رمز الدخول غير صحيح.","error");
  }catch(e){
    console.error("Login error:", e);
    showMessage(authMessage, `خطأ في الاتصال بالخادم: ${e.message}`, "error");
  }
});

function logout(){
  currentUser = null;
  userCodeInput.value = "";
  hideAllScreens();
  authScreen.classList.remove("hidden");
  showMessage(authMessage, "تم تسجيل الخروج بنجاح.", "success");
}

logoutButtonStudent?.addEventListener("click", logout);
logoutButtonTeacher?.addEventListener("click", logout);
logoutButtonParent?.addEventListener("click", logout);

// تحديثات
refreshStudentButton?.addEventListener("click", refreshStudentView);
refreshTeacherButton?.addEventListener("click", refreshTeacherView);

async function refreshStudentView(){
  if (!currentUser?.code){ console.warn("No currentUser/code at refresh:", currentUser); return; }
  try{
    const snap = await getDoc(doc(db,"students", currentUser.code));
    if (!snap.exists()){ showMessage(authMessage,"تعذر العثور على بيانات الطالب.","error"); return; }
    await displayStudentDashboard({ code: currentUser.code, ...snap.data() });
  }catch(e){
    console.error("Error refreshStudentView:", e);
    showMessage(authMessage, `خطأ في تحديث بيانات الطالب: ${e.message}`, "error");
  }
}

function getActiveTeacherTabId(){
  const active = document.querySelector(".tab-content:not(.hidden)");
  return active ? active.id : null;
}

function refreshTeacherView(){
  const id = getActiveTeacherTabId();
  if (!id) return;
  if (id==="review-tasks-tab") loadPendingTasksForReview();
  else if (id==="manage-students-tab") loadStudentsForTeacher();
  else if (id==="curriculum-tab") displayCurriculumsInTeacherPanel();
}

// =======================
// تهيئة
// =======================
populateHifzSelects();
populateMurajaaStartSelect();
console.log("App ready. Curriculum loaded from external file.");
// end of file







