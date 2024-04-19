import { SetDividendsCommand } from '../../app/usecase/command/equity/dividends/set/SetDividendsCommand.js';
import { GetDividendsQuery } from '../../app/usecase/query/equity/dividends/getDividends/GetDividendsQuery.js';
import { GetDividendsCountQuery } from '../../app/usecase/query/equity/dividends/getDividendsCount/GetDividendsCountQuery.js';
import { GetDividendsForQuery } from '../../app/usecase/query/equity/dividends/getDividendsFor/GetDividendsForQuery.js';
import { SetVotingRightsCommand } from '../../app/usecase/command/equity/votingRights/set/SetVotingRightsCommand.js';
import { GetVotingQuery } from '../../app/usecase/query/equity/votingRights/getVoting/GetVotingQuery.js';
import { GetVotingCountQuery } from '../../app/usecase/query/equity/votingRights/getVotingCount/GetVotingCountQuery.js';
import { GetVotingForQuery } from '../../app/usecase/query/equity/votingRights/getVotingFor/GetVotingForQuery.js';
import Injectable from '../../core/Injectable.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import { LogError } from '../../core/decorator/LogErrorDecorator.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { ONE_THOUSAND } from '../../domain/context/shared/SecurityDate.js';
import { handleValidation } from './Common.js';
import GetDividendsForRequest from './request/GetDividendsForRequest.js';
import GetDividendsRequest from './request/GetDividendsRequest.js';
import GetAllDividendsRequest from './request/GetAllDividendsRequest.js';
import SetDividendsRequest from './request/SetDividendsRequest.js';
import DividendsForViewModel from './response/DividendsForViewModel.js';
import DividendsViewModel from './response/DividendsViewModel.js';
import SetVotingRightsRequest from './request/SetVotingRightsRequest.js';
import GetVotingRightsForRequest from './request/GetVotingRightsForRequest.js';
import GetVotingRightsRequest from './request/GetVotingRightsRequest.js';
import GetAllVotingRightsRequest from './request/GetAllVotingRightsRequest.js';
import VotingRightsForViewModel from './response/VotingRightsForViewModel.js';
import VotingRightsViewModel from './response/VotingRightsViewModel.js';
import CreateEquityRequest from './request/CreateEquityRequest.js';
import { SecurityViewModel } from './Security.js';
import NetworkService from '../../app/service/NetworkService.js';
import { SecurityProps } from '../../domain/context/security/Security.js';
import { CreateEquityCommand } from '../../app/usecase/command/equity/create/CreateEquityCommand.js';
import ContractId from '../../domain/context/contract/ContractId.js';
import { GetSecurityQuery } from '../../app/usecase/query/security/get/GetSecurityQuery.js';
import { CastDividendType } from '../../domain/context/equity/DividendType.js';
import BigDecimal from '../../domain/context/shared/BigDecimal.js';
import GetEquityDetailsRequest from './request/GetEquityDetailsRequest.js';
import EquityDetailsViewModel from './response/EquityDetailsViewModel.js';
import { GetEquityDetailsQuery } from '../../app/usecase/query/equity/get/getEquityDetails/GetEquityDetailsQuery.js';
import {
  CastRegulationSubType,
  CastRegulationType,
} from '../../domain/context/factory/RegulationType.js';

interface IEquityInPort {
  create(request: CreateEquityRequest): Promise<{
    security: SecurityViewModel;
  }>;
  getEquityDetails(
    request: GetEquityDetailsRequest,
  ): Promise<EquityDetailsViewModel>;
  setDividends(request: SetDividendsRequest): Promise<number>;
  getDividendsFor(
    request: GetDividendsForRequest,
  ): Promise<DividendsForViewModel>;
  getDividends(request: GetDividendsRequest): Promise<DividendsViewModel>;
  getAllDividends(
    request: GetAllDividendsRequest,
  ): Promise<DividendsViewModel[]>;
  setVotingRights(request: SetVotingRightsRequest): Promise<number>;
  getVotingRightsFor(
    request: GetVotingRightsForRequest,
  ): Promise<VotingRightsForViewModel>;
  getVotingRights(
    request: GetVotingRightsRequest,
  ): Promise<VotingRightsViewModel>;
  getAllVotingRights(
    request: GetAllVotingRightsRequest,
  ): Promise<VotingRightsViewModel[]>;
}

