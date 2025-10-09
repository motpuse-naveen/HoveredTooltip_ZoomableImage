
class ZoomableFigure {
  constructor(options = {}) {
    this.minZoom = options.minZoom || 0.25;
    this.maxZoom = options.maxZoom || 5;
    this.zoomStep = options.zoomStep || 0.25;
    this.initialZoom = options.initialZoom || 1;

    this.currentZoom = this.initialZoom;
    this.isPanning = false;
    this.startX = 0;
    this.startY = 0;
    this.translateX = 0;
    this.translateY = 0;

    this.panStep = 20; // pixels to move per button click
  }

  init() {
    $('figure img').each((index, img) => {
      const $img = $(img);
      const $figure = $img.closest('figure');
      const figureId = $figure.attr('id') || `figure_${Math.floor(Math.random() * 1000000)}`;
      $figure.attr('id',figureId)

      // Wrap img if not already wrapped
      if (!$img.parent().hasClass('img-wrapper')) {
        $img.wrap('<div class="img-wrapper"></div>');
      }
      $figure.addClass('zoomable-figure');
      const $wrapper = $img.parent();

      // Add zoom button if not present
      if ($wrapper.find('.figure-zoom-btn').length === 0) {
        const $btn = $('<button class="zoom-btn figure-zoom-btn" aria-label="Open image in zoomable modal" title="Open image in zoomable modal"></button>');
        $wrapper.append($btn);
        $btn.on('click', () => this.openModal($img));
      }
    });
  }

  openModal($img) {
    let $modal = $('#zoomableFigureModal');
    if ($modal.length === 0) {
      $modal = $(`
        <div class="figure-modal" id="zoomableFigureModal" tabindex="0" role="dialog" aria-modal="true" aria-label="Zoomable image viewer">
          <button class="zoom-btn close-modal" aria-label="Close" title="Exit zoom view"></button>
          <div class="modal-content">            
            <div class="image-container" style="overflow:hidden;">
              <img class="zoomable-image" style="transform: scale(1) translate(0px,0px); cursor: grab;" />
            </div>                     
          </div>
          <div class="pan-controls" role="group" aria-label="Image pan controls">
            <button class="zoom-btn panleft" aria-label="Pan image left" title="Pan Left"></button>
            <button class="zoom-btn panright" aria-label="Pan image right" title="Pan Right"></button>
            <button class="zoom-btn pantop" aria-label="Pan image up" title="Pan Up"></button>
            <button class="zoom-btn panbottom" aria-label="Pan image down" title="Pan Down"></button>
          </div>
          <div class="zoom-controls" role="group" aria-label="Image zoom controls">
              <div id="pan-status" class="visually-hidden" aria-live="polite"></div>
              <div class="zoom-info" aria-live="polite">Zoom: <span class="zoom-level">100%</span></div>
              <button class="zoom-btn zoom-in-btn" aria-label="Zoom in" title="Zoom In (+)"></button>
              <button class="zoom-btn zoom-out-btn" aria-label="Zoom out" title="Zoom Out (-)"></button>
              <button class="zoom-btn zoom-reset-btn" disabled="true"  aria-label="Reset Zoom" title="Reset Zoom"></button>
          </div>   
        </div>
      `);
      $('body').append($modal);
      this.attachModalEvents($modal);

      // Drag to pan functionality
      this.attachPanEvents($modal);
    }
  
    // Update image dynamically
    const $figure = $img.closest('figure');
    const figureId = $figure.attr('id')
    $modal.attr("modalfor", figureId)

    const $modalImg = $modal.find('.zoomable-image');
    $modalImg.attr('src', $img.attr('src')).attr('alt', $img.attr('alt'));
  
    $modal.css('display', 'flex').attr('tabindex', 0).focus();
    $('body').css('overflow', 'hidden');
    this.resetZoom($modal);
  }
  
