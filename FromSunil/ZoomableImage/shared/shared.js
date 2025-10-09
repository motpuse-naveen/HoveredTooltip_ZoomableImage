const styleTypes = {
    'st-upper-alpha': ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    'st-lower-alpha': ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
    'st-upper-roman': ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"],
    'st-lower-roman': ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv", "xvi", "xvii", "xviii", "xix", "xx"],
    'st-decimal':["1" ,"2","3","4","5","6","7","8","9","10","11","12","13","14","15", "16","17","18","19","20","21","22","23","24","25","26", "27", "28", "29", "30"]
}

var CommonUtils = (function () {
  // Public API
  return {

    /**
     * Render an image with common styling and functionality.
     * @param {Object} headerImage - The image configuration object.
     * @returns {string} - HTML string for the image.
     */
    renderImage: function (headerImage) {
      if (!headerImage || Object.keys(headerImage).length === 0) {
        console.info("Invalid or empty headerImage provided.");
        return "";
      }

      const {
        src,
        alt = "",
        figCaption = "FIGURE",
        align = "left",
        widthPerc = "auto",
      } = headerImage;
      const effectiveWidthPerc = widthPerc === "" ? "auto" : widthPerc;

      return `
                <div class="fig-holder ${align + "_" + effectiveWidthPerc}">
                    <figure class="fig fig-${align} fig-${effectiveWidthPerc}">
                        <div class="image-zoom-holder">
                            <img class="zoomable-image vst-click" src="${src}" alt="${CommonUtils.escapeHTML(
        alt
      )}"/>
                            <img class="image-zoom-proxy" src="${src}" style="display: none;" aria-hidden="true"/>
                            <button class="image-zoom-button" title="Zoom In">
                                <span class="visually-hidden">zoom image</span>
                            </button>
                        </div>
                        <figcaption class="fig-caption">
                            <p><span class="style-fig-caption"><strong>${CommonUtils.escapeHTML(
                              figCaption
                            )}</strong></span></p>
                        </figcaption>
                    </figure>
                </div>
            `;
    },

    /**
     * Escape HTML to prevent XSS vulnerabilities.
     * @param {string} str - The string to escape.
     * @returns {string} - Escaped string.
     */
    escapeHTML: function (str) {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },

    /**
     * Validate if a string is valid HTML.
     * @param {string} html - The HTML string to validate.
     * @returns {boolean} - True if the string is valid HTML, false otherwise.
     */
    isValidHTML: function (html) {
      const doc = document.createElement("div");
      doc.innerHTML = html;
      return doc.innerHTML === html;
    },

    /**
     * Shuffle the array items and returns shuffled array.
     * @param {array} array - Array to shuffle it.
     * @returns {array} - returns the shuffled array.
     */
    shuffleArray: function (array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
      }
      return array;
    },
    add_ARIA_Div_to_DOM: function(){
        const divs = $(`
            <div id="ariaMessages" class="visually-hidden" aria-live="assertive"></div>
            <div id="ariaCorrect" class="visually-hidden"> Correct </div>
            <div id="ariaIncorrect" class="visually-hidden"> Incorrect </div>
            <div id="ariaAnswerExplanation" class="visually-hidden"> Answer Explanation </div>
            <div id="ariaExplanationFeedback" class="visually-hidden"> Explanation Feedback </div>
        `)
        /*
        const elm_question_group = $(".group-main:first");
        if(elm_question_group != undefined){
          elm_question_group.before(divs)
        }
        else{
          const elm_template_main = $(".template-main:first");
          if(elm_template_main != undefined){
            elm_template_main.before(divs)
          }
          else{
            $("body").append(divs);
          }
        }
        */
        
        if (!$("#ariaMessages").length) {
          var mainLandmark = $("main, [role='main']").first();
          if(!mainLandmark){
            mainLandmark = $("body")
          }        
          mainLandmark.append(divs);    
        }
        
    },
    clearTemplateAllLocalStorage: function() {
      const prefixes = ["mcms", "mcss", "tf", "saq", "sax", "cloze", "dropdown", "reflectiveWriting", "revealBtn", "checklist_state", "feedbackState"];
    
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
    
        // Check if the key starts with any of the prefixes
        if (prefixes.some(prefix => key.startsWith(prefix))) {
          localStorage.removeItem(key);
    
          // Since localStorage is modified, adjust the index
          i--;
        }
      }
    
      console.log(`All localStorage keys starting with ${prefixes.join(", ")} cleared.`);
    }
  };
})();

// Function to create and append the lightbox dynamically
function createLightbox(imgElem, $zoomButton) {
  const imageSrc = imgElem.attr("src"); // Get the image source from the thumbnail
  const altText = imgElem.attr("alt"); // Get the alt text

  // Get screen dimensions
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const originalWidth = imgElem[0].naturalWidth;
  const originalHeight = imgElem[0].naturalHeight;
  // Calculate aspect ratios
  const screenAspectRatio = screenWidth / screenHeight;
  const imageAspectRatio = originalWidth / originalHeight;

  var adjClass = "";

  if (imageAspectRatio > screenAspectRatio) {
    adjClass = "wdt100";
  } else {
    adjClass = "ht100";
  }

  const lightbox = $(`
        <div class="lightbox" role="dialog" aria-modal="true" aria-labelledby="lightbox-title">
            <img class="${adjClass}" src="${imageSrc}" alt="${CommonUtils.escapeHTML(
    altText
  )}"/>
            <button class="close-btn" aria-label="Close lightbox" title="Close">×</button>
        </div>
    `);

  // Add close functionality
  lightbox.find(".close-btn").on("click", function () {
    lightbox.fadeOut(() => {
      lightbox.remove();
      // Return focus to the zoom image button when the lightbox is closed
      $zoomButton.focus();
    });
  });

  // Focus Trap functionality
  const focusableElements = lightbox.find("button, img");
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];

  // Add ESC key functionality
  $(document).on("keydown", function (e) {
    if (e.key === "Escape" && lightbox.is(":visible")) {
      lightbox.find(".close-btn").click();
    }

    // Focus trap logic for Tab key
    if (e.key === "Tab") {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusableElement) {
          e.preventDefault();
          lastFocusableElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableElement) {
          e.preventDefault();
          firstFocusableElement.focus();
        }
      }
    }
  });

  // Append to the body and show the lightbox
  $("body").append(lightbox);
  lightbox.fadeIn();

  // Shift focus to the close button when lightbox opens
  lightbox.find(".close-btn").focus();
}

var ariaClearTimeout = null;
function ariaAnnounce(msg) {
  if (msg) {
    clearTimeout(ariaClearTimeout);
    $("#ariaMessages").html("");
    $("#ariaMessages").html(msg);
  }
  ariaClearTimeout = setTimeout(function () {
    $("#ariaMessages").html("");
  }, 5000);
}

$(document).on("keydown", function (event) {
  if (event.key === "Escape") {
    setTimeout(() => {
      if (document.activeElement.tagName === "SELECT") {
        $(document.activeElement).focus();
      }
    }, 0);
  }
});
