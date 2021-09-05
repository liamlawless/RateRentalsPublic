let emailInput2 = document.getElementById("email");
let emailDiv = document.getElementById("emailDiv");
let emailBtn = document.getElementById("emailBtn");
let body = document.getElementById("forgotPass")
let infoDiv = document.getElementById("desc");
let emailErrorDiv;
let codeInput;
let codeDiv;
let loaderDiv = document.createElement("span");
loaderDiv.className = "loader";
loaderDiv.style.display = "none";
emailBtn.onclick = function () {
    if(emailErrorDiv){
        emailErrorDiv.remove();
    }
    emailBtn.style.display = "none";
    loaderDiv.style.display = "block";
    emailDiv.appendChild(loaderDiv);
    let email = emailInput2.value;
    fetch('/users/forgotPass/email', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: email
        })
    }).then(res => {
        if (res.ok) {
            res.json().then(function (response) {
                if (response == "error") {
                    loaderDiv.style.display = "none";
                    emailBtn.style.display = "block";
                    if (!emailErrorDiv) {
                        emailErrorDiv = document.createElement("div");
                        emailErrorDiv.innerHTML = "Email is not associated with an account.";
                        emailErrorDiv.style.color = 'red';
                        emailDiv.appendChild(emailErrorDiv);
                    }
                }
                else {
                    loaderDiv.style.display = "none";
                    emailDiv.remove();
                    emailBtn.style.display = "block";
                    infoDiv.innerHTML = "Enter emailed code";
                    codeInput = document.createElement("input");
                    codeInput.type = "text";
                    codeInput.maxLength = 5;
                    codeDiv = document.createElement("div");
                    
                    infoDiv.appendChild(codeDiv);
                    codeDiv.appendChild(codeInput);
                    body.appendChild(emailBtn);
                    emailBtn.onclick = codeFunc;
                }
            });
        }
    }).catch(function (error) {
        console.log('Fetch Error:', error);
    });
}



let codeFunc = function() {
    let code = codeInput.value;
    fetch('/users/forgotPass/verify', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code:code
        })
    }).then(res => {
        if (res.ok) {
            res.json().then(function (response) {
                if (response == "error") {
                    if (!emailErrorDiv) {
                        emailErrorDiv = document.createElement("div");
                        emailErrorDiv.innerHTML = "Incorrect code";
                        emailErrorDiv.style.color = 'red';
                        codeDiv.appendChild(emailErrorDiv);
                        codeInput.value = "";
                    }
                }
                else {
                    window.location.href = "/users/password"
                }
            });
        }
    }).catch(function (error) {
        console.log('Fetch Error:', error);
    });
}

document.addEventListener('keydown', (event) => {
    const keyName = event.key;
  
    if (keyName === 'Enter') {
        emailBtn.click();
    }

}, false);