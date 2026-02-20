// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length

// ═══════════════════════════════════════════════════════════════════════════════
// Infrastructure storage positions
// ═══════════════════════════════════════════════════════════════════════════════

// keccak256('security.token.standard.businesslogicresolver.storage');
bytes32 constant _BUSINESS_LOGIC_RESOLVER_STORAGE_POSITION = 0xee633a02a6dacfac8613ddaa3392c5f7367e65b039364b1e3148356be4468439;

// keccak256('security.token.standard.diamond.cut.manager.storage');
bytes32 constant _DIAMOND_CUT_MANAGER_STORAGE_POSITION = 0x513cea04238a899b11bd2956c2d5e7863b8b3ef2fbd5750604b6755da9ca1cea;

// keccak256('security.token.standard.resolverProxy.storage');
bytes32 constant _RESOLVER_PROXY_STORAGE_POSITION = 0x4833864335c8f29dd85e3f7a36869cb90d5dc7167ae5000f7e1ce4d7c15d14ad;

// ═══════════════════════════════════════════════════════════════════════════════
// Core storage positions
// ═══════════════════════════════════════════════════════════════════════════════

// keccak256('security.token.standard.accesscontrol.storage');
bytes32 constant _ACCESS_CONTROL_STORAGE_POSITION = 0x4765bbd856d800638d39a79262ebc6fdfb5833d0e59f32c5d482fe4c4a3554c1;

// keccak256('security.token.standard.pause.storage');
bytes32 constant _PAUSE_STORAGE_POSITION = 0x5a5b295532a8b6e97bc9d45d68fc49b85a099545bac8f91f77706d392a1cea71;

// keccak256('security.token.standard.controllist.storage');
bytes32 constant _CONTROL_LIST_STORAGE_POSITION = 0xd2a97f6f015eb0ef6e78a5d99ed4baddb1001474ec77117d69e09432533577d3;

// keccak256('security.token.standard.protectedpartitions.storage');
bytes32 constant _PROTECTED_PARTITIONS_STORAGE_POSITION = 0x564ecdb30bda57ccdf5f0ccce9a283978b97919c80a3230163042042418b1546;

// keccak256('security.token.standard.ssiManagement.storage');
bytes32 constant _SSI_MANAGEMENT_STORAGE_POSITION = 0xdbde0b1f7457f92983806323b8056e5eabfce9a23b8924af999a4df0e4154e18;

// keccak256('security.token.standard.kyc.storage');
bytes32 constant _KYC_STORAGE_POSITION = 0x589d3365cb6f9141f65f568666d0e4cb837c3b1edc1527dd31a1aa423ad940c7;

// keccak256('security.token.standard.clearing.storage');
bytes32 constant _CLEARING_STORAGE_POSITION = 0xf5d5af29c37f2085b9f37cfb2259d4e3b957777d47ffc1949a7596cb1d37ba90;

// keccak256('security.token.standard.pauseManagement.storage');
bytes32 constant _PAUSE_MANAGEMENT_STORAGE_POSITION = 0x80cd138137fb7aaf8068b75b39b6681af39401f81721b6420d44eb588baaeeb9;

// keccak256('security.token.standard.controlListManagement.storage');
bytes32 constant _CONTROL_LIST_MANAGEMENT_STORAGE_POSITION = 0x3553e9f946bd0c6ac12c2e96bf561ec7aafbed39334ffde761beba62ed8dbad6;

// keccak256('security.token.standard.kycManagement.storage');
bytes32 constant _KYC_MANAGEMENT_STORAGE_POSITION = 0x57364604d3fde2768df7beea76ca84783455ba461f6f84450864597901db12b9;

// keccak256('security.token.standard.nonce.storage');
bytes32 constant _NONCE_STORAGE_POSITION = 0xfce5baa472f37a2de2808d549c4eb6787a5a27db638637a7ffa45da5f9f8c9f7;

// keccak256('security.token.standard.erc3643.storage');
bytes32 constant _ERC3643_STORAGE_POSITION = 0xba82ce8c38a926a01a84988222ab779cf1852f228ccaafd725c8d06d090d0906;

