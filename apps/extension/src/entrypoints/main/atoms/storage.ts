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
