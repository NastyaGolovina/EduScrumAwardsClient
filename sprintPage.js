(() => {
    // ===========================
    // ELEMENTS
    // ===========================
    const sprintListEl = document.getElementById("sprint_list");
    const startDateEl = document.getElementById("startDate");
    const endDateEl = document.getElementById("endDate");
    const createBtnEl = document.getElementById("create");
    const updateBtnEl = document.getElementById("update");
    const deleteBtnEl = document.getElementById("delete");
    const goalsBtnEl = document.getElementById("goalsPage");
    const formEl = document.getElementsByTagName("form")[0];

    if (!sprintListEl || !startDateEl || !endDateEl || !formEl) {
        console.error("Missing DOM elements.");
        return;
    }

    // ===========================
    // STATE
    // ===========================
    let prevEl = null;
    let prevIsCreate = false;
    let sprints = [];

    const project = JSON.parse(localStorage.getItem("project") || "null");
    if (!project?.projectId || !project?.courseId) {
        alert("No project selected. Please select a project first.");
        window.location.href = "projectPage.html";
        return;
    }
    const projectId = project.projectId;
    const courseId = project.courseId;

    // ===========================
    // HELPERS
    // ===========================
    function activateForm(isDisabled) {
        startDateEl.disabled = isDisabled;
        endDateEl.disabled = isDisabled;
    }

    function cleanForm() {
        startDateEl.value = "";
        endDateEl.value = "";
    }

    function fillForm(sprint) {
        if (!sprint) return;
        startDateEl.value = sprint.startDate?.split('T')[0] ?? "";
        endDateEl.value = sprint.endDate?.split('T')[0] ?? "";
    }

    function removeActive() {
        if (prevEl) prevEl.classList.remove("active");
    }

    function removeBtn() {
        const btn = document.getElementById("btn-submit");
        if (btn) btn.remove();
    }

    function createSubmitBtn(text) {
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
    // LOAD SPRINTS
    // ===========================
    function loadSprints() {
        fetch(`http://localhost:8080/courses/${courseId}/projects/${projectId}/sprints`)
            .then(r => r.json())
            .then(result => {
                sprints = result || [];
                sprintListEl.innerHTML = "";

                sprints.forEach((s, i) => {
                    const a = document.createElement("a");
                    a.className = "list-group-item list-group-item-action py-3 lh-sm";
                    a.dataset.sprintId = s.sprintId;
                    a.innerHTML = `<div><strong>${s.startDate?.split('T')[0]} → ${s.endDate?.split('T')[0]}</strong></div>`;
                    sprintListEl.appendChild(a);

                    if (i === 0) {
                        prevEl = a;
                        a.classList.add("active");
                        fillForm(s);
                        activateForm(true);
                    }
                });

                if (sprints.length === 0) {
                    sprintListEl.innerHTML = '<div class="list-group-item">No sprints found.</div>';
                    activateForm(true);
                    cleanForm();
                }
            })
            .catch(err => {
                console.error("Error loading sprints:", err);
                showError("Failed to load sprints.");
            });
    }

    loadSprints();

    // ===========================
    // LIST CLICK
    // ===========================
    sprintListEl.addEventListener("click", e => {
        let el = e.target;
        while (el && !el.classList.contains("list-group-item")) el = el.parentNode;
        if (!el || !el.dataset.sprintId) return;

        removeActive();
        prevEl = el;
        el.classList.add("active");
        prevIsCreate = false;

        const sprintId = Number(el.dataset.sprintId);
        const sprint = sprints.find(s => s.sprintId === sprintId);
        fillForm(sprint);
        activateForm(true);
        removeBtn();
    });

    // ===========================
    // CREATE / UPDATE / DELETE BUTTONS
    // ===========================
    createBtnEl.addEventListener("click", () => {
        prevIsCreate = true;
        cleanForm();
        activateForm(false);
        removeBtn();
        createSubmitBtn("Create");
    });

    updateBtnEl.addEventListener("click", () => {
        if (!prevEl) return showError("Select a sprint");
        prevIsCreate = false;
        activateForm(false);
        removeBtn();
        createSubmitBtn("Update");
    });

    deleteBtnEl.addEventListener("click", () => {
        if (!prevEl) return showError("Select a sprint");
        if (!confirm("Delete this sprint?")) return;

        const sprintId = prevEl.dataset.sprintId;
        fetch(`http://localhost:8080/courses/${courseId}/projects/${projectId}/sprints/${sprintId}/delete`, {
            method: "DELETE"
        })
            .then(r => {
                if (!r.ok) throw new Error(`Delete failed: ${r.status}`);
                return r.text();
            })
            .then(result => {
                // Clear the previous selection
                prevEl = null;
                prevIsCreate = false;

                // Reload sprint list
                loadSprints();
            })
            .catch(err => {
                console.error("Delete error:", err);
                showError("Delete failed.");
            });
    });

    // ===========================
    // SUBMIT CREATE / UPDATE
    // ===========================
    document.addEventListener("click", e => {
        if (e.target.id !== "btn-submit") return;

        const startDate = startDateEl.value;
        const endDate = endDateEl.value;
        if (!startDate || !endDate) return showError("Start and End dates required");

        const formData = new URLSearchParams();
        formData.append("startDate", startDate);
        formData.append("endDate", endDate);

        if (prevIsCreate) {
            // CREATE
            fetch(`http://localhost:8080/courses/${courseId}/projects/${projectId}/sprints/create`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData
            })
                .then(r => r.text())
                .then(result => {
                    if (result.includes("Success")) loadSprints();
                    else showError(result);
                })
                .catch(err => {
                    console.error("Create error:", err);
                    showError("Create failed.");
                });
        } else {
            // UPDATE
            const sprintId = prevEl.dataset.sprintId;
            fetch(`http://localhost:8080/courses/${courseId}/projects/${projectId}/sprints/${sprintId}/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData
            })
                .then(r => r.text())
                .then(result => {
                    if (result.includes("Success")) loadSprints();
                    else showError(result);
                })
                .catch(err => {
                    console.error("Update error:", err);
                    showError("Update failed.");
                });
        }

        removeBtn();
        activateForm(true);
    });

    // ===========================
    // GOALS BUTTON
    // ===========================
    goalsBtnEl.addEventListener("click", () => {
        if (!prevEl) return showError("Select a sprint first");
        const sprintId = prevEl.dataset.sprintId;
        localStorage.setItem("sprint", JSON.stringify({ sprintId, projectId, courseId }));
        window.location.href = "sprintGoalsPage.html";
    });
})();
