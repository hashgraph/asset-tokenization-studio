// SPDX-License-Identifier: Apache-2.0

import { Logger, Module, OnModuleInit, Provider } from "@nestjs/common"
import {
  ConnectRequest,
  InitializationRequest,
  MassPayoutSDK,
  Network,
  SupportedWallets,
} from "@hashgraph/mass-payout-sdk"
import { LifeCycleCashFlowSdkService } from "@infrastructure/adapters/life-cycle-cash-flow-sdk.service"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { ConfigKeys } from "./config-keys"
import { AssetTokenizationStudioSdkModule } from "@config/asset-tokenization-studio-sdk.module"
import { HederaServiceImpl } from "@infrastructure/adapters/hedera.service"

export const NETWORK_INIT = Symbol("NETWORK_INIT")

@Module({
  imports: [ConfigModule, MassPayoutSDK, AssetTokenizationStudioSdkModule],
  providers: [
    {
      provide: "HederaService",
      useClass: HederaServiceImpl,
    },
    LifeCycleCashFlowSdkService,
    networkInitProvider(),
  ],
  exports: [LifeCycleCashFlowSdkService],
})
export class LifeCycleCashFlowSdkModule implements OnModuleInit {
  private readonly logger = new Logger(LifeCycleCashFlowSdkModule.name)

  async onModuleInit() {
    this.logger.log("SDK Module initialized successfully")
  }
}

function networkInitProvider(): Provider {
  return {
    provide: NETWORK_INIT,
    inject: [ConfigService, Network, LifeCycleCashFlowSdkService],
    useFactory: async (config: ConfigService, network: Network) => {
      const logger = new Logger(NETWORK_INIT.toString())

      try {
        const environment = config.get<string>(ConfigKeys.NETWORK, "testnet")
        const mirrorNodeUrl = config.get<string>(ConfigKeys.MIRROR_URL, "https://testnet.mirrornode.hedera.com/api/v1/")
        const rpcNodeUrl = config.get<string>(ConfigKeys.RPC_URL, "https://testnet.hashio.io/api")

        const mirrorNode = { name: "testMirrorNode", baseUrl: mirrorNodeUrl }
        const rpcNode = { name: "testRpcNode", baseUrl: rpcNodeUrl }
        await network.init(
          new InitializationRequest({
            network: environment,
            mirrorNode,
            rpcNode,
          }),
        )

        await network.connect(
          new ConnectRequest({
            network: environment,
            wallet: SupportedWallets.DFNS,
            mirrorNode,
            rpcNode,
            custodialWalletSettings: {
              authorizationToken: config.get<string>(ConfigKeys.DFNS_SERVICE_ACCOUNT_AUTHORIZATION_TOKEN)!,
              credentialId: config.get<string>(ConfigKeys.DFNS_SERVICE_ACCOUNT_CREDENTIAL_ID)!,
              serviceAccountPrivateKey: config.get<string>(ConfigKeys.DFNS_SERVICE_ACCOUNT_PRIVATE_KEY_OR_PATH)!,
              urlApplicationOrigin: config.get<string>(ConfigKeys.DFNS_APP_ORIGIN)!,
              applicationId: config.get<string>(ConfigKeys.DFNS_APP_ID)!,
              baseUrl: config.get<string>(ConfigKeys.DFNS_BASE_URL)!,
              walletId: config.get<string>(ConfigKeys.DFNS_WALLET_ID)!,
              hederaAccountId: config.get<string>(ConfigKeys.DFNS_HEDERA_ACCOUNT_ID)!,
              publicKey: config.get<string>(ConfigKeys.DFNS_WALLET_PUBLIC_KEY)!,
            },
          }),
        )

        return true
      } catch (error) {
        logger.error("Failed to initialize SDK Network")
        logger.error(error.message)
        throw new Error(`SDK initialization failed: ${error.message}`)
      }
    },
  }
}
