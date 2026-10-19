// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { EnumerableSetBytes4Mock } from "@contract-types";

const SELECTOR_1 = "0x11111111";
const SELECTOR_2 = "0x22222222";
const SELECTOR_3 = "0x33333333";

describe("EnumerableSetBytes4 Tests", () => {
  let set: EnumerableSetBytes4Mock;

  beforeEach(async () => {
    set = await (await ethers.getContractFactory("EnumerableSetBytes4Mock")).deploy();
  });

  describe("add", () => {
    it("GIVEN a new value WHEN add THEN returns true and length increases", async () => {
      expect(await set.add.staticCall(SELECTOR_1)).to.be.true;

      await set.add(SELECTOR_1);

      expect(await set.length()).to.equal(1);
      expect(await set.contains(SELECTOR_1)).to.be.true;
    });

    it("GIVEN an already-present value WHEN add THEN returns false and length is unchanged", async () => {
      await set.add(SELECTOR_1);

      expect(await set.add.staticCall(SELECTOR_1)).to.be.false;

      await set.add(SELECTOR_1);

      expect(await set.length()).to.equal(1);
    });
  });

  describe("remove", () => {
    it("GIVEN an absent value WHEN remove THEN returns false and length is unchanged", async () => {
      await set.add(SELECTOR_1);

      expect(await set.remove.staticCall(SELECTOR_2)).to.be.false;

      await set.remove(SELECTOR_2);

      expect(await set.length()).to.equal(1);
    });

    it("GIVEN the last value in the set WHEN remove THEN returns true and the set becomes empty", async () => {
      await set.add(SELECTOR_1);

      expect(await set.remove.staticCall(SELECTOR_1)).to.be.true;

      await set.remove(SELECTOR_1);

      expect(await set.length()).to.equal(0);
      expect(await set.contains(SELECTOR_1)).to.be.false;
    });

    it("GIVEN a value that is not the last one WHEN remove THEN swap-and-pop preserves the remaining values", async () => {
      await set.add(SELECTOR_1);
      await set.add(SELECTOR_2);
      await set.add(SELECTOR_3);

      // SELECTOR_1 sits at index 0; removing it swaps in the last value (SELECTOR_3).
      await set.remove(SELECTOR_1);

      expect(await set.length()).to.equal(2);
      expect(await set.contains(SELECTOR_1)).to.be.false;
      expect(await set.contains(SELECTOR_2)).to.be.true;
      expect(await set.contains(SELECTOR_3)).to.be.true;
      expect(await set.at(0)).to.equal(SELECTOR_3);
    });
  });

  describe("contains", () => {
    it("GIVEN an empty set WHEN contains THEN returns false", async () => {
      expect(await set.contains(SELECTOR_1)).to.be.false;
    });
  });

  describe("length", () => {
    it("GIVEN several adds and removes WHEN length THEN reflects the current size", async () => {
      expect(await set.length()).to.equal(0);

      await set.add(SELECTOR_1);
      await set.add(SELECTOR_2);
      expect(await set.length()).to.equal(2);

      await set.remove(SELECTOR_1);
      expect(await set.length()).to.equal(1);
    });
  });

  describe("at", () => {
    it("GIVEN a populated set WHEN at with a valid index THEN returns the stored value", async () => {
      await set.add(SELECTOR_1);

      expect(await set.at(0)).to.equal(SELECTOR_1);
    });

    it("GIVEN an out-of-range index WHEN at THEN reverts", async () => {
      await set.add(SELECTOR_1);

      await expect(set.at(1)).to.be.reverted;
    });
  });
});
