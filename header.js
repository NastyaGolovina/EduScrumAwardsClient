const header = localStorage.getItem("user");
let user = JSON.parse(header);
document.getElementById('userName').innerText =user.name;