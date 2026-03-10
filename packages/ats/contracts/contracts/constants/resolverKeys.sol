// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length

// keccak256("security.token.standard.accesscontrol.resolverKey");
bytes32 constant _ACCESS_CONTROL_RESOLVER_KEY = 0x011768a41cb4fe76a26f444eec15d81a0d84e919a36336d72c6539cf41c0fcf6;

// keccak256("security.token.standard.controllist.resolverKey");
bytes32 constant _CONTROL_LIST_RESOLVER_KEY = 0xfbb1491bfcecd95f79409bd5a4b69a4ba1e5573573372f5d2d66c11e3016414c;

// keccak256("security.token.standard.pause.resolverKey");
bytes32 constant _PAUSE_RESOLVER_KEY = 0x9429fd9ef38f89f41bd9ec33fd5c94b287ed1c27a98938da43835ac761b2f92c;

// keccak256("security.token.standard.cap.resolverKey");
bytes32 constant _CAP_RESOLVER_KEY = 0xfb3f8aac36661b5540c571d821c80dc9db7ede5ca2a4204ee562b3356f0c026b;

// keccak256("security.token.standard.erc20.resolverKey");
bytes32 constant _ERC20_RESOLVER_KEY = 0x064c883089ba1a596d9146c7aaa73c19ef8825f374c67a9538787c3d12e68dc5;

// keccak256("security.token.standard.erc20votes.resolverKey");
bytes32 constant _ERC20VOTES_RESOLVER_KEY = 0x5cbfbaa435e19a43530a00ac685c9b5252862a94af2053667ded44642a0d9f4c;

// keccak256("security.token.standard.erc1594.resolverKey");
bytes32 constant _ERC1594_RESOLVER_KEY = 0xcb70773e8163595d8bd906e277adeb3935976ad802ee8c29face3dfb0263291f;

// keccak256("security.token.standard.erc20permit.resolverKey");
bytes32 constant _ERC20PERMIT_RESOLVER_KEY = 0xef05f0313623d32145212ed45620c8b2c8c294b3d6955cf26f3d1b0569fbc1fa;

// keccak256("security.token.standard.erc1643.resolverKey");
bytes32 constant _ERC1643_RESOLVER_KEY = 0x24543637956a3076689f171d3932b10f22d40f3785d53acebb340f37bed01625;

// keccak256("security.token.standard.erc1410.read.resolverKey");
bytes32 constant _ERC1410_READ_RESOLVER_KEY = 0x5eb2734b83ea80c3eb63463a6192b30ab2526cb7a073f0abfda1a404c92ae497;

// keccak256("security.token.standard.erc1410.tokenHolder.resolverKey");
bytes32 constant _ERC1410_TOKEN_HOLDER_RESOLVER_KEY = 0x0466bf860d23f1ecbc25f364735e0dc3830d236f09182599831730ddd2792caa;

// keccak256("security.token.standard.erc1410.management.resolverKey");
bytes32 constant _ERC1410_MANAGEMENT_RESOLVER_KEY = 0x232f8686795d3f197681faf0d8db05655e759f62d709d56b97e5d9cfff29dbf5;

// keccak256("security.token.standard.erc1410.issuer.resolverKey");
bytes32 constant _ERC1410_ISSUER_RESOLVER_KEY = 0x6e82b75f32c9647cc00b4c3eabbef5a82677f3e91d5d196eb4dd6a0365941344;

// keccak256("security.token.standard.erc1644.resolverKey");
bytes32 constant _ERC1644_RESOLVER_KEY = 0xf1da2ed271d62ba0b6597874c96fb6ed7d929e5ec679f4ad8c2c516c72f6736d;

// keccak256("security.token.standard.snapshots.resolverKey");
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

// keccak256("security.token.standard.erc3643.read.resolverKey");
bytes32 constant _ERC3643_READ_RESOLVER_KEY = 0x7743c4e9ff26ef34c3c482d2c12dabe076035eb44bf1c736722f04c33c20ef6a;

// keccak256("security.token.standard.erc3643.management.resolverKey");
bytes32 constant _ERC3643_MANAGEMENT_RESOLVER_KEY = 0xae7b7d0da6ac02e802a8d85aa821dd5cb84e8448836471680f744f64b678a073;

// keccak256("security.token.standard.erc3643.operations.resolverKey");
bytes32 constant _ERC3643_OPERATIONS_RESOLVER_KEY = 0xe30b6b8e9e62fb8f017c940c7ffac12709f7ef6ae90beac5570fab25c7384e9c;

// keccak256("security.token.standard.erc3643.batch.resolverKey");
bytes32 constant _ERC3643_BATCH_RESOLVER_KEY = 0x00332311d9f0c311b31b87399043a90feb10341fcbb4d7f4ed6e3c0072a3c392;

