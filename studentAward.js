const typeEl = document.getElementById("type");
const awardEl = document.getElementById("award");
const teacherEl = document.getElementById("teacher");
const studentEl = document.getElementById("student");
const projectEl = document.getElementById("project");
const teamEl = document.getElementById("team");
const dateEl = document.getElementById("date");
const pointsEl = document.getElementById("points");
const sprintEl = document.getElementById("sprint");
const ruleEl = document.getElementById("rule");

const createFormBtn = document.getElementById("create");
// const updateFormBtn = document.getElementById("update");
const deleteFormBtn = document.getElementById("delete");
const downloadFormBtn = document.getElementById("download");

const listEl = document.getElementById('award_list');
const formEl = document.getElementsByTagName("form")[0];

let prevEl = null;
let prevIsCreate = false;


function activateDeactivatedForm(isDisabled) {
    typeEl.disabled = isDisabled;
    awardEl.disabled = isDisabled;
    teacherEl.disabled = isDisabled;
    studentEl.disabled = isDisabled;
    projectEl.disabled = isDisabled;
    teamEl.disabled = isDisabled;

}

function activateDeactivatedTeamStudentForm(isTeam,isStudent) {
    typeEl.disabled = false;
    awardEl.disabled = false;
    teacherEl.disabled = false;
    studentEl.disabled = isStudent;
    projectEl.disabled = isStudent;
    teamEl.disabled = isTeam;
}

function cleanInputEl() {
    typeEl.value = '';
    awardEl.value = '';
    teacherEl.value = '';
    studentEl.value = '';
    projectEl.value = '';
    teamEl.value = '';
    dateEl.value = '';
    pointsEl.value = '';
    sprintEl.value = '';
    ruleEl.value = '';
}

function fillInputEl(type, award, teacher, student, project, team,date, points,sprint,rule) {
    typeEl.value = type;
    awardEl.value = award;
    teacherEl.value = teacher;
    studentEl.value = student;
    projectEl.value = project;
    teamEl.value = team;
    dateEl.value = date;
    pointsEl.value = points;
    sprintEl.value = sprint;
    ruleEl.value = rule;
}



function fillForm(currentEl,studentsAwards) {

    for(let i = 0; i < studentsAwards.length; i++) {
        if(studentsAwards[i].studentAwardId === +currentEl.dataset.StudentAwardId) {
            fillInputEl('',
                studentsAwards[i].award.awardID,
                studentsAwards[i].teacher.userId,
                studentsAwards[i].student.userId,
                studentsAwards[i].project.projectId,
                studentsAwards[i].team.teamID,
                studentsAwards[i].date,
                studentsAwards[i].points,
                studentsAwards[i].sprint?.sprintId ?? "null",
                studentsAwards[i].rule?.ruleId ?? "null");


        }
    }
}

