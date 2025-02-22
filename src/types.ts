import type Fuse from "fuse.js";
import { getAllTabs } from "./models/tabs.models";

export type AwaitedReturnType<T extends (...args: any[]) => any> = Awaited<
  ReturnType<T>
>;

export type FurnishedTab = AwaitedReturnType<typeof getAllTabs>[number] & {
  customType?: "setting:darkMode" | "setting:lightMode" | "toggleContainerType";
};

export type PopupContainerType = "popup" | "detached";
