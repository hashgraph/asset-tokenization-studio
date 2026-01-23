// SPDX-License-Identifier: Apache-2.0

export enum ProcessStatus {
  COMPLETED = "Completed",
  FAILED = "Failed",
  IN_PROGRESS = "In Progress",
  SCHEDULED = "Scheduled",
  CANCELLED = "Cancelled",
}

export enum DistributionsDetailsStatus {
  PENDING = "Pending",
  RETRYING = "Retrying",
  SUCCESS = "Success",
  FAILED = "Failed",
}

export enum HolderStatus {
  FAILED = "FAILED",
  PENDING = "PENDING",
  RETRYING = "RETRYING",
}

export type ProcessStatusType = ProcessStatus;
export type DistributionsDetailsStatusType = DistributionsDetailsStatus;
export type HolderStatusType = HolderStatus;
