// SPDX-License-Identifier: Apache-2.0

import { ConfigKeys } from "@config/config-keys"
import { AssetPersistence } from "@infrastructure/adapters/repositories/model/asset.persistence"
import { BatchPayoutPersistence } from "@infrastructure/adapters/repositories/model/batch-payout.persistence"
import { BlockchainEventListenerConfigPersistence } from "@infrastructure/adapters/repositories/model/blockchain-event-listener-config.persistence"
import { DistributionPersistence } from "@infrastructure/adapters/repositories/model/distribution.persistence"
import { HolderPersistence } from "@infrastructure/adapters/repositories/model/holder.persistence"
import { DynamicModule, Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm"
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type"

export const ENTITIES: EntityClassOrSchema[] = [
  AssetPersistence,
  DistributionPersistence,
  HolderPersistence,
  BatchPayoutPersistence,
  BlockchainEventListenerConfigPersistence,
]
const ORM_TYPE: string = "postgres"

@Module({})
export class PostgresModule {
  static forRoot(typeOrmOptions?: TypeOrmModuleOptions, entities: EntityClassOrSchema[] = ENTITIES): DynamicModule {
    return {
      module: PostgresModule,
      imports: [
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
            return {
              ...this.getDefaultPostgreSqlConfig(configService),
              ...typeOrmOptions,
            } as TypeOrmModuleOptions
          },
        }),
        TypeOrmModule.forFeature(entities),
      ],
      exports: [TypeOrmModule],
    }
  }

  static getDefaultPostgreSqlConfig(configService: ConfigService): TypeOrmModuleOptions {
    return {
      type: ORM_TYPE,
      host: configService.get(ConfigKeys.POSTGRESQL_HOST),
      port: configService.get(ConfigKeys.POSTGRESQL_PORT),
      username: configService.get(ConfigKeys.POSTGRESQL_USER),
      password: configService.get(ConfigKeys.POSTGRESQL_PASSWORD),
      database: configService.get(ConfigKeys.POSTGRESQL_DB),
      // FIXME: As long as we do NOT use formal migrations, we use this
      //  config for TypeORM to create the tables automatically
      //  - Dev  : synchronize = true  , migrationsRun = false
      //  - Prod : synchronize = false , migrationsRun = true
      synchronize: true,
      migrationsRun: false,
      //migrations: ["dist/src/migrations/*{.ts,.js}"],
      autoLoadEntities: true,
    } as TypeOrmModuleOptions
  }
}
