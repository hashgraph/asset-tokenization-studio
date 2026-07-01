// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { FactoryCommon } from "./FactoryCommon.sol";
import { IDepositTokenFactory } from "./IFactory.sol";
import { FactoryRegulationData } from "../constants/regulation.sol";
import { _checkUnexpectedError } from "../infrastructure/utils/UnexpectedError.sol";
import { FACTORY_OPERATIONAL_STATUS } from "../constants/values.sol";
import { DEFAULT_ADMIN_ROLE } from "../constants/roles.sol";
import { EvmAccessors } from "../infrastructure/utils/EvmAccessors.sol";
import { IInitializer } from "../facets/initializer/IInitializer.sol";
import { IAccessControl } from "../facets/accessControl/IAccessControl.sol";
import { INominalValue } from "../facets/layer_2/nominalValue/INominalValue.sol";
import { IClearing } from "../facets/clearing/IClearing.sol";
import { IAllowance } from "../facets/allowance/IAllowance.sol";
import { ITransfer } from "../facets/transfer/ITransfer.sol";
import { ITransferByPartition } from "../facets/transferByPartition/ITransferByPartition.sol";
import { IMint } from "../facets/mint/IMint.sol";
import { IMintByPartition } from "../facets/mintByPartition/IMintByPartition.sol";
import { IBurn } from "../facets/burn/IBurn.sol";
import { IBurnByPartition } from "../facets/burnByPartition/IBurnByPartition.sol";
import { IFreeze } from "../facets/freeze/IFreeze.sol";
import { IPause } from "../facets/pause/IPause.sol";
import { IDeactivate } from "../facets/deactivate/IDeactivate.sol";
import { IBalanceTracker } from "../facets/balanceTracker/IBalanceTracker.sol";
import { IBalanceTrackerByPartition } from "../facets/balanceTrackerByPartition/IBalanceTrackerByPartition.sol";
import { ISecurityHolders } from "../facets/securityHolders/ISecurityHolders.sol";
import { IOperator } from "../facets/operator/IOperator.sol";
import { IOperatorByPartition } from "../facets/operatorByPartition/IOperatorByPartition.sol";
import { IOperatorHoldByPartition } from "../facets/operatorHoldByPartition/IOperatorHoldByPartition.sol";
import { IOperatorClearingByPartition } from "../facets/operatorClearingByPartition/IOperatorClearingByPartition.sol";
import {
    IOperatorClearingHoldByPartition
} from "../facets/operatorClearingHoldByPartition/IOperatorClearingHoldByPartition.sol";
import { IControllerByPartition } from "../facets/controllerByPartition/IControllerByPartition.sol";
import { IControllerHoldByPartition } from "../facets/controllerHoldByPartition/IControllerHoldByPartition.sol";
import { IBatchController } from "../facets/batchController/IBatchController.sol";
import { IBatchBurn } from "../facets/batchBurn/IBatchBurn.sol";
import { IBatchMint } from "../facets/batchMint/IBatchMint.sol";
import { IBatchTransfer } from "../facets/batchTransfer/IBatchTransfer.sol";
import { IBatchFreeze } from "../facets/batchFreeze/IBatchFreeze.sol";
import { IClearingByPartition } from "../facets/clearingByPartition/IClearingByPartition.sol";
import { IClearingHoldByPartition } from "../facets/clearingHoldByPartition/IClearingHoldByPartition.sol";
import { IHoldFacet } from "../facets/hold/IHoldFacet.sol";
import { IHoldByPartition } from "../facets/holdByPartition/IHoldByPartition.sol";
import { ICoreAdjusted } from "../facets/coreAdjusted/ICoreAdjusted.sol";
import { IBalanceTrackerAdjusted } from "../facets/balanceTrackerAdjusted/IBalanceTrackerAdjusted.sol";
import { IComplianceByPartition } from "../facets/complianceByPartition/IComplianceByPartition.sol";
import { ILockByPartition } from "../facets/lockByPartition/ILockByPartition.sol";
import { ITransferAndLockByPartition } from "../facets/transferAndLockByPartition/ITransferAndLockByPartition.sol";
import { IMaturityByPartition } from "../facets/maturityByPartition/IMaturityByPartition.sol";
import { ICouponSecurityHolders } from "../facets/couponSecurityHolders/ICouponSecurityHolders.sol";
import { IDividendSecurityHolders } from "../facets/dividendSecurityHolders/IDividendSecurityHolders.sol";
import { IVotingSecurityHolders } from "../facets/votingSecurityHolders/IVotingSecurityHolders.sol";
import { IProtectedByPartition } from "../facets/protectedByPartition/IProtectedByPartition.sol";
import { IProtectedHoldByPartition } from "../facets/protectedHoldByPartition/IProtectedHoldByPartition.sol";
import {
    IProtectedClearingByPartition
} from "../facets/protectedClearingByPartition/IProtectedClearingByPartition.sol";
import {
    IProtectedClearingHoldByPartition
} from "../facets/protectedClearingHoldByPartition/IProtectedClearingHoldByPartition.sol";
import { ISnapshotsByPartition } from "../facets/snapshotsByPartition/ISnapshotsByPartition.sol";
import { ISecurityHoldersAtSnapshot } from "../facets/securityHoldersAtSnapshot/ISecurityHoldersAtSnapshot.sol";
import { ICoreAtSnapshot } from "../facets/coreAtSnapshot/ICoreAtSnapshot.sol";
import { INominalValueAtSnapshot } from "../facets/nominalValueAtSnapshot/INominalValueAtSnapshot.sol";
import { IBalanceTrackerAtSnapshot } from "../facets/balanceTrackerAtSnapshot/IBalanceTrackerAtSnapshot.sol";
import {
    IBalanceTrackerAtSnapshotByPartition
} from "../facets/balanceTrackerAtSnapshotByPartition/IBalanceTrackerAtSnapshotByPartition.sol";
import { IFreezeAtSnapshot } from "../facets/freezeAtSnapshot/IFreezeAtSnapshot.sol";
import { IFreezeAtSnapshotByPartition } from "../facets/freezeAtSnapshotByPartition/IFreezeAtSnapshotByPartition.sol";
import { IHoldAtSnapshot } from "../facets/holdAtSnapshot/IHoldAtSnapshot.sol";
import { IHoldAtSnapshotByPartition } from "../facets/holdAtSnapshotByPartition/IHoldAtSnapshotByPartition.sol";
import { ILockAtSnapshotByPartition } from "../facets/lockAtSnapshotByPartition/ILockAtSnapshotByPartition.sol";
import { IClearingAtSnapshot } from "../facets/clearingAtSnapshot/IClearingAtSnapshot.sol";
import {
    IClearingAtSnapshotByPartition
} from "../facets/clearingAtSnapshotByPartition/IClearingAtSnapshotByPartition.sol";

