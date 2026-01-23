// SPDX-License-Identifier: Apache-2.0

import { faker } from "@faker-js/faker"
import { Repository } from "typeorm"
import { TestConstants } from "@test/e2e/shared/test-constants"

// https://www.postgresql.org/docs/current/errcodes-appendix.html
const PG_SQLSTATE_UNDEFINED_TABLE = "42P01"

export class E2eUtils {
  static getToday(): Date {
    const now = new Date()
    const nowPlusMargin = new Date(now.getTime() + TestConstants.TEST_TIMEOUT)

    const dayEnd = new Date(nowPlusMargin)
    dayEnd.setHours(23, 59, 59, 999)

    return faker.date.between({ from: nowPlusMargin, to: dayEnd })
  }

  static getTomorrow(): Date {
    const tomorrow = new Date(this.getToday())
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  }

  static getOneWeekFromNow(): Date {
    const oneWeekFromNow = new Date(this.getToday())
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7)
    return oneWeekFromNow
  }

  static async purgeOrRecreate(repository: Repository<any>) {
    try {
      const tableName = repository.metadata.tableName
      await repository.query(`TRUNCATE TABLE "${tableName}" CASCADE`)
    } catch (error: any) {
      const notAnUndefinedTableError = error.code !== PG_SQLSTATE_UNDEFINED_TABLE
      if (notAnUndefinedTableError) {
        throw error
      }
      await repository.manager.connection.synchronize()
    }
  }
}
