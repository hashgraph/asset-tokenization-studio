// SPDX-License-Identifier: Apache-2.0

import { Asset } from "@domain/model/asset"
import { Page, PageOptions } from "@domain/model/page"
import { AssetRepository } from "@domain/ports/asset-repository.port"
import { AssetRepositoryError } from "@infrastructure/adapters/repositories/errors/asset.repository.error"
import { AssetPersistence } from "@infrastructure/adapters/repositories/model/asset.persistence"
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { FindOptionsOrder, Repository } from "typeorm"

// https://www.postgresql.org/docs/current/errcodes-appendix.html
export const PG_SQLSTATE_UNIQUE_VIOLATION = "23505"

@Injectable()
export class AssetTypeOrmRepository implements AssetRepository {
  constructor(
    @InjectRepository(AssetPersistence)
    private readonly assetRepository: Repository<AssetPersistence>,
  ) {}

  async saveAsset(item: Asset): Promise<Asset> {
    const assetPersistence = AssetPersistence.fromAsset(item)
    try {
      await this.assetRepository.insert(assetPersistence)
    } catch (error) {
      if (error.code === PG_SQLSTATE_UNIQUE_VIOLATION) {
        throw new AssetRepositoryError(
          AssetRepositoryError.ERRORS.DUPLICATED_ASSET(item.name, item.hederaTokenAddress),
          error,
        )
      }
      throw new AssetRepositoryError(AssetRepositoryError.ERRORS.SAVE_ASSET(item), error)
    }
    return assetPersistence.toAsset()
  }

  async updateAsset(item: Asset): Promise<Asset> {
    const assetPersistence = AssetPersistence.fromAsset(item)
    try {
      await this.assetRepository.update(assetPersistence.id, assetPersistence)
    } catch (error) {
      throw new AssetRepositoryError(AssetRepositoryError.ERRORS.UPDATE_ASSET(item.id), error)
    }
    return assetPersistence.toAsset()
  }

  async getAsset(id: string): Promise<Asset | undefined> {
    let assetPersistence: AssetPersistence
    try {
      assetPersistence = await this.assetRepository.findOne({
        where: { id },
      })
    } catch (error) {
      throw new AssetRepositoryError(AssetRepositoryError.ERRORS.GET_ASSET(id), error)
    }
    return assetPersistence ? assetPersistence.toAsset() : undefined
  }

  async getAssetByName(name: string): Promise<Asset | undefined> {
    let assetPersistence: AssetPersistence
    try {
      assetPersistence = await this.assetRepository.findOne({
        where: { name },
      })
    } catch (error) {
      throw new AssetRepositoryError(AssetRepositoryError.ERRORS.GET_ASSET_BY_NAME(name), error)
    }
    return assetPersistence ? assetPersistence.toAsset() : undefined
  }

  async getAssetByHederaTokenAddress(hederaTokenAddress: string): Promise<Asset | undefined> {
    let assetPersistence: AssetPersistence
    try {
      assetPersistence = await this.assetRepository.findOne({
        where: { hederaTokenAddress },
      })
    } catch (error) {
      throw new AssetRepositoryError(
        AssetRepositoryError.ERRORS.GET_ASSET_BY_HEDERA_TOKEN_ADDRESS(hederaTokenAddress),
        error,
      )
    }
    return assetPersistence ? assetPersistence.toAsset() : undefined
  }

  async deleteAssets(ids: string[]): Promise<void> {
    try {
      await this.assetRepository.delete(ids)
    } catch (error) {
      throw new AssetRepositoryError(AssetRepositoryError.ERRORS.DELETE_ASSETS(ids), error)
    }
  }

  getAllAssets(): Promise<Asset[]> {
    try {
      return this.assetRepository.find().then((assets) => assets.map((asset) => asset.toAsset()))
    } catch (error) {
      throw new AssetRepositoryError(AssetRepositoryError.ERRORS.GET_ASSETS(), error)
    }
  }

  getAllSyncEnabledAssets(): Promise<Asset[]> {
    try {
      return this.assetRepository
        .find({
          where: { syncEnabled: true },
        })
        .then((assets) => assets.map((asset) => asset.toAsset()))
    } catch (error) {
      throw new AssetRepositoryError(AssetRepositoryError.ERRORS.GET_SYNC_ENABLED_ASSETS(), error)
    }
  }

  async getAssets(pageOptions: PageOptions): Promise<Page<Asset>> {
    try {
      const skip = (pageOptions.page - 1) * pageOptions.limit
      const take = pageOptions.limit
      const order: FindOptionsOrder<AssetPersistence> = {
        [pageOptions.order?.orderBy || "createdAt"]: pageOptions.order?.order || "DESC",
      }
      const [assetPersistenceList, total] = await this.assetRepository.findAndCount({
        skip,
        take,
        order,
      })
      const assets = assetPersistenceList.map((assetPersistence) => assetPersistence.toAsset())
      return {
        items: assets,
        total,
        page: pageOptions.page,
        limit: pageOptions.limit,
        totalPages: Math.ceil(total / pageOptions.limit),
      }
    } catch (error) {
      throw new AssetRepositoryError(AssetRepositoryError.ERRORS.GET_ASSETS(), error)
    }
  }
}
