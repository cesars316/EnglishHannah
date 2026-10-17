import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * Pruebas de integracion: requieren MongoDB.
 * Por defecto apuntan a `MONGODB_URI_TEST` o a `mongodb://localhost:27017`.
 * Si la base de datos no esta disponible, las suites se marcan como omitidas.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    name: "integration",
    environment: "node",
    globals: true,
    include: ["tests/integration/**/*.test.ts"],
    setupFiles: ["./tests/integration/setup.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
    // Todavia no hay suites de integracion (llegan en la Fase 3 con MongoDB):
    // el script no debe fallar por "no test files" mientras tanto.
    passWithNoTests: true,
  },
});
