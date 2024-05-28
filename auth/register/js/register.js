const firstName = document.querySelector(".firstName");
const firstNameTextError = document.querySelector(".textErrorFirstName");
const lastName = document.querySelector(".lastName");
const lastNameTextError = document.querySelector(".textErrorLastName");
const username = document.querySelector(".username");
const usernameTextError = document.querySelector(".textErrorUserName");
const email = document.querySelector(".email");
const emailTextError = document.querySelector(".textErrorEmail");
const image = document.querySelector(".image");
const imageTextError = document.querySelector(".textErrorImage");
const password = document.querySelector(".password");
const passwordTextError = document.querySelector(".textErrorPassword");
const confirmPassword = document.querySelector(".confirmPassword");
const confirmPasswordTextError = document.querySelector(
  ".textErrorConfirmPassword"
);
const checkbox = document.querySelector(".checkbox");
const checkboxTextError = document.querySelector(".textErrorCheckbox");
const textError = document.querySelector(".textError");
const patternName = /^(?!\s)[a-zA-Zéèê\s-]+$/;
const patternUserName = /^[a-zA-Z0-9]{3,20}$/;
const patternMail = /^[^\s]+@[a-z]+\.[a-z]{2,4}$/;
const patternPass = /^[A-Z{1}a-z{1}0-9{1}#?!@$%^&*-{1}]{8,}$/;

let isError = false;
username.addEventListener("input", async () => {
  verifInput(patternUserName, username, usernameTextError, "username", isError);
  const verifUsername = await fetch(`http://localhost:3000/user/verifUsername/${username.value}`);
  const response = await verifUsername.json();
  if (verifUsername.status === 200) {
    usernameTextError.innerText = ""
  } else if (verifUsername.status === 409) {
    usernameTextError.innerText = "Username déja utiliser"
  }
})
function isSamePassword() {
  if (confirmPassword.value != password.value) {
    confirmPasswordTextError.innerText =
      "Vos mot de passe n'est pas identique!";
    isError = true;
  } else {
    confirmPasswordTextError.innerText = "";
  }
}
confirmPassword.addEventListener("input", isSamePassword);
password.addEventListener("input", () => {
  isSamePassword(),
    verifInput(
      patternPass,
      password,
      passwordTextError,
      "mot de passe",
      isError
    );
});

function verifInput(pattern, input, textError, text, isError) {
  if (!pattern.test(input.value)) {
    textError.innerText = `Ce n'est pas un ${text} valide`;
    isError = true;
  } else {
    textError.innerText = "";
  }
}
checkbox.addEventListener("input", () => {
  if (checkbox.checked === false) {
    checkboxTextError.innerText =
      "Veuillez accepter les termes et conditions !";
    isError = true;
  } else {
    checkboxTextError.innerText = "";
  }
})

function verifForm() {
  isError = false;
  verifInput(patternName, firstName, firstNameTextError, "prénom", isError);
  verifInput(patternName, lastName, lastNameTextError, "nom", isError);
  verifInput(patternMail, email, emailTextError, "mail", isError);
  verifInput(patternPass, password, passwordTextError, "mot de passe", isError);
  verifInput(patternUserName, username, usernameTextError, "username", isError);
  isSamePassword();
  if (checkbox.checked === false) {
    checkboxTextError.innerText =
      "Veuillez accepter les termes et conditions !";
    isError = true;
  } else {
    checkboxTextError.innerText = "";
  }
  if (!image.files[0]) {
    imageTextError.innerText = "Veuillez choisir une image de profil";
    isError = true;
  }
  else {
    imageTextError.innerText = "";
  }
}

async function handleRegister(event) {
  event.preventDefault();
  verifForm();

  if (isError === false) {
    const formdata = new FormData()
    formdata.append("image", image.files[0]);
    formdata.append("firstName", firstName.value);
    formdata.append("lastName", lastName.value);
    formdata.append("userName", username.value);
    formdata.append("email", email.value);
    formdata.append("password", password.value);
    const req = {
      method: "POST",
      body: formdata,
    };
    const apiCall = await fetch("http://localhost:3000/user/register", req);
    const res = await apiCall;
    const error = await apiCall.json();
    console.log(error.error === "Username already use");
    if (res.status === 201) {
      window.location.href = "../login/login.html";
    } else if (error.error === "Username already use") {
      usernameTextError.innerText = "Username déja utiliser"
    } else if (error.error === "invalid credentials") {
      textError.innerText = "Informations Invalide!";
    } else {
      textError.innerText = "Erreur Serveur"
    }
  }
}
