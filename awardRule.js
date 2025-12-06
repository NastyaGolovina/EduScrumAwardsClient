const awardEl = document.getElementById("award");
const cpEl = document.getElementById("completion_percent");
const goalsCompletedEl = document.getElementById("is_All_Goals_Completed");
const projectEl = document.getElementById("project");
const teacherEl = document.getElementById("teacher");
const createFormBtn = document.getElementById("create");
const updateFormBtn = document.getElementById("update");
const deleteFormBtn = document.getElementById("delete");
const listEl = document.getElementById('rules_list');
const formEl = document.getElementsByTagName("form")[0];

const lsObj = localStorage.getItem("award");
let awardId = JSON.parse(lsObj);
// console.log(awardId.id);

let prevEl = null;
let prevIsCreate = false;


function activateDeactivatedForm(isDisabled) {
    awardEl.disabled = true;
    cpEl.disabled = isDisabled;
    goalsCompletedEl.disabled = isDisabled;
    projectEl.disabled = isDisabled;
    teacherEl.disabled = isDisabled;
}

function cleanInputEl() {
    awardEl.value = "";
    cpEl.value = "";
    goalsCompletedEl.checked = false;
    projectEl.value = "";
    teacherEl.value = "";
}

function fillInputEl(award, cp, goalsCompleted, project, teacher) {
    awardEl.value = award;
    cpEl.value = cp;
    goalsCompletedEl.checked = +goalsCompleted;
    projectEl.value = project;
    teacherEl.value = teacher;
}



