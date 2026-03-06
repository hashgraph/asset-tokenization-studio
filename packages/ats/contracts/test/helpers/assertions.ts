// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assertObject(actual: any, expected: any, path = ""): void {
  Object.keys(expected).forEach((key) => {
    const actualValue = actual[key];
    const expectedValue = expected[key];

    if (
      typeof actualValue === "object" &&
      actualValue !== null &&
      typeof expectedValue === "object" &&
      expectedValue !== null
    ) {
      if (Array.isArray(actualValue) && Array.isArray(expectedValue)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        actualValue.forEach((item: any, index: number) => {
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
