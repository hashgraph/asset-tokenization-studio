// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable func-name-mixedcase
// solhint-disable private-vars-leading-underscore

import { IFactory } from "./IFactory.sol";
import { ResolverProxy } from "../infrastructure/proxy/ResolverProxy.sol";
import { IResolverProxy } from "../infrastructure/proxy/IResolverProxy.sol";
import { DEFAULT_ADMIN_ROLE } from "../constants/roles.sol";
import { IAccessControl } from "../facets/accessControl/IAccessControl.sol";
import { IControlList } from "../facets/controlList/IControlList.sol";
import { ICore } from "../facets/core/ICore.sol";
import { IERC20Votes } from "../facets/layer_1/ERC1400/ERC20Votes/IERC20Votes.sol";
import { IController } from "../facets/controller/IController.sol";
import { IERC1410Management } from "../facets/layer_1/ERC1400/ERC1410/IERC1410Management.sol";
import { ICap } from "../facets/cap/ICap.sol";
import { IMint } from "../facets/mint/IMint.sol";
import { IClearing } from "../facets/clearing/IClearing.sol";
import { IBusinessLogicResolver } from "../infrastructure/diamond/IBusinessLogicResolver.sol";
import {
    FactoryRegulationData,
    _buildRegulationData,
    RegulationData,
    RegulationType,
    RegulationSubType,
    _checkRegulationTypeAndSubType,
    AdditionalSecurityData
} from "../constants/regulation.sol";
import { IEquityUSA } from "../facets/layer_3/equityUSA/IEquityUSA.sol";
import { IBondUSA } from "../facets/layer_3/bondUSA/IBondUSA.sol";
import { ISecurity } from "../facets/layer_2/security/ISecurity.sol";
import { IBondRead } from "../facets/layer_2/bond/IBondRead.sol";
import { IProceedRecipients } from "../facets/layer_2/proceedRecipient/IProceedRecipients.sol";
import { INominalValue } from "../facets/layer_2/nominalValue/INominalValue.sol";
import { ScheduledTasksStorageWrapper } from "../domain/asset/ScheduledTasksStorageWrapper.sol";
import { IProtectedPartitions } from "../facets/layer_1/protectedPartition/IProtectedPartitions.sol";
import { IExternalPauseManagement } from "../facets/externalPauseManagement/IExternalPauseManagement.sol";
import {
    IExternalControlListManagement
} from "../facets/externalControlListManagement/IExternalControlListManagement.sol";
import { IExternalKycListManagement } from "../facets/externalKycListManagement/IExternalKycListManagement.sol";
import { IKyc } from "../facets/layer_1/kyc/IKyc.sol";
import { IERC3643 } from "../facets/layer_1/ERC3643/IERC3643.sol";
import { _validateISIN } from "./isinValidator.sol";
import { IFixedRate } from "../facets/layer_2/interestRate/fixedRate/IFixedRate.sol";
import { IKpiLinkedRate } from "../facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRate.sol";
import { InterestRateStorageWrapper } from "../domain/asset/InterestRateStorageWrapper.sol";
import { IInterestRate } from "../facets/interestRate/IInterestRate.sol";
import { EvmAccessors } from "../infrastructure/utils/EvmAccessors.sol";
import { DatesValidation } from "../infrastructure/utils/DatesValidation.sol";
import { IAdjustBalances } from "../facets/adjustBalances/IAdjustBalances.sol";
import { IAllowance } from "../facets/allowance/IAllowance.sol";
import { IBalanceTracker } from "../facets/balanceTracker/IBalanceTracker.sol";
import { IBalanceTrackerAdjusted } from "../facets/balanceTrackerAdjusted/IBalanceTrackerAdjusted.sol";
import { IBalanceTrackerAtSnapshot } from "../facets/balanceTrackerAtSnapshot/IBalanceTrackerAtSnapshot.sol";
import {
    IBalanceTrackerAtSnapshotByPartition
} from "../facets/balanceTrackerAtSnapshotByPartition/IBalanceTrackerAtSnapshotByPartition.sol";
import { IBalanceTrackerByPartition } from "../facets/balanceTrackerByPartition/IBalanceTrackerByPartition.sol";
import { IBatchBurn } from "../facets/batchBurn/IBatchBurn.sol";
import { IBatchController } from "../facets/batchController/IBatchController.sol";
import { IBatchFreeze } from "../facets/batchFreeze/IBatchFreeze.sol";
import { IBatchMint } from "../facets/batchMint/IBatchMint.sol";
import { IBatchTransfer } from "../facets/batchTransfer/IBatchTransfer.sol";
import { IBurn } from "../facets/burn/IBurn.sol";
import { IBurnByPartition } from "../facets/burnByPartition/IBurnByPartition.sol";
import { ICapByPartition } from "../facets/capByPartition/ICapByPartition.sol";
import { IComplianceFacet } from "../facets/compliance/IComplianceFacet.sol";
import { IComplianceByPartition } from "../facets/complianceByPartition/IComplianceByPartition.sol";
import { IControllerByPartition } from "../facets/controllerByPartition/IControllerByPartition.sol";
import { IControllerHoldByPartition } from "../facets/controllerHoldByPartition/IControllerHoldByPartition.sol";
import { ICoreAdjusted } from "../facets/coreAdjusted/ICoreAdjusted.sol";
import { ICoreAtSnapshot } from "../facets/coreAtSnapshot/ICoreAtSnapshot.sol";
import { ICorporateActions } from "../facets/corporateActions/ICorporateActions.sol";
import { ICoupon } from "../facets/coupon/ICoupon.sol";
import { ICouponListing } from "../facets/couponListing/ICouponListing.sol";
import { ICouponSecurityHolders } from "../facets/couponSecurityHolders/ICouponSecurityHolders.sol";
import { IDeactivate } from "../facets/deactivate/IDeactivate.sol";
import { IDividend } from "../facets/dividend/IDividend.sol";
import { IDividendSecurityHolders } from "../facets/dividendSecurityHolders/IDividendSecurityHolders.sol";
import { IDocumentation } from "../facets/documentation/IDocumentation.sol";
import { IEIP712 } from "../facets/eip712/IEIP712.sol";
import { IFreeze } from "../facets/freeze/IFreeze.sol";
import { IFreezeAtSnapshot } from "../facets/freezeAtSnapshot/IFreezeAtSnapshot.sol";
import { IFreezeAtSnapshotByPartition } from "../facets/freezeAtSnapshotByPartition/IFreezeAtSnapshotByPartition.sol";
import { IHoldFacet } from "../facets/hold/IHoldFacet.sol";
import { IHoldAtSnapshot } from "../facets/holdAtSnapshot/IHoldAtSnapshot.sol";
import { IHoldAtSnapshotByPartition } from "../facets/holdAtSnapshotByPartition/IHoldAtSnapshotByPartition.sol";
import { IHoldByPartition } from "../facets/holdByPartition/IHoldByPartition.sol";
import { ILock } from "../facets/layer_1/lock/ILock.sol";
import { ILockAtSnapshot } from "../facets/lockAtSnapshot/ILockAtSnapshot.sol";
import { ILockAtSnapshotByPartition } from "../facets/lockAtSnapshotByPartition/ILockAtSnapshotByPartition.sol";
import { ILockByPartition } from "../facets/lockByPartition/ILockByPartition.sol";
import { IMaturity } from "../facets/maturity/IMaturity.sol";
import { IMaturityByPartition } from "../facets/maturityByPartition/IMaturityByPartition.sol";
import { IMetadata } from "../facets/metadata/IMetadata.sol";
import { IMintByPartition } from "../facets/mintByPartition/IMintByPartition.sol";
import { INominalValueAtSnapshot } from "../facets/nominalValueAtSnapshot/INominalValueAtSnapshot.sol";
import { INonces } from "../facets/nonces/INonces.sol";
import { IOperator } from "../facets/operator/IOperator.sol";
import { IOperatorByPartition } from "../facets/operatorByPartition/IOperatorByPartition.sol";
import { IOperatorClearingByPartition } from "../facets/operatorClearingByPartition/IOperatorClearingByPartition.sol";
import {
    IOperatorClearingHoldByPartition
} from "../facets/layer_1/clearing/operatorClearingHoldByPartition/IOperatorClearingHoldByPartition.sol";
import { IOperatorHoldByPartition } from "../facets/operatorHoldByPartition/IOperatorHoldByPartition.sol";
import { IPartitions } from "../facets/partitions/IPartitions.sol";
import { IPause } from "../facets/pause/IPause.sol";
import { IPrincipal } from "../facets/principal/IPrincipal.sol";
import { IProtectedByPartition } from "../facets/protectedByPartition/IProtectedByPartition.sol";
import {
    IProtectedClearingByPartition
} from "../facets/protectedClearingByPartition/IProtectedClearingByPartition.sol";
import {
    IProtectedClearingHoldByPartition
} from "../facets/protectedClearingHoldByPartition/IProtectedClearingHoldByPartition.sol";
import { IProtectedHoldByPartition } from "../facets/protectedHoldByPartition/IProtectedHoldByPartition.sol";
import { IRecovery } from "../facets/recovery/IRecovery.sol";
import { IScheduledBalanceAdjustment } from "../facets/scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol";
import { ISecurityHolders } from "../facets/securityHolders/ISecurityHolders.sol";
import { ISecurityHoldersAtSnapshot } from "../facets/securityHoldersAtSnapshot/ISecurityHoldersAtSnapshot.sol";
import { ISnapshotsByPartition } from "../facets/snapshotsByPartition/ISnapshotsByPartition.sol";
import { ISsiManagement } from "../facets/ssiManagement/ISsiManagement.sol";
import { ITransfer } from "../facets/transfer/ITransfer.sol";
import { ITransferAndLock } from "../facets/layer_3/transferAndLock/ITransferAndLock.sol";
import { ITransferAndLockByPartition } from "../facets/transferAndLockByPartition/ITransferAndLockByPartition.sol";
import { ITransferByPartition } from "../facets/transferByPartition/ITransferByPartition.sol";
import { IVoting } from "../facets/layer_2/voting/IVoting.sol";
import { IVotingSecurityHolders } from "../facets/votingSecurityHolders/IVotingSecurityHolders.sol";

