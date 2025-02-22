import { Box, Flex, Image, Tag, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useRef } from "react";
import { FurnishedTab } from "~/types";
import IncognitoImage from "~/assets/incognito.png";

const tagColorMap: Record<string, Parameters<typeof Tag>[0]["bgColor"]> = {
  grey: "grey.300",
};

export default function TabResult({
  tab,
  selected,
  onClick,
  isCurrent,
}: {
  tab: FurnishedTab;
  selected?: boolean;
  isCurrent?: boolean;
  onClick?: Parameters<typeof Flex>[0]["onClick"];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected) {
      containerRef.current?.scrollIntoView({
        behavior: "instant",
        block: "center",
      });
    }
  }, [selected]);

  const tagColorProps = useMemo(() => {
    let bgColor = tagColorMap[tab.group?.color ?? ""];
    if (!bgColor) {
      return { colorScheme: tab.group?.color };
    } else {
      return { bgColor };
    }
  }, [tab.group?.color]);

  return (
    <Flex
      ref={containerRef}
      p={2}
      role="button"
      {...(selected
        ? {
            _dark: {
              bgColor: "whiteAlpha.300",
            },
            _light: {
              bgColor: "blackAlpha.200",
            },
          }
        : {
            _dark: {
              _hover: {
                bgColor: "whiteAlpha.100",
              },
            },
            _light: {
              _hover: {
                bgColor: "blackAlpha.50",
              },
            },
          })}
      onClick={onClick}
      borderRadius="sm"
    >
      <Flex flexDir="column" flex={1}>
        <Flex gap={2} align="center">
          <Image
            fallback={
              <Flex
                boxSize={4}
                borderRadius="full"
                flex="none"
                _light={{
                  bgColor: "blackAlpha.300",
                }}
                _dark={{
                  bgColor: "whiteAlpha.300",
                }}
                align="center"
                justify="center"
              ></Flex>
            }
            boxSize={4}
            borderRadius="full"
            src={tab.favIconUrl}
          />
          {tab.group && (
            <Tag
              flex="none"
              {...tagColorProps}
              _dark={{ variant: "solid" }}
              size="sm"
            >
              {tab.group.title}
            </Tag>
          )}
          <Text textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
            {tab.title}
          </Text>
        </Flex>
        <Text
          noOfLines={1}
          fontSize="xs"
          _light={{
            color: "blackAlpha.600",
          }}
          _dark={{
            color: "whiteAlpha.600",
          }}
        >
          {tab.url}
        </Text>
      </Flex>
      {tab.incognito && <Image mt={2} boxSize={5} src={IncognitoImage} />}
    </Flex>
  );
}
