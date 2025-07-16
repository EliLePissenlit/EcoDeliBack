import routes from '../routes';
import webhooksErrorHandler from '../webhook-server/errorHandler';

// Function signature has to have those 4 parameters because it handle error
// eslint-disable-next-line no-unused-vars
const expressErrorHandlers = (err, req, res) => {
  if (req.url.startsWith(routes.webhooks.root)) webhooksErrorHandler({ err, req });

  return res.status(500).send({ message: 'Internal Server Error' });
};

export default expressErrorHandlers;
