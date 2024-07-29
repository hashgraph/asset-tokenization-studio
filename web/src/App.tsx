import { ChakraProvider } from "@chakra-ui/react";
import { I18nextProvider, useTranslation } from "react-i18next";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import theme from "./theme";
import i18n from "./i18n";
import AppRouter from "./router";
import { SDKConnection } from "./components/SDKConnection";
import { InterFonts, useToast } from "@hashgraph/assettokenization-uicomponents";
import { useState } from "react";
import Disclaimer from "./views/Initialization/CookieDisclaimer.js";

function App() {
  const toast = useToast();
  const { t } = useTranslation("globals");
  const [accepted, setAccepted] = useState<boolean>(false);
  const showDisclaimer: boolean =
    process.env.REACT_APP_SHOW_DISCLAIMER !== undefined &&
    process.env.REACT_APP_SHOW_DISCLAIMER === "true";

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const showErrorToast = (error: any) => {
    const description = error?.message || t("error");
    toast.show({
      title: "Error",
      description,
      status: "error",
    });
  };

  const onError = (error: unknown) => {
    console.error("Error: ", error);
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
      mutations: {
        onError,
        // @ts-ignore
        showErrorToast: true,
      },
    },
    queryCache: new QueryCache({
      onError,
    }),
    mutationCache: new MutationCache({
      // @ts-ignore
      onError: (error: any, variables: any, context: any, mutation: any) => {
        if (!mutation.options.showErrorToast) return;
        showErrorToast(error);
      },
    }),
  });

  return !showDisclaimer || accepted ? (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <InterFonts />
          <AppRouter />
          <SDKConnection />
        </ChakraProvider>
      </QueryClientProvider>
    </I18nextProvider>
  ) : (
    <Disclaimer setAccepted={setAccepted} />
  );
}

export default App;
