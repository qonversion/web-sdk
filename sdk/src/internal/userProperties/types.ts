export type UserPropertiesStorage = {
  getProperties: () => Record<string, string>;

  addOne: (key: string, value: string) => void;

  add: (properties: Record<string, string>) => void;

  deleteOne: (key: string, value: string) => void;

  delete: (properties: Record<string, string>) => void;

  clear: () => void;
};

export type UserPropertiesService = {
  sendProperties: (properties: Record<string, string>) => Promise<string[]>;
};

export type UserPropertiesController = {
  setProperty: (key: string, value: string) => void;

  setProperties: (properties: Record<string, string>) => void;
};
