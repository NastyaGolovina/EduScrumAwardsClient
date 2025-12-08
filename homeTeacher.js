const studentsTopEl = document.getElementById("students_top");
const teamTopEl = document.getElementById("team_top");
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


function addEntity(El,name,pointValue,number) {

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
    if(number !== undefined && number !== null ) {
        const pEl = document.createElement("p");
        pEl.innerText = number;
        pEl.className = "m-0";
        pNameEl.appendChild(pEl);
    }
    strongPointsEl.innerText = pointValue;
    pPointsEl.appendChild(strongPointsEl);

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


    divEl.appendChild(svg);
    divEl.appendChild(pNameEl);
    divEl.appendChild(pPointsEl);
    El.appendChild(divEl);
    //
// <div className="d-flex text-body-secondary pt-3">
//     <svg aria-label="Placeholder: 32x32"
//          className="bd-placeholder-img flex-shrink-0 me-2 rounded"
//          width="32" height="32"
//          preserveAspectRatio="xMidYMid slice"
//          role="img"
//          xmlns="http://www.w3.org/2000/svg">
//         <title>Placeholder</title>
//         <rect width="100%" height="100%" fill="#6f42c1"></rect>
//         <text x="50%" y="50%" fill="#6f42c1" dy=".3em">32x32</text>
//     </svg>
//
//     <p className="pb-3 mb-0 small lh-sm border-bottom flex-grow-1">
//         <strong className="d-block text-gray-dark">@username</strong>
//         This user also gets some representative placeholder content.
//
//     </p>
//
//
//     <p className="pb-3 mb-0 small lh-sm border-bottom ms-auto">
//         <strong className="d-block text-gray-dark">10.4</strong>
//     </p>
// </div>
}


function setErrorMsg(errorMsg) {
    document.getElementById('errorMsg').style.display = 'block';
    document.getElementById('errorMsgText').innerText = errorMsg;
}

function fillTop(points,el) {
    for(let i = 0 ; i < points.length;i++) {
        addEntity(el, points[i].name, points[i].points, points[i].studentNumber)
    }
}


Promise.all([
    fetch("http://localhost:8080/dashboard/students/points").then(r => r.json()),
    fetch("http://localhost:8080/dashboard/teams/points").then(r => r.json()),
]).then(([students_points, teams_points]) => {
    //
    // console.log(students_points);
    // console.log(teams_points);

    fillTop(students_points,studentsTopEl);
    fillTop(teams_points,teamTopEl);





}).catch(error => {
    setErrorMsg(error);
});






