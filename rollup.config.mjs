// eslint-disable-next-line import/no-extraneous-dependencies
import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json" assert { type: "json" };

export default {
  input: "./src/index.ts",
  output: [
    { file: "./dist/index.cjs.js", format: "cjs" },
    { file: "./dist/index.es6.js", format: "es" },
  ],
  plugins: [typescript({ tsconfig: "./tsconfig.prod.json" })],
  external: [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
    /^node:.+$/,
  ],
};
