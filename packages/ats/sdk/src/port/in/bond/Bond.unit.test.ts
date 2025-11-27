// SPDX-License-Identifier: Apache-2.0

import { createMock } from '@golevelup/ts-jest';
import { CommandBus } from '@core/command/CommandBus';
import {
  CreateBondRequest,
  GetBondDetailsRequest,
  SetCouponRequest,
  GetCouponForRequest,
  GetCouponRequest,
  GetAllCouponsRequest,
  UpdateMaturityDateRequest,
  RedeemAtMaturityByPartitionRequest,
  FullRedeemAtMaturityRequest,
  GetCouponHoldersRequest,
  GetTotalCouponHoldersRequest,
  CreateTrexSuiteBondRequest,
  RemoveProceedRecipientRequest,
  UpdateProceedRecipientDataRequest,
  IsProceedRecipientRequest,
  GetProceedRecipientsCountRequest,
  GetProceedRecipientDataRequest,
  GetProceedRecipientsRequest,
  GetPrincipalForRequest,
} from '../request';
import {
  HederaIdPropsFixture,
  TransactionIdFixture,
} from '@test/fixtures/shared/DataFixture';
import LogService from '@service/log/LogService';
import { QueryBus } from '@core/query/QueryBus';
import ValidatedRequest from '@core/validation/ValidatedArgs';
import { ValidationError } from '@core/validation/ValidationError';
import NetworkService from '@service/network/NetworkService';
import BondToken from './Bond';
import {
  BondDetailsFixture,
  CouponFixture,
  CreateBondRequestFixture,
  GetAllCouponsRequestFixture,
  GetBondDetailsRequestFixture,
  GetCouponForRequestFixture,
  GetCouponHoldersQueryFixture,
  GetCouponRequestFixture,
  RedeemAtMaturityByPartitionRequestFixture,
  FullRedeemAtMaturityRequestFixture,
  GetTotalCouponHoldersRequestFixture,
  SetCouponRequestFixture,
  UpdateMaturityDateRequestFixture,
  CreateTrexSuiteBondRequestFixture,
  AddProceedRecipientRequestFixture,
  RemoveProceedRecipientRequestFixture,
  UpdateProceedRecipientDataRequestFixture,
  IsProceedRecipientRequestFixture,
  GetProceedRecipientsCountRequestFixture,
  GetProceedRecipientDataRequestFixture,
  GetProceedRecipientsRequestFixture,
  GetPrincipalForRequestFixture,
} from '@test/fixtures/bond/BondFixture';
import { SecurityPropsFixture } from '@test/fixtures/shared/SecurityFixture';
import { Security } from '@domain/context/security/Security';
import { CreateBondCommand } from '@command/bond/create/CreateBondCommand';
import ContractId from '@domain/context/contract/ContractId';
import {
  CastRegulationSubType,
  CastRegulationType,
} from '@domain/context/factory/RegulationType';
import BigDecimal from '@domain/context/shared/BigDecimal';
import { faker } from '@faker-js/faker/.';
import { GetBondDetailsQuery } from '@query/bond/get/getBondDetails/GetBondDetailsQuery';
import { ONE_THOUSAND } from '@domain/context/shared/SecurityDate';
import { SetCouponCommand } from '@command/bond/coupon/set/SetCouponCommand';
import { BigNumber } from 'ethers';
import { GetCouponForQuery } from '@query/bond/coupons/getCouponFor/GetCouponForQuery';
import { GetPrincipalForQuery } from '@query/bond/get/getPrincipalFor/GetPrincipalForQuery';
import { GetCouponAmountForQuery } from '@query/bond/coupons/getCouponAmountFor/GetCouponAmountForQuery';
import { GetCouponQuery } from '@query/bond/coupons/getCoupon/GetCouponQuery';
import { GetCouponCountQuery } from '@query/bond/coupons/getCouponCount/GetCouponCountQuery';
import { UpdateMaturityDateCommand } from '@command/bond/updateMaturityDate/UpdateMaturityDateCommand';
import { RedeemAtMaturityByPartitionCommand } from '@command/bond/redeemAtMaturityByPartition/RedeemAtMaturityByPartitionCommand';
import { FullRedeemAtMaturityCommand } from '@command/bond/fullRedeemAtMaturity/FullRedeemAtMaturityCommand';
import { GetCouponHoldersQuery } from '@query/bond/coupons/getCouponHolders/GetCouponHoldersQuery';
import { GetTotalCouponHoldersQuery } from '@query/bond/coupons/getTotalCouponHolders/GetTotalCouponHoldersQuery';
import { CreateTrexSuiteBondCommand } from '@command/bond/createTrexSuite/CreateTrexSuiteBondCommand';
import AddProceedRecipientRequest from '../request/bond/AddProceedRecipientRequest';
import { AddProceedRecipientCommand } from '@command/security/proceedRecipients/addProceedRecipient/AddProceedRecipientCommand';
import { RemoveProceedRecipientCommand } from '@command/security/proceedRecipients/removeProceedRecipient/RemoveProceedRecipientCommand';
import { UpdateProceedRecipientDataCommand } from '@command/security/proceedRecipients/updateProceedRecipientData/UpdateProceedRecipientDataCommand';
import { IsProceedRecipientQuery } from '@query/security/proceedRecipient/isProceedRecipient/IsProceedRecipientQuery';
import { GetProceedRecipientsCountQuery } from '@query/security/proceedRecipient/getProceedRecipientsCount/GetProceedRecipientsCountQuery';
import { GetProceedRecipientDataQuery } from '@query/security/proceedRecipient/getProceedRecipientData/GetProceedRecipientDataQuery';
import { GetProceedRecipientsQuery } from '@query/security/proceedRecipient/getProceedRecipients/GetProceedRecipientsQuery';

