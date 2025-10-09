// Zoomable Image Activity Renderer
class ZoomableImageRenderer {
  constructor(groups, sharedProperties) {
    this.questionGroups = groups;
    this.sharedProperties = sharedProperties;
    
    // Set default zoom settings
    this.minZoom = this.sharedProperties.minZoom || 0.25;
    this.maxZoom = this.sharedProperties.maxZoom || 5.0;
    this.zoomStep = this.sharedProperties.zoomStep || 0.25;
    this.currentZoom = this.sharedProperties.initialZoom || 1.0;
    
    // Panning state
    this.isPanning = false;
    this.startX = 0;
    this.startY = 0;
    this.translateX = 0;
    this.translateY = 0;
  }
  
  render() {
    Object.keys(this.questionGroups).forEach(function (key, index) {
      const quesGroupHandler = this.getHandler(this.questionGroups[key].type);
      if (quesGroupHandler) {
        const groupElement = quesGroupHandler.render(this.questionGroups[key]);
        const placeholderId = this.questionGroups[key].placeholder_id;
        const groupAlignment = this.questionGroups[key].alignment;
        
        if(groupAlignment !== undefined && groupAlignment !== ""){
          groupElement.addClass(`force-align-${groupAlignment}`);
        }
        
        if (placeholderId.startsWith("#")) {
          $(placeholderId).append(groupElement);
        } else {
          $(`#${placeholderId}`).append(groupElement);
        }

        quesGroupHandler.attachEvents(this.questionGroups[key]);
      } else {
        console.error(`No handler for group type: ${this.questionGroups[key].type}`);
      }
    }.bind(this));
    
    // Add ARIA div for accessibility announcements
    if (typeof CommonUtils !== 'undefined' && CommonUtils.add_ARIA_Div_to_DOM) {
      CommonUtils.add_ARIA_Div_to_DOM();
    }

    // Apply shared properties
    this.applySharedProperties();
  }
  
  getHandler(type) {
    const handlers = {
      zoomable_image: new ZoomableImage_Handler(this.sharedProperties)
    };
    return handlers[type] || null;
  }
  applySharedProperties(){
    if(this.sharedProperties.maxWidth!=undefined && this.sharedProperties.maxWidth != ""){
      $(".group-main").css({"max-width":this.sharedProperties.maxWidth});
    }
    if(this.sharedProperties.alignment!=undefined && this.sharedProperties.alignment == "center"){
      $(".group-main").addClass("align-center");
    }
    else{
      $(".group-main").addClass("align-left");
    }
    if(this.sharedProperties.borderedBox!=undefined && this.sharedProperties.borderedBox == "true"){
      $(".group-main").addClass("bordered-box");
    }
  }
}


class ZoomableImage_Handler {
  constructor(sharedProperties) {
    this.sharedProperties = sharedProperties;
    this.pageStateIdentifier = this.sharedProperties.pageStateIdentifier;
    
    // Zoom settings
    this.minZoom = this.sharedProperties.minZoom || 0.25;
    this.maxZoom = this.sharedProperties.maxZoom || 5.0;
    this.zoomStep = this.sharedProperties.zoomStep || 0.25;
    this.currentZoom = this.sharedProperties.initialZoom || 1.0;
    
    // Panning state
    this.isPanning = false;
    this.startX = 0;
    this.startY = 0;
    this.translateX = 0;
    this.translateY = 0;
  }
  // Method to save the zoom state to LocalStorage
  saveState(groupId, stateData) {
    const key = `zoomable_image_state_${this.pageStateIdentifier}_${groupId}`;
    localStorage.setItem(key, JSON.stringify(stateData));
  }

  // Method to load the zoom state from LocalStorage
  getState(groupId) {
    const key = `zoomable_image_state_${this.pageStateIdentifier}_${groupId}`;
    const savedState = localStorage.getItem(key);
    return savedState ? JSON.parse(savedState) : null;
  }
  
  clearState(groupId) {
    const key = `zoomable_image_state_${this.pageStateIdentifier}_${groupId}`;
    localStorage.removeItem(key);
  }

