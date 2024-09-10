import { ChakraProvider, Flex, useDisclosure } from "@chakra-ui/react";
import { useEffect } from "react";
import {
  PhosphorIcon,
  PopUp,
} from "@hashgraph/asset-tokenization-uicomponents";
import { Info } from "@phosphor-icons/react";
import theme from "../../theme";
import { useTranslation } from "react-i18next";

interface DisclaimerProps {
  setAccepted: (accepted: boolean) => void;
}

const Disclaimer = ({ setAccepted }: DisclaimerProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation("initialization");

  useEffect(() => {
    onOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <Flex
        w="full"
        h="100vh"
        justify={"center"}
        alignSelf="center"
        alignContent={"center"}
        flex={1}
        flexDir="column"
        gap={10}
      >
        <>
          <PopUp
            id="cookieDisclaimer"
            isOpen={isOpen}
            onClose={onClose}
            icon={<PhosphorIcon as={Info} size="md" />}
            title={t("cookieDisclaimer.Title")}
            description={t("cookieDisclaimer.Description")}
            cancelText={t("cookieDisclaimer.CancelButton")}
            confirmText={t("cookieDisclaimer.ConfirmButton")}
            onConfirm={() => {
              setAccepted(true);
            }}
            onCancel={onClose}
          />
        </>
      </Flex>
    </ChakraProvider>
  );
};

export default Disclaimer;
