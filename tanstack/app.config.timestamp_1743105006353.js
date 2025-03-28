// app.config.ts
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import path from "path";
var ReactCompilerConfig = {
  /* ... */
};
var app_config_default = defineConfig({
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"]
      }),
      tailwindcss()
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./")
      }
    }
  },
  react: {
    babel: {
      plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]]
    }
  }
});
export {
  app_config_default as default
};