function fillForm(currentEl,rules) {




    for(let i = 0; i < rules.length; i++) {
        if(rules[i].ruleId === +currentEl.dataset.RuleId) {
            fillInputEl(rules[i].award.awardName,
                rules[i].completionPercent,
                rules[i].allGoalsCompleted,
                rules[i].project.projectId,
                rules[i].teacher.userId,
                );
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

function addElInList(id, project, teacher, i) {
    const aEl = document.createElement("a");
    const divHeader = document.createElement("div");
    const strongEl = document.createElement("strong");
    const divText = document.createElement("div");

    aEl.dataset.RuleId = id;
    aEl.className = "list-group-item list-group-item-action py-3 lh-sm";
    divHeader.className = "d-flex w-100 align-items-center justify-content-between";
    strongEl.className = "mb";
    divText.className = 'col-10 mb-1 small'
    strongEl.innerText = project;
    divHeader.appendChild(strongEl);
    divText.innerText = teacher;
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
    awardEl.classList.remove('is-invalid');
    cpEl.classList.remove('is-invalid');
    goalsCompletedEl.classList.remove('is-invalid');
    projectEl.classList.remove('is-invalid');
    teacherEl.classList.remove('is-invalid');
}


function setInvalid(el, errorText) {
    el.classList.add('is-invalid');
    el.nextElementSibling.innerHTML = errorText;
}

function setErrorMsg(errorMsg) {
    document.getElementById('errorMsg').style.display = 'block';
    document.getElementById('errorMsgText').innerText = errorMsg;
}






Promise.all([
    fetch(`http://localhost:8080/awards-rule/all/${awardId.id}`).then(r => r.json()),
    fetch("http://localhost:8080/awards/projects/all").then(r => r.json()),
    fetch("http://localhost:8080/awards/teachers/all").then(r => r.json()),
    ]).then(([rules, projects,teachers]) => {

        console.log(rules);
        console.log(projects);
        console.log(teachers);


        for(let i = 0 ; i < rules.length ; i++) {
            addElInList(rules[i].ruleId, rules[i].project.projectName, rules[i].teacher.name, i);
        }


        for(let j = 0 ; j < projects.length; j++) {
            addOptions(projectEl, projects[j].projectId,  projects[j].projectName);
        }
        for(let k = 0 ; k < teachers.length; k++) {
            addOptions(teacherEl, teachers[k].userId,  teachers[k].name);
        }


        if(rules.length > 0) {
            fillForm(prevEl, rules);
        }




        createFormBtn.addEventListener('click', event => {
            prevIsCreate = true;
            removeErrorMassage();
            cleanInputEl();
            activateDeactivatedForm(false);
            removeBtn();
            createBtn('Create');
        });


        updateFormBtn.addEventListener('click', event => {
            removeErrorMassage();
            if(prevEl !== null) {
                activateDeactivatedForm(false);
                teacherEl.disabled = true;
                projectEl.disabled = true;
                if(goalsCompletedEl.checked) {
                    cpEl.disabled = true;
                }

                removeBtn();
                createBtn('Update');
                if(prevIsCreate) {
                    prevIsCreate = false;
                    fillForm(prevEl,rules);

                }
            }  else {
                alert("You didn't choose nothing. Choose element ti update");
            }


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
                    if (confirm("Do you want to delete this rule?")) {

                        const params = new URLSearchParams();
                        params.append("ruleId",  +prevEl.dataset.RuleId);
                        params.append("awardId", parseInt(awardId.id, 10));

                        fetch("http://localhost:8080/awards-rule/delete", {
                            method: "DELETE",
                            body: params,
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            }
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
            // console.log(currentEl);
            currentEl.classList.add('active');
            fillForm(currentEl,rules);

        });






        goalsCompletedEl.addEventListener('change', function() {
            if (goalsCompletedEl.checked) {
                cpEl.disabled =true;
                cpEl.value = 100;
            } else {
                cpEl.disabled = false;
                cpEl.value = '';
            }
        });


        document.addEventListener('click', event => {
            // let loginFlag = true;
            removeErrorMassage();
            if(event.target.id === 'btn-submit') {
                if(event.target.innerText === 'Create' || event.target.innerText === 'Update') {
                    event.preventDefault();
                    if(event.target.innerText === 'Create') {
                        // const completionPercent = +cpEl.value;
                        // if(Number.isFinite(completionPercent)) {
                        //     const params = new URLSearchParams();
                        //     params.append("completionPercent", completionPercent);
                        //     params.append("isAllGoalsCompleted", goalsCompletedEl.checked);
                        //     params.append("teacherId", teacherEl.value);
                        //     params.append("projectId", projectEl.value);
                        //     params.append("awardId", awardId);
                        const completionPercent = parseFloat(cpEl.value);
                        const isAllGoalsCompleted = goalsCompletedEl.checked; // true/false
                        const teacherId = parseInt(teacherEl.value, 10);
                        const projectId = parseInt(projectEl.value, 10);
                        const awardIdNum = parseInt(awardId.id, 10);
                        // console.log(completionPercent);
                        // console.log(isAllGoalsCompleted);
                        // console.log(teacherId);
                        // console.log(projectId);
                        // console.log(awardIdNum);

                        if (Number.isFinite(completionPercent) && Number.isInteger(teacherId) && Number.isInteger(projectId) && Number.isInteger(awardIdNum)) {
                            const params = new URLSearchParams();
                            params.append("completionPercent", completionPercent);
                            params.append("isAllGoalsCompleted", isAllGoalsCompleted);
                            params.append("teacherId", teacherId);
                            params.append("projectId", projectId);
                            params.append("awardId", awardIdNum);

                            fetch("http://localhost:8080/awards-rule/create", {
                                method: "POST",
                                body: params,
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
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
                                .catch(err => console.error(err));

                        } else {
                            setErrorMsg("Incorrect values");
                        }
                    } else if(event.target.innerText === 'Update'){
                        if(prevEl != null) {
                            const params = new URLSearchParams();
                            params.append("ruleId",  +prevEl.dataset.RuleId);
                            params.append("completionPercent", parseFloat(cpEl.value));
                            params.append("isAllGoalsCompleted", goalsCompletedEl.checked);
                            params.append("awardId", parseInt(awardId.id, 10));

                            fetch("http://localhost:8080/awards-rule/update", {
                                method: "POST",
                                body: params,
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            })
                                .then(response => response.text())
                                .then(result => {
                                    console.log("Server response:", result);
                                    if(result.includes("Success")) {
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
    }).catch(error => {
    setErrorMsg(error);
});






