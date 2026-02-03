// SPDX-License-Identifier: Apache-2.0

import { Logger, Module, OnModuleInit, Provider } from "@nestjs/common"
import { ConnectRequest, InitializationRequest, Network, SupportedWallets } from "@hashgraph/asset-tokenization-sdk"
import { AssetTokenizationStudioSdkService } from "@infrastructure/adapters/asset-tokenization-studio-sdk.service"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { ConfigKeys } from "./config-keys"

export const ATS_NETWORK_INIT = Symbol("ATS_NETWORK_INIT")

@Module({
  imports: [ConfigModule],
  providers: [
    AssetTokenizationStudioSdkService,
    {
      provide: "AssetTokenizationStudioService",
      useExisting: AssetTokenizationStudioSdkService,
    },
    networkInitProvider(),
  ],
  exports: ["AssetTokenizationStudioService"],
})
export class AssetTokenizationStudioSdkModule implements OnModuleInit {
  private readonly logger = new Logger(AssetTokenizationStudioSdkModule.name)

  async onModuleInit() {
    this.logger.log("ATS SDK Module initialized successfully")
  }
}

function networkInitProvider(): Provider {
  return {
    provide: ATS_NETWORK_INIT,
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => {
      const logger = new Logger(ATS_NETWORK_INIT.toString())

      try {
        const network = config.get<string>(ConfigKeys.ATS_NETWORK, "testnet")
        const mirrorNodeUrl = config.get<string>(
          ConfigKeys.ATS_MIRROR_URL,
          "https://testnet.mirrornode.hedera.com/api/v1/",
        )
        const rpcNodeUrl = config.get<string>(ConfigKeys.ATS_RPC_URL, "https://testnet.hashio.io/api")
        const factoryAddress = config.get<string>(ConfigKeys.ATS_FACTORY_ADDRESS, "0.0.6224505")
        const resolverAddress = config.get<string>(ConfigKeys.ATS_RESOLVER_ADDRESS, "0.0.6224426")

        const mirrorNode = { name: "testMirrorNode", baseUrl: mirrorNodeUrl }
        const rpcNode = { name: "testRpcNode", baseUrl: rpcNodeUrl }

        await Network.init(
          new InitializationRequest({
            network,
            configuration: { factoryAddress, resolverAddress },
            mirrorNode,
            rpcNode,
          }),
        )

        await Network.connect(
          new ConnectRequest({
            network,
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
        logger.error("Failed to initialize ATS SDK Network")
        logger.error(error.message)
        throw new Error(`ATS SDK initialization failed: ${error.message}`)
      }
    },
  }
}
