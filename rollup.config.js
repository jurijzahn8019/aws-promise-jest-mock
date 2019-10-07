import typescript from "rollup-plugin-typescript2";

export default {
  input: "./src/index.ts",
  output: { dir: "dist/", format: "cjs" },
  plugins: [typescript({ tsconfig: "tsconfig.prod.json" })],
  external: ["aws-sdk", "crypto"]
};
