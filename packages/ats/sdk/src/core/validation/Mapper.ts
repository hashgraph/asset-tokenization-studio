// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */

export default class Mapper {
  public static renamePrivateProps(keys: string | string[]): string | string[] {
    if (typeof keys === "string") {
      return keys.startsWith("_") || keys.startsWith("#") ? keys.substring(1) : keys;
    } else {
      return keys.map((key) => (key.startsWith("_") || key.startsWith("#") ? key.substring(1) : key));
    }
  }
}
