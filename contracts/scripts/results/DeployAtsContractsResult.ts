import { Signer } from 'ethers'
import {
    BusinessLogicResolver,
    AccessControl,
    AdjustBalances,
    BondUSA,
    Cap,
    ControlList,
    CorporateActionsSecurity,
    DiamondFacet,
    EquityUSA,
    ERC1410ScheduledTasks,
    ERC1594,
    ERC1643,
    ERC1644,
    ERC20,
    Pause,
    ScheduledBalanceAdjustments,
    ScheduledSnapshots,
    ScheduledTasks,
    Snapshots,
    TransferAndLock,
    Lock,
} from '../../typechain-types'
import { DeployContractWithFactoryResult } from '../index'

export interface DeployAtsContractsResultParams {
    businessLogicResolver: DeployContractWithFactoryResult<BusinessLogicResolver>
    accessControl: DeployContractWithFactoryResult<AccessControl>
    cap: DeployContractWithFactoryResult<Cap>
    controlList: DeployContractWithFactoryResult<ControlList>
    pause: DeployContractWithFactoryResult<Pause>
    erc20: DeployContractWithFactoryResult<ERC20>
    erc1410ScheduledTasks: DeployContractWithFactoryResult<ERC1410ScheduledTasks>
    erc1594: DeployContractWithFactoryResult<ERC1594>
    erc1643: DeployContractWithFactoryResult<ERC1643>
    erc1644: DeployContractWithFactoryResult<ERC1644>
    diamondFacet: DeployContractWithFactoryResult<DiamondFacet>
    equityUsa: DeployContractWithFactoryResult<EquityUSA>
    bondUsa: DeployContractWithFactoryResult<BondUSA>
    scheduledSnapshots: DeployContractWithFactoryResult<ScheduledSnapshots>
    scheduledBalanceAdjustments: DeployContractWithFactoryResult<ScheduledBalanceAdjustments>
    scheduledTasks: DeployContractWithFactoryResult<ScheduledTasks>
    snapshots: DeployContractWithFactoryResult<Snapshots>
    corporateActionsSecurity: DeployContractWithFactoryResult<CorporateActionsSecurity>
    transferAndLock: DeployContractWithFactoryResult<TransferAndLock>
    lock: DeployContractWithFactoryResult<Lock>
    adjustBalances: DeployContractWithFactoryResult<AdjustBalances>
    deployer?: Signer
}

export default class DeployAtsContractsResult {
    public readonly businessLogicResolver: DeployContractWithFactoryResult<BusinessLogicResolver>
    public readonly accessControl: DeployContractWithFactoryResult<AccessControl>
    public readonly cap: DeployContractWithFactoryResult<Cap>
    public readonly controlList: DeployContractWithFactoryResult<ControlList>
    public readonly pause: DeployContractWithFactoryResult<Pause>
    public readonly erc20: DeployContractWithFactoryResult<ERC20>
    public readonly erc1410ScheduledTasks: DeployContractWithFactoryResult<ERC1410ScheduledTasks>
    public readonly erc1594: DeployContractWithFactoryResult<ERC1594>
    public readonly erc1643: DeployContractWithFactoryResult<ERC1643>
    public readonly erc1644: DeployContractWithFactoryResult<ERC1644>
    public readonly diamondFacet: DeployContractWithFactoryResult<DiamondFacet>
    public readonly equityUsa: DeployContractWithFactoryResult<EquityUSA>
    public readonly bondUsa: DeployContractWithFactoryResult<BondUSA>
    public readonly scheduledSnapshots: DeployContractWithFactoryResult<ScheduledSnapshots>
    public readonly scheduledBalanceAdjustments: DeployContractWithFactoryResult<ScheduledBalanceAdjustments>
    public readonly scheduledTasks: DeployContractWithFactoryResult<ScheduledTasks>
    public readonly snapshots: DeployContractWithFactoryResult<Snapshots>
    public readonly corporateActionsSecurity: DeployContractWithFactoryResult<CorporateActionsSecurity>
    public readonly transferAndLock: DeployContractWithFactoryResult<TransferAndLock>
    public readonly lock: DeployContractWithFactoryResult<Lock>
    public readonly adjustBalances: DeployContractWithFactoryResult<AdjustBalances>
    public readonly deployer?: Signer

    constructor({
        businessLogicResolver,
        accessControl,
        cap,
        controlList,
        pause,
        erc20,
        erc1410ScheduledTasks,
        erc1594,
        erc1643,
        erc1644,
        diamondFacet,
        equityUsa,
        bondUsa,
        scheduledSnapshots,
        scheduledBalanceAdjustments,
        scheduledTasks,
        snapshots,
        corporateActionsSecurity,
        transferAndLock,
        lock,
        adjustBalances,
        deployer,
    }: DeployAtsContractsResultParams) {
        this.businessLogicResolver = businessLogicResolver
        this.accessControl = accessControl
        this.cap = cap
        this.controlList = controlList
        this.pause = pause
        this.erc20 = erc20
        this.erc1410ScheduledTasks = erc1410ScheduledTasks
        this.erc1594 = erc1594
        this.erc1643 = erc1643
        this.erc1644 = erc1644
        this.diamondFacet = diamondFacet
        this.equityUsa = equityUsa
        this.bondUsa = bondUsa
        this.scheduledSnapshots = scheduledSnapshots
        this.scheduledBalanceAdjustments = scheduledBalanceAdjustments
        this.scheduledTasks = scheduledTasks
        this.snapshots = snapshots
        this.corporateActionsSecurity = corporateActionsSecurity
        this.transferAndLock = transferAndLock
        this.lock = lock
        this.adjustBalances = adjustBalances
        this.deployer = deployer
    }
}
