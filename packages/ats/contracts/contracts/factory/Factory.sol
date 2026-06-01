// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFactory } from "./IFactory.sol";
import { _checkUnexpectedError } from "../infrastructure/utils/UnexpectedError.sol";
import { FACTORY_OPERATIONAL_STATUS } from "../constants/values.sol";
import { ResolverProxy } from "../infrastructure/proxy/ResolverProxy.sol";
import { IResolverProxy } from "../infrastructure/proxy/IResolverProxy.sol";
import { DEFAULT_ADMIN_ROLE } from "../constants/roles.sol";
import { IAccessControl } from "../facets/accessControl/IAccessControl.sol";
import { IInitializer } from "../facets/initializer/IInitializer.sol";
import { IControlList } from "../facets/controlList/IControlList.sol";
import { ICore } from "../facets/core/ICore.sol";
import { IERC20Votes } from "../facets/layer_1/ERC1400/ERC20Votes/IERC20Votes.sol";
import { IController } from "../facets/controller/IController.sol";
import { ICap } from "../facets/cap/ICap.sol";
import { IMint } from "../facets/mint/IMint.sol";
import { IClearing } from "../facets/clearing/IClearing.sol";
import { IDiamondFacet } from "../infrastructure/diamond/IDiamondFacet.sol";
import { IBusinessLogicResolver } from "../infrastructure/diamond/IBusinessLogicResolver.sol";
import {
    FactoryRegulationData,
    _buildRegulationData,
    RegulationData,
    RegulationType,
    RegulationSubType,
    _checkRegulationTypeAndSubType
} from "../constants/regulation.sol";
import { IEquityUSA } from "../facets/layer_3/equityUSA/IEquityUSA.sol";
import { IBondUSA } from "../facets/layer_3/bondUSA/IBondUSA.sol";
import { ISecurity } from "../facets/layer_2/security/ISecurity.sol";
import { IBondRead } from "../facets/layer_2/bond/IBondRead.sol";
import { IClearingAtSnapshot } from "../facets/clearingAtSnapshot/IClearingAtSnapshot.sol";
import {
    IClearingAtSnapshotByPartition
} from "../facets/clearingAtSnapshotByPartition/IClearingAtSnapshotByPartition.sol";
import { IClearingByPartition } from "../facets/clearingByPartition/IClearingByPartition.sol";
import { IClearingHoldByPartition } from "../facets/clearingHoldByPartition/IClearingHoldByPartition.sol";
import { IERC20Permit } from "../facets/layer_1/ERC1400/ERC20Permit/IERC20Permit.sol";
import { IIdentity } from "../facets/identity/IIdentity.sol";
import {
    IScheduledCrossOrderedTasks
} from "../facets/layer_2/scheduledTask/scheduledCrossOrderedTask/IScheduledCrossOrderedTasks.sol";
import { ISnapshots } from "../facets/layer_1/snapshot/ISnapshots.sol";
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
import { _validateISIN } from "./isinValidator.sol";
import { IFixedRate } from "../facets/layer_2/interestRate/fixedRate/IFixedRate.sol";
import { IKpiLinkedRate } from "../facets/layer_2/interestRate/kpiLinkedRate/IKpiLinkedRate.sol";
import { InterestRateStorageWrapper } from "../domain/asset/InterestRateStorageWrapper.sol";
import { IInterestRate } from "../facets/interestRate/IInterestRate.sol";
import { EvmAccessors } from "../infrastructure/utils/EvmAccessors.sol";
import { DatesValidation } from "../infrastructure/utils/DatesValidation.sol";
import { IAdjustBalances } from "../facets/adjustBalances/IAdjustBalances.sol";
import { IKpis } from "../facets/layer_2/kpi/kpiLatest/IKpis.sol";
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
import { ICustomData } from "../facets/customData/ICustomData.sol";
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
 * @notice Provides shared proxy deployment and initialisation flows for ATS securities.
 * @dev Concrete factories inherit this contract to deploy resolver-backed security proxies.
 *      Deployment temporarily grants this factory `DEFAULT_ADMIN_ROLE`, initialises all
 *      required facets, verifies operational status, and then renounces the temporary role.
 * @author Asset Tokenization Studio Team
 */
