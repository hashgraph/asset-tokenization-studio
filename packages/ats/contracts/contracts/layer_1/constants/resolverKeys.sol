// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length

// keccak256('security.token.standard.accesscontrol.resolverKey');
bytes32 constant _ACCESS_CONTROL_RESOLVER_KEY = 0x011768a41cb4fe76a26f444eec15d81a0d84e919a36336d72c6539cf41c0fcf6;

// keccak256('security.token.standard.accesscontrol.fixed.rate.resolverKey');
bytes32 constant _ACCESS_CONTROL_FIXED_RATE_RESOLVER_KEY = 0xb35ad81b5769c62538fe6a90e40db8be624645f77c1738ce582ede5da399ecb2;

// keccak256('security.token.standard.accesscontrol.kpilinked.rate.resolverKey');
bytes32 constant _ACCESS_CONTROL_KPI_LINKED_RATE_RESOLVER_KEY = 0x465c95eea6723a1645e5399789cee702b19d0bcd0ad3f894270aa25488fb4ab9;

// keccak256('security.token.standard.accesscontrol.SustainabilityPerformanceTarget.rate.resolverKey');
bytes32 constant _ACCESS_CONTROL_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x9d13e61abd630355ccae4279993868d7cf3b04d4368a0fedcefe6fec3fabaa0c;

// keccak256('security.token.standard.controllist.resolverKey');
bytes32 constant _CONTROL_LIST_RESOLVER_KEY = 0xfbb1491bfcecd95f79409bd5a4b69a4ba1e5573573372f5d2d66c11e3016414c;

// keccak256('security.token.standard.pause.resolverKey');
bytes32 constant _PAUSE_RESOLVER_KEY = 0x9429fd9ef38f89f41bd9ec33fd5c94b287ed1c27a98938da43835ac761b2f92c;

// keccak256('security.token.standard.cap.resolverKey');
bytes32 constant _CAP_RESOLVER_KEY = 0xfb3f8aac36661b5540c571d821c80dc9db7ede5ca2a4204ee562b3356f0c026b;

// keccak256('security.token.standard.cap.fixed.rate.resolverKey');
bytes32 constant _CAP_FIXED_RATE_RESOLVER_KEY = 0x288b5a4b82f38369168fd49de3e5e68c76fc0394c2e89817b70a65368ba4dcf7;

// keccak256('security.token.standard.cap.kpilinked.rate.resolverKey');
bytes32 constant _CAP_KPI_LINKED_RATE_RESOLVER_KEY = 0xdc8cc0612bf886bcc1666e31c5de3392bee78451de7213b01fe78d560a804435;

// keccak256('security.token.standard.cap.SustainabilityPerformanceTarget.rate.resolverKey');
bytes32 constant _CAP_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0xa321c5301bbccd760c5aaf08286a67948cb7d49be22c17f12aa163b324a276d0;

// keccak256('security.token.standard.erc20.resolverKey');
bytes32 constant _ERC20_RESOLVER_KEY = 0x064c883089ba1a596d9146c7aaa73c19ef8825f374c67a9538787c3d12e68dc5;

// keccak256('security.token.standard.erc20votes.resolverKey');
bytes32 constant _ERC20VOTES_RESOLVER_KEY = 0x5cbfbaa435e19a43530a00ac685c9b5252862a94af2053667ded44642a0d9f4c;

// keccak256('security.token.standard.erc1594.resolverKey');
bytes32 constant _ERC1594_RESOLVER_KEY = 0xcb70773e8163595d8bd906e277adeb3935976ad802ee8c29face3dfb0263291f;

// keccak256('security.token.standard.erc20permit.resolverKey');
bytes32 constant _ERC20PERMIT_RESOLVER_KEY = 0xef05f0313623d32145212ed45620c8b2c8c294b3d6955cf26f3d1b0569fbc1fa;

// keccak256('security.token.standard.erc1643.resolverKey');
bytes32 constant _ERC1643_RESOLVER_KEY = 0x24543637956a3076689f171d3932b10f22d40f3785d53acebb340f37bed01625;

