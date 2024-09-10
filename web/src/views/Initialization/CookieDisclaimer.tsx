import {
  ChakraProvider,
  Flex,
  useDisclosure,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  Stack,
  Link,
} from "@chakra-ui/react";
import { ReactNode, useEffect, useState } from "react";
import {
  InputController,
  PhosphorIcon,
  PopUp,
} from "@hashgraph/asset-tokenization-uicomponents";
import { Info } from "@phosphor-icons/react";
import theme from "../../theme";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";

interface DisclaimerProps {
  setAccepted: (accepted: boolean) => void;
}

const Disclaimer = ({ setAccepted }: DisclaimerProps) => {
  const { t } = useTranslation("initialization");

  const {
    isOpen: isDisclaimerOpen,
    onOpen: onDisclaimerOpen,
    onClose: onDisclaimerClose,
  } = useDisclosure();
  const {
    isOpen: isCookiesOpen,
    onOpen: onCookiesOpen,
    onClose: onCookiesClose,
  } = useDisclosure();
  const [, setDisclaimer] = useState<boolean>(false);
  const [cookiesAccepted, setCookiesAccepted] = useState<boolean>(false);

  const { control, formState } = useForm({
    mode: "onChange",
  });

  useEffect(() => {
    if (document.cookie.indexOf("cookiesAccepted=true") === -1) {
      onCookiesOpen();
    } else {
      setCookiesAccepted(true);
    }

    if (document.cookie.indexOf("disclaimerAccepted=true") === -1) {
      onDisclaimerOpen();
    } else {
      setAccepted(true);
    }
  }, [onCookiesOpen, onDisclaimerOpen, setAccepted]);

  const handleCookiesAccept = () => {
    document.cookie =
      "cookiesAccepted=true; expires=Fri, 31 Dec 9999 23:59:59 GMT";
    setCookiesAccepted(true);
    onCookiesClose();
    onDisclaimerOpen();
  };

  const handleCookiesDecline = () => {
    setCookiesAccepted(false);
    onCookiesClose();
    onDisclaimerOpen();
  };

  const handleSubmit = () => {
    if (cookiesAccepted) {
      document.cookie =
        "disclaimerAccepted=true; expires=Fri, 31 Dec 9999 23:59:59 GMT";
    }
    setAccepted(true);
    setDisclaimer(true);
    onDisclaimerClose();
  };

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
            isOpen={isCookiesOpen && !cookiesAccepted}
            onClose={handleCookiesDecline}
            icon={<PhosphorIcon as={Info} size="md" />}
            title={t("cookieDisclaimer.Title")}
            description={t("cookieDisclaimer.Description")}
            cancelText={t("cookieDisclaimer.CancelButton")}
            confirmText={t("cookieDisclaimer.ConfirmButton")}
            onConfirm={handleCookiesAccept}
            onCancel={handleCookiesDecline}
          />
          <ModalAction
            data-testid="disclaimer"
            title="Asset Tokenization Studio Web Demo"
            isOpen={isDisclaimerOpen && !isCookiesOpen}
            onClose={() =>
              window.location.replace("https://tokenization-studio.hedera.com/")
            }
            onConfirm={() => {
              handleSubmit();
            }}
            cancelButtonLabel="Cancel"
            confirmButtonLabel="Accept"
            isDisabled={!formState.isValid}
          >
            <VStack
              h="full"
              justify={"space-between"}
              pt="10px"
              align={"left"}
              w="full"
            >
              <Text
                fontSize="17px"
                color="brand.secondary"
                fontWeight={400}
                align="left"
                w="full"
                as="i"
              >
                Please provide your information and accept the terms &
                conditions below to utilize the React-based demo application of
                Asset Tokenization Studio on the Hedera testnet.
              </Text>
              <Stack as="form" spacing={4}>
                <InputController
                  id="firstname"
                  rules={{
                    required: "This field is required",
                    validate: {
                      validation: (value: string) => {
                        if (value === undefined || value.length > 20) {
                          return "Invalid First Name";
                        }
                        return true;
                      },
                    },
                  }}
                  isRequired
                  control={control}
                  name="firstname"
                  label="First Name"
                  placeholder="First Name"
                />
                <InputController
                  id="lastname"
                  rules={{
                    required: "This field is required",
                    validate: {
                      validation: (value: string) => {
                        if (value === undefined || value.length > 20) {
                          return "Invalid Last Name";
                        }
                        return true;
                      },
                    },
                  }}
                  isRequired
                  control={control}
                  name="lastname"
                  label="Last Name"
                  placeholder="Last Name"
                />
                <InputController
                  id="email"
                  rules={{
                    required: "This field is required",
                    validate: {
                      validation: (value: string) => {
                        if (
                          value === undefined ||
                          !/^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z0-9.-]{2,63}$/i.test(
                            value,
                          )
                        ) {
                          return "Invalid Email";
                        }
                        return true;
                      },
                    },
                  }}
                  isRequired
                  control={control}
                  name="email"
                  label="Email"
                  placeholder="Email"
                />
                <VStack align="center" pt={2}>
                  <Link
                    href={"https://swirldslabs.com/privacy-policy/"}
                    isExternal
                  >
                    Privacy Policy
                  </Link>
                  <Link href={"/terms-of-service.html"} isExternal>
                    By clicking Accept you agree to the Terms and Conditions
                  </Link>
                </VStack>
              </Stack>
            </VStack>
          </ModalAction>
        </>
      </Flex>
    </ChakraProvider>
  );
};

export default Disclaimer;

export interface ModalActionProps {
  cancelButtonLabel: string;
  children: ReactNode;
  confirmButtonLabel: string;
  isOpen: boolean;
  onCancel?: () => void;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isDisabled?: boolean;
}

const ModalAction = (props: ModalActionProps) => {
  const {
    cancelButtonLabel,
    children,
    confirmButtonLabel,
    isOpen,
    onCancel,
    onClose,
    onConfirm,
    title,
    isDisabled = false,
  } = props;

  return (
    <Modal
      data-testid="modal-action"
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      isCentered
      closeOnEsc={false}
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent data-testid="modal-action-content" p="50px" w="500px">
        <ModalCloseButton />
        <ModalHeader px={0}>
          <Text
            data-testid="modal-action-title"
            fontSize="19px"
            fontWeight={700}
            lineHeight="16px"
            color="brand.black"
            textAlign="center"
          >
            {title}
          </Text>
        </ModalHeader>
        <ModalBody textAlign="center" pt="14px" px={0}>
          {children}
        </ModalBody>
        <ModalFooter p="0" justifyContent="center">
          <HStack spacing={6} pt={8} w="full">
            <Button
              data-testid="modal-action-cancel-button"
              onClick={onCancel || onClose}
              variant="secondary"
              flex={1}
            >
              {cancelButtonLabel}
            </Button>
            <Button
              data-testid="modal-action-confirm-button"
              onClick={onConfirm}
              flex={1}
              isDisabled={isDisabled}
            >
              {confirmButtonLabel}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
