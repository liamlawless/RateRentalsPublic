let pass = document.getElementById("passwordx");
window.onload = () =>{
    setTimeout(function(){
        let passDel = document.getElementById("passwordDel");
        passDel.remove();
    }, 1000);
    
}
let veri = document.getElementById("verify");
let update = document.getElementById("update");
let short = document.getElementById("short");
let mismatch = document.getElementById("mismatch");
let showpass = document.getElementById("showpass");
let showverfiy = document.getElementById("showverify");
update.onclick = function(){
    short.style.display = "none";
    mismatch.style.display = "none";
    let password = pass.value;
    let verify = veri.value;
    if(password.length < 5){
        short.style.display = "block";
        if(password != verify){
            mismatch.style.display = "block";
        }
        return;
    }
    if(password != verify){
        mismatch.style.display = "block";
        return;
    }
    fetch('/users/password/change', {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            newpass:password
        })
    }).then(res => {
        if (res.ok) return res.json();
    })
    .then(response => {
        if (response == 'Samepass') {
            alert('Same pass')
        }
        if(response == "Good"){
            window.location.href = '/users/profile';
        }
    })
    .catch(error => console.error(error));
}

showpass.onclick = function(){
    if(pass.type == "password"){
        pass.type = "text";
        showpass.src = "/images/eyeOpen.png"
        showpass.style.height = "10px";
        showpass.style.width = "13px";
    }
    else{
        pass.type = "password";
        showpass.src = "/images/eye.png"
        showpass.style.height = "13px";
        showpass.style.width = "15px";
    }
}

showverify.onclick = function(){
    if(veri.type == "password"){
        veri.type = "text";
        showverify.src = "/images/eyeOpen.png"
        showverify.style.height = "10px";
        showverify.style.width = "13px";
    }
    else{
        veri.type = "password";
        showverify.src = "/images/eye.png"
        showverify.style.height = "13px";
        showverify.style.width = "15px";
    }
}