// SPDX-License-Identifier: Apache-2.0

import { container } from "tsyringe";
import SecurityService from "./SecurityService";
import { QueryBus } from "@core/query/QueryBus";
import Injectable from "@core/injectable/Injectable";
import { GetSecurityQuery } from "@query/security/get/GetSecurityQuery";
import { Security } from "@domain/context/security/Security";
import { SecurityNotFound } from "./error/SecurityNotFound";
import { createMock } from "@golevelup/ts-jest";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";

describe("SecurityService", () => {
  let service: SecurityService;
  const queryBusMock = createMock<QueryBus>();

  const security = new Security(SecurityPropsFixture.create());
  const securityId = security.diamondAddress!.toString();

  beforeEach(() => {
    service = new SecurityService();
    jest.spyOn(Injectable, "resolve").mockReturnValue(queryBusMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("get", () => {
    it("should return a Security object for a valid securityId", async () => {
      queryBusMock.execute.mockResolvedValue({ security });

      const result = await service.get(securityId);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetSecurityQuery(securityId));
      expect(result.diamondAddress).toMatchObject(security.diamondAddress!);
    });

    it.each([
      [
        "missing name",
        {
          decimals: security.decimals,
          symbol: security.symbol,
          isin: security.isin,
          evmDiamondAddress: security.evmDiamondAddress,
        },
      ],
      [
        "missing decimals",
        {
          name: security.name,
          symbol: security.symbol,
          isin: security.isin,
          evmDiamondAddress: security.evmDiamondAddress,
        },
      ],
      [
        "missing symbol",
        {
          name: security.name,
          decimals: security.decimals,
          isin: security.isin,
          evmDiamondAddress: security.evmDiamondAddress,
        },
      ],
      [
        "missing isin",
        {
          name: security.name,
          decimals: security.decimals,
          symbol: security.symbol,
          evmDiamondAddress: security.evmDiamondAddress,
        },
      ],
      [
        "missing evmDiamondAddress",
        {
          name: security.name,
          decimals: security.decimals,
          symbol: security.symbol,
          isin: security.isin,
        },
      ],
    ])("should throw SecurityNotFound when %s", async (_description, incompleteViewModel) => {
      queryBusMock.execute.mockResolvedValue({
        security: incompleteViewModel,
      });

      await expect(service.get(securityId)).rejects.toThrow(SecurityNotFound);
      await expect(service.get(securityId)).rejects.toThrow(`${securityId} was not found`);
      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetSecurityQuery(securityId));
    });

    it("should be a singleton", () => {
      const service1 = container.resolve(SecurityService);
      const service2 = container.resolve(SecurityService);
      expect(service1).toBe(service2);
    });
  });
});
