import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import {
  fetchAllStudentsSnapshot,
  fetchStudentsForHalaqa,
  isStudentActive,
  invalidateStudentsSnapshotCache,
} from "../modules/students/students.service.js";
import {
  collection,
  getDocs,
  query,
  writeBatch,
  where,
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import {
  HIFZ_AWAITING_NOMINATION_STATUS,
  HIFZ_NOMINATED_FOR_TEST_STATUS,
  buildStudentCurriculumSnapshot,
  getCurriculumPhase,
  getPhaseUnitRange,
} from "../modules/curriculum/curriculum-runtime.js";

function getReviewTaskVisualKind(taskType) {
  if (taskType === "hifz" || taskType === "hifz_flexible") return "hifz";
  if (taskType === "murajaa") return "murajaa";
  return "general";
}

function getReviewTaskTypeLabel(taskType) {
  const visualKind = getReviewTaskVisualKind(taskType);

  if (visualKind === "hifz") return "حفظ";
  if (visualKind === "murajaa") return "مراجعة";
  return "عامة";
}

function getStudentHifzPathLabel(student = {}) {
  const snapshot = buildStudentCurriculumSnapshot(student);
  const pendingPhaseName = String(
    getCurriculumPhase(snapshot?.pendingPhaseId || student?.hifz_pending_phase_id || "")?.name || ""
  ).trim();
  if (pendingPhaseName) {
    return `مرحلية الاختبار: ${pendingPhaseName}`;
  }

  const phaseName = String(snapshot?.currentPhaseName || "").trim();
  if (phaseName) {
    return `المرحلية: ${phaseName}`;
  }

  const trackName = String(snapshot?.currentTrackName || "").trim();
  if (trackName) {
    return `المسار: ${trackName}`;
  }

  return "";
}

function getStudentPendingPhaseDetails(student = {}) {
  const snapshot = buildStudentCurriculumSnapshot(student);
  const pendingPhaseId = snapshot?.pendingPhaseId || student?.hifz_pending_phase_id || "";
  const pendingPhase = getCurriculumPhase(pendingPhaseId);
  const pendingPhaseName = String(pendingPhase?.name || "").trim();
  const phaseRange = pendingPhaseId ? getPhaseUnitRange(pendingPhaseId) : null;
  const startLabel = String(
    phaseRange?.startUnit?.label ||
    phaseRange?.startUnit?.start?.name ||
    phaseRange?.startUnit?.end?.name ||
    ""
  ).trim();
  const endLabel = String(
    phaseRange?.endUnit?.label ||
    phaseRange?.endUnit?.end?.name ||
    phaseRange?.endUnit?.start?.name ||
    ""
  ).trim();

  return {
    phaseTitle: pendingPhaseName ? `مرحلية الاختبار: ${pendingPhaseName}` : getStudentHifzPathLabel(student),
    phaseMeta: startLabel && endLabel ? `النطاق: ${startLabel} - ${endLabel}` : "",
  };
}

function createReviewTaskCard({
  taskType,
  description,
  points,
  statusText = "",
  headerText = "",
  footerButtons = [],
}) {
  const visualKind = getReviewTaskVisualKind(taskType);
  const item = document.createElement("div");
  item.className = `task-card review-task-item ${visualKind}`;

  item.innerHTML = `
    <div class="task-header review-task-header">
      <div class="review-task-mainline">
        <div class="task-title">${description || ""}</div>
        <span class="task-type-tag ${visualKind}">${getReviewTaskTypeLabel(taskType)}</span>
      </div>
      <span class="task-points-tag review-task-points-corner">${points || 0}</span>
    </div>
    ${headerText ? `<div class="review-task-subtitle">${headerText}</div>` : ""}
    <div class="task-footer review-task-footer">
      ${statusText ? `<span class="task-status-text">${statusText}</span>` : ""}
    </div>
  `;

  const footer = item.querySelector(".task-footer");
  footerButtons.forEach((button) => footer.appendChild(button));
  return item;
}

export async function loadPendingTasksForReview(params) {
  const {
    db,
    reviewTask,
    nominateStudentHifzForTest,
    showMessage,
    authMessage,
    pendingTasksList,
    isInCurrentHalaqa,
    currentHalaqa,
  } = params;

  pendingTasksList.innerHTML = '<p class="message info">جارٍ تحميل المهام...</p>';

  try {
    const [students, pendingSubmissionsSnapshot] = await Promise.all([
      fetchAllStudentsSnapshot(db),
      getDocs(query(
        collection(db, "task_submissions"),
        where("status", "==", "pending"),
        where("halaqa_id", "==", currentHalaqa)
      )),
    ]);

    const pendingHifz = [];
    const pendingMurajaa = [];
    const pendingGeneral = [];
    const awaitingNomination = [];
    const nominatedForTests = [];
    const studentsByCode = new Map(
      students
        .filter(isStudentActive)
        .map((student) => [String(student?.code || "").trim(), student])
    );

    students
      .filter(isStudentActive)
      .forEach((student) => {
      if (!isInCurrentHalaqa(student)) return;

      if (
        student.hifz_status === HIFZ_AWAITING_NOMINATION_STATUS ||
        student.hifz_status === "awaiting_test"
      ) {
        awaitingNomination.push({ student });
      }

      if (student.hifz_status === HIFZ_NOMINATED_FOR_TEST_STATUS) {
        nominatedForTests.push({ student });
      }

      });

    pendingSubmissionsSnapshot.forEach((submissionDoc) => {
      const submission = submissionDoc.data();
      const studentCode = String(submission?.student_code || submission?.student_id || "").trim();
      if (!studentsByCode.has(studentCode)) {
        return;
      }
      const student = studentsByCode.get(studentCode) || {
        code: studentCode,
        name: studentCode || "طالب غير معروف",
      };
      const matchedStudentTask = (Array.isArray(student?.tasks) ? student.tasks : []).find(
        (task) => task?.id === (submission?.task_id || submissionDoc.id)
      );
      const task = {
        id: submission?.task_id || submissionDoc.id,
        type: submission?.type || matchedStudentTask?.type || "general",
        description: submission?.title || matchedStudentTask?.description || "",
        points: matchedStudentTask?.points || 0,
        created_at: submission?.created_at || matchedStudentTask?.created_at || 0,
        status: submission?.status || matchedStudentTask?.status || "pending",
      };

      if (task.type === "hifz" || task.type === "hifz_flexible") {
        pendingHifz.push({ student, task });
      } else if (task.type === "murajaa") {
        pendingMurajaa.push({ student, task });
      } else {
        pendingGeneral.push({ student, task });
      }
    });

    const byCreatedAt = (a, b) => (a.task.created_at || 0) - (b.task.created_at || 0);
    pendingHifz.sort(byCreatedAt);
    pendingMurajaa.sort(byCreatedAt);
    pendingGeneral.sort(byCreatedAt);
    awaitingNomination.sort((a, b) => String(a.student?.name || "").localeCompare(String(b.student?.name || "")));
    nominatedForTests.sort((a, b) => String(a.student?.name || "").localeCompare(String(b.student?.name || "")));

    pendingTasksList.innerHTML = "";
    let any = false;

    function renderTaskGroup(list, titleText) {
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

        const pts = document.createElement("span");
        pts.className = "review-points-badge";
        pts.textContent = `${task.points || 0}`;

        const ok = document.createElement("button");
        ok.className = "button success";
        ok.textContent = "✓";
        ok.title = "قبول";
        ok.addEventListener("click", async () => {
          await reviewTask({
            db,
            studentCode: student.code,
            taskId: task.id,
            action: "approve",
            showMessage,
            authMessage,
          });

          await loadPendingTasksForReview(params);
        });

        const no = document.createElement("button");
        no.className = "button danger";
        no.textContent = "✕";
        no.title = "رفض";
        no.addEventListener("click", async () => {
          await reviewTask({
            db,
            studentCode: student.code,
            taskId: task.id,
            action: "reject",
            showMessage,
            authMessage,
          });

          await loadPendingTasksForReview(params);
        });

        const forward = document.createElement("button");
        forward.className = "button";
        forward.textContent = "→";
        forward.title = "تحويل للمساعد";
        forward.addEventListener("click", () =>
          showAssistantSelector({
            db,
            studentCode: student.code,
            taskId: task.id,
            containerEl: block,
            currentHalaqa,
            showMessage,
            authMessage,
            nominateStudentHifzForTest,
            loadPendingTasksForReview,
            pendingTasksList,
            isInCurrentHalaqa,
            reviewTask,
          })
        );

        const item = createReviewTaskCard({
          taskType: task.type,
          description: task.description || "",
          points: task.points,
          statusText: "",
          headerText: "",
          footerButtons: [pts, ok, no, forward],
        });
        block.appendChild(item);
        pendingTasksList.appendChild(block);
      });
    }

    function renderAwaitingNominationGroup(list) {
      if (!list.length) return;
      any = true;

      const groupTitle = document.createElement("h4");
      groupTitle.textContent = "الطلاب المستعدون للترشيح";
      groupTitle.className = "review-group-title";
      pendingTasksList.appendChild(groupTitle);

      list.forEach(({ student }) => {
        const block = document.createElement("div");
        block.className = "review-student-block";

        const title = document.createElement("div");
        title.className = "review-student-title";
        title.textContent = `الطالب: ${student.name} (${student.code})`;
        block.appendChild(title);

        const nominate = document.createElement("button");
        nominate.className = "button success";
        nominate.textContent = "ترشيح للاختبار";
        nominate.title = "ترشيح للاختبار";
        nominate.addEventListener("click", async () => {
          await nominateStudentHifzForTest({
            db,
            studentCode: student.code,
            showMessage,
            authMessage,
          });

          await loadPendingTasksForReview(params);
        });

        const item = createReviewTaskCard({
          taskType: "hifz",
          description: "الطالب أنهى آخر وحدة في المرحلية وأصبح جاهزًا للترشيح للاختبار.",
          points: 0,
          statusText: "بانتظار ترشيح المعلم",
          headerText: "حالة حفظ",
          footerButtons: [nominate],
        });
        block.appendChild(item);
        pendingTasksList.appendChild(block);
      });
    }

    function renderNominatedForTestsGroup(list) {
      if (!list.length) return;
      any = true;

      const wrapper = document.createElement("div");
      wrapper.className = "review-collapsible-group";

      const toggleButton = document.createElement("button");
      toggleButton.type = "button";
      toggleButton.className = "review-collapsible-toggle";
      toggleButton.setAttribute("aria-expanded", "false");
      toggleButton.innerHTML = `
        <span>الطلاب المرشحون للاختبار</span>
        <span class="review-collapsible-icon" aria-hidden="true">▾</span>
      `;
      wrapper.appendChild(toggleButton);

      const panel = document.createElement("div");
      panel.className = "hidden";
      wrapper.appendChild(panel);

      toggleButton.addEventListener("click", () => {
        const isOpen = !panel.classList.contains("hidden");
        panel.classList.toggle("hidden", isOpen);
        toggleButton.setAttribute("aria-expanded", String(!isOpen));
        toggleButton.querySelector(".review-collapsible-icon").textContent = isOpen ? "▾" : "▴";
      });

      list.forEach(({ student }) => {
        const block = document.createElement("div");
        block.className = "review-student-block";
        const { phaseTitle, phaseMeta } = getStudentPendingPhaseDetails(student);

        const title = document.createElement("div");
        title.className = "review-student-title";
        title.textContent = `الطالب: ${student.name} (${student.code})`;
        block.appendChild(title);

        const item = createReviewTaskCard({
          taskType: "hifz",
          description: "مرشح لاختبار المرحلية",
          points: 0,
          statusText: phaseMeta,
          headerText: phaseTitle,
        });
        block.appendChild(item);
        panel.appendChild(block);
      });

      pendingTasksList.appendChild(wrapper);
    }

    renderAwaitingNominationGroup(awaitingNomination);
    renderTaskGroup(pendingHifz, "مهام الحفظ");
    renderTaskGroup(pendingMurajaa, "مهام المراجعة");
    renderTaskGroup(pendingGeneral, "مهام عامة");
    renderNominatedForTestsGroup(nominatedForTests);

    if (!any) {
      pendingTasksList.innerHTML = '<p class="message success">لا توجد مهام بانتظار المراجعة حالياً.</p>';
    }
  } catch (e) {
    console.error("Error loadPendingTasksForReview:", e);
    pendingTasksList.innerHTML = `<p class="message error">خطأ في تحميل المهام: ${e.message}</p>`;
  }
}

