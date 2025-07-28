// Winston mock for browser compatibility
export const createLogger = () => ({
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
  trace: () => {},
});

export const format = {
  combine: () => ({}),
  timestamp: () => ({}),
  errors: () => ({}),
  json: () => ({}),
  printf: () => ({}),
};

export const transports = {
  Console: class {
    constructor() {}
  },
  File: class {
    constructor() {}
  },
};

export default {
  createLogger,
  format,
  transports,
};
