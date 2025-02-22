// self updates storage changes from other sources
export function storageObject<VarType extends object>(initialValue: VarType) {
  let mem: VarType;
  const initDone = chrome.storage.local.get(initialValue).then((val) => {
    mem = val as VarType;
  });
  let watching = false;

  let handlerId = 1;
  const customHandlers = {} as Record<
    number,
    (changes: Partial<VarType>) => void
  >;
  async function watch() {
    await initDone;
    chrome.storage.local.onChanged.addListener((changes) => {
      const wantChanges = {} as VarType;
      for (let prop in mem) {
        if (Object.hasOwn(mem, prop) && changes[prop] !== undefined) {
          wantChanges[prop] = changes[prop].newValue;
        }
      }
      if (Object.keys(wantChanges).length) {
        for (const handlerId in customHandlers) {
          customHandlers[handlerId]?.(wantChanges);
        }
        Object.assign(mem, wantChanges);
      }
    });
    watching = true;
  }
  return {
    watch,
    async get(): Promise<VarType> {
      await initDone;
      return mem;
    },
    async update(change: Partial<VarType>) {
      mem = {
        ...mem,
        ...change,
      };
      await chrome.storage.local.set(mem);
    },
    async onChange(handler: (changes: Partial<VarType>) => void) {
      if (!watching) watch();
      const id = handlerId++;
      customHandlers[id] = handler;
      return () => {
        delete customHandlers[id];
      };
    },
    async delete(subKey: keyof VarType) {
      delete mem[subKey];
      await chrome.storage.local.set(mem);
    },
  };
}

// this is a nested object variable stored only in one key
export function storageObjectVariable<VarType extends object>(key: string) {
  let mem = {} as VarType;
  const initDone = chrome.storage.local.get(key).then((val) => {
    mem = val?.[key] ?? {};
  });

  return {
    watch() {
      chrome.storage.local.onChanged.addListener((changes) => {
        if (changes[key]) {
          mem = changes[key].newValue as VarType;
        }
      });
    },
    async get<K extends keyof VarType>(
      subKey: K,
    ): Promise<VarType[K] | undefined> {
      await initDone;
      return mem?.[subKey];
    },
    async getAll(): Promise<VarType> {
      await initDone;
      return mem;
    },
    async update(change: Partial<VarType>) {
      mem = {
        ...mem,
        ...change,
      };
      await chrome.storage.local.set({ [key]: mem });
    },
    async delete(subKey: keyof VarType) {
      delete mem[subKey];
      await chrome.storage.local.set({ [key]: mem });
    },
  };
}

export function storageVariable<VarType>(key: string, initialValue?: VarType) {
  let mem: VarType | undefined;
  const initDone = chrome.storage.local.get(key).then((val) => {
    mem = val[key] as VarType;
  });
  chrome.storage.local.onChanged.addListener((changes) => {
    if (changes[key] !== undefined) {
      mem = changes[key].newValue;
    }
  });

  return {
    async get(): Promise<VarType | undefined> {
      await initDone;
      return mem;
    },
    async update(change: VarType) {
      mem = change;
      await chrome.storage.local.set({ [key]: mem });
    },
    async delete() {
      mem = undefined;
      await chrome.storage.local.remove(key);
    },
  };
}
