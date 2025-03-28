// app.config.ts
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
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
    al
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
