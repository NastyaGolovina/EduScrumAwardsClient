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
  const val = assignment.responsible ?? assignment.isResponsible;
  isResponsibleEl.checked = val === true || val === "true";
}

// Helper to determine responsibility safely
function isAssignmentResponsible(assignment) {
  let val = assignment.responsible;
  if (val === undefined) val = assignment.isResponsible;
  if (val === undefined) val = assignment.IsResponsible; // Fallback

  // console.log("Checking responsibility:", assignment, "Result:", val === true || val === "true" || val === 1);
  return val === true || val === "true" || val === 1;
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

  const val = assignment.responsible ?? assignment.isResponsible;
  const isResp = val === true || val === "true";

  if (isResp) {
    // Add a star icon and bold styling
    // Use bg-warning for contrast against both white list and blue active state
    strongEl.innerHTML = `${displayText} <span class="badge bg-warning text-dark ms-2">Responsible</span>`;
    // Remove text-primary so it turns white when active
    // strongEl.classList.add("text-primary"); 
  } else {
    strongEl.innerText = displayText;
  }
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
  const msgDiv = document.getElementById("errorMsg");
  const msgText = document.getElementById("errorMsgText");
  if (msgDiv && msgText) {
    msgDiv.style.display = "block";
    msgText.innerText = errorMsg;
  } else {
    console.error("Error message element not found:", errorMsg);
    alert(errorMsg); // Fallback
  }
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
  // Sort: Responsible first
  allAssignments.sort((a, b) => {
    // Helper to safely get boolean
    const getBool = (obj) => {
      const val = obj.responsible ?? obj.isResponsible;
      return val === true || val === "true";
    };

    const isRespA = getBool(a);
    const isRespB = getBool(b);
    return (isRespB ? 1 : 0) - (isRespA ? 1 : 0);
  });

  // fill teacher dropdown
  teacherSelectEl.innerHTML = "";
  addOptions(teacherSelectEl, "", "Choose teacher...");
  for (let i = 0; i < allTeachers.length; i++) {
    const t = allTeachers[i];
    const id = t.userId ?? t.id;
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

    // Debug logging
    console.log(`Assignment for ${name}:`, a, "Responsible:", a.responsible, "IsResponsible:", a.isResponsible);

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

          // Validate: Only one responsible teacher allowed
          try {
            if (isResp) {
              const alreadyHasResponsible = allAssignments.some(a => isAssignmentResponsible(a));
              console.log("Validation Check (Create): isResp=true, alreadyHasResponsible=", alreadyHasResponsible);

              if (alreadyHasResponsible) {
                setErrorMsg("There can only be one responsible teacher for this course.");
                return;
              }
            }
          } catch (e) {
            console.error("Validation error:", e);
          }

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

            // Validate: Only one responsible teacher allowed
            if (isResp) {
              // Check if any OTHER assignment (not the one we are updating) is already responsible
              const alreadyHasResponsible = allAssignments.some(a => {
                const aId = a.courseTeacherID ?? a.id;
                return (aId !== ctId) && isAssignmentResponsible(a);
              });

              if (alreadyHasResponsible) {
                setErrorMsg("There can only be one responsible teacher for this course.");
                return;
              }
            }

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
