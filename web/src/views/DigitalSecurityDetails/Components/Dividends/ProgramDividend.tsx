import { Button, Center, HStack, Stack, VStack } from "@chakra-ui/react";
import {
  CalendarInputController,
  InputNumberController,
} from "@iob/io-bricks-ui/Forms/Controllers";
import { min, required } from "../../../../utils/rules";
import { Info } from "@phosphor-icons/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDividends } from "../../../../hooks/queries/useDividends";
import { SetDividendsRequest } from "@iob/securitytoken-sdk";
import { useParams } from "react-router-dom";
import { dateToUnixTimestamp } from "../../../../utils/format";
import { PhosphorIcon, Text, Tooltip } from "@iob/io-bricks-ui";

interface ProgramDividendFormValues {
  amountPerUnitOfSecurity: string;
  recordTimestamp: string;
  executionTimestamp: string;
}

export const ProgramDividend = () => {
  const { mutate: createDividend, isLoading } = useDividends();
  const { control, formState, handleSubmit, reset } =
    useForm<ProgramDividendFormValues>({
      mode: "all",
    });
  const { t: tForm } = useTranslation("security", {
    keyPrefix: "details.dividends.program.input",
  });
  const { t: tGlobal } = useTranslation("globals");

  const { id } = useParams();

  const submit: SubmitHandler<ProgramDividendFormValues> = (params) => {
    const request = new SetDividendsRequest({
      securityId: id ?? "",
      amountPerUnitOfSecurity: params.amountPerUnitOfSecurity.toString(),
      recordTimestamp: dateToUnixTimestamp(params.recordTimestamp),
      executionTimestamp: dateToUnixTimestamp(params.executionTimestamp),
    });

    createDividend(request, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <Center h="full" bg="neutral.dark.600">
      <VStack
        as="form"
        onSubmit={handleSubmit(submit)}
        w="500px"
        gap={6}
        py={6}
        data-testid="dividends-form"
      >
        <Stack w="full">
          <HStack justifySelf="flex-start">
            <Text textStyle="BodyTextRegularSM">
              {tForm("recordDate.label")}*
            </Text>
            <Tooltip label={tForm("recordDate.tooltip")} placement="right">
              <PhosphorIcon as={Info} />
            </Tooltip>
          </HStack>
          <CalendarInputController
            control={control}
            id="recordTimestamp"
            rules={{ required }}
            fromDate={new Date()}
            placeholder={tForm("recordDate.placeholder")}
            withTimeInput
          />
        </Stack>
        <Stack w="full">
          <HStack justifySelf="flex-start">
            <Text textStyle="BodyTextRegularSM">
              {tForm("paymentDate.label")}*
            </Text>
            <Tooltip label={tForm("paymentDate.tooltip")} placement="right">
              <PhosphorIcon as={Info} />
            </Tooltip>
          </HStack>
          <CalendarInputController
            control={control}
            id="executionTimestamp"
            rules={{ required }}
            fromDate={new Date()}
            placeholder={tForm("paymentDate.placeholder")}
            withTimeInput
          />
        </Stack>
        <Stack w="full">
          <HStack justifySelf="flex-start">
            <Text textStyle="BodyTextRegularSM">{tForm("amount.label")}*</Text>
            <Tooltip label={tForm("amount.tooltip")} placement="right">
              <PhosphorIcon as={Info} />
            </Tooltip>
          </HStack>
          <InputNumberController
            autoFocus
            control={control}
            id="amountPerUnitOfSecurity"
            rules={{ required, min: min(0) }}
            placeholder={tForm("amount.placeholder")}
          />
        </Stack>
        <Button
          data-testid="create-dividend-button"
          alignSelf="flex-end"
          data-tesdtid="send-button"
          isLoading={isLoading}
          isDisabled={!formState.isValid}
          type="submit"
        >
          {tGlobal("send")}
        </Button>
      </VStack>
    </Center>
  );
};
