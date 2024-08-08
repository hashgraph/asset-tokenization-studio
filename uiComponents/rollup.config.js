import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import url from "@rollup/plugin-url";
import { terser } from "rollup-plugin-terser";
const { getFiles } = require("./scripts/getFiles");

const external = ["tslib", "@chakra-ui/react", "@chakra-ui/system", "react"];
const formats = ["cjs", "esm"];

const rollupConfig = formats.map((format) => ({
  input: [
    ...getFiles("src/Components", ["ts"]),
    ...getFiles("src/Theme", ["ts"]),
    ...getFiles("src/Hooks", ["ts"]),
  ],
  output: {
    dir: ".",
    format,
    sourcemap: false,
    preserveModules: true,
    preserveModulesRoot: "src",
    entryFileNames: `[name]-${format}.js`,
    exports: "auto",
  },
  plugins: [
    url({
      include: ["src/**/*.ttf", "src/**/*.svg"],
      limit: Infinity,
    }),
    resolve(),
    commonjs(),
    typescript({
      typescript: require("ttypescript"),
      tsconfig: "./tsconfig.build.json",
      outDir: ".",
      tsconfigDefaults: {
        compilerOptions: {
          plugins: [
            { transform: "typescript-transform-paths" },
            {
              transform: "typescript-transform-paths",
              afterDeclarations: true,
            },
          ],
        },
      },
    }),
    terser(),
  ],
  external: (id) => id.includes("node_modules") || external.includes(id),
}));

export default rollupConfig;
