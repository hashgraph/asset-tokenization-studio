// SPDX-License-Identifier: Apache-2.0

import { AmountType, DistributionSubtype } from "@/services/DistributionService";

// Enums for form values
export enum FormDistributionType {
  MANUAL = "manual",
  SCHEDULED = "scheduled",
  RECURRING = "recurring",
  AUTOMATED = "automated",
}

export enum FormAmountType {
  FIXED = "fixed",
  PERCENTAGE = "percentage",
}

export enum RecurringFrequency {
  HOURLY = "hourly",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

export enum TriggerCondition {
  ON_DEPOSIT = "on_deposit",
}

export interface NewDistributionFormValues {
  amountType: FormAmountType;
  amount: number;
  distributionType: FormDistributionType | "";
  concept?: string;
  scheduledDate?: string;
  recurringFrequency?: RecurringFrequency | "";
  recurringStartDate?: string;
  triggerCondition?: TriggerCondition;
}

// Mapping functions to convert form values to API values
export const mapFormAmountTypeToAPI = (formType: FormAmountType): AmountType => {
  return formType.toUpperCase() as AmountType;
};

export const mapFormDistributionTypeToSubtype = (formType: FormDistributionType): DistributionSubtype => {
  const typeToSubtypeMap: Record<FormDistributionType, DistributionSubtype> = {
    [FormDistributionType.MANUAL]: "IMMEDIATE",
    [FormDistributionType.SCHEDULED]: "ONE_OFF",
    [FormDistributionType.RECURRING]: "RECURRING",
    [FormDistributionType.AUTOMATED]: "AUTOMATED",
  };
  return typeToSubtypeMap[formType];
};

export const mapRecurringFrequencyToAPI = (
  frequency: RecurringFrequency,
): "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" => {
  return frequency.toUpperCase() as "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
};