export async function loadAssistantTasksForCurrentUser(params) {
  const {
    db,
    currentUser,
    studentAssistantTasksList,
    renderAssistantTasksList,
  } = params;

  const [students, assistantSubmissionsSnapshot] = await Promise.all([
    fetchAllStudentsSnapshot(db),
    getDocs(query(
      collection(db, "task_submissions"),
      where("status", "==", "pending_assistant"),
      where("assistant_code", "==", currentUser.code)
    )),
  ]);
  const assigned = [];
  const studentsByCode = new Map(
    students.map((student) => [String(student?.code || "").trim(), student])
  );

  assistantSubmissionsSnapshot.forEach((submissionDoc) => {
    const submission = submissionDoc.data();
    const studentCode = String(submission?.student_code || submission?.student_id || "").trim();
    const student = studentsByCode.get(studentCode) || {
      code: studentCode,
      name: studentCode || "طالب غير معروف",
    };
    const matchedStudentTask = (Array.isArray(student?.tasks) ? student.tasks : []).find(
      (task) => task?.id === (submission?.task_id || submissionDoc.id)
    );
    const task = {
      id: submission?.task_id || submissionDoc.id,
      type: submission?.type || matchedStudentTask?.type || "general",
      description: submission?.title || matchedStudentTask?.description || "",
      points: matchedStudentTask?.points || 0,
      status: submission?.status || matchedStudentTask?.status || "pending_assistant",
      assistant_type: submission?.assistant_type || matchedStudentTask?.assistant_type || null,
      assistant_code: submission?.assistant_code || matchedStudentTask?.assistant_code || null,
    };

    if (
      currentUser.role === "student" &&
      task.assistant_type === "student" &&
      task.assistant_code === currentUser.code
    ) {
      assigned.push({ student, task });
    }
  });

  if (currentUser.role === "student") {
    if (!studentAssistantTasksList) return;
    renderAssistantTasksList(assigned, studentAssistantTasksList, "طالب", params);
  }
}

