import { defineConfig } from "tsup";

export default defineConfig([
  // Non-minified build (with types)
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    clean: true,
    sourcemap: true,
  },
  // Minified build
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    minify: true,
    sourcemap: true,
    outExtension({ format }) {
      return {
        js: `.min.${format === "cjs" ? "cjs" : "js"}`,
      };
    },
  },
]);
