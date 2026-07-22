console.log('--- POLYFILL INITIALIZED ---');

// Polyfill DOMException globally across all environments (global, globalThis, window)
if (typeof global.DOMException === 'undefined') {
  class DOMExceptionPolyfill extends Error {
    constructor(message = 'DOM Exception', name = 'Error') {
      super(message);
      this.name = name;
    }
  }
  (global as any).DOMException = DOMExceptionPolyfill;
  (globalThis as any).DOMException = DOMExceptionPolyfill;
  if (typeof window !== 'undefined') {
    (window as any).DOMException = DOMExceptionPolyfill;
  }
  console.log('DOMException polyfill successfully injected into global scope.');
}
