const memberIdEl = document.getElementById("member-id");
const studentEl = document.getElementById("studentSelect");
const roleEl = document.getElementById("role");
const createFormBtn = document.getElementById("create");
const updateFormBtn = document.getElementById("update");
const deleteFormBtn = document.getElementById("delete");
const listEl = document.getElementById("member_list");
const formEl = document.getElementsByTagName("form")[0];
const teamNameLabelEl = document.getElementById("teamNameLabel");

// take team info from localStorage (saved in teamPage.js)
const lsObj = localStorage.getItem("team");
let team = lsObj ? JSON.parse(lsObj) : null;

let prevEl = null;
let prevIsCreate = false;

function activateDeactivatedForm(isDisabled) {
    memberIdEl.disabled = true; //read only
    studentEl.disabled = isDisabled;
    roleEl.disabled = isDisabled;
}

function cleanInputEl() {
    memberIdEl.value = "";
    studentEl.value = "";
    roleEl.value = "";
}

function fillInputEl(member) {
    memberIdEl.value = member.teamMemberId;

    if (member.student && member.student.userId != null) {
        studentEl.value = member.student.userId;
    } else {
        studentEl.value = "";
    }

    roleEl.value = member.role || "";
}

function fillForm(currentEl, members) {
    for (let i = 0; i < members.length; i++) {
        if (members[i].teamMemberId === +currentEl.dataset.MemberId) {
            fillInputEl(members[i]);
        }
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

function addElInList(id, studentName, role, i) {
    const aEl = document.createElement("a");
    const divHeader = document.createElement("div");
    const strongEl = document.createElement("strong");
    const divText = document.createElement("div");

    aEl.dataset.MemberId = id;
    aEl.className = "list-group-item list-group-item-action py-3 lh-sm";
    divHeader.className = "d-flex w-100 align-items-center justify-content-between";
    strongEl.className = "mb";
    divText.className = "col-10 mb-1 small";

    strongEl.innerText = studentName || "(no student)";
    divText.innerText = role || "";

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
    studentEl.classList.remove("is-invalid");
    roleEl.classList.remove("is-invalid");
}

function setInvalid(el, errorText) {
    el.classList.add("is-invalid");
    el.nextElementSibling.innerHTML = errorText;
}

function setErrorMsg(errorMsg) {
    document.getElementById("errorMsg").style.display = "block";
    document.getElementById("errorMsgText").innerText = errorMsg;
}

if (team && team.name) {
    teamNameLabelEl.innerText = team.name;
} else {
    setErrorMsg("No team selected. Open this page from Team page.");
    activateDeactivatedForm(true);
}

// load data(TEAM MEMBERS + STUDENTS)
Promise.all([
    fetch(`http://localhost:8080/team-member/all/${team.id}`).then((r) => r.json()),
//waiting for real student api
   // fetch("http://localhost:8080/users/all-students").then((r) => r.json()),
   fetch("http://localhost:8080/awards/students/all").then((r) => r.json()),
]).then(([members, students]) => {
    console.log(members);
    console.log(students);

    // fill student dropdown
    studentEl.innerHTML = "";
    addOptions(studentEl, "", "Choose student...");
    for (let i = 0; i < students.length; i++) {
        const s = students[i];
        const id = s.userId ?? s.id;
        const name = s.name ?? s.login ?? `Student ${id}`;
        addOptions(studentEl, id, name);
    }

    // fill members list
    for (let i = 0; i < members.length; i++) {
        const m = members[i];
        const studentName =
            (m.student && (m.student.name || m.student.login)) || "(no student)";
        addElInList(m.teamMemberId, studentName, m.role, i);
    }

    if (members.length > 0) {
        fillForm(prevEl, members);
    }

    createFormBtn.addEventListener("click", (event) => {
        prevIsCreate = true;
        removeErrorMassage();
        cleanInputEl();
        activateDeactivatedForm(false);
        removeBtn();
        createBtn("Create");
    });

    updateFormBtn.addEventListener("click", (event) => {
        removeErrorMassage();
        if (prevEl !== null) {
            activateDeactivatedForm(false);
            // only role editable for update
            studentEl.disabled = true;

            removeBtn();
            createBtn("Update");

            if (prevIsCreate) {
                prevIsCreate = false;
                fillForm(prevEl, members);
            }
        } else {
            alert("You didn't choose anything. Choose element to update");
        }
    });


    deleteFormBtn.addEventListener("click", () => {
        console.log(prevIsCreate);
        if (prevIsCreate) {
            prevIsCreate = false;
            window.location.reload();
        } else {
            console.log(prevIsCreate);
            removeErrorMassage();
            if (prevEl !== null) {
                removeBtn();
                activateDeactivatedForm(true);
                if (confirm("Do you want to delete this team member?")) {
                    const params = new URLSearchParams();
                    params.append("teamId", parseInt(team.id, 10));
                    params.append("memberId", +prevEl.dataset.MemberId);

                    fetch("http://localhost:8080/team-member/delete", {
                        method: "DELETE",
                        body: params,
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                    })
                        .then((response) => response.text())
                        .then((result) => {
                            console.log("Server response:", result);
                            if (
                                result.includes("successfully") ||
                                result.includes("Success")
                            ) {
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
        fillForm(currentEl, members);
    });


    document.addEventListener("click", (event) => {
        removeErrorMassage();
        if (event.target.id === "btn-submit") {
            if (
                event.target.innerText === "Create" ||
                event.target.innerText === "Update"
            ) {
                event.preventDefault();

                const roleVal = roleEl.value;
                if (!roleVal) {
                    setInvalid(roleEl, "Role is required");
                    return;
                }

                if (event.target.innerText === "Create") {
                    const studentId = parseInt(studentEl.value, 10);
                    if (!Number.isInteger(studentId)) {
                        setInvalid(studentEl, "Student is required");
                        return;
                    }

                    const params = new URLSearchParams();
                    params.append("teamId", parseInt(team.id, 10));
                    params.append("studentId", studentId);
                    params.append("role", roleVal);

                    fetch("http://localhost:8080/team-member/create", {
                        method: "POST",
                        body: params,
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
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
                        const params = new URLSearchParams();
                        params.append("teamId", parseInt(team.id, 10));
                        params.append("memberId", +prevEl.dataset.MemberId);
                        params.append("role", roleVal);

                        fetch("http://localhost:8080/team-member/update", {
                            method: "POST",
                            body: params,
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                            },
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