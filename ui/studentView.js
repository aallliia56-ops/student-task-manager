const studentHifzNextLabel = document.querySelector("#student-hifz-next-label");
const studentMurajaaNextLabel = document.querySelector("#student-murajaa-next-label");

console.log("STUDENT_VIEW_VERSION_2026_04_08_A");

const studentScreen = document.querySelector("#student-screen");
const studentTabs = document.querySelector(".student-tabs");
const studentMainTasksSection = document.querySelector("#student-main-tasks");
const studentAssistantSection = document.querySelector("#student-assistant-tab");
const studentProgressSection = document.querySelector("#student-screen .progress-section");
const studentAssistantTasksList = document.querySelector("#student-assistant-tasks");
const studentWeekStrip = document.querySelector("#student-week-strip");
let studentAssistantExpanded = false;

import { getCurrentMurajaaMission, getNextMurajaaMission } from "../core/missions.js";
import { renderStudentProgress } from "./student/progress.js";
import { getStudentHifzPauseCardCopy, renderStudentTasks as renderStudentTasksFromTasks } from "./student/tasks.js";
import { renderStudentPrograms } from "./student/programs.js";
import { HIFZ_CURRICULUM } from "../data/curriculum.js";
import {
  hasExternalCurriculumRuntime,
  getExternalHifzPlanBounds,
} from "../modules/curriculum/curriculum-runtime.js";
import { DEFAULT_HALAQA } from "../app/halaqa-utils.js";

const $ = (s) => document.querySelector(s);

function insertAfter(parent, node, referenceNode) {
  if (!parent || !node || !referenceNode) return;

  if (referenceNode.parentNode !== parent) {
    parent.appendChild(node);
    return;
  }

  if (referenceNode.nextSibling) {
    parent.insertBefore(node, referenceNode.nextSibling);
    return;
  }

  parent.appendChild(node);
}

function ensureStudentStatsCard() {
  if (!studentScreen) return null;

  let statsCard = studentScreen.querySelector("#student-stats-card");
  if (statsCard) return statsCard;

  statsCard = document.createElement("section");
  statsCard.id = "student-stats-card";
  statsCard.className = "student-stats-card";
  statsCard.setAttribute("dir", "rtl");
  return statsCard;
}

function buildStudentStatsCardMarkup({ hasStreak = false } = {}) {
  return `
    <div class="student-stat-item">
      <span class="student-stat-label">اليوم</span>
      <div class="student-stat-content">
        <strong id="student-stat-today" class="student-stat-value">—</strong>
        <span class="student-stat-icon student-stat-icon-today" aria-hidden="true">🗓</span>
      </div>
    </div>
    ${hasStreak ? `
    <div class="student-stat-item">
      <span class="student-stat-label">ستريك</span>
      <div class="student-stat-content">
        <strong id="student-stat-streak" class="student-stat-value">—</strong>
        <span class="student-stat-icon student-stat-icon-streak" aria-hidden="true">🔥</span>
      </div>
    </div>` : ""}
    <div class="student-stat-item">
      <span class="student-stat-label">الترتيب</span>
      <div class="student-stat-content">
        <strong id="student-stat-rank" class="student-stat-value">—</strong>
        <span class="student-stat-icon student-stat-icon-rank" aria-hidden="true">🏆</span>
      </div>
    </div>
    <div class="student-stat-item">
      <span class="student-stat-label">النقاط</span>
      <div class="student-stat-content">
        <strong id="student-stat-points" class="student-stat-value">0</strong>
        <span class="student-stat-icon student-stat-icon-points" aria-hidden="true">★</span>
      </div>
    </div>
  `;
}

function getLiveStudentStreakValue() {
  const streakBadge = document.querySelector("#student-daily-streak-badge");
  const rawText = String(streakBadge?.textContent || "").trim();
  if (!rawText) return null;

  const match = rawText.match(/(\d+)/);
  return match ? match[1] : null;
}

function setStudentStatsCardValues({ points = 0, rank = "—", today = "—", streak = null }) {
  const statsCard = ensureStudentStatsCard();
  if (!statsCard) return;

  const hasStreak = streak !== null && streak !== undefined && String(streak).trim() !== "";
  if (statsCard.dataset.hasStreak !== String(hasStreak)) {
    statsCard.innerHTML = buildStudentStatsCardMarkup({ hasStreak });
    statsCard.dataset.hasStreak = String(hasStreak);
  }

  statsCard.querySelector("#student-stat-points")?.replaceChildren(document.createTextNode(String(points)));
  statsCard.querySelector("#student-stat-rank")?.replaceChildren(document.createTextNode(String(rank)));
  statsCard.querySelector("#student-stat-today")?.replaceChildren(document.createTextNode(String(today)));
  statsCard.querySelector("#student-stat-streak")?.replaceChildren(document.createTextNode(String(streak ?? "—")));
}

function getTodayArabicLabel() {
  const dayIndex = new Date().getDay();
  const labels = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
  return labels[dayIndex] || "—";
}

