// SPDX-License-Identifier: Apache-2.0

import { AssetType } from "@domain/model/asset-type.enum"
import { LifeCycleCashFlowAddress } from "@domain/model/life-cycle-cash-flow-address.value-object"
import { GetAssetInfoResponse } from "@domain/ports/get-asset-info-response.interface"
import { faker } from "@faker-js/faker"
import { AssetPersistence } from "@infrastructure/adapters/repositories/model/asset.persistence"
import { HttpStatus } from "@nestjs/common"
import { E2eTestApp } from "@test/e2e/shared/e2e-test.app"
import { E2eUtils } from "@test/e2e/shared/e2e-utils"
import { TestConstants } from "@test/e2e/shared/test-constants"
import { fakeHederaAddress } from "@test/shared/utils"
import request from "supertest"
import { Repository } from "typeorm"

describe("Import Asset", () => {
  let e2eTestApp: E2eTestApp
  let internalAssetRepository: Repository<AssetPersistence>
  const endpoint = "/assets/import"

  beforeAll(async () => {
    e2eTestApp = await E2eTestApp.create()
    internalAssetRepository = e2eTestApp.getRepository(AssetPersistence)
  }, TestConstants.BEFORE_ALL_TIMEOUT)

  afterAll(async () => {
    await e2eTestApp.stop()
  }, TestConstants.AFTER_ALL_TIMEOUT)

  afterEach(async () => await E2eUtils.purgeOrRecreate(internalAssetRepository), TestConstants.AFTER_EACH_TIMEOUT)

  it(
    "should import the asset successfully",
    async () => {
      const payload = {
        hederaTokenAddress: fakeHederaAddress(),
      }
      const getAssetInfoResponse: GetAssetInfoResponse = {
        hederaTokenAddress: fakeHederaAddress(),
        name: faker.commerce.productName(),
        symbol: faker.finance.currencySymbol(),
        assetType: AssetType.BOND_VARIABLE_RATE,
      }
      e2eTestApp.assetTokenizationStudioServiceMock.getAssetInfo.mockResolvedValue(getAssetInfoResponse)
      e2eTestApp.hederaServiceMock.getEvmAddressFromHedera.mockResolvedValue(faker.finance.ethereumAddress())
      e2eTestApp.hederaServiceMock.getEvmAddressFromHedera.mockResolvedValue(faker.finance.ethereumAddress())
      e2eTestApp.lifeCycleCashFlowMock.isPaused.mockResolvedValue(false)
      e2eTestApp.lifeCycleCashFlowMock.deployContract.mockResolvedValue(
        LifeCycleCashFlowAddress.create(fakeHederaAddress(), faker.finance.ethereumAddress()),
      )

      const response = await request((e2eTestApp as any).app.getHttpServer())
        .post(endpoint)
        .send(payload)
        .expect(HttpStatus.CREATED)

      const { body } = response
      expect(body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          hederaTokenAddress: payload.hederaTokenAddress,
          evmTokenAddress: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      )
      const persisted = await internalAssetRepository.findOneBy({ id: body.id })
      expect(persisted).not.toBeNull()
      expect(persisted!.id).toBe(body.id)
      expect(persisted!.hederaTokenAddress).toBe(body.hederaTokenAddress)
      expect(persisted!.name).toBe(getAssetInfoResponse.name)
      expect(persisted!.hederaTokenAddress).toBe(payload.hederaTokenAddress)
    },
    TestConstants.TEST_TIMEOUT,
  )

  it(
    "returns 400 when hederaTokenAddress is empty",
    async () => {
      const payload = { hederaTokenAddress: "" }

      await request((e2eTestApp as any).app.getHttpServer())
        .post(endpoint)
        .send(payload)
        .expect(HttpStatus.BAD_REQUEST)
    },
    TestConstants.TEST_TIMEOUT,
  )

  it(
    "returns 400 when hederaTokenAddress has an invalid format",
    async () => {
      const payload = { hederaTokenAddress: "invalid-address" }

      await request((e2eTestApp as any).app.getHttpServer())
        .post(endpoint)
        .send(payload)
        .expect(HttpStatus.BAD_REQUEST)
    },
    TestConstants.TEST_TIMEOUT,
  )

  it(
    "returns 409 when duplicate hederaTokenAddress",
    async () => {
      const duplicatedHederaAddress = fakeHederaAddress()
      const first = { hederaTokenAddress: duplicatedHederaAddress }
      const second = { hederaTokenAddress: duplicatedHederaAddress }

      const getAssetInfoResponse: GetAssetInfoResponse = {
        hederaTokenAddress: duplicatedHederaAddress,
        name: faker.commerce.productName(),
        symbol: faker.finance.currencySymbol(),
        assetType: AssetType.BOND_VARIABLE_RATE,
      }
      e2eTestApp.assetTokenizationStudioServiceMock.getAssetInfo.mockResolvedValue(getAssetInfoResponse)
      e2eTestApp.hederaServiceMock.getEvmAddressFromHedera.mockResolvedValue(faker.finance.ethereumAddress())
      e2eTestApp.lifeCycleCashFlowMock.isPaused.mockResolvedValue(false)
      e2eTestApp.lifeCycleCashFlowMock.deployContract.mockResolvedValue(
        LifeCycleCashFlowAddress.create(fakeHederaAddress(), faker.finance.ethereumAddress()),
      )

      await request((e2eTestApp as any).app.getHttpServer())
        .post(endpoint)
        .send(first)
        .expect(HttpStatus.CREATED)

      await request((e2eTestApp as any).app.getHttpServer())
        .post(endpoint)
        .send(second)
        .expect(HttpStatus.CONFLICT)
    },
    TestConstants.TEST_TIMEOUT,
  )

  it(
    "returns 500 when the database fails (e.g. missing table)",
    async () => {
      // eslint-disable-next-line @stylistic/ts/quotes
      await internalAssetRepository.query('DROP TABLE IF EXISTS "Asset" CASCADE;')
      const payload = {
        hederaTokenAddress: fakeHederaAddress(),
      }

      const getAssetInfoResponse: GetAssetInfoResponse = {
        hederaTokenAddress: payload.hederaTokenAddress,
        name: faker.commerce.productName(),
        symbol: faker.finance.currencySymbol(),
        assetType: AssetType.BOND_VARIABLE_RATE,
      }
      e2eTestApp.assetTokenizationStudioServiceMock.getAssetInfo.mockResolvedValue(getAssetInfoResponse)
      e2eTestApp.hederaServiceMock.getEvmAddressFromHedera.mockResolvedValue(faker.finance.ethereumAddress())
      e2eTestApp.lifeCycleCashFlowMock.isPaused.mockResolvedValue(false)
      e2eTestApp.lifeCycleCashFlowMock.deployContract.mockResolvedValue(
        LifeCycleCashFlowAddress.create(fakeHederaAddress(), faker.finance.ethereumAddress()),
      )

      const response = await request((e2eTestApp as any).app.getHttpServer())
        .post(endpoint)
        .send(payload)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)

      expect(response.body).toEqual(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: expect.stringContaining("Internal server error"),
        }),
      )
    },
    TestConstants.TEST_TIMEOUT,
  )
})
