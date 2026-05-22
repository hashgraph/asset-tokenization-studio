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
 *      `ResolverProxy` and initialises all facets. If any initialisation fails the whole
 *      deployment reverts.
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

        IEquityUSA(equityAddress_).initializeEquityUSA(_equityData.equityDetails);

        ISecurity(equityAddress_).initializeSecurity(
            _buildRegulationData(_factoryRegulationData.regulationType, _factoryRegulationData.regulationSubType),
            _factoryRegulationData.additionalSecurityData
        );

        INominalValue(equityAddress_).initializeNominalValue(
            _equityData.equityDetails.nominalValue,
            _equityData.equityDetails.nominalValueDecimals,
            _equityData.equityDetails.currency
        );

        IInterestRate(equityAddress_).initializeInterestRateType(IInterestRate.RateType.STANDARD);

        IDividend(equityAddress_).initializeDividend();
        IDividendSecurityHolders(equityAddress_).initializeDividendSecurityHolders();
        IVoting(equityAddress_).initializeVoting();
        IVotingSecurityHolders(equityAddress_).initializeVotingSecurityHolders();

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

        IInterestRate(bondAddress_).initializeInterestRateType(IInterestRate.RateType.STANDARD);

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

        IFixedRate(bondAddress_).initializeFixedRate(_bondFixedRateData.fixedRateData);

        IInterestRate(bondAddress_).initializeInterestRateType(IInterestRate.RateType.FIXED);

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

        IBondUSA(bondAddress_).initializeBondUSA(_bondData.bondDetails);

        ISecurity(bondAddress_).initializeSecurity(
            _buildRegulationData(_factoryRegulationData.regulationType, _factoryRegulationData.regulationSubType),
            _factoryRegulationData.additionalSecurityData
        );

        IProceedRecipients(bondAddress_).initializeProceedRecipients(
            _bondData.proceedRecipients,
            _bondData.proceedRecipientsData
        );

        INominalValue(bondAddress_).initializeNominalValue(
            _bondData.bondDetails.nominalValue,
            _bondData.bondDetails.nominalValueDecimals,
            _bondData.bondDetails.currency
        );

        ICoupon(bondAddress_).initializeCoupon();
        ICouponListing(bondAddress_).initializeCouponListing();
        ICouponSecurityHolders(bondAddress_).initializeCouponSecurityHolders();
        IMaturity(bondAddress_).initializeMaturity();
        IMaturityByPartition(bondAddress_).initializeMaturityByPartition();
        IPrincipal(bondAddress_).initializePrincipal();
        IBondRead(bondAddress_).initializeBondUSARead();
    }

    function _deployBondKpiLinkedRate(BondKpiLinkedRateData calldata _data) internal returns (address bondAddress_) {
        bondAddress_ = _deployBond(_data.bondData, _data.factoryRegulationData, SecurityType.BondKpiLinkedRate);

        IKpiLinkedRate(bondAddress_).initializeKpiLinkedRate(_data.interestRate, _data.impactData);
        IInterestRate(bondAddress_).initializeInterestRateType(IInterestRate.RateType.KPI_LINKED);
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

        // configure multi partition flag
        IERC1410Management(securityAddress_).initializeERC1410(_securityData.isMultiPartition);

        // configure controller flag
        IController(securityAddress_).initializeController(_securityData.isControllable);

        // configure erc20 metadata
        ICore.ERC20Metadata memory erc20Metadata = ICore.ERC20Metadata({
            info: _securityData.erc20MetadataInfo,
            securityType: _securityType
        });
        ICore(securityAddress_).initializeCore(erc20Metadata);

        // configure issue flag
        IMint(securityAddress_).initializeERC1594();

        // configure cap
        ICap(securityAddress_).initializeCap(_securityData.maxSupply, new ICap.PartitionCap[](0));

        // configure protected partitions
        IProtectedPartitions(securityAddress_).initializeProtectedPartitions(_securityData.arePartitionsProtected);

        // configure clearing
        IClearing(securityAddress_).initializeClearing(_securityData.clearingActive);

        // configure external pauses
        IExternalPauseManagement(securityAddress_).initializeExternalPauses(_securityData.externalPauses);

        // configure external control lists
        IExternalControlListManagement(securityAddress_).initializeExternalControlLists(
            _securityData.externalControlLists
        );

        // configure internal KYC
        IKyc(securityAddress_).initializeInternalKyc(_securityData.internalKycActivated);

        // configure external KYC lists
        IExternalKycListManagement(securityAddress_).initializeExternalKycLists(_securityData.externalKycLists);

        // configure ERC20Votes
        IERC20Votes(securityAddress_).initializeERC20Votes(_securityData.erc20VotesActivated);

        // configure ERC3643
        IERC3643(securityAddress_).initializeERC3643(_securityData.compliance, _securityData.identityRegistry);

        // configure access control
        IAccessControl(securityAddress_).initializeAccessControl();

        // configure allowance
        IAllowance(securityAddress_).initializeAllowance();

        // configure transfer
        ITransfer(securityAddress_).initializeTransfer();

        // configure core adjusted
        ICoreAdjusted(securityAddress_).initializeCoreAdjusted();

        // configure metadata
        IMetadata(securityAddress_).initializeMetadata();

        // configure freeze
        IFreeze(securityAddress_).initializeFreeze();

        // configure batch freeze
        IBatchFreeze(securityAddress_).initializeBatchFreeze();

        // configure pause
        IPause(securityAddress_).initializePause();

        // configure balance tracker
        IBalanceTracker(securityAddress_).initializeBalanceTracker();

        // configure balance tracker adjusted
        IBalanceTrackerAdjusted(securityAddress_).initializeBalanceTrackerAdjusted();

        // configure snapshots by partition
        ISnapshotsByPartition(securityAddress_).initializeSnapshotsByPartition();

        // configure security holders at snapshot
        ISecurityHoldersAtSnapshot(securityAddress_).initializeSecurityHoldersAtSnapshot();

        // configure hold at snapshot
        IHoldAtSnapshot(securityAddress_).initializeHoldAtSnapshot();

        // configure lock at snapshot by partition
        ILockAtSnapshotByPartition(securityAddress_).initializeLockAtSnapshotByPartition();

        // configure freeze at snapshot
        IFreezeAtSnapshot(securityAddress_).initializeFreezeAtSnapshot();

        // configure freeze at snapshot by partition
        IFreezeAtSnapshotByPartition(securityAddress_).initializeFreezeAtSnapshotByPartition();

        // configure lock at snapshot
        ILockAtSnapshot(securityAddress_).initializeLockAtSnapshot();

        // configure core at snapshot
        ICoreAtSnapshot(securityAddress_).initializeCoreAtSnapshot();

        // configure balance tracker by partition
        IBalanceTrackerByPartition(securityAddress_).initializeBalanceTrackerByPartition();

        // configure balance tracker at snapshot
        IBalanceTrackerAtSnapshot(securityAddress_).initializeBalanceTrackerAtSnapshot();

        // configure balance tracker at snapshot by partition
        IBalanceTrackerAtSnapshotByPartition(securityAddress_).initializeBalanceTrackerAtSnapshotByPartition();

        // configure hold at snapshot by partition
        IHoldAtSnapshotByPartition(securityAddress_).initializeHoldAtSnapshotByPartition();

        // configure mint by partition
        IMintByPartition(securityAddress_).initializeMintByPartition();

        // configure protected by partition
        IProtectedByPartition(securityAddress_).initializeProtectedByPartition();

        // configure operator
        IOperator(securityAddress_).initializeOperator();

        // configure transfer by partition
        ITransferByPartition(securityAddress_).initializeTransferByPartition();

        // configure partitions
        IPartitions(securityAddress_).initializePartitions();

        // configure operator by partition
        IOperatorByPartition(securityAddress_).initializeOperatorByPartition();

        // configure burn by partition
        IBurnByPartition(securityAddress_).initializeBurnByPartition();

        // configure documentation
        IDocumentation(securityAddress_).initializeDocumentation();

        // configure EIP712
        IEIP712(securityAddress_).initializeEIP712();

        // configure nonces
        INonces(securityAddress_).initializeNonces();

        // configure deactivate
        IDeactivate(securityAddress_).initializeDeactivate();

        // configure batch controller
        IBatchController(securityAddress_).initializeBatchController();

        // configure batch burn
        IBatchBurn(securityAddress_).initializeBatchBurn();

        // configure batch mint
        IBatchMint(securityAddress_).initializeBatchMint();

        // configure batch transfer
        IBatchTransfer(securityAddress_).initializeBatchTransfer();

        // configure recovery
        IRecovery(securityAddress_).initializeRecovery();

        // configure compliance
        IComplianceFacet(securityAddress_).initializeCompliance();

        // configure compliance by partition
        IComplianceByPartition(securityAddress_).initializeComplianceByPartition();

        // configure burn
        IBurn(securityAddress_).initializeBurn();

        // configure protected clearing hold by partition
        IProtectedClearingHoldByPartition(securityAddress_).initializeProtectedClearingHoldByPartition();

        // configure operator clearing hold by partition
        IOperatorClearingHoldByPartition(securityAddress_).initializeOperatorClearingHoldByPartition();

        // configure operator clearing by partition
        IOperatorClearingByPartition(securityAddress_).initializeOperatorClearingByPartition();

        // configure protected clearing by partition
        IProtectedClearingByPartition(securityAddress_).initializeProtectedClearingByPartition();

        // configure hold
        IHoldFacet(securityAddress_).initializeHold();

        // configure operator hold by partition
        IOperatorHoldByPartition(securityAddress_).initializeOperatorHoldByPartition();

        // configure controller hold by partition
        IControllerHoldByPartition(securityAddress_).initializeControllerHoldByPartition();

        // configure controller by partition
        IControllerByPartition(securityAddress_).initializeControllerByPartition();

        // configure protected hold by partition
        IProtectedHoldByPartition(securityAddress_).initializeProtectedHoldByPartition();

        // configure hold by partition
        IHoldByPartition(securityAddress_).initializeHoldByPartition();

        // configure balance adjustments
        IAdjustBalances(securityAddress_).initializeBalanceAdjustments();

        // configure scheduled balance adjustment
        IScheduledBalanceAdjustment(securityAddress_).initializeScheduledBalanceAdjustment();

        // configure lock
        ILock(securityAddress_).initializeLock();

        // configure lock by partition
        ILockByPartition(securityAddress_).initializeLockByPartition();

        // configure nominal value at snapshot
        INominalValueAtSnapshot(securityAddress_).initializeNominalValueAtSnapshot();

        // configure security holders
        ISecurityHolders(securityAddress_).initializeSecurityHolders();

        // configure SSI management
        ISsiManagement(securityAddress_).initializeSsiManagement();

        // configure corporate actions
        ICorporateActions(securityAddress_).initializeCorporateActions();

        // configure transfer and lock
        ITransferAndLock(securityAddress_).initializeTransferAndLock();

        // configure transfer and lock by partition
        ITransferAndLockByPartition(securityAddress_).initializeTransferAndLockByPartition();

        // configure cap by partition
        ICapByPartition(securityAddress_).initializeCapByPartition();
    }

    function _emitBondKpiLinkedRateDeployed(
        address _bondAddress,
        BondKpiLinkedRateData calldata _bondKpiLinkedRateData
    ) private {
        emit BondKpiLinkedRateDeployed(EvmAccessors.getMsgSender(), _bondAddress, _bondKpiLinkedRateData);
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
