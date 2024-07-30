import { HStack, Stack, VStack } from "@chakra-ui/react";
import { Button } from "@hashgraph/assettokenization-uicomponents/Interaction";
import { SearchInputController } from "@hashgraph/assettokenization-uicomponents/Forms/Controllers";
import {
  Heading,
  Text,
} from "@hashgraph/assettokenization-uicomponents/Foundations";
import { useForm } from "react-hook-form";
import { DefinitionList } from "@hashgraph/assettokenization-uicomponents";
import { useTranslation } from "react-i18next";
import { isHederaValidAddress, required } from "../../../utils/rules";
import { useToast } from "@hashgraph/assettokenization-uicomponents/Overlay/Toast";
import {
  GetAccountBalanceRequest,
  SecurityViewModel,
} from "@hashgraph/assettokenization-sdk";
import { useGetBalanceOf } from "../../../hooks/queries/useGetSecurityDetails";
import { useEffect, useState } from "react";

interface BalanceProps {
  id?: string;
  detailsResponse: SecurityViewModel;
}

interface BalanceSearchFieldValue {
  search: string;
}

export const Balance = ({ id, detailsResponse }: BalanceProps) => {
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
  const [targetId, setTagetId] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  useEffect(() => {
    if (targetId) {
      setIsLoading(true);
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  const onSubmit = ({ search }: BalanceSearchFieldValue) => {
    setTagetId(search);
  };

  return (
    <VStack gap={6}>
      <Stack layerStyle="container" align="center">
        <VStack maxW="440px" align="flex-start" p={6} gap={4}>
          <Heading textStyle="HeadingMediumLG">{tSearch("title")}</Heading>
          <Text textStyle="BodyRegularMD">{tSearch("subtitle")}</Text>
          <HStack
            w="440px"
            gap={6}
            mt={3}
            as="form"
            onSubmit={handleSubmit(onSubmit)}
            alignItems="flex-start"
          >
            <SearchInputController
              id="search"
              placeholder={tSearch("placeholder")}
              onSearch={() => {}}
              control={control}
              size="sm"
              rules={{
                required,
                validate: { isHederaValidAddress },
              }}
            />
            <Button
              size="sm"
              isDisabled={!isValid}
              type="submit"
              isLoading={isLoading}
            >
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
        <Stack layerStyle="container" gap={2} p={6} pb={9}>
          <Text textStyle="ElementsSemiboldMD">
            {tProperties("accountBalance")}
          </Text>
          <VStack gap={0}>
            <Text textStyle="ElementsSemibold2XL">
              {balance?.value ?? "-"}
              <Text ml={1} as="span" textStyle="ElementsRegularMD">
                {tProperties(detailsResponse.symbol ?? "")}
              </Text>
            </Text>
          </VStack>
        </Stack>
      </HStack>
    </VStack>
  );
};
