import { useEffect } from "react";
import { HStack, Stack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { PhosphorIcon, Text } from "@hashgraph/securitytoken-uicomponents/Foundations";
import { CancelButton } from "../../../components/CancelButton";
import { NextStepButton } from "./NextStepButton";
import { PreviousStepButton } from "./PreviousStepButton";
import {
  CalendarInputController,
  InputController,
  InputNumberController,
  SelectController,
} from "@hashgraph/securitytoken-uicomponents";
import { greaterThan, isBetweenDates, required } from "../../../utils/rules";
import { ICreateBondFormValues } from "../ICreateBondFormValues";
import { useFormContext, useFormState } from "react-hook-form";
import { formatDate } from "../../../utils/format";
import { CouponTypeOptions } from "../CouponType";
import { Tooltip } from "@hashgraph/securitytoken-uicomponents/Overlay";
import { Info } from "@phosphor-icons/react";
import { Trans } from "react-i18next";
import { FormStepContainer } from "../../../components/FormStepContainer";

export const StepCoupon = () => {
  const { t } = useTranslation("security", { keyPrefix: "createBond" });
  const { control, watch, setValue } = useFormContext<ICreateBondFormValues>();
  const stepFormState = useFormState({ control });

  const startingDate = watch("startingDate");
  const couponType = watch("couponType");
  const firstCouponDate = watch("firstCouponDate");
  const couponFrequency = watch("couponFrequency");
  const maturityDate = watch("maturityDate");
  const lastCouponDate = watch("lastCouponDate");
  const totalCoupons = watch("totalCoupons");

  useEffect(() => {
    if (couponType === undefined) {
      setValue("couponType", 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      couponFrequency !== undefined &&
      Number(couponFrequency) > 0 &&
      firstCouponDate !== undefined
    ) {
      let lastCouponDate: Date = new Date(firstCouponDate);
      let totalCoupons = 1;

      let futureMonth = new Date(lastCouponDate).setMonth(
        lastCouponDate.getMonth() + Number(couponFrequency),
      );
      while (Number(futureMonth) < Number(maturityDate)) {
        lastCouponDate = new Date(futureMonth);
        totalCoupons++;
        futureMonth = new Date(lastCouponDate).setMonth(
          lastCouponDate.getMonth() + Number(couponFrequency),
        );
      }

      setValue("totalCoupons", Math.floor(totalCoupons));
      setValue("lastCouponDate", formatDate(new Date(lastCouponDate)));
    }
  }, [firstCouponDate, maturityDate, couponFrequency, setValue]);

  return (
    <FormStepContainer>
      <Stack gap={8}>
        <Text textStyle="HeadingMediumLG">{t("stepCoupon.title")}</Text>
        <Text textStyle="ElementsRegularSM">
          {t("stepCoupon.mandatoryFields")}
        </Text>
      </Stack>
      <Stack w="full">
        <HStack justifySelf="flex-start">
          <Text textStyle="BodyTextRegularSM">
            {t("stepCoupon.couponType")}*
          </Text>
          <Tooltip
            label={
              <Trans i18nkey="stepCoupon.couponTypeTooltip">
                {t("stepCoupon.couponTypeTooltip")}
              </Trans>
            }
            placement="right"
          >
            <PhosphorIcon as={Info} />
          </Tooltip>
        </HStack>
        <SelectController
          control={control}
          id="couponType"
          rules={{ required }}
          placeholder={t("stepCoupon.couponTypePlaceHolder")}
          size="md"
          options={CouponTypeOptions}
        />
      </Stack>
      {couponType === 1 && (
        <>
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">
                {t("stepCoupon.couponRate")}*
              </Text>
              <Tooltip
                label={t("stepCoupon.couponRateTooltip")}
                placement="right"
              >
                <PhosphorIcon as={Info} />
              </Tooltip>
            </HStack>
            <InputNumberController
              autoFocus
              control={control}
              id="couponRate"
              rules={{
                required,
                validate: greaterThan(0),
              }}
              placeholder={t("stepCoupon.couponRatePlaceHolder")}
              backgroundColor="neutral.600"
              size="md"
              decimalScale={3}
              fixedDecimalScale={true}
              suffix="%"
              thousandSeparator=","
              decimalSeparator="."
            />
          </Stack>
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">
                {t("stepCoupon.couponFrequency")}*
              </Text>
              <Tooltip
                label={t("stepCoupon.couponFrequencyTooltip")}
                placement="right"
              >
                <PhosphorIcon as={Info} />
              </Tooltip>
            </HStack>
            <InputController
              control={control}
              id="couponFrequency"
              rules={{
                required,
                validate: greaterThan(0),
              }}
              placeholder={t("stepCoupon.couponFrequencyPlaceHolder")}
              backgroundColor="neutral.600"
              size="md"
            />
          </Stack>
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">
                {t("stepCoupon.firstCouponDate")}*
              </Text>
              <Tooltip
                label={t("stepCoupon.firstCouponDateTooltip")}
                placement="right"
              >
                <PhosphorIcon as={Info} />
              </Tooltip>
            </HStack>
            <CalendarInputController
              control={control}
              id="firstCouponDate"
              fromDate={new Date(startingDate)}
              toDate={new Date(maturityDate)}
              rules={{
                required,
                validate: isBetweenDates(
                  new Date(startingDate),
                  new Date(maturityDate),
                ),
              }}
              placeholder={t("stepCoupon.firstCouponDatePlaceHolder")}
              backgroundColor="neutral.600"
              size="md"
            />
          </Stack>
          <Stack w="full">
            <Text textStyle="BodyTextRegularSM">
              {t("stepCoupon.lastCouponDate")}
            </Text>
            <InputController
              control={control}
              id="lastCouponDate"
              value={lastCouponDate}
              defaultValue={lastCouponDate}
              rules={{ required }}
              backgroundColor="neutral.600"
              size="md"
              isDisabled={true}
            />
          </Stack>
          <Stack w="full">
            <Text textStyle="BodyTextRegularSM">
              {t("stepCoupon.totalCoupons")}
            </Text>
            <InputController
              control={control}
              id="totalCoupons"
              value={totalCoupons}
              defaultValue={totalCoupons}
              rules={{ required }}
              backgroundColor="neutral.600"
              size="md"
              isDisabled={true}
            />
          </Stack>
        </>
      )}
      <HStack
        gap={4}
        w="full"
        h="100px"
        align="end"
        justifyContent={"flex-end"}
      >
        <CancelButton />
        <PreviousStepButton />
        <NextStepButton isDisabled={!stepFormState.isValid} />
      </HStack>
    </FormStepContainer>
  );
};
