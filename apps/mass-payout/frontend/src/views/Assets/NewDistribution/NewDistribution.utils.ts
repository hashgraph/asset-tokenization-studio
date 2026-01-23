// SPDX-License-Identifier: Apache-2.0

import { Asset } from "@/services/AssetService";
import { TFunction } from "i18next";
import {
  FormAmountType,
  FormDistributionType,
  mapFormAmountTypeToAPI,
  mapFormDistributionTypeToSubtype,
  mapRecurringFrequencyToAPI,
  NewDistributionFormValues,
} from "./NewDistribution.types";
import { VALIDATION_CONSTANTS } from "./NewDistribution.constants";

/**
 * Validates if the form is complete and ready for submission
 */
export const isFormValid = (isValid: boolean, amount: number, formValues: NewDistributionFormValues): boolean => {
  const { distributionType, scheduledDate, recurringFrequency, recurringStartDate } = formValues;

  const baseValidation = isValid && amount > 0;

  if (!baseValidation) return false;

  if (!distributionType || typeof distributionType !== "string") return false;

  const distributionTypeValidationMap: Record<FormDistributionType, () => boolean> = {
    [FormDistributionType.MANUAL]: () => true,
    [FormDistributionType.AUTOMATED]: () => true,
    [FormDistributionType.SCHEDULED]: () => !!scheduledDate,
    [FormDistributionType.RECURRING]: () => !!recurringFrequency && !!recurringStartDate,
  };

  const validator = distributionTypeValidationMap[distributionType as FormDistributionType];
  return validator ? validator() : false;
};

/**
 * Formats the amount for display based on the amount type
 */
export const formatAmount = (amount: number, amountType: FormAmountType): string => {
  const safeAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  return amountType === FormAmountType.FIXED
    ? `$${safeAmount.toFixed(VALIDATION_CONSTANTS.DECIMAL_SCALE)}`
    : `${safeAmount}%`;
};

/**
 * Creates the distribution description for the popup
 */
export const formatDistributionDescription = (
  t: TFunction,
  amount: number,
  amountType: FormAmountType,
  formValues: NewDistributionFormValues,
  assetData?: Asset,
): string => {
  const formattedAmount = formatAmount(amount, amountType);

  return `${t("newDistribution.popup.subtitle")}\n\n• ${t("newDistribution.popup.assetId")} ${assetData?.id || "N/A"}\n• ${t("newDistribution.popup.assetName")} ${assetData?.name || "N/A"}\n• ${t("newDistribution.popup.assetType")} ${assetData?.type || "N/A"}\n• ${t("newDistribution.popup.concept")} ${formValues.concept}\n• ${t("newDistribution.popup.amount")} ${formattedAmount}\n\n${t("newDistribution.popup.warning")}`;
};

/**
 * Creates the payload for the API request
 */
export const createPayload = (assetId: string, data: NewDistributionFormValues) => {
  const basePayload = {
    assetId,
    subtype: mapFormDistributionTypeToSubtype(data.distributionType as FormDistributionType),
    amount: data.amount.toString(),
    amountType: mapFormAmountTypeToAPI(data.amountType),
    concept: data.concept,
  };

  // Add conditional fields based on distribution type
  const conditionalFields: Record<string, any> = {};

  if (data.distributionType === FormDistributionType.SCHEDULED && data.scheduledDate) {
    conditionalFields.executeAt = new Date(data.scheduledDate).toISOString();
  }

  if (data.distributionType === FormDistributionType.RECURRING) {
    if (data.recurringStartDate) {
      conditionalFields.executeAt = new Date(data.recurringStartDate).toISOString();
    }
    if (data.recurringFrequency) {
      conditionalFields.recurrency = mapRecurringFrequencyToAPI(data.recurringFrequency);
    }
  }

  return { ...basePayload, ...conditionalFields };
};

/**
 * Validates if the distribution type requires additional fields
 */
export const isDistributionTypeValid = (data: NewDistributionFormValues): boolean => {
  const { distributionType, scheduledDate, recurringFrequency, recurringStartDate } = data;

  if (!distributionType || typeof distributionType !== "string") return false;

  const distributionTypeValidationMap: Record<FormDistributionType, () => boolean> = {
    [FormDistributionType.MANUAL]: () => true,
    [FormDistributionType.AUTOMATED]: () => true,
    [FormDistributionType.SCHEDULED]: () => !!scheduledDate,
    [FormDistributionType.RECURRING]: () => !!recurringFrequency && !!recurringStartDate,
  };

  const validator = distributionTypeValidationMap[distributionType as FormDistributionType];
  return validator ? validator() : false;
};

/**
 * Validates if a date is in the future
 */
export const validateFutureDate = (value: Date | string | undefined, errorMessage: string): string | true => {
  if (!value) return true;
  const selectedDate = new Date(value);
  const now = new Date();
  return selectedDate > now || errorMessage;
};
