// const awardIdEl = document.getElementById("award-id");
const nameEl = document.getElementById("name");
const descriptionEl = document.getElementById("description");
const pointEl = document.getElementById("point");
const typeEl = document.getElementById("type");
const modeEl = document.getElementById("mode");
const createFormBtn = document.getElementById("create");
const updateFormBtn = document.getElementById("update");
const deleteFormBtn = document.getElementById("delete");
const awardRulesBtn = document.getElementById("awardRules");
const listEl = document.getElementById('award_list');
const formEl = document.getElementsByTagName("form")[0];

let prevEl = null;
let prevIsCreate = false;
function activateDeactivatedForm(isDisabled) {
    nameEl.disabled = isDisabled;
    // awardIdEl.disabled = true;
    descriptionEl.disabled = isDisabled;
    pointEl.disabled = isDisabled;
    typeEl.disabled = isDisabled;
    modeEl.disabled = isDisabled;
}


function cleanInputEl() {
    nameEl.value = "";
    // awardIdEl.value = "";
    descriptionEl.value = "";
    pointEl.value = "";
    modeEl.value = '';
    typeEl.value = '';
}


function fillInputEl(name, description, point, type, mode) {
    // awardIdEl.value = awardId;
    nameEl.value = name;
    descriptionEl.value = description;
    pointEl.value = point;
    typeEl.value = type.toUpperCase();
    modeEl.value = mode.toUpperCase();

}



function fillForm(currentEl,awards) {

    // let lProgramID = '';
    for(let i = 0; i < awards.length; i++) {
        if(awards[i].awardID === +currentEl.dataset.AwardId) {
            fillInputEl(awards[i].awardName,
                awards[i].awardDescription,
                awards[i].pointsValue,
                awards[i].assignType,
                awards[i].assignMode);
            if(awards[i].assignType.toUpperCase() === "AUTOMATIC") {
                awardRulesBtn.style.pointerEvents = 'auto';
                awardRulesBtn.style.opacity = '1';
            } else {
                awardRulesBtn.style.pointerEvents = 'none';
                awardRulesBtn.style.opacity = '0.6';
            }

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

function addElInList(id, name, description, i) {
    const aEl = document.createElement("a");
    const divHeader = document.createElement("div");
    const strongEl = document.createElement("strong");
    const divText = document.createElement("div");

    aEl.dataset.AwardId = id;
    aEl.className = "list-group-item list-group-item-action py-3 lh-sm";
    divHeader.className = "d-flex w-100 align-items-center justify-content-between";
    strongEl.className = "mb";
    divText.className = 'col-10 mb-1 small'
    strongEl.innerText = name;
    divHeader.appendChild(strongEl);
    divText.innerText = description;
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
    nameEl.classList.remove('is-invalid');
    descriptionEl.classList.remove('is-invalid');
    pointEl.classList.remove('is-invalid');
    typeEl.classList.remove('is-invalid');
    modeEl.classList.remove('is-invalid');
}


function setInvalid(el, errorText) {
    el.classList.add('is-invalid');
    el.nextElementSibling.innerHTML = errorText;
}
// fetch("DBErrorUserJson.php")
//     .then((response) => {
//         return response.json();
//
//     })
//     .then((result) => {
//         if(result.isError) {
//             document.getElementById('errorMsg').style.display = 'block';
//             document.getElementById('errorMsgText').innerText = result.errorMsg;
//         }
//     });

function setErrorMsg(errorMsg) {
    document.getElementById('errorMsg').style.display = 'block';
    document.getElementById('errorMsgText').innerText = errorMsg;
}




fetch("http://localhost:8080/awards/all")
    .then((response) => {
        return response.json();

    })
    .then((result) => {
        console.log(result);
        let awards = result;


        for(let i = 0 ; i < awards.length ; i++) {
            addElInList(awards[i].awardID, awards[i].awardName, awards[i].awardDescription, i);
        }

        if(awards.length > 0) {
            fillForm(prevEl, awards);
        }




        createFormBtn.addEventListener('click', event => {
            prevIsCreate = true;
            // removeActiveClass()
            // prevEl = null;
            // removeErrorMassage();
            cleanInputEl();
            activateDeactivatedForm(false);
            removeBtn();
            createBtn('Create');
        });


        updateFormBtn.addEventListener('click', event => {
            removeErrorMassage();
            if(prevEl !== null) {
                activateDeactivatedForm(false);
                pointEl.disabled = true;
                typeEl.disabled = true;
                modeEl.disabled = true;
                // if(permissionEl.value === "CUSTOMER") {
                //     loyaltyEl.disabled = false;
                // }
                removeBtn();
                createBtn('Update');
                if(prevIsCreate) {
                    prevIsCreate = false;
                    fillForm(prevEl,awards);
                    // if(permissionEl.value === "CUSTOMER") {
                    //     loyaltyEl.disabled = false;
                    // }
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
                    if (confirm("Do you want to delete this user?")) {
                        console.log(prevEl.dataset.AwardId);
                        fetch(`http://localhost:8080/awards/delete/${prevEl.dataset.AwardId}`, {
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
            fillForm(currentEl,awards);

        });



        awardRulesBtn.addEventListener('click', event => {
            event.preventDefault();
            if(prevEl != null) {
                let award = {};
                award.id = +prevEl.dataset.AwardId
                localStorage.setItem("award", JSON.stringify(award));
                // setTimeout(() => {
                //     // window.location.href = this.href;
                //
                //     //get on award rule page
                //     // const lsObj = localStorage.getItem("award");
                //     // let newObj = JSON.parse(lsObj);
                //     // console.log(newObj);
                // }, 1000);
            }
        });
        //
        //
        //
        //
        // document.addEventListener('change', event => {
        //     if(document.getElementById('btn-submit') !== null) {
        //         if(event.target.id === 'permission') {
        //             if(event.target.value === "CUSTOMER" ) {
        //                 loyaltyEl.disabled = false;
        //             } else {
        //                 loyaltyEl.value = '';
        //                 loyaltyEl.disabled = true;
        //             }
        //         }
        //     }
        // });
        //
        //
        //
        //
        //
        document.addEventListener('click', event => {
            // let loginFlag = true;
            removeErrorMassage();
            if(event.target.id === 'btn-submit') {
                if(event.target.innerText === 'Create' || event.target.innerText === 'Update') {
                    event.preventDefault();
                    if(event.target.innerText === 'Create') {
                        const points = +pointEl.value;
                        if(Number.isInteger(points)) {
                            const formDataCreate = new FormData();
                            formDataCreate.append("name", nameEl.value);
                            formDataCreate.append("description", descriptionEl.value);
                            formDataCreate.append("points", points);
                            formDataCreate.append("assignType", typeEl.value);
                            formDataCreate.append("assignMode", modeEl.value);

                            fetch("http://localhost:8080/awards/create", {
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
                                .catch(err => console.error(err));

                        } else {
                            setInvalid(pointEl, 'Points must be integer');
                        }
                    } else if(event.target.innerText === 'Update'){
                        if(prevEl != null) {
                            const formDataUpdate = new FormData();
                            formDataUpdate.append("id", +prevEl.dataset.AwardId);
                            formDataUpdate.append("name", nameEl.value);
                            formDataUpdate.append("description", descriptionEl.value);

                            fetch("http://localhost:8080/awards/update", {
                                method: "POST",
                                body: formDataUpdate
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
    });



