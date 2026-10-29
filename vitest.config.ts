import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
    },
  },
});
