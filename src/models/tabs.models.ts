import { storageObjectVariable } from "~/utils/storage.utils";

export async function getAllTabs() {
  const [tabs, tabGroups] = await Promise.all([
    chrome.tabs.query({}),
    chrome.tabGroups.query({}),
  ]);
  const tabGroupsMap = tabGroups.reduce(
    (accum, group) => ({
      ...accum,
      [group.id]: group,
    }),
    {} as Record<string | number, (typeof tabGroups)[number]>,
  );

  return tabs.map((tab) => {
    return {
      ...tab,
      group: tab.groupId !== -1 ? tabGroupsMap[tab.groupId] : undefined,
    };
  });
}

export async function selectTab(
  targetTab: Pick<chrome.tabs.Tab, "active" | "id" | "windowId">,
  focusWindow = true,
) {
  if (!targetTab.id) {
    return;
  }
  const proms = [];
  proms.push(
    chrome.tabs.update(targetTab.id, {
      active: true,
    }),
  );

  if (focusWindow) {
    proms.push(
      chrome.windows.update(targetTab.windowId, {
        focused: true,
      }),
    );
  }
  return Promise.all(proms);
}

export const frequentTabsStore =
  storageObjectVariable<Record<string | number, number>>("ft");
