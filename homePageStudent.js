const awardsEl = document.getElementById("table-body");
const coursesEl = document.getElementById("courses");

const nameEl = document.getElementById("name");
const numberEl = document.getElementById("number");
const semesterEl = document.getElementById("semester");
const scoreEl = document.getElementById("score");


const projectProgressEl = document.getElementById("project_progress");
// const colors = ["#e83e8c", "#6f42c1", "#007bff"];
const colors = [
    "#e83e8c",
    "#6f42c1",
    "#007bff",
    "#20c997",
    "#fd7e14",
    "#ffc107",
    "#17a2b8",
    "#dc3545"
];

const lsObj = localStorage.getItem("user");
let student = JSON.parse(lsObj);
// let studentId =  student.id;
let studentId =  1;



function createSVG() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-label", "Placeholder: 32x32");
    svg.setAttribute("class", "bd-placeholder-img flex-shrink-0 me-2 rounded");
    svg.setAttribute("width", "32");
    svg.setAttribute("height", "32");
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("role", "img");

// <title>
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = "Placeholder";
    svg.appendChild(title);

    const color =  colors[Math.floor(Math.random() * colors.length)];
// <rect>
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "100%");
    rect.setAttribute("height", "100%");
    rect.setAttribute("fill",color);
    svg.appendChild(rect);

// <text>
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", "50%");
    text.setAttribute("y", "50%");
    text.setAttribute("fill",color);
    text.setAttribute("dy", ".3em");
    text.textContent = "32x32";
    svg.appendChild(text);

    return svg;

}



function createProgressBar(precent) {
    const divEl = document.createElement("div");
    divEl.className = "progress mt-3";
    divEl.role="progressbar";
    divEl.ariaLabel="Basic example";
    divEl.ariaValuenow="0";
    divEl.ariaValuemin="0";
    const progressBar = document.createElement("div");
    progressBar.className="progress-bar";
    progressBar.style.background =`${colors[Math.floor(Math.random() * colors.length)]}`;
    progressBar.style.width = `${precent}%`;

    divEl.appendChild(progressBar);

    return divEl;

}
function setErrorMsg(errorMsg) {
    document.getElementById('errorMsg').style.display = 'block';
    document.getElementById('errorMsgText').innerText = errorMsg;
}

function addProjectProgress(name, precent) {
    const divEl = document.createElement("div");
    const divNameEl = document.createElement("div");
    const strongEl = document.createElement("strong");

    strongEl.className = "d-block text-gray-dark"
    divNameEl.className = "pb-3 mb-0 small lh-sm border-bottom flex-grow-1";
    divEl.className = "d-flex text-body-secondary pt-3"

    strongEl.innerText = name;
    divNameEl.appendChild(strongEl);
    divNameEl.appendChild(createProgressBar(precent));
    divEl.appendChild(createSVG());
    divEl.appendChild(divNameEl);
    projectProgressEl.appendChild(divEl);

}



function addEntity(El, name, average, myGrade) {

    const divEl = document.createElement("div");
    const pNameEl = document.createElement("p");
    const strongEl = document.createElement("strong");
    const pPointsEl = document.createElement("p");
    const strongPointsEl = document.createElement("strong");

    pPointsEl.className = "pb-3 mb-0 small lh-sm border-bottom ms-auto"
    strongPointsEl.strongPointsEl = "d-block text-gray-dark"
    strongEl.className = "d-block text-gray-dark"
    pNameEl.className = "pb-3 mb-0 small lh-sm border-bottom flex-grow-1";
    divEl.className = "d-flex text-body-secondary pt-3"

    strongEl.innerText = name;
    pNameEl.appendChild(strongEl);

    const pEl = document.createElement("p");
    pEl.innerText = `Average: ${average}`;
    pEl.className = "m-0";
    pNameEl.appendChild(pEl);

    strongPointsEl.innerText = myGrade;
    pPointsEl.appendChild(strongPointsEl);

    divEl.appendChild(createSVG());
    divEl.appendChild(pNameEl);
    divEl.appendChild(pPointsEl);
    El.appendChild(divEl);

}

function createAwardEntity(id,date,award,points,project) {
    const trEl = document.createElement("tr");
    const idEl = document.createElement("td");
    const dateEl = document.createElement("td");
    const awardEl = document.createElement("td");
    const pointsEl = document.createElement("td");
    const projectEl = document.createElement("td");
    idEl.innerText = id;
    dateEl.innerText = date;
    awardEl.innerText = award;
    projectEl.innerText = points;
    pointsEl.innerText = project;

    trEl.appendChild(idEl);
    trEl.appendChild(dateEl);
    trEl.appendChild(awardEl);
    trEl.appendChild(projectEl);
    trEl.appendChild(pointsEl);
    awardsEl.appendChild(trEl);

}

function fillProgress(projects_progress) {
    for(let i = 0 ; i < projects_progress.length;i++) {
        addProjectProgress(projects_progress[i].projectName,projects_progress[i].progress);
    }
}


function fillStudentInfo(name, number, sem, score) {
    nameEl.innerText = name;
    numberEl.innerText = number;
    semesterEl.innerText = sem;
    scoreEl.innerText = score;
}

Promise.all([
    fetch(`http://localhost:8080/dashboard/students-awards/${studentId}`).then(r => r.json()),
    fetch(`http://localhost:8080/dashboard/course_average/${studentId}`).then(r => r.json()),
    fetch(`http://localhost:8080/dashboard/projects/progress/${studentId}`).then(r => r.json()),
    fetch(`http://localhost:8080/students/${studentId}`).then(r => r.json()),
]).then(([students_awards, course_average,projects_progress,student]) => {

    console.log(students_awards);
    console.log(course_average);
    console.log(projects_progress);
    console.log(student);

    for(let i =0; i < students_awards.length; i++) {
        createAwardEntity(students_awards[i].studentAwardId,
            students_awards[i].date.slice(0, 16).replace("T", " "),
            students_awards[i].awardName,
            students_awards[i].points,
            students_awards[i].projectName);
    }

    for(let a =0; a < course_average.length; a++) {
        addEntity(coursesEl, course_average[a].courseName,
            course_average[a].courseAverage,
            course_average[a].studentPointValue);
    }

    fillProgress(projects_progress);
    fillStudentInfo(student.name, student.studentNumber, student.currentSemester, student.totalScore);

}).catch(error => {
    setErrorMsg(error);
});
