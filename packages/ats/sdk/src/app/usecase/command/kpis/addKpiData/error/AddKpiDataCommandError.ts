// SPDX-License-Identifier: Apache-2.0

export class AddKpiDataCommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AddKpiDataCommandError";
  }
}