// ═══════════════════════════════════════════════════════════════════════════════
// Token storage positions
// ═══════════════════════════════════════════════════════════════════════════════

// keccak256('security.token.standard.erc1410.basic.storage');
bytes32 constant _ERC1410_BASIC_STORAGE_POSITION = 0x67661db80d37d3b9810c430f78991b4b5377bdebd3b71b39fbd3427092c1822a;

// keccak256('security.token.standard.erc20.storage');
bytes32 constant _ERC20_STORAGE_POSITION = 0xd5228ac65cba3eaaef0669de6709c44cfdf33c0f1cce2989d4a133e0214cce57;

// keccak256('security.token.standard.erc20permit.storage');
bytes32 constant _ERC20PERMIT_STORAGE_POSITION = 0x2eab7c044bb5364d7d7f71ddae6058a0259318944e16332fb2c4b0d4df71bb00;

// keccak256('security.token.standard.erc20votes.storage');
bytes32 constant _ERC20VOTES_STORAGE_POSITION = 0x267abaf3c47dd2e587e53273fad716e2b95949f6838b817b0c728f0beea38c12;

// keccak256('security.token.standard.erc1594.storage');
bytes32 constant _ERC1594_STORAGE_POSITION = 0x919465d7e15b775c94035d2b592c0808b79e37ecb2e0ceb66bd8c481f998ee9f;

// keccak256('security.token.standard.erc1643.storage');
bytes32 constant _ERC1643_STORAGE_POSITION = 0xf570af0a020d64f3ea72a78716790700daaeb1b83730feca87e92c517de986ef;

// keccak256('security.token.standard.erc1410.operator.storage');
bytes32 constant _ERC1410_OPERATOR_STORAGE_POSITION = 0x319c8795293307b302697a4daf045524536834965f40eb730e6ca085ae32ae00;

// keccak256('security.token.standard.erc1644.storage');
bytes32 constant _ERC1644_STORAGE_POSITION = 0x78da7d6f03fa6ff51457b34dfcf6bc00f21877d08759f4b646f714d8f8c539f7;

// ═══════════════════════════════════════════════════════════════════════════════
// Asset storage positions
// ═══════════════════════════════════════════════════════════════════════════════

// keccak256('security.token.standard.cap.storage');
bytes32 constant _CAP_STORAGE_POSITION = 0x591561cf73f8f1ca1532449c7ce18338a75e9e17f2894af1e41b36e3b013f951;

// keccak256('security.token.standard.lock.storage');
bytes32 constant _LOCK_STORAGE_POSITION = 0xd15962e60f276260fba4c9b4de7fd05f475afe18b48c917ec6f6fcc71c00bf71;

// keccak256('security.token.standard.corporateactions.storage');
bytes32 constant _CORPORATE_ACTION_STORAGE_POSITION = 0x9db84024bbea48a7580380e27785cf3e0d08fada233c84760c8a5aff47f86e12;

// keccak256('security.token.standard.snapshot.storage');
bytes32 constant _SNAPSHOT_STORAGE_POSITION = 0x450898ebb84982a28d8787f0138cfce477c6d811ae3b1db5fdb7ed17e8bda898;

// keccak256('security.token.standard.adjust.balances.storage');
bytes32 constant _ADJUST_BALANCES_STORAGE_POSITION = 0x20765daced38554542b3c858f10e7fb957696c4dbd38d7faabc51dd4de7ad541;

// keccak256('security.token.standard.hold.storage');
bytes32 constant _HOLD_STORAGE_POSITION = 0x80346b80475a6f26abb9f460d81c6dbe6a8dd5d1acfb0827cfe37c4263a562ca;

// keccak256('security.token.standard.bond.storage');
bytes32 constant _BOND_STORAGE_POSITION = 0x251123c390edd911567d4210605f2dfb26d83878c58bd871f56946d08ffd1f2b;

// keccak256('security.token.standard.equity.storage');
bytes32 constant _EQUITY_STORAGE_POSITION = 0xa5469e676cbd7933388e0b85a29d4408325f3dd05785ee648c5375e79d0aa651;

