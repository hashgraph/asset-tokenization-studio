// Fix for lru-cache compatibility with jsonld
// jsonld expects lru-cache v6 which exports LRU as the default export
// but newer versions export LRUCache as a named export

// Create a mock LRU constructor that jsonld expects
class LRU {
  constructor(options = {}) {
    this.max = options.max || 100;
    this.cache = new Map();
  }
  
  get(key) {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end to mark as recently used
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key, value) {
    // Remove key if it exists to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.max) {
      // Remove oldest (first) entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
  
  has(key) {
    return this.cache.has(key);
  }
  
  delete(key) {
    return this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
}

// Override require for lru-cache to return our mock
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  if (id === 'lru-cache') {
    return LRU;
  }
  return originalRequire.apply(this, arguments);
};
