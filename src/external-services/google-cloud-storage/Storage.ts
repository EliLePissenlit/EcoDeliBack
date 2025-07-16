import { Storage } from '@google-cloud/storage';
import config from 'config';

import IS_DEV_ENVIRONNEMENT from '../../shared/isDevEnvironnement';

const {
  keyFilename,
  usersBucket,
  skipStorage,
}: {
  keyFilename: string;
  usersBucket: string;
  skipStorage: boolean;
} = config.get('cloudStorage');

const storageOptions: object = IS_DEV_ENVIRONNEMENT ? { keyFilename } : {};

const StorageInstance: Storage = new Storage(storageOptions);

const configureBucketCors = async (): Promise<void> => {
  if (skipStorage) return;

  await StorageInstance.bucket(usersBucket).setCorsConfiguration([
    {
      method: ['*'],
      origin: [config.get('server.applicationUrl')],
      responseHeader: ['Access-Control-Allow-Origin'],
    },
  ]);
};

configureBucketCors();

export default StorageInstance;