/**
 * @title Factory
 * @author Asset Tokenization Studio Team
 * @notice Abstract base contract implementing shared deployment logic for ATS securities
 *         (equities, bonds, fixed-rate bonds, and KPI-linked-rate bonds).
 * @dev Concrete subclasses must implement `IFactory`. Each `deploy*` function creates a
 *      `ResolverProxy`, initialises all mandatory facets, and optionally initialises
 *      optional facets through `try…catch` wrappers.
 */
abstract contract Factory is IFactory {
    modifier checkResolver(IBusinessLogicResolver resolver) {
        if (address(resolver) == address(0)) {
            revert EmptyResolver(resolver);
        }
        _;
    }

    modifier checkISIN(string calldata isin) {
        _validateISIN(isin);
        _;
    }

    modifier checkAdmins(IResolverProxy.Rbac[] calldata rbacs) {
        _checkAdmins(rbacs);
        _;
    }

    modifier checkRegulation(RegulationType _regulationType, RegulationSubType _regulationSubType) {
        _checkRegulationTypeAndSubType(_regulationType, _regulationSubType);
        _;
    }

    modifier checkInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) {
        InterestRateStorageWrapper.requireValidInterestRate(_newInterestRate);
        _;
    }

    modifier checkImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) {
        InterestRateStorageWrapper.requireValidImpactData(_newImpactData);
        _;
    }

    modifier checkBondDates(uint256 startingDate, uint256 maturityDate) {
        _checkBondDates(startingDate, maturityDate);
        _;
    }

    /**
     * @notice Deploys a bare `ResolverProxy` without any asset-specific initialisation.
     * @param _resolver The `IBusinessLogicResolver` that will route calls for this proxy.
     * @param _configKey Resolver configuration key that selects the facet set.
     * @param _version Version of the resolver configuration to use.
     * @param _rbacs Initial role-based access control assignments for the proxy.
     * @return proxyAddress_ Address of the newly deployed `ResolverProxy`.
     */
    function deployProxy(
        IBusinessLogicResolver _resolver,
        bytes32 _configKey,
        uint256 _version,
        IResolverProxy.Rbac[] calldata _rbacs
    ) external checkResolver(_resolver) checkAdmins(_rbacs) returns (address proxyAddress_) {
        proxyAddress_ = address(new ResolverProxy(_resolver, _configKey, _version, _rbacs));
        emit ProxyDeployed(proxyAddress_, _resolver, _configKey, _version, _rbacs);
    }

    /**
     * @notice Deploys and fully initialises an equity security proxy.
     * @param _equityData Equity creation data including security configuration and equity details.
     * @param _factoryRegulationData Regulation type and sub-type to apply to the equity.
     * @return equityAddress_ Address of the newly deployed equity proxy.
     */
    function deployEquity(
        EquityData calldata _equityData,
        FactoryRegulationData calldata _factoryRegulationData
    )
        external
        checkResolver(_equityData.security.resolver)
        checkISIN(_equityData.security.erc20MetadataInfo.isin)
        checkAdmins(_equityData.security.rbacs)
        checkRegulation(_factoryRegulationData.regulationType, _factoryRegulationData.regulationSubType)
        returns (address equityAddress_)
    {
        equityAddress_ = _deploySecurity(_equityData.security, SecurityType.Equity);

        // Initialize equity USA features (EquityUSAFacet may not be present)
        _tryInitializeEquityUSA(equityAddress_, _equityData.equityDetails);

        // Initialize security regulation data (SecurityFacet may not be present)
        _tryInitializeSecurity(
            equityAddress_,
            _buildRegulationData(_factoryRegulationData.regulationType, _factoryRegulationData.regulationSubType),
            _factoryRegulationData.additionalSecurityData
        );

        _tryInitializeNominalValue(
            equityAddress_,
            _equityData.equityDetails.nominalValue,
            _equityData.equityDetails.nominalValueDecimals,
            _equityData.equityDetails.currency
        );

        _tryInitializeInterestRateType(equityAddress_, IInterestRate.RateType.STANDARD);

        IAccessControl(equityAddress_).renounceRole(DEFAULT_ADMIN_ROLE);

        emit EquityDeployed(EvmAccessors.getMsgSender(), equityAddress_, _equityData, _factoryRegulationData);
    }

    /**
     * @notice Deploys and fully initialises a variable-rate bond proxy.
     * @param _bondData Bond creation data including security configuration and bond details.
     * @param _factoryRegulationData Regulation type and sub-type to apply to the bond.
     * @return bondAddress_ Address of the newly deployed bond proxy.
     */
    function deployBond(
        BondData calldata _bondData,
        FactoryRegulationData calldata _factoryRegulationData
    )
        external
        checkResolver(_bondData.security.resolver)
        checkISIN(_bondData.security.erc20MetadataInfo.isin)
        checkAdmins(_bondData.security.rbacs)
        checkRegulation(_factoryRegulationData.regulationType, _factoryRegulationData.regulationSubType)
        checkBondDates(_bondData.bondDetails.startingDate, _bondData.bondDetails.maturityDate)
        returns (address bondAddress_)
    {
        bondAddress_ = _deployBond(_bondData, _factoryRegulationData, SecurityType.BondVariableRate);

        _tryInitializeInterestRateType(bondAddress_, IInterestRate.RateType.STANDARD);

        IAccessControl(bondAddress_).renounceRole(DEFAULT_ADMIN_ROLE);

        emit BondDeployed(EvmAccessors.getMsgSender(), bondAddress_, _bondData, _factoryRegulationData);
    }

    /**
     * @notice Deploys and fully initialises a fixed-rate bond proxy.
     * @param _bondFixedRateData Fixed-rate bond creation data including bond data and rate
     *        configuration.
     * @return bondAddress_ Address of the newly deployed fixed-rate bond proxy.
     */
    function deployBondFixedRate(
        BondFixedRateData calldata _bondFixedRateData
    )
        external
        checkResolver(_bondFixedRateData.bondData.security.resolver)
        checkISIN(_bondFixedRateData.bondData.security.erc20MetadataInfo.isin)
        checkAdmins(_bondFixedRateData.bondData.security.rbacs)
        checkRegulation(
            _bondFixedRateData.factoryRegulationData.regulationType,
            _bondFixedRateData.factoryRegulationData.regulationSubType
        )
        checkBondDates(
            _bondFixedRateData.bondData.bondDetails.startingDate,
            _bondFixedRateData.bondData.bondDetails.maturityDate
        )
        returns (address bondAddress_)
    {
        bondAddress_ = _deployBond(
            _bondFixedRateData.bondData,
            _bondFixedRateData.factoryRegulationData,
            SecurityType.BondFixedRate
        );

        // Initialize fixed rate (FixedRateFacet may not be present)
        _tryInitializeFixedRate(bondAddress_, _bondFixedRateData.fixedRateData);

        _tryInitializeInterestRateType(bondAddress_, IInterestRate.RateType.FIXED);

        IAccessControl(bondAddress_).renounceRole(DEFAULT_ADMIN_ROLE);

        emit BondFixedRateDeployed(EvmAccessors.getMsgSender(), bondAddress_, _bondFixedRateData);
    }

    /**
     * @notice Deploys and fully initialises a KPI-linked-rate bond proxy.
     * @param _bondKpiLinkedRateData KPI-linked-rate bond creation data including bond data,
     *        interest rate parameters, and impact data.
     * @return bondAddress_ Address of the newly deployed KPI-linked-rate bond proxy.
     */
    function deployBondKpiLinkedRate(
        BondKpiLinkedRateData calldata _bondKpiLinkedRateData
    )
        external
        checkResolver(_bondKpiLinkedRateData.bondData.security.resolver)
        checkISIN(_bondKpiLinkedRateData.bondData.security.erc20MetadataInfo.isin)
        checkAdmins(_bondKpiLinkedRateData.bondData.security.rbacs)
        checkRegulation(
            _bondKpiLinkedRateData.factoryRegulationData.regulationType,
            _bondKpiLinkedRateData.factoryRegulationData.regulationSubType
        )
        checkInterestRate(_bondKpiLinkedRateData.interestRate)
        checkImpactData(_bondKpiLinkedRateData.impactData)
        checkBondDates(
            _bondKpiLinkedRateData.bondData.bondDetails.startingDate,
            _bondKpiLinkedRateData.bondData.bondDetails.maturityDate
        )
        returns (address bondAddress_)
    {
        bondAddress_ = _deployBondKpiLinkedRate(_bondKpiLinkedRateData);
        IAccessControl(bondAddress_).renounceRole(DEFAULT_ADMIN_ROLE);
        _emitBondKpiLinkedRateDeployed(bondAddress_, _bondKpiLinkedRateData);
    }

    /**
     * @notice Builds and returns the full `RegulationData` struct for a given regulation type
     *         and sub-type combination.
     * @param _regulationType The primary regulation category.
     * @param _regulationSubType The secondary regulation category.
     * @return regulationData_ The constructed `RegulationData` struct.
     */
    function getAppliedRegulationData(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure override returns (RegulationData memory regulationData_) {
        regulationData_ = _buildRegulationData(_regulationType, _regulationSubType);
    }

    function _deployBond(
        BondData calldata _bondData,
        FactoryRegulationData calldata _factoryRegulationData,
        SecurityType _securityType
    ) internal returns (address bondAddress_) {
        bondAddress_ = _deploySecurity(_bondData.security, _securityType);

        // Initialize bond USA features (BondUSAFacet may not be present)
        _tryInitializeBondUSA(bondAddress_, _bondData.bondDetails);

        // Initialize security regulation data (SecurityFacet may not be present)
        _tryInitializeSecurity(
            bondAddress_,
            _buildRegulationData(_factoryRegulationData.regulationType, _factoryRegulationData.regulationSubType),
            _factoryRegulationData.additionalSecurityData
        );

        // Initialize proceed recipients (ProceedRecipientsFacet may not be present)
        _tryInitializeProceedRecipients(bondAddress_, _bondData.proceedRecipients, _bondData.proceedRecipientsData);

        _tryInitializeNominalValue(
            bondAddress_,
            _bondData.bondDetails.nominalValue,
            _bondData.bondDetails.nominalValueDecimals,
            _bondData.bondDetails.currency
        );
    }

    function _deployBondKpiLinkedRate(BondKpiLinkedRateData calldata _data) internal returns (address bondAddress_) {
        bondAddress_ = _deployBond(_data.bondData, _data.factoryRegulationData, SecurityType.BondKpiLinkedRate);

        // Initialize KPI linked rate (KpiLinkedRateFacet may not be present)
        _tryInitializeKpiLinkedRate(bondAddress_, _data.interestRate, _data.impactData);
        _tryInitializeInterestRateType(bondAddress_, IInterestRate.RateType.KPI_LINKED);
    }

    //solhint-disable-next-line function-max-lines
    function _deploySecurity(
        SecurityData calldata _securityData,
        SecurityType _securityType
    ) private returns (address securityAddress_) {
        // Build extended rbacs array that includes the factory as a temporary
        // DEFAULT_ADMIN_ROLE holder during initialisation.
        uint256 rbacsLen = _securityData.rbacs.length;
        IResolverProxy.Rbac[] memory extendedRbacs = new IResolverProxy.Rbac[](rbacsLen + 1);
        for (uint256 i; i < rbacsLen; ) {
            extendedRbacs[i] = _securityData.rbacs[i];
            unchecked {
                ++i;
            }
        }
        extendedRbacs[rbacsLen] = IResolverProxy.Rbac({ role: DEFAULT_ADMIN_ROLE, members: new address[](1) });
        extendedRbacs[rbacsLen].members[0] = address(this);

        ResolverProxy equity = new ResolverProxy(
            _securityData.resolver,
            _securityData.resolverProxyConfiguration.key,
            _securityData.resolverProxyConfiguration.version,
            extendedRbacs
        );

        securityAddress_ = address(equity);

        // configure Control List
        IControlList(securityAddress_).initializeControlList(_securityData.isWhiteList);

        // configure multi partition flag (ERC1410ManagementFacet may not be present)
        _tryInitializeERC1410(securityAddress_, _securityData.isMultiPartition);

        // configure controller flag (ControllerFacet may not be present)
        _tryInitializeController(securityAddress_, _securityData.isControllable);

        // configure erc20 metadata (CoreFacet may not be present)
        ICore.ERC20Metadata memory erc20Metadata = ICore.ERC20Metadata({
            info: _securityData.erc20MetadataInfo,
            securityType: _securityType
        });
        ICore(securityAddress_).initializeCore(erc20Metadata);

        // configure issue flag (ERC1594Facet may not be present)
        _tryInitializeERC1594(securityAddress_);

        // configure cap (CapFacet should be present)
        ICap(securityAddress_).initializeCap(_securityData.maxSupply, new ICap.PartitionCap[](0));

        // configure protected partitions (should be present)
        IProtectedPartitions(securityAddress_).initializeProtectedPartitions(_securityData.arePartitionsProtected);

        // configure clearing (ClearingFacet may not be present)
        _tryInitializeClearing(securityAddress_, _securityData.clearingActive);

        // configure external pauses (should be present)
        IExternalPauseManagement(securityAddress_).initializeExternalPauses(_securityData.externalPauses);

        // configure external control lists (should be present)
        IExternalControlListManagement(securityAddress_).initializeExternalControlLists(
            _securityData.externalControlLists
        );

        // configure internal KYC (should be present)
        IKyc(securityAddress_).initializeInternalKyc(_securityData.internalKycActivated);

        // configure external KYC lists (should be present)
        IExternalKycListManagement(securityAddress_).initializeExternalKycLists(_securityData.externalKycLists);

        // configure ERC20Votes (ERC20VotesFacet may not be present)
        _tryInitializeERC20Votes(securityAddress_, _securityData.erc20VotesActivated);

        // configure ERC3643 (should be present)
        IERC3643(securityAddress_).initializeERC3643(_securityData.compliance, _securityData.identityRegistry);

        // configure access control (AccessControlFacet may not be present)
        _tryInitializeAccessControl(securityAddress_);

        // configure allowance (AllowanceFacet may not be present)
        _tryInitializeAllowance(securityAddress_);

        // configure transfer (TransferFacet may not be present)
        _tryInitializeTransfer(securityAddress_);

        // configure core adjusted (CoreAdjustedFacet may not be present)
        _tryInitializeCoreAdjusted(securityAddress_);

        // configure metadata (MetadataFacet may not be present)
        _tryInitializeMetadata(securityAddress_);

        // configure freeze (FreezeFacet may not be present)
        _tryInitializeFreeze(securityAddress_);

        // configure batch freeze (BatchFreezeFacet may not be present)
        _tryInitializeBatchFreeze(securityAddress_);

        // configure pause (PauseFacet may not be present)
        _tryInitializePause(securityAddress_);

        // configure balance tracker (BalanceTrackerFacet may not be present)
        _tryInitializeBalanceTracker(securityAddress_);

        // configure balance tracker adjusted (BalanceTrackerAdjustedFacet may not be present)
        _tryInitializeBalanceTrackerAdjusted(securityAddress_);

        // configure snapshots by partition (SnapshotsByPartitionFacet may not be present)
        _tryInitializeSnapshotsByPartition(securityAddress_);

        // configure security holders at snapshot (SecurityHoldersAtSnapshotFacet may not be present)
        _tryInitializeSecurityHoldersAtSnapshot(securityAddress_);

        // configure hold at snapshot (HoldAtSnapshotFacet may not be present)
        _tryInitializeHoldAtSnapshot(securityAddress_);

        // configure lock at snapshot by partition (LockAtSnapshotByPartitionFacet may not be present)
        _tryInitializeLockAtSnapshotByPartition(securityAddress_);

        // configure freeze at snapshot (FreezeAtSnapshotFacet may not be present)
        _tryInitializeFreezeAtSnapshot(securityAddress_);

        // configure freeze at snapshot by partition (FreezeAtSnapshotByPartitionFacet may not be present)
        _tryInitializeFreezeAtSnapshotByPartition(securityAddress_);

        // configure lock at snapshot (LockAtSnapshotFacet may not be present)
        _tryInitializeLockAtSnapshot(securityAddress_);

        // configure core at snapshot (CoreAtSnapshotFacet may not be present)
        _tryInitializeCoreAtSnapshot(securityAddress_);

        // configure balance tracker by partition (BalanceTrackerByPartitionFacet may not be present)
        _tryInitializeBalanceTrackerByPartition(securityAddress_);

        // configure balance tracker at snapshot (BalanceTrackerAtSnapshotFacet may not be present)
        _tryInitializeBalanceTrackerAtSnapshot(securityAddress_);

        // configure balance tracker at snapshot by partition (BalanceTrackerAtSnapshotByPartitionFacet
        // may not be present)
        _tryInitializeBalanceTrackerAtSnapshotByPartition(securityAddress_);

        // configure hold at snapshot by partition (HoldAtSnapshotByPartitionFacet may not be present)
        _tryInitializeHoldAtSnapshotByPartition(securityAddress_);

        // configure mint by partition (MintByPartitionFacet may not be present)
        _tryInitializeMintByPartition(securityAddress_);

        // configure protected by partition (ProtectedByPartitionFacet may not be present)
        _tryInitializeProtectedByPartition(securityAddress_);

        // configure operator (OperatorFacet may not be present)
        _tryInitializeOperator(securityAddress_);

        // configure transfer by partition (TransferByPartitionFacet may not be present)
        _tryInitializeTransferByPartition(securityAddress_);

        // configure partitions (PartitionsFacet may not be present)
        _tryInitializePartitions(securityAddress_);

        // configure operator by partition (OperatorByPartitionFacet may not be present)
        _tryInitializeOperatorByPartition(securityAddress_);

        // configure burn by partition (BurnByPartitionFacet may not be present)
        _tryInitializeBurnByPartition(securityAddress_);

        // configure documentation (DocumentationFacet may not be present)
        _tryInitializeDocumentation(securityAddress_);

        // configure EIP712 (EIP712Facet may not be present)
        _tryInitializeEIP712(securityAddress_);

        // configure nonces (NoncesFacet may not be present)
        _tryInitializeNonces(securityAddress_);

        // configure deactivate (DeactivateFacet may not be present)
        _tryInitializeDeactivate(securityAddress_);

        // configure batch controller (BatchControllerFacet may not be present)
        _tryInitializeBatchController(securityAddress_);

        // configure batch burn (BatchBurnFacet may not be present)
        _tryInitializeBatchBurn(securityAddress_);

        // configure batch mint (BatchMintFacet may not be present)
        _tryInitializeBatchMint(securityAddress_);

        // configure batch transfer (BatchTransferFacet may not be present)
        _tryInitializeBatchTransfer(securityAddress_);

        // configure recovery (RecoveryFacet may not be present)
        _tryInitializeRecovery(securityAddress_);

        // configure compliance (ComplianceFacet may not be present)
        _tryInitializeCompliance(securityAddress_);

        // configure compliance by partition (ComplianceByPartitionFacet may not be present)
        _tryInitializeComplianceByPartition(securityAddress_);

        // configure burn (BurnFacet may not be present)
        _tryInitializeBurn(securityAddress_);

        // configure protected clearing hold by partition (ProtectedClearingHoldByPartitionFacet may not be present)
        _tryInitializeProtectedClearingHoldByPartition(securityAddress_);

        // configure operator clearing hold by partition (OperatorClearingHoldByPartitionFacet may not be present)
        _tryInitializeOperatorClearingHoldByPartition(securityAddress_);

        // configure operator clearing by partition (OperatorClearingByPartitionFacet may not be present)
        _tryInitializeOperatorClearingByPartition(securityAddress_);

        // configure protected clearing by partition (ProtectedClearingByPartitionFacet may not be present)
        _tryInitializeProtectedClearingByPartition(securityAddress_);

        // configure hold (HoldFacet may not be present)
        _tryInitializeHold(securityAddress_);

        // configure operator hold by partition (OperatorHoldByPartitionFacet may not be present)
        _tryInitializeOperatorHoldByPartition(securityAddress_);

        // configure controller hold by partition (ControllerHoldByPartitionFacet may not be present)
        _tryInitializeControllerHoldByPartition(securityAddress_);

        // configure controller by partition (ControllerByPartitionFacet may not be present)
        _tryInitializeControllerByPartition(securityAddress_);

        // configure protected hold by partition (ProtectedHoldByPartitionFacet may not be present)
        _tryInitializeProtectedHoldByPartition(securityAddress_);

        // configure hold by partition (HoldByPartitionFacet may not be present)
        _tryInitializeHoldByPartition(securityAddress_);

        // configure balance adjustments (AdjustBalancesFacet may not be present)
        _tryInitializeBalanceAdjustments(securityAddress_);

        // configure scheduled balance adjustment (ScheduledBalanceAdjustmentFacet may not be present)
        _tryInitializeScheduledBalanceAdjustment(securityAddress_);

        // configure lock (LockFacet may not be present)
        _tryInitializeLock(securityAddress_);

        // configure lock by partition (LockByPartitionFacet may not be present)
        _tryInitializeLockByPartition(securityAddress_);

        // configure nominal value at snapshot (NominalValueAtSnapshotFacet may not be present)
        _tryInitializeNominalValueAtSnapshot(securityAddress_);

        // configure security holders (SecurityHoldersFacet may not be present)
        _tryInitializeSecurityHolders(securityAddress_);

        // configure SSI management (SsiManagementFacet may not be present)
        _tryInitializeSsiManagement(securityAddress_);

        // configure corporate actions (CorporateActionsFacet may not be present)
        _tryInitializeCorporateActions(securityAddress_);

        // configure transfer and lock (TransferAndLockFacet may not be present)
        _tryInitializeTransferAndLock(securityAddress_);

        // configure transfer and lock by partition (TransferAndLockByPartitionFacet may not be present)
        _tryInitializeTransferAndLockByPartition(securityAddress_);

        // configure cap by partition (CapByPartitionFacet may not be present)
        _tryInitializeCapByPartition(securityAddress_);

        // configure dividend (DividendFacet may not be present)
        _tryInitializeDividend(securityAddress_);

        // configure dividend security holders (DividendSecurityHoldersFacet may not be present)
        _tryInitializeDividendSecurityHolders(securityAddress_);

        // configure voting (VotingFacet may not be present)
        _tryInitializeVoting(securityAddress_);

        // configure voting security holders (VotingSecurityHoldersFacet may not be present)
        _tryInitializeVotingSecurityHolders(securityAddress_);

        // configure coupon (CouponFacet may not be present)
        _tryInitializeCoupon(securityAddress_);

        // configure coupon listing (CouponListingFacet may not be present)
        _tryInitializeCouponListing(securityAddress_);

        // configure coupon security holders (CouponSecurityHoldersFacet may not be present)
        _tryInitializeCouponSecurityHolders(securityAddress_);

        // configure maturity (MaturityFacet may not be present)
        _tryInitializeMaturity(securityAddress_);

        // configure maturity by partition (MaturityByPartitionFacet may not be present)
        _tryInitializeMaturityByPartition(securityAddress_);

        // configure principal (PrincipalFacet may not be present)
        _tryInitializePrincipal(securityAddress_);

        // configure bond USA read (BondUSAReadFacet may not be present)
        _tryInitializeBondUSARead(securityAddress_);
    }

    function _tryInitializeERC1410(address securityAddress_, bool isMultiPartition) private {
        try IERC1410Management(securityAddress_).initializeERC1410(isMultiPartition) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitializeController(address securityAddress_, bool isControllable) private {
        try IController(securityAddress_).initializeController(isControllable) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitializeERC1594(address securityAddress_) private {
        try IMint(securityAddress_).initializeERC1594() {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitializeClearing(address securityAddress_, bool clearingActive) private {
        try IClearing(securityAddress_).initializeClearing(clearingActive) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitializeERC20Votes(address securityAddress_, bool erc20VotesActivated) private {
        try IERC20Votes(securityAddress_).initializeERC20Votes(erc20VotesActivated) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitializeEquityUSA(
        address securityAddress_,
        IEquityUSA.EquityDetailsData calldata equityDetailsData
    ) private {
        try IEquityUSA(securityAddress_).initializeEquityUSA(equityDetailsData) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitializeSecurity(
        address securityAddress_,
        RegulationData memory regulationData,
        AdditionalSecurityData calldata additionalSecurityData
    ) private {
        try ISecurity(securityAddress_).initializeSecurity(regulationData, additionalSecurityData) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitializeBondUSA(
        address securityAddress_,
        IBondRead.BondDetailsData calldata bondDetailsData
    ) private {
        try IBondUSA(securityAddress_).initializeBondUSA(bondDetailsData) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitializeFixedRate(
        address securityAddress_,
        IFixedRate.FixedRateData calldata fixedRateData
    ) private {
        try IFixedRate(securityAddress_).initializeFixedRate(fixedRateData) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitializeKpiLinkedRate(
        address securityAddress_,
        IKpiLinkedRate.InterestRate calldata interestRate,
        IKpiLinkedRate.ImpactData calldata impactData
    ) private {
        try IKpiLinkedRate(securityAddress_).initializeKpiLinkedRate(interestRate, impactData) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitializeProceedRecipients(
        address securityAddress_,
        address[] calldata proceedRecipients,
        bytes[] calldata data
    ) private {
        try IProceedRecipients(securityAddress_).initializeProceedRecipients(proceedRecipients, data) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitializeNominalValue(
        address securityAddress_,
        uint256 nominalValue,
        uint8 nominalValueDecimals,
        bytes3 nominalValueCurrency
    ) private {
        try
            INominalValue(securityAddress_).initializeNominalValue(
                nominalValue,
                nominalValueDecimals,
                nominalValueCurrency
            )
        {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _emitBondKpiLinkedRateDeployed(
        address _bondAddress,
        BondKpiLinkedRateData calldata _bondKpiLinkedRateData
    ) private {
        emit BondKpiLinkedRateDeployed(EvmAccessors.getMsgSender(), _bondAddress, _bondKpiLinkedRateData);
    }

    function _tryInitializeInterestRateType(address securityAddress_, IInterestRate.RateType rateType) private {
        try IInterestRate(securityAddress_).initializeInterestRateType(rateType) {
            // success
        } catch {
            // facet not present - skip initialization
        }
    }

    function _tryInitializeAccessControl(address securityAddress_) private {
        try IAccessControl(securityAddress_).initializeAccessControl() {} catch {}
    }

    function _tryInitializeAllowance(address securityAddress_) private {
        try IAllowance(securityAddress_).initializeAllowance() {} catch {}
    }

    function _tryInitializeTransfer(address securityAddress_) private {
        try ITransfer(securityAddress_).initializeTransfer() {} catch {}
    }

    function _tryInitializeCoreAdjusted(address securityAddress_) private {
        try ICoreAdjusted(securityAddress_).initializeCoreAdjusted() {} catch {}
    }

    function _tryInitializeMetadata(address securityAddress_) private {
        try IMetadata(securityAddress_).initializeMetadata() {} catch {}
    }

    function _tryInitializeFreeze(address securityAddress_) private {
        try IFreeze(securityAddress_).initializeFreeze() {} catch {}
    }

    function _tryInitializeBatchFreeze(address securityAddress_) private {
        try IBatchFreeze(securityAddress_).initializeBatchFreeze() {} catch {}
    }

    function _tryInitializePause(address securityAddress_) private {
        try IPause(securityAddress_).initializePause() {} catch {}
    }

    function _tryInitializeBalanceTracker(address securityAddress_) private {
        try IBalanceTracker(securityAddress_).initializeBalanceTracker() {} catch {}
    }

    function _tryInitializeBalanceTrackerAdjusted(address securityAddress_) private {
        try IBalanceTrackerAdjusted(securityAddress_).initializeBalanceTrackerAdjusted() {} catch {}
    }

    function _tryInitializeSnapshotsByPartition(address securityAddress_) private {
        try ISnapshotsByPartition(securityAddress_).initializeSnapshotsByPartition() {} catch {}
    }

    function _tryInitializeSecurityHoldersAtSnapshot(address securityAddress_) private {
        try ISecurityHoldersAtSnapshot(securityAddress_).initializeSecurityHoldersAtSnapshot() {} catch {}
    }

    function _tryInitializeHoldAtSnapshot(address securityAddress_) private {
        try IHoldAtSnapshot(securityAddress_).initializeHoldAtSnapshot() {} catch {}
    }

    function _tryInitializeLockAtSnapshotByPartition(address securityAddress_) private {
        try ILockAtSnapshotByPartition(securityAddress_).initializeLockAtSnapshotByPartition() {} catch {}
    }

    function _tryInitializeFreezeAtSnapshot(address securityAddress_) private {
        try IFreezeAtSnapshot(securityAddress_).initializeFreezeAtSnapshot() {} catch {}
    }

    function _tryInitializeFreezeAtSnapshotByPartition(address securityAddress_) private {
        try IFreezeAtSnapshotByPartition(securityAddress_).initializeFreezeAtSnapshotByPartition() {} catch {}
    }

    function _tryInitializeLockAtSnapshot(address securityAddress_) private {
        try ILockAtSnapshot(securityAddress_).initializeLockAtSnapshot() {} catch {}
    }

    function _tryInitializeCoreAtSnapshot(address securityAddress_) private {
        try ICoreAtSnapshot(securityAddress_).initializeCoreAtSnapshot() {} catch {}
    }

    function _tryInitializeBalanceTrackerByPartition(address securityAddress_) private {
        try IBalanceTrackerByPartition(securityAddress_).initializeBalanceTrackerByPartition() {} catch {}
    }

    function _tryInitializeBalanceTrackerAtSnapshot(address securityAddress_) private {
        try IBalanceTrackerAtSnapshot(securityAddress_).initializeBalanceTrackerAtSnapshot() {} catch {}
    }

    function _tryInitializeBalanceTrackerAtSnapshotByPartition(address securityAddress_) private {
        try
            IBalanceTrackerAtSnapshotByPartition(securityAddress_).initializeBalanceTrackerAtSnapshotByPartition()
        {} catch {}
    }

    function _tryInitializeHoldAtSnapshotByPartition(address securityAddress_) private {
        try IHoldAtSnapshotByPartition(securityAddress_).initializeHoldAtSnapshotByPartition() {} catch {}
    }

    function _tryInitializeMintByPartition(address securityAddress_) private {
        try IMintByPartition(securityAddress_).initializeMintByPartition() {} catch {}
    }

    function _tryInitializeProtectedByPartition(address securityAddress_) private {
        try IProtectedByPartition(securityAddress_).initializeProtectedByPartition() {} catch {}
    }

    function _tryInitializeOperator(address securityAddress_) private {
        try IOperator(securityAddress_).initializeOperator() {} catch {}
    }

    function _tryInitializeTransferByPartition(address securityAddress_) private {
        try ITransferByPartition(securityAddress_).initializeTransferByPartition() {} catch {}
    }

    function _tryInitializePartitions(address securityAddress_) private {
        try IPartitions(securityAddress_).initializePartitions() {} catch {}
    }

    function _tryInitializeOperatorByPartition(address securityAddress_) private {
        try IOperatorByPartition(securityAddress_).initializeOperatorByPartition() {} catch {}
    }

    function _tryInitializeBurnByPartition(address securityAddress_) private {
        try IBurnByPartition(securityAddress_).initializeBurnByPartition() {} catch {}
    }

    function _tryInitializeDocumentation(address securityAddress_) private {
        try IDocumentation(securityAddress_).initializeDocumentation() {} catch {}
    }

    function _tryInitializeEIP712(address securityAddress_) private {
        try IEIP712(securityAddress_).initializeEIP712() {} catch {}
    }

    function _tryInitializeNonces(address securityAddress_) private {
        try INonces(securityAddress_).initializeNonces() {} catch {}
    }

    function _tryInitializeDeactivate(address securityAddress_) private {
        try IDeactivate(securityAddress_).initializeDeactivate() {} catch {}
    }

    function _tryInitializeBatchController(address securityAddress_) private {
        try IBatchController(securityAddress_).initializeBatchController() {} catch {}
    }

    function _tryInitializeBatchBurn(address securityAddress_) private {
        try IBatchBurn(securityAddress_).initializeBatchBurn() {} catch {}
    }

    function _tryInitializeBatchMint(address securityAddress_) private {
        try IBatchMint(securityAddress_).initializeBatchMint() {} catch {}
    }

    function _tryInitializeBatchTransfer(address securityAddress_) private {
        try IBatchTransfer(securityAddress_).initializeBatchTransfer() {} catch {}
    }

    function _tryInitializeRecovery(address securityAddress_) private {
        try IRecovery(securityAddress_).initializeRecovery() {} catch {}
    }

    function _tryInitializeCompliance(address securityAddress_) private {
        try IComplianceFacet(securityAddress_).initializeCompliance() {} catch {}
    }

    function _tryInitializeComplianceByPartition(address securityAddress_) private {
        try IComplianceByPartition(securityAddress_).initializeComplianceByPartition() {} catch {}
    }

    function _tryInitializeBurn(address securityAddress_) private {
        try IBurn(securityAddress_).initializeBurn() {} catch {}
    }

    function _tryInitializeProtectedClearingHoldByPartition(address securityAddress_) private {
        try IProtectedClearingHoldByPartition(securityAddress_).initializeProtectedClearingHoldByPartition() {} catch {}
    }

    function _tryInitializeOperatorClearingHoldByPartition(address securityAddress_) private {
        try IOperatorClearingHoldByPartition(securityAddress_).initializeOperatorClearingHoldByPartition() {} catch {}
    }

    function _tryInitializeOperatorClearingByPartition(address securityAddress_) private {
        try IOperatorClearingByPartition(securityAddress_).initializeOperatorClearingByPartition() {} catch {}
    }

    function _tryInitializeProtectedClearingByPartition(address securityAddress_) private {
        try IProtectedClearingByPartition(securityAddress_).initializeProtectedClearingByPartition() {} catch {}
    }

    function _tryInitializeHold(address securityAddress_) private {
        try IHoldFacet(securityAddress_).initializeHold() {} catch {}
    }

    function _tryInitializeOperatorHoldByPartition(address securityAddress_) private {
        try IOperatorHoldByPartition(securityAddress_).initializeOperatorHoldByPartition() {} catch {}
    }

    function _tryInitializeControllerHoldByPartition(address securityAddress_) private {
        try IControllerHoldByPartition(securityAddress_).initializeControllerHoldByPartition() {} catch {}
    }

    function _tryInitializeControllerByPartition(address securityAddress_) private {
        try IControllerByPartition(securityAddress_).initializeControllerByPartition() {} catch {}
    }

    function _tryInitializeProtectedHoldByPartition(address securityAddress_) private {
        try IProtectedHoldByPartition(securityAddress_).initializeProtectedHoldByPartition() {} catch {}
    }

    function _tryInitializeHoldByPartition(address securityAddress_) private {
        try IHoldByPartition(securityAddress_).initializeHoldByPartition() {} catch {}
    }

    function _tryInitializeBalanceAdjustments(address securityAddress_) private {
        try IAdjustBalances(securityAddress_).initializeBalanceAdjustments() {} catch {}
    }

    function _tryInitializeScheduledBalanceAdjustment(address securityAddress_) private {
        try IScheduledBalanceAdjustment(securityAddress_).initializeScheduledBalanceAdjustment() {} catch {}
    }

    function _tryInitializeLock(address securityAddress_) private {
        try ILock(securityAddress_).initializeLock() {} catch {}
    }

    function _tryInitializeLockByPartition(address securityAddress_) private {
        try ILockByPartition(securityAddress_).initializeLockByPartition() {} catch {}
    }

    function _tryInitializeNominalValueAtSnapshot(address securityAddress_) private {
        try INominalValueAtSnapshot(securityAddress_).initializeNominalValueAtSnapshot() {} catch {}
    }

    function _tryInitializeSecurityHolders(address securityAddress_) private {
        try ISecurityHolders(securityAddress_).initializeSecurityHolders() {} catch {}
    }

    function _tryInitializeSsiManagement(address securityAddress_) private {
        try ISsiManagement(securityAddress_).initializeSsiManagement() {} catch {}
    }

    function _tryInitializeCorporateActions(address securityAddress_) private {
        try ICorporateActions(securityAddress_).initializeCorporateActions() {} catch {}
    }

    function _tryInitializeTransferAndLock(address securityAddress_) private {
        try ITransferAndLock(securityAddress_).initializeTransferAndLock() {} catch {}
    }

    function _tryInitializeTransferAndLockByPartition(address securityAddress_) private {
        try ITransferAndLockByPartition(securityAddress_).initializeTransferAndLockByPartition() {} catch {}
    }

    function _tryInitializeCapByPartition(address securityAddress_) private {
        try ICapByPartition(securityAddress_).initializeCapByPartition() {} catch {}
    }

    function _tryInitializeDividend(address securityAddress_) private {
        try IDividend(securityAddress_).initializeDividend() {} catch {}
    }

    function _tryInitializeDividendSecurityHolders(address securityAddress_) private {
        try IDividendSecurityHolders(securityAddress_).initializeDividendSecurityHolders() {} catch {}
    }

    function _tryInitializeVoting(address securityAddress_) private {
        try IVoting(securityAddress_).initializeVoting() {} catch {}
    }

    function _tryInitializeVotingSecurityHolders(address securityAddress_) private {
        try IVotingSecurityHolders(securityAddress_).initializeVotingSecurityHolders() {} catch {}
    }

    function _tryInitializeCoupon(address securityAddress_) private {
        try ICoupon(securityAddress_).initializeCoupon() {} catch {}
    }

    function _tryInitializeCouponListing(address securityAddress_) private {
        try ICouponListing(securityAddress_).initializeCouponListing() {} catch {}
    }

    function _tryInitializeCouponSecurityHolders(address securityAddress_) private {
        try ICouponSecurityHolders(securityAddress_).initializeCouponSecurityHolders() {} catch {}
    }

    function _tryInitializeMaturity(address securityAddress_) private {
        try IMaturity(securityAddress_).initializeMaturity() {} catch {}
    }

    function _tryInitializeMaturityByPartition(address securityAddress_) private {
        try IMaturityByPartition(securityAddress_).initializeMaturityByPartition() {} catch {}
    }

    function _tryInitializePrincipal(address securityAddress_) private {
        try IPrincipal(securityAddress_).initializePrincipal() {} catch {}
    }

    function _tryInitializeBondUSARead(address securityAddress_) private {
        try IBondRead(securityAddress_).initializeBondUSARead() {} catch {}
    }

    function _checkBondDates(uint256 startingDate, uint256 maturityDate) private view {
        DatesValidation.checkDates(startingDate, maturityDate);
        ScheduledTasksStorageWrapper.requireValidTimestamp(maturityDate);
    }

    function _checkAdmins(IResolverProxy.Rbac[] calldata rbacs) private pure {
        uint256 rbacsLength = rbacs.length;
        for (uint256 rbacsIndex; rbacsIndex < rbacsLength; ) {
            if (rbacs[rbacsIndex].role == DEFAULT_ADMIN_ROLE) {
                uint256 membersLength = rbacs[rbacsIndex].members.length;
                for (uint256 adminMemberIndex; adminMemberIndex < membersLength; ) {
                    if (rbacs[rbacsIndex].members[adminMemberIndex] != address(0)) {
                        return;
                    }
                    unchecked {
                        ++adminMemberIndex;
                    }
                }
            }
            unchecked {
                ++rbacsIndex;
            }
        }
        revert NoInitialAdmins();
    }
}
