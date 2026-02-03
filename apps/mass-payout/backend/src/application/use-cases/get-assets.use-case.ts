// SPDX-License-Identifier: Apache-2.0

import { Asset } from "@domain/model/asset"
import { Page, PageOptions } from "@domain/model/page"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { Inject, Injectable } from "@nestjs/common"

@Injectable()
export class GetAssetsUseCase {
  constructor(@Inject("AssetRepository") private readonly assetRepository: AssetRepository) {}

  async execute(pageOptions: PageOptions = PageOptions.DEFAULT): Promise<Page<Asset>> {
    return this.assetRepository.getAssets(pageOptions)
  }
}
