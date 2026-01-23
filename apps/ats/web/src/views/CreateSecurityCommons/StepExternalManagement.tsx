// SPDX-License-Identifier: Apache-2.0

import { FormControl, HStack, SimpleGrid, Stack, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { X } from "@phosphor-icons/react";
import { PhosphorIcon, Text, InfoDivider, SelectController, Tag, PanelTitle } from "io-bricks-ui";
import { useFormContext, useFormState } from "react-hook-form";
import { useEffect, useState } from "react";
import { useExternalPauseStore } from "../../store/externalPauseStore";
import { ICreateEquityFormValues } from "../CreateEquity/ICreateEquityFormValues";
import { ICreateBondFormValues } from "../CreateBond/ICreateBondFormValues";
import { FormStepContainer } from "../../components/FormStepContainer";
import { CancelButton } from "../../components/CancelButton";
import { PreviousStepButton } from "../CreateEquity/Components/PreviousStepButton";
import { NextStepButton } from "../CreateEquity/Components/NextStepButton";
import { useExternalControlStore } from "../../store/externalControlStore";
import { useExternalKYCStore } from "../../store/externalKYCStore";

type SelectOption = {
  value: string;
  label: string;
};

export const StepExternalManagement = () => {
  const { t } = useTranslation("security", {
    keyPrefix: "createEquity.stepExternalManagement",
  });

  const { externalPauses } = useExternalPauseStore();
  const { externalControls } = useExternalControlStore();
  const { externalKYCs } = useExternalKYCStore();

  const { control, watch, setValue } = useFormContext<ICreateEquityFormValues | ICreateBondFormValues>();

  const stepFormState = useFormState({
    control,
  });

  const [externalPausesSelected, setExternalPausesSelected] = useState<string[]>(watch("externalPausesList") ?? []);
  const [externalControlsSelected, setExternalControlsSelected] = useState<string[]>(
    watch("externalControlList") ?? [],
  );
  const [externalKYCsSelected, setExternalKYCsSelected] = useState<string[]>(watch("externalKYCList") ?? []);

  useEffect(() => {
    setValue("externalPausesList", externalPausesSelected);
    setValue("externalControlList", externalControlsSelected);
    setValue("externalKYCList", externalKYCsSelected);
  }, [externalPausesSelected, externalControlsSelected, externalKYCsSelected, setValue]);

  const externalPauseOptions = externalPauses
    .map(({ address }) => ({
      label: address,
      value: address,
    }))
    .filter((option) => !externalPausesSelected.includes(option.value));

  const externalControlOptions = externalControls
    .map(({ address }) => ({
      label: address,
      value: address,
    }))
    .filter((option) => !externalControlsSelected.includes(option.value));

  const externalKYCOptions = externalKYCs
    .map(({ address }) => ({
      label: address,
      value: address,
    }))
    .filter((option) => !externalKYCsSelected.includes(option.value));

  const handlePauseSelect = (option: SelectOption[]) => {
    const selectedAddress = option[0].value;

    setExternalPausesSelected((prev) => {
      if (prev.includes(selectedAddress)) return prev;

      return [...prev, selectedAddress];
    });
  };

  const handlePauseRemove = (addressToRemove: string) => {
    setExternalPausesSelected((prev) => prev.filter((address) => address !== addressToRemove));
  };

  const handleControlSelect = (option: SelectOption[]) => {
    const selectedAddress = option[0].value;

    setExternalControlsSelected((prev) => {
      if (prev.includes(selectedAddress)) return prev;

      return [...prev, selectedAddress];
    });
  };

  const handleControlRemove = (addressToRemove: string) => {
    setExternalControlsSelected((prev) => prev.filter((address) => address !== addressToRemove));
  };

  const handleKYCSelect = (option: SelectOption[]) => {
    const selectedAddress = option[0].value;

    setExternalKYCsSelected((prev) => {
      if (prev.includes(selectedAddress)) return prev;

      return [...prev, selectedAddress];
    });
  };

  const handleKYCRemove = (addressToRemove: string) => {
    setExternalKYCsSelected((prev) => prev.filter((address) => address !== addressToRemove));
  };

  return (
    <FormStepContainer>
      <Stack gap={2}>
        <Text textStyle="HeadingMediumLG">{t("title")}</Text>
        <Text textStyle="BodyTextRegularMD">{t("subtitle")}</Text>
      </Stack>
      <InfoDivider title={t("externalPause")} type="main" />
      <VStack w="full">
        <FormControl gap={4} as={SimpleGrid} columns={{ base: 7, lg: 1 }}>
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">{t("pauseList")}</Text>
            </HStack>
            <SelectController
              control={control}
              id="externalPausesList"
              placeholder={t("pauseListPlaceholder")}
              options={externalPauseOptions}
              isMulti
              setsFullOption
              onChange={(option) => handlePauseSelect(option as unknown as SelectOption[])}
            />
          </Stack>
          <VStack w="auto" layerStyle="whiteContainer" mb={3}>
            <PanelTitle title={t("externalPausesSelected")} />
            <HStack layerStyle="whiteContainer" noOfLines={20} lineHeight={10}>
              {externalPausesSelected.map((item) => (
                <Tag
                  key={item}
                  label={item}
                  size="sm"
                  rightIcon={<PhosphorIcon as={X} />}
                  onClick={() => handlePauseRemove(item)}
                />
              ))}
            </HStack>
          </VStack>
          <InfoDivider title={t("externalControl")} type="main" />
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">{t("controlList")}</Text>
            </HStack>
            <SelectController
              control={control}
              id="externalPausesList"
              placeholder={t("controlListPlaceholder")}
              options={externalControlOptions}
              isMulti
              setsFullOption
              onChange={(option) => handleControlSelect(option as unknown as SelectOption[])}
            />
          </Stack>
          <VStack w="auto" layerStyle="whiteContainer">
            <PanelTitle title={t("externalControlsSelected")} />
            <HStack layerStyle="whiteContainer" noOfLines={20} lineHeight={10}>
              {externalControlsSelected.map((item) => (
                <Tag
                  key={item}
                  label={item}
                  size="sm"
                  rightIcon={<PhosphorIcon as={X} />}
                  onClick={() => handleControlRemove(item)}
                />
              ))}
            </HStack>
          </VStack>
          <InfoDivider title={t("externalKYC")} type="main" />
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">{t("kycList")}</Text>
            </HStack>
            <SelectController
              control={control}
              id="externalKYCList"
              placeholder={t("kycListPlaceholder")}
              options={externalKYCOptions}
              isMulti
              setsFullOption
              onChange={(option) => handleKYCSelect(option as unknown as SelectOption[])}
            />
          </Stack>
          <VStack w="auto" layerStyle="whiteContainer">
            <PanelTitle title={t("externalKYCsSelected")} />
            <HStack layerStyle="whiteContainer" noOfLines={20} lineHeight={10}>
              {externalKYCsSelected.map((item) => (
                <Tag
                  key={item}
                  label={item}
                  size="sm"
                  rightIcon={<PhosphorIcon as={X} />}
                  onClick={() => handleKYCRemove(item)}
                />
              ))}
            </HStack>
          </VStack>
        </FormControl>
      </VStack>

      <HStack gap={4} w="full" h="100px" align="end" justifyContent={"flex-end"}>
        <CancelButton />
        <PreviousStepButton />
        <NextStepButton isDisabled={!stepFormState.isValid} />
      </HStack>
    </FormStepContainer>
  );
};