function ensureStudentAssistantToggle() {
  if (!studentScreen || !studentMainTasksSection || !studentAssistantSection) return null;

  let wrapper = studentScreen.querySelector(".student-assistant-toggle-wrap");
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.className = "student-assistant-toggle-wrap";
    wrapper.innerHTML = `
      <button
        type="button"
        class="student-assistant-toggle"
        aria-expanded="false"
        title="مهام المساعد"
      >
        <span class="student-assistant-toggle-icon" aria-hidden="true">⌄</span>
        <span class="student-assistant-toggle-text">مهام المساعد</span>
      </button>
    `;
    studentScreen.insertBefore(wrapper, studentAssistantSection);

    wrapper.querySelector(".student-assistant-toggle")?.addEventListener("click", () => {
      studentAssistantExpanded = !studentAssistantExpanded;
      syncStudentAssistantPanel();
    });
  }

  if (studentAssistantSection.previousElementSibling !== wrapper) {
    studentScreen.insertBefore(wrapper, studentAssistantSection);
  }

  return wrapper;
}

function ensureStudentAssistantEmptyState() {
  if (!studentAssistantTasksList) return;
  const hasRenderedTasks = !!studentAssistantTasksList.querySelector(".review-student-block");
  if (!hasRenderedTasks) {
    studentAssistantTasksList.innerHTML = '<p class="message info">لا توجد مهام مساعد حاليًا.</p>';
  }
}

function syncStudentAssistantPanel() {
  const wrapper = ensureStudentAssistantToggle();
  const button = wrapper?.querySelector(".student-assistant-toggle");
  ensureStudentAssistantEmptyState();
  studentAssistantSection?.classList.toggle("hidden", !studentAssistantExpanded);

  if (button) {
    button.setAttribute("aria-expanded", String(studentAssistantExpanded));
    button.classList.toggle("is-open", studentAssistantExpanded);
  }
}

function arrangeStudentScreenLayout() {
  if (!studentScreen) return;

  const header = studentScreen.querySelector(".dashboard-header");
  const headerActions = header?.querySelector(".header-actions");
  const headerPrimary = document.querySelector("#welcome-student")?.parentElement;
  const planStrip = document.querySelector("#student-plan-strip");
  const planStripParent = planStrip?.parentElement;
  const progressSection = studentProgressSection;
  const statsCard = ensureStudentStatsCard();

  if (header && headerActions && header.firstElementChild !== headerActions) {
    header.insertBefore(headerActions, headerPrimary || header.firstElementChild);
  }

  studentTabs?.classList.add("hidden");

  const assistantToggle = ensureStudentAssistantToggle();
  if (headerPrimary && planStrip && headerPrimary.nextElementSibling !== planStrip) {
    insertAfter(headerPrimary.parentElement || studentScreen, planStrip, headerPrimary);
  }
  if (planStrip && planStripParent && statsCard) {
    if (!statsCard.parentNode) {
      insertAfter(planStripParent, statsCard, planStrip);
    } else if (statsCard.parentNode !== planStripParent || statsCard.previousElementSibling !== planStrip) {
      insertAfter(planStripParent, statsCard, planStrip);
    }
  }
  if (studentMainTasksSection && progressSection) {
    insertAfter(studentScreen, progressSection, studentMainTasksSection);
  }
  if (progressSection && studentWeekStrip) {
    insertAfter(studentScreen, studentWeekStrip, progressSection);
  }
  if (studentWeekStrip && assistantToggle) {
    insertAfter(studentScreen, assistantToggle, studentWeekStrip);
  }
  if (assistantToggle && studentAssistantSection) {
    insertAfter(studentScreen, studentAssistantSection, assistantToggle);
  }

  studentMainTasksSection?.classList.remove("hidden");
  studentProgressSection?.classList.remove("hidden");
  syncStudentAssistantPanel();
}

function resetStudentAssistantPanel() {
  studentAssistantExpanded = false;
  syncStudentAssistantPanel();
}

