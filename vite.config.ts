import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "");
  for (const key of [
    "MONGODB_URI",
    "MONGODB_DATABASE",
    "SESSION_SECRET",
    "db_user",
    "db_password",
  ]) {
    if (!process.env[key] && environment[key]) {
      process.env[key] = environment[key];
    }
  }

  return {
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      tanstackStart({
        server: { entry: "server" },
      }),
      tailwindcss(),
      react(),
    ],
  };
});
