const body = document.querySelector("body");
const userPicture = document.querySelector(".userPicture");
const picture = window.localStorage.getItem("image");
const searchUser = document.querySelector("#searchUser");
const messageStatus = document.querySelector(".status");
const items = document.querySelector(".items");
const token = window.localStorage.getItem("token");
const modal = document.querySelector(".modalPost");
const overlay = document.querySelector("#overlay");
const textError = document.querySelector(".textError");
const title = document.querySelector(".titlePost");
const image = document.querySelector(".imagePost");
const text = document.querySelector(".textPost");
const buttonAddPost = document.querySelector(".addPost");
const patternUserName = /^[a-zA-Z0-9]{3,20}$/;

let pageNumber = 1;
userPicture.src = picture
function removeModal() {
    overlay.classList.remove("overlay");
    modal.classList.remove("modalPost");
    modal.classList.add("opacity-0");
    body.classList.remove("overflow-hidden");
    modal.classList.add("hidden");
}
function afficheModalPost() {
    overlay.classList.add("overlay");
  modal.classList.add("modalPost");
  modal.classList.remove("hidden");
    modal.classList.remove("opacity-0");
  body.classList.add("overflow-hidden");
}
function disconnected(response) {
    if (response.status === 401) {
        window.localStorage.removeItem("token");
        window.location.href = "../auth/login/login.html"
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
function statusMessage(message) {
    messageStatus.classList.remove("opacity-0");
    messageStatus.innerText = message;
    setTimeout(() => {
        messageStatus.classList.add("opacity-0");
    }, 2000);
}
async function follow(id) {
    const button = document.querySelector(`.button${id}`);
    const number = document.querySelector(`.follow${id}`)
    const req = {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            authorization: `Bearer ${token}`
        },
        body: JSON.stringify({follow:id})
    }
    const followCall = await fetch("http://localhost:3000/user/follow", req)
    const res = await followCall.json();
    disconnected(res);
    if (followCall.status === 200) {
        button.innerText = "Ne plus suivre"
        button.onclick = function () { unfollow(id) };
        number.innerText = parseInt(number.innerText) + 1;
    } else if (followCall.status === 500) {
        statusMessage("Erreur Serveur");
    } else {
        statusMessage("Erreur");
    }
}
async function unfollow(id) {
    const button = document.querySelector(`.button${id}`);
    const number = document.querySelector(`.follow${id}`)
    const req = {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            authorization: `Bearer ${token}`
        },
        body: JSON.stringify({unfollow:id})
    }
    const unfollowCall = await fetch("http://localhost:3000/user/unfollow", req)
    const res = await unfollowCall.json();
    disconnected(unfollowCall);
    if (unfollowCall.status === 200) {
        button.innerText = "Suivre"
        button.onclick = function () { follow(id) };
        number.innerText = parseInt(number.innerText) -1;
    } else if (unfollowCall.status === 500) {
        statusMessage("Erreur Serveur");
    } else {
        statusMessage("Erreur");
    }
}
function afficheUser(res,page) {
    let isFollow;
    let text;
    let impossible;
    items.innerHTML = ""
    res.user.forEach(user => {
        impossible = "";
        if (user.isFollow === false) {
            isFollow = "follow";
            text = "Suivre"
        } else if(user.isFollow === true){
            isFollow = "unfollow";
            text = "Ne plus suivre"
        } else {
            text = ""
            impossible = "hidden"
        }
        items.innerHTML += `<div
        class="item${user.id} flex flex-col items-center justify-center w-11/12 bg-gray-200 py-4 my-4 rounded-3xl lg:w-4/12"
      >
        <img
          class="relative inline h-16 w-16 my-4 max-w-none object-cover object-top rounded-full"
          src="${user.picture}"
          alt="photo de profil de l'utilisateur"
        />
        <h2 class="font-bold text-lg text-center">${user.username}</h2>
        <p>Suivie par : <span class="follow${user.id}">${user.numberFollow}</span> personne(s)</p>
        <button
          onclick="${isFollow}(${user.id})"
          class="button${user.id} ${impossible} text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-4 mb-2"
        >
          ${text}
        </button>
      </div>`
    });
    afficheButtonPage(page);
}
function afficheButtonPage(page) {
    items.innerHTML += `<div class="flex justify-center items-center mb-4">
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
async function getUserByUsername() {
    let page = 1;
    event.preventDefault();
    if (!patternUserName.test(searchUser.value)) {
        statusMessage("Username Invalide");
        return
    }
    buttonAddPost.classList.add("opacity-0");
    getUserUsername(page);
}
async function getUserUsername(page) {
    returnToTop();
    
    const req = {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            authorization: `Bearer ${token}`
        },
    }
    const apiCall = await fetch(`http://localhost:3000/user/getUserByUserName/${searchUser.value}&${page}`, req)
    const res = await apiCall.json();
    disconnected(apiCall);
    if (apiCall.status === 404) {
        statusMessage("Aucun utilisateur trouvé")
        return;
    } else if (apiCall.status === 500) {
        statusMessage("Erreur Serveur");
        return;
    }
    afficheUser(res, page);
    buttonPage(res) 
}
async function myFollows() {
    let page = 1;
    buttonAddPost.classList.add("opacity-0");
    getMyFollows(page);
}
async function getMyFollows(page) {
    returnToTop();
    const req = {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            authorization: `Bearer ${token}`
        },
    }
    const apiCall = await fetch(`http://localhost:3000/user/getUserByFollow/${page}`, req)
    const res = await apiCall.json();
    disconnected(apiCall);
    if (apiCall.status === 404) {
        statusMessage("Aucun utilisateur trouvé")
        return;
    } else if (apiCall.status === 500) {
        statusMessage("Erreur Serveur");
        return;
    }
    afficheUser(res, page); 
    buttonPage(res) 
}
async function addPost () {
    if (!image.files[0] && !text.value) {
        console.log(text.value);
        statusMessage("Inserer du texte ou une image!");
    }
    let req
    if (!image.files[0]) {
        const post = {
            title: title.value,
            text: text.value,
        }
         req = {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(post),
        }
            
    } else {
        const formData = new FormData();
        formData.append("title", title.value);
        formData.append("image", image.files[0]);
        formData.append("text", text.value);
         req = {
            method: "POST",
            headers: {
                authorization: `Bearer ${token}`,
            },
            body: formData,
        }
    }
    const creatPost = await fetch("http://localhost:3000/post/post",req);
    disconnected(creatPost);
    if (creatPost.status === 201) {
        statusMessage("Post créer avec succès");
        removeModal();
    } else if (creatPost.status === 500) {
        statusMessage("Erreur Serveur");
    } else {
        statusMessage("Erreur");
    }
}
function affichePost(response) {
    const arrayPosts = [];
        items.innerHTML = "";
        response.post.forEach((element) => {
            element.date = new Date(element.date).toLocaleDateString();
            console.log(element);
            items.innerHTML += `<div
        class="item flex w-11/12 bg-gray-200 py-4 my-4 rounded-3xl lg:w-8/12"
      >
        <div class="w-full flex flex-col rounded-xl px-8">
          <div class="border border-b-gray-400">
            <img
              class="relative bottom-3 inline h-12 w-12 max-w-none object-cover object-top rounded-full"
              src="${element.profil}"
              alt="photo de profil de ${element.username}"
            />
            <p class="username inline-block font-bold">
              ${element.username}<br /><span class="date">${element.date}</span>
            </p>
          </div>
          <div class="px-1 border border-b-gray-400">
            <p class="title font-bold text-lg text-center pt-4">
              ${element.title}
            </p>
            <div class="flex justify-center">
              <img
                class="picture${element._id} pt-4 max-w-10/12 max-h-96"
                src="${element.picture}"
              />
            </div>
            <p class="text pt-4 text-center mb-4">
              ${element.text}
            </p>
          </div>
          <div class="interact flex pt-4">
            <div class="comment border border-r-gray-400 px-4">
              <p class="inline-block">${element.comment.length}</p>
              <i class="fa-regular fa-message cursor-pointer"></i>
            </div>
            <div class="like border border-r-gray-400 px-4">
              <p class="textLike${element._id} inline-block">${element.like.length}</p>
              <i onclick="like('${element._id}')"
              class="like${element._id} fa-regular fa-thumbs-up cursor-pointer"></i>
            </div>
            <div class="dislike border border-r-gray-400 px-4">
              <p class="textDislike${element._id} inline-block">${element.dislike.length}</p>
              <i onclick="dislike('${element._id}')" class="dislike${element._id} fa-regular fa-thumbs-down cursor-pointer pt-1.5"></i>
            </div>
            <div
              class="response underline px-4 cursor-pointer hover:text-red-500"
            >
              répondre
            </div>
          </div>
        </div>
      </div>`
      const likeButton = document.querySelector(`.like${element._id}`);
      const dislikeButton = document.querySelector(`.dislike${element._id}`)
            if (!element.picture) {
                const picture = document.querySelector(`.picture${element._id}`).remove();
            }
            if (element.isLiked === true) {
                likeButton.setAttribute("onclick", `unlike('${element._id}')`);
    likeButton.classList.remove("fa-regular");
    likeButton.classList.add("fa-solid");
    dislikeButton.setAttribute("onclick", `dislike('${element._id}')`);
    dislikeButton.classList.add("fa-regular");
    dislikeButton.classList.remove("fa-solid");
            }
            if (element.isDisliked === true) {
                likeButton.setAttribute("onclick", `like('${element._id}')`);
    dislikeButton.setAttribute("onclick", `undislike('${element._id}')`);
    dislikeButton.classList.remove("fa-regular");
    dislikeButton.classList.add("fa-solid");
    likeButton.classList.add("fa-regular");
    likeButton.classList.remove("fa-solid");
            }
        })
    
}
async function getPost() {
    buttonAddPost.classList.remove("opacity-0");
    const req = {
        method: "GET",
        headers: {
            authorization: `Bearer ${token}`,
        },
    }
    const allPost = await fetch("http://localhost:3000/post/post", req);
    const posts = await allPost.json();
    disconnected(allPost);
    if (allPost.status === 404) {
        items.innerHTML = "<p class='font-bold text-red-800 text-7xl'>Aucun contenu à afficher</p>"
    } else if (allPost.status === 500) { 
        items.innerHTML = "<p class='font-bold text-red-800 text-7xl'>Erreur Serveur</p>"
    }else{
        affichePost(posts);
    }
}
getPost();

