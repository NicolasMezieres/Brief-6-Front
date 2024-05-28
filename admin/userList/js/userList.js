const body = document.querySelector("body");
const searchUser = document.querySelector("#searchUser");
const messageStatus = document.querySelector(".status");
const items = document.querySelector(".items");
const token = window.localStorage.getItem("token");
const userPicture = document.querySelector(".userPicture")
const profil = window.localStorage.getItem("image");
userPicture.src = profil

const patternNumber = /^[0-9]$/
function statusMessage(message) {
    messageStatus.classList.remove("opacity-0");
    messageStatus.innerText = message;
    setTimeout(() => {
        messageStatus.classList.add("opacity-0");
    }, 2000);
}
function verifNumber(id) {
    const inputActive = document.querySelector(`.isActive${id}`);
    if (inputActive.value <= 0 || !patternNumber.test(inputActive.value)) {
        inputActive.value = 0
    } else if (inputActive.value >= 1) {
        inputActive.value = 1
    }
}
function returnToTop() {
    setTimeout(() => {
        window.scroll({
         top: 0,
         behavior: "smooth"
     }) 
     }, 50);
}
function disconnected(response) {
    if (response.status === 401) {
        window.localStorage.removeItem("token");
        window.location.href = "../../auth/login/login.html"
    }
}
async function getUserByUsername() {
    let page = 1;
    getUserUsername(page);
}
async function getUserUsername(page) {
    returnToTop();
    
    const req = {
        method: "GET",
        headers: {
            authorization: `Bearer ${token}`
        },
    }
    const apiCall = await fetch(`http://localhost:3000/user/getAllUser/${page}`, req)
    const res = await apiCall.json();
    console.log(res);
    disconnected(apiCall);
    if (apiCall.status === 404) {
        statusMessage("Aucun utilisateur trouvé")
        return;
    } else if (apiCall.status === 500) {
        statusMessage("Erreur Serveur");
        return;
    }
    afficheUser(res,page);
    buttonPage(res)  
}
function afficheUser(res, page) {
    items.innerHTML = `
    <table class='tableUser w-3/4 border border-black'>
        <tr>
            <th>id</th>
            <th>firstName</th>
            <th>lastName</th>
            <th>userName</th>
            <th>email</th>
            <th>isActive</th>
            <th>reason Ban</th>
            <th>Validation</th>
        </tr >
    </table > `
    const tableUser = document.querySelector(".tableUser");
    res.user.forEach(element => {
        tableUser.innerHTML += `<tr>
        <th>${element.id}</th>
        <th>${element.firstName}</th>
        <th>${element.lastName}</th>
        <th>${element.userName}</th>
        <th>${element.email}</th>
        <th><input min='0' onchange="verifNumber('${element.id}')" type="number" value="${element.isActive}" class="isActive${element.id} text-center max-w-12"></th>
        <th><input value='${element.reasonBan}' type='text' class='reasonBan${element.id} border border-black text-center'></th>
        <th><button 
        onclick="updateUser(${element.id})"
        class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
        <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
        Validation
        </span>
        </button></th>
    </tr >`
    });
    items.innerHTML += `<div class="flex justify-center items-center m-4">
    <p
      class="before relative flex justify-center items-center bg-gray-300 p-5 rounded-3xl mr-2"
    >
      <i class="absolute arrow fa-solid fa-arrow-left duration-300"></i>
      <i
        class="absolute arrowHover fa-solid fa-arrow-left fa-beat hidden opacity-0 duration-300"
      ></i>
    </p>
    <p class="numberPage text-xl font-bold pb-0.5">${page}</p>
    <p
      class="next relative flex justify-center items-center bg-gray-300 p-5 rounded-3xl ml-2"
    >
      <i class="absolute arrow fa-solid fa-arrow-right duration-300"></i>
      <i
        class="absolute arrowHover fa-solid fa-arrow-right fa-beat hidden opacity-0 duration-300"
      ></i>
    </p>
  </div>`
}
function buttonPage(res) {
    const before = document.querySelector(".items .before");
  const next = document.querySelector(".items .next");
  const numberPage = document.querySelector(".items .numberPage");
    if (numberPage.innerText <= 1) {
        before.classList.add("hidden");
    } else {
        before.classList.remove("hidden");
    }
    if (parseInt(numberPage.innerText) >= res.totalPages) {
        next.classList.add("hidden");
    } else {
        next.classList.remove("hidden");
    }
    before.addEventListener("click", () => {
        numberPage.innerText = parseInt(numberPage.innerText) - 1;
        getUserUsername(numberPage.innerText);
    })
      next.addEventListener("click", () => {
          numberPage.innerText = parseInt(numberPage.innerText) + 1;
          getUserUsername(numberPage.innerText);
    })
}
async function updateUser(id) {
    const isActive = document.querySelector(`.isActive${id}`);
    const reasonBan = document.querySelector(`.reasonBan${id}`);
    if (reasonBan.value === null) {
        reasonBan.value = "";
    }
    console.log(reasonBan.value === null);
    const req = {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({id:id,isActive: isActive.value,reasonBan:reasonBan.value}),
        
    }
    console.log(req);
    const update = await fetch("http://localhost:3000/user/updatePassword", req);
    disconnected(update);
    console.log(update);
    const res = await update.json();
    console.log(res);
    if (update.status === 200) {
        statusMessage("Mis à jour avec succès");
    } else if (update.status === 500) {
        statusMessage("Erreur Serveur");
    } else {
        statusMessage("Erreur")
    }
}
getUserByUsername();