const nameEl = document.getElementById("name");
const createFormBtn = document.getElementById("create");
const updateFormBtn = document.getElementById("update");
const deleteFormBtn = document.getElementById("delete");
const listEl = document.getElementById('course_list');
const formEl = document.getElementsByTagName("form")[0];

let prevEl = null;
let prevIsCreate = false;

function activateDeactivatedForm(isDisabled) {
  nameEl.disabled = isDisabled;
}

function cleanInputEl() {
  nameEl.value = "";
}

function fillInputEl(name) {
  nameEl.value = name;
}

function fillForm(currentEl, courses) {
  for (let i = 0; i < courses.length; i++) {
    if (courses[i].courseID === +currentEl.dataset.CourseId) {
      fillInputEl(courses[i].courseName);
    }
  }
}

function removeBtn() {
  if (document.getElementById('btn-submit') !== null) {
    document.getElementById('btn-submit').remove();
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
  btnEl.id = 'btn-submit';
  btnEl.innerText = btnName;
  formEl.appendChild(btnEl);
}

function addElInList(id, name, i) {
  const aEl = document.createElement("a");
  const divHeader = document.createElement("div");
  const strongEl = document.createElement("strong");
  // const divText = document.createElement("div");

  aEl.dataset.CourseId = id;
  aEl.className = "list-group-item list-group-item-action py-3 lh-sm";
  divHeader.className = "d-flex w-100 align-items-center justify-content-between";
  strongEl.className = "mb";
  // divText.className = 'col-10 mb-1 small'
  strongEl.innerText = name;
  divHeader.appendChild(strongEl);
  // divText.innerText = description; 
  aEl.appendChild(divHeader);
  // aEl.appendChild(divText);
  listEl.appendChild(aEl);
  if (i === 0) {
    prevEl = aEl;
    prevEl.classList.add('active');
  }
}

function removeErrorMassage() {
  nameEl.classList.remove('is-invalid');
}

function setInvalid(el, errorText) {
  el.classList.add('is-invalid');
  el.nextElementSibling.innerHTML = errorText;
}

function setErrorMsg(errorMsg) {
  document.getElementById('errorMsg').style.display = 'block';
  document.getElementById('errorMsgText').innerText = errorMsg;
}

fetch("http://localhost:8080/Courses/all")
  .then((response) => {
    return response.json();
  })
  .then((result) => {
    console.log(result);
    let courses = result;

    for (let i = 0; i < courses.length; i++) {
      console.log("Processing course:", courses[i]);
      const id = courses[i].courseID;
      const name = courses[i].courseName;

      if (id && name) {
        addElInList(id, name, i);
      } else {
        console.error("Missing id or name for course:", courses[i]);
      }
    }

    if (courses.length > 0) {
      fillForm(prevEl, courses);
    }

    createFormBtn.addEventListener('click', event => {
      prevIsCreate = true;
      cleanInputEl();
      activateDeactivatedForm(false);
      removeBtn();
      createBtn('Create');
    });

    updateFormBtn.addEventListener('click', event => {
      removeErrorMassage();
      if (prevEl !== null) {
        activateDeactivatedForm(false);
        removeBtn();
        createBtn('Update');
        if (prevIsCreate) {
          prevIsCreate = false;
          fillForm(prevEl, courses);
        }
      } else {
        alert("You didn't choose nothing. Choose element to update");
      }
    });

    deleteFormBtn.addEventListener('click', () => {
      if (prevIsCreate) {
        prevIsCreate = false;
        window.location.reload();
      } else {
        removeErrorMassage();
        if (prevEl !== null) {
          removeBtn();
          activateDeactivatedForm(true);
          if (confirm("Do you want to delete this course?")) {
            fetch(`http://localhost:8080/Courses/delete?id=${prevEl.dataset.CourseId}`, {
              method: "DELETE"
            })
              .then(response => response.text())
              .then(result => {
                console.log("Server response:", result);
                if (result.includes("Success")) {
                  alert("Course deleted successfully!");
                  window.location.reload();
                } else {
                  setErrorMsg(result);
                }
              })
              .catch(err => {
                console.error("Fetch error:", err);
                setErrorMsg(err);
              });
          }
        } else {
          alert("You didn't choose nothing. Choose element to delete");
        }
      }
    });

    listEl.addEventListener('click', event => {
      prevIsCreate = false;
      removeErrorMassage();
      activateDeactivatedForm(true);
      removeBtn();
      removeActiveClass();
      let currentEl = event.target;
      while (!currentEl.classList.contains('list-group-item')) {
        currentEl = currentEl.parentNode;
      }
      prevEl = currentEl;
      currentEl.classList.add('active');
      fillForm(currentEl, courses);
    });

    document.addEventListener('click', event => {
      removeErrorMassage();
      if (event.target.id === 'btn-submit') {
        if (event.target.innerText === 'Create' || event.target.innerText === 'Update') {
          event.preventDefault();
          if (event.target.innerText === 'Create') {
            const formDataCreate = new FormData();
            formDataCreate.append("name", nameEl.value);

            fetch("http://localhost:8080/Courses/create", {
              method: "POST",
              body: formDataCreate
            })
              .then(response => response.text())
              .then(result => {
                console.log("Server response:", result);
                if (result.includes("Success")) {
                  alert("Course created successfully!");
                  window.location.reload();
                } else if (result.includes("ERROR")) {
                  setErrorMsg(result);
                }
              })
              .catch(err => console.error(err));

          } else if (event.target.innerText === 'Update') {
            if (prevEl != null) {
              const formDataUpdate = new FormData();
              formDataUpdate.append("id", +prevEl.dataset.CourseId);
              formDataUpdate.append("name", nameEl.value);

              fetch("http://localhost:8080/Courses/update", {
                method: "POST",
                body: formDataUpdate
              })
                .then(response => response.text())
                .then(result => {
                  console.log("Server response:", result);
                  if (result.includes("Success")) {
                    alert("Course updated successfully!");
                    window.location.reload();
                  } else {
                    setErrorMsg(result);
                  }
                })
                .catch(err => {
                  console.error(err)
                  setErrorMsg(err);
                });

            } else {
              setErrorMsg("Nothing to update");
            }
          }
        }
      }
    });
  });
