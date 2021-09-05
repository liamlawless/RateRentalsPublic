
let usernameInput = document.getElementById("username");
let passwordInput = document.getElementById("password");
let passwordDiv = document.getElementById("passwordDiv");
let passwordDiv2 = document.getElementById("passwordDiv2")
let submitBtn = document.getElementById("submit");
let emailInput = document.getElementById("emailInput");
let userInput2 = document.getElementById("userInput");
let passwordInput2 = document.getElementById("passInput");
let firstnameInput = document.getElementById("firstnameInput");
let lastnameInput = document.getElementById("lastnameInput");
let errorDiv;
let errorDiv2;
let forgotDiv;
let popup = document.getElementById("popupLogin");
let loginBtn = document.getElementById("loginBtn");
let profileLogin = false;
let regSubmit = document.getElementById("registerSubmit");
if (submitBtn) {
    submitBtn.onclick = function () {
        let username = usernameInput.value;
        let password = passwordInput.value;

        fetch('/users/login', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password
            })
        }).then(res => {
            if (res.ok) {
                res.json().then(function (response) {
                    if (response == "error") {
                        if (!errorDiv) {
                            errorDiv = document.createElement("div");
                            errorDiv.innerHTML = "Username and password did not match.";
                            errorDiv.style.color = 'red';
                            passwordDiv.appendChild(errorDiv);
                            forgotDiv = document.createElement("a");
                            forgotDiv.innerHTML = "Forgot Password";
                            forgotDiv.href = "/users/forgotPass"
                            forgotDiv.className = "address";
                            forgotDiv.style = "float:none; font-size:1em";
                            passwordDiv.appendChild(forgotDiv);
                        }
                    }
                    else {
                        closePopup();
                        if (profileLogin) {
                            profileLogin = false;
                            window.location.href = "/users/profile";
                        }
                        else {
                            window.location.reload(false);
                        }
                    }
                });
            }
        }).catch(function (error) {
            console.log('Fetch Error:', error);
        });
    }
}


function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

if (regSubmit) {
    regSubmit.onclick = function () {
        let username = userInput2.value.toLowerCase();
        let password = passwordInput2.value;
        let email = emailInput.value.toLowerCase();
        let firstname = toTitleCase(firstnameInput.value);
        let lastname = toTitleCase(lastnameInput.value);
        if (!validateEmail(email)) {
            return;
        }
        if (passwordInput2.value.length < 5) {
            return;
        }

        fetch('/users/register', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password,
                email: email,
                firstname: firstname,
                lastname: lastname
            })
        }).then(res => {
            if (res.ok) {
                res.json().then(function (response) {
                    if (response == "error") {
                        if (!errorDiv2) {
                            errorDiv2 = document.createElement("div");
                            errorDiv2.innerHTML = "Username or email is already taken";
                            errorDiv2.style.color = 'red';
                            passwordDiv2.appendChild(errorDiv2);
                        }
                    }
                    else {
                        closePopup();
                        if (profileLogin) {
                            profileLogin = false;
                            window.location.href = "/users/profile";
                        }
                        else {
                            window.location.reload(false);
                        }
                    }
                });
            }
        }).catch(function (error) {
            console.log('Fetch Error:', error);
            window.location.reload(false);
        });
    }
}

function openPopup() {
    popup.classList.remove('anipop');
    popup.classList.remove('anipopBack');
    popup.style.display = "block";
    void popup.offsetWidth;
    popup.classList.add("anipop");
}

function closePopup() {
    popup.style.display = "none";
}

function closePopupAnimation() {
    popup.classList.remove('anipop');
    popup.classList.remove('anipopBack');
    void popup.offsetWidth;
    popup.classList.add('anipopBack');
}

function openPopupProf() {
    profileLogin = true;
    popup.classList.remove('anipop');
    popup.classList.remove('anipopBack');
    popup.style.display = "block";
    void popup.offsetWidth;
    popup.classList.add('anipop');
}

let enterLogin;
usernameInput.onclick = function () {
    actionLogin();
}
usernameInput.onkeypress = function () {
    actionLogin();
}

passwordInput.onclick = function () {
    actionLogin();
}
passwordInput.onkeypress = function () {
    actionLogin();
}

let actionLogin = function () {
    enterLogin = true;
}

firstnameInput.onclick = function () {
    actionSignup();
}
firstnameInput.onkeypress = function () {
    actionSignup();
}
lastnameInput.onclick = function () {
    actionSignup();
}
lastnameInput.onkeypress = function () {
    actionSignup();
}
emailInput.onclick = function () {
    actionSignup();
}
emailInput.onkeypress = function () {
    actionSignup();
}
userInput2.onclick = function () {
    actionSignup();
}
userInput2.onkeypress = function () {
    actionSignup();
}
passwordInput2.onclick = function () {
    actionSignup();
}
passwordInput2.onkeypress = function () {
    actionSignup();
}

let actionSignup = function () {
    enterLogin = false;
}
document.addEventListener('keydown', (event) => {
    const keyName = event.key;

    if (keyName === 'Enter' && popup.style.display == "block") {
        if (enterLogin || (usernameInput.value && !(emailInput.value && passwordInput2.value && userInput2.value))) {
            submitBtn.click();
        }
    }

}, false);

let navLinks = document.getElementsByClassName("link");
let dropNav = document.getElementById("dropNav");
dropNav.onclick = function () {
    if (navLinks[1].style.display == "block") {
        for (let i = 0; i < navLinks.length; i++) {
            navLinks[i].style.display = "none";
        }
    }
    else {
        for (let i = 0; i < navLinks.length; i++) {
            navLinks[i].style.display = "block";
        }
    }

}

let check = false;
window.onresize = function () {
    let width = window.innerWidth;
    if (width < 400) {
        if (check == false) {
            for (let i = 0; i < navLinks.length; i++) {
                navLinks[i].style.display = "none";
            }
        }
        check = true;
    }
    if (check && width > 400) {
        for (let i = 0; i < navLinks.length; i++) {
            navLinks[i].style.display = "block";
        }
        check = false;
    }
}


let logout = function() {
    sweetAlert(
        {
            title: "Logging out",
            text: "Are you sure?",
            icon: "warning",
            buttons: true,
            dangerMode: true
        }
    ).then((confirm) => {
        if (confirm) {
            window.location.href = "/logout"
        }
        else {
            return false;
        }
    });
}