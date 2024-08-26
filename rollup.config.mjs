//@ts-check
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import filesize from "rollup-plugin-filesize";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

const pkg = JSON.parse(
  fs
    .readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), "package.json"),
    )
    .toString(),
);

const banner = `/*!
  ${pkg.name} v${pkg.version}
  ${pkg.homepage}
  Released under the ${pkg.license} License.
*/`;

// it's important to mark all subpackages of data-fns as externals
// see https://github.com/Hacker0x01/react-EasyMeet/issues/1606
// We're relying on date-fn's package.json `exports` field to
// determine the list of directories to include.
// const dateFnsPackageJson = JSON.parse(
//   fs
//     .readFileSync(
//       path.join(
//         path.dirname(fileURLToPath(import.meta.url)),
//         "node_modules/date-fns/package.json",
//       ),
//     )
//     .toString(),
// );
// const dateFnsSubpackages = Object.keys(dateFnsPackageJson.exports)
//   .map((key) => key.replace("./", ""))
//   .filter((key) => key !== "." && key !== "package.json")
//   .map((key) => `date-fns/${key}`);

const globals = {
  react: "React",
  "prop-types": "PropTypes",
};

// NOTE:https://rollupjs.org/migration/#changed-defaults
/** @type {import('rollup').OutputOptions} */
const migrateRollup2to3OutputOptions = {
  interop: "compat",
};


const config = [ 
  /** @type {import('rollup').RollupOptions} */
  {
  input: "src/index.ts",
  
  output: [
    {
      file: pkg.browser,
      format: "umd",
      name: "EasyMeet",
      globals,
      banner,
      ...migrateRollup2to3OutputOptions,
      plugins: [terser()],
      exports: "named",
    
    },
    {
      file: pkg.browser.replace(".min.js", ".js"),
      format: "umd",
      sourcemap: "inline",
      name: "EasyMeet",
      globals,
      exports: "named",
      banner,
      ...migrateRollup2to3OutputOptions,
    },
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: "inline",
      name: "EasyMeet",
      exports: "named",
      banner,
      ...migrateRollup2to3OutputOptions,
    },
    {
      file: pkg.module,
      format: "es",
      sourcemap: "inline",
      banner,
      ...migrateRollup2to3OutputOptions,
    },
  ],
  plugins: [
    resolve({
      mainFields: ["module"],
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    }),
    babel(),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.build.json",
      declaration: true,
      declarationDir: "dist",
    }),
    filesize(),
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),

  ],
},
{
  input: 'src/react/index.ts',
  output: [
    {
      file: 'dist/react.cjs.js',
      format: 'cjs',
      name: 'EasyMeetReact',
      sourcemap: true,
      exports: 'named',
      banner,
      ...migrateRollup2to3OutputOptions,
    },
    {
      file: 'dist/react.es.js',
      format: 'es',
      sourcemap: true, exports: "named",
      banner,
      ...migrateRollup2to3OutputOptions,
    }
  ], plugins: [
    resolve({
      mainFields: ["module"],
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    }),
    babel(),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.build.json",
      declaration: true,
      declarationDir: "dist",
    }),
    filesize(),
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),

  ],
}

];

export default config;