// Load libsodium from CDN for browser use
// This avoids webpack bundling issues with the WASM files
(function() {
  if (typeof window !== 'undefined' && !window._sodium) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/libsodium-wrappers-sumo@0.7.15/dist/browsers-sumo/combined/sodium.js';
    script.async = true;
    document.head.appendChild(script);
  }
})();
