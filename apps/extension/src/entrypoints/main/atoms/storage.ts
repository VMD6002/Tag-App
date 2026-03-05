import { Storage } from "@plasmohq/storage";

const plasmoStorage = new Storage({
  area: "local",
});

// export const createWxtStorage = <T>() => ({
//   getItem: async (key: string, initialValue: T): Promise<T> => {
//     const value = await plasmoStorage.get<T>(key);
//     return value === undefined ? initialValue : value;
//   },
//   setItem: async (key: string, value: T): Promise<void> => {
//     await plasmoStorage.set(key, value);
//   },
//   removeItem: async (key: string): Promise<void> => {
//     await plasmoStorage.remove(key);
//   },
// });

export const createWxtStorage = () => ({
  getItem: async <T>(key: string, initialValue: T): Promise<T> => {
    const value = await storage.getItem<T>(`local:${key}`);
    return value ?? initialValue;
  },

  setItem: async <T>(key: string, value: T): Promise<void> => {
    await storage.setItem(`local:${key}`, value);
  },

  removeItem: async (key: string): Promise<void> => {
    await storage.removeItem(`local:${key}`);
  },
});
