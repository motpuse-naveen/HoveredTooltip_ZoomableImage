class ZoomableFigure {
    constructor(sharedProperties = {}) {
      this.minZoom = sharedProperties.minZoom || 0.25;
      this.maxZoom = sharedProperties.maxZoom || 5.0;
      this.zoomStep = sharedProperties.zoomStep || 0.25;
      this.initialZoom = sharedProperties.initialZoom || 1.0;
  
      this.currentZoom = this.initialZoom;
      this.isPanning = false;
      this.startX = 0;
      this.startY = 0;
      this.translateX = 0;
      this.translateY = 0;
    }
  
    init() {
      const figures = document.querySelectorAll('figure.fig img');
      figures.forEach((img, index) => {
        const figure = img.closest('figure');
        const figureId = figure.id || `figure_${index}`;
  
        // Add zoom icon dynamically
        const zoomBtn = document.createElement('button');
        zoomBtn.className = 'figure-zoom-btn';
        zoomBtn.innerHTML = '🔍';
        zoomBtn.setAttribute('aria-label', 'Zoom image');
        zoomBtn.style.position = 'absolute';
        zoomBtn.style.top = '5px';
        zoomBtn.style.right = '5px';
        zoomBtn.style.zIndex = '10';
        zoomBtn.style.cursor = 'pointer';
        figure.style.position = 'relative';
        figure.appendChild(zoomBtn);
  
        zoomBtn.addEventListener('click', () => this.openModal(img.src, img.alt, figureId));
      });
    }
  
    openModal(src, alt, modalId) {
      // Create modal if not exists
      let modal = document.getElementById(modalId);
      if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'figure-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.style.display = 'none';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0,0,0,0.8)';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';
        modal.style.overflow = 'hidden';
        modal.innerHTML = `
          <div class="modal-content" style="position: relative;">
            <button class="close-modal" aria-label="Close" style="position:absolute;top:10px;right:10px;font-size:24px;">&times;</button>
            <div class="image-container" style="overflow:hidden;">
              <img src="${src}" alt="${alt}" class="zoomable-image" style="transform: scale(1) translate(0px,0px); cursor: grab;" />
            </div>
            <div class="zoom-controls" style="position:absolute; bottom:10px; left:50%; transform:translateX(-50%);">
              <button class="zoom-in-btn">+</button>
              <button class="zoom-out-btn">-</button>
            </div>
            <div class="zoom-info" style="position:absolute; bottom:10px; right:10px; color:white;">Zoom: <span class="zoom-level">100%</span></div>
          </div>
        `;
        document.body.appendChild(modal);
  
        // Attach events
        this.attachModalEvents(modal);
      }
  
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      this.resetZoom(modal);
    }
  
    closeModal(modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  
    resetZoom(modal) {
      this.currentZoom = this.initialZoom;
      this.translateX = 0;
      this.translateY = 0;
      const img = modal.querySelector('.zoomable-image');
      img.style.transform = `scale(${this.currentZoom}) translate(0px,0px)`;
      modal.querySelector('.zoom-level').textContent = `${Math.round(this.currentZoom*100)}%`;
    }
  
    zoomIn(modal) {
      if (this.currentZoom < this.maxZoom) {
        this.currentZoom = Math.min(this.currentZoom + this.zoomStep, this.maxZoom);
        this.updateTransform(modal);
      }
    }
  
    zoomOut(modal) {
      if (this.currentZoom > this.minZoom) {
        this.currentZoom = Math.max(this.currentZoom - this.zoomStep, this.minZoom);
        this.updateTransform(modal);
      }
    }
  
    updateTransform(modal) {
      const img = modal.querySelector('.zoomable-image');
      img.style.transform = `scale(${this.currentZoom}) translate(${this.translateX}px,${this.translateY}px)`;
      modal.querySelector('.zoom-level').textContent = `${Math.round(this.currentZoom*100)}%`;
    }
  
    attachModalEvents(modal) {
      const img = modal.querySelector('.zoomable-image');
      const zoomInBtn = modal.querySelector('.zoom-in-btn');
      const zoomOutBtn = modal.querySelector('.zoom-out-btn');
      const closeBtn = modal.querySelector('.close-modal');
  
      closeBtn.addEventListener('click', () => this.closeModal(modal));
      zoomInBtn.addEventListener('click', () => this.zoomIn(modal));
      zoomOutBtn.addEventListener('click', () => this.zoomOut(modal));
  
      // Drag / pan
      img.addEventListener('mousedown', (e) => {
        if (this.currentZoom <= 1) return;
        this.isPanning = true;
        this.startX = e.clientX - this.translateX;
        this.startY = e.clientY - this.translateY;
        img.style.cursor = 'grabbing';
      });
  
      document.addEventListener('mousemove', (e) => {
        if (!this.isPanning) return;
        this.translateX = e.clientX - this.startX;
        this.translateY = e.clientY - this.startY;
        this.updateTransform(modal);
      });
  
      document.addEventListener('mouseup', () => {
        this.isPanning = false;
        img.style.cursor = 'grab';
      });
  
      // Close modal on background click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal(modal);
      });
  
      // Keyboard shortcuts
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeModal(modal);
        else if (e.key === '+') this.zoomIn(modal);
        else if (e.key === '-') this.zoomOut(modal);
      });
    }
  }
  
  // Usage
  document.addEventListener('DOMContentLoaded', () => {
    const zoomHandler = new ZoomableFigure({ minZoom: 0.5, maxZoom: 4, zoomStep: 0.25 });
    zoomHandler.init();
  });
  