const teacherSelectEl = document.getElementById("teacherSelect");
const isResponsibleEl = document.getElementById("isResponsible");
const createFormBtn = document.getElementById("create");
const updateFormBtn = document.getElementById("update");
const deleteFormBtn = document.getElementById("delete");
const listEl = document.getElementById("teacher_list");
const formEl = document.getElementsByTagName("form")[0];
const courseNameLabelEl = document.getElementById("courseNameLabel");

// take course info from localStorage
const lsObj = localStorage.getItem("course");
let course = lsObj ? JSON.parse(lsObj) : null;

let prevEl = null;
let prevIsCreate = false;

function activateDeactivatedForm(isDisabled) {
  teacherSelectEl.disabled = isDisabled;
  isResponsibleEl.disabled = isDisabled;
}

function cleanInputEl() {
  teacherSelectEl.value = "";
  isResponsibleEl.checked = false;
}

function fillInputEl(assignment) {
  // assignment here is a CourseTeacher object
  // { id: 5, courseID: 17, teacherID: 1, isResponsible: true, role: "TEACHER"? }
  // User didn't specify exact CourseTeacher structure in the last prompt but gave update link with 'id', 'courseId', 'isResponsible'
  // teacherID is likely accessible.

  // In the list popfunction fillInputEl(assignment) {
  // If assignment has teacher object
  if (assignment.teacher) {
    teacherSelectEl.value = assignment.teacher.userId ?? assignment.teacher.id;
  } else {
    teacherSelectEl.value = assignment.teacherID ?? assignment.teacherId;
  }
  isResponsibleEl.checked = assignment.isResponsible;
}

function fillForm(currentEl, assignments) {
  const ctId = +currentEl.dataset.AssignmentId;
  const assignment = assignments.find(a => (a.courseTeacherID ?? a.id) === ctId);

  if (assignment) {
    fillInputEl(assignment);
  }
}

function removeBtn() {
  if (document.getElementById("btn-submit") !== null) {
    document.getElementById("btn-submit").remove();
  }
}

function removeActiveClass() {
  if (prevEl !== null) {
    prevEl.classList.remove("active");
  }
}

function createBtn(btnName) {
  const btnEl = document.createElement("button");
  btnEl.className = "w-100 btn btn-primary btn-lg";
  btnEl.type = "button";
  btnEl.id = "btn-submit";
  btnEl.innerText = btnName;
  formEl.appendChild(btnEl);
}

function addElInList(assignment, teacherName, i) {
  const aEl = document.createElement("a");
  const divHeader = document.createElement("div");
  const strongEl = document.createElement("strong");
  const divText = document.createElement("div");

  // Robust ID access
  // Updated: Backend uses 'courseTeacherID'
  const ctId = assignment.courseTeacherID ?? assignment.id;
  // Teacher in CourseTeacher object is 'teacher' (User object) or we might have flat JSON?
  // Assuming full object since it's @ManyToOne and default serialization usually sends object.
  // But explicit properties might be needed.
  const tId = assignment.teacher ? (assignment.teacher.userId ?? assignment.teacher.id) : (assignment.teacherID ?? assignment.teacherId);

  aEl.dataset.AssignmentId = ctId;
  aEl.dataset.TeacherId = tId;
  aEl.className = "list-group-item list-group-item-action py-3 lh-sm";
  divHeader.className = "d-flex w-100 align-items-center justify-content-between";
  strongEl.className = "mb";
  divText.className = "col-10 mb-1 small";

  let displayText = teacherName || `Teacher ${tId}`;
  if (assignment.isResponsible) {
    displayText += " (Responsible)";
    strongEl.classList.add("text-primary");
  }

  strongEl.innerText = displayText;
  // divText.innerText = assignment.role || ""; 

  divHeader.appendChild(strongEl);
  aEl.appendChild(divHeader);
  aEl.appendChild(divText);
  listEl.appendChild(aEl);

  if (i === 0) {
    prevEl = aEl;
    prevEl.classList.add("active");
  }
}

function addOptions(parentEl, value, text) {
  const optionEl = document.createElement("option");
  optionEl.value = value;
  optionEl.innerText = text;
  parentEl.appendChild(optionEl);
}

function removeErrorMassage() {
  teacherSelectEl.classList.remove("is-invalid");
}

function setInvalid(el, errorText) {
  el.classList.add("is-invalid");
  el.nextElementSibling.innerHTML = errorText;
}

function setErrorMsg(errorMsg) {
  document.getElementById("errorMsg").style.display = "block";
  document.getElementById("errorMsgText").innerText = errorMsg;
}

if (course && course.id) {
  courseNameLabelEl.innerText = course.name;
} else {
  setErrorMsg("No course selected. Open this page from Courses page.");
  activateDeactivatedForm(true);
}

// Global data
let allAssignments = [];
let allTeachers = [];

