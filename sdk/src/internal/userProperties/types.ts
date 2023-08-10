import UserProperties from '../../dto/UserProperties';

export type UserPropertiesStorage = {
  getProperties: () => Record<string, string>;

  addOne: (key: string, value: string) => void;

  add: (properties: Record<string, string>) => void;

  deleteOne: (key: string, value: string) => void;

  delete: (properties: Record<string, string>) => void;

  clear: () => void;
};

export type UserPropertiesService = {
  sendProperties: (userId: string, properties: Record<string, string>) => Promise<UserPropertiesSendResponse>;
  getProperties: (userId: string) => Promise<UserPropertyData[]>;
};

export type UserPropertiesController = {
  setProperty: (key: string, value: string) => void;
  setProperties: (properties: Record<string, string>) => void;
  getProperties: () => Promise<UserProperties>;
};

export type UserPropertyData = {
  key: string;
  value: string;
};

export type UserPropertyError = {
  key: string;
  error: string;
};

export type UserPropertiesSendResponse = {
  savedProperties: UserPropertyData[],
  propertyErrors: UserPropertyError[],
};
