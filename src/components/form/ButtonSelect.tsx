import { Button, ButtonGroup, ButtonProps, Flex, Text } from "@chakra-ui/react";
import { FormComponentStandardProps } from "@structal/form";

export default function ButtonSelect({
  value,
  onChange,
  label,
  options,
  buttonProps = {},
}: {
  options: Array<{ label?: string; value: any }>;
  buttonProps?: ButtonProps & {
    variant?: "solid" | "outline" | "ghost" | "link";
  };
} & FormComponentStandardProps) {
  return (
    <Flex gap="1">
      <Text>{label}</Text>
      <ButtonGroup isAttached>
        {options?.map((option) => {
          const { label: btnLabel, value: currentValue } =
            typeof option === "string"
              ? { label: option, value: option }
              : option;
          return (
            <Button
              {...buttonProps}
              key={String(currentValue)}
              onClick={() => {
                if (currentValue !== value) {
                  return onChange?.(currentValue);
                }
              }}
              {...(currentValue === value
                ? {
                    variant: "solid",
                  }
                : {
                    variant: "outline",
                  })}
            >
              {btnLabel ?? currentValue}
            </Button>
          );
        })}
      </ButtonGroup>
    </Flex>
  );
}
