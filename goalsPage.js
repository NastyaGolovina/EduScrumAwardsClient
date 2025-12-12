(() => {
    const goalListEl = document.getElementById("goal_list");
    const descriptionEl = document.getElementById("description");
    const scoreEl = document.getElementById("score");
    const completedEl = document.getElementById("completed");

    const createBtnEl = document.getElementById("create");
    const updateBtnEl = document.getElementById("update");
    const deleteBtnEl = document.getElementById("delete");
    const formEl = document.getElementsByTagName("form")[0];

    if (!goalListEl || !descriptionEl || !scoreEl || !formEl) {
        console.error("Missing DOM elements.");
        return;
    }

    let prevEl = null;
    let prevIsCreate = false;
    let goals = [];

    const sprint = JSON.parse(localStorage.getItem("sprint") || "null");
    if (!sprint?.sprintId || !sprint?.projectId || !sprint?.courseId) {
        alert("No sprint selected. Please select a sprint first.");
        window.location.href = "sprintPage.html";
        return;
    }
    const sprintId = sprint.sprintId;
    const projectId = sprint.projectId;
    const courseId = sprint.courseId;

    function activateForm(isDisabled) {
        descriptionEl.disabled = isDisabled;
        scoreEl.disabled = isDisabled;
        completedEl.disabled = isDisabled;
    }

    function cleanForm() {
        descriptionEl.value = "";
        scoreEl.value = "";
        completedEl.checked = false;
    }

    function fillForm(goal) {
        if (!goal) return;
        descriptionEl.value = goal.description || "";
        scoreEl.value = goal.score || "";
        completedEl.checked = goal.completed || false;
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
    // LOAD GOALS
    // ===========================
    function loadGoals() {
        fetch(`http://localhost:8080/courses/${courseId}/projects/${projectId}/sprints/${sprintId}/goals`)
            .then(r => r.json())
            .then(result => {
                goals = result || [];
                goalListEl.innerHTML = "";

                goals.forEach((g, i) => {
                    const a = document.createElement("a");
                    a.className = "list-group-item list-group-item-action py-3 lh-sm";
                    a.dataset.goalId = g.goalId;
                    a.innerHTML = `<div><strong>${g.description}</strong> - Score: ${g.score} ${g.completed ? "(Completed)" : ""}</div>`;
                    goalListEl.appendChild(a);

                    if (i === 0) {
                        prevEl = a;
                        a.classList.add("active");
                        fillForm(g);
                        activateForm(true);
                    }
                });

                if (goals.length === 0) {
                    goalListEl.innerHTML = '<div class="list-group-item">No goals found.</div>';
                    activateForm(true);
                    cleanForm();
                }
            })
            .catch(err => {
                console.error("Error loading goals:", err);
                showError("Failed to load goals.");
            });
    }

    loadGoals();

    // ===========================
    // LIST CLICK
    // ===========================
    goalListEl.addEventListener("click", e => {
        let el = e.target;
        while (el && !el.classList.contains("list-group-item")) el = el.parentNode;
        if (!el || !el.dataset.goalId) return;

        removeActive();
        prevEl = el;
        el.classList.add("active");
        prevIsCreate = false;

        const goalId = Number(el.dataset.goalId);
        const goal = goals.find(g => g.goalId === goalId);
        fillForm(goal);
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
        if (!prevEl) return showError("Select a goal");
        prevIsCreate = false;
        activateForm(false);
        removeBtn();
        createSubmitBtn("Update");
    });

    deleteBtnEl.addEventListener("click", () => {
        if (!prevEl) return showError("Select a goal");
        if (!confirm("Delete this goal?")) return;

        const goalId = prevEl.dataset.goalId;
        fetch(`http://localhost:8080/courses/${courseId}/projects/${projectId}/sprints/${sprintId}/goals/${goalId}/delete`, {
            method: "DELETE"
        })
            .then(r => r.text())
            .then(result => {
                if (result.includes("Success")) loadGoals();
                else showError(result);
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

        const description = descriptionEl.value.trim();
        const score = Number(scoreEl.value);
        const completed = completedEl.checked;

        if (!description || !score) return showError("Description and Score are required");

        const formData = new URLSearchParams();
        formData.append("description", description);
        formData.append("score", score);
        formData.append("completed", completed);

        if (prevIsCreate) {
            // CREATE
            fetch(`http://localhost:8080/courses/${courseId}/projects/${projectId}/sprints/${sprintId}/goals/create`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData
            })
                .then(r => r.text())
                .then(result => {
                    if (result.includes("Success")) loadGoals();
                    else showError(result);
                })
                .catch(err => {
                    console.error("Create error:", err);
                    showError("Create failed.");
                });
        } else {
            // UPDATE
            const goalId = prevEl.dataset.goalId;
            fetch(`http://localhost:8080/courses/${courseId}/projects/${projectId}/sprints/${sprintId}/goals/${goalId}/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData
            })
                .then(r => r.text())
                .then(result => {
                    if (result.includes("Success")) loadGoals();
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

})();