  // Update zoom button states
  updateZoomButtons($modal) {
    const $zoomIn = $modal.find('.zoom-in-btn');
    const $zoomOut = $modal.find('.zoom-out-btn');
    const $zoomreset = $modal.find('.zoom-reset-btn');
    
    $zoomIn.prop('disabled', this.currentZoom >= this.maxZoom);
    $zoomOut.prop('disabled', this.currentZoom <= this.minZoom);
    $zoomreset.prop('disabled', this.currentZoom == this.initialZoom);
  }

  closeModal($modal) {
    $modal.hide();
    $modal.attr('aria-hidden', 'true');
    
    // Restore body scrolling
    $('body').css('overflow', '');
    
    // Return focus to trigger
    var targetFigure = $modal.attr("modalfor")
    targetFigure.find(".figure-zoom-btn").focus();
    $('body').css('overflow', '');
  }

  resetZoom($modal) {
    this.currentZoom = this.initialZoom;
    this.translateX = 0;
    this.translateY = 0;
    const $img = $modal.find('.zoomable-image');
    $img.css('transform', `scale(${this.currentZoom}) translate(0px,0px)`);
    $modal.find('.zoom-level').text(`${Math.round(this.currentZoom*100)}%`);
    this.updateZoomButtons($modal);
  }

  zoomIn($modal) {
    if (this.currentZoom < this.maxZoom) {
      this.currentZoom = Math.min(this.currentZoom + this.zoomStep, this.maxZoom);
      this.updateTransform($modal);
      this.updateZoomButtons($modal);
    }
  }

  zoomOut($modal) {
    if (this.currentZoom > this.minZoom) {
      this.currentZoom = Math.max(this.currentZoom - this.zoomStep, this.minZoom);
      this.updateTransform($modal);
      this.updateZoomButtons($modal);
    }
  }

  updateTransform($modal) {
    const $img = $modal.find('.zoomable-image');
    $img.css('transform', `scale(${this.currentZoom}) translate(${this.translateX}px,${this.translateY}px)`);
    $modal.find('.zoom-level').text(`${Math.round(this.currentZoom*100)}%`);
  }

