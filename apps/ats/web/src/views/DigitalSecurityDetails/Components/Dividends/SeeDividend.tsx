//SPDX-License-Identifier: Apache-2.0

import { Button, Center, HStack, Stack, VStack } from "@chakra-ui/react";
import {
  InputController,
  InputNumberController,
  useToast,
  DefinitionList,
  PhosphorIcon,
  Text,
  Tooltip,
} from "io-bricks-ui";
import { Info } from "@phosphor-icons/react";
import { isValidHederaId, min, required } from "../../../../utils/rules";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useGetDividends, useGetDividendsFor, useGetDividendsAmountFor } from "../../../../hooks/queries/useDividends";
import { GetDividendsForRequest, GetDividendsRequest } from "@hashgraph/asset-tokenization-sdk";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatDate, formatNumberLocale } from "../../../../utils/format";
import { DATE_TIME_FORMAT } from "../../../../utils/constants";

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

const defaultDividendsAmountForRequest = new GetDividendsForRequest({
  securityId: "",
  dividendId: 0,
  targetId: "",
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
  const [dividendsRequest, setDividendsRequest] = useState<GetDividendsRequest>();
  const [dividendsForRequest, setDividendsForRequest] = useState<GetDividendsForRequest>();
  const [dividendsAmountForRequest, setDividendsAmountForRequest] = useState<GetDividendsForRequest>();
  const [isDividendsForLoading, setIsDivididendForLoading] = useState<boolean>(false);
  const [isDividendsLoading, setIsDivididendLoading] = useState<boolean>(false);
  const [isDividendsAmountForLoading, setIsDivididendAmountForLoading] = useState<boolean>(false);
  const toast = useToast();
  const { t: tError } = useTranslation("security", {
    keyPrefix: "details.dividends.see.error",
  });

  const { data: dividendsFor, refetch: refetchDividendsFor } = useGetDividendsFor(
    dividendsForRequest ?? defaultDividendsForRequest,
    {
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
    },
  );

  const { data: dividends, refetch: refetchDividends } = useGetDividends(dividendsRequest ?? defaultDividendsRequest, {
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
  });

  const { data: dividendsAmountFor, refetch: refetchDividendsAmountFor } = useGetDividendsAmountFor(
    dividendsAmountForRequest ?? defaultDividendsAmountForRequest,
    {
      enabled: false,
      onSuccess: () => {
        setIsDivididendAmountForLoading(false);
      },
      onError: () => {
        setIsDivididendForLoading(false);
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

  useEffect(() => {
    if (dividendsAmountForRequest) {
      refetchDividendsAmountFor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dividendsAmountForRequest]);

  const submitForm = ({ dividendId, targetId }: SeeDividendFormValues) => {
    setIsDivididendForLoading(true);
    setIsDivididendLoading(true);
    setIsDivididendAmountForLoading(true);

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

    const dividendsAmountForReq = new GetDividendsForRequest({
      dividendId,
      targetId,
      securityId,
    });
    setDividendsAmountForRequest(dividendsAmountForReq);
  };

  let dividendsPaymentDay = dividends?.executionDate?.toDateString() || "";

  const calculateAmount = () => {
    const numerator = Number(dividendsAmountFor?.numerator) || 0;
    const denominator = Number(dividendsAmountFor?.denominator) || 0;
    if (numerator === 0 || denominator === 0) {
      return "0";
    }
    return `${formatNumberLocale(numerator / denominator, 3)} $`;
  };

  return (
    <Center h="full" bg="neutral.dark.600">
      <VStack>
        <VStack as="form" w="500px" gap={6} py={6} data-testid="dividends-form" onSubmit={handleSubmit(submitForm)}>
          <Stack w="full">
            <HStack justifySelf="flex-start">
              <Text textStyle="BodyTextRegularSM">{tForm("dividend.label")}*</Text>
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
              <Text textStyle="BodyTextRegularSM">{tForm("account.label")}*</Text>
              <Tooltip label={tForm("account.tooltip")} placement="right">
                <PhosphorIcon as={Info} />
              </Tooltip>
            </HStack>
            <InputController
              control={control}
              id="targetId"
              rules={{ required, isValidHederaId: isValidHederaId }}
              placeholder={tForm("account.placeholder")}
            />
          </Stack>
          <Button
            alignSelf="flex-end"
            data-tesdtid="send-button"
            isDisabled={!isValid}
            isLoading={isDividendsForLoading || isDividendsLoading || isDividendsAmountForLoading}
            type="submit"
          >
            {tGlobal("check")}
          </Button>
        </VStack>
        {dividends && dividendsFor && dividendsAmountFor && (
          <DefinitionList
            items={[
              {
                title: tDetail("paymentDay"),
                description: formatDate(dividendsPaymentDay, DATE_TIME_FORMAT),
                canCopy: true,
                valueToCopy: dividendsPaymentDay,
              },
              {
                title: tDetail("balance"),
                description: formatNumberLocale(dividendsFor.tokenBalance, parseFloat(dividendsFor.decimals)),
                canCopy: true,
                valueToCopy: formatNumberLocale(dividendsFor.tokenBalance, parseFloat(dividendsFor.decimals)),
              },
              {
                title: tDetail("amount"),
                description: calculateAmount(),
                canCopy: true,
                valueToCopy: calculateAmount(),
              },
              {
                title: tDetail("recordDateReached"),
                description: dividendsAmountFor?.recordDateReached ? "Yes" : "No",
                canCopy: true,
                valueToCopy: dividendsAmountFor?.recordDateReached ? "Yes" : "No",
              },
            ]}
            title={tDetail("title")}
          />
        )}
      </VStack>
    </Center>
  );
};
