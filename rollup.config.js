import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";
import postcss from "rollup-plugin-postcss";

const packageJson = require("./package.json");

export default [
  {
    input: "src/index.ts",
    output: [
    //   {
    //     file: packageJson.main,
    //     format: "cjs",
    //     sourcemap: true,
    //   },
      {
        file: "./dist/index.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        modulesOnly: true
      }),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      postcss(),
    ],
  },
  {
    input: "dist/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
    external: [/\.scss$/],
  },
];