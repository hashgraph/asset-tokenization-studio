// SPDX-License-Identifier: Apache-2.0

import { BlockchainEventListenerConfig } from "@domain/model/blockchain-listener";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUrl, Matches, Max, Min } from "class-validator";

// require_tld: false keeps local mirror nodes (http://localhost:5551) valid; the host allow-list does the rest.
/* eslint-disable camelcase -- validator.js option names */
const MIRROR_NODE_URL_OPTIONS = { protocols: ["http", "https"], require_protocol: true, require_tld: false };
/* eslint-enable camelcase */

/**
 * Fields a client may change on the blockchain event listener config. Anything else (including `id`)
 * is rejected by the global ValidationPipe (whitelist + forbidNonWhitelisted). The mirror node host is
 * additionally checked against BLOCKCHAIN_MIRROR_NODE_ALLOWED_HOSTS when the config is saved.
 */
export class UpsertBlockchainEventListenerConfigRequest {
  @ApiProperty({
    description: "The Hedera mirror node base url (without /api/v1); its host must be allowed",
    example: "https://testnet.mirrornode.hedera.com",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl(MIRROR_NODE_URL_OPTIONS, { message: "mirrorNodeUrl must be an http or https URL" })
  mirrorNodeUrl?: string;

  @ApiProperty({ description: "The payment token Hedera contract Id", example: "0.0.123456", required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, { message: "contractId must be a valid Hedera address format" })
  contractId?: string;

  @ApiProperty({ description: "The payment token decimals", example: 6, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(18)
  tokenDecimals?: number;

  @ApiProperty({
    description: "The consensus timestamp (seconds since epoch) the listener reads events after",
    example: "1727191500.000",
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{1,12}(\.\d{1,9})?$/, {
    message: "startTimestamp must be a consensus timestamp in seconds, e.g. 1727191500.000",
  })
  startTimestamp?: string;

  /** Returns a copy of `config` with only the fields present in this request replaced. */
  applyTo(config: BlockchainEventListenerConfig): BlockchainEventListenerConfig {
    const updated = Object.assign(new BlockchainEventListenerConfig(), config);
    if (this.mirrorNodeUrl !== undefined) updated.mirrorNodeUrl = this.mirrorNodeUrl;
    if (this.contractId !== undefined) updated.contractId = this.contractId;
    if (this.tokenDecimals !== undefined) updated.tokenDecimals = this.tokenDecimals;
    if (this.startTimestamp !== undefined) updated.startTimestamp = this.startTimestamp;
    return updated;
  }
}
