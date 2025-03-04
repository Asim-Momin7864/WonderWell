// flash in-out animation logic
setTimeout(() => {
  let alert = document.getElementById("myAlert");
  if (alert) {
    alert.classList.remove("show");
    alert.classList.add("fade");
    setTimeout(() => alert.remove(), 500); // Ensures complete removal
  }
}, 3000);
