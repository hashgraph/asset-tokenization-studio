// SPDX-License-Identifier: Apache-2.0

import { Button, HStack } from "@chakra-ui/react";
import { OperationContractType } from "../views/DigitalSecurityDetails/Components/Tabs/Operations";

interface SegmentedButtonProps {
  selectedOperationContractType: OperationContractType;
  setSelectedOperationContractType: (type: OperationContractType) => void;
}

export const SegmentedButton = ({
  selectedOperationContractType,
  setSelectedOperationContractType,
}: SegmentedButtonProps) => {
  return (
    <HStack bg="#F2F4F5" p={1} borderRadius="lg" display="inline-flex" h={"full"} minH={"full"}>
      {["ERC 1400", "ERC 3643"].map((label) => (
        <Button
          h={"full"}
          minH={"full"}
          borderRadius={"md"}
          border={"none"}
          bgColor={selectedOperationContractType === label ? "white" : "transparent"}
          style={{
            padding: "8px 24px",
          }}
          _hover={{
            bgColor: "white",
            color: "#0B0712",
          }}
          _active={{
            boxShadow: "none",
          }}
          _focus={{
            boxShadow: "none",
          }}
          key={label}
          onClick={() => setSelectedOperationContractType(label as OperationContractType)}
          color={selectedOperationContractType === label ? "#0B0712" : "#656070"}
          fontWeight={600}
          fontSize={"md"}
        >
          {label}
        </Button>
      ))}
    </HStack>
  );
};
