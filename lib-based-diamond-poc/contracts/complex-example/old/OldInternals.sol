// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "../storage/ComplexStorage.sol";

// ═══════════════════════════════════════════════════════════════════════════════
//
//  ██╗███╗   ██╗████████╗███████╗██████╗ ███╗   ██╗ █████╗ ██╗     ███████╗
//  ██║████╗  ██║╚══██╔══╝██╔════╝██╔══██╗████╗  ██║██╔══██╗██║     ██╔════╝
//  ██║██╔██╗ ██║   ██║   █████╗  ██████╔╝██╔██╗ ██║███████║██║     ███████╗
//  ██║██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗██║╚██╗██║██╔══██║██║     ╚════██║
//  ██║██║ ╚████║   ██║   ███████╗██║  ██║██║ ╚████║██║  ██║███████╗███████║
//  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝╚══════╝
//
//  THE MONSTER — All virtual function declarations in one place.
//
//  WHY THIS EXISTS:
//  ScheduledCrossOrderedTasks needs ScheduledBalanceAdjustments + ScheduledSnapshots
//  ScheduledBalanceAdjustments needs ABAF + ERC1410 + Pause + Access
//  ScheduledSnapshots needs Snapshots + ERC1410 + Pause + Access + ABAF
//  CouponPayment needs Bond + InterestRate + Snapshots + ABAF + ERC1410 + CorporateActions
//  ABAF needs ERC1410 (to adjust balances)
//  ERC1410 needs ABAF (to read adjusted balances) ← CIRCULAR!
//  ERC1410 needs Compliance + Pause + Access ← more cross-deps
//
//  Because Solidity doesn't allow circular inheritance, we MUST put
//  every internal function into ONE contract. Every facet then inherits
//  this entire 400+ line monster even if it only uses 5 functions.
//
// ═══════════════════════════════════════════════════════════════════════════════

