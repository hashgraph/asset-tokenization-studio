// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { Bytes4BuilderMock } from "@contract-types";

const SELECTORS = [
  "0x11111111",
  "0x22222222",
  "0x33333333",
  "0x44444444",
  "0x55555555",
  "0x66666666",
  "0x77777777",
  "0x88888888",
  "0x99999999",
  "0xaaaaaaaa",
  "0xbbbbbbbb",
  "0xcccccccc",
];

describe("Bytes4Builder Tests", () => {
  let builder: Bytes4BuilderMock;

  beforeEach(async () => {
    builder = await (await ethers.getContractFactory("Bytes4BuilderMock")).deploy();
  });

  it("GIVEN 1 selector WHEN build1 THEN returns a 1-element array in order", async () => {
    expect(await builder.build1(SELECTORS[0])).to.deep.equal(SELECTORS.slice(0, 1));
  });

  it("GIVEN 2 selectors WHEN build2 THEN returns a 2-element array in order", async () => {
    expect(await builder.build2(SELECTORS[0], SELECTORS[1])).to.deep.equal(SELECTORS.slice(0, 2));
  });

  it("GIVEN 3 selectors WHEN build3 THEN returns a 3-element array in order", async () => {
    expect(await builder.build3(SELECTORS[0], SELECTORS[1], SELECTORS[2])).to.deep.equal(SELECTORS.slice(0, 3));
  });

  it("GIVEN 4 selectors WHEN build4 THEN returns a 4-element array in order", async () => {
    expect(await builder.build4(SELECTORS[0], SELECTORS[1], SELECTORS[2], SELECTORS[3])).to.deep.equal(
      SELECTORS.slice(0, 4),
    );
  });

  it("GIVEN 5 selectors WHEN build5 THEN returns a 5-element array in order", async () => {
    expect(await builder.build5(SELECTORS[0], SELECTORS[1], SELECTORS[2], SELECTORS[3], SELECTORS[4])).to.deep.equal(
      SELECTORS.slice(0, 5),
    );
  });

  it("GIVEN 6 selectors WHEN build6 THEN returns a 6-element array in order", async () => {
    expect(
      await builder.build6(SELECTORS[0], SELECTORS[1], SELECTORS[2], SELECTORS[3], SELECTORS[4], SELECTORS[5]),
    ).to.deep.equal(SELECTORS.slice(0, 6));
  });

  it("GIVEN 7 selectors WHEN build7 THEN returns a 7-element array in order", async () => {
    expect(
      await builder.build7(
        SELECTORS[0],
        SELECTORS[1],
        SELECTORS[2],
        SELECTORS[3],
        SELECTORS[4],
        SELECTORS[5],
        SELECTORS[6],
      ),
    ).to.deep.equal(SELECTORS.slice(0, 7));
  });

  it("GIVEN 8 selectors WHEN build8 THEN returns an 8-element array in order", async () => {
    expect(
      await builder.build8(
        SELECTORS[0],
        SELECTORS[1],
        SELECTORS[2],
        SELECTORS[3],
        SELECTORS[4],
        SELECTORS[5],
        SELECTORS[6],
        SELECTORS[7],
      ),
    ).to.deep.equal(SELECTORS.slice(0, 8));
  });

  it("GIVEN 9 selectors WHEN build9 THEN returns a 9-element array in order", async () => {
    expect(
      await builder.build9(
        SELECTORS[0],
        SELECTORS[1],
        SELECTORS[2],
        SELECTORS[3],
        SELECTORS[4],
        SELECTORS[5],
        SELECTORS[6],
        SELECTORS[7],
        SELECTORS[8],
      ),
    ).to.deep.equal(SELECTORS.slice(0, 9));
  });

  it("GIVEN 10 selectors WHEN build10 THEN returns a 10-element array in order", async () => {
    expect(
      await builder.build10(
        SELECTORS[0],
        SELECTORS[1],
        SELECTORS[2],
        SELECTORS[3],
        SELECTORS[4],
        SELECTORS[5],
        SELECTORS[6],
        SELECTORS[7],
        SELECTORS[8],
        SELECTORS[9],
      ),
    ).to.deep.equal(SELECTORS.slice(0, 10));
  });

  it("GIVEN 11 selectors WHEN build11 THEN returns an 11-element array in order", async () => {
    expect(
      await builder.build11(
        SELECTORS[0],
        SELECTORS[1],
        SELECTORS[2],
        SELECTORS[3],
        SELECTORS[4],
        SELECTORS[5],
        SELECTORS[6],
        SELECTORS[7],
        SELECTORS[8],
        SELECTORS[9],
        SELECTORS[10],
      ),
    ).to.deep.equal(SELECTORS.slice(0, 11));
  });

  it("GIVEN 12 selectors WHEN build12 THEN returns a 12-element array in order", async () => {
    expect(
      await builder.build12(
        SELECTORS[0],
        SELECTORS[1],
        SELECTORS[2],
        SELECTORS[3],
        SELECTORS[4],
        SELECTORS[5],
        SELECTORS[6],
        SELECTORS[7],
        SELECTORS[8],
        SELECTORS[9],
        SELECTORS[10],
        SELECTORS[11],
      ),
    ).to.deep.equal(SELECTORS);
  });
});
