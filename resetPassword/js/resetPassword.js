const key = window.location.search
const password = document.querySelector(".password");
const passwordTextError = document.querySelector(".passwordTextError");
const confirmPassword = document.querySelector(".confirmPassword");
const confirmPasswordTextError = document.querySelector(".confirmPasswordTextError");
const messageStatus = document.querySelector(".status");
const patternPass = /^[A-Z{1}a-z{1}0-9{1}#?!@$%^&*-{1}]{8,}$/;

let isError = false;

function isSamePassword() {
    if (password.value !== confirmPassword.value) {
        isError = true;
        return confirmPasswordTextError.innerText = "Vos mots de passe ne sont pas identique"
     }
     confirmPasswordTextError.innerText = ""
}
function patternPassword() {
    if (!patternPass.test(password.value)) {
        isError = true;
        return passwordTextError.innerText = "Mot de passe invalide"
    }
    passwordTextError.innerText = ""
}
function statusMessage(message) {
    messageStatus.classList.remove("opacity-0");
    messageStatus.innerText = message;
    setTimeout(() => {
        messageStatus.classList.add("opacity-0");
    }, 2000);
}
password.addEventListener("input", () => {
    isSamePassword();
    patternPassword();
})
confirmPassword.addEventListener("input", () => {
    isSamePassword();
})
async function resetPassword() {
    isError = false;
    isSamePassword();
    patternPassword();
    console.log(isError);
    if (isError === true) {
        return
    }
    const token = key.replace("?token=", "")
    const req = {
        method: "PATCH",
        headers: {
            "Content-Type":"application/json; charset=utf-8",
            authorization: `Bearer ${token}`
        },
        body: JSON.stringify({password: password.value })
    }
    console.log(req);
    const resetPass = await fetch("http://localhost:3000/user/updatePassword", req);
    const response = await resetPass.json();
    console.log(response);
    if (resetPass.status === 200) {
        statusMessage("Mot de passe changer avec succès")
        setTimeout(() => {
            window.location.href = "../auth/login/login.html"
        }, 2500);
    } else if(resetPass.status === 500) {
        statusMessage("Erreur Serveur")
    } else {
        statusMessage("Erreur");   
    }
}
