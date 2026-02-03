// SPDX-License-Identifier: Apache-2.0

import { GenericContainer, StartedTestContainer } from "testcontainers"
import process from "process"
import { TypeOrmModuleOptions } from "@nestjs/typeorm"

export class PostgreSqlContainer {
  private static INTERNAL_PORT = 5432
  private static DATABASE = process.env.POSTGRESQL_DB || "test"
  private static USER = process.env.POSTGRESQL_USER || "test"
  private static PASSWORD = process.env.POSTGRESQL_PASSWORD || "test"
  private container: StartedTestContainer

  static async create(): Promise<PostgreSqlContainer> {
    const postgresqlContainer = new PostgreSqlContainer()

    postgresqlContainer.container = await new GenericContainer("postgres")
      .withExposedPorts(this.INTERNAL_PORT)
      .withEnvironment({
        POSTGRES_DB: this.DATABASE,
        POSTGRES_USER: this.USER,
        POSTGRES_PASSWORD: this.PASSWORD,
      })
      .start()

    return postgresqlContainer
  }

  public getConfig(): TypeOrmModuleOptions {
    return {
      host: this.container.getHost(),
      port: this.container.getMappedPort(PostgreSqlContainer.INTERNAL_PORT),
      username: PostgreSqlContainer.USER,
      password: PostgreSqlContainer.PASSWORD,
      database: PostgreSqlContainer.DATABASE,
      synchronize: true,
      migrationsRun: false,
      logging: false,
    }
  }

  async stop(): Promise<void> {
    await this.container.stop()
  }
}
