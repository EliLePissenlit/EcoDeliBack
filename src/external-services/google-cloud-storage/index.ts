import config from 'config';
import axios from 'axios';
import logger from '../../infrastructure/logger';
import StorageInstance from './Storage';

const {
  avatarsBucket,
  usersBucket,
  filesBucket,
}: {
  avatarsBucket: string;
  usersBucket: string;
  filesBucket: string;
} = config.get('cloudStorage');

class CloudStorageService {
  public static async downloadFile(url: string): Promise<Uint8Array> {
    logger.info('[CLOUD-STORAGE] Downloading file', { url });
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return new Uint8Array(response.data);
  }

  public static uint8ArrayToBase64(uint8Array: Uint8Array): string {
    const binaryString = uint8Array.reduce((str, byte) => str + String.fromCharCode(byte), '');
    return btoa(binaryString);
  }

  public static async downloadFileToBuffer(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  public static async uploadFile({
    content,
    destFileName,
    isPublicFile = false,
  }: {
    content: Buffer;
    destFileName: string;
    isPublicFile: boolean;
  }): Promise<void> {
    try {
      await StorageInstance.bucket(isPublicFile ? filesBucket : usersBucket)
        .file(destFileName)
        .save(content);
      logger.info('[CLOUD-STORAGE] File uploaded', { destFileName });
    } catch (error) {
      logger.error('[CLOUD-STORAGE] Error while uploading File', { destFileName, error });
    }
  }

  public static async uploadAvatar({
    content,
    destFileName,
  }: {
    content: Buffer;
    destFileName: string;
  }): Promise<void> {
    try {
      await StorageInstance.bucket(avatarsBucket).file(destFileName).save(content);
      logger.info('[CLOUD-STORAGE] Avatar uploaded', { destFileName });
    } catch (error) {
      logger.error('[CLOUD-STORAGE] Error while uploading Avatar', { destFileName, error });
    }
  }

  public static async getDownloadUrl(filePath: string): Promise<string> {
    try {
      const options: any = {
        action: 'read',
        expires: Date.now() + 1 * 60 * 60 * 1000, // 1 hour
        version: 'v4',
      };

      const [url]: any = await StorageInstance.bucket(usersBucket).file(filePath).getSignedUrl(options);

      return url;
    } catch (error) {
      logger.error('[CLOUD-STORAGE] Error while getting file', { error, filePath });
      throw error;
    }
  }

  public static async getPublicFilesDownloadUrl(filePath: string): Promise<string> {
    try {
      return StorageInstance.bucket(filesBucket).file(filePath).publicUrl();
    } catch (error) {
      logger.error('[CLOUD-STORAGE] Error while getting file', { error, filePath });
      return '';
    }
  }

  public static async getPublicDownloadUrl(filePath: string): Promise<string> {
    try {
      return StorageInstance.bucket(usersBucket).file(filePath).publicUrl();
    } catch (error) {
      logger.error('[CLOUD-STORAGE] Error while getting file', { error, filePath });
      return '';
    }
  }

  public static async getAvatarDownloadUrl(filePath: string): Promise<string> {
    try {
      return StorageInstance.bucket(avatarsBucket).file(filePath).publicUrl();
    } catch (error) {
      logger.error('[CLOUD-STORAGE] Error while getting avatar', { error, filePath });
      return '';
    }
  }

  public static async deleteFile(filePath: string): Promise<void> {
    try {
      await StorageInstance.bucket(usersBucket).file(filePath).delete();
      logger.info('[CLOUD-STORAGE] File deleted', { filePath });
    } catch (error) {
      logger.error('[CLOUD-STORAGE] Error while deleting file', { error, filePath });
    }
  }
}

export default CloudStorageService;
