// SPDX-License-Identifier: Apache-2.0

import Mapper from "@core/validation/Mapper";

describe("Mapper.renamePrivateProps", () => {
  it("should remove leading underscore from a single string", () => {
    expect(Mapper.renamePrivateProps("_privateKey")).toBe("privateKey");
  });

  it("should remove leading hash from a single string", () => {
    expect(Mapper.renamePrivateProps("#hashKey")).toBe("hashKey");
  });

  it("should return the string as-is if no leading _ or #", () => {
    expect(Mapper.renamePrivateProps("normalKey")).toBe("normalKey");
  });

  it("should remove leading _ or # from all strings in an array", () => {
    const input = ["_one", "#two", "three"];
    const expected = ["one", "two", "three"];
    expect(Mapper.renamePrivateProps(input)).toEqual(expected);
  });

  it("should return empty array if input is empty array", () => {
    expect(Mapper.renamePrivateProps([])).toEqual([]);
  });
});