class EquityInPort implements IEquityInPort {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
    private readonly networkService: NetworkService = Injectable.resolve(
      NetworkService,
    ),
  ) {}

  @LogError
  async create(
    req: CreateEquityRequest,
  ): Promise<{ security: SecurityViewModel }> {
    handleValidation('CreateEquityRequest', req);
    const { diamondOwnerAccount } = req;

    const securityFactory = this.networkService.configuration.factoryAddress;
    const resolver = this.networkService.configuration.resolverAddress;
    const businessLogicKeysCommon =
      this.networkService.configuration.businessLogicKeysCommon;
    const businessLogicKeysEquity =
      this.networkService.configuration.businessLogicKeysEquity;
    const businessLogicKeys = businessLogicKeysCommon.concat(
      businessLogicKeysEquity,
    );

    const newSecurity: SecurityProps = {
      name: req.name,
      symbol: req.symbol,
      isin: req.isin,
      decimals: req.decimals,
      isWhiteList: req.isWhiteList,
      isControllable: req.isControllable,
      isMultiPartition: req.isMultiPartition,
      maxSupply: BigDecimal.fromString(req.numberOfShares),
      regulationType: CastRegulationType.fromNumber(req.regulationType),
      regulationsubType: CastRegulationSubType.fromNumber(
        req.regulationSubType,
      ),
      isCountryControlListWhiteList: req.isCountryControlListWhiteList,
      countries: req.countries,
      info: req.info,
    };

    const createResponse = await this.commandBus.execute(
      new CreateEquityCommand(
        newSecurity,
        req.votingRight,
        req.informationRight,
        req.liquidationRight,
        req.subscriptionRight,
        req.convertionRight,
        req.redemptionRight,
        req.putRight,
        CastDividendType.fromNumber(req.dividendRight),
        req.currency,
        req.nominalValue,
        securityFactory ? new ContractId(securityFactory) : undefined,
        resolver ? new ContractId(resolver) : undefined,
        businessLogicKeys ? businessLogicKeys : [],
        diamondOwnerAccount,
      ),
    );

    const securityCreated =
      createResponse.securityId.toString() !== ContractId.NULL.toString();

    const res = securityCreated
      ? (
          await this.queryBus.execute(
            new GetSecurityQuery(createResponse.securityId.toString()),
          )
        ).security
      : {};

    return {
      security: securityCreated
        ? {
            ...res,
          }
        : {},
    };
  }

  @LogError
  async getEquityDetails(
    request: GetEquityDetailsRequest,
  ): Promise<EquityDetailsViewModel> {
    handleValidation('GetEquityDetailsRequest', request);

    const res = await this.queryBus.execute(
      new GetEquityDetailsQuery(request.equityId),
    );

    const equityDetails: EquityDetailsViewModel = {
      votingRight: res.equity.votingRight,
      informationRight: res.equity.informationRight,
      liquidationRight: res.equity.liquidationRight,
      subscriptionRight: res.equity.subscriptionRight,
      convertionRight: res.equity.convertionRight,
      redemptionRight: res.equity.redemptionRight,
      putRight: res.equity.putRight,
      dividendRight: CastDividendType.toNumber(res.equity.dividendRight),
      currency: res.equity.currency,
      nominalValue: res.equity.nominalValue.toString(),
    };

    return equityDetails;
  }

  @LogError
  async setVotingRights(request: SetVotingRightsRequest): Promise<number> {
    const { recordTimestamp, securityId, data } = request;
    handleValidation('SetVotingRightsRequest', request);

    return (
      await this.commandBus.execute(
        new SetVotingRightsCommand(securityId, recordTimestamp, data),
      )
    ).payload;
  }

  @LogError
  async getVotingRightsFor(
    request: GetVotingRightsForRequest,
  ): Promise<VotingRightsForViewModel> {
    handleValidation('GetVotingRightsForRequest', request);

    const res = await this.queryBus.execute(
      new GetVotingForQuery(
        request.targetId,
        request.securityId,
        request.votingId,
      ),
    );

    const votingFor: VotingRightsForViewModel = {
      value: res.payload.toString(),
    };

    return votingFor;
  }

  @LogError
  async getVotingRights(
    request: GetVotingRightsRequest,
  ): Promise<VotingRightsViewModel> {
    handleValidation('GetVotingRightsRequest', request);

    const res = await this.queryBus.execute(
      new GetVotingQuery(request.securityId, request.votingId),
    );

    const votingRight: VotingRightsViewModel = {
      votingId: request.votingId,
      recordDate: new Date(res.voting.recordTimeStamp * ONE_THOUSAND),
      data: res.voting.data,
    };

    return votingRight;
  }

  @LogError
  async getAllVotingRights(
    request: GetAllVotingRightsRequest,
  ): Promise<VotingRightsViewModel[]> {
    handleValidation('GetAllVotingRightsRequest', request);

    const count = await this.queryBus.execute(
      new GetVotingCountQuery(request.securityId),
    );

    if (count.payload == 0) return [];

    const votingRights: VotingRightsViewModel[] = [];

    for (let i = 1; i <= count.payload; i++) {
      const res = await this.queryBus.execute(
        new GetVotingQuery(request.securityId, i),
      );

      const votingright: VotingRightsViewModel = {
        votingId: i,
        recordDate: new Date(res.voting.recordTimeStamp * ONE_THOUSAND),
        data: res.voting.data,
      };

      votingRights.push(votingright);
    }

    return votingRights;
  }

  @LogError
  async setDividends(request: SetDividendsRequest): Promise<number> {
    const {
      amountPerUnitOfSecurity,
      recordTimestamp,
      executionTimestamp,
      securityId,
    } = request;
    handleValidation('SetDividendsRequest', request);

    return (
      await this.commandBus.execute(
        new SetDividendsCommand(
          securityId,
          recordTimestamp,
          executionTimestamp,
          amountPerUnitOfSecurity,
        ),
      )
    ).payload;
  }

  @LogError
  async getDividendsFor(
    request: GetDividendsForRequest,
  ): Promise<DividendsForViewModel> {
    handleValidation('GetDividendsForRequest', request);

    const res = await this.queryBus.execute(
      new GetDividendsForQuery(
        request.targetId,
        request.securityId,
        request.dividendId,
      ),
    );

    const dividendsFor: DividendsForViewModel = {
      value: res.payload.toString(),
    };

    return dividendsFor;
  }

  @LogError
  async getDividends(
    request: GetDividendsRequest,
  ): Promise<DividendsViewModel> {
    handleValidation('GetDividendsRequest', request);

    const res = await this.queryBus.execute(
      new GetDividendsQuery(request.securityId, request.dividendId),
    );

    const dividend: DividendsViewModel = {
      dividendId: request.dividendId,
      amountPerUnitOfSecurity: res.dividend.amountPerUnitOfSecurity.toString(),
      recordDate: new Date(res.dividend.recordTimeStamp * ONE_THOUSAND),
      executionDate: new Date(res.dividend.executionTimeStamp * ONE_THOUSAND),
    };

    return dividend;
  }

  @LogError
  async getAllDividends(
    request: GetAllDividendsRequest,
  ): Promise<DividendsViewModel[]> {
    handleValidation('GetAllDividendsRequest', request);

    const count = await this.queryBus.execute(
      new GetDividendsCountQuery(request.securityId),
    );

    if (count.payload == 0) return [];

    const dividends: DividendsViewModel[] = [];

    for (let i = 1; i <= count.payload; i++) {
      const res = await this.queryBus.execute(
        new GetDividendsQuery(request.securityId, i),
      );

      const dividend: DividendsViewModel = {
        dividendId: i,
        amountPerUnitOfSecurity:
          res.dividend.amountPerUnitOfSecurity.toString(),
        recordDate: new Date(res.dividend.recordTimeStamp * ONE_THOUSAND),
        executionDate: new Date(res.dividend.executionTimeStamp * ONE_THOUSAND),
      };

      dividends.push(dividend);
    }

    return dividends;
  }
}

const EquityToken = new EquityInPort();
export default EquityToken;
