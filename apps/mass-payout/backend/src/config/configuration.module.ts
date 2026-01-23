// SPDX-License-Identifier: Apache-2.0

import { ConfigModule } from "@nestjs/config"
import { DynamicModule, Module } from "@nestjs/common"
import { ConfigKeys } from "@config/config-keys"
import Joi from "joi"

@Module({})
export class ConfigurationModule {
  private static DEFAULT_ENV_FILE = "/.env"

  static forRoot(envFile?: string): DynamicModule {
    return {
      module: ConfigurationModule,
      imports: [
        ConfigModule.forRoot({
          envFilePath: process.cwd() + (envFile ?? ConfigurationModule.DEFAULT_ENV_FILE),
          validationSchema: Joi.object({
            [ConfigKeys.APP_ENV]: Joi.string().required(),
            [ConfigKeys.PORT]: Joi.number().required(),
          }),
          isGlobal: true,
        }),
      ],
      exports: [ConfigModule],
    }
  }
}
