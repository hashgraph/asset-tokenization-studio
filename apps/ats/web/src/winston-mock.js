// Winston mock for browser compatibility
export const createLogger = () => ({
  log: (level, message, meta) => {
    // Mock logger should delegate to console for debugging
    const consoleMethod =
      level === 'ERROR' ? 'error' : level === 'TRACE' ? 'debug' : 'info';
    console[consoleMethod](`[${level}] ${message}`, meta);
  },
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