// keccak256("security.token.standard.freeze.resolverKey");
bytes32 constant _FREEZE_RESOLVER_KEY = 0x49f765e7155d979a148049c2a0ebed5e028b11799061897a255f99314f0bd3f1;

// keccak256("security.token.standard.externalcontrollist.resolverKey");
bytes32 constant _EXTERNAL_CONTROL_LIST_RESOLVER_KEY = 0x490196911bc65200514fb4568861a36670854901dffa91bc27577664fdace575;

// keccak256("security.token.standard.externalkyclist.resolverKey");
bytes32 constant _EXTERNAL_KYC_LIST_RESOLVER_KEY = 0x32f05e55195d945105aff8ac4b041d4680824578bd72c6a34e4aa906a59237f1;

// keccak256("security.token.standard.externalpause.resolverKey");
bytes32 constant _EXTERNAL_PAUSE_RESOLVER_KEY = 0x158025f9e40c5d145e7915a14d5e97459728d98c715d8329359e305df737ee3c;

// keccak256("security.token.standard.hold.resolverKey");
bytes32 constant _HOLD_RESOLVER_KEY = 0x6c7216c5c52bc8f5019fc2fb333eb5e518e647fd82c807ed7c2a1fe4a03a3860;

// keccak256("security.token.standard.ssi.resolverKey");
bytes32 constant _SSI_RESOLVER_KEY = 0x77c35dccfcdc80370e925aae86871ef8bc71db0b8e082c073cda906e89bb610e;

// keccak256("security.token.standard.nonces.resolverKey");
bytes32 constant _NONCES_RESOLVER_KEY = 0xb235fd4aa74228c048d55d58514cd3393ef934423864ef7ddca6d302041c2bd1;

// keccak256("security.token.standard.totalBalance.resolverKey");
bytes32 constant _TOTAL_BALANCE_RESOLVER_KEY = 0xd1873ecc41f0658d1ac1c9bf3fe6a4da2071b04edc7f7d3b4520d029c3ce64d5;

// keccak256("security.token.standard.timeTravel.resolverKey")
bytes32 constant _TIME_TRAVEL_RESOLVER_KEY = 0xba344464ddfb79287323340a7abdc770d353bd7dfd2695345419903dbb9918c8;

// keccak256('security.token.standard.equity.resolverKey');
bytes32 constant _EQUITY_RESOLVER_KEY = 0xfe85fe0513f5a5676011f59495ae16b2b93c981c190e99e61903e5603542c810;

// keccak256('security.token.standard.bond.variable.rate.resolverKey');
bytes32 constant _BOND_VARIABLE_RATE_RESOLVER_KEY = 0xe6594ee8f54f346ab25268fdc7955031a6b06102355e1446353d89ab1d593de3;

// keccak256('security.token.standard.bond.fixed.rate.resolverKey');
bytes32 constant _BOND_FIXED_RATE_RESOLVER_KEY = 0xd55d8787d23b78e70dada1ade45b8758f5c027e2cddf3556606c07d388ce159a;

// keccak256('security.token.standard.bond.kpilinked.rate.resolverKey');
bytes32 constant _BOND_KPI_LINKED_RATE_RESOLVER_KEY = 0x99c145ff21354eb7b25cb096873143fa3d3aba98457b96bcd13f1d1f2b9bf28c;

// keccak256('security.token.standard.bond.SustainabilityPerformanceTarget.rate.resolverKey');
bytes32 constant _BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x8048a878c656dcf3886e69ad27a9272a4fb9499299ab5f0e1b6c99ac3b1130f8;

// keccak256('security.token.standard.bond.variable.read.resolverKey');
bytes32 constant _BOND_VARIABLE_READ_RESOLVER_KEY = 0x624866e79d4c0a78a8dc32cbce49563cdf86eba627bd05a9821dbaa1674ac231;

// keccak256('security.token.standard.bond.kpilinked.read.resolverKey');
bytes32 constant _BOND_KPI_LINKED_READ_RESOLVER_KEY = 0xcced91a2a03bf45bd62730a7f4703ee2d762f8ebccff315c7145258265f73249;

// keccak256('security.token.standard.bond.SustainabilityPerformanceTarget.read.resolverKey');
bytes32 constant _BOND_SUSTAINABILITY_PERFORMANCE_TARGET_READ_RESOLVER_KEY = 0x339d458f2928ef5148317aab39e4375a27e6c531d2e5b9de2d4fb23ad0e8b504;

// keccak256('security.token.standard.scheduled.snapshots.resolverKey');
bytes32 constant _SCHEDULED_SNAPSHOTS_RESOLVER_KEY = 0x100f681e33d02a1124c2c05a537a1229eca89767c5e6e8720066ca74bfb85793;

