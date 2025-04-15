import { Box, HStack, Stack } from "@chakra-ui/react";
import { History } from "../../components/History";
import { RouteName } from "../../router/RouteName";
import { useTranslation } from "react-i18next";
import { RoutePath } from "../../router/RoutePath";
import { Button, SelectController, Text } from "io-bricks-ui";
import { RouterManager } from "../../router/RouterManager";
import { useForm } from "react-hook-form";
import { useExternalControlStore } from "../../store/externalControlStore";
import { required } from "../../utils/rules";
import {
  useCreateExternalBlackListMock,
  useCreateExternalWhiteListMock,
} from "../../hooks/mutations/useExternalControl";

export interface FormValues {
  type: "whitelist" | "blacklist";
}

export const CreateExternalControl = () => {
  const { addExternalControl } = useExternalControlStore();
  const { t: tRoutes } = useTranslation("routes");
  const { t: tCreate } = useTranslation("externalControl", {
    keyPrefix: "create",
  });

  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useForm<FormValues>({
    mode: "onChange",
  });

  const {
    mutateAsync: createExternalBlacklistMock,
    isLoading: isLoadingCreatingExternalBlackListMock,
  } = useCreateExternalBlackListMock();
  const {
    mutateAsync: createExternalWhitelistMock,
    isLoading: isLoadingCreatingExternalWhiteListMock,
  } = useCreateExternalWhiteListMock();

  const isLoading =
    isLoadingCreatingExternalBlackListMock ||
    isLoadingCreatingExternalWhiteListMock;

  const onSubmit = (values: FormValues) => {
    if (values.type === "blacklist") {
      return createExternalBlacklistMock().then((response) => {
        if (response) {
          addExternalControl({
            address: response,
            type: "blacklist",
          });

          RouterManager.goBack();
        }
      });
    }
    if (values.type === "whitelist") {
      return createExternalWhitelistMock().then((response) => {
        if (response) {
          addExternalControl({
            address: response,
            type: "whitelist",
          });

          RouterManager.goBack();
        }
      });
    }
  };

  return (
    <Stack gap={6} flex={1}>
      <History
        label={tRoutes(RouteName.CreateExternalControl)}
        excludePaths={[RoutePath.DASHBOARD]}
      />
      <Box
        layerStyle={"container"}
        w={"full"}
        h={"full"}
        flex={1}
        alignItems={"center"}
      >
        <Stack
          gap={2}
          alignItems={"start"}
          justifyContent={"center"}
          maxW={500}
          justifySelf={"center"}
        >
          <Text textStyle="HeadingMediumLG">{tCreate("title")}</Text>
          <Text textStyle="BodyTextRegularMD">{tCreate("subtitle")}</Text>
          <Text textStyle="ElementsRegularSM" py={6}>
            {tCreate("mandatoryFields")}
          </Text>
          <SelectController
            control={control}
            id="type"
            size={"lg"}
            label={tCreate("input.type.label")}
            options={[
              {
                label: "Whitelist",
                value: "whitelist",
              },
              {
                label: "Blacklist",
                value: "blacklist",
              },
            ]}
            rules={{ required }}
          />
          <HStack pt={20} justifyContent={"flex-end"} w={"full"}>
            <Button
              variant={"secondary"}
              size={"md"}
              onClick={() => RouterManager.goBack()}
            >
              {tCreate("cancel")}
            </Button>
            <Button
              size={"md"}
              isDisabled={!isValid || isLoading}
              onClick={handleSubmit(onSubmit)}
              isLoading={isLoading}
            >
              {tCreate("create")}
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Stack>
  );
};
