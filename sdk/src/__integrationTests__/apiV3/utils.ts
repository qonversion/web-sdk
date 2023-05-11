import {ApiHeader} from '../../internal/network';

export const executeGrantEntitlementsRequest = async (
  accessToken: string,
  userId: string,
  entitlementId: string,
  expires: number,
): Promise<Response> => {
  return await fetch(`https://api.qonversion.io/v3/users/${userId}/entitlements`, {
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
  accessToken: string,
  userId: string,
  entitlementId: string,
): Promise<Response> => {
  return await fetch(`https://api.qonversion.io/v3/users/${userId}/entitlements/${entitlementId}`, {
    method: 'DELETE',
    headers: {
      [ApiHeader.Authorization]: 'Bearer ' + accessToken,
      [ApiHeader.ContentType]: 'application/json',
      [ApiHeader.Accept]: 'application/json',
    },
  });
};
