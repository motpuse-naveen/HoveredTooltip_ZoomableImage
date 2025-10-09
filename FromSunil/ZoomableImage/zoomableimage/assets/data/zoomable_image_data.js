// Zoomable Image Activity Configuration
const zoomable_image_questions = {
  "sharedProperties": {
    "maxWidth": "850px",
    "alignment": "center",
    "borderedBox": "false",
    "maxAttempts": 2,
    "saveStateData": "yes",
    "pageStateIdentifier": "zoomable_image_activity",
    // Zoom settings
    "minZoom": 0.25,
    "maxZoom": 5.0,
    "zoomStep": 0.25,
    "initialZoom": 1.0
  },
  "question_groups": {
    "group1": {
      "id": "group1",
      "type": "zoomable_image",
      "placeholder_id": "group1_placeholder",
      "alignment": "center",
      "customClass": "zoomable-image-activity",
      "title": "Zoomable Image Activity",
      "description": "Use the zoom controls to examine the image in detail. Click and drag to pan when zoomed in.",
      "image": {
        "src": "assets/images/sampleimage.jpg",
        "alt": "Sample image for zooming and examination",
        "title": "Sample Image"
      },
      "instructions": "Click the zoom in (+) or zoom out (-) buttons to change the magnification level. When zoomed in, you can click and drag to move around the image."
    }
  }
};
