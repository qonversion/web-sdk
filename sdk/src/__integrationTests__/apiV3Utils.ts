import {ApiHeader} from '../internal/network';

export const executeGrantEntitlementsRequest = async (
  apiUrl: string,
  accessToken: string,
  userId: string,
  entitlementId: string,
  expires: number,
): Promise<Response> => {
  return await fetch(encodeURI(`${apiUrl}/v3/users/${userId}/entitlements`), {
    method: 'POST',
    headers: {
      [ApiHeader.Authorization]: 'Bearer ' + accessToken,
      [ApiHeader.ContentType]: 'application/json',
      [ApiHeader.Accept]: 'application/json',
    },
    body: JSON.stringify({
      id: entitlementId,
      expires,
    }),
  });
};

export const executeRevokeEntitlementsRequest = async (
  apiUrl: string,
  accessToken: string,
  userId: string,
  entitlementId: string,
): Promise<Response> => {
  return await fetch(encodeURI(`${apiUrl}/v3/users/${userId}/entitlements/${entitlementId}`), {
    method: 'DELETE',
    headers: {
      [ApiHeader.Authorization]: 'Bearer ' + accessToken,
      [ApiHeader.ContentType]: 'application/json',
      [ApiHeader.Accept]: 'application/json',
    },
  });
};

export const executeGetScreenByContextKeyRequest = async (
  apiUrl: string,
  accessToken: string,
  contextKey: string,
): Promise<Response> => {
  return await fetch(encodeURI(`${apiUrl}/v3/contexts/${contextKey}/screens`), {
    method: 'GET',
    headers: {
      [ApiHeader.Authorization]: 'Bearer ' + accessToken,
      [ApiHeader.ContentType]: 'application/json',
      [ApiHeader.Accept]: 'application/json',
    },
  });
};

export const executeGetScreenByIdRequest = async (
  apiUrl: string,
  accessToken: string,
  screenId: string,
): Promise<Response> => {
  return await fetch(encodeURI(`${apiUrl}/v3/screens/${screenId}`), {
    method: 'GET',
    headers: {
      [ApiHeader.Authorization]: 'Bearer ' + accessToken,
      [ApiHeader.ContentType]: 'application/json',
      [ApiHeader.Accept]: 'application/json',
    },
  });
};

export const executePreloadScreensRequest = async (
  apiUrl: string,
  accessToken: string,
): Promise<Response> => {
  return await fetch(encodeURI(`${apiUrl}/v3/screens?preload=true`), {
    method: 'GET',
    headers: {
      [ApiHeader.Authorization]: 'Bearer ' + accessToken,
      [ApiHeader.ContentType]: 'application/json',
      [ApiHeader.Accept]: 'application/json',
    },
  });
};