abstract contract OldInternals {

    // ═══════════════════════════ ERRORS ═════════════════════════════════════

    error EnforcedPause();
    error NotPaused();
    error AccessControlUnauthorizedAccount(address account, bytes32 role);
    error ComplianceNotMet(address account);
    error InsufficientBalance(address account, bytes32 partition, uint256 requested, uint256 available);
    error InvalidReceiver(address receiver);
    error InvalidFactor(uint256 factor);
    error SnapshotDoesNotExist(uint256 snapshotId);
    error CouponNotFound(uint256 couponId);
    error CouponRateNotSet(uint256 couponId);
    error CouponRecordDateNotReached(uint256 couponId);
    error BondMatured();
    error NoScheduledTasks();
    error TaskNotYetDue(uint256 taskTimestamp, uint256 currentTimestamp);
    error InvalidTimestamp();

    // ═══════════════════════════ EVENTS ═════════════════════════════════════

    event Paused(address account);
    event Unpaused(address account);
    event RoleGranted(bytes32 indexed role, address indexed account);
    event RoleRevoked(bytes32 indexed role, address indexed account);
    event TransferByPartition(bytes32 indexed partition, address indexed from, address indexed to, uint256 value);
    event SnapshotCreated(uint256 indexed snapshotId);
    event ABAFUpdated(uint256 oldAbaf, uint256 newAbaf, uint256 factor);
    event BalanceAdjustmentSynced(address indexed account, bytes32 indexed partition, uint256 factor);
    event CouponSet(uint256 indexed couponId, uint256 rate, uint8 rateDecimals);
    event CouponPaymentExecuted(uint256 indexed couponId, uint256 snapshotId, uint256 totalPaid);
    event ScheduledTaskTriggered(uint256 indexed taskIndex, ScheduledTaskType taskType);
    event CorporateActionRegistered(uint256 indexed actionId, uint8 actionType);
    event KpiReportSubmitted(address indexed project, uint256 value, uint256 timestamp);

    // ═══════════════════════════ MODIFIERS ══════════════════════════════════

    modifier onlyUnpaused() {
        _requireNotPaused();
        _;
    }

    modifier onlyRole(bytes32 role) {
        _checkRole(role);
        _;
    }

    modifier onlyCompliant(address account) {
        _requireCompliant(account);
        _;
    }

    modifier onlyValidTimestamp(uint256 timestamp) {
        if (timestamp == 0 || timestamp <= block.timestamp) revert InvalidTimestamp();
        _;
    }

    modifier validateFactor(uint256 factor) {
        if (factor == 0) revert InvalidFactor(factor);
        _;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 1: PAUSE (3 functions)
    //
    // Used by: PauseFacet, and indirectly by EVERY facet that checks pause
    // ═══════════════════════════════════════════════════════════════════════

    function _isPaused() internal view virtual returns (bool) {
        return pauseStorage().paused;
    }

    function _pause() internal virtual {
        pauseStorage().paused = true;
        emit Paused(msg.sender);
    }

    function _unpause() internal virtual {
        pauseStorage().paused = false;
        emit Unpaused(msg.sender);
    }

    function _requireNotPaused() internal view virtual {
        if (_isPaused()) revert EnforcedPause();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 2: ACCESS CONTROL (4 functions)
    //
    // Used by: AccessControlFacet, and indirectly by EVERY role-gated facet
    // ═══════════════════════════════════════════════════════════════════════

    function _hasRole(bytes32 role, address account) internal view virtual returns (bool) {
        return accessStorage().roles[role][account];
    }

    function _checkRole(bytes32 role) internal view virtual {
        if (!_hasRole(role, msg.sender)) {
            revert AccessControlUnauthorizedAccount(msg.sender, role);
        }
    }

    function _grantRole(bytes32 role, address account) internal virtual {
        if (!_hasRole(role, account)) {
            accessStorage().roles[role][account] = true;
            accessStorage().roleMembers[role].push(account);
            emit RoleGranted(role, account);
        }
    }

    function _revokeRole(bytes32 role, address account) internal virtual {
        if (_hasRole(role, account)) {
            accessStorage().roles[role][account] = false;
            emit RoleRevoked(role, account);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 3: COMPLIANCE / KYC (2 functions)
    //
    // Used by: KycFacet, ERC1410 transfers, CouponPayment
    // ═══════════════════════════════════════════════════════════════════════

    function _isCompliant(address account) internal view virtual returns (bool) {
        return complianceStorage().compliant[account];
    }

    function _requireCompliant(address account) internal view virtual {
        if (!_isCompliant(account)) revert ComplianceNotMet(account);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 4: ERC1410 TOKEN (12 functions)
    //
    // Used by: ERC1410TokenHolderFacet, ERC20Facet, BondFacet,
    //          CouponPaymentFacet, AdjustBalancesFacet, SnapshotsFacet
    //
    // NOTE: These functions use ABAF-adjusted values, creating the
    // circular dependency: ERC1410 → ABAF → ERC1410
    // ═══════════════════════════════════════════════════════════════════════

    function _totalSupply() internal view virtual returns (uint256) {
        return tokenStorage().totalSupply;
    }

    function _balanceOfByPartition(bytes32 partition, address account)
        internal view virtual returns (uint256)
    {
        return tokenStorage().partitionBalances[partition][account];
    }

    function _totalSupplyByPartition(bytes32 partition) internal view virtual returns (uint256) {
        return tokenStorage().partitionTotalSupply[partition];
    }

    /// @dev Returns ABAF-adjusted balance (the one users see)
    function _adjustedBalanceOfByPartition(bytes32 partition, address account)
        internal view virtual returns (uint256)
    {
        uint256 raw = _balanceOfByPartition(partition, account);
        uint256 factor = _calculateAdjustmentFactor(account, partition);
        return (raw * factor) / (10 ** abafStorage().abafDecimals);
    }

    /// @dev Returns ABAF-adjusted total supply
    function _adjustedTotalSupply() internal view virtual returns (uint256) {
        uint256 currentAbaf = _getAbaf();
        return (_totalSupply() * currentAbaf) / (10 ** abafStorage().abafDecimals);
    }

    function _transferByPartition(
        bytes32 partition,
        address from,
        address to,
        uint256 value
    ) internal virtual {
        if (to == address(0)) revert InvalidReceiver(to);

        // Sync ABAF before transfer (critical!)
        _syncBalanceAdjustments(from, partition);
        _syncBalanceAdjustments(to, partition);

        uint256 fromBalance = tokenStorage().partitionBalances[partition][from];
        if (fromBalance < value) {
            revert InsufficientBalance(from, partition, value, fromBalance);
        }

        tokenStorage().partitionBalances[partition][from] = fromBalance - value;
        tokenStorage().partitionBalances[partition][to] += value;
        tokenStorage().totalSupply = tokenStorage().totalSupply; // unchanged

        // Update snapshot
        _updateAccountSnapshot(from, partition);
        _updateAccountSnapshot(to, partition);

        // Track token holders
        _trackTokenHolder(to);

        emit TransferByPartition(partition, from, to, value);
    }

    function _issueByPartition(
        bytes32 partition,
        address to,
        uint256 value
    ) internal virtual {
        tokenStorage().partitionBalances[partition][to] += value;
        tokenStorage().partitionTotalSupply[partition] += value;
        tokenStorage().totalSupply += value;
        _trackTokenHolder(to);
        _updateAccountSnapshot(to, partition);
    }

    function _redeemByPartition(
        bytes32 partition,
        address from,
        uint256 value
    ) internal virtual {
        // Sync ABAF before redemption
        _syncBalanceAdjustments(from, partition);

        uint256 fromBalance = tokenStorage().partitionBalances[partition][from];
        if (fromBalance < value) {
            revert InsufficientBalance(from, partition, value, fromBalance);
        }

        tokenStorage().partitionBalances[partition][from] -= value;
        tokenStorage().partitionTotalSupply[partition] -= value;
        tokenStorage().totalSupply -= value;
        _updateAccountSnapshot(from, partition);
    }

    function _getTokenHolders(uint256 start, uint256 limit)
        internal view virtual returns (address[] memory)
    {
        TokenStorage storage ts = tokenStorage();
        uint256 total = ts.tokenHolders.length;
        if (start >= total) return new address[](0);
        uint256 end = start + limit > total ? total : start + limit;
        address[] memory holders = new address[](end - start);
        for (uint256 i = start; i < end; i++) {
            holders[i - start] = ts.tokenHolders[i];
        }
        return holders;
    }

    function _tokenHolderCount() internal view virtual returns (uint256) {
        return tokenStorage().tokenHolders.length;
    }

    function _trackTokenHolder(address account) internal virtual {
        TokenStorage storage ts = tokenStorage();
        if (!ts.isTokenHolder[account]) {
            ts.isTokenHolder[account] = true;
            ts.tokenHolderIndex[account] = ts.tokenHolders.length;
            ts.tokenHolders.push(account);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 5: ABAF / LABAF (8 functions)
    //
    // Used by: AdjustBalancesFacet, ScheduledBalanceAdjustmentsFacet,
    //          ERC1410 (for adjusted balances), SnapshotsFacet,
    //          CouponPaymentFacet, BondReadFacet
    //
    // THE CORE CIRCULAR DEPENDENCY:
    //   ABAF needs ERC1410 (to know what to adjust)
    //   ERC1410 needs ABAF (to return adjusted values)
    //   → Cannot be separate abstract contracts!
    // ═══════════════════════════════════════════════════════════════════════

    function _getAbaf() internal view virtual returns (uint256) {
        uint256 abaf = abafStorage().abaf;
        return abaf == 0 ? 10 ** abafStorage().abafDecimals : abaf;
    }

    function _getLabaf(address account) internal view virtual returns (uint256) {
        uint256 labaf = abafStorage().labaf[account];
        return labaf == 0 ? 10 ** abafStorage().abafDecimals : labaf;
    }

    function _getLabafByPartition(address account, bytes32 partition)
        internal view virtual returns (uint256)
    {
        uint256 labaf = abafStorage().labafByPartition[account][partition];
        return labaf == 0 ? 10 ** abafStorage().abafDecimals : labaf;
    }

    /// @dev Calculates the factor to apply: ABAF / LABAF
    function _calculateAdjustmentFactor(address account, bytes32 partition)
        internal view virtual returns (uint256)
    {
        uint256 currentAbaf = _getAbaf();
        uint256 accountLabaf = _getLabafByPartition(account, partition);
        return (currentAbaf * (10 ** abafStorage().abafDecimals)) / accountLabaf;
    }

    /// @dev Updates global ABAF: ABAF_new = ABAF_old × factor / 10^decimals
    function _updateAbaf(uint256 factor) internal virtual {
        ABAFStorage storage abs_ = abafStorage();
        uint256 oldAbaf = _getAbaf();
        uint256 decimals = 10 ** abs_.abafDecimals;
        uint256 newAbaf = (oldAbaf * factor) / decimals;

        abs_.abaf = newAbaf;
        abs_.abafTimestamps.push(block.timestamp);
        abs_.abafValues.push(newAbaf);

        emit ABAFUpdated(oldAbaf, newAbaf, factor);
    }

    /// @dev Syncs an account+partition to current ABAF (applies pending adjustments)
    function _syncBalanceAdjustments(address account, bytes32 partition) internal virtual {
        ABAFStorage storage abs_ = abafStorage();
        uint256 currentAbaf = _getAbaf();
        uint256 accountLabaf = _getLabafByPartition(account, partition);

        if (currentAbaf != accountLabaf) {
            TokenStorage storage ts = tokenStorage();
            uint256 decimals = 10 ** abs_.abafDecimals;
            uint256 factor = (currentAbaf * decimals) / accountLabaf;

            // Adjust the raw balance
            uint256 rawBalance = ts.partitionBalances[partition][account];
            ts.partitionBalances[partition][account] = (rawBalance * factor) / decimals;

            // Update LABAF to current ABAF
            abs_.labafByPartition[account][partition] = currentAbaf;
            abs_.labaf[account] = currentAbaf;

            emit BalanceAdjustmentSynced(account, partition, factor);
        }
    }

    /// @dev Adjusts ALL partitioned balances for ALL holders (expensive but needed for snapshot accuracy)
    function _adjustBalancesForAllHolders() internal virtual {
        address[] memory holders = _getTokenHolders(0, _tokenHolderCount());
        for (uint256 i = 0; i < holders.length; i++) {
            bytes32[] memory partitions = tokenStorage().holderPartitions[holders[i]];
            for (uint256 j = 0; j < partitions.length; j++) {
                _syncBalanceAdjustments(holders[i], partitions[j]);
            }
        }
    }

    /// @dev Gets ABAF at a specific timestamp (for historical queries)
    function _getAbafAt(uint256 timestamp) internal view virtual returns (uint256) {
        ABAFStorage storage abs_ = abafStorage();
        uint256 len = abs_.abafTimestamps.length;
        if (len == 0) return 10 ** abs_.abafDecimals;

        // Binary search for nearest ABAF <= timestamp
        for (uint256 i = len; i > 0; i--) {
            if (abs_.abafTimestamps[i - 1] <= timestamp) {
                return abs_.abafValues[i - 1];
            }
        }
        return 10 ** abs_.abafDecimals;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 6: SNAPSHOTS (8 functions)
    //
    // Used by: SnapshotsFacet, ScheduledSnapshotsFacet,
    //          CouponPaymentFacet (to get holder balances at record date),
    //          BondReadFacet
    //
    // Dependencies: ERC1410 (for balances), ABAF (for adjusted values)
    // ═══════════════════════════════════════════════════════════════════════

    function _takeSnapshot() internal virtual returns (uint256) {
        SnapshotStorage storage ss = snapshotStorage();
        ss.currentSnapshotId++;
        uint256 snapshotId = ss.currentSnapshotId;

        // Record ABAF at this snapshot
        ss.abafAtSnapshot[snapshotId] = _getAbaf();

        // Record all current holders
        address[] memory holders = _getTokenHolders(0, _tokenHolderCount());
        for (uint256 i = 0; i < holders.length; i++) {
            ss.holdersAtSnapshot[snapshotId].push(holders[i]);
            ss.holderExistsAtSnapshot[snapshotId][holders[i]] = true;
        }

        // Snapshot total supply
        ss.totalSupplySnapshots.push(SnapshotEntry({
            snapshotId: snapshotId,
            value: _totalSupply()
        }));

        emit SnapshotCreated(snapshotId);
        return snapshotId;
    }

    function _updateAccountSnapshot(address account, bytes32 partition) internal virtual {
        SnapshotStorage storage ss = snapshotStorage();
        uint256 currentId = ss.currentSnapshotId;
        if (currentId == 0) return;

        uint256 balance = _balanceOfByPartition(partition, account);
        ss.accountPartitionSnapshots[account][partition].push(SnapshotEntry({
            snapshotId: currentId,
            value: balance
        }));
    }

    function _getSnapshotBalanceByPartition(
        uint256 snapshotId,
        bytes32 partition,
        address account
    ) internal view virtual returns (uint256) {
        if (snapshotId > snapshotStorage().currentSnapshotId) {
            revert SnapshotDoesNotExist(snapshotId);
        }

        SnapshotEntry[] storage entries =
            snapshotStorage().accountPartitionSnapshots[account][partition];
        for (uint256 i = entries.length; i > 0; i--) {
            if (entries[i - 1].snapshotId <= snapshotId) {
                return entries[i - 1].value;
            }
        }
        return _balanceOfByPartition(partition, account);
    }

    function _getHoldersAtSnapshot(uint256 snapshotId)
        internal view virtual returns (address[] memory)
    {
        return snapshotStorage().holdersAtSnapshot[snapshotId];
    }

    function _getCurrentSnapshotId() internal view virtual returns (uint256) {
        return snapshotStorage().currentSnapshotId;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 7: BOND & COUPONS (10 functions)
    //
    // Used by: BondFacet, BondReadFacet, CouponPaymentFacet,
    //          ScheduledCouponListingFacet
    //
    // Dependencies: InterestRate, Snapshots, ABAF, ERC1410, CorporateActions
    // ═══════════════════════════════════════════════════════════════════════

    function _getCoupon(uint256 couponId) internal view virtual returns (Coupon memory) {
        BondStorage storage bs = bondStorage();
        if (couponId == 0 || couponId > bs.couponCount) revert CouponNotFound(couponId);
        return bs.coupons[couponId];
    }

    function _setCoupon(Coupon memory coupon) internal virtual returns (uint256) {
        BondStorage storage bs = bondStorage();
        bs.couponCount++;
        uint256 couponId = bs.couponCount;
        bs.coupons[couponId] = coupon;
        bs.couponOrderedList.push(couponId);
        return couponId;
    }

    function _updateCouponRate(uint256 couponId, uint256 rate, uint8 rateDecimals) internal virtual {
        BondStorage storage bs = bondStorage();
        if (couponId == 0 || couponId > bs.couponCount) revert CouponNotFound(couponId);

        bs.coupons[couponId].rate = rate;
        bs.coupons[couponId].rateDecimals = rateDecimals;
        bs.coupons[couponId].rateStatus = RateCalculationStatus.SET;

        emit CouponSet(couponId, rate, rateDecimals);
    }

    function _setCouponSnapshotId(uint256 couponId, uint256 snapshotId) internal virtual {
        bondStorage().coupons[couponId].snapshotId = snapshotId;
    }

    function _markCouponExecuted(uint256 couponId) internal virtual {
        bondStorage().coupons[couponId].rateStatus = RateCalculationStatus.EXECUTED;
    }

    function _getCouponCount() internal view virtual returns (uint256) {
        return bondStorage().couponCount;
    }

    function _getBondDetails() internal view virtual returns (
        bytes3 currency, uint256 nominalValue, uint8 nominalValueDecimals,
        uint256 startingDate, uint256 maturityDate
    ) {
        BondStorage storage bs = bondStorage();
        return (bs.currency, bs.nominalValue, bs.nominalValueDecimals,
                bs.startingDate, bs.maturityDate);
    }

    /// @dev Calculate coupon amount for a holder: balance × rate / 10^rateDecimals
    function _calculateCouponAmount(
        uint256 couponId,
        address holder
    ) internal view virtual returns (uint256 numerator, uint256 denominator) {
        Coupon memory coupon = _getCoupon(couponId);
        if (coupon.rateStatus == RateCalculationStatus.PENDING) revert CouponRateNotSet(couponId);

        uint256 balance = _getSnapshotBalanceByPartition(
            coupon.snapshotId, DEFAULT_PARTITION, holder
        );
        numerator = balance * coupon.rate;
        denominator = 10 ** coupon.rateDecimals;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 8: INTEREST RATE — KPI LINKED (4 functions)
    //
    // Used by: InterestRateFacet, CouponPaymentFacet (to calculate rate)
    //
    // Dependencies: Bond (for coupon data)
    // ═══════════════════════════════════════════════════════════════════════

    function _calculateKpiLinkedRate(uint256 couponId)
        internal view virtual returns (uint256 rate, uint8 rateDecimals)
    {
        InterestRateStorage storage irs = interestRateStorage();
        Coupon memory coupon = _getCoupon(couponId);
        KpiLinkedRateConfig memory config = irs.config;

        // Before start period → use start rate
        if (coupon.fixingDate < config.startPeriod) {
            return (config.startRate, config.rateDecimals);
        }

        // Get previous coupon rate (if any)
        uint256 previousRate = config.startRate;
        if (couponId > 1) {
            Coupon memory prevCoupon = _getCoupon(couponId - 1);
            if (prevCoupon.rateStatus != RateCalculationStatus.PENDING) {
                previousRate = prevCoupon.rate;
            }
        }

        // Check KPI reports from all projects
        bool reportFound = false;
        uint256 totalDeviation = 0;
        uint256 projectCount = irs.kpiProjects.length;

        for (uint256 i = 0; i < projectCount; i++) {
            KpiReport[] storage reports = irs.kpiReports[irs.kpiProjects[i]];
            for (uint256 j = reports.length; j > 0; j--) {
                if (reports[j - 1].timestamp <= coupon.fixingDate &&
                    reports[j - 1].timestamp >= coupon.fixingDate - config.reportPeriod) {
                    reportFound = true;
                    KpiImpactData memory impact = irs.impactData;
                    uint256 deviation;
                    if (reports[j - 1].value > impact.baseLine) {
                        deviation = reports[j - 1].value - impact.baseLine;
                        if (deviation > impact.maxDeviationCap) deviation = impact.maxDeviationCap;
                    } else {
                        deviation = impact.baseLine - reports[j - 1].value;
                        if (deviation > impact.maxDeviationFloor) deviation = impact.maxDeviationFloor;
                    }
                    totalDeviation += deviation;
                    break;
                }
            }
        }

        // No report → apply missed penalty
        if (!reportFound) {
            rate = previousRate + config.missedPenalty;
            if (rate > config.maxRate) rate = config.maxRate;
            return (rate, config.rateDecimals);
        }

        // Calculate rate adjustment based on deviation
        uint256 adjustment = (totalDeviation * config.baseRate) /
            (irs.impactData.adjustmentPrecision * projectCount);
        rate = previousRate > adjustment ? previousRate - adjustment : 0;

        // Clamp to [minRate, maxRate]
        if (rate < config.minRate) rate = config.minRate;
        if (rate > config.maxRate) rate = config.maxRate;
        rateDecimals = config.rateDecimals;
    }

    function _submitKpiReport(address project, uint256 value) internal virtual {
        InterestRateStorage storage irs = interestRateStorage();
        irs.kpiReports[project].push(KpiReport({
            value: value,
            timestamp: block.timestamp,
            exists: true
        }));
        emit KpiReportSubmitted(project, value, block.timestamp);
    }

    function _getKpiLinkedRateConfig() internal view virtual returns (KpiLinkedRateConfig memory) {
        return interestRateStorage().config;
    }

    function _getKpiImpactData() internal view virtual returns (KpiImpactData memory) {
        return interestRateStorage().impactData;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 9: SCHEDULED TASKS (6 functions)
    //
    // Used by: ScheduledBalanceAdjustmentsFacet, ScheduledSnapshotsFacet,
    //          ScheduledCouponListingFacet, ScheduledCrossOrderedTasksFacet
    //
    // Dependencies: ABAF (for adjustment tasks), Snapshots (for snapshot tasks),
    //               Bond (for coupon tasks)
    // ═══════════════════════════════════════════════════════════════════════

    function _addScheduledTask(ScheduledTask memory task) internal virtual {
        ScheduledTasksStorage storage sts = scheduledTasksStorage();
        // Insert sorted by timestamp
        sts.tasks.push(task);
        uint256 i = sts.tasks.length - 1;
        while (i > 0 && sts.tasks[i].timestamp < sts.tasks[i - 1].timestamp) {
            ScheduledTask memory temp = sts.tasks[i];
            sts.tasks[i] = sts.tasks[i - 1];
            sts.tasks[i - 1] = temp;
            i--;
        }
    }

    function _triggerPendingScheduledTasks() internal virtual returns (uint256 triggered) {
        ScheduledTasksStorage storage sts = scheduledTasksStorage();
        uint256 index = sts.lastTriggeredIndex;

        while (index < sts.tasks.length && sts.tasks[index].timestamp <= block.timestamp) {
            ScheduledTask memory task = sts.tasks[index];
            _executeScheduledTask(task, index);
            index++;
            triggered++;
        }

        sts.lastTriggeredIndex = index;
    }

    function _executeScheduledTask(ScheduledTask memory task, uint256 index) internal virtual {
        if (task.taskType == ScheduledTaskType.BALANCE_ADJUSTMENT) {
            (uint256 factor, uint8 decimals) = abi.decode(task.data, (uint256, uint8));
            _updateAbaf(factor);
            _registerCorporateAction(ADJUSTMENT_ACTION_TYPE, task.data, abi.encode(factor));
        } else if (task.taskType == ScheduledTaskType.SNAPSHOT) {
            uint256 snapshotId = _takeSnapshot();
            _registerCorporateAction(SNAPSHOT_ACTION_TYPE, task.data, abi.encode(snapshotId));
        } else if (task.taskType == ScheduledTaskType.COUPON_LISTING) {
            uint256 couponId = abi.decode(task.data, (uint256));
            // Link snapshot to coupon
            uint256 snapshotId = _takeSnapshot();
            _setCouponSnapshotId(couponId, snapshotId);
        }

        emit ScheduledTaskTriggered(index, task.taskType);
    }

    function _getScheduledTaskCount() internal view virtual returns (uint256) {
        return scheduledTasksStorage().tasks.length;
    }

    function _getScheduledTask(uint256 index)
        internal view virtual returns (ScheduledTask memory)
    {
        return scheduledTasksStorage().tasks[index];
    }

    function _getPendingTaskCount() internal view virtual returns (uint256) {
        ScheduledTasksStorage storage sts = scheduledTasksStorage();
        uint256 pending = 0;
        for (uint256 i = sts.lastTriggeredIndex; i < sts.tasks.length; i++) {
            if (sts.tasks[i].timestamp <= block.timestamp) pending++;
            else break;
        }
        return pending;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 10: CORPORATE ACTIONS (2 functions)
    //
    // Used by: CouponPaymentFacet, AdjustBalancesFacet, SnapshotsFacet,
    //          ScheduledTasksFacet
    //
    // Dependencies: None (leaf node — but still in the monster!)
    // ═══════════════════════════════════════════════════════════════════════

    function _registerCorporateAction(
        uint8 actionType,
        bytes memory data,
        bytes memory result
    ) internal virtual returns (uint256) {
        CorporateActionsStorage storage cas = corporateActionsStorage();
        cas.actionCount++;
        uint256 actionId = cas.actionCount;
        cas.actions[actionId] = CorporateAction({
            actionType: actionType,
            timestamp: block.timestamp,
            data: data,
            result: result
        });
        emit CorporateActionRegistered(actionId, actionType);
        return actionId;
    }

    function _getCorporateAction(uint256 actionId)
        internal view virtual returns (CorporateAction memory)
    {
        return corporateActionsStorage().actions[actionId];
    }
}
