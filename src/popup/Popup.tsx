import { useRef } from "react";
import { MainApp } from "~/components/MainApp";
import { APP_POPUP_DIMENSIONS } from "~/constants";
import { frequentTabsStore, selectTab } from "~/models/tabs.models";
import { storageVariable } from "~/utils/storage.utils";
const previousTabPromise = chrome.storage.local
  .get("lastActiveTabId")
  .then(({ lastActiveTabId }) => chrome.tabs.get(lastActiveTabId));
const popupContainerTypeVar = storageVariable("popupContainerType");

let windowDims = null as {
  initLeft?: number;
  initTop?: number;
} | null;

const detached =
  new URLSearchParams(window.location.search).get("detached") === "true";
(async function initFrame() {
  windowDims = (await chrome.storage.local.get([
    "initLeft",
    "initTop",
  ])) as NonNullable<typeof windowDims>;

  const isIntermediatePopup =
    detached && (!windowDims.initLeft || !windowDims.initTop);

  windowDims = {
    initLeft: Math.round(
      (window.screen.availWidth - APP_POPUP_DIMENSIONS.width) / 2,
    ),
    initTop: Math.round(
      ((window.screen.availHeight - APP_POPUP_DIMENSIONS.height) / 2) * 0.7,
    ),
  };
  const setPromise = chrome.storage.local.set(windowDims);

  if (isIntermediatePopup) {
    await openDetachedPopup();
  }

  if (isIntermediatePopup) {
    await setPromise;
    window.close();
  }
})();

async function openDetachedPopup() {
  const { initLeft, initTop } = windowDims!;
  const newAppWindow = await chrome.windows.create({
    url: chrome.runtime.getURL("popup.html?detached=true"),
    type: "popup",
    ...APP_POPUP_DIMENSIONS,
    left: initLeft,
    top: initTop,
  });
  await chrome.storage.local.set({ appWindowId: newAppWindow.id });
}

let isDetachedJumping = false;

export function Popup() {
  // const minus = () => {
  //   if (count > 0) setCount(count - 1);
  // };
  // const add = () => setCount(count + 1);
  // useEffect(() => {
  //   chrome.storage.sync.get(["count"], (result) => {
  //     setCount(result.count || 0);
  //   });
  // }, []);
  // useEffect(() => {
  //   chrome.storage.sync.set({ count });
  //   chrome.runtime.sendMessage({ type: "COUNT", count });
  // }, [count]);
  const lastFocusedWindowId = useRef(-1);
  return (
    <div style={!detached ? APP_POPUP_DIMENSIONS : {}}>
      <MainApp
        onBlur={() => {
          if (!detached) return;
          if (isDetachedJumping) return;
          window.close();
        }}
        onEsc={async () => {
          if (!detached) return;
          const previousTab = await previousTabPromise;
          if (previousTab) {
            selectTab({ ...previousTab, active: false });
          }
          window.close();
        }}
        onSelectionChange={async (selectedTab) => {
          if (!detached) return;
          isDetachedJumping = true;
          const appWindowIdResult = chrome.storage.local.get("appWindowId");
          await selectTab(
            selectedTab,
            selectedTab.windowId !== lastFocusedWindowId.current,
          );
          lastFocusedWindowId.current = selectedTab.windowId;

          const { appWindowId } = await appWindowIdResult;
          if (appWindowId) {
            await chrome.windows.update(appWindowId, {
              focused: true,
            });
          }
          isDetachedJumping = false;
        }}
        onEnter={async (selectedTab) => {
          if (selectedTab.customType) {
            switch (selectedTab.customType) {
              case "toggleContainerType":
                popupContainerTypeVar.update(detached ? "popup" : "detached");
                if (!detached) {
                  openDetachedPopup();
                } else {
                  await chrome.storage.local.remove("lastActiveTabId");
                }
                break;
            }
          } else if (selectedTab.id) {
            await (async function () {
              const tabCount =
                (await frequentTabsStore.get(selectedTab.id!)) ?? 0;
              await frequentTabsStore.update({
                [selectedTab.id!]: tabCount + 1,
              });
            })();
            selectTab(selectedTab);
          }
          window.close();
        }}
        customTabs={[
          {
            customType: "toggleContainerType",
            title: `Switch to ${detached ? "popup" : "detached"} mode`,
          },
        ]}
      />
    </div>
  );
}
