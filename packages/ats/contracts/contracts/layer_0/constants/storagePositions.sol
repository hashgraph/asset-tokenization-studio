// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length

// keccak256('security.token.standard.cap.storage');
bytes32 constant _CAP_STORAGE_POSITION = 0x591561cf73f8f1ca1532449c7ce18338a75e9e17f2894af1e41b36e3b013f951;

// keccak256('security.token.standard.lock.storage');
bytes32 constant _LOCK_STORAGE_POSITION = 0xd15962e60f276260fba4c9b4de7fd05f475afe18b48c917ec6f6fcc71c00bf71;

// keccak256('security.token.standard.erc1410.basic.storage');
bytes32 constant _ERC1410_BASIC_STORAGE_POSITION = 0x67661db80d37d3b9810c430f78991b4b5377bdebd3b71b39fbd3427092c1822a;

// keccak256('security.token.standard.erc20.storage');
bytes32 constant _ERC20_STORAGE_POSITION = 0xd5228ac65cba3eaaef0669de6709c44cfdf33c0f1cce2989d4a133e0214cce57;

// keccak256('security.token.standard.erc20permit.storage');
bytes32 constant _ERC20PERMIT_STORAGE_POSITION = 0x2eab7c044bb5364d7d7f71ddae6058a0259318944e16332fb2c4b0d4df71bb00;

// keccak256('security.token.standard.erc20votes.storage');
bytes32 constant _ERC20VOTES_STORAGE_POSITION = 0x267abaf3c47dd2e587e53273fad716e2b95949f6838b817b0c728f0beea38c12;

// keccak256('security.token.standard.corporateactions.storage');
bytes32 constant _CORPORATE_ACTION_STORAGE_POSITION = 0x9db84024bbea48a7580380e27785cf3e0d08fada233c84760c8a5aff47f86e12;

// keccak256('security.token.standard.snapshot.storage');
bytes32 constant _SNAPSHOT_STORAGE_POSITION = 0x450898ebb84982a28d8787f0138cfce477c6d811ae3b1db5fdb7ed17e8bda898;

// keccak256('security.token.standard.adjust.balances.storage');
bytes32 constant _ADJUST_BALANCES_STORAGE_POSITION = 0x20765daced38554542b3c858f10e7fb957696c4dbd38d7faabc51dd4de7ad541;

// keccak256('security.token.standard.scheduledSnapshots.storage');
bytes32 constant _SCHEDULED_SNAPSHOTS_STORAGE_POSITION = 0xe5334ddaa6268d55c7efe63975567949a7fb208c02c0bd15007703db04a9ba4f;

// keccak256('security.token.standard.scheduledBalanceAdjustments.storage');
bytes32 constant _SCHEDULED_BALANCE_ADJUSTMENTS_STORAGE_POSITION = 0xaf4aaa3de473ec9b58645d40f5a2fe4e176157e247b2d875db61f1a70935ac68;

// keccak256('security.token.standard.scheduledCouponListing.storage');
bytes32 constant _SCHEDULED_COUPON_LISTING_STORAGE_POSITION = 0x020cecc946ba57a1f8569220f46e5763939a3e864a1a4064efc2be63a845635a;

// keccak256('security.token.standard.scheduledCrossOrderedTasks.storage');
bytes32 constant _SCHEDULED_CROSS_ORDERED_TASKS_STORAGE_POSITION = 0x07c301a048b8fa80688acfab6d93f7e94a43ce454031a02cdd132b92ca943a70;

// keccak256('security.token.standard.hold.storage');
bytes32 constant _HOLD_STORAGE_POSITION = 0x80346b80475a6f26abb9f460d81c6dbe6a8dd5d1acfb0827cfe37c4263a562ca;

// keccak256('security.token.standard.erc1594.storage');
bytes32 constant _ERC1594_STORAGE_POSITION = 0x919465d7e15b775c94035d2b592c0808b79e37ecb2e0ceb66bd8c481f998ee9f;

// keccak256('security.token.standard.erc1643.storage');
bytes32 constant _ERC1643_STORAGE_POSITION = 0xf570af0a020d64f3ea72a78716790700daaeb1b83730feca87e92c517de986ef;

// keccak256('security.token.standard.erc1410.operator.storage');
bytes32 constant _ERC1410_OPERATOR_STORAGE_POSITION = 0x319c8795293307b302697a4daf045524536834965f40eb730e6ca085ae32ae00;

// keccak256('security.token.standard.erc1644.storage');
bytes32 constant _ERC1644_STORAGE_POSITION = 0x78da7d6f03fa6ff51457b34dfcf6bc00f21877d08759f4b646f714d8f8c539f7;

// keccak256('security.token.standard.accesscontrol.storage');
bytes32 constant _ACCESS_CONTROL_STORAGE_POSITION = 0x4765bbd856d800638d39a79262ebc6fdfb5833d0e59f32c5d482fe4c4a3554c1;

// keccak256('security.token.standard.controllist.storage');
bytes32 constant _CONTROL_LIST_STORAGE_POSITION = 0xd2a97f6f015eb0ef6e78a5d99ed4baddb1001474ec77117d69e09432533577d3;

// keccak256('security.token.standard.pause.storage');
bytes32 constant _PAUSE_STORAGE_POSITION = 0x5a5b295532a8b6e97bc9d45d68fc49b85a099545bac8f91f77706d392a1cea71;

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

// keccak256('security.token.standard.erc3643.storage');
bytes32 constant _ERC3643_STORAGE_POSITION = 0xba82ce8c38a926a01a84988222ab779cf1852f228ccaafd725c8d06d090d0906;

// keccak256('security.token.standard.resolverProxy.storage');
bytes32 constant _RESOLVER_PROXY_STORAGE_POSITION = 0x4833864335c8f29dd85e3f7a36869cb90d5dc7167ae5000f7e1ce4d7c15d14ad;

// keccak256('security.token.standard.beneficiaries.storage');
bytes32 constant _BENEFICIARIES_STORAGE_POSITION = 0xd76ee368b4f6f14377350eb4eeded82471ef0e0208749dc135673661ed492f43;

// keccak256('security.token.standard.beneficiaries.data.storage');
bytes32 constant _BENEFICIARIES_DATA_STORAGE_POSITION = 0xc7c4e0ff0ace36b5d2de5287c034dccef63aa2fb6c2498a31a48fd5516019f8c;
