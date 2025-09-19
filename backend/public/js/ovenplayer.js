// Simple OvenPlayer placeholder
console.log('OvenPlayer.js loaded');

// Mock OvenPlayer for basic functionality
window.OvenPlayer = {
  create: function(containerId, config) {
    console.log('OvenPlayer.create called with config:', config);
    
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Container not found:', containerId);
      return;
    }
    
    // Create a simple video element
    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = config.autoStart || false;
    video.muted = config.mute || false;
    video.style.width = '100%';
    video.style.height = '100%';
    
    // Set video source if provided
    if (config.sources && config.sources.length > 0) {
      const source = config.sources[0];
      if (source.file) {
        video.src = source.file;
        console.log('Video source set to:', source.file);
      }
    }
    
    container.appendChild(video);
    
    // Return a mock player object
    return {
      play: () => video.play(),
      pause: () => video.pause(),
      destroy: () => {
        if (video.parentNode) {
          video.parentNode.removeChild(video);
        }
      }
    };
  }
};
