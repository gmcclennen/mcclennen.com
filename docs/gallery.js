// Simple lightbox for the photo gallery. Progressive enhancement: without
// JS, clicking a thumbnail just opens the full image directly (the <a> href).
(function () {
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var closeBtn = lightbox ? lightbox.querySelector(".lightbox-close") : null;

  if (!lightbox || !lightboxImg) return;

  function openLightbox(href, alt) {
    lightboxImg.src = href;
    lightboxImg.alt = alt || "";
    lightbox.hidden = false;
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = "";
  }

  document.querySelectorAll(".gallery-item").forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      var img = item.querySelector("img");
      openLightbox(item.getAttribute("href"), img ? img.alt : "");
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
  });
})();