describe('Bond', () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let networkServiceMock: jest.Mocked<NetworkService>;

  let createBondRequest: CreateBondRequest;
  let getBondDetailsRequest: GetBondDetailsRequest;
  let setCouponRequest: SetCouponRequest;
  let getCouponForRequest: GetCouponForRequest;
  let getCouponRequest: GetCouponRequest;
  let getAllCouponsRequest: GetAllCouponsRequest;
  let updateMaturityDateRequest: UpdateMaturityDateRequest;
  let redeemAtMaturityByPartitionRequest: RedeemAtMaturityByPartitionRequest;
  let fullRedeemAtMaturityRequest: FullRedeemAtMaturityRequest;
  let getCouponHoldersRequest: GetCouponHoldersRequest;
  let getTotalCouponHoldersRequest: GetTotalCouponHoldersRequest;
  let createTrexSuiteBondRequest: CreateTrexSuiteBondRequest;
  let getPrincipalForRequest: GetPrincipalForRequest;

  let handleValidationSpy: jest.SpyInstance;

  const transactionId = TransactionIdFixture.create().id;
  const security = new Security(SecurityPropsFixture.create());
  const factoryAddress = HederaIdPropsFixture.create().value;
  const resolverAddress = HederaIdPropsFixture.create().value;

  beforeEach(() => {
    commandBusMock = createMock<CommandBus>();
    queryBusMock = createMock<QueryBus>();
    handleValidationSpy = jest.spyOn(ValidatedRequest, 'handleValidation');
    networkServiceMock = createMock<NetworkService>({
      configuration: {
        factoryAddress: factoryAddress,
        resolverAddress: resolverAddress,
      },
    });
    jest.spyOn(LogService, 'logError').mockImplementation(() => {});
    (BondToken as any).commandBus = commandBusMock;
    (BondToken as any).queryBus = queryBusMock;
    (BondToken as any).networkService = networkServiceMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('create', () => {
    createBondRequest = new CreateBondRequest(
      CreateBondRequestFixture.create(),
    );
    it('should create successfully', async () => {
      const expectedResponse = {
        securityId: new ContractId(HederaIdPropsFixture.create().value),
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);
      queryBusMock.execute.mockResolvedValue({
        security: security,
      });

      const result = await BondToken.create(createBondRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'CreateBondRequest',
        createBondRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new CreateBondCommand(
          expect.objectContaining({
            name: createBondRequest.name,
            symbol: createBondRequest.symbol,
            isin: createBondRequest.isin,
            decimals: createBondRequest.decimals,
            isWhiteList: createBondRequest.isWhiteList,
            isControllable: createBondRequest.isControllable,
            arePartitionsProtected: createBondRequest.arePartitionsProtected,
            clearingActive: createBondRequest.clearingActive,
            internalKycActivated: createBondRequest.internalKycActivated,
            isMultiPartition: createBondRequest.isMultiPartition,
            maxSupply: BigDecimal.fromString(createBondRequest.numberOfUnits),
            regulationType: CastRegulationType.fromNumber(
              createBondRequest.regulationType,
            ),
            regulationsubType: CastRegulationSubType.fromNumber(
              createBondRequest.regulationSubType,
            ),
            isCountryControlListWhiteList:
              createBondRequest.isCountryControlListWhiteList,
            countries: createBondRequest.countries,
            info: createBondRequest.info,
          }),
          createBondRequest.currency,
          createBondRequest.nominalValue,
          createBondRequest.nominalValueDecimals,
          createBondRequest.startingDate,
          createBondRequest.maturityDate,
          new ContractId(factoryAddress),
          new ContractId(resolverAddress),
          createBondRequest.configId,
          createBondRequest.configVersion,
          createBondRequest.diamondOwnerAccount,
          createBondRequest.externalPausesIds,
          createBondRequest.externalControlListsIds,
          createBondRequest.externalKycListsIds,
          createBondRequest.complianceId,
          createBondRequest.identityRegistryId,
          createBondRequest.proceedRecipientsIds,
          createBondRequest.proceedRecipientsData,
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          security: security,
          transactionId: expectedResponse.transactionId,
        }),
      );
    });

    it('should throw an error if command execution fails', async () => {
      const error = new Error('Command execution failed');
      commandBusMock.execute.mockRejectedValue(error);

      await expect(BondToken.create(createBondRequest)).rejects.toThrow(
        'Command execution failed',
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'CreateBondRequest',
        createBondRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new CreateBondCommand(
          expect.objectContaining({
            name: createBondRequest.name,
            symbol: createBondRequest.symbol,
            isin: createBondRequest.isin,
            decimals: createBondRequest.decimals,
            isWhiteList: createBondRequest.isWhiteList,
            isControllable: createBondRequest.isControllable,
            arePartitionsProtected: createBondRequest.arePartitionsProtected,
            clearingActive: createBondRequest.clearingActive,
            internalKycActivated: createBondRequest.internalKycActivated,
            isMultiPartition: createBondRequest.isMultiPartition,
            maxSupply: BigDecimal.fromString(createBondRequest.numberOfUnits),
            regulationType: CastRegulationType.fromNumber(
              createBondRequest.regulationType,
            ),
            regulationsubType: CastRegulationSubType.fromNumber(
              createBondRequest.regulationSubType,
            ),
            isCountryControlListWhiteList:
              createBondRequest.isCountryControlListWhiteList,
            countries: createBondRequest.countries,
            info: createBondRequest.info,
          }),
          createBondRequest.currency,
          createBondRequest.nominalValue,
          createBondRequest.nominalValueDecimals,
          createBondRequest.startingDate,
          createBondRequest.maturityDate,
          new ContractId(factoryAddress),
          new ContractId(resolverAddress),
          createBondRequest.configId,
          createBondRequest.configVersion,
          createBondRequest.diamondOwnerAccount,
          createBondRequest.externalPausesIds,
          createBondRequest.externalControlListsIds,
          createBondRequest.externalKycListsIds,
          createBondRequest.complianceId,
          createBondRequest.identityRegistryId,
          createBondRequest.proceedRecipientsIds,
          createBondRequest.proceedRecipientsData,
        ),
      );
    });

    it('should not throw error if proceedRecipientsData not has bytes', async () => {
      createBondRequest = new CreateBondRequest(
        CreateBondRequestFixture.create({
          proceedRecipientsData: ['', '0x1234'],
          proceedRecipientsIds: ['0.0.1234', '0.0.5678'],
        }),
      );

      await expect(BondToken.create(createBondRequest)).resolves.not.toThrow();
    });

    it('should throw error if name is invalid', async () => {
      createBondRequest = new CreateBondRequest(
        CreateBondRequestFixture.create({ name: '' }),
      );

      await expect(BondToken.create(createBondRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if symbol is invalid', async () => {
      createBondRequest = new CreateBondRequest(
        CreateBondRequestFixture.create({
          symbol: '',
        }),
      );

      await expect(BondToken.create(createBondRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if isin is invalid', async () => {
      createBondRequest = new CreateBondRequest(
        CreateBondRequestFixture.create({
          isin: '',
        }),
      );

      await expect(BondToken.create(createBondRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if decimals is invalid', async () => {
      createBondRequest = new CreateBondRequest(
        CreateBondRequestFixture.create({
          decimals: 2.85,
        }),
      );

      await expect(BondToken.create(createBondRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if diamondOwnerAccount is invalid', async () => {
      createBondRequest = new CreateBondRequest(
        CreateBondRequestFixture.create({
          diamondOwnerAccount: 'invalid',
        }),
      );

      await expect(BondToken.create(createBondRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if currency is invalid', async () => {
      createBondRequest = new CreateBondRequest(
        CreateBondRequestFixture.create({
          currency: 'invalid',
        }),
      );

      await expect(BondToken.create(createBondRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if numberOfUnits is invalid', async () => {
      createBondRequest = new CreateBondRequest(
        CreateBondRequestFixture.create({
          numberOfUnits: 'invalid',
        }),
      );

      await expect(BondToken.create(createBondRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if nominalValue is invalid', async () => {
      createBondRequest = new CreateBondRequest(
        CreateBondRequestFixture.create({
          nominalValue: 'invalid',
        }),
      );

      await expect(BondToken.create(createBondRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if startingDate is invalid', async () => {
      const time = Math.floor(faker.date.past().getTime() / 1000);
      createBondRequest = new CreateBondRequest(
        CreateBondRequestFixture.create({
          startingDate: time.toString(),
          maturityDate: (time + 10).toString(),
        }),
      );

      await expect(BondToken.create(createBondRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if maturityDate is invalid', async () => {
      createBondRequest = new CreateBondRequest(
        CreateBondRequestFixture.create({
          maturityDate: faker.date.past().getTime().toString(),
        }),
      );

      await expect(BondToken.create(createBondRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if regulationSubType is invalid', async () => {
      createBondRequest = new CreateBondRequest(
        CreateBondRequestFixture.create({
          regulationSubType: 5,
        }),
      );

      await expect(BondToken.create(createBondRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if configId is invalid', async () => {
      createBondRequest = new CreateBondRequest(
        CreateBondRequestFixture.create({
          configId: 'invalid',
        }),
      );

      await expect(BondToken.create(createBondRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if externalPausesIds is invalid', async () => {
      createBondRequest = new CreateBondRequest(
        CreateBondRequestFixture.create({
          externalPausesIds: ['invalid'],
        }),
      );

      await expect(BondToken.create(createBondRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if externalControlListsIds is invalid', async () => {
      createBondRequest = new CreateBondRequest(
        CreateBondRequestFixture.create({
          externalControlListsIds: ['invalid'],
        }),
      );

      await expect(BondToken.create(createBondRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if externalKycListsIds is invalid', async () => {
      createBondRequest = new CreateBondRequest(
        CreateBondRequestFixture.create({
          externalKycListsIds: ['invalid'],
        }),
      );

      await expect(BondToken.create(createBondRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe('getBondDetails', () => {
    getBondDetailsRequest = new GetBondDetailsRequest(
      GetBondDetailsRequestFixture.create(),
    );
    it('should get bond details successfully', async () => {
      const expectedResponse = {
        bond: BondDetailsFixture.create(),
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await BondToken.getBondDetails(getBondDetailsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetBondDetailsRequest',
        getBondDetailsRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetBondDetailsQuery(getBondDetailsRequest.bondId),
      );

      expect(result).toEqual(
        expect.objectContaining({
          currency: expectedResponse.bond.currency,
          nominalValue: expectedResponse.bond.nominalValue.toString(),
          nominalValueDecimals: expectedResponse.bond.nominalValueDecimals,
          startingDate: new Date(
            expectedResponse.bond.startingDate * ONE_THOUSAND,
          ),
          maturityDate: new Date(
            expectedResponse.bond.maturityDate * ONE_THOUSAND,
          ),
        }),
      );
    });

    it('should throw an error if query execution fails', async () => {
      const error = new Error('Query execution failed');
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        BondToken.getBondDetails(getBondDetailsRequest),
      ).rejects.toThrow('Query execution failed');

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetBondDetailsRequest',
        getBondDetailsRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetBondDetailsQuery(getBondDetailsRequest.bondId),
      );
    });

    it('should throw error if bondId is invalid', async () => {
      getBondDetailsRequest = new GetBondDetailsRequest({
        ...GetBondDetailsRequestFixture.create(),
        bondId: 'invalid',
      });

      await expect(
        BondToken.getBondDetails(getBondDetailsRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('setCoupon', () => {
    setCouponRequest = new SetCouponRequest(SetCouponRequestFixture.create());
    it('should set coupon successfully', async () => {
      const expectedResponse = {
        payload: 1,
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await BondToken.setCoupon(setCouponRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'SetCouponRequest',
        setCouponRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetCouponCommand(
          setCouponRequest.securityId,
          setCouponRequest.recordTimestamp,
          setCouponRequest.executionTimestamp,
          setCouponRequest.rate,
          setCouponRequest.period,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error if command execution fails', async () => {
      const error = new Error('Command execution failed');
      commandBusMock.execute.mockRejectedValue(error);

      await expect(BondToken.setCoupon(setCouponRequest)).rejects.toThrow(
        'Command execution failed',
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'SetCouponRequest',
        setCouponRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetCouponCommand(
          setCouponRequest.securityId,
          setCouponRequest.recordTimestamp,
          setCouponRequest.executionTimestamp,
          setCouponRequest.rate,
          setCouponRequest.period,
        ),
      );
    });

    it('should throw error if recordTimestamp is invalid', async () => {
      setCouponRequest = new SetCouponRequest({
        ...SetCouponRequestFixture.create(),
        recordTimestamp: (
          Math.ceil(new Date().getTime() / 1000) - 100
        ).toString(),
      });

      await expect(BondToken.setCoupon(setCouponRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if executionTimestamp is invalid', async () => {
      const time = faker.date.past().getTime();
      setCouponRequest = new SetCouponRequest({
        ...SetCouponRequestFixture.create(),
        recordTimestamp: time.toString(),
        executionTimestamp: (time - 10).toString(),
      });

      await expect(BondToken.setCoupon(setCouponRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if securityId is invalid', async () => {
      setCouponRequest = new SetCouponRequest({
        ...SetCouponRequestFixture.create(),
        securityId: 'invalid',
      });

      await expect(BondToken.setCoupon(setCouponRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it('should throw error if rate is invalid', async () => {
      setCouponRequest = new SetCouponRequest({
        ...SetCouponRequestFixture.create(),
        rate: 'invalid',
      });

      await expect(BondToken.setCoupon(setCouponRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe('getCouponFor', () => {
    beforeEach(() => {
      getCouponForRequest = new GetCouponForRequest(
        GetCouponForRequestFixture.create(),
      );
    });
    it('should get coupon for successfully', async () => {
      const expectedResponse = {
        payload: new BigDecimal(BigNumber.from(10)),
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await BondToken.getCouponFor(getCouponForRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetCouponForRequest',
        getCouponForRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponForQuery(
          getCouponForRequest.targetId,
          getCouponForRequest.securityId,
          getCouponForRequest.couponId,
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          value: expectedResponse.payload.toString(),
        }),
      );
    });

    it('should throw an error if query execution fails', async () => {
      const error = new Error('Query execution failed');
      queryBusMock.execute.mockRejectedValue(error);

      await expect(BondToken.getCouponFor(getCouponForRequest)).rejects.toThrow(
        'Query execution failed',
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetCouponForRequest',
        getCouponForRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponForQuery(
          getCouponForRequest.targetId,
          getCouponForRequest.securityId,
          getCouponForRequest.couponId,
        ),
      );
    });

    it('should throw error if targetId is invalid', async () => {
      getCouponForRequest = new GetCouponForRequest({
        ...GetCouponForRequestFixture.create(),
        targetId: 'invalid',
      });

      await expect(BondToken.getCouponFor(getCouponForRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if securityId is invalid', async () => {
      getCouponForRequest = new GetCouponForRequest({
        ...GetCouponForRequestFixture.create(),
        securityId: 'invalid',
      });

      await expect(BondToken.getCouponFor(getCouponForRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if couponId is invalid', async () => {
      getCouponForRequest = new GetCouponForRequest({
        ...GetCouponForRequestFixture.create(),
        couponId: 0,
      });

      await expect(BondToken.getCouponFor(getCouponForRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe('getCouponAmountFor', () => {
    beforeEach(() => {
      getCouponForRequest = new GetCouponForRequest(
        GetCouponForRequestFixture.create(),
      );
    });
    it('should get coupon for successfully', async () => {
      const expectedResponse = {
        numerator: '10',
        denominator: '4',
        recordDateReached: true,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await BondToken.getCouponAmountFor(getCouponForRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetCouponForRequest',
        getCouponForRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponAmountForQuery(
          getCouponForRequest.targetId,
          getCouponForRequest.securityId,
          getCouponForRequest.couponId,
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          numerator: expectedResponse.numerator,
          denominator: expectedResponse.denominator,
          recordDateReached: expectedResponse.recordDateReached,
        }),
      );
    });

    it('should throw an error if query execution fails', async () => {
      const error = new Error('Query execution failed');
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        BondToken.getCouponAmountFor(getCouponForRequest),
      ).rejects.toThrow('Query execution failed');

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetCouponForRequest',
        getCouponForRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponAmountForQuery(
          getCouponForRequest.targetId,
          getCouponForRequest.securityId,
          getCouponForRequest.couponId,
        ),
      );
    });

    it('should throw error if targetId is invalid', async () => {
      getCouponForRequest = new GetCouponForRequest({
        ...GetCouponForRequestFixture.create(),
        targetId: 'invalid',
      });

      await expect(
        BondToken.getCouponAmountFor(getCouponForRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if securityId is invalid', async () => {
      getCouponForRequest = new GetCouponForRequest({
        ...GetCouponForRequestFixture.create(),
        securityId: 'invalid',
      });

      await expect(
        BondToken.getCouponAmountFor(getCouponForRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if couponId is invalid', async () => {
      getCouponForRequest = new GetCouponForRequest({
        ...GetCouponForRequestFixture.create(),
        couponId: 0,
      });

      await expect(
        BondToken.getCouponAmountFor(getCouponForRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getPrincipalFor', () => {
    beforeEach(() => {
      getPrincipalForRequest = new GetPrincipalForRequest(
        GetPrincipalForRequestFixture.create(),
      );
    });
    it('should get principal for successfully', async () => {
      const expectedResponse = {
        numerator: '10',
        denominator: '4',
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await BondToken.getPrincipalFor(getPrincipalForRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetPrincipalForRequest',
        getPrincipalForRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetPrincipalForQuery(
          getPrincipalForRequest.targetId,
          getPrincipalForRequest.securityId,
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          numerator: expectedResponse.numerator,
          denominator: expectedResponse.denominator,
        }),
      );
    });

    it('should throw an error if query execution fails', async () => {
      const error = new Error('Query execution failed');
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        BondToken.getPrincipalFor(getPrincipalForRequest),
      ).rejects.toThrow('Query execution failed');

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetPrincipalForRequest',
        getPrincipalForRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetPrincipalForQuery(
          getPrincipalForRequest.targetId,
          getPrincipalForRequest.securityId,
        ),
      );
    });

    it('should throw error if targetId is invalid', async () => {
      getPrincipalForRequest = new GetPrincipalForRequest({
        ...GetPrincipalForRequestFixture.create(),
        targetId: 'invalid',
      });

      await expect(
        BondToken.getPrincipalFor(getPrincipalForRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if securityId is invalid', async () => {
      getPrincipalForRequest = new GetPrincipalForRequest({
        ...GetPrincipalForRequestFixture.create(),
        securityId: 'invalid',
      });

      await expect(
        BondToken.getPrincipalFor(getPrincipalForRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getCoupon', () => {
    getCouponRequest = new GetCouponRequest(GetCouponRequestFixture.create());
    it('should get coupon successfully', async () => {
      const expectedResponse = {
        coupon: CouponFixture.create(),
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await BondToken.getCoupon(getCouponRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetCouponRequest',
        getCouponRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponQuery(
          getCouponRequest.securityId,
          getCouponRequest.couponId,
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          couponId: getCouponRequest.couponId,
          recordDate: new Date(
            expectedResponse.coupon.recordTimeStamp * ONE_THOUSAND,
          ),
          executionDate: new Date(
            expectedResponse.coupon.executionTimeStamp * ONE_THOUSAND,
          ),
          rate: expectedResponse.coupon.rate.toString(),
        }),
      );
    });

    it('should throw an error if query execution fails', async () => {
      const error = new Error('Query execution failed');
      queryBusMock.execute.mockRejectedValue(error);

      await expect(BondToken.getCoupon(getCouponRequest)).rejects.toThrow(
        'Query execution failed',
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetCouponRequest',
        getCouponRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponQuery(
          getCouponRequest.securityId,
          getCouponRequest.couponId,
        ),
      );
    });

    it('should throw error if securityId is invalid', async () => {
      getCouponRequest = new GetCouponRequest({
        ...GetCouponRequestFixture.create(),
        securityId: 'invalid',
      });

      await expect(BondToken.getCoupon(getCouponRequest)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw error if couponId is invalid', async () => {
      getCouponRequest = new GetCouponRequest({
        ...GetCouponRequestFixture.create(),
        couponId: 0,
      });

      await expect(BondToken.getCoupon(getCouponRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe('getAllCoupons', () => {
    getAllCouponsRequest = new GetAllCouponsRequest(
      GetAllCouponsRequestFixture.create(),
    );
    it('should get all coupon successfully', async () => {
      const expectedResponse = {
        payload: 1,
      };

      const expectedResponse2 = {
        coupon: CouponFixture.create(),
      };

      queryBusMock.execute
        .mockResolvedValueOnce(expectedResponse)
        .mockResolvedValueOnce(expectedResponse2);

      const result = await BondToken.getAllCoupons(getAllCouponsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetAllCouponsRequest',
        getAllCouponsRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(2);

      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        1,
        new GetCouponCountQuery(getAllCouponsRequest.securityId),
      );

      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        2,
        new GetCouponQuery(getAllCouponsRequest.securityId, 1),
      );

      expect(result).toEqual(
        expect.arrayContaining([
          {
            couponId: 1,
            recordDate: new Date(
              expectedResponse2.coupon.recordTimeStamp * ONE_THOUSAND,
            ),
            executionDate: new Date(
              expectedResponse2.coupon.executionTimeStamp * ONE_THOUSAND,
            ),
            rate: expectedResponse2.coupon.rate.toString(),
          },
        ]),
      );
    });

    it('should return empty array if count is 0', async () => {
      const expectedResponse = {
        payload: 0,
      };
      queryBusMock.execute.mockResolvedValueOnce(expectedResponse);

      const result = await BondToken.getAllCoupons(getAllCouponsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetAllCouponsRequest',
        getAllCouponsRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponCountQuery(getAllCouponsRequest.securityId),
      );

      expect(result).toStrictEqual([]);
    });

    it('should throw an error if query execution fails', async () => {
      const error = new Error('Query execution failed');
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        BondToken.getAllCoupons(getAllCouponsRequest),
      ).rejects.toThrow('Query execution failed');

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetAllCouponsRequest',
        getAllCouponsRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponCountQuery(getAllCouponsRequest.securityId),
      );
    });
  });

  describe('updateMaturityDate', () => {
    updateMaturityDateRequest = new UpdateMaturityDateRequest(
      UpdateMaturityDateRequestFixture.create(),
    );
    it('should update maturity date successfully', async () => {
      const expectedResponse = {
        payload: true,
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await BondToken.updateMaturityDate(
        updateMaturityDateRequest,
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'UpdateMaturityDateRequest',
        updateMaturityDateRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UpdateMaturityDateCommand(
          updateMaturityDateRequest.maturityDate,
          updateMaturityDateRequest.securityId,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error if command execution fails', async () => {
      const error = new Error('Command execution failed');
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        BondToken.updateMaturityDate(updateMaturityDateRequest),
      ).rejects.toThrow('Command execution failed');

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'UpdateMaturityDateRequest',
        updateMaturityDateRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UpdateMaturityDateCommand(
          updateMaturityDateRequest.maturityDate,
          updateMaturityDateRequest.securityId,
        ),
      );
    });

    it('should throw error if securityId is invalid', async () => {
      updateMaturityDateRequest = new UpdateMaturityDateRequest({
        ...UpdateMaturityDateRequestFixture.create(),
        securityId: 'invalid',
      });

      await expect(
        BondToken.updateMaturityDate(updateMaturityDateRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if maturityDate is invalid', async () => {
      updateMaturityDateRequest = new UpdateMaturityDateRequest({
        ...UpdateMaturityDateRequestFixture.create(),
        maturityDate: '-1',
      });

      await expect(
        BondToken.updateMaturityDate(updateMaturityDateRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('redeemAtMaturityByPartition', () => {
    redeemAtMaturityByPartitionRequest = new RedeemAtMaturityByPartitionRequest(
      RedeemAtMaturityByPartitionRequestFixture.create(),
    );
    it('should redeem at maturity by partition successfully', async () => {
      const expectedResponse = {
        payload: true,
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await BondToken.redeemAtMaturityByPartition(
        redeemAtMaturityByPartitionRequest,
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        RedeemAtMaturityByPartitionRequest.name,
        redeemAtMaturityByPartitionRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RedeemAtMaturityByPartitionCommand(
          redeemAtMaturityByPartitionRequest.securityId,
          redeemAtMaturityByPartitionRequest.partitionId,
          redeemAtMaturityByPartitionRequest.sourceId,
          redeemAtMaturityByPartitionRequest.amount,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error if command execution fails', async () => {
      const error = new Error('Command execution failed');
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        BondToken.redeemAtMaturityByPartition(
          redeemAtMaturityByPartitionRequest,
        ),
      ).rejects.toThrow('Command execution failed');

      expect(handleValidationSpy).toHaveBeenCalledWith(
        RedeemAtMaturityByPartitionRequest.name,
        redeemAtMaturityByPartitionRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RedeemAtMaturityByPartitionCommand(
          redeemAtMaturityByPartitionRequest.securityId,
          redeemAtMaturityByPartitionRequest.partitionId,
          redeemAtMaturityByPartitionRequest.sourceId,
          redeemAtMaturityByPartitionRequest.amount,
        ),
      );
    });

    it('should throw error if securityId is invalid', async () => {
      redeemAtMaturityByPartitionRequest =
        new RedeemAtMaturityByPartitionRequest({
          ...RedeemAtMaturityByPartitionRequestFixture.create(),
          securityId: 'invalid',
        });

      await expect(
        BondToken.redeemAtMaturityByPartition(
          redeemAtMaturityByPartitionRequest,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if partitionId is invalid', async () => {
      redeemAtMaturityByPartitionRequest =
        new RedeemAtMaturityByPartitionRequest({
          ...RedeemAtMaturityByPartitionRequestFixture.create(),
          partitionId: 'invalid',
        });

      await expect(
        BondToken.redeemAtMaturityByPartition(
          redeemAtMaturityByPartitionRequest,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if sourceId is invalid', async () => {
      redeemAtMaturityByPartitionRequest =
        new RedeemAtMaturityByPartitionRequest({
          ...RedeemAtMaturityByPartitionRequestFixture.create(),
          sourceId: 'invalid',
        });

      await expect(
        BondToken.redeemAtMaturityByPartition(
          redeemAtMaturityByPartitionRequest,
        ),
      ).rejects.toThrow(ValidationError);
    });
    it('should throw error if amount is invalid', async () => {
      redeemAtMaturityByPartitionRequest =
        new RedeemAtMaturityByPartitionRequest({
          ...RedeemAtMaturityByPartitionRequestFixture.create(),
          amount: 'invalid',
        });

      await expect(
        BondToken.redeemAtMaturityByPartition(
          redeemAtMaturityByPartitionRequest,
        ),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('fullRedeemAtMaturity', () => {
    fullRedeemAtMaturityRequest = new FullRedeemAtMaturityRequest(
      FullRedeemAtMaturityRequestFixture.create(),
    );
    it('should redeem at maturity successfully', async () => {
      const expectedResponse = {
        payload: true,
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await BondToken.fullRedeemAtMaturity(
        fullRedeemAtMaturityRequest,
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        FullRedeemAtMaturityRequest.name,
        fullRedeemAtMaturityRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new FullRedeemAtMaturityCommand(
          fullRedeemAtMaturityRequest.securityId,
          fullRedeemAtMaturityRequest.sourceId,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error if command execution fails', async () => {
      const error = new Error('Command execution failed');
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        BondToken.fullRedeemAtMaturity(
          fullRedeemAtMaturityRequest,
        ),
      ).rejects.toThrow('Command execution failed');

      expect(handleValidationSpy).toHaveBeenCalledWith(
        FullRedeemAtMaturityRequest.name,
        fullRedeemAtMaturityRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new FullRedeemAtMaturityCommand(
          fullRedeemAtMaturityRequest.securityId,
          fullRedeemAtMaturityRequest.sourceId,
        ),
      );
    });

    it('should throw error if securityId is invalid', async () => {
      fullRedeemAtMaturityRequest =
        new FullRedeemAtMaturityRequest({
          ...FullRedeemAtMaturityRequestFixture.create(),
          securityId: 'invalid',
        });

      await expect(
        BondToken.fullRedeemAtMaturity(
          fullRedeemAtMaturityRequest,
        ),
      ).rejects.toThrow(ValidationError);
    });


    it('should throw error if sourceId is invalid', async () => {
      fullRedeemAtMaturityRequest =
        new FullRedeemAtMaturityRequest({
          ...FullRedeemAtMaturityRequestFixture.create(),
          sourceId: 'invalid',
        });

      await expect(
        BondToken.fullRedeemAtMaturity(
          fullRedeemAtMaturityRequest,
        ),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getCouponHolders', () => {
    getCouponHoldersRequest = new GetCouponHoldersRequest(
      GetCouponHoldersQueryFixture.create(),
    );
    it('should get coupon holders successfully', async () => {
      const expectedResponse = {
        payload: [transactionId],
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await BondToken.getCouponHolders(getCouponHoldersRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetCouponHoldersRequest.name,
        getCouponHoldersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponHoldersQuery(
          getCouponHoldersRequest.securityId,
          getCouponHoldersRequest.couponId,
          getCouponHoldersRequest.start,
          getCouponHoldersRequest.end,
        ),
      );

      expect(result).toStrictEqual(expectedResponse.payload);
    });

    it('should throw an error if query execution fails', async () => {
      const error = new Error('Query execution failed');
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        BondToken.getCouponHolders(getCouponHoldersRequest),
      ).rejects.toThrow('Query execution failed');

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetCouponHoldersRequest.name,
        getCouponHoldersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetCouponHoldersQuery(
          getCouponHoldersRequest.securityId,
          getCouponHoldersRequest.couponId,
          getCouponHoldersRequest.start,
          getCouponHoldersRequest.end,
        ),
      );
    });

    it('should throw error if securityId is invalid', async () => {
      getCouponHoldersRequest = new GetCouponHoldersRequest({
        ...GetCouponHoldersQueryFixture.create(),
        securityId: 'invalid',
      });

      await expect(
        BondToken.getCouponHolders(getCouponHoldersRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if couponId is invalid', async () => {
      getCouponHoldersRequest = new GetCouponHoldersRequest({
        ...GetCouponHoldersQueryFixture.create(),
        couponId: -1,
      });

      await expect(
        BondToken.getCouponHolders(getCouponHoldersRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if start is invalid', async () => {
      getCouponHoldersRequest = new GetCouponHoldersRequest({
        ...GetCouponHoldersQueryFixture.create(),
        start: -1,
      });

      await expect(
        BondToken.getCouponHolders(getCouponHoldersRequest),
      ).rejects.toThrow(ValidationError);
    });
    it('should throw error if end is invalid', async () => {
      getCouponHoldersRequest = new GetCouponHoldersRequest({
        ...GetCouponHoldersQueryFixture.create(),
        end: -1,
      });

      await expect(
        BondToken.getCouponHolders(getCouponHoldersRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getTotalCouponHolders', () => {
    getTotalCouponHoldersRequest = new GetTotalCouponHoldersRequest(
      GetTotalCouponHoldersRequestFixture.create(),
    );
    it('should get total coupon holders successfully', async () => {
      const expectedResponse = {
        payload: 1,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await BondToken.getTotalCouponHolders(
        getTotalCouponHoldersRequest,
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetTotalCouponHoldersRequest.name,
        getTotalCouponHoldersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTotalCouponHoldersQuery(
          getTotalCouponHoldersRequest.securityId,
          getTotalCouponHoldersRequest.couponId,
        ),
      );

      expect(result).toEqual(expectedResponse.payload);
    });

    it('should throw an error if query execution fails', async () => {
      const error = new Error('Query execution failed');
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        BondToken.getTotalCouponHolders(getTotalCouponHoldersRequest),
      ).rejects.toThrow('Query execution failed');

      expect(handleValidationSpy).toHaveBeenCalledWith(
        GetTotalCouponHoldersRequest.name,
        getTotalCouponHoldersRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetTotalCouponHoldersQuery(
          getTotalCouponHoldersRequest.securityId,
          getTotalCouponHoldersRequest.couponId,
        ),
      );
    });

    it('should throw error if securityId is invalid', async () => {
      getTotalCouponHoldersRequest = new GetTotalCouponHoldersRequest({
        ...GetTotalCouponHoldersRequestFixture.create(),
        securityId: 'invalid',
      });

      await expect(
        BondToken.getTotalCouponHolders(getTotalCouponHoldersRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if couponId is invalid', async () => {
      getTotalCouponHoldersRequest = new GetTotalCouponHoldersRequest({
        ...GetTotalCouponHoldersRequestFixture.create(),
        couponId: -1,
      });

      await expect(
        BondToken.getTotalCouponHolders(getTotalCouponHoldersRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('createTrexSuite', () => {
    createTrexSuiteBondRequest = new CreateTrexSuiteBondRequest(
      CreateTrexSuiteBondRequestFixture.create(),
    );
    it('should create successfully', async () => {
      const expectedResponse = {
        securityId: new ContractId(HederaIdPropsFixture.create().value),
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);
      queryBusMock.execute.mockResolvedValue({
        security: security,
      });

      const result = await BondToken.createTrexSuite(
        createTrexSuiteBondRequest,
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'CreateTrexSuiteBondRequest',
        createTrexSuiteBondRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new CreateTrexSuiteBondCommand(
          createTrexSuiteBondRequest.salt,
          createTrexSuiteBondRequest.owner,
          createTrexSuiteBondRequest.irs,
          createTrexSuiteBondRequest.onchainId,
          createTrexSuiteBondRequest.irAgents,
          createTrexSuiteBondRequest.tokenAgents,
          createTrexSuiteBondRequest.compliancesModules,
          createTrexSuiteBondRequest.complianceSettings,
          createTrexSuiteBondRequest.claimTopics,
          createTrexSuiteBondRequest.issuers,
          createTrexSuiteBondRequest.issuerClaims,
          expect.objectContaining({
            name: createTrexSuiteBondRequest.name,
            symbol: createTrexSuiteBondRequest.symbol,
            isin: createTrexSuiteBondRequest.isin,
            decimals: createTrexSuiteBondRequest.decimals,
            isWhiteList: createTrexSuiteBondRequest.isWhiteList,
            isControllable: createTrexSuiteBondRequest.isControllable,
            arePartitionsProtected:
              createTrexSuiteBondRequest.arePartitionsProtected,
            clearingActive: createTrexSuiteBondRequest.clearingActive,
            internalKycActivated:
              createTrexSuiteBondRequest.internalKycActivated,
            isMultiPartition: createTrexSuiteBondRequest.isMultiPartition,
            maxSupply: BigDecimal.fromString(
              createTrexSuiteBondRequest.numberOfUnits,
            ),
            regulationType: CastRegulationType.fromNumber(
              createTrexSuiteBondRequest.regulationType,
            ),
            regulationsubType: CastRegulationSubType.fromNumber(
              createTrexSuiteBondRequest.regulationSubType,
            ),
            isCountryControlListWhiteList:
              createTrexSuiteBondRequest.isCountryControlListWhiteList,
            countries: createTrexSuiteBondRequest.countries,
            info: createTrexSuiteBondRequest.info,
          }),
          createTrexSuiteBondRequest.currency,
          createTrexSuiteBondRequest.nominalValue,
          createTrexSuiteBondRequest.nominalValueDecimals,
          createTrexSuiteBondRequest.startingDate,
          createTrexSuiteBondRequest.maturityDate,
          new ContractId(factoryAddress),
          new ContractId(resolverAddress),
          createTrexSuiteBondRequest.configId,
          createTrexSuiteBondRequest.configVersion,
          createTrexSuiteBondRequest.diamondOwnerAccount,
          createTrexSuiteBondRequest.proceedRecipientsIds,
          createTrexSuiteBondRequest.proceedRecipientsData,
          createTrexSuiteBondRequest.externalPauses,
          createTrexSuiteBondRequest.externalControlLists,
          createTrexSuiteBondRequest.externalKycLists,
          createTrexSuiteBondRequest.complianceId,
          createTrexSuiteBondRequest.identityRegistryId,
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          security: security,
          transactionId: expectedResponse.transactionId,
        }),
      );
    });

    it('should throw an error if command execution fails', async () => {
      const error = new Error('Command execution failed');
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        BondToken.createTrexSuite(createTrexSuiteBondRequest),
      ).rejects.toThrow('Command execution failed');

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'CreateTrexSuiteBondRequest',
        createTrexSuiteBondRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new CreateTrexSuiteBondCommand(
          createTrexSuiteBondRequest.salt,
          createTrexSuiteBondRequest.owner,
          createTrexSuiteBondRequest.irs,
          createTrexSuiteBondRequest.onchainId,
          createTrexSuiteBondRequest.irAgents,
          createTrexSuiteBondRequest.tokenAgents,
          createTrexSuiteBondRequest.compliancesModules,
          createTrexSuiteBondRequest.complianceSettings,
          createTrexSuiteBondRequest.claimTopics,
          createTrexSuiteBondRequest.issuers,
          createTrexSuiteBondRequest.issuerClaims,
          expect.objectContaining({
            name: createTrexSuiteBondRequest.name,
            symbol: createTrexSuiteBondRequest.symbol,
            isin: createTrexSuiteBondRequest.isin,
            decimals: createTrexSuiteBondRequest.decimals,
            isWhiteList: createTrexSuiteBondRequest.isWhiteList,
            isControllable: createTrexSuiteBondRequest.isControllable,
            arePartitionsProtected:
              createTrexSuiteBondRequest.arePartitionsProtected,
            clearingActive: createTrexSuiteBondRequest.clearingActive,
            internalKycActivated:
              createTrexSuiteBondRequest.internalKycActivated,
            isMultiPartition: createTrexSuiteBondRequest.isMultiPartition,
            maxSupply: BigDecimal.fromString(
              createTrexSuiteBondRequest.numberOfUnits,
            ),
            regulationType: CastRegulationType.fromNumber(
              createTrexSuiteBondRequest.regulationType,
            ),
            regulationsubType: CastRegulationSubType.fromNumber(
              createTrexSuiteBondRequest.regulationSubType,
            ),
            isCountryControlListWhiteList:
              createTrexSuiteBondRequest.isCountryControlListWhiteList,
            countries: createTrexSuiteBondRequest.countries,
            info: createTrexSuiteBondRequest.info,
          }),
          createTrexSuiteBondRequest.currency,
          createTrexSuiteBondRequest.nominalValue,
          createTrexSuiteBondRequest.nominalValueDecimals,
          createTrexSuiteBondRequest.startingDate,
          createTrexSuiteBondRequest.maturityDate,
          new ContractId(factoryAddress),
          new ContractId(resolverAddress),
          createTrexSuiteBondRequest.configId,
          createTrexSuiteBondRequest.configVersion,
          createTrexSuiteBondRequest.diamondOwnerAccount,
          createTrexSuiteBondRequest.proceedRecipientsIds,
          createTrexSuiteBondRequest.proceedRecipientsData,
          createTrexSuiteBondRequest.externalPauses,
          createTrexSuiteBondRequest.externalControlLists,
          createTrexSuiteBondRequest.externalKycLists,
          createTrexSuiteBondRequest.complianceId,
          createTrexSuiteBondRequest.identityRegistryId,
        ),
      );
    });

    it('should throw error if name is invalid', async () => {
      createTrexSuiteBondRequest = new CreateTrexSuiteBondRequest(
        CreateTrexSuiteBondRequestFixture.create({ name: '' }),
      );

      await expect(
        BondToken.createTrexSuite(createTrexSuiteBondRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if symbol is invalid', async () => {
      createTrexSuiteBondRequest = new CreateTrexSuiteBondRequest(
        CreateTrexSuiteBondRequestFixture.create({
          symbol: '',
        }),
      );

      await expect(
        BondToken.createTrexSuite(createTrexSuiteBondRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if isin is invalid', async () => {
      createTrexSuiteBondRequest = new CreateTrexSuiteBondRequest(
        CreateTrexSuiteBondRequestFixture.create({
          isin: '',
        }),
      );

      await expect(
        BondToken.createTrexSuite(createTrexSuiteBondRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if decimals is invalid', async () => {
      createTrexSuiteBondRequest = new CreateTrexSuiteBondRequest(
        CreateTrexSuiteBondRequestFixture.create({
          decimals: 2.85,
        }),
      );

      await expect(
        BondToken.createTrexSuite(createTrexSuiteBondRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if diamondOwnerAccount is invalid', async () => {
      createTrexSuiteBondRequest = new CreateTrexSuiteBondRequest(
        CreateTrexSuiteBondRequestFixture.create({
          diamondOwnerAccount: 'invalid',
        }),
      );

      await expect(
        BondToken.createTrexSuite(createTrexSuiteBondRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if currency is invalid', async () => {
      createTrexSuiteBondRequest = new CreateTrexSuiteBondRequest(
        CreateTrexSuiteBondRequestFixture.create({
          currency: 'invalid',
        }),
      );

      await expect(
        BondToken.createTrexSuite(createTrexSuiteBondRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if numberOfUnits is invalid', async () => {
      createTrexSuiteBondRequest = new CreateTrexSuiteBondRequest(
        CreateTrexSuiteBondRequestFixture.create({
          numberOfUnits: 'invalid',
        }),
      );

      await expect(
        BondToken.createTrexSuite(createTrexSuiteBondRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if nominalValue is invalid', async () => {
      createTrexSuiteBondRequest = new CreateTrexSuiteBondRequest(
        CreateTrexSuiteBondRequestFixture.create({
          nominalValue: 'invalid',
        }),
      );

      await expect(
        BondToken.createTrexSuite(createTrexSuiteBondRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if startingDate is invalid', async () => {
      const time = Math.floor(faker.date.past().getTime() / 1000);
      createTrexSuiteBondRequest = new CreateTrexSuiteBondRequest(
        CreateTrexSuiteBondRequestFixture.create({
          startingDate: time.toString(),
          maturityDate: (time + 10).toString(),
        }),
      );

      await expect(
        BondToken.createTrexSuite(createTrexSuiteBondRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if maturityDate is invalid', async () => {
      createTrexSuiteBondRequest = new CreateTrexSuiteBondRequest(
        CreateTrexSuiteBondRequestFixture.create({
          maturityDate: Math.floor(
            faker.date.past().getTime() / 1000,
          ).toString(),
        }),
      );

      await expect(
        BondToken.createTrexSuite(createTrexSuiteBondRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if regulationSubType is invalid', async () => {
      createTrexSuiteBondRequest = new CreateTrexSuiteBondRequest(
        CreateTrexSuiteBondRequestFixture.create({
          regulationSubType: 5,
        }),
      );

      await expect(
        BondToken.createTrexSuite(createTrexSuiteBondRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if configId is invalid', async () => {
      createTrexSuiteBondRequest = new CreateTrexSuiteBondRequest(
        CreateTrexSuiteBondRequestFixture.create({
          configId: 'invalid',
        }),
      );

      await expect(
        BondToken.createTrexSuite(createTrexSuiteBondRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if externalPauses is invalid', async () => {
      createTrexSuiteBondRequest = new CreateTrexSuiteBondRequest(
        CreateTrexSuiteBondRequestFixture.create({
          externalPauses: ['invalid'],
        }),
      );

      await expect(
        BondToken.createTrexSuite(createTrexSuiteBondRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if externalControlLists is invalid', async () => {
      createTrexSuiteBondRequest = new CreateTrexSuiteBondRequest(
        CreateTrexSuiteBondRequestFixture.create({
          externalControlLists: ['invalid'],
        }),
      );

      await expect(
        BondToken.createTrexSuite(createTrexSuiteBondRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if externalKycLists is invalid', async () => {
      createTrexSuiteBondRequest = new CreateTrexSuiteBondRequest(
        CreateTrexSuiteBondRequestFixture.create({
          externalKycLists: ['invalid'],
        }),
      );

      await expect(
        BondToken.createTrexSuite(createTrexSuiteBondRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('AddProceedRecipientRequest', () => {
    const addProceedRecipientRequest = new AddProceedRecipientRequest(
      AddProceedRecipientRequestFixture.create(),
    );
    it('should add proceed recipient successfully', async () => {
      const expectedResponse = {
        payload: true,
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await BondToken.addProceedRecipient(
        addProceedRecipientRequest,
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'AddProceedRecipientRequest',
        addProceedRecipientRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new AddProceedRecipientCommand(
          addProceedRecipientRequest.securityId,
          addProceedRecipientRequest.proceedRecipientId,
          addProceedRecipientRequest.data,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error if command execution fails', async () => {
      const error = new Error('Command execution failed');
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        BondToken.addProceedRecipient(addProceedRecipientRequest),
      ).rejects.toThrow('Command execution failed');

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'AddProceedRecipientRequest',
        addProceedRecipientRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new AddProceedRecipientCommand(
          addProceedRecipientRequest.securityId,
          addProceedRecipientRequest.proceedRecipientId,
          addProceedRecipientRequest.data,
        ),
      );
    });

    it('should throw error if securityId is invalid', async () => {
      let addProceedRecipientRequest = new AddProceedRecipientRequest({
        ...AddProceedRecipientRequestFixture.create(),
        securityId: 'invalid',
      });

      await expect(
        BondToken.addProceedRecipient(addProceedRecipientRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if data is invalid', async () => {
      let addProceedRecipientRequest = new AddProceedRecipientRequest({
        ...AddProceedRecipientRequestFixture.create(),
        data: 'invalid',
      });

      await expect(
        BondToken.addProceedRecipient(addProceedRecipientRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if proceedRecipientId is invalid', async () => {
      let addProceedRecipientRequest = new AddProceedRecipientRequest({
        ...AddProceedRecipientRequestFixture.create(),
        proceedRecipientId: 'invalid',
      });

      await expect(
        BondToken.addProceedRecipient(addProceedRecipientRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('RemoveProceedRecipientRequest', () => {
    const removeProceedRecipientRequest = new RemoveProceedRecipientRequest(
      RemoveProceedRecipientRequestFixture.create(),
    );
    it('should remove proceed recipient successfully', async () => {
      const expectedResponse = {
        payload: true,
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await BondToken.removeProceedRecipient(
        removeProceedRecipientRequest,
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'RemoveProceedRecipientRequest',
        removeProceedRecipientRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RemoveProceedRecipientCommand(
          removeProceedRecipientRequest.securityId,
          removeProceedRecipientRequest.proceedRecipientId,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error if command execution fails', async () => {
      const error = new Error('Command execution failed');
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        BondToken.removeProceedRecipient(removeProceedRecipientRequest),
      ).rejects.toThrow('Command execution failed');

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'RemoveProceedRecipientRequest',
        removeProceedRecipientRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new RemoveProceedRecipientCommand(
          removeProceedRecipientRequest.securityId,
          removeProceedRecipientRequest.proceedRecipientId,
        ),
      );
    });

    it('should throw error if securityId is invalid', async () => {
      let removeProceedRecipientRequest = new RemoveProceedRecipientRequest({
        ...RemoveProceedRecipientRequestFixture.create(),
        securityId: 'invalid',
      });

      await expect(
        BondToken.removeProceedRecipient(removeProceedRecipientRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if proceedRecipientId is invalid', async () => {
      let removeProceedRecipientRequest = new RemoveProceedRecipientRequest({
        ...RemoveProceedRecipientRequestFixture.create(),
        proceedRecipientId: 'invalid',
      });

      await expect(
        BondToken.removeProceedRecipient(removeProceedRecipientRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('UpdateProceedRecipientDataRequest', () => {
    const updateProceedRecipientDataRequest =
      new UpdateProceedRecipientDataRequest(
        UpdateProceedRecipientDataRequestFixture.create(),
      );
    it('should update proceed recipient data successfully', async () => {
      const expectedResponse = {
        payload: true,
        transactionId: transactionId,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await BondToken.updateProceedRecipientData(
        updateProceedRecipientDataRequest,
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'UpdateProceedRecipientDataRequest',
        updateProceedRecipientDataRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledTimes(1);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UpdateProceedRecipientDataCommand(
          updateProceedRecipientDataRequest.securityId,
          updateProceedRecipientDataRequest.proceedRecipientId,
          updateProceedRecipientDataRequest.data,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error if command execution fails', async () => {
      const error = new Error('Command execution failed');
      commandBusMock.execute.mockRejectedValue(error);

      await expect(
        BondToken.updateProceedRecipientData(updateProceedRecipientDataRequest),
      ).rejects.toThrow('Command execution failed');

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'UpdateProceedRecipientDataRequest',
        updateProceedRecipientDataRequest,
      );

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UpdateProceedRecipientDataCommand(
          updateProceedRecipientDataRequest.securityId,
          updateProceedRecipientDataRequest.proceedRecipientId,
          updateProceedRecipientDataRequest.data,
        ),
      );
    });

    it('should throw error if securityId is invalid', async () => {
      let updateProceedRecipientDataRequest =
        new UpdateProceedRecipientDataRequest({
          ...UpdateProceedRecipientDataRequestFixture.create(),
          securityId: 'invalid',
        });

      await expect(
        BondToken.updateProceedRecipientData(updateProceedRecipientDataRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if data is invalid', async () => {
      let updateProceedRecipientDataRequest =
        new UpdateProceedRecipientDataRequest({
          ...UpdateProceedRecipientDataRequestFixture.create(),
          data: 'invalid',
        });

      await expect(
        BondToken.updateProceedRecipientData(updateProceedRecipientDataRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if proceedRecipientId is invalid', async () => {
      let updateProceedRecipientDataRequest =
        new UpdateProceedRecipientDataRequest({
          ...UpdateProceedRecipientDataRequestFixture.create(),
          proceedRecipientId: 'invalid',
        });

      await expect(
        BondToken.updateProceedRecipientData(updateProceedRecipientDataRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('IsProceedRecipientRequest', () => {
    const isProceedRecipientRequest = new IsProceedRecipientRequest(
      IsProceedRecipientRequestFixture.create(),
    );
    it('should get isProceedRecipient successfully', async () => {
      const expectedResponse = {
        payload: true,
        transactionId: transactionId,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await BondToken.isProceedRecipient(
        isProceedRecipientRequest,
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'IsProceedRecipientRequest',
        isProceedRecipientRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsProceedRecipientQuery(
          isProceedRecipientRequest.securityId,
          isProceedRecipientRequest.proceedRecipientId,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error if query execution fails', async () => {
      const error = new Error('Query execution failed');
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        BondToken.isProceedRecipient(isProceedRecipientRequest),
      ).rejects.toThrow('Query execution failed');

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'IsProceedRecipientRequest',
        isProceedRecipientRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsProceedRecipientQuery(
          isProceedRecipientRequest.securityId,
          isProceedRecipientRequest.proceedRecipientId,
        ),
      );
    });

    it('should throw error if securityId is invalid', async () => {
      let isProceedRecipientRequest = new IsProceedRecipientRequest({
        ...AddProceedRecipientRequestFixture.create(),
        securityId: 'invalid',
      });

      await expect(
        BondToken.isProceedRecipient(isProceedRecipientRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if proceedRecipientId is invalid', async () => {
      let isProceedRecipientRequest = new IsProceedRecipientRequest({
        ...AddProceedRecipientRequestFixture.create(),
        proceedRecipientId: 'invalid',
      });

      await expect(
        BondToken.isProceedRecipient(isProceedRecipientRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('GetProceedRecipientsCountRequest', () => {
    const getProceedRecipientsCountRequest =
      new GetProceedRecipientsCountRequest(
        GetProceedRecipientsCountRequestFixture.create(),
      );
    it('should get proceedRecipients count successfully', async () => {
      const expectedResponse = {
        payload: true,
        transactionId: transactionId,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await BondToken.getProceedRecipientsCount(
        getProceedRecipientsCountRequest,
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetProceedRecipientsCountRequest',
        getProceedRecipientsCountRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetProceedRecipientsCountQuery(
          getProceedRecipientsCountRequest.securityId,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error if query execution fails', async () => {
      const error = new Error('Query execution failed');
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        BondToken.getProceedRecipientsCount(getProceedRecipientsCountRequest),
      ).rejects.toThrow('Query execution failed');

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetProceedRecipientsCountRequest',
        getProceedRecipientsCountRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetProceedRecipientsCountQuery(
          getProceedRecipientsCountRequest.securityId,
        ),
      );
    });

    it('should throw error if securityId is invalid', async () => {
      let getProceedRecipientsCountRequest =
        new GetProceedRecipientsCountRequest({
          ...AddProceedRecipientRequestFixture.create(),
          securityId: 'invalid',
        });

      await expect(
        BondToken.getProceedRecipientsCount(getProceedRecipientsCountRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('GetProceedRecipientDataRequest', () => {
    const getProceedRecipientDataRequest = new GetProceedRecipientDataRequest(
      GetProceedRecipientDataRequestFixture.create(),
    );
    it('should get proceed recipient data successfully', async () => {
      const expectedResponse = {
        payload: true,
        transactionId: transactionId,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await BondToken.getProceedRecipientData(
        getProceedRecipientDataRequest,
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetProceedRecipientDataRequest',
        getProceedRecipientDataRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetProceedRecipientDataQuery(
          getProceedRecipientDataRequest.securityId,
          getProceedRecipientDataRequest.proceedRecipientId,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error if query execution fails', async () => {
      const error = new Error('Query execution failed');
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        BondToken.getProceedRecipientData(getProceedRecipientDataRequest),
      ).rejects.toThrow('Query execution failed');

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetProceedRecipientDataRequest',
        getProceedRecipientDataRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetProceedRecipientDataQuery(
          getProceedRecipientDataRequest.securityId,
          getProceedRecipientDataRequest.proceedRecipientId,
        ),
      );
    });

    it('should throw error if securityId is invalid', async () => {
      let isProceedRecipientRequest = new GetProceedRecipientDataRequest({
        ...AddProceedRecipientRequestFixture.create(),
        securityId: 'invalid',
      });

      await expect(
        BondToken.isProceedRecipient(isProceedRecipientRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if proceedRecipientId is invalid', async () => {
      let isProceedRecipientRequest = new GetProceedRecipientDataRequest({
        ...AddProceedRecipientRequestFixture.create(),
        proceedRecipientId: 'invalid',
      });

      await expect(
        BondToken.isProceedRecipient(isProceedRecipientRequest),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('GetProceedRecipientsRequest', () => {
    const getProceedRecipientsRequest = new GetProceedRecipientsRequest(
      GetProceedRecipientsRequestFixture.create(),
    );
    it('should get proceedRecipients successfully', async () => {
      const expectedResponse = {
        payload: true,
        transactionId: transactionId,
      };

      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await BondToken.getProceedRecipients(
        getProceedRecipientsRequest,
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetProceedRecipientsRequest',
        getProceedRecipientsRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetProceedRecipientsQuery(
          getProceedRecipientsRequest.securityId,
          getProceedRecipientsRequest.pageIndex,
          getProceedRecipientsRequest.pageSize,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error if query execution fails', async () => {
      const error = new Error('Query execution failed');
      queryBusMock.execute.mockRejectedValue(error);

      await expect(
        BondToken.getProceedRecipients(getProceedRecipientsRequest),
      ).rejects.toThrow('Query execution failed');

      expect(handleValidationSpy).toHaveBeenCalledWith(
        'GetProceedRecipientsRequest',
        getProceedRecipientsRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetProceedRecipientsQuery(
          getProceedRecipientsRequest.securityId,
          getProceedRecipientsRequest.pageIndex,
          getProceedRecipientsRequest.pageSize,
        ),
      );
    });

    it('should throw error if securityId is invalid', async () => {
      let getProceedRecipientsRequest = new GetProceedRecipientsRequest({
        ...GetProceedRecipientsRequestFixture.create(),
        securityId: 'invalid',
      });

      await expect(
        BondToken.getProceedRecipients(getProceedRecipientsRequest),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw error if page size is invalid', async () => {
      let getProceedRecipientsRequest = new GetProceedRecipientsRequest({
        ...GetProceedRecipientsRequestFixture.create(),
        pageSize: -1,
      });

      await expect(
        BondToken.getProceedRecipients(getProceedRecipientsRequest),
      ).rejects.toThrow(ValidationError);
    });
  });
});
