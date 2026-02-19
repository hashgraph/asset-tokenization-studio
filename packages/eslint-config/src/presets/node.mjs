import globals from "globals";

/** Node.js environment overlay — adds node globals */
export default {
  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
};
