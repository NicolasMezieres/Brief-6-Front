const text = document.querySelector("span");

const timer = setInterval(() => {
  if (text.innerText > 0) {
    text.innerText -= 1;
  } else {
    clearInterval(timer);
    window.location.href = "../auth/login/login.html";
  }
}, 1000);
