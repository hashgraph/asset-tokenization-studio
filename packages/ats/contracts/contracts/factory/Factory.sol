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
        _tryInitialize_FixedRate(bondAddress_, _bondFixedRateData.fixedRateData);

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
        _tryInitialize_ProceedRecipients(bondAddress_, _bondData.proceedRecipients, _bondData.proceedRecipientsData);

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
        _tryInitialize_ERC1410(securityAddress_, _securityData.isMultiPartition);

        // configure controller flag (ControllerFacet may not be present)
        _tryInitializeController(securityAddress_, _securityData.isControllable);

        // configure erc20 metadata (CoreFacet may not be present)
        ICore.ERC20Metadata memory erc20Metadata = ICore.ERC20Metadata({
            info: _securityData.erc20MetadataInfo,
            securityType: _securityType
        });
        ICore(securityAddress_).initializeCore(erc20Metadata);

        // configure issue flag (ERC1594Facet may not be present)
        _tryInitialize_ERC1594(securityAddress_);

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
        _tryInitialize_ERC20Votes(securityAddress_, _securityData.erc20VotesActivated);

        // configure ERC3643 (should be present)
        IERC3643(securityAddress_).initializeERC3643(_securityData.compliance, _securityData.identityRegistry);

        // configure access control (AccessControlFacet may not be present)
        _tryInitialize_AccessControl(securityAddress_);

        // configure allowance (AllowanceFacet may not be present)
        _tryInitialize_Allowance(securityAddress_);

        // configure transfer (TransferFacet may not be present)
        _tryInitialize_Transfer(securityAddress_);

        // configure core adjusted (CoreAdjustedFacet may not be present)
        _tryInitialize_CoreAdjusted(securityAddress_);

        // configure metadata (MetadataFacet may not be present)
        _tryInitialize_Metadata(securityAddress_);

        // configure freeze (FreezeFacet may not be present)
        _tryInitialize_Freeze(securityAddress_);

        // configure batch freeze (BatchFreezeFacet may not be present)
        _tryInitialize_BatchFreeze(securityAddress_);

        // configure pause (PauseFacet may not be present)
        _tryInitialize_Pause(securityAddress_);

        // configure balance tracker (BalanceTrackerFacet may not be present)
        _tryInitialize_BalanceTracker(securityAddress_);

        // configure balance tracker adjusted (BalanceTrackerAdjustedFacet may not be present)
        _tryInitialize_BalanceTrackerAdjusted(securityAddress_);

        // configure snapshots by partition (SnapshotsByPartitionFacet may not be present)
        _tryInitialize_SnapshotsByPartition(securityAddress_);

        // configure security holders at snapshot (SecurityHoldersAtSnapshotFacet may not be present)
        _tryInitialize_SecurityHoldersAtSnapshot(securityAddress_);

        // configure hold at snapshot (HoldAtSnapshotFacet may not be present)
        _tryInitialize_HoldAtSnapshot(securityAddress_);

        // configure lock at snapshot by partition (LockAtSnapshotByPartitionFacet may not be present)
        _tryInitialize_LockAtSnapshotByPartition(securityAddress_);

        // configure freeze at snapshot (FreezeAtSnapshotFacet may not be present)
        _tryInitialize_FreezeAtSnapshot(securityAddress_);

        // configure freeze at snapshot by partition (FreezeAtSnapshotByPartitionFacet may not be present)
        _tryInitialize_FreezeAtSnapshotByPartition(securityAddress_);

        // configure lock at snapshot (LockAtSnapshotFacet may not be present)
        _tryInitialize_LockAtSnapshot(securityAddress_);

        // configure core at snapshot (CoreAtSnapshotFacet may not be present)
        _tryInitialize_CoreAtSnapshot(securityAddress_);

        // configure balance tracker by partition (BalanceTrackerByPartitionFacet may not be present)
        _tryInitialize_BalanceTrackerByPartition(securityAddress_);

        // configure balance tracker at snapshot (BalanceTrackerAtSnapshotFacet may not be present)
        _tryInitialize_BalanceTrackerAtSnapshot(securityAddress_);

        // configure balance tracker at snapshot by partition (BalanceTrackerAtSnapshotByPartitionFacet
        // may not be present)
        _tryInitialize_BalanceTrackerAtSnapshotByPartition(securityAddress_);

        // configure hold at snapshot by partition (HoldAtSnapshotByPartitionFacet may not be present)
        _tryInitialize_HoldAtSnapshotByPartition(securityAddress_);

        // configure mint by partition (MintByPartitionFacet may not be present)
        _tryInitialize_MintByPartition(securityAddress_);

        // configure protected by partition (ProtectedByPartitionFacet may not be present)
        _tryInitialize_ProtectedByPartition(securityAddress_);

        // configure operator (OperatorFacet may not be present)
        _tryInitialize_Operator(securityAddress_);

        // configure transfer by partition (TransferByPartitionFacet may not be present)
        _tryInitialize_TransferByPartition(securityAddress_);

        // configure partitions (PartitionsFacet may not be present)
        _tryInitialize_Partitions(securityAddress_);

        // configure operator by partition (OperatorByPartitionFacet may not be present)
        _tryInitialize_OperatorByPartition(securityAddress_);

        // configure burn by partition (BurnByPartitionFacet may not be present)
        _tryInitialize_BurnByPartition(securityAddress_);

        // configure documentation (DocumentationFacet may not be present)
        _tryInitialize_Documentation(securityAddress_);

        // configure EIP712 (EIP712Facet may not be present)
        _tryInitialize_EIP712(securityAddress_);

        // configure nonces (NoncesFacet may not be present)
        _tryInitialize_Nonces(securityAddress_);

        // configure deactivate (DeactivateFacet may not be present)
        _tryInitialize_Deactivate(securityAddress_);

        // configure batch controller (BatchControllerFacet may not be present)
        _tryInitialize_BatchController(securityAddress_);

        // configure batch burn (BatchBurnFacet may not be present)
        _tryInitialize_BatchBurn(securityAddress_);

        // configure batch mint (BatchMintFacet may not be present)
        _tryInitialize_BatchMint(securityAddress_);

        // configure batch transfer (BatchTransferFacet may not be present)
        _tryInitialize_BatchTransfer(securityAddress_);

        // configure recovery (RecoveryFacet may not be present)
        _tryInitialize_Recovery(securityAddress_);

        // configure compliance (ComplianceFacet may not be present)
        _tryInitialize_Compliance(securityAddress_);

        // configure compliance by partition (ComplianceByPartitionFacet may not be present)
        _tryInitialize_ComplianceByPartition(securityAddress_);

        // configure burn (BurnFacet may not be present)
        _tryInitialize_Burn(securityAddress_);

        // configure protected clearing hold by partition (ProtectedClearingHoldByPartitionFacet may not be present)
        _tryInitialize_ProtectedClearingHoldByPartition(securityAddress_);

        // configure operator clearing hold by partition (OperatorClearingHoldByPartitionFacet may not be present)
        _tryInitialize_OperatorClearingHoldByPartition(securityAddress_);

        // configure operator clearing by partition (OperatorClearingByPartitionFacet may not be present)
        _tryInitialize_OperatorClearingByPartition(securityAddress_);

        // configure protected clearing by partition (ProtectedClearingByPartitionFacet may not be present)
        _tryInitialize_ProtectedClearingByPartition(securityAddress_);

        // configure hold (HoldFacet may not be present)
        _tryInitialize_Hold(securityAddress_);

        // configure operator hold by partition (OperatorHoldByPartitionFacet may not be present)
        _tryInitialize_OperatorHoldByPartition(securityAddress_);

        // configure controller hold by partition (ControllerHoldByPartitionFacet may not be present)
        _tryInitialize_ControllerHoldByPartition(securityAddress_);

        // configure controller by partition (ControllerByPartitionFacet may not be present)
        _tryInitialize_ControllerByPartition(securityAddress_);

        // configure protected hold by partition (ProtectedHoldByPartitionFacet may not be present)
        _tryInitialize_ProtectedHoldByPartition(securityAddress_);

        // configure hold by partition (HoldByPartitionFacet may not be present)
        _tryInitialize_HoldByPartition(securityAddress_);

        // configure balance adjustments (AdjustBalancesFacet may not be present)
        _tryInitialize_BalanceAdjustments(securityAddress_);

        // configure scheduled balance adjustment (ScheduledBalanceAdjustmentFacet may not be present)
        _tryInitialize_ScheduledBalanceAdjustment(securityAddress_);

        // configure lock (LockFacet may not be present)
        _tryInitialize_Lock(securityAddress_);

        // configure lock by partition (LockByPartitionFacet may not be present)
        _tryInitialize_LockByPartition(securityAddress_);

        // configure nominal value at snapshot (NominalValueAtSnapshotFacet may not be present)
        _tryInitialize_NominalValueAtSnapshot(securityAddress_);

        // configure security holders (SecurityHoldersFacet may not be present)
        _tryInitialize_SecurityHolders(securityAddress_);

        // configure SSI management (SsiManagementFacet may not be present)
        _tryInitialize_SsiManagement(securityAddress_);

        // configure corporate actions (CorporateActionsFacet may not be present)
        _tryInitialize_CorporateActions(securityAddress_);

        // configure transfer and lock (TransferAndLockFacet may not be present)
        _tryInitialize_TransferAndLock(securityAddress_);

        // configure transfer and lock by partition (TransferAndLockByPartitionFacet may not be present)
        _tryInitialize_TransferAndLockByPartition(securityAddress_);

        // configure cap by partition (CapByPartitionFacet may not be present)
        _tryInitialize_CapByPartition(securityAddress_);

        // configure dividend (DividendFacet may not be present)
        _tryInitialize_Dividend(securityAddress_);

        // configure dividend security holders (DividendSecurityHoldersFacet may not be present)
        _tryInitialize_DividendSecurityHolders(securityAddress_);

        // configure voting (VotingFacet may not be present)
        _tryInitialize_Voting(securityAddress_);

        // configure voting security holders (VotingSecurityHoldersFacet may not be present)
        _tryInitialize_VotingSecurityHolders(securityAddress_);

        // configure coupon (CouponFacet may not be present)
        _tryInitialize_Coupon(securityAddress_);

        // configure coupon listing (CouponListingFacet may not be present)
        _tryInitialize_CouponListing(securityAddress_);

        // configure coupon security holders (CouponSecurityHoldersFacet may not be present)
        _tryInitialize_CouponSecurityHolders(securityAddress_);

        // configure maturity (MaturityFacet may not be present)
        _tryInitialize_Maturity(securityAddress_);

        // configure maturity by partition (MaturityByPartitionFacet may not be present)
        _tryInitialize_MaturityByPartition(securityAddress_);

        // configure principal (PrincipalFacet may not be present)
        _tryInitialize_Principal(securityAddress_);

        // configure bond USA read (BondUSAReadFacet may not be present)
        _tryInitialize_BondUSARead(securityAddress_);
    }

    function _tryInitialize_ERC1410(address securityAddress_, bool isMultiPartition) private {
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

    function _tryInitialize_ERC1594(address securityAddress_) private {
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

    function _tryInitialize_ERC20Votes(address securityAddress_, bool erc20VotesActivated) private {
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

    function _tryInitialize_FixedRate(
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

    function _tryInitialize_ProceedRecipients(
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

    function _tryInitialize_AccessControl(address securityAddress_) private {
        try IAccessControl(securityAddress_).initializeAccessControl() {} catch {}
    }

    function _tryInitialize_Allowance(address securityAddress_) private {
        try IAllowance(securityAddress_).initializeAllowance() {} catch {}
    }

    function _tryInitialize_Transfer(address securityAddress_) private {
        try ITransfer(securityAddress_).initializeTransfer() {} catch {}
    }

    function _tryInitialize_CoreAdjusted(address securityAddress_) private {
        try ICoreAdjusted(securityAddress_).initializeCoreAdjusted() {} catch {}
    }

    function _tryInitialize_Metadata(address securityAddress_) private {
        try IMetadata(securityAddress_).initializeMetadata() {} catch {}
    }

    function _tryInitialize_Freeze(address securityAddress_) private {
        try IFreeze(securityAddress_).initializeFreeze() {} catch {}
    }

    function _tryInitialize_BatchFreeze(address securityAddress_) private {
        try IBatchFreeze(securityAddress_).initializeBatchFreeze() {} catch {}
    }

    function _tryInitialize_Pause(address securityAddress_) private {
        try IPause(securityAddress_).initializePause() {} catch {}
    }

    function _tryInitialize_BalanceTracker(address securityAddress_) private {
        try IBalanceTracker(securityAddress_).initializeBalanceTracker() {} catch {}
    }

    function _tryInitialize_BalanceTrackerAdjusted(address securityAddress_) private {
        try IBalanceTrackerAdjusted(securityAddress_).initializeBalanceTrackerAdjusted() {} catch {}
    }

    function _tryInitialize_SnapshotsByPartition(address securityAddress_) private {
        try ISnapshotsByPartition(securityAddress_).initializeSnapshotsByPartition() {} catch {}
    }

    function _tryInitialize_SecurityHoldersAtSnapshot(address securityAddress_) private {
        try ISecurityHoldersAtSnapshot(securityAddress_).initializeSecurityHoldersAtSnapshot() {} catch {}
    }

    function _tryInitialize_HoldAtSnapshot(address securityAddress_) private {
        try IHoldAtSnapshot(securityAddress_).initializeHoldAtSnapshot() {} catch {}
    }

    function _tryInitialize_LockAtSnapshotByPartition(address securityAddress_) private {
        try ILockAtSnapshotByPartition(securityAddress_).initializeLockAtSnapshotByPartition() {} catch {}
    }

    function _tryInitialize_FreezeAtSnapshot(address securityAddress_) private {
        try IFreezeAtSnapshot(securityAddress_).initializeFreezeAtSnapshot() {} catch {}
    }

    function _tryInitialize_FreezeAtSnapshotByPartition(address securityAddress_) private {
        try IFreezeAtSnapshotByPartition(securityAddress_).initializeFreezeAtSnapshotByPartition() {} catch {}
    }

    function _tryInitialize_LockAtSnapshot(address securityAddress_) private {
        try ILockAtSnapshot(securityAddress_).initializeLockAtSnapshot() {} catch {}
    }

    function _tryInitialize_CoreAtSnapshot(address securityAddress_) private {
        try ICoreAtSnapshot(securityAddress_).initializeCoreAtSnapshot() {} catch {}
    }

    function _tryInitialize_BalanceTrackerByPartition(address securityAddress_) private {
        try IBalanceTrackerByPartition(securityAddress_).initializeBalanceTrackerByPartition() {} catch {}
    }

    function _tryInitialize_BalanceTrackerAtSnapshot(address securityAddress_) private {
        try IBalanceTrackerAtSnapshot(securityAddress_).initializeBalanceTrackerAtSnapshot() {} catch {}
    }

    function _tryInitialize_BalanceTrackerAtSnapshotByPartition(address securityAddress_) private {
        try
            IBalanceTrackerAtSnapshotByPartition(securityAddress_).initializeBalanceTrackerAtSnapshotByPartition()
        {} catch {}
    }

    function _tryInitialize_HoldAtSnapshotByPartition(address securityAddress_) private {
        try IHoldAtSnapshotByPartition(securityAddress_).initializeHoldAtSnapshotByPartition() {} catch {}
    }

    function _tryInitialize_MintByPartition(address securityAddress_) private {
        try IMintByPartition(securityAddress_).initializeMintByPartition() {} catch {}
    }

    function _tryInitialize_ProtectedByPartition(address securityAddress_) private {
        try IProtectedByPartition(securityAddress_).initializeProtectedByPartition() {} catch {}
    }

    function _tryInitialize_Operator(address securityAddress_) private {
        try IOperator(securityAddress_).initializeOperator() {} catch {}
    }

    function _tryInitialize_TransferByPartition(address securityAddress_) private {
        try ITransferByPartition(securityAddress_).initializeTransferByPartition() {} catch {}
    }

    function _tryInitialize_Partitions(address securityAddress_) private {
        try IPartitions(securityAddress_).initializePartitions() {} catch {}
    }

    function _tryInitialize_OperatorByPartition(address securityAddress_) private {
        try IOperatorByPartition(securityAddress_).initializeOperatorByPartition() {} catch {}
    }

    function _tryInitialize_BurnByPartition(address securityAddress_) private {
        try IBurnByPartition(securityAddress_).initializeBurnByPartition() {} catch {}
    }

    function _tryInitialize_Documentation(address securityAddress_) private {
        try IDocumentation(securityAddress_).initializeDocumentation() {} catch {}
    }

    function _tryInitialize_EIP712(address securityAddress_) private {
        try IEIP712(securityAddress_).initializeEIP712() {} catch {}
    }

    function _tryInitialize_Nonces(address securityAddress_) private {
        try INonces(securityAddress_).initializeNonces() {} catch {}
    }

    function _tryInitialize_Deactivate(address securityAddress_) private {
        try IDeactivate(securityAddress_).initializeDeactivate() {} catch {}
    }

    function _tryInitialize_BatchController(address securityAddress_) private {
        try IBatchController(securityAddress_).initializeBatchController() {} catch {}
    }

    function _tryInitialize_BatchBurn(address securityAddress_) private {
        try IBatchBurn(securityAddress_).initializeBatchBurn() {} catch {}
    }

    function _tryInitialize_BatchMint(address securityAddress_) private {
        try IBatchMint(securityAddress_).initializeBatchMint() {} catch {}
    }

    function _tryInitialize_BatchTransfer(address securityAddress_) private {
        try IBatchTransfer(securityAddress_).initializeBatchTransfer() {} catch {}
    }

    function _tryInitialize_Recovery(address securityAddress_) private {
        try IRecovery(securityAddress_).initializeRecovery() {} catch {}
    }

    function _tryInitialize_Compliance(address securityAddress_) private {
        try IComplianceFacet(securityAddress_).initializeCompliance() {} catch {}
    }

    function _tryInitialize_ComplianceByPartition(address securityAddress_) private {
        try IComplianceByPartition(securityAddress_).initializeComplianceByPartition() {} catch {}
    }

    function _tryInitialize_Burn(address securityAddress_) private {
        try IBurn(securityAddress_).initializeBurn() {} catch {}
    }

    function _tryInitialize_ProtectedClearingHoldByPartition(address securityAddress_) private {
        try IProtectedClearingHoldByPartition(securityAddress_).initializeProtectedClearingHoldByPartition() {} catch {}
    }

    function _tryInitialize_OperatorClearingHoldByPartition(address securityAddress_) private {
        try IOperatorClearingHoldByPartition(securityAddress_).initializeOperatorClearingHoldByPartition() {} catch {}
    }

    function _tryInitialize_OperatorClearingByPartition(address securityAddress_) private {
        try IOperatorClearingByPartition(securityAddress_).initializeOperatorClearingByPartition() {} catch {}
    }

    function _tryInitialize_ProtectedClearingByPartition(address securityAddress_) private {
        try IProtectedClearingByPartition(securityAddress_).initializeProtectedClearingByPartition() {} catch {}
    }

    function _tryInitialize_Hold(address securityAddress_) private {
        try IHoldFacet(securityAddress_).initializeHold() {} catch {}
    }

    function _tryInitialize_OperatorHoldByPartition(address securityAddress_) private {
        try IOperatorHoldByPartition(securityAddress_).initializeOperatorHoldByPartition() {} catch {}
    }

    function _tryInitialize_ControllerHoldByPartition(address securityAddress_) private {
        try IControllerHoldByPartition(securityAddress_).initializeControllerHoldByPartition() {} catch {}
    }

    function _tryInitialize_ControllerByPartition(address securityAddress_) private {
        try IControllerByPartition(securityAddress_).initializeControllerByPartition() {} catch {}
    }

    function _tryInitialize_ProtectedHoldByPartition(address securityAddress_) private {
        try IProtectedHoldByPartition(securityAddress_).initializeProtectedHoldByPartition() {} catch {}
    }

    function _tryInitialize_HoldByPartition(address securityAddress_) private {
        try IHoldByPartition(securityAddress_).initializeHoldByPartition() {} catch {}
    }

    function _tryInitialize_BalanceAdjustments(address securityAddress_) private {
        try IAdjustBalances(securityAddress_).initializeBalanceAdjustments() {} catch {}
    }

    function _tryInitialize_ScheduledBalanceAdjustment(address securityAddress_) private {
        try IScheduledBalanceAdjustment(securityAddress_).initializeScheduledBalanceAdjustment() {} catch {}
    }

    function _tryInitialize_Lock(address securityAddress_) private {
        try ILock(securityAddress_).initializeLock() {} catch {}
    }

    function _tryInitialize_LockByPartition(address securityAddress_) private {
        try ILockByPartition(securityAddress_).initializeLockByPartition() {} catch {}
    }

    function _tryInitialize_NominalValueAtSnapshot(address securityAddress_) private {
        try INominalValueAtSnapshot(securityAddress_).initializeNominalValueAtSnapshot() {} catch {}
    }

    function _tryInitialize_SecurityHolders(address securityAddress_) private {
        try ISecurityHolders(securityAddress_).initializeSecurityHolders() {} catch {}
    }

    function _tryInitialize_SsiManagement(address securityAddress_) private {
        try ISsiManagement(securityAddress_).initializeSsiManagement() {} catch {}
    }

    function _tryInitialize_CorporateActions(address securityAddress_) private {
        try ICorporateActions(securityAddress_).initializeCorporateActions() {} catch {}
    }

    function _tryInitialize_TransferAndLock(address securityAddress_) private {
        try ITransferAndLock(securityAddress_).initializeTransferAndLock() {} catch {}
    }

    function _tryInitialize_TransferAndLockByPartition(address securityAddress_) private {
        try ITransferAndLockByPartition(securityAddress_).initializeTransferAndLockByPartition() {} catch {}
    }

    function _tryInitialize_CapByPartition(address securityAddress_) private {
        try ICapByPartition(securityAddress_).initializeCapByPartition() {} catch {}
    }

    function _tryInitialize_Dividend(address securityAddress_) private {
        try IDividend(securityAddress_).initializeDividend() {} catch {}
    }

    function _tryInitialize_DividendSecurityHolders(address securityAddress_) private {
        try IDividendSecurityHolders(securityAddress_).initializeDividendSecurityHolders() {} catch {}
    }

    function _tryInitialize_Voting(address securityAddress_) private {
        try IVoting(securityAddress_).initializeVoting() {} catch {}
    }

    function _tryInitialize_VotingSecurityHolders(address securityAddress_) private {
        try IVotingSecurityHolders(securityAddress_).initializeVotingSecurityHolders() {} catch {}
    }

    function _tryInitialize_Coupon(address securityAddress_) private {
        try ICoupon(securityAddress_).initializeCoupon() {} catch {}
    }

    function _tryInitialize_CouponListing(address securityAddress_) private {
        try ICouponListing(securityAddress_).initializeCouponListing() {} catch {}
    }

    function _tryInitialize_CouponSecurityHolders(address securityAddress_) private {
        try ICouponSecurityHolders(securityAddress_).initializeCouponSecurityHolders() {} catch {}
    }

    function _tryInitialize_Maturity(address securityAddress_) private {
        try IMaturity(securityAddress_).initializeMaturity() {} catch {}
    }

    function _tryInitialize_MaturityByPartition(address securityAddress_) private {
        try IMaturityByPartition(securityAddress_).initializeMaturityByPartition() {} catch {}
    }

    function _tryInitialize_Principal(address securityAddress_) private {
        try IPrincipal(securityAddress_).initializePrincipal() {} catch {}
    }

    function _tryInitialize_BondUSARead(address securityAddress_) private {
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