// keccak256('security.token.standard.proceedRecipients.storage');
bytes32 constant _PROCEED_RECIPIENTS_STORAGE_POSITION = 0xd76ee368b4f6f14377350eb4eeded82471ef0e0208749dc135673661ed492f43;

// keccak256('security.token.standard.proceedRecipients.data.storage');
bytes32 constant _PROCEED_RECIPIENTS_DATA_STORAGE_POSITION = 0xc7c4e0ff0ace36b5d2de5287c034dccef63aa2fb6c2498a31a48fd5516019f8c;

// keccak256('security.token.standard.kpis.data.storage');
bytes32 constant _KPIS_STORAGE_POSITION = 0x15e2583fed61d8b30b191451b67403569c6ee36d7d93206cb4a6de2f6f69c0b9;

// ═══════════════════════════════════════════════════════════════════════════════
// Scheduled task storage positions
// ═══════════════════════════════════════════════════════════════════════════════

// keccak256('security.token.standard.scheduledSnapshots.storage');
bytes32 constant _SCHEDULED_SNAPSHOTS_STORAGE_POSITION = 0xe5334ddaa6268d55c7efe63975567949a7fb208c02c0bd15007703db04a9ba4f;

// keccak256('security.token.standard.scheduledBalanceAdjustments.storage');
bytes32 constant _SCHEDULED_BALANCE_ADJUSTMENTS_STORAGE_POSITION = 0xaf4aaa3de473ec9b58645d40f5a2fe4e176157e247b2d875db61f1a70935ac68;

// keccak256('security.token.standard.scheduledCouponListing.storage');
bytes32 constant _SCHEDULED_COUPON_LISTING_STORAGE_POSITION = 0x020cecc946ba57a1f8569220f46e5763939a3e864a1a4064efc2be63a845635a;

// keccak256('security.token.standard.scheduledCrossOrderedTasks.storage');
bytes32 constant _SCHEDULED_CROSS_ORDERED_TASKS_STORAGE_POSITION = 0x07c301a048b8fa80688acfab6d93f7e94a43ce454031a02cdd132b92ca943a70;

// ═══════════════════════════════════════════════════════════════════════════════
// Interest rate storage positions
// ═══════════════════════════════════════════════════════════════════════════════

// keccak256('security.token.standard.fixed.rate.storage');
bytes32 constant _FIXED_RATE_STORAGE_POSITION = 0x15c219561d57f111c36d547315cfca3a61aa37154b27a2b98e8991c6b8b15a34;

// keccak256('security.token.standard.kpiLinked.rate.storage');
bytes32 constant _KPI_LINKED_RATE_STORAGE_POSITION = 0x3004b60ac76f4502c30ee18a6db5845c0ce175b00881a07640a1fd25d9506785;

// keccak256('security.token.standard.sustainabilityPerformanceTarget.rate.storage');
bytes32 constant _SUSTAINABILITY_PERFORMANCE_TARGET_RATE_STORAGE_POSITION = 0x93dfece0e867ca7a953a76c2874bb7238395e73f4592fa6a72639df7d5350c09;

// ═══════════════════════════════════════════════════════════════════════════════
// Regulation storage positions
// ═══════════════════════════════════════════════════════════════════════════════

// keccak256('security.token.standard.security.storage');
bytes32 constant _SECURITY_STORAGE_POSITION = 0x95205812666aa702c6386778a59ee67a93a9559063c49d34d12e4072e5995379;

// ═══════════════════════════════════════════════════════════════════════════════
// Test-only storage positions (TimeTravel overrides)
// ═══════════════════════════════════════════════════════════════════════════════

// keccak256('security.token.standard.test.timetravel.timestamp')
bytes32 constant _TIMESTAMP_OVERRIDE_SLOT = 0x6dffada92f87e08031a64f3c82fa9d9b647a47b516130bdc52f646d498adc7ef;

// keccak256('security.token.standard.test.timetravel.blocknumber')
bytes32 constant _BLOCK_NUMBER_OVERRIDE_SLOT = 0xda5cca5277b046f39c27835382b41b07ac714748d81f7c159fdbc36744ce094b;