abstract contract Factory is IFactory {
    /**
     * @notice Maximum number of security facets validated in one operational-status pass.
     * @dev Must remain greater than or equal to the largest deployed security configuration.
     *      Increasing the configured facet set beyond this value requires updating this
     *      constant or accepting multi-transaction operational-status completion.
     */
    uint256 private constant _SECURITY_FACETS_MAX = 150;

    /**
     * @notice Ensures a non-zero business logic resolver is provided.
     * @dev Reverts with `EmptyResolver` when the resolver address is zero.
     * @param resolver Resolver that will supply facet configuration for the proxy.
     */
    modifier checkResolver(IBusinessLogicResolver resolver) {
        if (address(resolver) == address(0)) {
            revert EmptyResolver(resolver);
        }
        _;
    }

    /**
     * @notice Ensures the provided ISIN satisfies the project validator.
     * @dev Reverts according to `_validateISIN` when the identifier is malformed.
     * @param isin International Securities Identification Number to validate.
     */
    modifier checkISIN(string calldata isin) {
        _validateISIN(isin);
        _;
    }

    /**
     * @notice Ensures the initial RBAC configuration includes at least one admin.
     * @dev Reverts with `NoInitialAdmins` unless a non-zero `DEFAULT_ADMIN_ROLE` member
     *      exists in the supplied RBAC entries.
     * @param rbacs Initial role assignments passed to the deployed proxy.
     */
    modifier checkAdmins(IResolverProxy.Rbac[] calldata rbacs) {
        _checkAdmins(rbacs);
        _;
    }

    /**
     * @notice Ensures the regulation type and sub-type combination is supported.
     * @dev Reverts according to `_checkRegulationTypeAndSubType` for invalid combinations.
     * @param _regulationType Primary regulation category.
     * @param _regulationSubType Secondary regulation category.
     */
    modifier checkRegulation(RegulationType _regulationType, RegulationSubType _regulationSubType) {
        _checkRegulationTypeAndSubType(_regulationType, _regulationSubType);
        _;
    }

    /**
     * @notice Ensures KPI-linked interest rate data is valid before deployment.
     * @dev Reverts according to `InterestRateStorageWrapper.requireValidInterestRate`.
     * @param _newInterestRate KPI-linked interest rate configuration to validate.
     */
    modifier checkInterestRate(IKpiLinkedRate.InterestRate calldata _newInterestRate) {
        InterestRateStorageWrapper.requireValidInterestRate(_newInterestRate);
        _;
    }

    /**
     * @notice Ensures KPI impact data is valid before deployment.
     * @dev Reverts according to `InterestRateStorageWrapper.requireValidImpactData`.
     * @param _newImpactData KPI impact configuration to validate.
     */
    modifier checkImpactData(IKpiLinkedRate.ImpactData calldata _newImpactData) {
        InterestRateStorageWrapper.requireValidImpactData(_newImpactData);
        _;
    }

    /**
     * @notice Ensures bond dates are chronologically valid and schedulable.
     * @dev Reverts when the maturity date is not after the start date or is an invalid
     *      scheduled-task timestamp.
     * @param startingDate Bond start timestamp.
     * @param maturityDate Bond maturity timestamp.
     */
    modifier checkBondDates(uint256 startingDate, uint256 maturityDate) {
        _checkBondDates(startingDate, maturityDate);
        _;
    }

    /**
     * @notice Deploys a resolver proxy without asset-specific facet initialisation.
     * @dev The resolver must be non-zero and `_rbacs` must include at least one non-zero
     *      `DEFAULT_ADMIN_ROLE` member. Emits `ProxyDeployed`.
     * @param _resolver Business logic resolver used by the proxy.
     * @param _configKey Resolver configuration key selecting the facet set.
     * @param _version Resolver configuration version to activate.
     * @param _rbacs Initial RBAC assignments applied by the proxy constructor.
     * @return proxyAddress_ Address of the deployed resolver proxy.
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
     * @notice Deploys and initialises an equity security proxy.
     * @dev Validates resolver, ISIN, admin RBAC and regulation data. Initialises equity,
     *      security, nominal value, dividend, voting and common security facets, marks the
     *      proxy operational, renounces this factory's temporary admin role and emits
     *      `EquityDeployed`.
     * @param _equityData Equity deployment data, including common security configuration.
     * @param _factoryRegulationData Regulation selection and additional security data.
     * @return equityAddress_ Address of the deployed equity proxy.
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
        IProceedRecipients(equityAddress_).initializeProceedRecipients(new address[](0), new bytes[](0));
        IDividend(equityAddress_).initializeDividend();
        IDividendSecurityHolders(equityAddress_).initializeDividendSecurityHolders();
        IVoting(equityAddress_).initializeVoting();
        IVotingSecurityHolders(equityAddress_).initializeVotingSecurityHolders();
        (bool isOperational_, ) = IInitializer(equityAddress_).setOperationalStatus();
        _checkUnexpectedError(!isOperational_, FACTORY_OPERATIONAL_STATUS);
        IAccessControl(equityAddress_).renounceRole(DEFAULT_ADMIN_ROLE);
        emit EquityDeployed(EvmAccessors.getMsgSender(), equityAddress_, _equityData, _factoryRegulationData);
    }

    /**
     * @notice Deploys and initialises a variable-rate bond security proxy.
     * @dev Validates resolver, ISIN, admin RBAC, regulation data and bond dates. Initialises
     *      bond-specific and common facets, sets the rate type to standard, marks the proxy
     *      operational, renounces this factory's temporary admin role and emits `BondDeployed`.
     * @param _bondData Bond deployment data, including common security configuration.
     * @param _factoryRegulationData Regulation selection and additional security data.
     * @return bondAddress_ Address of the deployed bond proxy.
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
        (bool isOperational_, ) = IInitializer(bondAddress_).setOperationalStatus();
        _checkUnexpectedError(!isOperational_, FACTORY_OPERATIONAL_STATUS);
        IAccessControl(bondAddress_).renounceRole(DEFAULT_ADMIN_ROLE);
        emit BondDeployed(EvmAccessors.getMsgSender(), bondAddress_, _bondData, _factoryRegulationData);
    }

    /**
     * @notice Deploys and initialises a fixed-rate bond security proxy.
     * @dev Validates resolver, ISIN, admin RBAC, regulation data and bond dates. Initialises
     *      bond-specific and fixed-rate facets, marks the proxy operational, renounces this
     *      factory's temporary admin role and emits `BondFixedRateDeployed`.
     * @param _bondFixedRateData Fixed-rate bond deployment, regulation and rate data.
     * @return bondAddress_ Address of the deployed fixed-rate bond proxy.
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
        (bool isOperational_, ) = IInitializer(bondAddress_).setOperationalStatus();
        _checkUnexpectedError(!isOperational_, FACTORY_OPERATIONAL_STATUS);
        IAccessControl(bondAddress_).renounceRole(DEFAULT_ADMIN_ROLE);
        emit BondFixedRateDeployed(EvmAccessors.getMsgSender(), bondAddress_, _bondFixedRateData);
    }

    /**
     * @notice Deploys and initialises a KPI-linked-rate bond security proxy.
     * @dev Validates resolver, ISIN, admin RBAC, regulation data, KPI rate data, impact data
     *      and bond dates. Initialises bond-specific and KPI-linked facets, marks the proxy
     *      operational, renounces this factory's temporary admin role and emits
     *      `BondKpiLinkedRateDeployed`.
     * @param _bondKpiLinkedRateData KPI-linked bond deployment, regulation and rate data.
     * @return bondAddress_ Address of the deployed KPI-linked-rate bond proxy.
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
        (bool isOperational_, ) = IInitializer(bondAddress_).setOperationalStatus();
        _checkUnexpectedError(!isOperational_, FACTORY_OPERATIONAL_STATUS);
        IAccessControl(bondAddress_).renounceRole(DEFAULT_ADMIN_ROLE);
        _emitBondKpiLinkedRateDeployed(bondAddress_, _bondKpiLinkedRateData);
    }

    /**
     * @notice Deploys and fully initialises a deposit token proxy.
     * @dev Creates the proxy and initialises its facets via `_deployDepositToken`, marks the
     *      proxy operational and renounces this factory's temporary `DEFAULT_ADMIN_ROLE`. The
     *      deposit token configuration does not include `SecurityFacet`, so
     *      `_factoryRegulationData` is validated by `checkRegulation` and emitted in
     *      `DepositTokenDeployed` but not persisted on-chain.
     * @param _depositTokenData Deposit token creation data wrapping the shared `SecurityData`.
     * @param _factoryRegulationData Regulation type and sub-type validated for the deposit token.
     * @return depositTokenAddress_ Address of the newly deployed deposit token proxy.
     */
    function deployDepositToken(
        DepositTokenData calldata _depositTokenData,
        FactoryRegulationData calldata _factoryRegulationData
    )
        external
        checkResolver(_depositTokenData.security.resolver)
        checkISIN(_depositTokenData.security.erc20MetadataInfo.isin)
        checkAdmins(_depositTokenData.security.rbacs)
        checkRegulation(_factoryRegulationData.regulationType, _factoryRegulationData.regulationSubType)
        returns (address depositTokenAddress_)
    {
        depositTokenAddress_ = _deployDepositToken(_depositTokenData.security, SecurityType.DepositToken);
        (bool isOperational_, ) = IInitializer(depositTokenAddress_).setOperationalStatus();
        _checkUnexpectedError(!isOperational_, FACTORY_OPERATIONAL_STATUS);
        IAccessControl(depositTokenAddress_).renounceRole(DEFAULT_ADMIN_ROLE);
        emit DepositTokenDeployed(
            EvmAccessors.getMsgSender(),
            depositTokenAddress_,
            _depositTokenData,
            _factoryRegulationData
        );
    }

    /**
     * @notice Builds and returns the full `RegulationData` struct for a given regulation type
     *         and sub-type combination.
     * @param _regulationType The primary regulation category.
     * @param _regulationSubType The secondary regulation category.
     * @return regulationData_ The constructed `RegulationData` struct.
     */
    /// @inheritdoc IFactory
    function getAppliedRegulationData(
        RegulationType _regulationType,
        RegulationSubType _regulationSubType
    ) external pure override returns (RegulationData memory regulationData_) {
        regulationData_ = _buildRegulationData(_regulationType, _regulationSubType);
    }

    /**
     * @notice Deploys and initialises the shared bond facet set.
     * @dev Creates the security proxy, initialises bond, security, proceed-recipient,
     *      nominal-value, coupon, maturity and principal facets. Operational status and
     *      factory admin renouncement are handled by the public deployment functions.
     * @param _bondData Bond deployment data.
     * @param _factoryRegulationData Regulation selection and additional security data.
     * @param _securityType Concrete bond security type used in core metadata.
     * @return bondAddress_ Address of the deployed bond proxy.
     */
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

    /**
     * @notice Deploys and initialises the KPI-linked-rate bond facet set.
     * @dev Builds on `_deployBond`, then initialises KPI-linked rate metadata, rate type and
     *      KPI tracking. Operational status and admin renouncement remain caller concerns.
     * @param _data KPI-linked bond deployment data.
     * @return bondAddress_ Address of the deployed KPI-linked-rate bond proxy.
     */
    function _deployBondKpiLinkedRate(BondKpiLinkedRateData calldata _data) internal returns (address bondAddress_) {
        bondAddress_ = _deployBond(_data.bondData, _data.factoryRegulationData, SecurityType.BondKpiLinkedRate);
        IKpiLinkedRate(bondAddress_).initializeKpiLinkedRate(_data.interestRate, _data.impactData);
        IInterestRate(bondAddress_).initializeInterestRateType(IInterestRate.RateType.KPI_LINKED);
        IKpis(bondAddress_).initializeKpis();
    }

    /**
     * @notice Deploys a security proxy and initialises all common security facets.
     * @dev Appends this factory as a temporary `DEFAULT_ADMIN_ROLE` holder to allow facet
     *      initialisation. Callers must later mark the proxy operational and renounce that role.
     * @param _securityData Common security deployment configuration.
     * @param _securityType Security type recorded in core metadata.
     * @return securityAddress_ Address of the deployed security proxy.
     */
    function _deploySecurity(
        SecurityData calldata _securityData,
        SecurityType _securityType
    ) internal virtual returns (address securityAddress_) {
        securityAddress_ = _deploySecurityProxy(_securityData);
        _initializeSecurityMetadata(securityAddress_, _securityData, _securityType);
        _initializeSecurityCompliance(securityAddress_);
        _initializeCoreFacets(securityAddress_);
        _initializeSnapshotFacets(securityAddress_);
        _initializeManagementFacets(securityAddress_);
        _initializeHoldFacets(securityAddress_);
        _initializeClearingFacets(securityAddress_);
        _initializeMiscellaneousFacets(securityAddress_);
    }

    /**
     * @notice Deploys a deposit-token proxy and initialises only the facets it exposes.
     * @dev Initialises exactly the facets registered for the deposit-token resolver
     *      configuration and no others; in particular it does not call the snapshot, lock,
     *      transfer-and-lock, corporate-action, identity, recovery, SSI, balance-adjustment,
     *      scheduled-task, ERC20-permit, ERC20-votes, compliance, KYC, external-pause or
     *      protected-partition initialisers. Each initialiser invoked here requires its facet to
     *      be present in the resolver configuration, otherwise `IInitializer.setOperationalStatus`
     *      cannot mark the proxy operational. The `InitializerFacet` batch size is seeded last so a
     *      single `setOperationalStatus` pass validates every facet initialised above.
     * @param _securityData Common security deployment configuration.
     * @param _securityType Security type recorded in core metadata.
     * @return securityAddress_ Address of the fully initialised deposit-token proxy.
     */
    function _deployDepositToken(
        SecurityData calldata _securityData,
        SecurityType _securityType
    ) internal virtual returns (address securityAddress_) {
        securityAddress_ = _deploySecurityProxy(_securityData);

        // Always-on diamond infrastructure and access control
        IAccessControl(securityAddress_).initializeAccessControl();
        IDiamondFacet(securityAddress_).initializeDiamondCut();

        // Core metadata, supply, nominal value and eligibility
        ICore.ERC20Metadata memory erc20Metadata = ICore.ERC20Metadata({
            info: _securityData.erc20MetadataInfo,
            securityType: _securityType
        });
        ICore(securityAddress_).initializeCore(erc20Metadata);
        IControlList(securityAddress_).initializeControlList(_securityData.isWhiteList);
        IExternalControlListManagement(securityAddress_).initializeExternalControlLists(
            _securityData.externalControlLists
        );
        ICap(securityAddress_).initializeCap(_securityData.maxSupply, new ICap.PartitionCap[](0));
        ICapByPartition(securityAddress_).initializeCapByPartition();
        // DepositToken carries no nominal value; the facet is initialised to its zero default.
        INominalValue(securityAddress_).initializeNominalValue(0, 0, bytes3(0));
        ICustomData(securityAddress_).initializeCustomData();
        IDocumentation(securityAddress_).initializeDocumentation();

        // Partitions and controller flag
        IPartitions(securityAddress_).initializePartitions(_securityData.isMultiPartition);
        IController(securityAddress_).initializeController(_securityData.isControllable);

        // Token verbs: allowance, transfer, mint, burn, freeze, pause, deactivate
        IAllowance(securityAddress_).initializeAllowance();
        ITransfer(securityAddress_).initializeTransfer();
        ITransferByPartition(securityAddress_).initializeTransferByPartition();
        IMint(securityAddress_).initializeERC1594();
        IMintByPartition(securityAddress_).initializeMintByPartition();
        IBurn(securityAddress_).initializeBurn();
        IBurnByPartition(securityAddress_).initializeBurnByPartition();
        IFreeze(securityAddress_).initializeFreeze();
        IPause(securityAddress_).initializePause();
        IDeactivate(securityAddress_).initializeDeactivate();

        // Balance tracking and security holders
        IBalanceTracker(securityAddress_).initializeBalanceTracker();
        IBalanceTrackerByPartition(securityAddress_).initializeBalanceTrackerByPartition();
        ISecurityHolders(securityAddress_).initializeSecurityHolders();

        // Operator
        IOperator(securityAddress_).initializeOperator();
        IOperatorByPartition(securityAddress_).initializeOperatorByPartition();
        IOperatorHoldByPartition(securityAddress_).initializeOperatorHoldByPartition();
        IOperatorClearingByPartition(securityAddress_).initializeOperatorClearingByPartition();
        IOperatorClearingHoldByPartition(securityAddress_).initializeOperatorClearingHoldByPartition();

        // Controller
        IControllerByPartition(securityAddress_).initializeControllerByPartition();
        IControllerHoldByPartition(securityAddress_).initializeControllerHoldByPartition();

        // Batch
        IBatchController(securityAddress_).initializeBatchController();
        IBatchBurn(securityAddress_).initializeBatchBurn();
        IBatchMint(securityAddress_).initializeBatchMint();
        IBatchTransfer(securityAddress_).initializeBatchTransfer();
        IBatchFreeze(securityAddress_).initializeBatchFreeze();

        // Clearing
        IClearing(securityAddress_).initializeClearing(_securityData.clearingActive);
        IClearingByPartition(securityAddress_).initializeClearingByPartition();
        IClearingHoldByPartition(securityAddress_).initializeClearingHoldByPartition();

        // Hold
        IHoldFacet(securityAddress_).initializeHold();
        IHoldByPartition(securityAddress_).initializeHoldByPartition();

        // Seed the initializer batch size last so a single setOperationalStatus pass
        // can validate every facet initialised above.
        IInitializer(securityAddress_).initializeInitializer(_SECURITY_FACETS_MAX);
    }

    /**
     * @notice Deploys a bare security proxy and seeds this factory as a temporary admin.
     * @dev Builds an extended RBAC array that appends `address(this)` as a `DEFAULT_ADMIN_ROLE`
     *      member so the factory can run facet initialisers. Callers MUST renounce that role
     *      once initialisation completes (see `IAccessControl.renounceRole`). The proxy is
     *      returned uninitialised; facet initialisers are the caller's responsibility.
     * @param _securityData Common security deployment configuration.
     * @return securityAddress_ Address of the freshly deployed, uninitialised security proxy.
     */
    function _deploySecurityProxy(SecurityData calldata _securityData) private returns (address securityAddress_) {
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
        ResolverProxy proxy = new ResolverProxy(
            _securityData.resolver,
            _securityData.resolverProxyConfiguration.key,
            _securityData.resolverProxyConfiguration.version,
            extendedRbacs
        );
        securityAddress_ = address(proxy);
    }

    /**
     * @notice Initialises security metadata, issuance constraints and compliance adapters.
     * @dev Performs cross-facet calls to configure control lists, partitions, controllers,
     *      core metadata, caps, clearing, KYC, ERC20 votes and ERC3643 integration.
     * @param _securityAddress Address of the proxy being initialised.
     * @param _securityData Common security deployment configuration.
     * @param _securityType Security type recorded in core metadata.
     */
    function _initializeSecurityMetadata(
        address _securityAddress,
        SecurityData calldata _securityData,
        SecurityType _securityType
    ) private {
        // configure Control List
        IControlList(_securityAddress).initializeControlList(_securityData.isWhiteList);
        // configure multi partition flag
        IPartitions(_securityAddress).initializePartitions(_securityData.isMultiPartition);
        // configure controller flag
        IController(_securityAddress).initializeController(_securityData.isControllable);
        // configure erc20 metadata
        ICore.ERC20Metadata memory erc20Metadata = ICore.ERC20Metadata({
            info: _securityData.erc20MetadataInfo,
            securityType: _securityType
        });
        ICore(_securityAddress).initializeCore(erc20Metadata);
        // configure issue flag
        IMint(_securityAddress).initializeERC1594();
        // configure cap
        ICap(_securityAddress).initializeCap(_securityData.maxSupply, new ICap.PartitionCap[](0));
        // configure protected partitions
        IProtectedPartitions(_securityAddress).initializeProtectedPartitions(_securityData.arePartitionsProtected);
        // configure clearing
        IClearing(_securityAddress).initializeClearing(_securityData.clearingActive);
        // configure external pauses
        IExternalPauseManagement(_securityAddress).initializeExternalPauses(_securityData.externalPauses);
        // configure external control lists
        IExternalControlListManagement(_securityAddress).initializeExternalControlLists(
            _securityData.externalControlLists
        );
        // configure internal KYC
        IKyc(_securityAddress).initializeInternalKyc(_securityData.internalKycActivated);
        // configure external KYC lists
        IExternalKycListManagement(_securityAddress).initializeExternalKycLists(_securityData.externalKycLists);
        // configure ERC20Votes
        IERC20Votes(_securityAddress).initializeERC20Votes(_securityData.erc20VotesActivated);
        // configure Compliance + Identity (ERC3643)
        IComplianceFacet(_securityAddress).initializeCompliance(_securityData.compliance);
        IIdentity(_securityAddress).initializeIdentity(_securityData.identityRegistry);
    }

    /**
     * @notice Initialises the core fungible-token, allowance and balance-tracking facets.
     * @dev Requires the proxy to expose each listed facet for the selected resolver
     *      configuration. Reverts if any facet initialiser rejects the call.
     * @param _securityAddress Address of the proxy being initialised.
     */
    function _initializeCoreFacets(address _securityAddress) private {
        // configure access control
        IAccessControl(_securityAddress).initializeAccessControl();
        // configure allowance
        IAllowance(_securityAddress).initializeAllowance();
        // configure transfer
        ITransfer(_securityAddress).initializeTransfer();
        // configure core adjusted
        ICoreAdjusted(_securityAddress).initializeCoreAdjusted();
        // configure custom data
        ICustomData(_securityAddress).initializeCustomData();
        // configure freeze
        IFreeze(_securityAddress).initializeFreeze();
        // configure batch freeze
        IBatchFreeze(_securityAddress).initializeBatchFreeze();
        // configure pause
        IPause(_securityAddress).initializePause();
        // configure balance tracker
        IBalanceTracker(_securityAddress).initializeBalanceTracker();
        // configure balance tracker adjusted
        IBalanceTrackerAdjusted(_securityAddress).initializeBalanceTrackerAdjusted();
        // configure balance tracker by partition
        IBalanceTrackerByPartition(_securityAddress).initializeBalanceTrackerByPartition();
        // configure snapshots
        ISnapshots(_securityAddress).initializeSnapshots();
    }

    /**
     * @notice Initialises snapshot-aware facets for balances, holds, locks and holders.
     * @dev Must run after core balance and snapshot facets are available.
     * @param _securityAddress Address of the proxy being initialised.
     */
    function _initializeSnapshotFacets(address _securityAddress) private {
        // configure snapshots by partition
        ISnapshotsByPartition(_securityAddress).initializeSnapshotsByPartition();
        // configure security holders at snapshot
        ISecurityHoldersAtSnapshot(_securityAddress).initializeSecurityHoldersAtSnapshot();
        // configure hold at snapshot
        IHoldAtSnapshot(_securityAddress).initializeHoldAtSnapshot();
        // configure lock at snapshot by partition
        ILockAtSnapshotByPartition(_securityAddress).initializeLockAtSnapshotByPartition();
        // configure freeze at snapshot
        IFreezeAtSnapshot(_securityAddress).initializeFreezeAtSnapshot();
        // configure freeze at snapshot by partition
        IFreezeAtSnapshotByPartition(_securityAddress).initializeFreezeAtSnapshotByPartition();
        // configure lock at snapshot
        ILockAtSnapshot(_securityAddress).initializeLockAtSnapshot();
        // configure core at snapshot
        ICoreAtSnapshot(_securityAddress).initializeCoreAtSnapshot();
        // configure balance tracker at snapshot
        IBalanceTrackerAtSnapshot(_securityAddress).initializeBalanceTrackerAtSnapshot();
        // configure balance tracker at snapshot by partition
        IBalanceTrackerAtSnapshotByPartition(_securityAddress).initializeBalanceTrackerAtSnapshotByPartition();
        // configure hold at snapshot by partition
        IHoldAtSnapshotByPartition(_securityAddress).initializeHoldAtSnapshotByPartition();
        // configure nominal value at snapshot
        INominalValueAtSnapshot(_securityAddress).initializeNominalValueAtSnapshot();
    }

    /**
     * @notice Initialises partition, operator, burn, documentation and recovery facets.
     * @dev Groups management capabilities that depend on core metadata and access control.
     * @param _securityAddress Address of the proxy being initialised.
     */
    function _initializeManagementFacets(address _securityAddress) private {
        // configure mint by partition
        IMintByPartition(_securityAddress).initializeMintByPartition();
        // configure protected by partition
        IProtectedByPartition(_securityAddress).initializeProtectedByPartition();
        // configure operator
        IOperator(_securityAddress).initializeOperator();
        // configure transfer by partition
        ITransferByPartition(_securityAddress).initializeTransferByPartition();
        // configure operator by partition
        IOperatorByPartition(_securityAddress).initializeOperatorByPartition();
        // configure burn by partition
        IBurnByPartition(_securityAddress).initializeBurnByPartition();
        // configure documentation
        IDocumentation(_securityAddress).initializeDocumentation();
        // configure EIP712
        IEIP712(_securityAddress).initializeEIP712();
        // configure nonces
        INonces(_securityAddress).initializeNonces();
        // configure deactivate
        IDeactivate(_securityAddress).initializeDeactivate();
        // configure batch controller
        IBatchController(_securityAddress).initializeBatchController();
        // configure batch burn
        IBatchBurn(_securityAddress).initializeBatchBurn();
        // configure batch mint
        IBatchMint(_securityAddress).initializeBatchMint();
        // configure batch transfer
        IBatchTransfer(_securityAddress).initializeBatchTransfer();
        // configure recovery
        IRecovery(_securityAddress).initializeRecovery();
        // configure burn
        IBurn(_securityAddress).initializeBurn();
    }

    /**
     * @notice Initialises compliance facets for global and partition-level checks.
     * @dev The current implementation does not consume `_securityData`; it is retained to
     *      preserve a uniform extension point for concrete factories.
     * @param _securityAddress Address of the proxy being initialised.
     */
    function _initializeComplianceFacets(address _securityAddress) private {
        // configure compliance by partition
        IComplianceByPartition(_securityAddress).initializeComplianceByPartition();
    }

    /**
     * @notice Initialises clearing facets for partition and snapshot-aware clearing flows.
     * @dev Requires clearing-related facets to be present in the selected resolver
     *      configuration, regardless of whether clearing is initially active.
     * @param _securityAddress Address of the proxy being initialised.
     */
    function _initializeClearingFacets(address _securityAddress) private {
        // configure protected clearing hold by partition
        IProtectedClearingHoldByPartition(_securityAddress).initializeProtectedClearingHoldByPartition();
        // configure operator clearing hold by partition
        IOperatorClearingHoldByPartition(_securityAddress).initializeOperatorClearingHoldByPartition();
        // configure operator clearing by partition
        IOperatorClearingByPartition(_securityAddress).initializeOperatorClearingByPartition();
        // configure protected clearing by partition
        IProtectedClearingByPartition(_securityAddress).initializeProtectedClearingByPartition();
        // configure clearing by partition
        IClearingByPartition(_securityAddress).initializeClearingByPartition();
        // configure clearing hold by partition
        IClearingHoldByPartition(_securityAddress).initializeClearingHoldByPartition();
        // configure clearing at snapshot
        IClearingAtSnapshot(_securityAddress).initializeClearingAtSnapshot();
        // configure clearing at snapshot by partition
        IClearingAtSnapshotByPartition(_securityAddress).initializeClearingAtSnapshotByPartition();
    }

    /**
     * @notice Initialises hold and controller/operator hold facets.
     * @dev Provides both partitioned and protected hold capabilities before clearing and
     *      transfer-and-lock workflows are used.
     * @param _securityAddress Address of the proxy being initialised.
     */
    function _initializeHoldFacets(address _securityAddress) private {
        // configure hold
        IHoldFacet(_securityAddress).initializeHold();
        // configure operator hold by partition
        IOperatorHoldByPartition(_securityAddress).initializeOperatorHoldByPartition();
        // configure controller hold by partition
        IControllerHoldByPartition(_securityAddress).initializeControllerHoldByPartition();
        // configure controller by partition
        IControllerByPartition(_securityAddress).initializeControllerByPartition();
        // configure protected hold by partition
        IProtectedHoldByPartition(_securityAddress).initializeProtectedHoldByPartition();
        // configure hold by partition
        IHoldByPartition(_securityAddress).initializeHoldByPartition();
    }

    /**
     * @notice Initialises auxiliary security facets and the initializer facet.
     * @dev Seeds the initializer batch size with `_SECURITY_FACETS_MAX` so the deployment
     *      flow can attempt to mark the full configuration operational in one pass.
     * @param _securityAddress Address of the proxy being initialised.
     */
    function _initializeMiscellaneousFacets(address _securityAddress) private {
        // configure balance adjustments
        IAdjustBalances(_securityAddress).initializeBalanceAdjustments();
        // configure scheduled balance adjustment
        IScheduledBalanceAdjustment(_securityAddress).initializeScheduledBalanceAdjustment();
        // configure lock
        ILock(_securityAddress).initializeLock();
        // configure lock by partition
        ILockByPartition(_securityAddress).initializeLockByPartition();
        // configure security holders
        ISecurityHolders(_securityAddress).initializeSecurityHolders();
        // configure SSI management
        ISsiManagement(_securityAddress).initializeSsiManagement();
        // configure corporate actions
        ICorporateActions(_securityAddress).initializeCorporateActions();
        // configure transfer and lock
        ITransferAndLock(_securityAddress).initializeTransferAndLock();
        // configure transfer and lock by partition
        ITransferAndLockByPartition(_securityAddress).initializeTransferAndLockByPartition();
        // configure cap by partition
        ICapByPartition(_securityAddress).initializeCapByPartition();
        IERC20Permit(_securityAddress).initializeERC20Permit();
        IScheduledCrossOrderedTasks(_securityAddress).initializeScheduledCrossOrderedTasks();
        IDiamondFacet(_securityAddress).initializeDiamondCut();
        // Seed the initializer facet's batch size so that setOperationalStatus
        // (called from each deployEquity / deployBond / …) can iterate through
        // every registered facet in a single pass.
        IInitializer(_securityAddress).initializeInitializer(_SECURITY_FACETS_MAX);
    }

    /**
     * @notice Initialises security compliance facets.
     * @dev Delegates to `_initializeComplianceFacets`; `_securityData` is currently unused and
     *      retained for future compliance-specific deployment options.
     * @param _securityAddress Address of the proxy being initialised.
     */
    function _initializeSecurityCompliance(address _securityAddress) private {
        _initializeComplianceFacets(_securityAddress);
    }

    /**
     * @notice Emits the KPI-linked-rate bond deployment event.
     * @dev Uses `EvmAccessors.getMsgSender()` so the emitted deployer follows the project's
     *      message-sender abstraction.
     * @param _bondAddress Address of the deployed KPI-linked-rate bond proxy.
     * @param _bondKpiLinkedRateData KPI-linked bond deployment data emitted for indexing.
     */
    function _emitBondKpiLinkedRateDeployed(
        address _bondAddress,
        BondKpiLinkedRateData calldata _bondKpiLinkedRateData
    ) private {
        emit BondKpiLinkedRateDeployed(EvmAccessors.getMsgSender(), _bondAddress, _bondKpiLinkedRateData);
    }

    /**
     * @notice Validates bond start and maturity dates.
     * @dev Reverts if dates are not ordered correctly or maturity cannot be used for scheduled
     *      tasks.
     * @param startingDate Bond start timestamp.
     * @param maturityDate Bond maturity timestamp.
     */
    function _checkBondDates(uint256 startingDate, uint256 maturityDate) private view {
        DatesValidation.checkDates(startingDate, maturityDate);
        ScheduledTasksStorageWrapper.requireValidTimestamp(maturityDate);
    }

    /**
     * @notice Ensures the initial RBAC list contains at least one non-zero admin member.
     * @dev Performs a linear scan over supplied RBAC entries and members. Reverts with
     *      `NoInitialAdmins` when no valid `DEFAULT_ADMIN_ROLE` member is found.
     * @param rbacs Initial role assignments to inspect.
     */
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
