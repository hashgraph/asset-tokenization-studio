import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Text } from "@/Components/Foundations/Text";
import { IconButton } from "@Components/Interaction/IconButton";
import { Tooltip } from "@Components/Overlay/Tooltip";
import {
  Box as ChakraBox,
  VStack as ChakraVStack,
  Flex as ChakraFlex,
  useStyleConfig,
  Skeleton,
} from "@chakra-ui/react";
import type { BoxProps as ChakraBoxProps } from "@chakra-ui/react";
import { X } from "@phosphor-icons/react";
import type { MouseEvent } from "react";
import React, { useEffect, useRef, useState } from "react";
import { useFormControlContext as useChakraFormControlContext } from "@chakra-ui/form-control";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import _merge from "lodash/merge";
import { formatBytes } from "@Components/Forms/FileInput";

export const fileCardPartsList: Array<
  "container" | "name" | "size" | "closeIcon"
> = ["container", "name", "size", "closeIcon"];

type Parts = typeof fileCardPartsList;

export type FileCardConfigProps = {
  isInvalid?: boolean;
};

export type FileCardThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;

export interface FileCardThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {}
export interface FileCardProps extends ChakraBoxProps {
  file: File;
  isInvalid?: boolean;
  isLoading?: boolean;
  errorMsg?: string;
  onRemove?: () => void;
}

export const FileCard = ({
  file,
  isInvalid,
  isLoading,
  errorMsg = "Error uploading the file, please try again.",
  onRemove,
  sx,
  ...props
}: FileCardProps) => {
  const formControl = useChakraFormControlContext() || {};
  const invalid = isInvalid ?? formControl.isInvalid;

  const themeStyles = useStyleConfig("FileCard", {
    isInvalid: invalid,
  }) as FileCardThemeStyle;

  const styles = React.useMemo(
    () => _merge(themeStyles, sx),
    [themeStyles, sx]
  );

  const { name, size } = file;

  const textRef = useRef<HTMLParagraphElement | null>(null);

  const [isOverflowed, setIsOverflowed] = useState<boolean>(false);

  useEffect(() => {
    if (textRef.current) {
      setIsOverflowed(
        textRef.current.scrollWidth > textRef.current.clientWidth
      );
    }
  }, []);

  const handleClickCloseButton = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    onRemove && onRemove();
  };

  if (isLoading) {
    return <Skeleton flex={1} h={"90px"} />;
  }

  return (
    <ChakraBox sx={styles.container} {...props}>
      <ChakraVStack
        spacing={5}
        justifyContent={"flex-start"}
        alignItems={"flex-start"}
      >
        <Tooltip label={name} isDisabled={!isOverflowed}>
          <Text data-testid="text-filename" ref={textRef} sx={styles.name}>
            {name}
          </Text>
        </Tooltip>
        <ChakraFlex w="full" justify={"space-between"}>
          <Text data-testid="text-size" sx={styles.size}>
            {isInvalid ? errorMsg : formatBytes(size) + " · Upload completed"}
          </Text>
          {!isInvalid && <Text sx={styles.size}>100%</Text>}
        </ChakraFlex>
      </ChakraVStack>
      <ChakraBox position={"absolute"} top={3} right={4}>
        <IconButton
          data-testid="button-remove"
          icon={<PhosphorIcon as={X} />}
          sx={styles.closeIcon}
          aria-label="Close card"
          size={"xxs"}
          variant="tertiary"
          onClick={handleClickCloseButton}
        />
      </ChakraBox>
    </ChakraBox>
  );
};
