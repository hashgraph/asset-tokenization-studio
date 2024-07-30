import { Box, HStack, Stack } from "@chakra-ui/react";
import { StepTokenDetails } from "./Components/StepTokenDetails";
import { FormProvider, useForm } from "react-hook-form";
import {
  useSteps,
  Wizard,
} from "@hashgraph/assettokenization-uicomponents/Indicators";
import { useTranslation } from "react-i18next";
import { History } from "../../components/History";
import { RouteName } from "../../router/RouteName";
import { ICreateEquityFormValues } from "./ICreateEquityFormValues";
import { useEffect } from "react";
import { User } from "../../utils/constants";
import { useUserStore } from "../../store/userStore";
import { StepNewSerie } from "./Components/StepNewSerie";
import { StepReview } from "./Components/StepReview";
import { StepRegulation } from "../CreateSecurityCommons/StepRegulation";

export const CreateEquity = () => {
  const { t } = useTranslation("security", { keyPrefix: "createEquity" });
  const { t: tRoutes } = useTranslation("routes");
  const { setType } = useUserStore();

  const steps = useSteps();
  const form = useForm<ICreateEquityFormValues>({
    mode: "all",
    defaultValues: {
      isControllable: true,
      isBlocklist: true,
      isApproval: false,
      isVotingRight: false,
      isInformationRight: false,
      isLiquidationRight: false,
      isSubscriptionRight: false,
      isConversionRight: false,
      isRedemptionRight: false,
      isPutRight: false,
      regulationType: 1,
      regulationSubType: 0,
      countriesListType: 1,
      countriesList: [] as string[],
    },
  });

  const wizardSteps = [
    {
      title: t("stepTokenDetails.title"),
      content: <StepTokenDetails />,
    },
    {
      title: t("stepNewSerie.title"),
      content: <StepNewSerie />,
    },
    {
      title: t("header.regulation"),
      content: <StepRegulation />,
    },
    {
      title: t("stepReview.title"),
      content: <StepReview />,
    },
  ];

  useEffect(() => {
    setType(User.admin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Stack gap={6}>
        <History label={tRoutes(RouteName.CreateEquity)} />
        <HStack
          w="full"
          h="full"
          bg="neutral.50"
          p={4}
          pb={10}
          justifyContent="center"
          alignItems="center"
          display="flex"
        >
          <Box
            as="form"
            data-testid="create-equity-form"
            layerStyle="container"
            p={0}
          >
            <FormProvider {...form}>
              <Wizard
                // @ts-ignore
                steps={wizardSteps}
                {...steps}
              />
            </FormProvider>
          </Box>
        </HStack>
      </Stack>
    </>
  );
};
