// Builds the photo gallery from photos.json, then wires up a simple
// lightbox. To add or remove photos, edit docs/images/ and run
// scripts/sync_gallery.py (see that file for details) -- no HTML editing
// required.
(function () {
  var gallery = document.getElementById("gallery");
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var closeBtn = lightbox ? lightbox.querySelector(".lightbox-close") : null;

  if (!gallery) return;

  function openLightbox(href, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = href;
    lightboxImg.alt = alt || "";
    lightbox.hidden = false;
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImg) return;
    lightbox.hidden = true;
    lightboxImg.src = "";
  }

  function renderGallery(photos) {
    gallery.innerHTML = "";

    if (!photos || photos.length === 0) {
      var empty = document.createElement("p");
      empty.className = "gallery-loading";
      empty.textContent = "No photos yet.";
      gallery.appendChild(empty);
      return;
    }

    photos.forEach(function (photo) {
      var href = "images/" + photo.file;
      var alt = photo.alt || "Bob and Karen McClennen family photo";

      var link = document.createElement("a");
      link.className = "gallery-item";
      link.href = href;

      var img = document.createElement("img");
      img.src = href;
      img.alt = alt;
      img.loading = "lazy";

      link.appendChild(img);
      link.addEventListener("click", function (e) {
        e.preventDefault();
        openLightbox(href, alt);
      });

      gallery.appendChild(link);
    });
  }

  fetch("photos.json")
    .then(function (res) {
      if (!res.ok) throw new Error("failed to load photos.json");
      return res.json();
    })
    .then(renderGallery)
    .catch(function () {
      gallery.innerHTML = "";
      var error = document.createElement("p");
      error.className = "gallery-loading";
      error.textContent = "Photos could not be loaded.";
      gallery.appendChild(error);
    });

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);

  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (lightbox && e.key === "Escape" && !lightbox.hidden) closeLightbox();
  });
})();
