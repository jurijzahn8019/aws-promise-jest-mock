import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import excludeDependenciesFromBundle from "rollup-plugin-exclude-dependencies-from-bundle";

export default {
  input: "./src/index.ts",
  output: [
    { file: "./dist/index.cjs.js", format: "cjs" },
    { file: "./dist/index.es6.js", format: "es" },
  ],
  plugins: [
    typescript({ tsconfig: "./tsconfig.prod.json" }),
    resolve({ preferBuiltins: true }),
    commonjs({ extensions: [".js", ".ts"] }),
    excludeDependenciesFromBundle({
      peerDependencies: true,
      dependencies: true,
    }),
  ],
  external: ["aws-sdk", "crypto"],
};
