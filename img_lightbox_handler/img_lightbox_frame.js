
  // In the iframe
document.addEventListener("click", function (e) {
    // Check if the clicked element or its parent is a lightboxcallout link
    let target = e.target;
    while (target && target !== document) {
      if (target.classList && target.classList.contains("lightboxcallout")) {
        e.preventDefault(); // only prevent default for these links
        const ref = target.getAttribute("img-ref");
        if (window.parent && typeof window.parent.openLightbox === "function") {
          window.parent.openLightbox(ref);
        }
        break; // stop traversing up
      }
      target = target.parentNode;
    }
  });
  