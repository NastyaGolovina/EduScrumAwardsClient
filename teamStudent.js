const teamNameEl = document.getElementById("name");
const createFormBtn = document.getElementById("create");
const updateFormBtn = document.getElementById("update");
const deleteFormBtn = document.getElementById("delete");
const teamMembersBtn = document.getElementById("teamMembers");
const listEl = document.getElementById("team_list");
const formEl = document.getElementsByTagName("form")[0];

let prevEl = null;
let prevIsCreate = false;

function activateDeactivatedForm(isDisabled) {
    teamNameEl.disabled = isDisabled;
}

function cleanInputEl() {
    teamNameEl.value = "";
}

function fillInputEl(name) {
    teamNameEl.value = name;
}

function fillForm(currentEl, teams) {
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].teamID === +currentEl.dataset.TeamId) {
            fillInputEl(teams[i].teamName);
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

function addElInList(id, name, i) {
    const aEl = document.createElement("a");
    const divHeader = document.createElement("div");
    const strongEl = document.createElement("strong");

    aEl.dataset.TeamId = id;
    aEl.className = "list-group-item list-group-item-action py-3 lh-sm";
    divHeader.className = "d-flex w-100 align-items-center justify-content-between";
    strongEl.className = "mb";
    strongEl.innerText = name;

    divHeader.appendChild(strongEl);
    aEl.appendChild(divHeader);
    listEl.appendChild(aEl);

    if (i === 0) {
        prevEl = aEl;
        prevEl.classList.add("active");
    }
}

function removeErrorMassage() {
    teamNameEl.classList.remove("is-invalid");
}

function setInvalid(el, errorText) {
    el.classList.add('is-invalid');
    el.nextElementSibling.innerHTML = errorText;
}

function setErrorMsg(errorMsg) {
    document.getElementById('errorMsg').style.display = 'block';
    document.getElementById('errorMsgText').innerText = errorMsg;
}

fetch("http://localhost:8080/team/all")
    .then((response) => {
        return response.json();
    })
    .then((result) => {
        console.log(result);
        let teams = result;

        // fill team list
        for (let i = 0; i < teams.length; i++) {
            addElInList(teams[i].teamID, teams[i].teamName, i);
        }

        // fill form with first team
             if (teams.length > 0 && prevEl !== null) {
                    fillForm(prevEl, teams);
             }

             createFormBtn.addEventListener("click", (event) => {
                         prevIsCreate = true;
                         cleanInputEl();
                         activateDeactivatedForm(false);
                         removeBtn();
                         removeErrorMassage();
                         //setErrorMsg("");
                         createBtn("Create");
                     });

             updateFormBtn.addEventListener("click", (event) => {
                         removeErrorMassage();

                         if (prevEl !== null) {
                             activateDeactivatedForm(false);
                             removeBtn();
                             createBtn("Update");

                             if (prevIsCreate) {
                                 prevIsCreate = false;
                                 fillForm(prevEl, teams);
                             }
                         } else {
                             alert("You didn't choose anything. Choose a team to update");
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
                                 if (confirm("Do you want to delete this team?")) {
                                     console.log(prevEl.dataset.TeamId);
                                     fetch(
                                         `http://localhost:8080/team/delete/${prevEl.dataset.TeamId}`,
                                         {
                                             method: "DELETE",
                                         }
                                     )
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
                                 alert("You didn't choose anything. Choose a team to delete");
                             }
                         }
                     });

               // click on team list item
               listEl.addEventListener("click", (event) => {
               prevIsCreate = false;
               removeErrorMassage();
               document.getElementById("errorMsg").style.display = "none";
               activateDeactivatedForm(true);
               removeBtn();
               removeActiveClass();

               let currentEl = event.target;
               while (!currentEl.classList.contains("list-group-item")) {
               currentEl = currentEl.parentNode;
               }
               prevEl = currentEl;
               currentEl.classList.add("active");
               fillForm(currentEl, teams);
               });


              // teamMember button
              teamMembersBtn.addEventListener("click", (event) => {
              event.preventDefault();
              if (prevEl != null) {
              let team = {};
              team.id = +prevEl.dataset.TeamId;
              team.name = teamNameEl.value;

              localStorage.setItem("team", JSON.stringify(team));
              window.location.href = teamMembersBtn.href;
              } else {
              alert("You didn't choose any team.");
              }
              });

              // === CREATE / UPDATE SUBMIT (btn-submit) ===
                      document.addEventListener("click", (event) => {
                          removeErrorMassage();
                          if (event.target.id === "btn-submit") {
                              if (
                                  event.target.innerText === "Create" ||
                                  event.target.innerText === "Update"
                              ) {
                                  event.preventDefault();


                                  const name = teamNameEl.value.trim();
                                  if (name === "") {
                                      setInvalid(teamNameEl, "Team name cannot be empty");
                                      return;
                                  }
                                  if (name.length > 100) {
                                      setInvalid(teamNameEl, "Team name is too long (max 100 chars)");
                                      return;
                                  }

                                  if (event.target.innerText === "Create") {
                                      const formDataCreate = new FormData();
                                      formDataCreate.append("teamName", name);

                                      fetch("http://localhost:8080/team/create", {
                                          method: "POST",
                                          body: formDataCreate,
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
                                          const formDataUpdate = new FormData();
                                          formDataUpdate.append("teamId", +prevEl.dataset.TeamId);
                                          formDataUpdate.append("teamName", name);

                                          fetch("http://localhost:8080/team/update", {
                                              method: "POST",
                                              body: formDataUpdate,
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
                  })
                  .catch((error) => {
                      setErrorMsg(error);
                  });