  attachModalEvents($modal) {
    const $img = $modal.find('.zoomable-image');
    const $zoomIn = $modal.find('.zoom-in-btn');
    const $zoomOut = $modal.find('.zoom-out-btn');
    const $zoomreset = $modal.find('.zoom-reset-btn');
    const $close = $modal.find('.close-modal');

    $close.on('click', () => this.closeModal($modal));
    $zoomIn.on('click', () => this.zoomIn($modal));
    $zoomOut.on('click', () => this.zoomOut($modal));
    $zoomreset.on('click', () => this.resetZoom($modal));

    const $panLeft = $modal.find('.panleft');
    const $panRight = $modal.find('.panright');
    const $panUp = $modal.find('.pantop');
    const $panDown = $modal.find('.panbottom');

    $panLeft.on('click', () => this.panLeft($modal));
    $panRight.on('click', () => this.panRight($modal));
    $panUp.on('click', () => this.panUp($modal));
    $panDown.on('click', () => this.panDown($modal));

    // Drag/pan
    $img.on('mousedown', (e) => {
      if (this.currentZoom <= 1) return;
      this.isPanning = true;
      this.startX = e.clientX - this.translateX;
      this.startY = e.clientY - this.translateY;
      $img.css('cursor', 'grabbing');
    });

    $(document).on('mousemove', (e) => {
      if (!this.isPanning) return;
      this.translateX = e.clientX - this.startX;
      this.translateY = e.clientY - this.startY;
      this.updateTransform($modal);
    });

    $(document).on('mouseup', () => {
      this.isPanning = false;
      $img.css('cursor', 'grab');
    });

    // Close modal on background click
    $modal.on('click', (e) => {
      if (e.target === $modal[0]) this.closeModal($modal);
    });

    $modal.on('keydown', (e) => {
      switch(e.key) {
        case 'Escape': this.closeModal($modal); break;
        case '+': this.zoomIn($modal); break;
        case '-': this.zoomOut($modal); break;
        case 'ArrowLeft': this.panLeft($modal); break;
        case 'ArrowRight': this.panRight($modal); break;
        case 'ArrowUp': this.panUp($modal); break;
        case 'ArrowDown': this.panDown($modal); break;
      }

      if (e.key === 'Tab') {
        const focusable = $modal.find('button, [tabindex]:not([tabindex="-1"])').toArray();
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
    
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    });
  }

  // Attach pan (drag) events
  attachPanEvents($modal) {
    const container = $modal.find(".image-container");
    
    container.on('mousedown', (event) => {
      if (this.currentZoom > 1) {
        this.isPanning = true;
        this.startX = event.clientX - this.translateX;
        this.startY = event.clientY - this.translateY;
        container.addClass('dragging');
        event.preventDefault();
      }
    });
    
    $(document).on('mousemove', (event) => {
      if (this.isPanning && this.currentZoom > 1) {
        this.translateX = event.clientX - this.startX;
        this.translateY = event.clientY - this.startY;
        this.updateImageTransform(groupId);
        event.preventDefault();
      }
    });
    
    $(document).on('mouseup', () => {
      if (this.isPanning) {
        this.isPanning = false;
        container.removeClass('dragging');
        this.saveCurrentState(groupId);
      }
    });
    
    // Touch events for mobile
    container.on('touchstart', (event) => {
      if (this.currentZoom > 1 && event.originalEvent.touches.length === 1) {
        this.isPanning = true;
        const touch = event.originalEvent.touches[0];
        this.startX = touch.clientX - this.translateX;
        this.startY = touch.clientY - this.translateY;
        container.addClass('dragging');
        event.preventDefault();
      }
    });
    
    container.on('touchmove', (event) => {
      if (this.isPanning && this.currentZoom > 1 && event.originalEvent.touches.length === 1) {
        const touch = event.originalEvent.touches[0];
        this.translateX = touch.clientX - this.startX;
        this.translateY = touch.clientY - this.startY;
        this.updateImageTransform(groupId);
        event.preventDefault();
      }
    });
    
    container.on('touchend', () => {
      if (this.isPanning) {
        this.isPanning = false;
        container.removeClass('dragging');
        this.saveCurrentState(groupId);
      }
    });
  }

  panLeft($modal) {
    const $img = $modal.find('.zoomable-image');
    const $container = $modal.find('.image-container');
  
    const maxTranslateX = Math.max(($img.width() * (this.currentZoom - 1)) / 2, 0);
    this.translateX = Math.min(this.translateX + this.panStep, maxTranslateX);
  
    this.updateTransform($modal);
    this.announcePanState();
  }
  
  panRight($modal) {
    const $img = $modal.find('.zoomable-image');
    const $container = $modal.find('.image-container');
  
    const maxTranslateX = Math.max(($img.width() * (this.currentZoom - 1)) / 2, 0);
    this.translateX = Math.max(this.translateX - this.panStep, -maxTranslateX);
  
    this.updateTransform($modal);
    this.announcePanState();
  }
  
  panUp($modal) {
    const $img = $modal.find('.zoomable-image');
    const $container = $modal.find('.image-container');
  
    const maxTranslateY = Math.max(($img.height() * (this.currentZoom - 1)) / 2, 0);
    this.translateY = Math.min(this.translateY + this.panStep, maxTranslateY);
  
    this.updateTransform($modal);
    this.announcePanState();
  }
  
  panDown($modal) {
    const $img = $modal.find('.zoomable-image');
    const $container = $modal.find('.image-container');
  
    const maxTranslateY = Math.max(($img.height() * (this.currentZoom - 1)) / 2, 0);
    this.translateY = Math.max(this.translateY - this.panStep, -maxTranslateY);
  
    this.updateTransform($modal);
    this.announcePanState();
  }
  
  announcePanState(){
    $('#pan-status').text(`Image moved horizontally X=${this.translateX} and vertically Y=${this.translateY}`);
  }
}

$(document).ready(function() {
  // Initialize
  const zoomHandler = new ZoomableFigure({ minZoom: 0.5, maxZoom: 4, zoomStep: 0.25 });
  zoomHandler.init();
});
