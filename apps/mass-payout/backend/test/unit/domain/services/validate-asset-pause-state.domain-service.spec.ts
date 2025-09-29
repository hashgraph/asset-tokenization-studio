/*
 *    Copyright 2025 Hedera Hashgraph LLC
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

import { AssetPausedError } from "@domain/errors/asset.error"
import { ValidateAssetPauseStateDomainService } from "@domain/services/validate-asset-pause-state.domain-service"
import { faker } from "@faker-js/faker/."
import { Test, TestingModule } from "@nestjs/testing"
import { AssetUtils } from "@test/shared/asset.utils"

describe(ValidateAssetPauseStateDomainService.name, () => {
  let validateAssetPauseStateDomainService: ValidateAssetPauseStateDomainService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidateAssetPauseStateDomainService],
    }).compile()

    validateAssetPauseStateDomainService = module.get<ValidateAssetPauseStateDomainService>(
      ValidateAssetPauseStateDomainService,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("validateDomainPauseState", () => {
    it("should resolve when asset is not paused in domain", async () => {
      const asset = AssetUtils.newInstance({ isPaused: false })
      const distributionId = faker.string.uuid()

      await expect(
        validateAssetPauseStateDomainService.validateDomainPauseState(asset, distributionId),
      ).resolves.toBeUndefined()
    })

    it("should throw AssetPausedError when asset is paused in domain", async () => {
      const asset = AssetUtils.newInstance({ isPaused: true })
      const distributionId = faker.string.uuid()

      await expect(
        validateAssetPauseStateDomainService.validateDomainPauseState(asset, distributionId),
      ).rejects.toThrow(new AssetPausedError(asset.name, asset.hederaTokenAddress))
    })

    it("should include distribution ID in error context when asset is paused", async () => {
      const asset = AssetUtils.newInstance({ isPaused: true })
      const distributionId = faker.string.uuid()

      try {
        await validateAssetPauseStateDomainService.validateDomainPauseState(asset, distributionId)
        fail("Expected AssetPausedError to be thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(AssetPausedError)
        expect(error.message).toContain(asset.name)
        expect(error.message).toContain(asset.hederaTokenAddress)
      }
    })
  })
})
