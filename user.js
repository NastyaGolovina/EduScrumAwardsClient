const nameEl = document.getElementById("name");
const loginEl = document.getElementById("login");
const passwordEl = document.getElementById("password");
const studentNumberEl = document.getElementById("student-number");
const currentSemesterEl = document.getElementById("current-semester");
const studentEl = document.getElementById("student");
const teacherEl = document.getElementById("teacher");
const totalScoreEl = document.getElementById("total-score");
const createFormBtn = document.getElementById("create");
const updateFormBtn = document.getElementById("update");
const deleteFormBtn = document.getElementById("delete");
const listEl = document.getElementById('users_list');
const formEl = document.getElementsByTagName("form")[0];
let prevEl = null;
let prevIsCreate = false;
let users = [];

function activateDeactivatedForm(isDisabled) {
    nameEl.disabled = isDisabled;
    loginEl.disabled = isDisabled;
    passwordEl.disabled = isDisabled;
    studentNumberEl.disabled = isDisabled;
    currentSemesterEl.disabled = isDisabled;
    studentEl.disabled = isDisabled;
    teacherEl.disabled = isDisabled;
}

function removeErrorMessage() {
    nameEl.classList.remove('is-invalid');
    loginEl.classList.remove('is-invalid');
    passwordEl.classList.remove('is-invalid');
    studentNumberEl.classList.remove('is-invalid');
    currentSemesterEl.classList.remove('is-invalid');
    studentEl.classList.remove('is-invalid');
    teacherEl.classList.remove('is-invalid');
}

function cleanInputEl() {
    nameEl.value = "";
    loginEl.value = "";
    passwordEl.value = "";
    studentNumberEl.value = "";
    currentSemesterEl.value = "";
    studentEl.checked = undefined;
    teacherEl.checked = undefined;
    totalScoreEl.value = "";
}

function fillInputEl(formData) {
    nameEl.value = formData.name;
    loginEl.value = formData.login;

    if (formData.studentNumber) {
        studentEl.checked = true;
        studentNumberEl.value = formData.studentNumber;
        currentSemesterEl.value = formData.currentSemester;
        totalScoreEl.value = formData.totalScore;
    } else {
        teacherEl.checked = true;
    }
}

function fillForm(currentEl, users) {
    for(let i = 0; i < users.length; i++) {
        if(users[i].userId === +currentEl.dataset.userId) {
            const formData = {
                name: users[i].name,
                login: users[i].login
            }

            if (users[i].studentNumber) {
                formData.studentNumber = users[i].studentNumber;
                formData.currentSemester = users[i].currentSemester;
                formData.totalScore = users[i].totalScore;
            }

            fillInputEl(formData);
        }
    }
}

function addElInList(id, name, login, studentNumber, i) {
    const aEl = document.createElement("a");
    const divHeader = document.createElement("div");
    const strongEl = document.createElement("strong");
    const divText = document.createElement("div");

    aEl.dataset.userId = id;
    aEl.className = "list-group-item list-group-item-action py-3 lh-sm";
    divHeader.className = "d-flex w-100 align-items-center justify-content-between";
    strongEl.className = "mb";
    divText.className = 'col-10 mb-1 small'
    strongEl.innerText = name;
    divHeader.appendChild(strongEl);
    divText.innerText = login;
    aEl.appendChild(divHeader);
    aEl.appendChild(divText);
    listEl.appendChild(aEl);
    if(i === 0) {
        prevEl = aEl;
        prevEl.classList.add('active');
    }
    aEl.addEventListener("click", (e) => {
        prevEl.classList.remove('active');
        prevEl = e.target.dataset.userId
            ? e.target
            : e.target.parentNode.dataset.userId
                ? e.target.parentNode
                : e.target.parentNode.parentNode;
        prevEl.classList.add('active');
        studentNumberEl.value = "";
        currentSemesterEl.value = "";
        fillForm(prevEl, users);
        removeBtn();
        removeErrorMessage();

        activateDeactivatedForm(false);
        studentEl.disabled = true;
        teacherEl.disabled = true;

        const isTeacher = studentNumber === undefined;

        if (isTeacher) {
            studentNumberEl.disabled = true;
            currentSemesterEl.disabled = true;
        }

        const btn = createBtn('Update');
        btn.addEventListener("click", () => updateUser(id));
    })
}

const getUsers = async () => {
    await fetch("http://localhost:8080/students/all/detailed")
        .then(res => res.json())
        .then(students => {
            users.push(...students);
        });

    await fetch("http://localhost:8080/teachers/all/detailed")
        .then(res => res.json())
        .then(teachers => {
            users.push(...teachers);
        });

    for(let i = 0 ; i < users.length ; i++) {
        addElInList(users[i].userId, users[i].name, users[i].login, users[i].studentNumber, i);
    }

    if(users.length > 0) {
        fillForm(prevEl, users);
    }
};