function removeBtn() {
    if(document.getElementById('btn-submit') !== null) {
        document.getElementById('btn-submit').remove();
    }
}
function removeActiveClass() {
    if(prevEl !== null) {
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

function addElInList(id, name, date, i) {
    const aEl = document.createElement("a");
    const divHeader = document.createElement("div");
    const strongEl = document.createElement("strong");
    const divText = document.createElement("div");

    aEl.dataset.StudentAwardId = id;
    aEl.className = "list-group-item list-group-item-action py-3 lh-sm";
    divHeader.className = "d-flex w-100 align-items-center justify-content-between";
    strongEl.className = "mb";
    divText.className = 'col-10 mb-1 small'
    strongEl.innerText = name;
    divHeader.appendChild(strongEl);
    divText.innerText = date;
    aEl.appendChild(divHeader);
    aEl.appendChild(divText);
    listEl.appendChild(aEl);
    if(i === 0) {
        prevEl = aEl;
        prevEl.classList.add('active');
    }
    // <a href="#" className="list-group-itemlist-group-item-actionpy-3lh-sm">
    //     <divclass="d-flexw-100align-items-centerjustify-content-between">
    //         <strongclass="mb-1">Listgroupitemheading</strong>
    //         <small>Tues</small>
    //     </div>
    //     <divclass="col-10mb-1small">Someplaceholdercontentinaparagraphbelowtheheadinganddate.</div>
    // </a>

}

function addOptions(parentEl, value, text) {
    const optionEl = document.createElement("option");
    optionEl.value = value;
    optionEl.innerText = text;
    parentEl.appendChild(optionEl);

}

function removeErrorMassage() {
    typeEl.classList.remove('is-invalid');
    awardEl.classList.remove('is-invalid');
    teacherEl.classList.remove('is-invalid');
    studentEl.classList.remove('is-invalid');
    projectEl.classList.remove('is-invalid');
    teamEl.classList.remove('is-invalid');
    dateEl.classList.remove('is-invalid');
    pointsEl.classList.remove('is-invalid');
    sprintEl.classList.remove('is-invalid');
    ruleEl.classList.remove('is-invalid');
}


function setInvalid(el, errorText) {
    el.classList.add('is-invalid');
    el.nextElementSibling.innerHTML = errorText;
}


function setErrorMsg(errorMsg) {
    document.getElementById('errorMsg').style.display = 'block';
    document.getElementById('errorMsgText').innerText = errorMsg;
}


function exportToExcel(data, filename = "export.xlsx") {
    const prepared = data.map(item => {
        const obj = {};
        for (let key in item) {
            obj[key] = (typeof item[key] === "object")
                ? JSON.stringify(item[key])
                : item[key];
        }
        return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(prepared);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, filename);
}


Promise.all([
    fetch("http://localhost:8080/students-awards/all").then(r => r.json()),
    fetch("http://localhost:8080/awards/projects/all").then(r => r.json()),
    fetch("http://localhost:8080/awards/teachers/all").then(r => r.json()),
    fetch("http://localhost:8080/awards/all").then(r => r.json()),
    fetch("http://localhost:8080/awards/students/all").then(r => r.json()),
    fetch("http://localhost:8080/team/all").then(r => r.json()),
]).then(([studentsAwards, projects,teachers,awards,students,team]) => {

    console.log(studentsAwards);
    console.log(projects);
    console.log(teachers);
    console.log(awards);
    console.log(students);
    console.log(team);


    for(let i = 0 ; i < studentsAwards.length ; i++) {
        addElInList(studentsAwards[i].studentAwardId, studentsAwards[i].student.name, studentsAwards[i].date, i);
    }


    for(let j = 0 ; j < projects.length; j++) {
        addOptions(projectEl, projects[j].projectId,  projects[j].projectName);
    }
    for(let k = 0 ; k < teachers.length; k++) {
        addOptions(teacherEl, teachers[k].userId,  teachers[k].name);
    }
    for(let a = 0 ; a < awards.length; a++) {
        addOptions(awardEl, awards[a].awardID,  awards[a].awardName);
    }
    for(let s = 0 ; s < students.length; s++) {
        addOptions(studentEl, students[s].userId,  students[s].name);
    }
    for(let s = 0 ; s < team.length; s++) {
        addOptions(teamEl, team[s].teamID,  team[s].teamName);
    }
    if(studentsAwards.length > 0) {
        fillForm(prevEl, studentsAwards);
    }




    createFormBtn.addEventListener('click', event => {
        // console.log("createFormBtn")
        prevIsCreate = true;
        removeErrorMassage();
        cleanInputEl();
        typeEl.disabled = false;
        removeBtn();
        createBtn('Assign');
    });





    deleteFormBtn.addEventListener('click', () => {
        console.log(prevIsCreate);
        if(prevIsCreate) {
            prevIsCreate = false;
            window.location.reload();
        } else {
            console.log(prevIsCreate);
            removeErrorMassage();
            if(prevEl !== null) {
                removeBtn();
                activateDeactivatedForm(true);
                if (confirm("Do you want to delete this entity?")) {

                    fetch(`http://localhost:8080/students-awards/delete/${prevEl.dataset.StudentAwardId}`, {
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
            } else  {
                alert("You didn't choose nothing. Choose element to delete");
            }
        }
    });

    downloadFormBtn.addEventListener('click', event => {
        exportToExcel(studentsAwards, "students_awards.xlsx");
    });


    listEl.addEventListener('click', event => {
        prevIsCreate = false;
        removeErrorMassage();
        activateDeactivatedForm(true);
        removeBtn();
        removeActiveClass();
        let currentEl = event.target;
        while(!currentEl.classList.contains('list-group-item')) {
            currentEl = currentEl.parentNode;
        }
        prevEl = currentEl;
        currentEl.classList.add('active');
        fillForm(currentEl,studentsAwards);

    });






    document.addEventListener('change', event => {
        if(document.getElementById('btn-submit') !== null) {
            if(event.target.id === 'type') {
                if(event.target.value === "TEAM" ) {
                    cleanInputEl();
                    typeEl.value = "TEAM";
                    activateDeactivatedTeamStudentForm(false,true);
                } else if (event.target.value === "INDIVIDUAL" ) {
                    cleanInputEl();
                    typeEl.value = "INDIVIDUAL";
                    activateDeactivatedTeamStudentForm(true,false);
                } else  {
                    activateDeactivatedForm(true);
                    typeEl.disabled = false;
                }
            } else if(event.target.id === 'award') {

                for(let i = 0; i < awards.length; i++) {
                    if(awards[i].awardID == event.target.value ) {
                        pointsEl.value = awards[i].pointsValue;
                    }
                }
            }
        }
    });





    document.addEventListener('click', event => {
        // let loginFlag = true;
        removeErrorMassage();
        if(event.target.id === 'btn-submit') {
            if(event.target.innerText === 'Assign') {
                event.preventDefault();
                if(typeEl.value === "INDIVIDUAL") {

                    const awardId = parseInt(awardEl.value, 10);
                    const studentId = parseInt(studentEl.value, 10);
                    const teacherId = parseInt(teacherEl.value, 10);
                    const projectId = parseInt(projectEl.value, 10);
                    if(Number.isFinite(studentId) && Number.isInteger(teacherId) && Number.isInteger(projectId) && Number.isInteger(awardId)) {
                        const formDataCreate = new FormData();
                        formDataCreate.append("awardId", awardId);
                        formDataCreate.append("studentId", studentId);
                        formDataCreate.append("teacherId", teacherId);
                        formDataCreate.append("projectId", projectId);

                        fetch("http://localhost:8080/students-awards/assignStudentAward", {
                            method: "POST",
                            body: formDataCreate
                        })
                            .then(response => response.text())
                            .then(result => {
                                console.log("Server response:", result);
                                if(result.includes("Success")) {
                                    window.location.reload();
                                } else if(result.includes("ERROR")) {
                                    setErrorMsg(result);
                                }
                            })
                            .catch(err => {
                                console.error(err);
                                setErrorMsg(err);
                            });

                    } else {
                        setErrorMsg("Wrong parms");
                    }
                } else if(typeEl.value === "TEAM") {



                    const awardId = parseInt(awardEl.value, 10);
                    const teacherId = parseInt(teacherEl.value, 10);
                    const teamId = parseInt(teamEl.value, 10);
                    if(Number.isInteger(teacherId) && Number.isInteger(teamId) && Number.isInteger(awardId)) {
                        const formDataCreate = new FormData();
                        formDataCreate.append("awardId", awardId);
                        formDataCreate.append("teacherId", teacherId);
                        formDataCreate.append("teamId", teamId);

                        fetch("http://localhost:8080/students-awards/assignTeamAward", {
                            method: "POST",
                            body: formDataCreate
                        })
                            .then(response => response.text())
                            .then(result => {
                                console.log("Server response:", result);
                                if(result.includes("Success")) {
                                    window.location.reload();
                                } else if(result.includes("ERROR")) {
                                    setErrorMsg(result);
                                }
                            })
                            .catch(err => {
                                console.error(err);
                                setErrorMsg(err);
                            });

                    } else {
                        setErrorMsg("Wrong parms");
                    }
                }
            }
        }
    });


}).catch(error => {
    setErrorMsg(error);
});