export function renderAssistantTasksList(list, container, roleLabel, params) {
  if (!container) return;
  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = '<p class="message info">لا توجد مهام مسندة لك حاليًا.</p>';
    return;
  }

  list.forEach(({ student, task }) => {
    const block = document.createElement("div");
    block.className = "review-student-block";

    const { db, reviewTask, showMessage, authMessage, loadAssistantTasksForCurrentUser } = params;

    const title = document.createElement("div");
    title.className = "review-student-title";
    title.textContent = `الطالب: ${student.name} (${student.code})`;
    block.appendChild(title);

    const pts = document.createElement("span");
    pts.className = "review-points-badge";
    pts.textContent = `${task.points || 0}`;

    const ok = document.createElement("button");
    ok.className = "button success";
    ok.textContent = "✓";
    ok.title = "قبول";
    ok.addEventListener("click", async () => {
      await reviewTask({
        db,
        studentCode: student.code,
        taskId: task.id,
        action: "approve",
        showMessage,
        authMessage,
      });
      await loadAssistantTasksForCurrentUser(params);
    });

    const no = document.createElement("button");
    no.className = "button danger";
    no.textContent = "✕";
    no.title = "رفض";
    no.addEventListener("click", async () => {
      await reviewTask({
        db,
        studentCode: student.code,
        taskId: task.id,
        action: "reject",
        showMessage,
        authMessage,
      });
      await loadAssistantTasksForCurrentUser(params);
    });

    const item = createReviewTaskCard({
      taskType: task.type,
      description: task.description || "",
      points: task.points,
      statusText: `مسندة لمساعد ${roleLabel}`,
      headerText: "مهمة قيد مراجعة المساعد",
      footerButtons: [pts, ok, no],
    });
    block.appendChild(item);
    container.appendChild(block);
  });
}

