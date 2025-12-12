(() => {
    // ===========================
    // ELEMENTS
    // ===========================
    const projectNameEl = document.getElementById("projectName");
    const teamSelectEl = document.getElementById("teamSelect");
    const createFormBtn = document.getElementById("create");
    const updateFormBtn = document.getElementById("update");
    const deleteFormBtn = document.getElementById("delete");
    const listEl = document.getElementById("project_list");
    const formEl = document.getElementsByTagName("form")[0];
    const sprintsBtn = document.getElementById("sprintsPage");

    if (!listEl || !projectNameEl || !teamSelectEl || !formEl || !sprintsBtn) {
        console.error("Missing DOM elements - check IDs in HTML.");
        return;
    }

    // ===========================
    // STATE
    // ===========================
    let prevEl = null;
    let prevIsCreate = false;
    let projects = [];
    let teams = [];

    const course = JSON.parse(localStorage.getItem("course") || "null");
    const courseId = course?.id;
    if (!courseId) {
        alert("No course selected. Please select a course first.");
        return;
    }

    // ===========================
    // HELPERS
    // ===========================
    function activateForm(isDisabled) {
        projectNameEl.disabled = isDisabled;
        teamSelectEl.disabled = isDisabled;
    }

    function cleanForm() {
        projectNameEl.value = "";
        teamSelectEl.value = "";
    }

    function fillForm(project) {
        if (!project) return;
        projectNameEl.value = project.projectName ?? "";
        teamSelectEl.value = project.team?.teamID ?? "";
    }

    function removeActive() {
        if (prevEl) prevEl.classList.remove("active");
    }

    function removeBtn() {
        const btn = document.getElementById("btn-submit");
        if (btn) btn.remove();
    }

    function createBtn(text) {
        const btn = document.createElement("button");
        btn.id = "btn-submit";
        btn.type = "button";
        btn.className = "w-100 btn btn-primary btn-lg mt-3";
        btn.innerText = text;
        formEl.appendChild(btn);
    }

    function showError(msg) {
        alert(msg);
    }

    // ===========================
    // LOAD TEAMS
    // ===========================
    function loadTeams() {
        fetch("http://localhost:8080/team/all")
            .then(r => r.ok ? r.json() : Promise.reject("Teams fetch failed"))
            .then(result => {
                teams = result || [];
                teamSelectEl.innerHTML = '<option value="">--Select Team--</option>';
                teams.forEach(t => {
                    const opt = document.createElement("option");
                    opt.value = t.teamID;
                    opt.innerText = t.teamName;
                    teamSelectEl.appendChild(opt);
                });
            })
            .catch(err => console.error("Error loading teams:", err));
    }

    // ===========================
    // LOAD PROJECTS
    // ===========================
    function loadProjects() {
        fetch(`http://localhost:8080/courses/${courseId}/projects`)
            .then(r => r.ok ? r.json() : Promise.reject("Projects fetch failed"))
            .then(result => {
                projects = result || [];
                listEl.innerHTML = "";

                projects.forEach((p, i) => {
                    const a = document.createElement("a");
                    a.className = "list-group-item list-group-item-action py-3 lh-sm";
                    a.dataset.projectId = p.projectId;
                    a.innerHTML = `<div><strong>${p.projectName}</strong></div>`;
                    listEl.appendChild(a);

                    if (i === 0) {
                        prevEl = a;
                        a.classList.add("active");
                        fillForm(p);
                        activateForm(true);
                        localStorage.setItem("project", JSON.stringify({
                            projectId: p.projectId,
                            courseId: courseId,
                            projectName: p.projectName
                        }));
                    }
                });

                if (projects.length === 0) {
                    listEl.innerHTML = '<div class="list-group-item">No projects found for this course.</div>';
                    activateForm(true);
                    cleanForm();
                }
            })
            .catch(err => {
                console.error("Error loading projects:", err);
                showError("Failed to load projects. See console.");
            });
    }

    loadTeams();
    loadProjects();

    // ===========================
    // LIST CLICK
    // ===========================
    listEl.addEventListener("click", e => {
        let el = e.target;
        while (el && !el.classList.contains("list-group-item")) el = el.parentNode;
        if (!el || !el.dataset.projectId) return;

        removeActive();
        prevEl = el;
        el.classList.add("active");
        prevIsCreate = false;

        const id = Number(el.dataset.projectId);
        const project = projects.find(p => p.projectId === id);
        fillForm(project);
        activateForm(true);
        removeBtn();

        localStorage.setItem("project", JSON.stringify({
            projectId: project.projectId,
            courseId: courseId,
            projectName: project.projectName
        }));
    });

    // ===========================
    // SHOW CREATE / UPDATE FORM
    // ===========================
    createFormBtn.addEventListener("click", () => {
        prevIsCreate = true;
        cleanForm();
        activateForm(false);
        teamSelectEl.disabled = false;
        removeBtn();
        createBtn("Create");
    });

    updateFormBtn.addEventListener("click", () => {
        if (!prevEl) return showError("Select a project");
        prevIsCreate = false;
        activateForm(false);
        teamSelectEl.disabled = true;
        removeBtn();
        createBtn("Update");

        const projectId = Number(prevEl.dataset.projectId);
        const project = projects.find(p => p.projectId === projectId);
        fillForm(project);
    });

    // ===========================
    // DELETE
    // ===========================
    deleteFormBtn.addEventListener("click", () => {
        if (!prevEl) return showError("Select a project");
        if (!confirm("Delete this project?")) return;

        const projectId = prevEl.dataset.projectId;
        fetch(`http://localhost:8080/courses/${courseId}/projects/${projectId}/delete`, { method: "DELETE" })
            .then(r => { if (!r.ok) throw new Error(`Delete failed: ${r.status}`); return r.text(); })
            .then(() => {
                prevEl = null;
                loadProjects();
            })
            .catch(err => {
                console.error("Delete error:", err);
                showError("Delete failed. See console.");
            });
    });

    // ===========================
    // SUBMIT (CREATE / UPDATE)
    // ===========================
    document.addEventListener("click", e => {
        if (e.target.id !== "btn-submit") return;

        const name = projectNameEl.value.trim();
        const teamId = Number(teamSelectEl.value);
        if (!name) return showError("Project name required");
        if (!teamId) return showError("Select a team");

        const formData = new FormData();
        formData.append("projectName", name);
        formData.append("teamId", String(teamId));

        if (prevIsCreate) {
            fetch(`http://localhost:8080/courses/${courseId}/projects/create`, { method: "POST", body: formData })
                .then(r => { if (!r.ok) throw new Error(`Create failed: ${r.status}`); return r.text(); })
                .then(() => {
                    loadProjects();
                    removeBtn();
                    activateForm(true);
                })
                .catch(err => { console.error(err); showError("Create failed."); });
        } else {
            if (!prevEl) return showError("Select a project to update");
            const projectId = prevEl.dataset.projectId;
            formData.append("projectId", projectId);

            fetch(`http://localhost:8080/courses/${courseId}/projects/${projectId}/update`, { method: "PUT", body: formData })
                .then(r => { if (!r.ok) throw new Error(`Update failed: ${r.status}`); return r.text(); })
                .then(() => {
                    loadProjects();
                    removeBtn();
                    activateForm(true);
                })
                .catch(err => { console.error(err); showError("Update failed."); });
        }
    });

    // ===========================
    // NAVIGATE TO SPRINTS
    // ===========================
    sprintsBtn.addEventListener("click", event => {
        event.preventDefault();

        if (!prevEl && projects.length > 0) {
            prevEl = listEl.querySelector("a.list-group-item");
        }

        if (prevEl) {
            const project = {
                projectId: +prevEl.dataset.projectId,
                courseId: courseId,
                projectName: prevEl.querySelector("strong").innerText
            };
            localStorage.setItem("project", JSON.stringify(project));
            window.location.href = "sprintPage.html";
        } else {
            alert("You didn't choose any project.");
        }
    });
})();
