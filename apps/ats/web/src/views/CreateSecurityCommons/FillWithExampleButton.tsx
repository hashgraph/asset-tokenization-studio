// SPDX-License-Identifier: Apache-2.0

import { Button } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useFormContext } from "react-hook-form";
import { MagicWand } from "@phosphor-icons/react";
import { PhosphorIcon, Weight } from "io-bricks-ui";
import { ICreateEquityFormValues } from "../CreateEquity/ICreateEquityFormValues";
import { ICreateBondFormValues } from "../CreateBond/ICreateBondFormValues";

interface FillWithExampleButtonProps {
  getMockData: () => Partial<ICreateBondFormValues> | Partial<ICreateEquityFormValues>;
  translationKey?: string;
}

export const FillWithExampleButton = ({
  getMockData,
  translationKey = "fillWithExample",
}: FillWithExampleButtonProps) => {
  const { t } = useTranslation("security");
  const { setValue, trigger } = useFormContext();

  const handleFillWithExample = () => {
    const mockData = getMockData();

    Object.entries(mockData).forEach(([key, value]) => {
      setValue(key, value, {
        shouldValidate: true,
        shouldDirty: true,
      });
    });

    trigger();
  };

  return (
    <Button
      size="sm"
      variant="secondary"
      leftIcon={<PhosphorIcon as={MagicWand} weight={Weight.Fill} />}
      onClick={handleFillWithExample}
    >
      {t(translationKey)}
    </Button>
  );
};
