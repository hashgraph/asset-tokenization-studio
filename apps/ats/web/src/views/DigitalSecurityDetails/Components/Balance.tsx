// SPDX-License-Identifier: Apache-2.0

import { HStack, Stack, VStack } from "@chakra-ui/react";
import { Button, Heading, Text, useToast } from "io-bricks-ui";
import { SearchInputController, DefinitionList } from "io-bricks-ui";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { isValidHederaId, required } from "../../../utils/rules";
import {
  GetAccountBalanceRequest,
  GetClearedAmountForRequest,
  GetFrozenPartialTokensRequest,
  GetHeldAmountForRequest,
  GetLocksIdRequest,
  SecurityViewModel,
} from "@hashgraph/asset-tokenization-sdk";
import { useGetBalanceOf } from "../../../hooks/queries/useGetSecurityDetails";
import { useEffect, useMemo, useState } from "react";
import { useGetLockers } from "../../../hooks/queries/useGetLockers";
import { useGetHeldAmountFor } from "../../../hooks/queries/useGetHolds";
import { useSecurityStore } from "../../../store/securityStore";
import { useGetClearedAmountFor } from "../../../hooks/queries/useClearingOperations";
import { useGetFrozenTokens } from "../../../hooks/queries/useGetFreezers";

interface BalanceProps {
  id?: string;
  detailsResponse: SecurityViewModel;
}

interface BalanceSearchFieldValue {
  search: string;
}