// keccak256('security.token.standard.erc1410.read.resolverKey');
bytes32 constant _ERC1410_READ_RESOLVER_KEY = 0x5eb2734b83ea80c3eb63463a6192b30ab2526cb7a073f0abfda1a404c92ae497;

// keccak256('security.token.standard.erc1410.tokenHolder.resolverKey');
bytes32 constant _ERC1410_TOKEN_HOLDER_RESOLVER_KEY = 0x0466bf860d23f1ecbc25f364735e0dc3830d236f09182599831730ddd2792caa;

// keccak256('security.token.standard.erc1410.management.resolverKey');
bytes32 constant _ERC1410_MANAGEMENT_RESOLVER_KEY = 0x232f8686795d3f197681faf0d8db05655e759f62d709d56b97e5d9cfff29dbf5;

// keccak256('security.token.standard.erc1410.issuer.resolverKey');
bytes32 constant _ERC1410_ISSUER_RESOLVER_KEY = 0x6e82b75f32c9647cc00b4c3eabbef5a82677f3e91d5d196eb4dd6a0365941344;

// keccak256('security.token.standard.erc1644.resolverKey');
bytes32 constant _ERC1644_RESOLVER_KEY = 0xf1da2ed271d62ba0b6597874c96fb6ed7d929e5ec679f4ad8c2c516c72f6736d;

// keccak256('security.token.standard.snapshots.resolverKey');
bytes32 constant _SNAPSHOTS_RESOLVER_KEY = 0x9a3fc46d83536ef6b87eb4fec37302bfd1a7c18e81ea2da853b911b44cf5b0cf;

// keccak256("security.token.standard.resolver.proxy.resolverKey")
bytes32 constant _RESOLVER_PROXY_RESOLVER_KEY = 0x6fe19cad2a96b3f5852be16d059cc4c233139891fc04dc506c03d297d5f12c1e;

// keccak256("security.token.standard.diamond.loupe.resolverKey")
bytes32 constant _DIAMOND_LOUPE_RESOLVER_KEY = 0x086a1dd0b9bfa39267d1de30445a8edeb3a1f50c8a0a82c91f9dee3608e83567;

// keccak256("security.token.standard.diamond.cut.resolverKey")
bytes32 constant _DIAMOND_CUT_RESOLVER_KEY = 0xb66fc45b2670ed2c4ce03061121e6c8e53bce06e161f95afad8e57671b64fca8;

// keccak256("security.token.standard.diamond.resolverKey")
bytes32 constant _DIAMOND_RESOLVER_KEY = 0x1b5212ea37fb29e99afa2812a5d7d7e662a477424d3de1a18cc3871a2ee94d78;

// keccak256("security.token.standard.corporateActions.resolverKey")
bytes32 constant _CORPORATE_ACTIONS_RESOLVER_KEY = 0x3cc74200ccfb5d585a6d170f8824979dbf1b592e0a41eef41cf6d86cf4882077;

// keccak256("security.token.standard.lock.resolverKey")
bytes32 constant _LOCK_RESOLVER_KEY = 0xf1364345b3db5ebe5808f2d2d2aaecb9cdb4fddacad1534033060ebc886fc1e9;

// keccak256("security.token.standard.protected.partitions.resolverKey")
bytes32 constant _PROTECTED_PARTITIONS_RESOLVER_KEY = 0x6d65d2938c05a4d952aff0845c1baa5bea04d4544db74f8b3b26004d1d58d58f;

// keccak256("security.token.standard.hold.tokenHolder.resolverKey")
bytes32 constant _HOLD_TOKEN_HOLDER_RESOLVER_KEY = 0x87b17a3ce9a86872f21469d26f005543a22ef5729998559f4ad433d5c4253f3e;

// keccak256("security.token.standard.hold.management.resolverKey")
bytes32 constant _HOLD_MANAGEMENT_RESOLVER_KEY = 0xaab5a0e0978ad146ca8dc61d16bab0212224eadf68bd08e3c66600ee4f59c12a;

