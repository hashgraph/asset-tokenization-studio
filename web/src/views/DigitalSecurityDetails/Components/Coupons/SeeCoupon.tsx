import { Button, Center, HStack, Stack, VStack } from "@chakra-ui/react";
import {
  InputController,
  InputNumberController,
} from "@hashgraph/assettokenization-uicomponents/Forms/Controllers";
import { isHederaValidAddress, min, required } from "../../../../utils/rules";
import { useForm } from "react-hook-form";
import { Info } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { GetCouponForRequest, GetCouponRequest } from "@hashgraph/assettokenization-sdk";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@hashgraph/assettokenization-uicomponents/Overlay/Toast";
import { DefinitionList, PhosphorIcon, Text, Tooltip } from "@hashgraph/assettokenization-uicomponents";
import {
  useGetCoupons,
  useGetCouponsFor,
} from "../../../../hooks/queries/useCoupons";

interface SeeCouponFormValues {
  couponId: number;
  targetId: string;
}

const defaultCouponForRequest = new GetCouponForRequest({
  securityId: "",
  couponId: 0,
  targetId: "",
});

const defaultCouponRequest = new GetCouponRequest({
  securityId: "",
  couponId: 0,
});

export const SeeCoupon = () => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<SeeCouponFormValues>({
    mode: "all",
  });
  const { t: tForm } = useTranslation("security", {
    keyPrefix: "details.coupons.see.input",
  });
  const { t: tDetail } = useTranslation("security", {
    keyPrefix: "details.coupons.see.details",
  });
  const { t: tGlobal } = useTranslation("globals");
  const { id: securityId = "" } = useParams();
  const [couponsRequest, setCouponsRequest] = useState<GetCouponRequest>();
  const [couponForRequest, setCouponsForRequest] =
    useState<GetCouponForRequest>();
  const [isCouponsForLoading, setIsCouponsForLoading] =
    useState<boolean>(false);
  const [isCouponsLoading, setIsCouponsLoading] = useState<boolean>(false);
  const toast = useToast();
  const { t: tError } = useTranslation("security", {
    keyPrefix: "details.Coupons.see.error",
  });

  const { data: couponsFor, refetch: refetchCouponsFor } = useGetCouponsFor(
    couponForRequest ?? defaultCouponForRequest,
    {
      enabled: false,
      onSuccess: () => {
        setIsCouponsForLoading(false);
      },
      onError: () => {
        setIsCouponsForLoading(false);
        toast.show({
          title: tError("general"),
          status: "error",
        });
      },
    },
  );

  const { data: coupons, refetch: refetchCoupons } = useGetCoupons(
    couponsRequest ?? defaultCouponRequest,
    {
      enabled: false,
      onSuccess: () => {
        setIsCouponsLoading(false);
      },
      onError: () => {
        setIsCouponsLoading(false);
        toast.show({
          title: tError("general"),
          status: "error",
        });
      },
    },
  );

  useEffect(() => {
    if (couponForRequest) {
      refetchCouponsFor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponForRequest]);

  useEffect(() => {
    if (couponsRequest) {
      refetchCoupons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponsRequest]);

  const submitForm = ({ couponId, targetId }: SeeCouponFormValues) => {
    setIsCouponsForLoading(true);
    setIsCouponsLoading(true);

    const couponsForReq = new GetCouponForRequest({
      couponId,
      targetId,
      securityId,
    });
    setCouponsForRequest(couponsForReq);

    const couponsReq = new GetCouponRequest({
      couponId,
      securityId,
    });
    setCouponsRequest(couponsReq);
  };

  return (
    <Center h="full" bg="neutral.dark.600">
      <VStack>
        <VStack
          as="form"
          w="500px"
          gap={6}
          py={6}
          data-testid="coupons-form"
          onSubmit={handleSubmit(submitForm)}
        >
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">
                {tForm("coupon.label")}*
              </Text>
              <Tooltip label={tForm("coupon.tooltip")} placement="right">
                <PhosphorIcon as={Info} />
              </Tooltip>
            </HStack>
            <InputNumberController
              autoFocus
              control={control}
              id="couponId"
              rules={{ required, min: min(0) }}
              placeholder={tForm("coupon.placeholder")}
            />
          </Stack>
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">
                {tForm("account.label")}*
              </Text>
              <Tooltip label={tForm("account.tooltip")} placement="right">
                <PhosphorIcon as={Info} />
              </Tooltip>
            </HStack>
            <InputController
              control={control}
              id="targetId"
              rules={{ required, isHederaValidAddress }}
              placeholder={tForm("account.placeholder")}
            />
          </Stack>
          <Button
            alignSelf="flex-end"
            data-tesdtid="send-button"
            isDisabled={!isValid}
            isLoading={isCouponsForLoading || isCouponsLoading}
            type="submit"
          >
            {tGlobal("check")}
          </Button>
        </VStack>
        {couponsFor && coupons && (
          <DefinitionList
            items={[
              {
                title: tDetail("paymentDay"),
                description: coupons.executionDate.toDateString(),
                canCopy: true,
                valueToCopy: coupons.executionDate.toDateString(),
              },
              {
                title: tDetail("amount"),
                description: couponsFor.value,
                canCopy: true,
                valueToCopy: couponsFor.value,
              },
            ]}
            title={tDetail("title")}
          />
        )}
      </VStack>
    </Center>
  );
};
