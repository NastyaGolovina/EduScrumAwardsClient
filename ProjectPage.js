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

    if (!listEl || !projectNameEl || !teamSelectEl || !formEl) {
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
        // project.team may be null; guard:
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
        btn.className = "w-100 btn btn-primary btn-lg";
        btn.innerText = text;
        formEl.appendChild(btn);
    }

    function showError(msg) {
        // you can replace with nicer UI, for now alert
        alert(msg);
    }

    // ===========================
    // LOAD TEAMS
    // ===========================
    function loadTeams() {
        fetch("http://localhost:8080/team/all")
            .then(r => {
                if (!r.ok) throw new Error("Teams fetch failed: " + r.status);
                return r.json();
            })
            .then(result => {
                teams = result || [];
                // keep default option
                teamSelectEl.innerHTML = '<option value="">--Select Team--</option>';
                teams.forEach(t => {
                    const opt = document.createElement("option");
                    opt.value = t.teamID;
                    opt.innerText = t.teamName;
                    teamSelectEl.appendChild(opt);
                });
            })
            .catch(err => {
                console.error("Error loading teams:", err);
                // still let user continue (they may create without team)
            });
    }

    // ===========================
    // LOAD PROJECTS
    // ===========================
    const course = JSON.parse(localStorage.getItem("course") || "null");
    const courseId = course?.id;

    if (!courseId) {
        alert("No course selected. Please select a course first.");
        // Optionally: redirect to courses page:
        // window.location.href = "coursePage.html";
        return;
    }

    function loadProjects() {
        fetch(`http://localhost:8080/courses/${courseId}/projects`)
            .then(r => {
                if (!r.ok) throw new Error("Projects fetch failed: " + r.status);
                return r.json();
            })
            .then(result => {
                projects = result || [];
                listEl.innerHTML = "";

                projects.forEach((p, i) => {
                    const a = document.createElement("a");
                    a.className = "list-group-item list-group-item-action py-3 lh-sm";
                    // use standard data attr
                    a.dataset.projectId = p.projectId;
                    a.innerHTML = `<div><strong>${p.projectName}</strong></div>`;
                    listEl.appendChild(a);

                    if (i === 0) {
                        prevEl = a;
                        a.classList.add("active");
                        fillForm(p);
                        activateForm(true);
                    }
                });

                // If no projects, show placeholder
                if (projects.length === 0) {
                    listEl.innerHTML = '<div class="list-group-item">No projects found for this course.</div>';
                    activateForm(true);
                    cleanForm();
                }
            })
            .catch(err => {
                console.error("Error loading projects:", err);
                showError("Failed to load projects. See console for details.");
            });
    }

    loadTeams();
    loadProjects();

    // ===========================
    // LIST CLICK (safe walk)
    // ===========================
    listEl.addEventListener("click", e => {
        let el = e.target;
        // walk up safely
        while (el && !el.classList.contains("list-group-item")) {
            el = el.parentNode;
        }
        if (!el || !el.dataset.projectId) return; // clicked outside an item

        removeActive();
        prevEl = el;
        el.classList.add("active");
        prevIsCreate = false;

        const id = Number(el.dataset.projectId);
        const project = projects.find(p => p.projectId === id);
        fillForm(project);
        activateForm(true);
        removeBtn();
    });

    // ===========================
    // CREATE
    // ===========================
    createFormBtn.addEventListener("click", () => {
        prevIsCreate = true;
        cleanForm();
        activateForm(false);
        removeBtn();
        createBtn("Create");
    });

    // ===========================
    // UPDATE
    // ===========================
    updateFormBtn.addEventListener("click", () => {
        if (!prevEl) return showError("Select a project");

        prevIsCreate = false;
        activateForm(false);
        removeBtn();
        createBtn("Update");

        const id = Number(prevEl.dataset.projectId);
        const project = projects.find(p => p.projectId === id);
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
            .then(r => r.text())
            .then(result => {
                if (result.includes("Success")) {
                    // remove from local list and re-render
                    loadProjects();
                } else showError(result);
            })
            .catch(err => {
                console.error("Delete error:", err);
                showError("Delete failed. See console.");
            });
    });

    // Sprints page navigation
    document.getElementById("sprintsPage").addEventListener("click", (event) => {
        event.preventDefault();

        if (prevEl != null) {
            // Store selected project in localStorage
            const project = {
                projectId: +prevEl.dataset.projectId,  // numeric project ID
                courseId: courseId,                    // courseId should be available from earlier code
                projectName: prevEl.querySelector('strong').innerText
            };

            localStorage.setItem("project", JSON.stringify(project));

            // Navigate to sprint page
            window.location.href = "sprintPage.html";
        } else {
            alert("You didn't choose any project.");
        }
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

        // CREATE
        if (prevIsCreate) {
            fetch(`http://localhost:8080/courses/${courseId}/projects/create`, { method: "POST", body: formData })
                .then(r => r.text())
                .then(result => {
                    if (result.includes("Success")) loadProjects();
                    else showError(result);
                })
                .catch(err => {
                    console.error("Create error:", err);
                    showError("Create failed. See console.");
                });
        }
        // UPDATE
        else {
            if (!prevEl) return showError("Select a project to update");
            const projectId = prevEl.dataset.projectId;
            formData.append("projectId", projectId);

            fetch(`http://localhost:8080/courses/${course.id}/projects/${projectId}/update`, {
                method: "PUT",
                headers: {
                    "Accept": "text/plain"
                },
                body: formData
            })
                .then(r => r.text())
                .then(result => {
                    if (result.includes("Success")) loadProjects();
                    else showError(result);
                })
                .catch(err => {
                    console.error("Update error:", err);
                    showError("Update failed. See console.");
                });
        }
    });
})();