import { HStack, Stack, VStack } from "@chakra-ui/react";
import {
  Button,
  DefinitionList,
  Heading,
  InputController,
  Text,
} from "io-bricks-ui";
import { useForm } from "react-hook-form";
import { useUpdateSecurityConfigVersion } from "../../../../hooks/mutations/useUpdateSecurityConfigVersion";
import { useUpdateSecurityConfigId } from "../../../../hooks/mutations/useUpdateSecurityConfigId";
import { useUpdateSecurityResolverAddress } from "../../../../hooks/mutations/useUpdateSecurityResolverAddress";
import {
  GetConfigInfoRequest,
  UpdateConfigRequest,
  UpdateConfigVersionRequest,
  UpdateResolverRequest,
} from "@hashgraph/asset-tokenization-sdk";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetConfigDetails } from "../../../../hooks/queries/useGetConfigDetails";
import { collapseText } from "../../../../utils/format";
import { required } from "../../../../utils/rules";

type ManagementFormSchema = {
  resolverId?: string;
  configurationId?: string;
  configurationVersion: string;
};

interface ManagementProps {
  id: string;
}

export const Management = ({ id }: ManagementProps) => {
  const { t } = useTranslation("security", {
    keyPrefix: "management",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { control, reset, handleSubmit, watch } = useForm<ManagementFormSchema>(
    {
      mode: "onChange",
    },
  );

  const {
    data: configDetails,
    isLoading: isLoadingConfigDetails,
    isFetching: isFetchingConfigDetails,
  } = useGetConfigDetails(
    new GetConfigInfoRequest({
      securityId: id,
    }),
    {
      refetchOnWindowFocus: false,
    },
  );

  const { mutate: updateSecurityConfigVersion } =
    useUpdateSecurityConfigVersion();
  const { mutate: updateSecurityConfigId } = useUpdateSecurityConfigId();
  const { mutate: updateSecurityResolverAddress } =
    useUpdateSecurityResolverAddress();

  const onSubmit = (data: ManagementFormSchema) => {
    setIsLoading(true);

    const { resolverId, configurationId, configurationVersion } = data;

    if (resolverId && configurationId && configurationVersion) {
      const request = new UpdateResolverRequest({
        securityId: id,
        resolver: resolverId,
        configId: configurationId,
        configVersion: Number(configurationVersion),
      });

      updateSecurityResolverAddress(request, {
        onSettled() {
          setIsLoading(false);
        },
      });
      return;
    }

    if (!resolverId && configurationId && configurationVersion) {
      const request = new UpdateConfigRequest({
        securityId: id,
        configVersion: Number(configurationVersion),
        configId: configurationId,
      });

      updateSecurityConfigId(request, {
        onSettled() {
          setIsLoading(false);
        },
      });
      return;
    }
    if (!resolverId && !configurationId && configurationVersion) {
      const request = new UpdateConfigVersionRequest({
        securityId: id,
        configVersion: Number(configurationVersion),
      });

      updateSecurityConfigVersion(request, {
        onSettled() {
          setIsLoading(false);
        },
      });
      return;
    }

    setIsLoading(false);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <HStack gap={6} align={"start"}>
      <VStack layerStyle="container" align="start">
        <VStack w={"full"} align="flex-start" p={6} gap={4}>
          <VStack w={"full"} align={"flex-start"} gap={1}>
            <Heading textStyle="HeadingMediumLG">{t("form.title")}</Heading>
            <Text textStyle={"BodyRegularSM"}>{t("form.subtitle")}</Text>
          </VStack>
          <VStack w={"full"} align={"flex-start"} gap={2}>
            <InputController
              control={control}
              id="resolverId"
              label={t("form.resolverId")}
              placeholder="0.0.1234567"
              isClearable
            />
            <InputController
              control={control}
              id="configurationId"
              label={t("form.configId")}
              placeholder="0x123451234512345123451234512345"
              rules={{
                validate: (value: string) =>
                  watch("resolverId")
                    ? !!value || t("form.validations.configIdWhenResolverId")
                    : true,
              }}
              isClearable
            />
            <InputController
              control={control}
              id="configurationVersion"
              label={t("form.configVersion")}
              placeholder="0"
              rules={{
                required,
              }}
              isClearable
            />
          </VStack>
          <HStack w={"full"} justifyContent={"flex-end"}>
            <Button variant={"secondary"} size={"md"} onClick={handleReset}>
              <Text textStyle="ElementsMediumSM" px={4}>
                Clear
              </Text>
            </Button>
            <Button
              variant={"primary"}
              size={"md"}
              isDisabled={isLoading}
              isLoading={isLoading}
              onClick={handleSubmit(onSubmit)}
            >
              <Text textStyle="ElementsMediumSM" px={4}>
                Save
              </Text>
            </Button>
          </HStack>
        </VStack>
      </VStack>
      <Stack layerStyle="container" align="start">
        <DefinitionList
          title={t("details.title")}
          layerStyle="container"
          items={[
            {
              title: t("details.resolverId"),
              description: configDetails?.resolverAddress ?? "",
              canCopy: true,
              isLoading: isLoadingConfigDetails || isFetchingConfigDetails,
            },
            {
              title: t("details.configId"),
              description: collapseText(configDetails?.configId ?? "", 10, 10),
              valueToCopy: configDetails?.configId ?? "",
              canCopy: true,
              isLoading: isLoadingConfigDetails || isFetchingConfigDetails,
            },
            {
              title: t("details.configVersion"),
              description: configDetails?.configVersion ?? "",
              isLoading: isLoadingConfigDetails || isFetchingConfigDetails,
            },
          ]}
        />
      </Stack>
    </HStack>
  );
};
