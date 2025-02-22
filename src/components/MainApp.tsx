import {
  ChakraProvider,
  Flex,
  Input,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import Fuse from "fuse.js";
import { useMemo, useState, useTransition } from "react";
import SettingsIcon from "~/assets/settings.svg";
import { frequentTabsStore, getAllTabs } from "~/models/tabs.models";
import { theme } from "~/theme";
import { FurnishedTab } from "~/types";
import { preloadState, useKeyboardSelection } from "~/utils/common.utils";
import TabResult from "./TabResult";

const useTabsState = preloadState(getAllTabs);

const useFrequentTabIdsState = preloadState(async () => {
  const frequentTabIds = await frequentTabsStore.getAll();
  return Object.entries(frequentTabIds ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);
});

type MainAppProps = {
  customTabs?: Partial<FurnishedTab>[];
  onSelectionChange?: (tab: FurnishedTab) => void;
  onEnter?: (tab: FurnishedTab) => void;
  onEsc?: () => void;
  onBlur?: () => void;
};

function MainAppInternal({
  customTabs,
  onSelectionChange,
  onEnter,
  onEsc,
  onBlur,
}: MainAppProps) {
  const [allTabs] = useTabsState();
  const [, startTransition] = useTransition();
  const [frequentTabIds] = useFrequentTabIdsState();
  const [currentSearch, setCurrentSearch] = useState("");
  const fuse = useMemo(
    () =>
      new Fuse(allTabs, {
        shouldSort: true,
        keys: [
          {
            name: "group.title",
            weight: 2,
          },
          {
            name: "title",
            weight: 1,
          },
          {
            name: "url",
            weight: 1,
          },
        ],
        threshold: 0.6,
        distance: 1000,
      }),
    [allTabs],
  );
  const [currentResults, setCurrentResults] = useState<FurnishedTab[]>([]);
  const allTabsMap = useMemo(
    () =>
      (allTabs ?? []).reduce(
        (accum, curr) => ({
          ...accum,
          [curr.id!]: curr,
        }),
        {} as Record<string | number, any>,
      ),
    [allTabs],
  );

  const { list, summaryText } = useMemo<{
    list: FurnishedTab[];
    summaryText?: string;
  }>(() => {
    if (currentResults.length === 0) {
      const frequentTabs = (frequentTabIds ?? [])
        .map(([tabId]) => allTabsMap[tabId])
        .filter((x) => x);
      if (frequentTabs.length) {
        return {
          summaryText: "Most frequented",
          list: frequentTabs,
        };
      } else {
        return { list: [] };
      }
    }
    return {
      list: currentResults,
      summaryText: `${currentResults.length} results`,
    };
  }, [currentResults, frequentTabIds, allTabsMap]);
  const { setColorMode } = useColorMode();

  const handleEnter = (selectedTab: FurnishedTab) => {
    switch (selectedTab.customType) {
      case "setting:darkMode":
        setColorMode("dark");
        break;
      case "setting:lightMode":
        setColorMode("light");
        break;
      default:
        onEnter?.(selectedTab);
    }
  };

  const selection = useKeyboardSelection({
    max: list.length,
    async onChange(newIdx) {
      const selectedTab = list[newIdx];

      if (selectedTab) {
        if (!selectedTab.customType) {
          onSelectionChange?.(selectedTab);
        }
      }
    },
    async onEnter() {
      const selectedTab = list[selection.current];
      if (selectedTab) {
        handleEnter(selectedTab);
      }
    },
    async onEsc() {
      onEsc?.();
    },
  });

  return (
    <Flex
      onBlur={onBlur}
      flexDir="column"
      w="100%"
      h="100dvh"
      fontSize="md"
      p={3}
      _dark={{
        bgColor: "#202324",
      }}
    >
      <Flex>Total number of tabs open: {allTabs?.length ?? "-"}</Flex>
      <Flex px={1}>
        <Input
          size="lg"
          fontSize="md"
          autoFocus
          placeholder="Find a tab..."
          onKeyDown={selection.handle as any}
          variant="flushed"
          px={2}
          value={currentSearch}
          onChange={(e) => {
            const value = e.target.value;
            setCurrentSearch(value);
            const additional: Partial<FurnishedTab>[] = [];
            if (value.startsWith("/")) {
              additional.push(
                {
                  customType: "setting:darkMode",
                  title: "Dark mode",
                  favIconUrl: SettingsIcon,
                },
                {
                  customType: "setting:lightMode",
                  title: "Light mode",
                  favIconUrl: SettingsIcon,
                },
                ...(customTabs ?? []),
              );
            }
            const res = fuse.search(value);
            startTransition(() => {
              setCurrentResults(
                (additional as FurnishedTab[]).concat(
                  res.map((entry) => entry.item),
                ),
              );
              if (selection.current !== 0) {
                selection.set(0);
              }
            });
          }}
        />
      </Flex>
      <Text
        ml={2}
        mt={3}
        mb={1}
        fontSize="xs"
        _light={{
          color: "blackAlpha.700",
        }}
        _dark={{
          color: "whiteAlpha.600",
        }}
        fontWeight="semibold"
      >
        {summaryText}
      </Text>
      <Flex flexDir="column" overflowY="scroll" overflowX="hidden">
        {list.map((tab, idx) => (
          <TabResult
            onClick={() => {
              selection.set(idx);
              handleEnter(tab);
            }}
            key={tab.id}
            tab={tab}
            selected={idx === selection.current}
          />
        ))}
      </Flex>
    </Flex>
  );
}

export function MainApp(props: MainAppProps) {
  return (
    <ChakraProvider theme={theme}>
      <MainAppInternal {...props} />
    </ChakraProvider>
  );
}
