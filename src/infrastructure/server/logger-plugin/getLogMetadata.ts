const formatHeaders = (rawHeaders) =>
  rawHeaders.reduce((acc, cur, i) => {
    if (i % 2 === 0) {
      acc[cur] = rawHeaders[i + 1];
    }
    return acc;
  }, {});

const getLogMetadata = ({ err, req }: any) => {
  const { body, method, rawHeaders, url } = req;
  return {
    body,
    ...(err && { error: { message: err.message, stack: err.stack } }),
    headers: formatHeaders(rawHeaders),
    method,
    url,
  };
};

export default getLogMetadata;