  // Load the zoom state when the page is loaded
  loadImageState(groupId) {
    const savedState = this.getState(groupId);
    if (savedState && savedState.zoom) {
      this.currentZoom = savedState.zoom;
      this.translateX = savedState.translateX || 0;
      this.translateY = savedState.translateY || 0;
      
      // Apply the saved state to the image when modal is opened
      const imageKey = `zoomable_image_${groupId}`;
      const savedImageState = { 
        zoom: this.currentZoom, 
        translateX: this.translateX, 
        translateY: this.translateY 
      };
      
      if (typeof window !== 'undefined') {
        window[imageKey] = savedImageState;
      }
    }
  }
  render(group) {
    const modalId = `imageModal_${group.id}`;
    const imageId = `zoomableImage_${group.id}`;
    const triggerId = `imageTrigger_${group.id}`;
    
    const div = $(`
        <div id="zoomable_${group.id}" class="group-main ${group.type} ${(group.customClass !== undefined && group.customClass !== null) ? group.customClass : ''}">
            <div class="zoomable-image-container">
                ${group.title ? `<h3 class="zoomable-image-title">${group.title}</h3>` : ''}
                ${group.description ? `<p class="zoomable-image-description">${group.description}</p>` : ''}
                
                <div class="image-trigger" id="${triggerId}" tabindex="0" role="button" aria-label="Click to open ${group.image.alt || 'image'} in zoomable modal">
                    <img src="${group.image.src}" alt="${group.image.alt || ''}" class="trigger-image" />
                </div>
                
                ${group.instructions ? `<div class="image-instructions">${group.instructions}</div>` : ''}
            </div>
            
            <!-- Modal for Zoomable Image -->
            <div id="${modalId}" class="image-modal" role="dialog" aria-modal="true" aria-labelledby="${triggerId}" style="display: none;">
                <div class="modal-content">
                    <button class="close-modal" aria-label="Close image modal" title="Close (Esc)"></button>
                    
                    <div class="image-container" id="imageContainer_${group.id}">
                        <img id="${imageId}" 
                             src="${group.image.src}" 
                             alt="${group.image.alt || ''}" 
                             class="zoomable-image" 
                             style="transform: scale(1) translate(0px, 0px);" />
                    </div>
                    
                    <div class="zoom-controls">
                        <button class="zoom-btn zoom-in-btn" id="zoomIn_${group.id}" aria-label="Zoom in" title="Zoom In (+)"></button>
                        <button class="zoom-btn zoom-out-btn" id="zoomOut_${group.id}" aria-label="Zoom out" title="Zoom Out (-)"></button>
                    </div>
                    
                    <div class="zoom-info" id="zoomInfo_${group.id}">Zoom: <span id="zoomLevel_${group.id}">100%</span></div>
                </div>
            </div>
        </div>
    `);
    return div;
  }
  // Attach event handlers for the zoomable image
  attachEvents(group) {
    const modalId = `imageModal_${group.id}`;
    const imageId = `zoomableImage_${group.id}`;
    const triggerId = `imageTrigger_${group.id}`;
    const containerId = `imageContainer_${group.id}`;
    
    // Open modal when trigger is clicked
    $(`#${triggerId}`).on('click keydown', (event) => {
      if (event.type === 'click' || (event.type === 'keydown' && (event.key === 'Enter' || event.key === ' '))) {
        event.preventDefault();
        this.openModal(modalId, group.id);
      }
    });
    
    // Close modal when close button is clicked
    $(`#${modalId} .close-modal`).on('click', () => {
      this.closeModal(modalId, group.id);
    });
    
    // Close modal when clicking outside the image container
    $(`#${modalId}`).on('click', (event) => {
      if (event.target.id === modalId) {
        this.closeModal(modalId, group.id);
      }
    });
    
    // Keyboard navigation for modal
    $(`#${modalId}`).on('keydown', (event) => {
      if (event.key === 'Escape') {
        this.closeModal(modalId, group.id);
      } else if (event.key === '+' || event.key === '=') {
        this.zoomIn(group.id);
      } else if (event.key === '-') {
        this.zoomOut(group.id);
      }
    });
    
    // Zoom controls
    $(`#zoomIn_${group.id}`).on('click', () => this.zoomIn(group.id));
    $(`#zoomOut_${group.id}`).on('click', () => this.zoomOut(group.id));
    
    // Mouse wheel zoom
    $(`#${containerId}`).on('wheel', (event) => {
      event.preventDefault();
      if (event.originalEvent.deltaY < 0) {
        this.zoomIn(group.id);
      } else {
        this.zoomOut(group.id);
      }
    });
    
    // Drag to pan functionality
    this.attachPanEvents(group.id);
    
    // Load saved state
    this.loadImageState(group.id);
  }
  // Open the modal and focus management
  openModal(modalId, groupId) {
    const modal = $(`#${modalId}`);
    const imageId = `zoomableImage_${groupId}`;
    
    modal.show();
    modal.attr('aria-hidden', 'false');
    
    // Focus the close button for accessibility
    modal.find('.close-modal').focus();
    
    // Initialize or restore zoom state
    this.resetZoom(groupId);
    
    // Prevent body scrolling
    $('body').css('overflow', 'hidden');
    
    // Announce modal opening
    if (typeof ariaAnnounce === 'function') {
      ariaAnnounce('Image modal opened. Use plus and minus buttons to zoom, drag to pan when zoomed in.');
    }
  }
  
