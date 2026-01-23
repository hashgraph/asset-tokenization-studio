// SPDX-License-Identifier: Apache-2.0

import { Button, Center, HStack, Stack, VStack } from "@chakra-ui/react";
import { CalendarInputController, InputNumberController, PhosphorIcon, Text, Tooltip } from "io-bricks-ui";
import { Info } from "@phosphor-icons/react";
import { isAfterDate, min, required } from "../../../../utils/rules";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { GetBondDetailsRequest, SetCouponRequest } from "@hashgraph/asset-tokenization-sdk";
import { useParams } from "react-router-dom";
import { useCoupons } from "../../../../hooks/queries/useCoupons";
import { useGetBondDetails } from "../../../../hooks/queries/useGetSecurityDetails";
import { dateToUnixTimestamp } from "../../../../utils/format";
import { DATE_TIME_FORMAT, RATE_MAX_DECIMALS } from "../../../../utils/constants";
import { isBeforeDate } from "../../../../utils/helpers";

interface ProgramCouponFormValues {
  rate: number;
  recordTimestamp: string;
  executionTimestamp: string;
  startTimestamp: string;
  endTimestamp: string;
  fixingTimestamp: string;
}

export const ProgramCoupon = () => {
  const { mutate: createCoupon, isLoading } = useCoupons();
  const { control, formState, handleSubmit, watch, reset } = useForm<ProgramCouponFormValues>({
    mode: "all",
  });
  const { t: tForm } = useTranslation("security", {
    keyPrefix: "details.coupons.program.input",
  });
  const { t: tGlobal } = useTranslation("globals");
  const { id = "" } = useParams();
  const recordTimestamp = watch("recordTimestamp");
  const startTimestamp = watch("startTimestamp");
  const fixingTimestamp = watch("fixingTimestamp");

  const { data: bondDetails } = useGetBondDetails(
    new GetBondDetailsRequest({
      bondId: id,
    }),
  );

  const submit: SubmitHandler<ProgramCouponFormValues> = (params) => {
    const request = new SetCouponRequest({
      securityId: id ?? "",
      rate: (params.rate / 100).toFixed(RATE_MAX_DECIMALS + 2),
      recordTimestamp: dateToUnixTimestamp(params.recordTimestamp),
      executionTimestamp: dateToUnixTimestamp(params.executionTimestamp),
      startTimestamp: dateToUnixTimestamp(params.startTimestamp),
      endTimestamp: dateToUnixTimestamp(params.endTimestamp),
      fixingTimestamp: dateToUnixTimestamp(params.fixingTimestamp),
      rateStatus: 1,
    });

    createCoupon(request, {
      onSuccess: () => {
        reset();
      },
    });
  };
  const canProgramCoupon = isBeforeDate(bondDetails?.maturityDate!)(new Date());

  return (
    <Center h="full">
      {canProgramCoupon ? (
        <VStack as="form" onSubmit={handleSubmit(submit)} w="500px" gap={6} py={6} data-testid="coupons-form">
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">{tForm("recordDate.label")}*</Text>
              <Tooltip label={tForm("recordDate.tooltip")} placement="right">
                <PhosphorIcon as={Info} />
              </Tooltip>
            </HStack>
            {bondDetails && (
              <CalendarInputController
                control={control}
                id="recordTimestamp"
                rules={{ required }}
                fromDate={new Date()}
                toDate={new Date(bondDetails.maturityDate)}
                placeholder={tForm("recordDate.placeholder")}
                withTimeInput
                format={DATE_TIME_FORMAT}
              />
            )}
          </Stack>
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">{tForm("paymentDate.label")}*</Text>
              <Tooltip label={tForm("paymentDate.tooltip")} placement="right">
                <PhosphorIcon as={Info} />
              </Tooltip>
            </HStack>
            {bondDetails && (
              <CalendarInputController
                control={control}
                id="executionTimestamp"
                rules={{
                  required,
                  validate: {
                    afterRecordTimestamp: isAfterDate(new Date(recordTimestamp), DATE_TIME_FORMAT),
                    afterFixingTimestamp: isAfterDate(new Date(fixingTimestamp), DATE_TIME_FORMAT),
                  },
                }}
                fromDate={new Date()}
                toDate={new Date(bondDetails.maturityDate)}
                placeholder={tForm("paymentDate.placeholder")}
                withTimeInput
                format={DATE_TIME_FORMAT}
              />
            )}
          </Stack>
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">{tForm("startDate.label")}*</Text>
              <Tooltip label={tForm("startDate.tooltip")} placement="right">
                <PhosphorIcon as={Info} />
              </Tooltip>
            </HStack>
            {bondDetails && (
              <CalendarInputController
                control={control}
                id="startTimestamp"
                rules={{ required }}
                fromDate={new Date()}
                toDate={new Date(bondDetails.maturityDate)}
                placeholder={tForm("startDate.placeholder")}
                withTimeInput
                format={DATE_TIME_FORMAT}
              />
            )}
          </Stack>
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">{tForm("endDate.label")}*</Text>
              <Tooltip label={tForm("endDate.tooltip")} placement="right">
                <PhosphorIcon as={Info} />
              </Tooltip>
            </HStack>
            {bondDetails && (
              <CalendarInputController
                control={control}
                id="endTimestamp"
                rules={{
                  required,
                  validate: isAfterDate(new Date(startTimestamp), DATE_TIME_FORMAT),
                }}
                fromDate={new Date()}
                toDate={new Date(bondDetails.maturityDate)}
                placeholder={tForm("endDate.placeholder")}
                withTimeInput
                format={DATE_TIME_FORMAT}
              />
            )}
          </Stack>
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">{tForm("fixingDate.label")}*</Text>
              <Tooltip label={tForm("fixingDate.tooltip")} placement="right">
                <PhosphorIcon as={Info} />
              </Tooltip>
            </HStack>
            {bondDetails && (
              <CalendarInputController
                control={control}
                id="fixingTimestamp"
                rules={{
                  required,
                }}
                fromDate={new Date()}
                toDate={new Date(bondDetails.maturityDate)}
                placeholder={tForm("fixingDate.placeholder")}
                withTimeInput
                format={DATE_TIME_FORMAT}
              />
            )}
          </Stack>
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">{tForm("rate.label")}*</Text>
              <Tooltip label={tForm("rate.tooltip")} placement="right">
                <PhosphorIcon as={Info} />
              </Tooltip>
            </HStack>
            <InputNumberController
              autoFocus
              control={control}
              id="rate"
              rules={{ required, min: min(0) }}
              placeholder={tForm("rate.placeholder")}
              decimalScale={RATE_MAX_DECIMALS}
              fixedDecimalScale={true}
              suffix="%"
              thousandSeparator=","
              decimalSeparator="."
            />
          </Stack>
          <Button
            data-testid="create-coupon-button"
            alignSelf="flex-end"
            data-tesdtid="send-button"
            isLoading={isLoading}
            isDisabled={!formState.isValid}
            type="submit"
          >
            {tGlobal("send")}
          </Button>
        </VStack>
      ) : (
        <Text textStyle="BodyRegularSM" data-testid="expired-warning">
          {tForm("expired")}
        </Text>
      )}
    </Center>
  );
};
