// Lightbox CSS as string
const lightboxCSS = `
.img_lightbox {
  display: none;
  position: fixed;
  z-index: 1000;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.8);
  justify-content: center;
  align-items: center;
}
.img_lightbox .figwrapper {
    max-width: 90%;
    text-align: center;
    padding: 10px;
    padding-top: 45px;
    background: #FFFFFF;
    box-shadow: 0 0 10px #000;
    border-radius: 8px;
    position: relative;
    height: 86%;
}
.img_lightbox .figwrapper figure {
  overflow: auto;
  height: 94%;
  width: 96%;
  margin: 0;
  padding: 10px 20px;
}
.img_lightbox .figwrapper figure img {
  max-width: 100%;
  max-height: 80vh;
}
.img_lightbox .figwrapper figure figcaption {
  margin-top: 20px;
  font-size: 14px;
  line-height: 1.4;
  text-align: left;
}
.img_lightbox .figwrapper .close {
    position: absolute;
    top: 5px;
    right: 10px;
    font-size: 16px;
    font-weight: bold;
    background: #007398;
    cursor: pointer;
    padding: 7px 15px;
    border-radius: 15px;
    z-index: 100;
    border: 2px solid #FFF;
    color: #FFF;
}
`;

// Function to inject CSS only once
function injectLightboxCSS() {
  if (!document.getElementById("lightbox-style")) {
    const style = document.createElement("style");
    style.id = "lightbox-style"; // unique id so we don’t inject twice
    style.textContent = lightboxCSS;
    document.head.appendChild(style);
  }
}

function openLightbox(ref) {
    injectLightboxCSS(); // ensure CSS is added once
  
    const data = lightbox_image_Data[ref];
    if (!data) return;
  
    // Remove old lightbox if exists
    const existing = document.querySelector(".lightbox");
    if (existing) existing.remove();
  
    // Create new lightbox
    const lightbox = document.createElement("div");
    lightbox.className = "img_lightbox";
    lightbox.innerHTML = `<div class="figwrapper">    
        <button class="close" aria-label="Close Image Lightbox">Close</button>
        <figure>          
          <img src="${data.imgPath}" alt="${ref}"/>
          <figcaption>${data.imgCaption}</figcaption>
        </figure>
      </div>  
    `;
    document.body.appendChild(lightbox);
    lightbox.style.display = "flex";
  
    // Close actions
    const close = lightbox.querySelector(".close");
    close.focus();
    close.addEventListener("click", () => lightbox.remove());
    lightbox.addEventListener("click", (ev) => {
      if (ev.target === lightbox) lightbox.remove();
    });
    document.addEventListener("keydown", function escHandler(ev) {
      if (ev.key === "Escape") {
        lightbox.remove();
        document.removeEventListener("keydown", escHandler);
      }
    });
  }
  