// keccak256("security.token.standard.holdRead.resolverKey")
bytes32 constant _HOLD_READ_RESOLVER_KEY = 0xd8a2714462c01975a075ccd4be2588934afd8074afef746fac089b757b803851;

// keccak256("security.token.standard.ssi.management.resolverKey")
bytes32 constant _SSI_MANAGEMENT_RESOLVER_KEY = 0x46df6aaf3742e0cbad136a74fb679b686e087dcc3a3d92d1c4ce2f3ef1b508a0;

// keccak256("security.token.standard.kyc.resolverKey")
bytes32 constant _KYC_RESOLVER_KEY = 0xf516a0f6b4726244ae916c590cd26c2b593d7d448e46e43714fb9f9435c46e32;

// keccak256("security.token.standard.clearing.transfer.resolverKey")
bytes32 constant _CLEARING_TRANSFER_RESOLVER_KEY = 0x7399d03db62430bec60ca2c3eacf98b1b7e2253f17593ef7a226d759442e0928;

// keccak256("security.token.standard.clearing.redeem.resolverKey")
bytes32 constant _CLEARING_REDEEM_RESOLVER_KEY = 0xb341e7aa749da43976c189209de51ccdf838af9f964cd27340b914d5b2aeba97;

// keccak256("security.token.standard.clearing.holdCreation.resolverKey")
bytes32 constant _CLEARING_HOLDCREATION_RESOLVER_KEY = 0x44f99a141c434fac20d69e7511932ee344d5b37b61851976c83a5df4ca468152;

// keccak256("security.token.standard.clearing.read.resolverKey")
bytes32 constant _CLEARING_READ_RESOLVER_KEY = 0xebb2e29bdf4edaf4ca66a3f9b7735087f9d0474d56d856e53c94ef00596c0b1e;

// keccak256("security.token.standard.clearing.actions.resolverKey")
bytes32 constant _CLEARING_ACTIONS_RESOLVER_KEY = 0x5472dfc5c92ad7a8651518ea7d3854d3b6494e5bcaa19f91cd61bf93bf6f2a74;

// keccak256("security.token.standard.pause.management.resolverKey")
bytes32 constant _PAUSE_MANAGEMENT_RESOLVER_KEY = 0xadd2e196c17b4f607e327e46341eedbbbc3dce86ac90ceb3e7244b0a5f8590ac;

// keccak256("security.token.standard.controllist.management.resolverKey")
bytes32 constant _CONTROL_LIST_MANAGEMENT_RESOLVER_KEY = 0xb28d59e89fa116cebe06d8de737191b637a49d95f7d8d947d47ac000463e7c71;

// keccak256("security.token.standard.kyc.management.resolverKey")
bytes32 constant _KYC_MANAGEMENT_RESOLVER_KEY = 0x8676785f4d841823214e8ee8c497b3336a210be7559f5571c590249f6203e821;

// keccak256('security.token.standard.erc3643.management.resolverKey');
bytes32 constant _ERC3643_MANAGEMENT_RESOLVER_KEY = 0x06d7f1ffc912a9e44e5d742aa1c1eff596d0fabf91a1d0fb1c3ac0fba01f1773;

// keccak256('security.token.standard.erc3643.batch.resolverKey');
bytes32 constant _ERC3643_BATCH_RESOLVER_KEY = 0x9e671b494908a7523ee4e531ae7b7076b84f1c675d31346a9697f0ff4695f249;

// keccak256('security.token.standard.erc3643.read.resolverKey');
bytes32 constant _ERC3643_READ_RESOLVER_KEY = 0xf1a7f92f11da0b048b6417201459d4e1eaef0e112e0d58d5bd6ee4481e5394c7;

// keccak256('security.token.standard.erc3643.operations.resolverKey');
bytes32 constant _ERC3643_OPERATIONS_RESOLVER_KEY = 0x39de33e56c92afe3cd7ece00d0ff8a0df512878690719e48c17d5b54604d2de2;

// keccak256('security.token.standard.freeze.resolverKey');
bytes32 constant _FREEZE_RESOLVER_KEY = 0x49f765e7155d979a148049c2a0ebed5e028b11799061897a255f99314f0bd3f1;
