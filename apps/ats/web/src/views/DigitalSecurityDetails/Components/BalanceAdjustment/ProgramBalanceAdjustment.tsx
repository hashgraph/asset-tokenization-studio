// SPDX-License-Identifier: Apache-2.0

import { Center, HStack, Stack, VStack } from "@chakra-ui/react";
import {
  Button,
  CalendarInputController,
  Heading,
  InputNumberController,
  PhosphorIcon,
  Text,
  Tooltip,
} from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { Info } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { required, min, isAfterDate } from "../../../../utils/rules";
import { useParams } from "react-router-dom";
import { useBalanceAdjustment } from "../../../../hooks/queries/useBalanceAdjustment";
import { calculateFactorDecimals, dateToUnixTimestamp } from "../../../../utils/format";
import { SetScheduledBalanceAdjustmentRequest } from "@hashgraph/asset-tokenization-sdk";
import { DATE_TIME_FORMAT } from "../../../../utils/constants";

interface ProgramBalanceAdjustmentFormValues {
  executionDate: string;
  factor: string;
}

export const ProgramBalanceAdjustment = () => {
  const { id: securityId } = useParams();

  const { t: tProgram } = useTranslation("security", {
    keyPrefix: "details.balanceAdjustment.program",
  });
  const { t: tForm } = useTranslation("security", {
    keyPrefix: "details.balanceAdjustment.program.form",
  });
  const { t: tGlobal } = useTranslation("globals");

  const { mutate: createBalanceAdjustment, isLoading } = useBalanceAdjustment();

  const { control, formState, handleSubmit, reset } = useForm<ProgramBalanceAdjustmentFormValues>({
    mode: "all",
  });

  const onSubmit = (data: ProgramBalanceAdjustmentFormValues) => {
    const { factor, decimals } = calculateFactorDecimals(Number(data.factor));

    const request = new SetScheduledBalanceAdjustmentRequest({
      securityId: securityId ?? "",
      executionDate: dateToUnixTimestamp(data.executionDate),
      factor: factor.toString(),
      decimals: decimals.toString(),
    });

    createBalanceAdjustment(request, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <Center h="full" bg="neutral.dark.600">
      <Stack w="500px">
        <Heading textStyle="HeadingMediumLG">{tProgram("title")}</Heading>

        <VStack
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          w="500px"
          gap={6}
          py={6}
          data-testid="balance-adjustment-form"
        >
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">{tForm("executionDate.label")}*</Text>
              <Tooltip label={tForm("executionDate.tooltip")} placement="right">
                <PhosphorIcon as={Info} />
              </Tooltip>
            </HStack>
            <CalendarInputController
              control={control}
              id="executionDate"
              rules={{
                required,
                validate: isAfterDate(new Date(), DATE_TIME_FORMAT),
              }}
              fromDate={new Date()}
              placeholder={tForm("executionDate.placeholder")}
              withTimeInput
              format={DATE_TIME_FORMAT}
            />
          </Stack>
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">{tForm("factor.label")}*</Text>
            </HStack>
            <InputNumberController
              autoFocus
              control={control}
              id="factor"
              rules={{ required, min: min(0) }}
              placeholder={tForm("factor.placeholder")}
            />
          </Stack>
          <Button
            data-testid="create-balance-adjustment-button"
            alignSelf="flex-end"
            data-tesdtid="send-button"
            isLoading={isLoading}
            isDisabled={!formState.isValid}
            type="submit"
          >
            {tGlobal("send")}
          </Button>
        </VStack>
      </Stack>
    </Center>
  );
};
