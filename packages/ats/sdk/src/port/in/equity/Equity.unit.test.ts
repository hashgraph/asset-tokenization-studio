// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import {
  CreateEquityRequest,
  GetEquityDetailsRequest,
  SetDividendsRequest,
  GetDividendsForRequest,
  GetDividendsRequest,
  GetAllDividendsRequest,
  SetVotingRightsRequest,
  SetScheduledBalanceAdjustmentRequest,
  GetVotingRightsRequest,
  GetVotingRightsForRequest,
  GetAllVotingRightsRequest,
  GetScheduledBalanceAdjustmentCountRequest,
  GetScheduledBalanceAdjustmentRequest,
  GetAllScheduledBalanceAdjustmentsRequest,
  GetDividendHoldersRequest,
  GetTotalDividendHoldersRequest,
  GetVotingHoldersRequest,
  GetTotalVotingHoldersRequest,
  CreateTrexSuiteEquityRequest,
} from "../request";
import { HederaIdPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import NetworkService from "@service/network/NetworkService";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import ContractId from "@domain/context/contract/ContractId";
import { CastRegulationSubType, CastRegulationType } from "@domain/context/factory/RegulationType";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { ONE_THOUSAND } from "@domain/context/shared/SecurityDate";
import { BigNumber } from "ethers";
import EquityToken from "./Equity";
import {
  CreateEquityRequestFixture,
  CreateTrexSuiteEquityRequestFixture,
  DividendFixture,
  EquityDetailsFixture,
  GetAllDividendsRequestFixture,
  GetAllScheduledBalanceAdjustmentsRequestFixture,
  GetAllVotingRightsRequestFixture,
  GetDividendHoldersRequestFixture,
  GetDividendsForRequestFixture,
  GetDividendsRequestFixture,
  GetEquityDetailsRequestFixture,
  GetScheduledBalanceAdjustmentCountRequestFixture,
  GetScheduledBalanceAdjustmentRequestFixture,
  GetTotalDividendHoldersRequestFixture,
  GetTotalVotingHoldersRequestFixture,
  GetVotingHoldersRequestFixture,
  GetVotingRightsForRequestFixture,
  GetVotingRightsRequestFixture,
  ScheduledBalanceAdjustmentFixture,
  SetDividendsRequestFixture,
  SetScheduledBalanceAdjustmentRequestFixture,
  SetVotingRightsRequestFixture,
  VotingRightsFixture,
} from "@test/fixtures/equity/EquityFixture";
import { CreateEquityCommand } from "@command/equity/create/CreateEquityCommand";
import { CastDividendType } from "@domain/context/equity/DividendType";
import { GetEquityDetailsQuery } from "@query/equity/get/getEquityDetails/GetEquityDetailsQuery";
import { SetVotingRightsCommand } from "@command/equity/votingRights/set/SetVotingRightsCommand";
import { GetVotingForQuery } from "@query/equity/votingRights/getVotingFor/GetVotingForQuery";
import { GetVotingQuery } from "@query/equity/votingRights/getVoting/GetVotingQuery";
import { GetVotingCountQuery } from "@query/equity/votingRights/getVotingCount/GetVotingCountQuery";
import { SetDividendsCommand } from "@command/equity/dividends/set/SetDividendsCommand";
import { GetDividendsForQuery } from "@query/equity/dividends/getDividendsFor/GetDividendsForQuery";
import { GetDividendsQuery } from "@query/equity/dividends/getDividends/GetDividendsQuery";
import { GetDividendsCountQuery } from "@query/equity/dividends/getDividendsCount/GetDividendsCountQuery";
import { SetScheduledBalanceAdjustmentCommand } from "@command/equity/balanceAdjustments/setScheduledBalanceAdjustment/SetScheduledBalanceAdjustmentCommand";
import { GetScheduledBalanceAdjustmentQuery } from "@query/equity/balanceAdjustments/getScheduledBalanceAdjustment/GetScheduledBalanceAdjustmentQuery";
import { GetScheduledBalanceAdjustmentCountQuery } from "@query/equity/balanceAdjustments/getScheduledBalanceAdjustmentCount/GetScheduledBalanceAdjustmentsCountQuery";
import { GetDividendHoldersQuery } from "@query/equity/dividends/getDividendHolders/GetDividendHoldersQuery";
import { GetTotalDividendHoldersQuery } from "@query/equity/dividends/getTotalDividendHolders/GetTotalDividendHoldersQuery";
import { GetVotingHoldersQuery } from "@query/equity/votingRights/getVotingHolders/GetVotingHoldersQuery";
import { GetTotalVotingHoldersQuery } from "@query/equity/votingRights/getTotalVotingHolders/GetTotalVotingHoldersQuery";
import { CreateTrexSuiteEquityCommand } from "@command/equity/createTrexSuite/CreateTrexSuiteEquityCommand";

describe("Equity", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let networkServiceMock: jest.Mocked<NetworkService>;

  let createEquityRequest: CreateEquityRequest;
  let getEquityDetailsRequest: GetEquityDetailsRequest;
  let setDividendsRequest: SetDividendsRequest;
  let getDividendsForRequest: GetDividendsForRequest;
  let getDividendsRequest: GetDividendsRequest;
  let getAllDividendsRequest: GetAllDividendsRequest;
  let setVotingRightsRequest: SetVotingRightsRequest;
  let getVotingRightsForRequest: GetVotingRightsForRequest;
  let getVotingRightsRequest: GetVotingRightsRequest;
  let getAllVotingRightsRequest: GetAllVotingRightsRequest;
  let setScheduledBalanceAdjustmentRequest: SetScheduledBalanceAdjustmentRequest;
  let getScheduledBalanceAdjustmentCountRequest: GetScheduledBalanceAdjustmentCountRequest;
  let getScheduledBalanceAdjustmentRequest: GetScheduledBalanceAdjustmentRequest;
  let getAllScheduledBalanceAdjustmentsRequest: GetAllScheduledBalanceAdjustmentsRequest;
  let getDividendHoldersRequest: GetDividendHoldersRequest;
  let getTotalDividendHoldersRequest: GetTotalDividendHoldersRequest;
  let getVotingHoldersRequest: GetVotingHoldersRequest;
  let getTotalVotingHoldersRequest: GetTotalVotingHoldersRequest;
  let createTrexSuiteEquityRequest: CreateTrexSuiteEquityRequest;

  let handleValidationSpy: jest.SpyInstance;

  const transactionId = TransactionIdFixture.create().id;
  const security = new Security(SecurityPropsFixture.create());
  const factoryAddress = HederaIdPropsFixture.create().value;
  const resolverAddress = HederaIdPropsFixture.create().value;

  beforeEach(() => {
    commandBusMock = createMock<CommandBus>();
    queryBusMock = createMock<QueryBus>();
    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    networkServiceMock = createMock<NetworkService>({
      configuration: {
        factoryAddress: factoryAddress,
        resolverAddress: resolverAddress,
      },
    });
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (EquityToken as any).commandBus = commandBusMock;
    (EquityToken as any).queryBus = queryBusMock;
    (EquityToken as any).networkService = networkServiceMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("create", () => {
    createEquityRequest = new CreateEquityRequest(CreateEquityRequestFixture.create());
    it("should create equity successfully", async () => {
      const expectedResponse = {
        securityId: new ContractId(HederaIdPropsFixture.create().value),
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);
      queryBusMock.execute.mockResolvedValue({
        security: security,
      });

      const result = await EquityToken.create(createEquityRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("CreateEquityRequest", createEquityRequest);

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new CreateEquityCommand(
          expect.objectContaining({
            name: createEquityRequest.name,
            symbol: createEquityRequest.symbol,
            isin: createEquityRequest.isin,
            decimals: createEquityRequest.decimals,
            isWhiteList: createEquityRequest.isWhiteList,
            isControllable: createEquityRequest.isControllable,
            arePartitionsProtected: createEquityRequest.arePartitionsProtected,
            clearingActive: createEquityRequest.clearingActive,
            internalKycActivated: createEquityRequest.internalKycActivated,
            isMultiPartition: createEquityRequest.isMultiPartition,
            maxSupply: BigDecimal.fromString(createEquityRequest.numberOfShares),
            regulationType: CastRegulationType.fromNumber(createEquityRequest.regulationType),
            regulationsubType: CastRegulationSubType.fromNumber(createEquityRequest.regulationSubType),
            isCountryControlListWhiteList: createEquityRequest.isCountryControlListWhiteList,
            countries: createEquityRequest.countries,
            info: createEquityRequest.info,
          }),
          createEquityRequest.votingRight,
          createEquityRequest.informationRight,
          createEquityRequest.liquidationRight,
          createEquityRequest.subscriptionRight,
          createEquityRequest.conversionRight,
          createEquityRequest.redemptionRight,
          createEquityRequest.putRight,
          CastDividendType.fromNumber(createEquityRequest.dividendRight),
          createEquityRequest.currency,
          createEquityRequest.nominalValue,
          createEquityRequest.nominalValueDecimals,
          new ContractId(factoryAddress),
          new ContractId(resolverAddress),
          createEquityRequest.configId,
          createEquityRequest.configVersion,
          createEquityRequest.diamondOwnerAccount,
          createEquityRequest.externalPausesIds,
          createEquityRequest.externalControlListsIds,
          createEquityRequest.externalKycListsIds,
          createEquityRequest.complianceId,
          createEquityRequest.identityRegistryId,
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          security: security,
          transactionId: expectedResponse.transactionId,
        }),
      );
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(EquityToken.create(createEquityRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("CreateEquityRequest", createEquityRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new CreateEquityCommand(
          expect.objectContaining({
            name: createEquityRequest.name,
            symbol: createEquityRequest.symbol,
            isin: createEquityRequest.isin,
            decimals: createEquityRequest.decimals,
            isWhiteList: createEquityRequest.isWhiteList,
            isControllable: createEquityRequest.isControllable,
            arePartitionsProtected: createEquityRequest.arePartitionsProtected,
            clearingActive: createEquityRequest.clearingActive,
            internalKycActivated: createEquityRequest.internalKycActivated,
            isMultiPartition: createEquityRequest.isMultiPartition,
            maxSupply: BigDecimal.fromString(createEquityRequest.numberOfShares),
            regulationType: CastRegulationType.fromNumber(createEquityRequest.regulationType),
            regulationsubType: CastRegulationSubType.fromNumber(createEquityRequest.regulationSubType),
            isCountryControlListWhiteList: createEquityRequest.isCountryControlListWhiteList,
            countries: createEquityRequest.countries,
            info: createEquityRequest.info,
          }),
          createEquityRequest.votingRight,
          createEquityRequest.informationRight,
          createEquityRequest.liquidationRight,
          createEquityRequest.subscriptionRight,
          createEquityRequest.conversionRight,
          createEquityRequest.redemptionRight,
          createEquityRequest.putRight,
          CastDividendType.fromNumber(createEquityRequest.dividendRight),
          createEquityRequest.currency,
          createEquityRequest.nominalValue,
          createEquityRequest.nominalValueDecimals,
          new ContractId(factoryAddress),
          new ContractId(resolverAddress),
          createEquityRequest.configId,
          createEquityRequest.configVersion,
          createEquityRequest.diamondOwnerAccount,
          createEquityRequest.externalPausesIds,
          createEquityRequest.externalControlListsIds,
          createEquityRequest.externalKycListsIds,
          createEquityRequest.complianceId,
          createEquityRequest.identityRegistryId,
        ),
      );
    });

    it("should throw error if name is invalid", async () => {
      createEquityRequest = new CreateEquityRequest(CreateEquityRequestFixture.create({ name: "" }));

      await expect(EquityToken.create(createEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if symbol is invalid", async () => {
      createEquityRequest = new CreateEquityRequest(
        CreateEquityRequestFixture.create({
          symbol: "",
        }),
      );

      await expect(EquityToken.create(createEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if isin is invalid", async () => {
      createEquityRequest = new CreateEquityRequest(
        CreateEquityRequestFixture.create({
          isin: "",
        }),
      );

      await expect(EquityToken.create(createEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if decimals is invalid", async () => {
      createEquityRequest = new CreateEquityRequest(
        CreateEquityRequestFixture.create({
          decimals: 2.85,
        }),
      );

      await expect(EquityToken.create(createEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if diamondOwnerAccount is invalid", async () => {
      createEquityRequest = new CreateEquityRequest(
        CreateEquityRequestFixture.create({
          diamondOwnerAccount: "invalid",
        }),
      );

      await expect(EquityToken.create(createEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if dividendRight is invalid", async () => {
      createEquityRequest = new CreateEquityRequest(
        CreateEquityRequestFixture.create({
          dividendRight: 100,
        }),
      );

      await expect(EquityToken.create(createEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if currency is invalid", async () => {
      createEquityRequest = new CreateEquityRequest(
        CreateEquityRequestFixture.create({
          currency: "invalid",
        }),
      );

      await expect(EquityToken.create(createEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if numberOfShares is invalid", async () => {
      createEquityRequest = new CreateEquityRequest(
        CreateEquityRequestFixture.create({
          numberOfShares: "invalid",
        }),
      );

      await expect(EquityToken.create(createEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if nominalValue is invalid", async () => {
      createEquityRequest = new CreateEquityRequest(
        CreateEquityRequestFixture.create({
          nominalValue: "invalid",
        }),
      );

      await expect(EquityToken.create(createEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if regulationType is invalid", async () => {
      createEquityRequest = new CreateEquityRequest(
        CreateEquityRequestFixture.create({
          regulationType: 5,
        }),
      );

      await expect(EquityToken.create(createEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if regulationSubType is invalid", async () => {
      createEquityRequest = new CreateEquityRequest(
        CreateEquityRequestFixture.create({
          regulationSubType: 5,
        }),
      );

      await expect(EquityToken.create(createEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if configId is invalid", async () => {
      createEquityRequest = new CreateEquityRequest(
        CreateEquityRequestFixture.create({
          configId: "invalid",
        }),
      );

      await expect(EquityToken.create(createEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if externalPausesIds is invalid", async () => {
      createEquityRequest = new CreateEquityRequest(
        CreateEquityRequestFixture.create({
          externalPausesIds: ["invalid"],
        }),
      );

      await expect(EquityToken.create(createEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if externalControlListsIds is invalid", async () => {
      createEquityRequest = new CreateEquityRequest(
        CreateEquityRequestFixture.create({
          externalControlListsIds: ["invalid"],
        }),
      );

      await expect(EquityToken.create(createEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if externalKycListsIds is invalid", async () => {
      createEquityRequest = new CreateEquityRequest(
        CreateEquityRequestFixture.create({
          externalKycListsIds: ["invalid"],
        }),
      );

      await expect(EquityToken.create(createEquityRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getEquityDetails", () => {
    getEquityDetailsRequest = new GetEquityDetailsRequest(GetEquityDetailsRequestFixture.create());
    it("should get equity details successfully", async () => {
      const expectedResponse = {
        equity: EquityDetailsFixture.create(),
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await EquityToken.getEquityDetails(getEquityDetailsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetEquityDetailsRequest", getEquityDetailsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetEquityDetailsQuery(getEquityDetailsRequest.equityId));

      expect(result).toEqual(
        expect.objectContaining({
          votingRight: expectedResponse.equity.votingRight,
          informationRight: expectedResponse.equity.informationRight,
          liquidationRight: expectedResponse.equity.liquidationRight,
          subscriptionRight: expectedResponse.equity.subscriptionRight,
          conversionRight: expectedResponse.equity.conversionRight,
          redemptionRight: expectedResponse.equity.redemptionRight,
          putRight: expectedResponse.equity.putRight,
          dividendRight: CastDividendType.toNumber(expectedResponse.equity.dividendRight),
          currency: expectedResponse.equity.currency,
          nominalValue: expectedResponse.equity.nominalValue.toString(),
          nominalValueDecimals: expectedResponse.equity.nominalValueDecimals,
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(EquityToken.getEquityDetails(getEquityDetailsRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetEquityDetailsRequest", getEquityDetailsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetEquityDetailsQuery(getEquityDetailsRequest.equityId));
    });

    it("should throw error if equityId is invalid", async () => {
      getEquityDetailsRequest = new GetEquityDetailsRequest({
        ...GetEquityDetailsRequestFixture.create(),
        equityId: "invalid",
      });

      await expect(EquityToken.getEquityDetails(getEquityDetailsRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("setVotingRights", () => {
    setVotingRightsRequest = new SetVotingRightsRequest(SetVotingRightsRequestFixture.create());
    it("should set voting rights successfully", async () => {
      const expectedResponse = {
        payload: 1,
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await EquityToken.setVotingRights(setVotingRightsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetVotingRightsRequest", setVotingRightsRequest);

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetVotingRightsCommand(
          setVotingRightsRequest.securityId,
          setVotingRightsRequest.recordTimestamp,
          setVotingRightsRequest.data,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(EquityToken.setVotingRights(setVotingRightsRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("SetVotingRightsRequest", setVotingRightsRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetVotingRightsCommand(
          setVotingRightsRequest.securityId,
          setVotingRightsRequest.recordTimestamp,
          setVotingRightsRequest.data,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      setVotingRightsRequest = new SetVotingRightsRequest({
        ...SetVotingRightsRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(EquityToken.setVotingRights(setVotingRightsRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if recordTimestamp is invalid", async () => {
      setVotingRightsRequest = new SetVotingRightsRequest({
        ...SetVotingRightsRequestFixture.create(),
        recordTimestamp: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
      });

      await expect(EquityToken.setVotingRights(setVotingRightsRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if data is invalid", async () => {
      setVotingRightsRequest = new SetVotingRightsRequest({
        ...SetVotingRightsRequestFixture.create(),
        data: "invalid",
      });

      await expect(EquityToken.setVotingRights(setVotingRightsRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getVotingRightsFor", () => {
    getVotingRightsForRequest = new GetVotingRightsForRequest(GetVotingRightsForRequestFixture.create());
    it("should get voting rights for successfully", async () => {
      const expectedResponse = {
        tokenBalance: new BigDecimal(BigNumber.from(10)),
        decimals: 1,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await EquityToken.getVotingRightsFor(getVotingRightsForRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetVotingRightsForRequest", getVotingRightsForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetVotingForQuery(
          getVotingRightsForRequest.targetId,
          getVotingRightsForRequest.securityId,
          getVotingRightsForRequest.votingId,
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          tokenBalance: expectedResponse.tokenBalance.toString(),
          decimals: expectedResponse.decimals.toString(),
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(EquityToken.getVotingRightsFor(getVotingRightsForRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetVotingRightsForRequest", getVotingRightsForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetVotingForQuery(
          getVotingRightsForRequest.targetId,
          getVotingRightsForRequest.securityId,
          getVotingRightsForRequest.votingId,
        ),
      );
    });

    it("should throw error if targetId is invalid", async () => {
      getVotingRightsForRequest = new GetVotingRightsForRequest({
        ...GetVotingRightsForRequestFixture.create(),
        targetId: "invalid",
      });

      await expect(EquityToken.getVotingRightsFor(getVotingRightsForRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if securityId is invalid", async () => {
      getVotingRightsForRequest = new GetVotingRightsForRequest({
        ...GetVotingRightsForRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(EquityToken.getVotingRightsFor(getVotingRightsForRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if votingId is invalid", async () => {
      getVotingRightsForRequest = new GetVotingRightsForRequest({
        ...GetVotingRightsForRequestFixture.create(),
        votingId: 0,
      });

      await expect(EquityToken.getVotingRightsFor(getVotingRightsForRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getVotingRights", () => {
    getVotingRightsRequest = new GetVotingRightsRequest(GetVotingRightsRequestFixture.create());
    it("should get voting rights successfully", async () => {
      const expectedResponse = {
        voting: VotingRightsFixture.create(),
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await EquityToken.getVotingRights(getVotingRightsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetVotingRightsRequest", getVotingRightsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetVotingQuery(getVotingRightsRequest.securityId, getVotingRightsRequest.votingId),
      );

      expect(result).toEqual(
        expect.objectContaining({
          votingId: getVotingRightsRequest.votingId,
          recordDate: new Date(expectedResponse.voting.recordTimeStamp * ONE_THOUSAND),
          data: expectedResponse.voting.data,
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(EquityToken.getVotingRights(getVotingRightsRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetVotingRightsRequest", getVotingRightsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetVotingQuery(getVotingRightsRequest.securityId, getVotingRightsRequest.votingId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getVotingRightsRequest = new GetVotingRightsRequest({
        ...GetVotingRightsRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(EquityToken.getVotingRights(getVotingRightsRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if votingId is invalid", async () => {
      getVotingRightsRequest = new GetVotingRightsRequest({
        ...GetVotingRightsRequestFixture.create(),
        votingId: -1,
      });

      await expect(EquityToken.getVotingRights(getVotingRightsRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getAllVotingRights", () => {
    getAllVotingRightsRequest = new GetAllVotingRightsRequest(GetAllVotingRightsRequestFixture.create());
    it("should get all voting rights successfully", async () => {
      const expectedResponse = {
        payload: 1,
      };

      const expectedResponse2 = {
        voting: VotingRightsFixture.create(),
      };

      queryBusMock.execute.mockResolvedValueOnce(expectedResponse).mockResolvedValueOnce(expectedResponse2);

      const result = await EquityToken.getAllVotingRights(getAllVotingRightsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAllVotingRightsRequest", getAllVotingRightsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(2);

      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        1,
        new GetVotingCountQuery(getAllVotingRightsRequest.securityId),
      );

      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        2,
        new GetVotingQuery(getAllVotingRightsRequest.securityId, 1),
      );

      expect(result).toEqual(
        expect.arrayContaining([
          {
            votingId: 1,
            recordDate: new Date(expectedResponse2.voting.recordTimeStamp * ONE_THOUSAND),
            data: expectedResponse2.voting.data,
          },
        ]),
      );
    });

    it("should return empty array if count is 0", async () => {
      const expectedResponse = {
        payload: 0,
      };
      queryBusMock.execute.mockResolvedValueOnce(expectedResponse);

      const result = await EquityToken.getAllVotingRights(getAllVotingRightsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAllVotingRightsRequest", getAllVotingRightsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetVotingCountQuery(getAllVotingRightsRequest.securityId));

      expect(result).toStrictEqual([]);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(EquityToken.getAllVotingRights(getAllVotingRightsRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAllVotingRightsRequest", getAllVotingRightsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetVotingCountQuery(getAllVotingRightsRequest.securityId));
    });
  });

  describe("setDividends", () => {
    setDividendsRequest = new SetDividendsRequest(SetDividendsRequestFixture.create());
    it("should set dividends successfully", async () => {
      const expectedResponse = {
        payload: 1,
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await EquityToken.setDividends(setDividendsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetDividendsRequest", setDividendsRequest);

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetDividendsCommand(
          setDividendsRequest.securityId,
          setDividendsRequest.recordTimestamp,
          setDividendsRequest.executionTimestamp,
          setDividendsRequest.amountPerUnitOfSecurity,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(EquityToken.setDividends(setDividendsRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("SetDividendsRequest", setDividendsRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetDividendsCommand(
          setDividendsRequest.securityId,
          setDividendsRequest.recordTimestamp,
          setDividendsRequest.executionTimestamp,
          setDividendsRequest.amountPerUnitOfSecurity,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      setDividendsRequest = new SetDividendsRequest({
        ...SetDividendsRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(EquityToken.setDividends(setDividendsRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if recordTimestamp is invalid", async () => {
      setDividendsRequest = new SetDividendsRequest({
        ...SetDividendsRequestFixture.create(),
        recordTimestamp: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
      });

      await expect(EquityToken.setDividends(setDividendsRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if executionTimestamp is invalid", async () => {
      const time = Math.ceil(new Date().getTime() / 1000);
      setDividendsRequest = new SetDividendsRequest({
        ...SetDividendsRequestFixture.create(),
        recordTimestamp: time.toString(),
        executionTimestamp: (time - 100).toString(),
      });

      await expect(EquityToken.setDividends(setDividendsRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if amountPerUnitOfSecurity is invalid", async () => {
      setDividendsRequest = new SetDividendsRequest({
        ...SetDividendsRequestFixture.create(),
        amountPerUnitOfSecurity: "invalid",
      });

      await expect(EquityToken.setDividends(setDividendsRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getDividendsFor", () => {
    getDividendsForRequest = new GetDividendsForRequest(GetDividendsForRequestFixture.create());
    it("should get dividends for successfully", async () => {
      const expectedResponse = {
        tokenBalance: new BigDecimal(BigNumber.from(10)),
        decimals: 1,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await EquityToken.getDividendsFor(getDividendsForRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetDividendsForRequest", getDividendsForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetDividendsForQuery(
          getDividendsForRequest.targetId,
          getDividendsForRequest.securityId,
          getDividendsForRequest.dividendId,
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          tokenBalance: expectedResponse.tokenBalance.toString(),
          decimals: expectedResponse.decimals.toString(),
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(EquityToken.getDividendsFor(getDividendsForRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetDividendsForRequest", getDividendsForRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetDividendsForQuery(
          getDividendsForRequest.targetId,
          getDividendsForRequest.securityId,
          getDividendsForRequest.dividendId,
        ),
      );
    });

    it("should throw error if targetId is invalid", async () => {
      getDividendsForRequest = new GetDividendsForRequest({
        ...GetDividendsForRequestFixture.create(),
        targetId: "invalid",
      });

      await expect(EquityToken.getDividendsFor(getDividendsForRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if securityId is invalid", async () => {
      getDividendsForRequest = new GetDividendsForRequest({
        ...GetDividendsForRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(EquityToken.getDividendsFor(getDividendsForRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if dividendId is invalid", async () => {
      getDividendsForRequest = new GetDividendsForRequest({
        ...GetDividendsForRequestFixture.create(),
        dividendId: 0,
      });

      await expect(EquityToken.getDividendsFor(getDividendsForRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getDividends", () => {
    getDividendsRequest = new GetDividendsRequest(GetDividendsRequestFixture.create());
    it("should get dividends successfully", async () => {
      const expectedResponse = {
        dividend: DividendFixture.create(),
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await EquityToken.getDividends(getDividendsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetDividendsRequest", getDividendsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetDividendsQuery(getDividendsRequest.securityId, getDividendsRequest.dividendId),
      );

      expect(result).toEqual(
        expect.objectContaining({
          dividendId: getDividendsRequest.dividendId,
          amountPerUnitOfSecurity: expectedResponse.dividend.amountPerUnitOfSecurity.toString(),
          recordDate: new Date(expectedResponse.dividend.recordTimeStamp * ONE_THOUSAND),
          executionDate: new Date(expectedResponse.dividend.executionTimeStamp * ONE_THOUSAND),
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(EquityToken.getDividends(getDividendsRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetDividendsRequest", getDividendsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetDividendsQuery(getDividendsRequest.securityId, getDividendsRequest.dividendId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getDividendsRequest = new GetDividendsRequest({
        ...GetDividendsRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(EquityToken.getDividends(getDividendsRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if dividendId is invalid", async () => {
      getDividendsRequest = new GetDividendsRequest({
        ...GetDividendsRequestFixture.create(),
        dividendId: -1,
      });

      await expect(EquityToken.getDividends(getDividendsRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getAllDividends", () => {
    getAllDividendsRequest = new GetAllDividendsRequest(GetAllDividendsRequestFixture.create());
    it("should get all dividends successfully", async () => {
      const expectedResponse = {
        payload: 1,
      };

      const expectedResponse2 = {
        dividend: DividendFixture.create(),
      };

      queryBusMock.execute.mockResolvedValueOnce(expectedResponse).mockResolvedValueOnce(expectedResponse2);

      const result = await EquityToken.getAllDividends(getAllDividendsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAllDividendsRequest", getAllDividendsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(2);

      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        1,
        new GetDividendsCountQuery(getAllDividendsRequest.securityId),
      );

      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        2,
        new GetDividendsQuery(getAllDividendsRequest.securityId, 1),
      );

      expect(result).toEqual(
        expect.arrayContaining([
          {
            dividendId: 1,
            amountPerUnitOfSecurity: expectedResponse2.dividend.amountPerUnitOfSecurity.toString(),
            recordDate: new Date(expectedResponse2.dividend.recordTimeStamp * ONE_THOUSAND),
            executionDate: new Date(expectedResponse2.dividend.executionTimeStamp * ONE_THOUSAND),
          },
        ]),
      );
    });

    it("should return empty array if count is 0", async () => {
      const expectedResponse = {
        payload: 0,
      };
      queryBusMock.execute.mockResolvedValueOnce(expectedResponse);

      const result = await EquityToken.getAllDividends(getAllDividendsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAllDividendsRequest", getAllDividendsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetDividendsCountQuery(getAllDividendsRequest.securityId));

      expect(result).toStrictEqual([]);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(EquityToken.getAllDividends(getAllDividendsRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetAllDividendsRequest", getAllDividendsRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetVotingCountQuery(getAllDividendsRequest.securityId));
    });
  });

  describe("setScheduledBalanceAdjustment", () => {
    setScheduledBalanceAdjustmentRequest = new SetScheduledBalanceAdjustmentRequest(
      SetScheduledBalanceAdjustmentRequestFixture.create(),
    );
    it("should set scheduled balance adjustment successfully", async () => {
      const expectedResponse = {
        payload: 1,
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await EquityToken.setScheduledBalanceAdjustment(setScheduledBalanceAdjustmentRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "SetScheduledBalanceAdjustmentRequest",
        setScheduledBalanceAdjustmentRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetScheduledBalanceAdjustmentCommand(
          setScheduledBalanceAdjustmentRequest.securityId,
          setScheduledBalanceAdjustmentRequest.executionDate,
          setScheduledBalanceAdjustmentRequest.factor,
          setScheduledBalanceAdjustmentRequest.decimals,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(EquityToken.setScheduledBalanceAdjustment(setScheduledBalanceAdjustmentRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "SetScheduledBalanceAdjustmentRequest",
        setScheduledBalanceAdjustmentRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetScheduledBalanceAdjustmentCommand(
          setScheduledBalanceAdjustmentRequest.securityId,
          setScheduledBalanceAdjustmentRequest.executionDate,
          setScheduledBalanceAdjustmentRequest.factor,
          setScheduledBalanceAdjustmentRequest.decimals,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      setScheduledBalanceAdjustmentRequest = new SetScheduledBalanceAdjustmentRequest({
        ...SetScheduledBalanceAdjustmentRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(EquityToken.setScheduledBalanceAdjustment(setScheduledBalanceAdjustmentRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if executionDate is invalid", async () => {
      setScheduledBalanceAdjustmentRequest = new SetScheduledBalanceAdjustmentRequest({
        ...SetScheduledBalanceAdjustmentRequestFixture.create(),
        executionDate: (Math.ceil(new Date().getTime() / 1000) - 100).toString(),
      });

      await expect(EquityToken.setScheduledBalanceAdjustment(setScheduledBalanceAdjustmentRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if factor is invalid", async () => {
      setScheduledBalanceAdjustmentRequest = new SetScheduledBalanceAdjustmentRequest({
        ...SetScheduledBalanceAdjustmentRequestFixture.create(),
        factor: "invalid",
      });

      await expect(EquityToken.setScheduledBalanceAdjustment(setScheduledBalanceAdjustmentRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if decimals is invalid", async () => {
      setScheduledBalanceAdjustmentRequest = new SetScheduledBalanceAdjustmentRequest({
        ...SetScheduledBalanceAdjustmentRequestFixture.create(),
        decimals: "invalid",
      });

      await expect(EquityToken.setScheduledBalanceAdjustment(setScheduledBalanceAdjustmentRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getScheduledBalanceAdjustment", () => {
    getScheduledBalanceAdjustmentRequest = new GetScheduledBalanceAdjustmentRequest(
      GetScheduledBalanceAdjustmentRequestFixture.create(),
    );
    it("should get scheduled balance adjustment for successfully", async () => {
      const expectedResponse = {
        scheduleBalanceAdjustment: ScheduledBalanceAdjustmentFixture.create(),
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await EquityToken.getScheduledBalanceAdjustment(getScheduledBalanceAdjustmentRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetScheduledBalanceAdjustmentRequest",
        getScheduledBalanceAdjustmentRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetScheduledBalanceAdjustmentQuery(
          getScheduledBalanceAdjustmentRequest.securityId,
          getScheduledBalanceAdjustmentRequest.balanceAdjustmentId,
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          id: getScheduledBalanceAdjustmentRequest.balanceAdjustmentId,
          executionDate: new Date(expectedResponse.scheduleBalanceAdjustment.executionTimeStamp * ONE_THOUSAND),
          factor: expectedResponse.scheduleBalanceAdjustment.factor.toString(),
          decimals: expectedResponse.scheduleBalanceAdjustment.decimals.toString(),
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(EquityToken.getScheduledBalanceAdjustment(getScheduledBalanceAdjustmentRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetScheduledBalanceAdjustmentRequest",
        getScheduledBalanceAdjustmentRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetScheduledBalanceAdjustmentQuery(
          getScheduledBalanceAdjustmentRequest.securityId,
          getScheduledBalanceAdjustmentRequest.balanceAdjustmentId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getScheduledBalanceAdjustmentRequest = new GetScheduledBalanceAdjustmentRequest({
        ...GetScheduledBalanceAdjustmentRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(EquityToken.getScheduledBalanceAdjustment(getScheduledBalanceAdjustmentRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if balanceAdjustmentId is invalid", async () => {
      getScheduledBalanceAdjustmentRequest = new GetScheduledBalanceAdjustmentRequest({
        ...GetScheduledBalanceAdjustmentRequestFixture.create(),
        balanceAdjustmentId: -1,
      });

      await expect(EquityToken.getScheduledBalanceAdjustment(getScheduledBalanceAdjustmentRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getScheduledBalanceAdjustmentsCount", () => {
    getScheduledBalanceAdjustmentCountRequest = new GetScheduledBalanceAdjustmentCountRequest(
      GetScheduledBalanceAdjustmentCountRequestFixture.create(),
    );
    it("should get scheduled balance adjustments count successfully", async () => {
      const expectedResponse = {
        payload: 1,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await EquityToken.getScheduledBalanceAdjustmentsCount(getScheduledBalanceAdjustmentCountRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetScheduledBalanceAdjustmentCountRequest",
        getScheduledBalanceAdjustmentCountRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetScheduledBalanceAdjustmentCountQuery(getScheduledBalanceAdjustmentCountRequest.securityId),
      );

      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        EquityToken.getScheduledBalanceAdjustmentsCount(getScheduledBalanceAdjustmentCountRequest),
      ).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetScheduledBalanceAdjustmentCountRequest",
        getScheduledBalanceAdjustmentCountRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetScheduledBalanceAdjustmentCountQuery(getScheduledBalanceAdjustmentCountRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getScheduledBalanceAdjustmentCountRequest = new GetScheduledBalanceAdjustmentCountRequest({
        ...GetScheduledBalanceAdjustmentCountRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(
        EquityToken.getScheduledBalanceAdjustmentsCount(getScheduledBalanceAdjustmentCountRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("getAllScheduledBalanceAdjustments", () => {
    getAllScheduledBalanceAdjustmentsRequest = new GetAllScheduledBalanceAdjustmentsRequest(
      GetAllScheduledBalanceAdjustmentsRequestFixture.create(),
    );
    it("should get all scheduled balance adjustments successfully", async () => {
      const expectedResponse = {
        payload: 1,
      };

      const expectedResponse2 = {
        scheduleBalanceAdjustment: ScheduledBalanceAdjustmentFixture.create(),
      };

      queryBusMock.execute.mockResolvedValueOnce(expectedResponse).mockResolvedValueOnce(expectedResponse2);

      const result = await EquityToken.getAllScheduledBalanceAdjustments(getAllScheduledBalanceAdjustmentsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetAllScheduledBalanceAdjustmentsRequest",
        getAllScheduledBalanceAdjustmentsRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(2);

      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        1,
        new GetScheduledBalanceAdjustmentCountQuery(getAllScheduledBalanceAdjustmentsRequest.securityId),
      );

      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        2,
        new GetScheduledBalanceAdjustmentQuery(getAllScheduledBalanceAdjustmentsRequest.securityId, 1),
      );

      expect(result).toEqual(
        expect.arrayContaining([
          {
            decimals: expectedResponse2.scheduleBalanceAdjustment.decimals.toString(),
            id: 1,
            executionDate: new Date(expectedResponse2.scheduleBalanceAdjustment.executionTimeStamp * ONE_THOUSAND),
            factor: expectedResponse2.scheduleBalanceAdjustment.factor.toString(),
          },
        ]),
      );
    });

    it("should return empty array if count is 0", async () => {
      const expectedResponse = {
        payload: 0,
      };
      queryBusMock.execute.mockResolvedValueOnce(expectedResponse);

      const result = await EquityToken.getAllScheduledBalanceAdjustments(getAllScheduledBalanceAdjustmentsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetAllScheduledBalanceAdjustmentsRequest",
        getAllScheduledBalanceAdjustmentsRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetScheduledBalanceAdjustmentCountQuery(getAllScheduledBalanceAdjustmentsRequest.securityId),
      );

      expect(result).toStrictEqual([]);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        EquityToken.getAllScheduledBalanceAdjustments(getAllScheduledBalanceAdjustmentsRequest),
      ).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "GetAllScheduledBalanceAdjustmentsRequest",
        getAllScheduledBalanceAdjustmentsRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetScheduledBalanceAdjustmentCountQuery(getAllScheduledBalanceAdjustmentsRequest.securityId),
      );
    });
  });

  describe("getDividendHolders", () => {
    getDividendHoldersRequest = new GetDividendHoldersRequest(GetDividendHoldersRequestFixture.create());
    it("should get dividend token holders successfully", async () => {
      const expectedResponse = {
        payload: [transactionId],
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await EquityToken.getDividendHolders(getDividendHoldersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(GetDividendHoldersRequest.name, getDividendHoldersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetDividendHoldersQuery(
          getDividendHoldersRequest.securityId,
          getDividendHoldersRequest.dividendId,
          getDividendHoldersRequest.start,
          getDividendHoldersRequest.end,
        ),
      );
      expect(result).toStrictEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(EquityToken.getDividendHolders(getDividendHoldersRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith(GetDividendHoldersRequest.name, getDividendHoldersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetDividendHoldersQuery(
          getDividendHoldersRequest.securityId,
          getDividendHoldersRequest.dividendId,
          getDividendHoldersRequest.start,
          getDividendHoldersRequest.end,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getDividendHoldersRequest = new GetDividendHoldersRequest({
        ...GetDividendHoldersRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(EquityToken.getDividendHolders(getDividendHoldersRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if dividendId is invalid", async () => {
      getDividendHoldersRequest = new GetDividendHoldersRequest({
        ...GetDividendHoldersRequestFixture.create(),
        dividendId: -1,
      });

      await expect(EquityToken.getDividendHolders(getDividendHoldersRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if start is invalid", async () => {
      getDividendHoldersRequest = new GetDividendHoldersRequest({
        ...GetDividendHoldersRequestFixture.create(),
        start: -1,
      });

      await expect(EquityToken.getDividendHolders(getDividendHoldersRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if end is invalid", async () => {
      getDividendHoldersRequest = new GetDividendHoldersRequest({
        ...GetDividendHoldersRequestFixture.create(),
        end: -1,
      });

      await expect(EquityToken.getDividendHolders(getDividendHoldersRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getTotalDividendHolders", () => {
    getTotalDividendHoldersRequest = new GetTotalDividendHoldersRequest(GetTotalDividendHoldersRequestFixture.create());
    it("should get total dividend holders successfully", async () => {
      const expectedResponse = {
        payload: 1,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await EquityToken.getTotalDividendHolders(getTotalDividendHoldersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetTotalDividendHoldersRequest.name,
        getTotalDividendHoldersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTotalDividendHoldersQuery(
          getTotalDividendHoldersRequest.securityId,
          getTotalDividendHoldersRequest.dividendId,
        ),
      );

      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(EquityToken.getTotalDividendHolders(getTotalDividendHoldersRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetTotalDividendHoldersRequest.name,
        getTotalDividendHoldersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTotalDividendHoldersQuery(
          getTotalDividendHoldersRequest.securityId,
          getTotalDividendHoldersRequest.dividendId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getTotalDividendHoldersRequest = new GetTotalDividendHoldersRequest({
        ...GetTotalDividendHoldersRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(EquityToken.getTotalDividendHolders(getTotalDividendHoldersRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw error if dividendId is invalid", async () => {
      getTotalDividendHoldersRequest = new GetTotalDividendHoldersRequest({
        ...GetTotalDividendHoldersRequestFixture.create(),
        dividendId: -1,
      });

      await expect(EquityToken.getTotalDividendHolders(getTotalDividendHoldersRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getVotingHolders", () => {
    getVotingHoldersRequest = new GetVotingHoldersRequest(GetVotingHoldersRequestFixture.create());
    it("should get voting token holders successfully", async () => {
      const expectedResponse = {
        payload: [transactionId],
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await EquityToken.getVotingHolders(getVotingHoldersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(GetVotingHoldersRequest.name, getVotingHoldersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetVotingHoldersQuery(
          getVotingHoldersRequest.securityId,
          getVotingHoldersRequest.voteId,
          getVotingHoldersRequest.start,
          getVotingHoldersRequest.end,
        ),
      );
      expect(result).toStrictEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(EquityToken.getVotingHolders(getVotingHoldersRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith(GetVotingHoldersRequest.name, getVotingHoldersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetVotingHoldersQuery(
          getVotingHoldersRequest.securityId,
          getVotingHoldersRequest.voteId,
          getVotingHoldersRequest.start,
          getVotingHoldersRequest.end,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getVotingHoldersRequest = new GetVotingHoldersRequest({
        ...GetVotingHoldersRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(EquityToken.getVotingHolders(getVotingHoldersRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if voteId is invalid", async () => {
      getVotingHoldersRequest = new GetVotingHoldersRequest({
        ...GetVotingHoldersRequestFixture.create(),
        voteId: -1,
      });

      await expect(EquityToken.getVotingHolders(getVotingHoldersRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if start is invalid", async () => {
      getVotingHoldersRequest = new GetVotingHoldersRequest({
        ...GetVotingHoldersRequestFixture.create(),
        start: -1,
      });

      await expect(EquityToken.getVotingHolders(getVotingHoldersRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if end is invalid", async () => {
      getVotingHoldersRequest = new GetVotingHoldersRequest({
        ...GetVotingHoldersRequestFixture.create(),
        end: -1,
      });

      await expect(EquityToken.getVotingHolders(getVotingHoldersRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getTotalVotingHolders", () => {
    getTotalVotingHoldersRequest = new GetTotalVotingHoldersRequest(GetTotalVotingHoldersRequestFixture.create());
    it("should get total voting holders successfully", async () => {
      const expectedResponse = {
        payload: 1,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await EquityToken.getTotalVotingHolders(getTotalVotingHoldersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(GetTotalVotingHoldersRequest.name, getTotalVotingHoldersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTotalVotingHoldersQuery(getTotalVotingHoldersRequest.securityId, getTotalVotingHoldersRequest.voteId),
      );

      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(EquityToken.getTotalVotingHolders(getTotalVotingHoldersRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(GetTotalVotingHoldersRequest.name, getTotalVotingHoldersRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTotalVotingHoldersQuery(getTotalVotingHoldersRequest.securityId, getTotalVotingHoldersRequest.voteId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      getTotalVotingHoldersRequest = new GetTotalVotingHoldersRequest({
        ...GetTotalVotingHoldersRequestFixture.create(),
        securityId: "invalid",
      });

      await expect(EquityToken.getTotalVotingHolders(getTotalVotingHoldersRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if voteId is invalid", async () => {
      getTotalVotingHoldersRequest = new GetTotalVotingHoldersRequest({
        ...GetTotalVotingHoldersRequestFixture.create(),
        voteId: -1,
      });

      await expect(EquityToken.getTotalVotingHolders(getTotalVotingHoldersRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("createTrexSuite", () => {
    createTrexSuiteEquityRequest = new CreateTrexSuiteEquityRequest(CreateTrexSuiteEquityRequestFixture.create());
    it("should create equity successfully", async () => {
      const expectedResponse = {
        securityId: new ContractId(HederaIdPropsFixture.create().value),
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);
      queryBusMock.execute.mockResolvedValue({
        security: security,
      });

      const result = await EquityToken.createTrexSuite(createTrexSuiteEquityRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("CreateTrexSuiteEquityRequest", createTrexSuiteEquityRequest);

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new CreateTrexSuiteEquityCommand(
          createTrexSuiteEquityRequest.salt,
          createTrexSuiteEquityRequest.owner,
          createTrexSuiteEquityRequest.irs,
          createTrexSuiteEquityRequest.onchainId,
          createTrexSuiteEquityRequest.irAgents,
          createTrexSuiteEquityRequest.tokenAgents,
          createTrexSuiteEquityRequest.compliancesModules,
          createTrexSuiteEquityRequest.complianceSettings,
          createTrexSuiteEquityRequest.claimTopics,
          createTrexSuiteEquityRequest.issuers,
          createTrexSuiteEquityRequest.issuerClaims,
          expect.objectContaining({
            name: createTrexSuiteEquityRequest.name,
            symbol: createTrexSuiteEquityRequest.symbol,
            isin: createTrexSuiteEquityRequest.isin,
            decimals: createTrexSuiteEquityRequest.decimals,
            isWhiteList: createTrexSuiteEquityRequest.isWhiteList,
            isControllable: createTrexSuiteEquityRequest.isControllable,
            arePartitionsProtected: createTrexSuiteEquityRequest.arePartitionsProtected,
            clearingActive: createTrexSuiteEquityRequest.clearingActive,
            internalKycActivated: createTrexSuiteEquityRequest.internalKycActivated,
            isMultiPartition: createTrexSuiteEquityRequest.isMultiPartition,
            maxSupply: BigDecimal.fromString(createTrexSuiteEquityRequest.numberOfShares),
            regulationType: CastRegulationType.fromNumber(createTrexSuiteEquityRequest.regulationType),
            regulationsubType: CastRegulationSubType.fromNumber(createTrexSuiteEquityRequest.regulationSubType),
            isCountryControlListWhiteList: createTrexSuiteEquityRequest.isCountryControlListWhiteList,
            countries: createTrexSuiteEquityRequest.countries,
            info: createTrexSuiteEquityRequest.info,
          }),
          createTrexSuiteEquityRequest.votingRight,
          createTrexSuiteEquityRequest.informationRight,
          createTrexSuiteEquityRequest.liquidationRight,
          createTrexSuiteEquityRequest.subscriptionRight,
          createTrexSuiteEquityRequest.conversionRight,
          createTrexSuiteEquityRequest.redemptionRight,
          createTrexSuiteEquityRequest.putRight,
          CastDividendType.fromNumber(createTrexSuiteEquityRequest.dividendRight),
          createTrexSuiteEquityRequest.currency,
          createTrexSuiteEquityRequest.nominalValue,
          createTrexSuiteEquityRequest.nominalValueDecimals,
          new ContractId(factoryAddress),
          new ContractId(resolverAddress),
          createTrexSuiteEquityRequest.configId,
          createTrexSuiteEquityRequest.configVersion,
          createTrexSuiteEquityRequest.diamondOwnerAccount,
          createTrexSuiteEquityRequest.externalPauses,
          createTrexSuiteEquityRequest.externalControlLists,
          createTrexSuiteEquityRequest.externalKycLists,
          createTrexSuiteEquityRequest.complianceId,
          createTrexSuiteEquityRequest.identityRegistryId,
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          security: security,
          transactionId: expectedResponse.transactionId,
        }),
      );
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(EquityToken.createTrexSuite(createTrexSuiteEquityRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("CreateTrexSuiteEquityRequest", createTrexSuiteEquityRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new CreateTrexSuiteEquityCommand(
          createTrexSuiteEquityRequest.salt,
          createTrexSuiteEquityRequest.owner,
          createTrexSuiteEquityRequest.irs,
          createTrexSuiteEquityRequest.onchainId,
          createTrexSuiteEquityRequest.irAgents,
          createTrexSuiteEquityRequest.tokenAgents,
          createTrexSuiteEquityRequest.compliancesModules,
          createTrexSuiteEquityRequest.complianceSettings,
          createTrexSuiteEquityRequest.claimTopics,
          createTrexSuiteEquityRequest.issuers,
          createTrexSuiteEquityRequest.issuerClaims,
          expect.objectContaining({
            name: createTrexSuiteEquityRequest.name,
            symbol: createTrexSuiteEquityRequest.symbol,
            isin: createTrexSuiteEquityRequest.isin,
            decimals: createTrexSuiteEquityRequest.decimals,
            isWhiteList: createTrexSuiteEquityRequest.isWhiteList,
            isControllable: createTrexSuiteEquityRequest.isControllable,
            arePartitionsProtected: createTrexSuiteEquityRequest.arePartitionsProtected,
            clearingActive: createTrexSuiteEquityRequest.clearingActive,
            internalKycActivated: createTrexSuiteEquityRequest.internalKycActivated,
            isMultiPartition: createTrexSuiteEquityRequest.isMultiPartition,
            maxSupply: BigDecimal.fromString(createTrexSuiteEquityRequest.numberOfShares),
            regulationType: CastRegulationType.fromNumber(createTrexSuiteEquityRequest.regulationType),
            regulationsubType: CastRegulationSubType.fromNumber(createTrexSuiteEquityRequest.regulationSubType),
            isCountryControlListWhiteList: createTrexSuiteEquityRequest.isCountryControlListWhiteList,
            countries: createTrexSuiteEquityRequest.countries,
            info: createTrexSuiteEquityRequest.info,
          }),
          createTrexSuiteEquityRequest.votingRight,
          createTrexSuiteEquityRequest.informationRight,
          createTrexSuiteEquityRequest.liquidationRight,
          createTrexSuiteEquityRequest.subscriptionRight,
          createTrexSuiteEquityRequest.conversionRight,
          createTrexSuiteEquityRequest.redemptionRight,
          createTrexSuiteEquityRequest.putRight,
          CastDividendType.fromNumber(createTrexSuiteEquityRequest.dividendRight),
          createTrexSuiteEquityRequest.currency,
          createTrexSuiteEquityRequest.nominalValue,
          createTrexSuiteEquityRequest.nominalValueDecimals,
          new ContractId(factoryAddress),
          new ContractId(resolverAddress),
          createTrexSuiteEquityRequest.configId,
          createTrexSuiteEquityRequest.configVersion,
          createTrexSuiteEquityRequest.diamondOwnerAccount,
          createTrexSuiteEquityRequest.externalPauses,
          createTrexSuiteEquityRequest.externalControlLists,
          createTrexSuiteEquityRequest.externalKycLists,
          createTrexSuiteEquityRequest.complianceId,
          createTrexSuiteEquityRequest.identityRegistryId,
        ),
      );
    });

    it("should throw error if name is invalid", async () => {
      createTrexSuiteEquityRequest = new CreateTrexSuiteEquityRequest(
        CreateTrexSuiteEquityRequestFixture.create({ name: "" }),
      );

      await expect(EquityToken.createTrexSuite(createTrexSuiteEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if symbol is invalid", async () => {
      createTrexSuiteEquityRequest = new CreateTrexSuiteEquityRequest(
        CreateTrexSuiteEquityRequestFixture.create({
          symbol: "",
        }),
      );

      await expect(EquityToken.createTrexSuite(createTrexSuiteEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if isin is invalid", async () => {
      createTrexSuiteEquityRequest = new CreateTrexSuiteEquityRequest(
        CreateTrexSuiteEquityRequestFixture.create({
          isin: "",
        }),
      );

      await expect(EquityToken.createTrexSuite(createTrexSuiteEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if decimals is invalid", async () => {
      createTrexSuiteEquityRequest = new CreateTrexSuiteEquityRequest(
        CreateTrexSuiteEquityRequestFixture.create({
          decimals: 2.85,
        }),
      );

      await expect(EquityToken.createTrexSuite(createTrexSuiteEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if diamondOwnerAccount is invalid", async () => {
      createTrexSuiteEquityRequest = new CreateTrexSuiteEquityRequest(
        CreateTrexSuiteEquityRequestFixture.create({
          diamondOwnerAccount: "invalid",
        }),
      );

      await expect(EquityToken.createTrexSuite(createTrexSuiteEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if dividendRight is invalid", async () => {
      createTrexSuiteEquityRequest = new CreateTrexSuiteEquityRequest(
        CreateTrexSuiteEquityRequestFixture.create({
          dividendRight: 100,
        }),
      );

      await expect(EquityToken.createTrexSuite(createTrexSuiteEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if currency is invalid", async () => {
      createTrexSuiteEquityRequest = new CreateTrexSuiteEquityRequest(
        CreateTrexSuiteEquityRequestFixture.create({
          currency: "invalid",
        }),
      );

      await expect(EquityToken.createTrexSuite(createTrexSuiteEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if numberOfShares is invalid", async () => {
      createTrexSuiteEquityRequest = new CreateTrexSuiteEquityRequest(
        CreateTrexSuiteEquityRequestFixture.create({
          numberOfShares: "invalid",
        }),
      );

      await expect(EquityToken.createTrexSuite(createTrexSuiteEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if nominalValue is invalid", async () => {
      createTrexSuiteEquityRequest = new CreateTrexSuiteEquityRequest(
        CreateTrexSuiteEquityRequestFixture.create({
          nominalValue: "invalid",
        }),
      );

      await expect(EquityToken.createTrexSuite(createTrexSuiteEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if regulationType is invalid", async () => {
      createTrexSuiteEquityRequest = new CreateTrexSuiteEquityRequest(
        CreateTrexSuiteEquityRequestFixture.create({
          regulationType: 5,
        }),
      );

      await expect(EquityToken.createTrexSuite(createTrexSuiteEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if regulationSubType is invalid", async () => {
      createTrexSuiteEquityRequest = new CreateTrexSuiteEquityRequest(
        CreateTrexSuiteEquityRequestFixture.create({
          regulationSubType: 5,
        }),
      );

      await expect(EquityToken.createTrexSuite(createTrexSuiteEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if configId is invalid", async () => {
      createTrexSuiteEquityRequest = new CreateTrexSuiteEquityRequest(
        CreateTrexSuiteEquityRequestFixture.create({
          configId: "invalid",
        }),
      );

      await expect(EquityToken.createTrexSuite(createTrexSuiteEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if externalPauses is invalid", async () => {
      createTrexSuiteEquityRequest = new CreateTrexSuiteEquityRequest(
        CreateTrexSuiteEquityRequestFixture.create({
          externalPauses: ["invalid"],
        }),
      );

      await expect(EquityToken.createTrexSuite(createTrexSuiteEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if externalControlLists is invalid", async () => {
      createTrexSuiteEquityRequest = new CreateTrexSuiteEquityRequest(
        CreateTrexSuiteEquityRequestFixture.create({
          externalControlLists: ["invalid"],
        }),
      );

      await expect(EquityToken.createTrexSuite(createTrexSuiteEquityRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if externalKycLists is invalid", async () => {
      createTrexSuiteEquityRequest = new CreateTrexSuiteEquityRequest(
        CreateTrexSuiteEquityRequestFixture.create({
          externalKycLists: ["invalid"],
        }),
      );

      await expect(EquityToken.createTrexSuite(createTrexSuiteEquityRequest)).rejects.toThrow(ValidationError);
    });
  });
});
