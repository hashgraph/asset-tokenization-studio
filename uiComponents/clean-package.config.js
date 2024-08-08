const { getFiles } = require("./scripts/getFiles");
//TODO: refactor this ?

const modules = [
  ...getFiles("src/Components", ["ts"]),
  ...getFiles("src/Theme", ["ts"]),
  ...getFiles("src/Hooks", ["ts"]),
];

module.exports = {
  indent: 2,
  remove: ["static-files", "volta", "devDependencies", "scripts"],
  replace: {
    scripts: { prepack: "clean-package", postpack: "clean-package restore" },
    exports: modules.reduce((prev, val) => {
      const baseName = val.replace("src/", "./").replace("/index.ts", "");
      return {
        ...prev,
        [baseName.replace("./Components", ".")]: {
          require: `${baseName}/index-cjs.js`,
          import: `${baseName}/index-esm.js`,
          types: `${baseName}/index.d.ts`,
        },
      };
    }, {}),
  },
};
