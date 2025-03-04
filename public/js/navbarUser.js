document.addEventListener("DOMContentLoaded", () => {
  // User Profile Picture Logic
  fetch("/profile")
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      const userProfilePicture = document.getElementsByClassName(
        "userProfilePicture-frontend"
      );
      [...userProfilePicture].forEach((img) => {
        img.src = data.url;
      });
      // username
      const userMenuUsername = document.getElementById("userMenu-username");
      userMenuUsername.innerText = data.username;
      // user email
      const userMenuEmail = document.getElementById("userMenu-email");
      userMenuEmail.innerText = data.email;
    })
    .catch((error) => {
      console.error("User Profile Fetching Error", error);
    });

  // user menu
  document
    .getElementsByClassName("profile-pic")[0]
    .addEventListener("click", function () {
      let userMenu = document.getElementsByClassName("userMenuBox")[0];
      userMenu.style.display =
        userMenu.style.display == "none" ? "inline" : "none";
    });
  document
    .getElementById("withTaxToggleSwitch")
    .addEventListener("change", function () {
      let allTaxText = document.querySelectorAll(".gst-text");

      allTaxText.forEach((text) => {
        text.style.display = this.checked ? "inline" : "none";
      });
    });
});
