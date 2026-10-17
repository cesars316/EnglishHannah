import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/**
 * Entorno de pruebas unitarias/componentes.
 * Se simulan las APIs del navegador que jsdom no implementa.
 */

afterEach(() => {
  cleanup();
});

// `matchMedia` es usado por el sistema visual para respetar `prefers-reduced-motion`.
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// La Web Speech API no existe en jsdom: `SpeechService` debe degradar con elegancia.
if (!("speechSynthesis" in window)) {
  Object.defineProperty(window, "speechSynthesis", {
    writable: true,
    configurable: true,
    value: undefined,
  });
}