// keccak256('security.token.standard.scheduled.balanceAdjustments.resolverKey');
bytes32 constant _SCHEDULED_BALANCE_ADJUSTMENTS_RESOLVER_KEY = 0xc418e67a48260d700e5f85863ad6fa6593206a4385728f8baba1572d631535e0;

// keccak256('security.token.standard.scheduled.couponListing.resolverKey');
bytes32 constant _SCHEDULED_COUPON_LISTING_RESOLVER_KEY = 0x6cc7645ae5bcd122875ce8bd150bd28dda6374546c4c2421e5ae4fdeedb3ab30;

// keccak256('security.token.standard.scheduled.tasks.resolverKey');
bytes32 constant _SCHEDULED_TASKS_RESOLVER_KEY = 0xa4934195ab83f1497ce5fc99b68d0f41694716bcfba5f232aa6c8e0d4d504f08;

// keccak256("security.token.standard.scheduled.crossOrderedTasks.kpilinked.rate.resolverKey")
bytes32 constant _SCHEDULED_CROSS_ORDERED_TASKS_KPI_LINKED_RATE_RESOLVER_KEY = 0x04d20e52e58dbadedfcf6c373a826fc5f7c665fd6caf67c8a65a9e777a8b70ec;

// keccak256("security.token.standard.scheduled.crossOrderedTasks.SustainabilityPerformanceTarget.rate.resolverKey")
bytes32 constant _SCHEDULED_CROSS_ORDERED_TASKS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x23d3302e505d889e80b20005bf316ccd7cbbd3c547a7305d600e8f0d9bc73267;

// keccak256('security.token.standard.balanceAdjustments.resolverKey');
bytes32 constant _BALANCE_ADJUSTMENTS_RESOLVER_KEY = 0x2bbe9fb018f1e7dd12b4442154e7fdfd75aec7b0a65d07debf49de4ece5fe8b8;

// keccak256('security.token.standard.proceedRecipients.resolverKey');
bytes32 constant _PROCEED_RECIPIENTS_RESOLVER_KEY = 0x87f4b676bf89cd24a01a78fd8e7fb2102c2f6d034be73d16402f7297e0ae625b;

// keccak256("security.token.standard.proceedRecipients.kpilinked.rate.resolverKey");
bytes32 constant _PROCEED_RECIPIENTS_KPI_LINKED_RATE_RESOLVER_KEY = 0xe2f3e1d9c8b7a6e5f4d3c2b1a9e8f7d6c5b4a3e2f1d9c8b7a6e5f4d3c2b1a9e8;

// keccak256("security.token.standard.proceedRecipients.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _PROCEED_RECIPIENTS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0xf3e4f2e1d9c8b7a6e5f4d3c2b1a9e8f7d6c5b4a3e2f1d9c8b7a6e5f4d3c2b1a9;

// keccak256('security.token.standard.fixedRate.resolverKey');
bytes32 constant _FIXED_RATE_RESOLVER_KEY = 0x2871e1c37f7423765d88b16528db7e80ad8e2bae5ab5d55e26659840c1d6b504;

// keccak256('security.token.standard.kpiLinkedRate.resolverKey');
bytes32 constant _KPI_LINKED_RATE_RESOLVER_KEY = 0x92999bd0329d03e46274ce7743ebe0060df95286df4fa7b354937b7d21757d22;

// keccak256('security.token.standard.sustainabilityPerformanceTargetRate.resolverKey');
bytes32 constant _SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0xa261a7434029a925924f47ccea7fbe12af1e56efd74e8f1d8ac23bec19a27e49;

// keccak256('security.token.standard.kpis.resolverKey');
bytes32 constant _KPIS_RESOLVER_KEY = 0xb228c36d89348606afcfbad286f8eddb0d0cdd727eefd0f0fd87f17ea0793051;

// keccak256('security.token.standard.kpis.latest.resolverKey');
bytes32 constant _KPIS_LATEST_RESOLVER_KEY = 0x74c5b383d6a5c70ac558779f6286a871cfb3fd94d076be0cae4861e57f4db077;

// keccak256('security.token.standard.kpis.latest.kpilinked.rate.resolverKey');
bytes32 constant _KPIS_LATEST_KPI_LINKED_RATE_RESOLVER_KEY = 0x9a05806c3d9c062dfa7983f282dccc0397cb5d4ebf19b80ad4b5586c1d8c6cc6;

// keccak256('security.token.standard.kpis.latest.SustainabilityPerformanceTarget.rate.resolverKey');
bytes32 constant _KPIS_LATEST_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0xb668a0e99ee4bce486604d5a7097a4e5d837d1736e0cf43b190b56d0adea78b9;

// keccak256("security.token.standard.transferAndLock.resolverKey")
bytes32 constant _TRANSFER_AND_LOCK_RESOLVER_KEY = 0xd9b300e6bf7a143b8fd8cf1d4ab050e691c862bf0f57a7d49cc08c60efe68d08;
