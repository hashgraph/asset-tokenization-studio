// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";

/**
 * Recursive structural assertion helper. Walks `expected` and asserts each
 * key matches the corresponding key in `actual`. The inputs are typed as
 * `unknown` because the helper is generic over any object shape — concrete
 * values are narrowed at runtime via `typeof` / `Array.isArray` before they
 * are dereferenced.
 */
export function assertObject(actual: unknown, expected: unknown, path = ""): void {
  if (typeof expected !== "object" || expected === null) {
    expect(actual).to.equal(expected, `Found error on ${path || "<root>"}`);
    return;
  }
  if (typeof actual !== "object" || actual === null) {
    expect(actual).to.equal(expected, `Found error on ${path || "<root>"}`);
    return;
  }

  const expectedRecord = expected as Record<string, unknown>;
  const actualRecord = actual as Record<string, unknown>;

  Object.keys(expectedRecord).forEach((key) => {
    const actualValue = actualRecord[key];
    const expectedValue = expectedRecord[key];

    if (
      typeof actualValue === "object" &&
      actualValue !== null &&
      typeof expectedValue === "object" &&
      expectedValue !== null
    ) {
      if (Array.isArray(actualValue) && Array.isArray(expectedValue)) {
        actualValue.forEach((item: unknown, index: number) => {
          assertObject(item, expectedValue[index], key);
        });
      } else {
        assertObject(actualValue, expectedValue, key);
      }
    } else {
      const pathError = path === "" ? key : `${path}.${key}`;
      expect(actualValue).to.equal(expectedValue, `Found error on ${pathError}`);
    }
  });
}
