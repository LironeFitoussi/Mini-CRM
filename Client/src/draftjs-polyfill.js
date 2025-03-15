/**
 * Polyfill for Draft.js
 * 
 * Draft.js was built for CommonJS environments and expects certain globals
 * that may not be available in all browser environments, especially with
 * modern bundlers like Vite.
 */

// Make 'global' available
if (typeof window !== 'undefined') {
  window.global = window;
}

// No need to check for global explicitly since we've defined it above
// These operations will only happen if we're in a browser environment
if (typeof window !== 'undefined' && window.global) {
  window.global.process = window.global.process || {};
  window.global.process.env = window.global.process.env || {};
}

export default {}; 