// load data
Promise.all([
  fetch(`http://localhost:8080/CourseTeachers/all?courseId=${course.id}`).then((r) => r.json()),
  fetch("http://localhost:8080/awards/teachers/all").then((r) => r.json()),
]).then(([assignmentsRes, teachersRes]) => {

  // Ensure assignmentsRes is an array
  let assignments = Array.isArray(assignmentsRes) ? assignmentsRes : [];

  // API already filters by courseId
  allAssignments = assignments;
  allTeachers = teachersRes;

  console.log("Course Teachers:", allAssignments);
  console.log("All Teachers:", allTeachers);

  // Sort: Responsible first
  allAssignments.sort((a, b) => (b.isResponsible === true) - (a.isResponsible === true));

  // fill teacher dropdown
  teacherSelectEl.innerHTML = "";
  addOptions(teacherSelectEl, "", "Choose teacher...");
  for (let i = 0; i < allTeachers.length; i++) {
    const t = allTeachers[i];
    const id = t.userId ?? t.id; // User said "userId": 1 in JSON example
    const name = t.name;
    addOptions(teacherSelectEl, id, name);
  }

  // fill list
  for (let i = 0; i < allAssignments.length; i++) {
    const a = allAssignments[i];
    // Backend CourseTeacher has 'teacher' object
    // And 'courseTeacherID'
    const tId = a.teacher ? (a.teacher.userId ?? a.teacher.id) : (a.teacherID ?? a.teacherId);

    const teacher = allTeachers.find(t => (t.userId ?? t.id) === tId);
    const name = teacher ? teacher.name : (a.teacher ? a.teacher.name : `Unk Teacher ${tId}`);
    addElInList(a, name, i);
  }

  if (allAssignments.length > 0) {
    fillForm(prevEl, allAssignments);
  }

  createFormBtn.addEventListener("click", (event) => {
    prevIsCreate = true;
    removeErrorMassage();
    cleanInputEl();
    activateDeactivatedForm(false);
    removeBtn();
    createBtn("Add");
  });

  updateFormBtn.addEventListener("click", (event) => {
    removeErrorMassage();
    if (prevEl !== null) {
      activateDeactivatedForm(false);
      teacherSelectEl.disabled = true;

      removeBtn();
      createBtn("Update");

      if (prevIsCreate) {
        prevIsCreate = false;
        fillForm(prevEl, allAssignments);
      }
    } else {
      alert("You didn't choose anything. Choose element to update");
    }
  });


  deleteFormBtn.addEventListener("click", () => {
    if (prevIsCreate) {
      prevIsCreate = false;
      window.location.reload();
    } else {
      removeErrorMassage();
      if (prevEl !== null) {
        removeBtn();
        activateDeactivatedForm(true);
        if (confirm("Do you want to remove this teacher from the course?")) {
          // Update: Delete uses courseTeacherID ("id" param)
          const ctId = +prevEl.dataset.AssignmentId;

          fetch(`http://localhost:8080/CourseTeachers/delete?courseId=${course.id}&id=${ctId}`, {
            method: "DELETE"
          })
            .then((response) => response.text())
            .then((result) => {
              console.log("Server response:", result);
              if (result.includes("Success") || result.includes("successfully")) {
                window.location.reload();
              } else {
                setErrorMsg(result);
              }
            })
            .catch((err) => {
              console.error("Fetch error:", err);
              setErrorMsg(err);
            });
        }
      } else {
        alert("You didn't choose nothing. Choose element to delete");
      }
    }
  });


  listEl.addEventListener("click", (event) => {
    prevIsCreate = false;
    removeErrorMassage();
    activateDeactivatedForm(true);
    removeBtn();
    removeActiveClass();
    let currentEl = event.target;
    while (!currentEl.classList.contains("list-group-item")) {
      currentEl = currentEl.parentNode;
    }
    prevEl = currentEl;
    currentEl.classList.add("active");
    fillForm(currentEl, allAssignments);
  });


  document.addEventListener("click", (event) => {
    removeErrorMassage();
    if (event.target.id === "btn-submit") {
      if (
        event.target.innerText === "Add" ||
        event.target.innerText === "Update"
      ) {
        event.preventDefault();

        if (event.target.innerText === "Add") {
          // Create uses teacherId (User ID)
          const teacherId = parseInt(teacherSelectEl.value, 10);
          if (!Number.isInteger(teacherId)) {
            setInvalid(teacherSelectEl, "Teacher is required");
            return;
          }

          const isResp = isResponsibleEl.checked;

          fetch(`http://localhost:8080/CourseTeachers/create?courseId=${course.id}&teacherId=${teacherId}&isResponsible=${isResp}`, {
            method: "POST"
          })
            .then((response) => response.text())
            .then((result) => {
              console.log("Server response:", result);
              if (result.includes("Success")) {
                window.location.reload();
              } else if (result.includes("ERROR")) {
                setErrorMsg(result);
              }
            })
            .catch((err) => console.error(err));
        } else if (event.target.innerText === "Update") {
          if (prevEl != null) {
            // Update uses PUT and param 'id' is courseTeacherID
            const ctId = +prevEl.dataset.AssignmentId;
            const isResp = isResponsibleEl.checked;

            fetch(`http://localhost:8080/CourseTeachers/update?courseId=${course.id}&id=${ctId}&isResponsible=${isResp}`, {
              method: "PUT"
            })
              .then((response) => response.text())
              .then((result) => {
                console.log("Server response:", result);
                if (result.includes("Success")) {
                  window.location.reload();
                } else {
                  setErrorMsg(result);
                }
              })
              .catch((err) => {
                console.error(err);
                setErrorMsg(err);
              });
          } else {
            setErrorMsg("Nothing to update");
          }
        }
      }
    }
  });
}).catch(error => {
  setErrorMsg(error);
});
