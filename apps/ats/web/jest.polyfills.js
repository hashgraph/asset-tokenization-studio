// crypto.randomUUID is not available in JSDOM — polyfill from Node.js crypto.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { randomUUID } = require("node:crypto");

if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = {};
}
if (typeof globalThis.crypto.randomUUID !== "function") {
  globalThis.crypto.randomUUID = randomUUID;
}
