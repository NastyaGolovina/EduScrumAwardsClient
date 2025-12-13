const loginEl = document.getElementById("login");
const passwordEl = document.getElementById("password");
const submitEl = document.getElementById("submit");
const errorMassage = document.getElementById('errorDiv');



function removeErrorMassage() {
    while (errorMassage.firstChild) {
        errorMassage.removeChild(errorMassage.firstChild);
    }
    loginEl.classList.remove('is-invalid');
    passwordEl.classList.remove('is-invalid');
}

function setInvalid(errorText) {
    const pEl = document.createElement('p');
    pEl.innerText = errorText;
    errorMassage.appendChild(pEl);
    loginEl.classList.add('is-invalid');
    passwordEl.classList.add('is-invalid');
}


submitEl.addEventListener('click', event => {
    event.preventDefault();
    removeErrorMassage();
    const login = loginEl.value.trim();
    const password = passwordEl.value.trim();
    if(login !== "" && password !== "") {

        const formData = new FormData();
        formData.append("login", login);
        formData.append("password", password);
        fetch("http://localhost:8080/users/login", {
            method: "POST",
            body: formData
        })
            .then(response => {
                // const data = await response.json();
                if (response.status === 401) {
                    setInvalid("Incorrect login or password");
                    return null;
                }

                if (!response.ok) {
                    throw new Error("Server error");
                }

                return response.json();
            })
            .then(current_user => {
                console.log("Logged-in user:", current_user);
                const user = {
                    id: current_user.user.userId,
                    name: current_user.user.name,
                    role: current_user.user.role
                };
                localStorage.setItem("user", JSON.stringify(user));
                if(current_user.user.role === "TEACHER") {
                    window.location.replace("homePageTeacher.html");
                } else if(current_user.user.role === "STUDENT") {
                    window.location.replace("homePageStudent.html");
                }
            })
            .catch(error => {
                console.error(error.message);
            });
    } else {
        setInvalid("Empty")
    }
});