export const Balance = ({ id, detailsResponse }: BalanceProps) => {
  const { details } = useSecurityStore();
  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useForm<BalanceSearchFieldValue>({
    mode: "onSubmit",
  });
  const { t: tProperties } = useTranslation("properties");
  const { t: tSearch } = useTranslation("security", {
    keyPrefix: "details.balance.search",
  });
  const { t: tDetails } = useTranslation("security", {
    keyPrefix: "details.balance.details",
  });
  const { t: tError } = useTranslation("security", {
    keyPrefix: "details.balance.error",
  });
  const [targetId, setTargetId] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingLockers, setIsLoadingLockers] = useState<boolean>(false);
  const [isLoadingHolds, setIsLoadingHolds] = useState<boolean>(false);
  const [isLoadingFreezed, setIsLoadingFreezed] = useState<boolean>(false);
  const [isLoadingCleared, setIsLoadingCleared] = useState<boolean>(false);
  const toast = useToast();

  const { data: balance, refetch } = useGetBalanceOf(
    new GetAccountBalanceRequest({
      securityId: id!,
      targetId: targetId ?? "",
    }),
    {
      enabled: false,
      refetchOnMount: false,
      onSuccess: () => {
        setIsLoading(false);
      },
      onError: () => {
        setIsLoading(false);
        toast.show({
          duration: 3000,
          title: tError("targetId"),
          status: "error",
        });
      },
    },
  );

  const { data: lockers, refetch: refetchLockers } = useGetLockers(
    new GetLocksIdRequest({
      securityId: id!,
      targetId: targetId ?? "",
      start: 0,
      end: 100,
    }),
    {
      enabled: !!targetId,
      refetchOnWindowFocus: false,
      onSuccess: () => {
        setIsLoadingLockers(false);
      },
      onError: () => {
        setIsLoadingLockers(false);
        toast.show({
          duration: 3000,
          title: tError("targetId"),
          status: "error",
        });
      },
    },
  );

  const { data: heldBalance, refetch: refetchHolds } = useGetHeldAmountFor(
    new GetHeldAmountForRequest({
      securityId: id!,
      targetId: targetId ?? "",
    }),
    {
      enabled: !!targetId,
      refetchOnWindowFocus: false,
      select(data) {
        return Number(data) / Math.pow(10, Number(details?.decimals));
      },
      onSuccess: () => {
        setIsLoadingHolds(false);
      },
      onError: () => {
        setIsLoadingHolds(false);
        toast.show({
          duration: 3000,
          title: tError("targetId"),
          status: "error",
        });
      },
    },
  );

  const { data: frozenBalance, refetch: refetchFrozenBalance } = useGetFrozenTokens(
    new GetFrozenPartialTokensRequest({
      securityId: id!,
      targetId: targetId ?? "",
    }),
    {
      enabled: !!targetId,
      refetchOnWindowFocus: false,
      onSuccess: () => {
        setIsLoadingFreezed(false);
      },
      onError: () => {
        setIsLoadingFreezed(false);
        toast.show({
          duration: 3000,
          title: tError("targetId"),
          status: "error",
        });
      },
    },
  );

  const { data: clearedBalance, refetch: refetchClearedBalance } = useGetClearedAmountFor(
    new GetClearedAmountForRequest({
      securityId: id!,
      targetId: targetId ?? "",
    }),
    {
      enabled: !!targetId,
      refetchOnWindowFocus: false,
      select(data) {
        return Number(data) / Math.pow(10, Number(details?.decimals));
      },
      onSuccess: () => {
        setIsLoadingCleared(false);
      },
      onError: () => {
        setIsLoadingCleared(false);
        toast.show({
          duration: 3000,
          title: tError("targetId"),
          status: "error",
        });
      },
    },
  );

  useEffect(() => {
    if (targetId && !balance) {
      setIsLoading(true);
      setIsLoadingLockers(true);
      setIsLoadingHolds(true);
      setIsLoadingCleared(true);
      refetch();
      refetchLockers();
      refetchHolds();
      refetchClearedBalance();
      refetchFrozenBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  const isLoadingTotal = useMemo(() => {
    return isLoading || isLoadingLockers || isLoadingHolds || isLoadingCleared || isLoadingFreezed;
  }, [isLoading, isLoadingLockers, isLoadingHolds, isLoadingCleared, isLoadingFreezed]);

  const onSubmit = ({ search }: BalanceSearchFieldValue) => {
    setTargetId(search);
  };

  const lockBalance = useMemo(() => {
    if (!lockers) {
      return "-";
    }

    return lockers.reduce((acc, current) => {
      return acc + Number(current.amount);
    }, 0);
  }, [lockers]);

  const totalBalance = useMemo(() => {
    if (!balance?.value) {
      return "-";
    }

    let totalBalance = Number(balance?.value);

    if (lockBalance !== "-") {
      totalBalance += Number(lockBalance);
    }

    if (Number(heldBalance) > 0) {
      totalBalance += Number(heldBalance);
    }

    if (Number(frozenBalance) > 0) {
      totalBalance += Number(frozenBalance);
    }

    if (Number(clearedBalance) > 0) {
      totalBalance += Number(clearedBalance);
    }

    return totalBalance;
  }, [clearedBalance, heldBalance, lockBalance, frozenBalance, balance]);

  return (
    <VStack gap={6}>
      <Stack layerStyle="container" align="center">
        <VStack maxW="440px" align="flex-start" p={6} gap={4}>
          <Heading textStyle="HeadingMediumLG">{tSearch("title")}</Heading>
          <Text textStyle="BodyRegularMD">{tSearch("subtitle")}</Text>
          <HStack w="440px" gap={6} mt={3} as="form" onSubmit={handleSubmit(onSubmit)} alignItems="flex-start">
            <SearchInputController
              id="search"
              placeholder={tSearch("placeholder")}
              onSearch={() => {}}
              control={control}
              size="sm"
              rules={{
                required,
                validate: { isValidHederaId: isValidHederaId },
              }}
            />
            <Button size="sm" isDisabled={!isValid} type="submit" isLoading={isLoadingTotal}>
              <Text textStyle="ElementsMediumSM" px={4}>
                {tSearch("button")}
              </Text>
            </Button>
          </HStack>
        </VStack>
      </Stack>
      <HStack w="full" gap={8} align="flex-start">
        <Stack w="394px">
          <DefinitionList
            items={[
              {
                title: tProperties("id"),
                description: tProperties(id ?? ""),
                canCopy: true,
                valueToCopy: tProperties(id ?? ""),
              },
            ]}
            title={tDetails("title")}
            layerStyle="container"
          />
        </Stack>
        <VStack w={"full"}>
          <Stack layerStyle="container" gap={2} p={6} pb={9}>
            <Text textStyle="ElementsSemiboldMD">{tProperties("totalBalance")}</Text>
            <VStack gap={0} pb={4}>
              <Text textStyle="ElementsSemibold2XL">
                {totalBalance ?? "-"}
                <Text ml={1} as="span" textStyle="ElementsRegularMD">
                  {tProperties(detailsResponse.symbol ?? "")}
                </Text>
              </Text>
            </VStack>
            <HStack gap={8} w="full" h="auto" alignItems={"center"} justifyContent={"center"}>
              <VStack alignItems={"flex-start"}>
                <Text textStyle="ElementsRegularXS">{tDetails("availableBalance")}</Text>
                <Text textStyle="ElementsSemiboldSM">
                  {balance?.value ?? "-"} {tProperties(detailsResponse.symbol ?? "")}
                </Text>
              </VStack>

              <VStack w={"1px"} h={"40px"} bgColor={"gray.500"} />

              <VStack alignItems={"flex-start"}>
                <Text textStyle="ElementsRegularXS">{tDetails("lockBalance")}</Text>
                <Text textStyle="ElementsSemiboldSM">
                  {lockBalance ?? "0"} {tProperties(detailsResponse.symbol ?? "")}
                </Text>
              </VStack>

              <VStack w={"1px"} h={"40px"} bgColor={"gray.500"} />

              <VStack alignItems={"flex-start"}>
                <Text textStyle="ElementsRegularXS">{tDetails("heldBalance")}</Text>
                <Text textStyle="ElementsSemiboldSM">
                  {heldBalance ?? "-"} {tProperties(detailsResponse.symbol ?? "")}
                </Text>
              </VStack>

              <VStack w={"1px"} h={"40px"} bgColor={"gray.500"} />

              <VStack alignItems={"flex-start"}>
                <Text textStyle="ElementsRegularXS">{tDetails("clearedBalance")}</Text>
                <Text textStyle="ElementsSemiboldSM">
                  {clearedBalance ?? "-"} {tProperties(detailsResponse.symbol ?? "")}
                </Text>
              </VStack>

              <VStack w={"1px"} h={"40px"} bgColor={"gray.500"} />

              <VStack alignItems={"flex-start"}>
                <Text textStyle="ElementsRegularXS">{tDetails("frozenBalance")}</Text>
                <Text textStyle="ElementsSemiboldSM">
                  {frozenBalance ?? "-"} {tProperties(detailsResponse.symbol ?? "")}
                </Text>
              </VStack>
            </HStack>
          </Stack>
        </VStack>
      </HStack>
    </VStack>
  );
};
