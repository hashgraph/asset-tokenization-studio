// SPDX-License-Identifier: Apache-2.0

import CreateEquityRequest from "./equity/CreateEquityRequest";
import CreateBondRequest from "./bond/CreateBondRequest";
import { CreateEquityRequestFixture } from "@test/fixtures/equity/EquityFixture";
import { CreateBondRequestFixture } from "@test/fixtures/bond/BondFixture";

/**
 * configVersion validation lives at the request-DTO boundary (a single
 * `FormatValidation.checkNumber({ min: MIN_CONFIG_VERSION })` rule on each
 * create request), not in the command handlers. These cases pin that the
 * boundary rejects the removed `version == 0` sentinel and accepts `>= 1`.
 */
describe("create requests — configVersion boundary validation", () => {
  const cases = [
    {
      name: "CreateEquityRequest",
      build: (cv: number) => new CreateEquityRequest(CreateEquityRequestFixture.create({ configVersion: cv })),
    },
    {
      name: "CreateBondRequest",
      build: (cv: number) => new CreateBondRequest(CreateBondRequestFixture.create({ configVersion: cv })),
    },
  ];

  it.each(cases)("$name rejects configVersion 0", ({ build }) => {
    expect(build(0).validate("configVersion").length).toBeGreaterThan(0);
  });

  it.each(cases)("$name accepts configVersion 1", ({ build }) => {
    expect(build(1).validate("configVersion")).toHaveLength(0);
  });
});
