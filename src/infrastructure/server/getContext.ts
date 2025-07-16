import { getDataFromToken } from '../../shared/authentication';
import { getContextLogger } from '../logger';

const getContext = async ({ httpCookie, ipAddress, platform, requestId, token }) => {
  const { tokenData, user: me } = await getDataFromToken(token);

  const contextLogger = getContextLogger({
    httpCookie,
    ipAddress,
    platform,
    requestId,
    user: me,
  });
  return {
    httpCookie,
    ipAddress,
    logger: contextLogger,
    me,
    platform,
    requestId,
    tokenData,
    tokenType: tokenData?.type,
  };
};

export default getContext;