/**
 * @title DepositTokenFactory
 * @notice Deploys and initialises deposit-token proxies from the ATS factory diamond.
 * @dev Split out of `Factory` into its own facet-backing abstract so the deposit-token
 *      deployment path (which initialises a large facet set) no longer inflates the equity/bond
 *      `FactoryFacet` beyond the EIP-170 24 KB limit. Shares the proxy-creation and base-facet
 *      initialisation foundation with `Factory` through `FactoryCommon`.
 * @author Asset Tokenization Studio Team
 */
abstract contract DepositTokenFactory is FactoryCommon, IDepositTokenFactory {
    /**
     * @notice Deploys and fully initialises a deposit token proxy.
     * @dev Creates the proxy and initialises its facets via `_deployDepositToken`, marks the
     *      proxy operational and renounces this factory's temporary `DEFAULT_ADMIN_ROLE`. The
     *      deposit token configuration does not include `SecurityFacet`, so
     *      `_factoryRegulationData` is validated by `onlyValidRegulation` and emitted in
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
        override
        onlyValidResolver(_depositTokenData.security.resolver)
        onlyValidAdmins(_depositTokenData.security.rbacs)
        onlyValidRegulation(_factoryRegulationData.regulationType, _factoryRegulationData.regulationSubType)
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
        _initializeBaseConfiguration(securityAddress_, _securityData, _securityType);
        // DepositToken carries no nominal value; seed the facet with its zero default.
        INominalValue(securityAddress_).initializeNominalValue(0, 0, bytes3(0));
        _initializeTransferAndSupply(securityAddress_);
        _initializeStateControls(securityAddress_);
        _initializeBalances(securityAddress_);
        _initializeOperatorsAndControllers(securityAddress_);
        _initializeBatchOperations(securityAddress_);
        _initializeClearingAndHold(securityAddress_, _securityData.clearingActive);
        _initializeDepositTokenExtendedFacets(securityAddress_);
        // Seed the initializer batch size last so a single setOperationalStatus pass
        // can validate every facet initialised above.
        IInitializer(securityAddress_).initializeInitializer(_SECURITY_FACETS_MAX);
    }

    /**
     * @notice Initialises the transfer, allowance and supply (mint/burn) facets.
     * @param _securityAddress Address of the security proxy being initialised.
     */
    function _initializeTransferAndSupply(address _securityAddress) private {
        IAllowance(_securityAddress).initializeAllowance();
        ITransfer(_securityAddress).initializeTransfer();
        ITransferByPartition(_securityAddress).initializeTransferByPartition();
        IMint(_securityAddress).initializeERC1594();
        IMintByPartition(_securityAddress).initializeMintByPartition();
        IBurn(_securityAddress).initializeBurn();
        IBurnByPartition(_securityAddress).initializeBurnByPartition();
    }

    /**
     * @notice Initialises the state-control facets: freeze, pause and deactivate.
     * @param _securityAddress Address of the security proxy being initialised.
     */
    function _initializeStateControls(address _securityAddress) private {
        IFreeze(_securityAddress).initializeFreeze();
        IPause(_securityAddress).initializePause();
        IDeactivate(_securityAddress).initializeDeactivate();
    }

    /**
     * @notice Initialises the balance-tracking and security-holder facets.
     * @param _securityAddress Address of the security proxy being initialised.
     */
    function _initializeBalances(address _securityAddress) private {
        IBalanceTracker(_securityAddress).initializeBalanceTracker();
        IBalanceTrackerByPartition(_securityAddress).initializeBalanceTrackerByPartition();
        ISecurityHolders(_securityAddress).initializeSecurityHolders();
    }

    /**
     * @notice Initialises the operator and controller delegation facets.
     * @param _securityAddress Address of the security proxy being initialised.
     */
    function _initializeOperatorsAndControllers(address _securityAddress) private {
        IOperator(_securityAddress).initializeOperator();
        IOperatorByPartition(_securityAddress).initializeOperatorByPartition();
        IOperatorHoldByPartition(_securityAddress).initializeOperatorHoldByPartition();
        IOperatorClearingByPartition(_securityAddress).initializeOperatorClearingByPartition();
        IOperatorClearingHoldByPartition(_securityAddress).initializeOperatorClearingHoldByPartition();

        IControllerByPartition(_securityAddress).initializeControllerByPartition();
        IControllerHoldByPartition(_securityAddress).initializeControllerHoldByPartition();
    }

    /**
     * @notice Initialises the batch-operation facets.
     * @param _securityAddress Address of the security proxy being initialised.
     */
    function _initializeBatchOperations(address _securityAddress) private {
        IBatchController(_securityAddress).initializeBatchController();
        IBatchBurn(_securityAddress).initializeBatchBurn();
        IBatchMint(_securityAddress).initializeBatchMint();
        IBatchTransfer(_securityAddress).initializeBatchTransfer();
        IBatchFreeze(_securityAddress).initializeBatchFreeze();
    }

    /**
     * @notice Initialises the clearing and hold facets.
     * @param _securityAddress Address of the security proxy being initialised.
     * @param _clearingActive Whether clearing is initially active.
     */
    function _initializeClearingAndHold(address _securityAddress, bool _clearingActive) private {
        IClearing(_securityAddress).initializeClearing(_clearingActive);
        IClearingByPartition(_securityAddress).initializeClearingByPartition();
        IClearingHoldByPartition(_securityAddress).initializeClearingHoldByPartition();

        IHoldFacet(_securityAddress).initializeHold();
        IHoldByPartition(_securityAddress).initializeHoldByPartition();
    }

    /**
     * @notice Initialises the extended deposit-token facets beyond the always-on base set.
     * @dev Each facet listed in the deposit-token resolver configuration must be initialised
     *      before `setOperationalStatus`, otherwise the proxy never becomes operational. The
     *      initialisers are independent (each only marks its own facet ready), so the order
     *      below is grouped for readability rather than dependency.
     * @param _securityAddress Address of the deposit-token proxy being initialised.
     */
    function _initializeDepositTokenExtendedFacets(address _securityAddress) private {
        // adjusted balances
        ICoreAdjusted(_securityAddress).initializeCoreAdjusted();
        IBalanceTrackerAdjusted(_securityAddress).initializeBalanceTrackerAdjusted();
        // compliance
        IComplianceByPartition(_securityAddress).initializeComplianceByPartition();
        // lock
        ILockByPartition(_securityAddress).initializeLockByPartition();
        ITransferAndLockByPartition(_securityAddress).initializeTransferAndLockByPartition();
        // maturity
        IMaturityByPartition(_securityAddress).initializeMaturityByPartition();
        // income / governance holders
        ICouponSecurityHolders(_securityAddress).initializeCouponSecurityHolders();
        IDividendSecurityHolders(_securityAddress).initializeDividendSecurityHolders();
        IVotingSecurityHolders(_securityAddress).initializeVotingSecurityHolders();
        // protected partitions
        IProtectedByPartition(_securityAddress).initializeProtectedByPartition();
        IProtectedHoldByPartition(_securityAddress).initializeProtectedHoldByPartition();
        IProtectedClearingByPartition(_securityAddress).initializeProtectedClearingByPartition();
        IProtectedClearingHoldByPartition(_securityAddress).initializeProtectedClearingHoldByPartition();
        // snapshots
        ISnapshotsByPartition(_securityAddress).initializeSnapshotsByPartition();
        ISecurityHoldersAtSnapshot(_securityAddress).initializeSecurityHoldersAtSnapshot();
        ICoreAtSnapshot(_securityAddress).initializeCoreAtSnapshot();
        INominalValueAtSnapshot(_securityAddress).initializeNominalValueAtSnapshot();
        IBalanceTrackerAtSnapshot(_securityAddress).initializeBalanceTrackerAtSnapshot();
        IBalanceTrackerAtSnapshotByPartition(_securityAddress).initializeBalanceTrackerAtSnapshotByPartition();
        IFreezeAtSnapshot(_securityAddress).initializeFreezeAtSnapshot();
        IFreezeAtSnapshotByPartition(_securityAddress).initializeFreezeAtSnapshotByPartition();
        IHoldAtSnapshot(_securityAddress).initializeHoldAtSnapshot();
        IHoldAtSnapshotByPartition(_securityAddress).initializeHoldAtSnapshotByPartition();
        ILockAtSnapshotByPartition(_securityAddress).initializeLockAtSnapshotByPartition();
        IClearingAtSnapshot(_securityAddress).initializeClearingAtSnapshot();
        IClearingAtSnapshotByPartition(_securityAddress).initializeClearingAtSnapshotByPartition();
    }
}
