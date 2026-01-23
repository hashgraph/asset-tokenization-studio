// SPDX-License-Identifier: Apache-2.0

import { Text } from "@chakra-ui/react";
import { PhosphorIcon } from "io-bricks-ui";
import { Check, ExclamationMark } from "@phosphor-icons/react";
import { DistributionsDetailsStatus, ProcessStatus, ProcessStatusType } from "../../../types/status";

export const useStatusIcons = () => {
  const renderProgressIndicator = (status: ProcessStatusType, progress: number) => {
    if (status === ProcessStatus.COMPLETED) {
      return <PhosphorIcon as={Check} fill="white" bg="status.success.700" borderRadius="full" p={0.5} boxSize={4} />;
    }
    if (status === ProcessStatus.FAILED) {
      return (
        <PhosphorIcon as={ExclamationMark} fill="white" bg="status.error.500" borderRadius="full" p={0.5} boxSize={4} />
      );
    }
    return (
      <Text fontSize="sm" color="neutral.600" minW="35px" textAlign="right">
        {progress}%
      </Text>
    );
  };

  const getStatusVariants = (status: ProcessStatusType | DistributionsDetailsStatus) => {
    let tagVariant:
      | "active"
      | "paused"
      | "scheduled"
      | "inProgress"
      | "completed"
      | "failed"
      | "cancelled"
      | "success"
      | "retrying"
      | "error";

    let progressVariant: "inProgress" | "success" | "error";

    const getStatusVariants = (status: ProcessStatus | DistributionsDetailsStatus) => {
      if (status === ProcessStatus.COMPLETED) {
        return {
          tagVariant: "success" as const,
          progressVariant: "success" as const,
        };
      }
      if (status === ProcessStatus.FAILED) {
        return {
          tagVariant: "failed" as const,
          progressVariant: "error" as const,
        };
      }
      if (status === ProcessStatus.IN_PROGRESS) {
        return {
          tagVariant: "inProgress" as const,
          progressVariant: "inProgress" as const,
        };
      }
      if (status === ProcessStatus.SCHEDULED) {
        return {
          tagVariant: "scheduled" as const,
          progressVariant: "inProgress" as const,
        };
      }
      if (status === ProcessStatus.CANCELLED) {
        return {
          tagVariant: "cancelled" as const,
          progressVariant: "error" as const,
        };
      }
      if (status === DistributionsDetailsStatus.PENDING) {
        return {
          tagVariant: "scheduled" as const,
          progressVariant: "inProgress" as const,
        };
      }
      if (status === DistributionsDetailsStatus.RETRYING) {
        return {
          tagVariant: "retrying" as const,
          progressVariant: "inProgress" as const,
        };
      }
      if (status === DistributionsDetailsStatus.SUCCESS) {
        return {
          tagVariant: "success" as const,
          progressVariant: "success" as const,
        };
      }
      if (status === DistributionsDetailsStatus.FAILED) {
        return {
          tagVariant: "failed" as const,
          progressVariant: "error" as const,
        };
      }
      return {
        tagVariant: "paused" as const,
        progressVariant: "inProgress" as const,
      };
    };

    const variants = getStatusVariants(status);
    tagVariant = variants.tagVariant;
    progressVariant = variants.progressVariant;

    return { tagVariant, progressVariant };
  };

  return {
    renderProgressIndicator,
    getStatusVariants,
  };
};
