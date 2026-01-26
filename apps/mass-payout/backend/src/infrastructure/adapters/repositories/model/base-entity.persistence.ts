// SPDX-License-Identifier: Apache-2.0

import { Column, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { BaseEntity } from "@domain/model/base-entity"

export class BaseEntityPersistence {
  @Column({ type: "uuid", primary: true })
  id: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  static fromEntity<T extends BaseEntity, P extends BaseEntityPersistence>(entity: T, entityPersistence: P): P {
    entityPersistence.id = entity.id
    entityPersistence.createdAt = entity.createdAt
    entityPersistence.updatedAt = entity.updatedAt
    return entityPersistence
  }
}
