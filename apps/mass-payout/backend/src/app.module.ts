// SPDX-License-Identifier: Apache-2.0

import { Module } from "@nestjs/common"
import { ConfigurationModule } from "@config/configuration.module"
import { PostgresModule } from "@config/postgres.module"
import { AssetTokenizationStudioSdkModule } from "@config/asset-tokenization-studio-sdk.module"
import { LifeCycleCashFlowSdkModule } from "@config/life-cycle-cash-flow-sdk.module"
import { MassPayoutSDK } from "@hashgraph/mass-payout-sdk"
import { CONTROLLERS, PROVIDERS } from "./app.module-components"
import { ScheduleModule } from "@nestjs/schedule"

@Module({
  imports: [
    MassPayoutSDK,
    ConfigurationModule.forRoot(),
    PostgresModule.forRoot(),
    AssetTokenizationStudioSdkModule,
    LifeCycleCashFlowSdkModule,
    ScheduleModule.forRoot(),
  ],
  controllers: CONTROLLERS,
  providers: PROVIDERS,
})
export class AppModule {}
