// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { Box } from "@chakra-ui/react";
import { Wizard } from "io-bricks-ui";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StepAssetDetails } from "./StepAssetDetails";
import { StepReview } from "./StepReview";

interface ImportAssetFormValues {
  assetId: string;
  assetName: string;
  assetSymbol: string;
  assetType: string;
}

interface StepsType {
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  activeStepPercent: number;
  isActiveStep: (step: number) => boolean;
  isCompleteStep: (step: number) => boolean;
  isIncompleteStep: (step: number) => boolean;
  getStatus: (step: number) => any;
  goToNext: () => void;
  goToPrevious: () => void;
}

interface WizardConfigurationProps {
  form: UseFormReturn<ImportAssetFormValues>;
  steps: StepsType;
}

export const WizardConfiguration = ({ steps }: WizardConfigurationProps) => {
  const { t } = useTranslation("importAsset");

  const wizardSteps = [
    {
      title: t("header.details"),
      content: <StepAssetDetails goToNext={steps.goToNext} />,
    },
    {
      title: t("header.review"),
      content: <StepReview />,
    },
  ];

  return (
    <Box bg="neutral.50" borderRadius="lg" boxShadow="sm" p={6} flex="1" display="flex" flexDirection="column">
      <Wizard
        // @ts-ignore
        steps={wizardSteps}
        {...steps}
      />
    </Box>
  );
};
