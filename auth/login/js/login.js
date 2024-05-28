const body = document.querySelector("body");
const identifier = document.querySelector(".identifiant");
const password = document.querySelector(".password");
const textError = document.querySelector(".textError");
const overlay = document.querySelector("#overlay");
const modal = document.querySelector("#modal");
const exitModal = document.querySelector("#modal i");
const messageStatus = document.querySelector(".status");

async function handleLogin(event) {
  event.preventDefault();
  if (!identifier.value || !password.value) {
    return (textError.innerText = "Veuillez remplir tous les champs");
  }
  const user = {
    identifier: identifier.value,
    password: password.value,
  };
  const req = {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(user),
  };
  const apiCall = await fetch("http://localhost:3000/user/login", req);
  const response = await apiCall;
  const ressources = await apiCall.json();
  if (response.status === 201) {
    window.localStorage.setItem("token", ressources.jwt);
    window.localStorage.setItem("image", ressources.image);
    if (ressources.role === "user") {
      window.location.href = "../../user/user.html";
    } else if (ressources.role === "admin") {
      window.location.href = "../../admin/admin.html";
    }
  } else if (response.status === 401) {
      textError.innerHTML = `Identifiants invalides!<br>Vérifier si votre compte est bien activé!`;
  } else {
    textError.innerText = "Erreur Serveur";
  }
}
function removeModal() {
  overlay.classList.remove("overlay");
  modal.classList.remove("modal");
  modal.classList.add("opacity-0");
  body.classList.remove("overflow-hidden");
  modal.classList.add("hidden");
}
function resetPassword() {
  overlay.classList.add("overlay");
  modal.classList.add("modal");
  modal.classList.remove("hidden");
    modal.classList.remove("opacity-0");
  body.classList.add("overflow-hidden");
}
overlay.addEventListener("click", () => {
  removeModal();
})
exitModal.addEventListener("click", () => {
  removeModal();
})
async function emailResetPassword() {
  const identifiant = document.querySelector(".identifiantModal").value;
  removeModal();
  messageStatus.classList.remove("opacity-0");
  const req = {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ identifier: identifiant })
  }
  const sendEmail = await fetch("http://localhost:3000/user/resetPassword", req);
  const response = await sendEmail.json();
  
  if (sendEmail.status === 500) {
    messageStatus.innerText = "Erreur Serveur"
  } else if (response.error === "Please send an identifier") {
    messageStatus.innerText = "Identifiant Invalide";
  } else {
    messageStatus.innerText = "Email envoyé !"
  }
  setTimeout(() => {
    messageStatus.classList.add("opacity-0");
  }, 3000);
}