export { renderStudentTasksFromTasks as renderStudentTasks };
export async function displayStudentDashboard(params) {

  const {
    student,
    fetchStudentByCode,
    db,
    showMessage,
    authMessage,
    renderStudentTasks,
    submitCurriculumTask,
    cancelCurriculumTask,
    submitMurajaaTask,
    cancelMurajaaTask,
    submitFlexibleHifzTask,
    submitGeneralTask,
    cancelGeneralTask,
    loadAssistantTasksForCurrentUser,
    generateUniqueId,
    getStudentEls,
    safeSetText,
    fetchStudentsSortedByPointsForHalaqa,
    updatePlanStrip,
    renderStudentWeekStrip,
    CONFIG,
    hideAllScreens
  } = params; 
  try {
    console.log("[refresh] student displayStudentDashboard start", {
      incomingCode: student?.code || null,
      hasFetchStudentByCode: typeof fetchStudentByCode === "function",
    });
    const resolvedStudent = student?.code && typeof fetchStudentByCode === "function"
      ? (await fetchStudentByCode(student.code)) || student
      : student;
    console.log("[refresh] student displayStudentDashboard resolved", {
      code: resolvedStudent?.code || null,
      name: resolvedStudent?.name || null,
    });

    const els = getStudentEls();
    safeSetText(els.welcome, resolvedStudent.name || "طالب");
    arrangeStudentScreenLayout();
    resetStudentAssistantPanel();
    if (typeof renderStudentWeekStrip === "function") {
      renderStudentWeekStrip(resolvedStudent);
    }

    const planBounds = hasExternalCurriculumRuntime()
      ? getExternalHifzPlanBounds(resolvedStudent)
      : (() => {
          const startIdx = resolvedStudent.hifz_start_id ?? 0;
          const endIdx = resolvedStudent.hifz_end_id ?? HIFZ_CURRICULUM.length - 1;
          const startItem = HIFZ_CURRICULUM[startIdx];
          const endItem = HIFZ_CURRICULUM[endIdx];
          return {
            startLabel: startItem ? startItem.surah_name_ar : "—",
            endLabel: endItem ? endItem.surah_name_ar : "—",
          };
        })();
    const points = resolvedStudent.total_points || 0;

    const studentHalaqa = resolvedStudent.halaqa || DEFAULT_HALAQA;
    const sameHalaqa = await fetchStudentsSortedByPointsForHalaqa(studentHalaqa);

    const level = resolvedStudent.murajaa_level || "BUILDING";
    let rankOnly = "—";

    if (level === "BUILDING") {
      const buildingGroup = sameHalaqa.filter((s) => (s.murajaa_level || "BUILDING") === "BUILDING");
      const idx = buildingGroup.findIndex((s) => s.code === resolvedStudent.code);
      if (idx !== -1) rankOnly = String(idx + 1);
    } else {
      const devAdvGroup = sameHalaqa.filter((s) => {
        const lv = s.murajaa_level || "BUILDING";
        return lv === "DEVELOPMENT" || lv === "ADVANCED";
      });
      const idx = devAdvGroup.findIndex((s) => s.code === resolvedStudent.code);
      if (idx !== -1) rankOnly = String(idx + 1);
    }

    updatePlanStrip({ startSurah: planBounds.startLabel, endSurah: planBounds.endLabel, points, rank: rankOnly });

    renderStudentProgress({
      student: resolvedStudent,
      els,
      safeSetText,
      getStudentHifzPauseCardCopy,
    });

    safeSetText(els.totalPoints, points);
    safeSetText(els.rankText, rankOnly);
    await renderStudentPrograms({ student: resolvedStudent, db, CONFIG });
    setStudentStatsCardValues({
      points,
      rank: rankOnly,
      today: getTodayArabicLabel(),
      streak: getLiveStudentStreakValue(),
    });
    const refresh = (updatedStudent) =>
      displayStudentDashboard({
        ...params,
        student: updatedStudent
      });
    renderStudentTasks(resolvedStudent, {
  submitCurriculumTask: (code, mission) =>
    submitCurriculumTask({
      db,
      studentCode: code,
      mission,
      showMessage,
      displayStudentDashboard: refresh,
      generateUniqueId,
      authMessage
    }),

  cancelCurriculumTask: (code, type, key) =>
    cancelCurriculumTask({
      db,
      studentCode: code,
      type, // ? بدل mission
      key,  // ? بدل mission
      showMessage,
      displayStudentDashboard: refresh,
      authMessage
    }),

  submitMurajaaTask: (code, mission) =>
    submitMurajaaTask({
      db,
      studentCode: code,
      mission,
      showMessage,
      displayStudentDashboard: refresh,
      generateUniqueId,
      authMessage
    }),

  cancelMurajaaTask: (code, mission) =>
    cancelMurajaaTask({
      db,
      studentCode: code,
      mission,
      showMessage,
      displayStudentDashboard: refresh,
      authMessage
    }),

  submitFlexibleHifzTask: (code, mission, endAyah) =>
    submitFlexibleHifzTask({
      db,
      studentCode: code,
      mission,
      endAyah, // ? مهم
      showMessage,
      displayStudentDashboard: refresh,
      generateUniqueId,
      authMessage
    }),

  submitGeneralTask: (code, id) =>
    submitGeneralTask({
      db,
      studentCode: code,
      taskId: id, // ? بدل mission
      showMessage,
      displayStudentDashboard: refresh,
      generateUniqueId,
      authMessage
    }),

  cancelGeneralTask: (code, id) =>
    cancelGeneralTask({
      db,
      studentCode: code,
      taskId: id, // ? بدل mission
      showMessage,
      displayStudentDashboard: refresh,
      authMessage
    }),
});
  

    hideAllScreens();
    document.querySelector("#student-screen")?.classList.remove("hidden");
    console.log("[refresh] student displayStudentDashboard visible", {
      code: resolvedStudent?.code || null,
    });

    if (CONFIG.ENABLE_ASSISTANTS && resolvedStudent.is_student_assistant) {
      await loadAssistantTasksForCurrentUser({
  db
});
      syncStudentAssistantPanel();
    } else if (studentAssistantTasksList) {
      studentAssistantTasksList.innerHTML = "";
      syncStudentAssistantPanel();
    }
  } catch (err) {
    console.error("displayStudentDashboard error:", err);
    showMessage(authMessage, `خطأ في عرض واجهة الطالب: ${err.message}`, "error");
  }
}








