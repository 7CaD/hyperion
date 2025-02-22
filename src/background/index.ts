import { APP_POPUP_DIMENSIONS } from "~/constants";
import { frequentTabsStore } from "~/models/tabs.models";
import { PopupContainerType } from "~/types";
import { storageObject } from "~/utils/storage.utils";
chrome.action.setPopup({
  // popup: "",
  popup: chrome.runtime.getURL("./popup.html"),
});
console.log("background is running");

const storage = storageObject({
  initLeft: 0,
  initTop: 0,
  appWindowId: undefined as undefined | number,
  lastActiveTabId: undefined as undefined | number,
  popupContainerType: "popup" as PopupContainerType,
});
storage.onChange(async (change) => {
  if (change.popupContainerType) {
    switch (change.popupContainerType) {
      case "detached":
        chrome.action.setPopup({
          popup: "",
        });
        chrome.action.onClicked.addListener(detachedPopupListener);
        break;
      case "popup":
        chrome.action.onClicked.removeListener(detachedPopupListener);
        await chrome.action.setPopup({
          // popup: "",
          popup: chrome.runtime.getURL("./popup.html"),
        });
        break;
    }
  }
});

frequentTabsStore.watch();

chrome.windows.onRemoved.addListener(async (windowId) => {
  if (windowId === (await storage.get()).appWindowId) {
    await storage.delete("appWindowId");
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  frequentTabsStore.delete(tabId);
});
const detachedPopupListener = async () => {
  chrome.tabs
    .query({
      active: true,
      currentWindow: true,
    })
    .then((result) => {
      if (result[0]) {
        storage.update({
          lastActiveTabId: result[0].id,
        });
      }
    });
  const { appWindowId } = await storage.get();
  if (!appWindowId) {
    await newAppWindow();
  } else {
    try {
      await chrome.windows.update(appWindowId!, {
        focused: true,
      });
    } catch (err) {
      // this could happen if previous window cleanup fails. simply recreate a new app window then
      await newAppWindow();
    }
  }
};

async function newAppWindow(forceRecalculate = false) {
  const { initLeft, initTop } = await storage.get();

  const createParams: Parameters<typeof chrome.windows.create>[0] =
    initLeft && initTop && !forceRecalculate
      ? { ...APP_POPUP_DIMENSIONS, left: initLeft, top: initTop }
      : { width: 1, height: 1, focused: false };
  try {
    const appWindow = await chrome.windows.create({
      url: chrome.runtime.getURL("popup.html?detached=true"),
      type: "popup",
      ...createParams,
    });
    if (appWindow.id) {
      storage.update({ appWindowId: appWindow.id });
    }
  } catch (err) {
    // if this fails, its probably due to the dimension issues. Retry creating a new app window, but force recalculations.
    newAppWindow(true);
  }
}
