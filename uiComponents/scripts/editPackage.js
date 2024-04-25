const PackageJson = require("@npmcli/package-json");
const { getFiles } = require("./getFiles");

//TODO: refactor this ?
const modules = [
  ...getFiles("src/Components", ["ts"]),
  ...getFiles("src/Theme", ["ts"]),
  ...getFiles("src/Hooks", ["ts"]),
];

const pkgJson = new PackageJson("./");
pkgJson.load().then(() => {
  pkgJson.update({
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
  });

  pkgJson.save().then(() => {
    console.log("ok!");
  });
});
