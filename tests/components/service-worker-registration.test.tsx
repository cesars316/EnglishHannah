import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ServiceWorkerRegistration } from "@/components/layout/service-worker-registration";

/**
 * Prueba del registro del service worker (PWA, Fase 7).
 *
 * En produccion se registra `/sw.js`; fuera de produccion no se cachea nada y
 * ademas se retira cualquier worker previo para no interferir con `next dev`.
 */

type ServiceWorkerContainerMock = {
  register: ReturnType<typeof vi.fn>;
  getRegistrations: ReturnType<typeof vi.fn>;
};

function mockServiceWorker(): {
  container: ServiceWorkerContainerMock;
  unregister: ReturnType<typeof vi.fn>;
} {
  const unregister = vi.fn().mockResolvedValue(true);
  const container: ServiceWorkerContainerMock = {
    register: vi.fn().mockResolvedValue(undefined),
    getRegistrations: vi.fn().mockResolvedValue([{ unregister }]),
  };
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: container,
  });
  return { container, unregister };
}

afterEach(() => {
  vi.unstubAllEnvs();
  Reflect.deleteProperty(navigator, "serviceWorker");
});

describe("ServiceWorkerRegistration", () => {
  it("no falla si el navegador no soporta service workers", () => {
    // jsdom no define `navigator.serviceWorker`.
    expect(() => render(<ServiceWorkerRegistration />)).not.toThrow();
  });

  it("en produccion registra /sw.js", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { container } = mockServiceWorker();

    render(<ServiceWorkerRegistration />);

    await waitFor(() => expect(container.register).toHaveBeenCalledWith("/sw.js"));
    expect(container.getRegistrations).not.toHaveBeenCalled();
  });

  it("fuera de produccion no registra y retira workers previos", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { container, unregister } = mockServiceWorker();

    render(<ServiceWorkerRegistration />);

    await waitFor(() => expect(unregister).toHaveBeenCalled());
    expect(container.register).not.toHaveBeenCalled();
  });
});
