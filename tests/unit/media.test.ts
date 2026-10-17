import { describe, expect, it } from "vitest";

import {
  isSpeechRecognitionSupported,
  mapRecognitionError,
  normalizeSpeech,
  recognitionErrorLabel,
} from "@/features/speech/recognition";
import { cameraErrorLabel, isCameraSupported, mapCameraError, stopCamera } from "@/features/camera/camera";

describe("reconocimiento de voz", () => {
  it("mapea los errores del navegador a codigos estables", () => {
    expect(mapRecognitionError("not-allowed")).toBe("not-allowed");
    expect(mapRecognitionError("service-not-allowed")).toBe("not-allowed");
    expect(mapRecognitionError("no-speech")).toBe("no-speech");
    expect(mapRecognitionError("network")).toBe("network");
    expect(mapRecognitionError("aborted")).toBe("aborted");
    expect(mapRecognitionError("algo-raro")).toBe("unknown");
  });

  it("explica cada codigo sin culpar a la niña", () => {
    for (const code of ["not-allowed", "no-speech", "network", "aborted", "unsupported", "unknown"] as const) {
      const label = recognitionErrorLabel(code);
      expect(label.length).toBeGreaterThan(10);
      expect(label).toMatch(/microfono|escuchar|voz|escribir/i);
    }
  });

  it("normaliza para comparar lo dicho con lo esperado", () => {
    expect(normalizeSpeech("  ¡Hola, mundo!  ")).toBe("hola mundo");
    expect(normalizeSpeech("Héllo")).toBe("hello");
    expect(normalizeSpeech("Blue.")).toBe("blue");
    expect(normalizeSpeech("")).toBe("");
  });

  it("deja de escuchar si el navegador no soporta reconocimiento", () => {
    // En jsdom no hay SpeechRecognition: debe avisar y no lanzar.
    expect(isSpeechRecognitionSupported()).toBe(false);
  });
});

describe("camara", () => {
  it("mapea los errores de getUserMedia", () => {
    expect(mapCameraError({ name: "NotAllowedError" })).toBe("denied");
    expect(mapCameraError({ name: "SecurityError" })).toBe("denied");
    expect(mapCameraError({ name: "NotFoundError" })).toBe("not-found");
    expect(mapCameraError({ name: "NotReadableError" })).toBe("in-use");
    expect(mapCameraError(new Error("x"))).toBe("unknown");
  });

  it("ofrece una alternativa sin camara para cada fallo", () => {
    for (const code of ["denied", "not-found", "in-use", "unsupported", "unknown"] as const) {
      expect(cameraErrorLabel(code)).toMatch(/camara|alternativa/i);
    }
  });

  it("libera las pistas aunque el flujo sea nulo", () => {
    expect(() => stopCamera(null)).not.toThrow();
    expect(() => stopCamera(undefined)).not.toThrow();
  });

  it("detecta soporte sin lanzar en el servidor", () => {
    expect(typeof isCameraSupported()).toBe("boolean");
  });
});
