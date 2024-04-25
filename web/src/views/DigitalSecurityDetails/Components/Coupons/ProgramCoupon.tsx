import { Button, Center, HStack, Stack, VStack } from "@chakra-ui/react";
import {
  CalendarInputController,
  InputNumberController,
} from "@hashgraph/securitytoken-uicomponents/Forms/Controllers";
import { Info } from "@phosphor-icons/react";
import { isAfterDate, min, required } from "../../../../utils/rules";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  GetBondDetailsRequest,
  SetCouponRequest,
} from "@hashgraph/securitytoken-sdk";
import { useParams } from "react-router-dom";
import { useCoupons } from "../../../../hooks/queries/useCoupons";
import { useGetBondDetails } from "../../../../hooks/queries/useGetSecurityDetails";
import { dateToUnixTimestamp } from "../../../../utils/format";
import { COUPONS_FACTOR } from "../../../../utils/constants";
import { PhosphorIcon, Text, Tooltip } from "@hashgraph/securitytoken-uicomponents";
import { isBeforeDate } from "../../../../utils/helpers";

interface ProgramCouponFormValues {
  rate: number;
  recordTimestamp: string;
  executionTimestamp: string;
}

export const ProgramCoupon = () => {
  const { mutate: createCoupon, isLoading } = useCoupons();
  const { control, formState, handleSubmit, watch, reset } =
    useForm<ProgramCouponFormValues>({
      mode: "all",
    });
  const { t: tForm } = useTranslation("security", {
    keyPrefix: "details.coupons.program.input",
  });
  const { t: tGlobal } = useTranslation("globals");
  const { id = "" } = useParams();
  const recordTimestamp = watch("recordTimestamp");

  const { data: bondDetails } = useGetBondDetails(
    new GetBondDetailsRequest({
      bondId: id,
    }),
  );

  const submit: SubmitHandler<ProgramCouponFormValues> = (params) => {
    const request = new SetCouponRequest({
      securityId: id ?? "",
      rate: (params.rate * COUPONS_FACTOR).toString(),
      recordTimestamp: dateToUnixTimestamp(params.recordTimestamp),
      executionTimestamp: dateToUnixTimestamp(params.executionTimestamp),
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
        <VStack
          as="form"
          onSubmit={handleSubmit(submit)}
          w="500px"
          gap={6}
          py={6}
          data-testid="coupons-form"
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
            {bondDetails && (
              <CalendarInputController
                control={control}
                id="recordTimestamp"
                rules={{ required }}
                fromDate={new Date()}
                toDate={new Date(bondDetails.maturityDate)}
                placeholder={tForm("recordDate.placeholder")}
                withTimeInput
              />
            )}
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
            {bondDetails && (
              <CalendarInputController
                control={control}
                id="executionTimestamp"
                rules={{
                  required,
                  validate: isAfterDate(new Date(recordTimestamp)),
                }}
                fromDate={new Date()}
                toDate={new Date(bondDetails.maturityDate)}
                placeholder={tForm("paymentDate.placeholder")}
                withTimeInput
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
              decimalScale={3}
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
