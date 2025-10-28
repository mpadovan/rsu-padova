import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll } from "vitest";

beforeAll(() => {
  Object.defineProperty(window, "ENV", {
    value: {
      firebaseApiKey: "test",
      firebaseAuthDomain: "test",
      firebaseProjectId: "test",
      firebaseAppId: "test",
      allowedGoogleDomains: ["example.com"],
      apiBaseUrl: "http://localhost:3000"
    },
    configurable: true
  });
});

afterEach(() => {
  cleanup();
});
