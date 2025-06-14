import { Box, HStack, Stack } from "@chakra-ui/react";
import { History } from "../../components/History";
import { RouteName } from "../../router/RouteName";
import { useTranslation } from "react-i18next";
import { RoutePath } from "../../router/RoutePath";
import { Button, Text, ToggleController } from "io-bricks-ui";
import { RouterManager } from "../../router/RouterManager";
import { useForm } from "react-hook-form";
import { useExternalPauseStore } from "../../store/externalPauseStore";
import {
  useCreatePauseMock,
  useSetPausedMock,
} from "../../hooks/mutations/useExternalPause";
import { SetPausedMockRequest } from "@hashgraph/asset-tokenization-sdk";

export interface FormValues {
  isActivated: boolean;
}

export const CreateExternalPause = () => {
  const { addExternalPause } = useExternalPauseStore();
  const { t: tRoutes } = useTranslation("routes");
  const { t: tCreate } = useTranslation("externalPause", {
    keyPrefix: "create",
  });

  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useForm<FormValues>({
    mode: "onChange",
  });

  const { mutateAsync, isLoading } = useCreatePauseMock();
  const { mutateAsync: setPauseMockMutate, isLoading: isLoadingSetPauseMock } =
    useSetPausedMock();

  const onSubmit = async (values: FormValues) => {
    const { isActivated } = values;

    try {
      const response = await mutateAsync();

      if (response) {
        if (isActivated) {
          await setPauseMockMutate(
            new SetPausedMockRequest({
              contractId: response,
              paused: isActivated,
            }),
          );
        }

        addExternalPause({
          address: response,
          isPaused: isActivated,
        });

        RouterManager.goBack();
      }
    } catch (error) {
      console.error("Error en onSubmit:", error);
    }
  };

  return (
    <Stack gap={6} flex={1}>
      <History
        label={tRoutes(RouteName.CreateExternalPause)}
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
          <ToggleController
            control={control}
            id="isActivated"
            data-testid="pauser-button"
            size={"lg"}
            defaultChecked={false}
            onChange={() => {}}
            label={tCreate("input.isActivated.label")}
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
              isDisabled={!isValid || isLoading || isLoadingSetPauseMock}
              isLoading={isLoading || isLoadingSetPauseMock}
              onClick={handleSubmit(onSubmit)}
            >
              {tCreate("create")}
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Stack>
  );
};