async function getMyPost() {
    const req = {
        method: "GET",
        headers: {
            authorization: `Bearer ${token}`,
        },
    }
    const myPost = await fetch("http://localhost:3000/post/myPost", req);
    const myPosts = await myPost.json();
    disconnected(myPost);
    if (myPost.status === 404) {
            items.innerHTML = "<p class='font-bold text-red-800 text-7xl'>Aucun contenu à afficher</p>"
    } else if (myPost.status === 500) {
        items.innerHTML = "<p class='font-bold text-red-800 text-7xl'>Erreur Serveur</p>"
    } else {
        affichePost(myPosts);
    }
}
async function like(id) {
    const likeButton = document.querySelector(`.like${id}`);
    const dislikeButton = document.querySelector(`.dislike${id}`)
    const textLike = document.querySelector(`.textLike${id}`)
    const textDislike = document.querySelector(`.textDislike${id}`)
    const data = {
        id_post: id
    }
    const req = {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    }
    const like = await fetch("http://localhost:3000/post/like", req);
    disconnected(like)
    if (like.status === 200) {
        if (dislikeButton.classList.contains("fa-solid")) {
            console.log("ici");
            textDislike.innerText = parseInt(textDislike.innerText) - 1;
        }
        textLike.innerText = parseInt(textLike.innerText) + 1;
        likeButton.setAttribute("onclick", `unlike('${id}')`);
        likeButton.classList.remove("fa-regular");
        likeButton.classList.add("fa-solid");
        dislikeButton.setAttribute("onclick", `dislike('${id}')`);
        dislikeButton.classList.add("fa-regular");
        dislikeButton.classList.remove("fa-solid");
    }
}

async function dislike(id) {
    const likeButton = document.querySelector(`.like${id}`);
    const dislikeButton = document.querySelector(`.dislike${id}`)
    const textLike = document.querySelector(`.textLike${id}`)
    const textDislike = document.querySelector(`.textDislike${id}`)
    const data = {
        id_post: id
    }
    const req = {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    }
    const like = await fetch("http://localhost:3000/post/dislike", req);
    disconnected(like) 
    if (likeButton.classList.contains("fa-solid")) {
        textLike.innerText = parseInt(textLike.innerText) - 1;
    }
    textDislike.innerText = parseInt(textDislike.innerText) + 1;
    likeButton.setAttribute("onclick", `like('${id}')`);
    dislikeButton.setAttribute("onclick", `undislike('${id}')`);
    dislikeButton.classList.remove("fa-regular");
    dislikeButton.classList.add("fa-solid");
    likeButton.classList.add("fa-regular");
    likeButton.classList.remove("fa-solid");
}
