import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@assets": path.resolve(__dirname, "src/assets"),
      "@components": path.resolve(__dirname, "src/components"),
      "@layouts": path.resolve(__dirname, "src/layouts"),
      "@db": path.resolve(__dirname, "src/db"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@data": path.resolve(__dirname, "src/data"),
    },
  },
  define: {
    "import.meta.env.ADMIN_SECRET": JSON.stringify("test-secret"),
    "import.meta.env.RESEND_API_KEY": JSON.stringify("re_test"),
    "import.meta.env.CANCEL_SECRET": JSON.stringify("cancel-test-secret"),
    "import.meta.env.PUBLIC_SITE_URL": JSON.stringify("http://localhost:4321"),
    "import.meta.env.DATABASE_URL": JSON.stringify("file:test.db"),
    "import.meta.env.AUTH_TOKEN": JSON.stringify(""),
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