export async function forwardTaskToAssistant(params) {
  const {
    db,
    studentCode,
    taskId,
    assistantType,
    assistantId,
    showMessage,
    authMessage,
    nominateStudentHifzForTest,
    loadPendingTasksForReview,
    pendingTasksList,
    isInCurrentHalaqa,
    reviewTask,
    currentHalaqa,
  } = params;

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

    const batch = writeBatch(db);
    batch.update(studentRef, { tasks });
    batch.update(doc(db, "task_submissions", task.id), {
      status: "pending_assistant",
      assistant_type: assistantType,
      assistant_code: assistantId,
    });
    await batch.commit();
    invalidateStudentsSnapshotCache();
    await loadPendingTasksForReview({
      db,
      reviewTask,
      nominateStudentHifzForTest,
      showMessage,
      authMessage,
      pendingTasksList,
      isInCurrentHalaqa,
      currentHalaqa,
    });
    showMessage(authMessage, "تم توجيه المهمة للمساعد.", "success");
  } catch (e) {
    console.error("Error forwardTaskToAssistant:", e);
    showMessage(authMessage, `خطأ في توجيه المهمة: ${e.message}`, "error");
  }
}

export async function showAssistantSelector(params) {
  const {
    db,
    studentCode,
    taskId,
    containerEl,
    currentHalaqa,
    showMessage,
    authMessage,
    nominateStudentHifzForTest,
    loadPendingTasksForReview,
    pendingTasksList,
    isInCurrentHalaqa,
    reviewTask,
  } = params;

  try {
    const existing = containerEl.querySelector(".assistant-picker");
    if (existing) {
      existing.remove();
      return;
    }

    const students = await fetchStudentsForHalaqa(db, currentHalaqa);
    const assistants = [];

    students.forEach((s) => {
      if (s.is_student_assistant) {
        assistants.push({
          type: "student",
          id: s.code,
          label: `طالب: ${s.name || s.code} (${s.code})`,
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
    sendBtn.textContent = "تأكيد التوجيه";

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "button";
    cancelBtn.textContent = "إلغاء";

    sendBtn.addEventListener("click", async () => {
      const [assistantType, assistantId] = select.value.split("|");
      await forwardTaskToAssistant({
        db,
        studentCode,
        taskId,
        assistantType,
        assistantId,
        showMessage,
        authMessage,
        nominateStudentHifzForTest,
        loadPendingTasksForReview,
        pendingTasksList,
        isInCurrentHalaqa,
        reviewTask,
        currentHalaqa,
      });
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
