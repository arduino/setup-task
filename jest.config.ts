// See: https://kulshekhar.github.io/ts-jest/docs/guides/esm-support#using-esm-presets

import type { Config } from "jest";
import { createDefaultEsmPreset } from "ts-jest";

const presetConfig = createDefaultEsmPreset({
  clearMocks: true,
  moduleFileExtensions: ["js", "ts"],
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  testRunner: "jest-circus/runner",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  verbose: true,
});

export default {
  ...presetConfig,
} satisfies Config;
