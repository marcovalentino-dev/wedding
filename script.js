const openButton = document.getElementById("openInvitation");
const landing = document.getElementById("landing");
const mainSite = document.getElementById("mainSite");

if (openButton && landing && mainSite) {
  openButton.addEventListener("click", () => {
    openButton.classList.add("open");

    setTimeout(() => {
      landing.classList.add("landing--hide");
      mainSite.classList.add("site--show");
      mainSite.setAttribute("aria-hidden", "false");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 900);
  });
}