studentEl.addEventListener("click", (e) => {
    const el = e.target;

    nameEl.disabled = false;
    loginEl.disabled = false;
    passwordEl.disabled = false;

    if(el.checked) {
        studentNumberEl.removeAttribute("disabled")
        currentSemesterEl.removeAttribute("disabled")
        studentNumberEl.value = "";
        currentSemesterEl.value = "";
    } else {
        studentNumberEl.setAttribute("disabled", true)
        currentSemesterEl.setAttribute("disabled", true)
    }
})

teacherEl.addEventListener("click", (e) => {
    const el = e.target;

    nameEl.disabled = false;
    loginEl.disabled = false;
    passwordEl.disabled = false;

    if(el.checked) {
        studentNumberEl.setAttribute("disabled", true)
        currentSemesterEl.setAttribute("disabled", true)
    } else {
        studentNumberEl.removeAttribute("disabled")
        currentSemesterEl.removeAttribute("disabled")
        studentNumberEl.value = "";
        currentSemesterEl.value = "";
    }
})

function setErrorMsg(errorMsg) {
    document.getElementById('errorMsg').style.display = 'block';
    document.getElementById('errorMsgText').innerText = errorMsg;
}

function createBtn(btnName) {
    const btnEl = document.createElement("button");
    btnEl.className = "w-100 btn btn-primary btn-lg";
    btnEl.type = "button";
    btnEl.id = 'btn-submit';
    btnEl.innerText = btnName;
    formEl.appendChild(btnEl);
    return btnEl;
}

function removeBtn() {
    if(document.getElementById('btn-submit') !== null) {
        document.getElementById('btn-submit').remove();
    }
}

createFormBtn.addEventListener('click', event => {
    prevIsCreate = true;
    cleanInputEl();
    removeBtn();
    const btn = createBtn('Create');
    activateDeactivatedForm(true);
    studentEl.disabled = false;
    teacherEl.disabled = false;

    btn.addEventListener("click", () => {
        const formDataCreate = new FormData();
        formDataCreate.append("name", nameEl.value);
        formDataCreate.append("login", loginEl.value);
        formDataCreate.append("password", passwordEl.value);

        if(studentEl.checked) {
            formDataCreate.append("studentNumber", studentNumberEl.value);
            formDataCreate.append("currentSemester", currentSemesterEl.value);
        }

        const url = studentEl.checked ? "http://localhost:8080/students/create" : "http://localhost:8080/teachers/create";

        fetch(url, {
            method: "POST",
            body: formDataCreate
        })
            .then(response => response.text())
            .then(result => {
                console.log("Server response:", result);
                if(result.includes("success")) {
                    window.location.reload();
                } else if(result.includes("ERROR")) {
                    setErrorMsg(result);
                }
            })
            .catch(err => console.error(err));
    });
});

const updateUser = (userId) => {
  const formDataUpdate = new FormData();
  formDataUpdate.append("name", nameEl.value);
  formDataUpdate.append("login", loginEl.value);
  formDataUpdate.append("password", passwordEl.value);
  formDataUpdate.append("userId", userId);

  if(studentEl.checked) {
      formDataUpdate.append("studentNumber", studentNumberEl.value);
      formDataUpdate.append("currentSemester", currentSemesterEl.value);
  }

  const url = studentEl.checked ? "http://localhost:8080/students/update" : "http://localhost:8080/teachers/update";

  fetch(url, {
      method: "POST",
      body: formDataUpdate
  })
      .then(response => response.text())
      .then(result => {
          console.log("Server response:", result);
          if(result.includes("success")) {
              window.location.reload();
          } else if(result.includes("ERROR")) {
              setErrorMsg(result);
          }
      })
      .catch(err => console.error(err));
}

updateFormBtn.addEventListener('click', event => {
    if (prevEl === null) {
        alert("You must choose an element to update");
        return;
    }

    removeErrorMessage();
    activateDeactivatedForm(false);
    studentEl.disabled = true;
    teacherEl.disabled = true;

    removeBtn();
    const btn = createBtn('Update');

    if(prevIsCreate) {
        prevIsCreate = false;
        fillForm(prevEl,users);

        const isTeacher = studentNumberEl.value === "";

        if (isTeacher) {
            studentNumberEl.disabled = true;
            currentSemesterEl.disabled = true;
        }
    }

    btn.addEventListener("click", () => updateUser(prevEl.dataset.userId));
})

deleteFormBtn.addEventListener('click', () => {
    if (prevIsCreate || prevEl === null) {
        alert("You must choose an element to delete");
        return;
    }

    removeErrorMessage();
    removeBtn();
    activateDeactivatedForm(true);

    if (confirm("Do you want to delete this user?")) {
        const url = studentEl.checked ? "http://localhost:8080/students/delete/" : "http://localhost:8080/teachers/delete/";

        fetch(`${url}${prevEl.dataset.userId}`, {
            method: "DELETE"
        })
            .then(response => response.text())
            .then(result => {
                console.log("Server response:", result);
                if(result.includes("successfully")) {
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
});

const init = () => {
    activateDeactivatedForm(true);
    getUsers();
}

init();