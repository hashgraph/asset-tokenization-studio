import { Button, Center, HStack, Stack, VStack } from "@chakra-ui/react";
import {
  InputController,
  InputNumberController,
} from "@hashgraph/assettokenization-uicomponents/Forms/Controllers";
import { Info } from "@phosphor-icons/react";
import { isHederaValidAddress, min, required } from "../../../../utils/rules";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  useGetDividends,
  useGetDividendsFor,
} from "../../../../hooks/queries/useDividends";
import {
  GetDividendsForRequest,
  GetDividendsRequest,
} from "@hashgraph/assettokenization-sdk";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@hashgraph/assettokenization-uicomponents/Overlay/Toast";
import { DefinitionList, PhosphorIcon, Text, Tooltip } from "@hashgraph/assettokenization-uicomponents";
import { useSecurityStore } from "../../../../store/securityStore";
import { formatNumberLocale } from "../../../../utils/format";

interface SeeDividendFormValues {
  dividendId: number;
  targetId: string;
}

const defaultDividendsForRequest = new GetDividendsForRequest({
  securityId: "",
  dividendId: 0,
  targetId: "",
});

const defaultDividendsRequest = new GetDividendsRequest({
  securityId: "",
  dividendId: 0,
});

export const SeeDividend = () => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<SeeDividendFormValues>({
    mode: "all",
  });
  const { t: tForm } = useTranslation("security", {
    keyPrefix: "details.dividends.see.input",
  });
  const { t: tDetail } = useTranslation("security", {
    keyPrefix: "details.dividends.see.details",
  });
  const { t: tGlobal } = useTranslation("globals");
  const { id: securityId = "" } = useParams();
  const [dividendsRequest, setDividendsRequest] =
    useState<GetDividendsRequest>();
  const [dividendsForRequest, setDividendsForRequest] =
    useState<GetDividendsForRequest>();
  const [isDividendsForLoading, setIsDivididendForLoading] =
    useState<boolean>(false);
  const [isDividendsLoading, setIsDivididendLoading] = useState<boolean>(false);
  const toast = useToast();
  const { t: tError } = useTranslation("security", {
    keyPrefix: "details.dividends.see.error",
  });
  const { details } = useSecurityStore();
  const { decimals } = details || { decimals: 0 };

  const { data: dividendsFor, refetch: refetchDividendsFor } =
    useGetDividendsFor(dividendsForRequest ?? defaultDividendsForRequest, {
      enabled: false,
      onSuccess: () => {
        setIsDivididendForLoading(false);
      },
      onError: () => {
        setIsDivididendForLoading(false);
        toast.show({
          duration: 3000,
          title: tError("general"),
          status: "error",
        });
      },
    });

  const { data: dividends, refetch: refetchDividends } = useGetDividends(
    dividendsRequest ?? defaultDividendsRequest,
    {
      enabled: false,
      onSuccess: () => {
        setIsDivididendLoading(false);
      },
      onError: () => {
        setIsDivididendLoading(false);
        toast.show({
          duration: 3000,
          title: tError("general"),
          status: "error",
        });
      },
    },
  );

  useEffect(() => {
    if (dividendsForRequest) {
      refetchDividendsFor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dividendsForRequest]);

  useEffect(() => {
    if (dividendsRequest) {
      refetchDividendsFor();
      refetchDividends();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dividendsRequest]);

  const submitForm = ({ dividendId, targetId }: SeeDividendFormValues) => {
    setIsDivididendForLoading(true);
    setIsDivididendLoading(true);

    const dividendsForReq = new GetDividendsForRequest({
      dividendId,
      targetId,
      securityId,
    });
    setDividendsForRequest(dividendsForReq);

    const dividendsReq = new GetDividendsRequest({
      securityId,
      dividendId,
    });
    setDividendsRequest(dividendsReq);
  };

  let dividendsPaymentDay = "";
  let dividendsAmount = "0";

  if (dividends && dividendsFor) {
    dividendsPaymentDay = dividends.executionDate.toDateString();
    const amount = (
      parseFloat(dividends.amountPerUnitOfSecurity) *
      parseFloat(dividendsFor.value)
    ).toString();

    dividendsAmount = `${formatNumberLocale(amount, decimals)} $`;
  }

  return (
    <Center h="full" bg="neutral.dark.600">
      <VStack>
        <VStack
          as="form"
          w="500px"
          gap={6}
          py={6}
          data-testid="dividends-form"
          onSubmit={handleSubmit(submitForm)}
        >
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">
                {tForm("dividend.label")}*
              </Text>
              <Tooltip label={tForm("dividend.tooltip")} placement="right">
                <PhosphorIcon as={Info} />
              </Tooltip>
            </HStack>
            <InputNumberController
              autoFocus
              control={control}
              id="dividendId"
              rules={{ required, min: min(0) }}
              placeholder={tForm("dividend.placeholder")}
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
            isLoading={isDividendsForLoading || isDividendsLoading}
            type="submit"
          >
            {tGlobal("check")}
          </Button>
        </VStack>
        {dividends && dividendsFor && (
          <DefinitionList
            items={[
              {
                title: tDetail("paymentDay"),
                description: dividendsPaymentDay,
                canCopy: true,
                valueToCopy: dividendsPaymentDay,
              },
              {
                title: tDetail("amount"),
                description: dividendsAmount,
                canCopy: true,
                valueToCopy: dividendsAmount,
              },
            ]}
            title={tDetail("title")}
          />
        )}
      </VStack>
    </Center>
  );
};