  // Close the modal
  closeModal(modalId, groupId) {
    const modal = $(`#${modalId}`);
    const trigger = $(`#imageTrigger_${groupId}`);
    
    modal.hide();
    modal.attr('aria-hidden', 'true');
    
    // Restore body scrolling
    $('body').css('overflow', '');
    
    // Return focus to trigger
    trigger.focus();
    
    // Save current state
    this.saveCurrentState(groupId);
    
    // Announce modal closing
    if (typeof ariaAnnounce === 'function') {
      ariaAnnounce('Image modal closed.');
    }
  }


  // Zoom in functionality
  zoomIn(groupId) {
    if (this.currentZoom < this.maxZoom) {
      this.currentZoom = Math.min(this.currentZoom + this.zoomStep, this.maxZoom);
      this.updateImageTransform(groupId);
      this.updateZoomInfo(groupId);
      this.updateZoomButtons(groupId);
      
      if (typeof ariaAnnounce === 'function') {
        ariaAnnounce(`Zoomed in to ${Math.round(this.currentZoom * 100)}%`);
      }
    }
  }
  
  // Zoom out functionality
  zoomOut(groupId) {
    if (this.currentZoom > this.minZoom) {
      this.currentZoom = Math.max(this.currentZoom - this.zoomStep, this.minZoom);
      this.updateImageTransform(groupId);
      this.updateZoomInfo(groupId);
      this.updateZoomButtons(groupId);
      
      if (typeof ariaAnnounce === 'function') {
        ariaAnnounce(`Zoomed out to ${Math.round(this.currentZoom * 100)}%`);
      }
    }
  }
  // Reset zoom to initial state
  resetZoom(groupId) {
    this.currentZoom = this.sharedProperties.initialZoom || 1.0;
    this.translateX = 0;
    this.translateY = 0;
    this.updateImageTransform(groupId);
    this.updateZoomInfo(groupId);
    this.updateZoomButtons(groupId);
  }
  
  // Update the image transform
  updateImageTransform(groupId) {
    const imageId = `zoomableImage_${groupId}`;
    const image = $(`#${imageId}`);
    
    image.css('transform', `scale(${this.currentZoom}) translate(${this.translateX}px, ${this.translateY}px)`);
  }
  
  // Update zoom level display
  updateZoomInfo(groupId) {
    $(`#zoomLevel_${groupId}`).text(`${Math.round(this.currentZoom * 100)}%`);
  }
  
  // Update zoom button states
  updateZoomButtons(groupId) {
    const zoomInBtn = $(`#zoomIn_${groupId}`);
    const zoomOutBtn = $(`#zoomOut_${groupId}`);
    
    zoomInBtn.prop('disabled', this.currentZoom >= this.maxZoom);
    zoomOutBtn.prop('disabled', this.currentZoom <= this.minZoom);
  }
  
  // Attach pan (drag) events
  attachPanEvents(groupId) {
    const containerId = `imageContainer_${groupId}`;
    const container = $(`#${containerId}`);
    
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
        $(`#${containerId}`).removeClass('dragging');
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
  
  // Save current zoom and pan state
  saveCurrentState(groupId) {
    if (this.sharedProperties.saveStateData && this.sharedProperties.saveStateData === 'yes') {
      const stateData = {
        zoom: this.currentZoom,
        translateX: this.translateX,
        translateY: this.translateY
      };
      this.saveState(groupId, stateData);
    }
  }
}

// Initialize the renderer
$(document).ready(function () {
  const zoomableImageRenderer = new ZoomableImageRenderer(zoomable_image_questions.question_groups, zoomable_image_questions.sharedProperties);
  zoomableImageRenderer.render();
});


